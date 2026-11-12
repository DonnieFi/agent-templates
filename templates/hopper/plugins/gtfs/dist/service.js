import { CATALOG_URL, searchCatalog } from "./catalog.js";
import { ScheduleCache } from "./schedule.js";
import { scheduleWork } from "./workers.js";
import { decodeFeed, departurePredictions, freshness, vehiclePositions } from "./realtime.js";
const HALIFAX = {
  id: "mdb-734",
  name: "Halifax Transit",
  location: "Halifax, Nova Scotia, CA",
  status: "active",
  schedule: { url: "https://gtfs.halifax.ca/static/google_transit.zip", requiresAuth: false },
  tripUpdates: [{ url: "https://gtfs.halifax.ca/realtime/TripUpdate/TripUpdates.pb", requiresAuth: false }],
  vehicles: [{ url: "https://gtfs.halifax.ca/realtime/Vehicle/VehiclePositions.pb", requiresAuth: false }],
  alerts: [],
  licenseUrl: "https://www.halifax.ca/opendata/OD_TermsOfUse.php"
};
class TransitService {
  constructor(fetch, store, root) {
    this.fetch = fetch;
    this.store = store;
    this.schedules = new ScheduleCache(root, fetch);
  }
  fetch;
  store;
  catalog;
  schedules;
  key(scope) {
    return "agent:" + scope.agentId;
  }
  async systems(scope) {
    if (this.catalog && Date.now() - this.catalog.at < 60 * 6e4) return this.catalog.systems;
    const bytes = await this.fetch(CATALOG_URL, 12 * 1024 * 1024, scope);
    const parsed = await scheduleWork({ op: "catalog", bytes }, scope.signal, scope.assertCurrent);
    scope.assertCurrent();
    if (!parsed.systems) throw new Error("Catalog parser returned no systems.");
    this.catalog = { at: Date.now(), systems: parsed.systems };
    return parsed.systems;
  }
  async search(query, limit, scope) {
    const systems = await this.systems(scope);
    scope.assertCurrent();
    return {
      source: CATALOG_URL,
      observedAt: new Date(this.catalog.at).toISOString(),
      systems: searchCatalog(systems, query, limit),
      note: "Catalog coverage is not verified realtime availability. Credentialed feeds need separate support."
    };
  }
  async use(id, scope) {
    const candidate = id === HALIFAX.id ? HALIFAX : (await this.systems(scope)).find((s) => s.id === id);
    if (!candidate) throw new Error("Unknown catalog ID. Search transit systems first.");
    const schedule = await this.schedules.ensure(candidate, scope);
    const realtime = candidate.tripUpdates.length ? await this.feeds(candidate.tripUpdates, scope) : [];
    if (realtime.length && !realtime.some((f) => f.health.fresh)) throw new Error("No fresh trip updates; existing transit selection was kept.");
    scope.assertCurrent();
    await this.store.register(this.key(scope), candidate, { assertCurrent: scope.assertCurrent });
    return {
      configured: true,
      system: candidate,
      timezones: schedule.timezones,
      capabilities: { stopLookup: true, realtimeDepartures: realtime.some((f) => f.health.fresh), vehicles: candidate.vehicles.some((f) => !f.requiresAuth) },
      note: "Selection applies to this agent. No background tracking was enabled."
    };
  }
  async current(scope) {
    const system = await this.store.lookup(this.key(scope));
    scope.assertCurrent();
    return { configured: Boolean(system), system: system ?? null, builtInPreset: { id: HALIFAX.id, name: HALIFAX.name } };
  }
  async selected(scope) {
    const value = await this.store.lookup(this.key(scope));
    scope.assertCurrent();
    if (!value) throw new Error("No transit system selected. Search and confirm a system with use_transit_system.");
    return value;
  }
  async feeds(endpoints, scope) {
    if (endpoints.length > 8) throw new Error("This system has more realtime feeds than this version supports.");
    const readable = endpoints.filter((e) => !e.requiresAuth);
    if (!readable.length) throw new Error("No unauthenticated realtime endpoint is available.");
    const settled = await Promise.allSettled(readable.map(async (endpoint) => {
      const bytes = await this.fetch(endpoint.url, 16 * 1024 * 1024, scope);
      return { feed: decodeFeed(bytes), url: endpoint.url };
    }));
    scope.assertCurrent();
    const failed = settled.find((result) => result.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
    const observedAt = Date.now();
    return settled.flatMap((result) => result.status === "fulfilled" ? [{ feed: result.value.feed, health: { url: result.value.url, ...freshness(result.value.feed, observedAt) } }] : []);
  }
  async stops(query, limit, scope) {
    const system = await this.selected(scope);
    const schedule = await this.schedules.ensure(system, scope);
    const result = await scheduleWork({ op: "stops", database: schedule.database, query, limit }, scope.signal, scope.assertCurrent);
    scope.assertCurrent();
    return { systemId: system.id, ...result };
  }
  async departures(stopId, limit, routeId, scope) {
    const system = await this.selected(scope);
    if (!system.tripUpdates.length) return { systemId: system.id, status: "realtime-unavailable", departures: [], note: "No trip-update feed. This version does not compute scheduled departures." };
    const schedule = await this.schedules.ensure(system, scope);
    const feeds = await this.feeds(system.tripUpdates, scope);
    const now = Date.now();
    const candidates = departurePredictions(feeds.map((f) => f.feed), stopId, now);
    const data = await scheduleWork({
      op: "trip-data",
      database: schedule.database,
      stopId,
      tripIds: [...new Set(candidates.map((p) => p.tripId))].slice(0, 1e3)
    }, scope.signal, scope.assertCurrent);
    const trips = new Map(data.trips?.map((t) => [t.trip_id, t]));
    const routes = new Map(data.routes?.map((r) => [r.route_id, r]));
    const boarding = data.boarding ?? [];
    const unique = /* @__PURE__ */ new Map();
    for (const p of candidates) {
      const trip = trips.get(p.tripId);
      const visits = boarding.filter((b) => b.trip_id === p.tripId && (p.stopSequence === null || b.stop_sequence === p.stopSequence));
      if (visits.length !== 1) continue;
      const board = visits[0];
      if (!trip || board.pickup_type === 1 || routeId && trip.route_id !== routeId) continue;
      const route = routes.get(trip.route_id);
      unique.set(JSON.stringify([p.tripKey, board.stop_sequence]), {
        tripId: p.tripId,
        routeId: trip.route_id,
        routeName: route?.route_short_name || route?.route_long_name || trip.route_id,
        headsign: trip.trip_headsign,
        departureTime: new Date(p.departureMs).toISOString(),
        minutesAway: Math.max(0, (p.departureMs - now) / 6e4),
        stopId,
        stopSequence: board.stop_sequence
      });
    }
    scope.assertCurrent();
    return {
      systemId: system.id,
      status: feeds.some((f) => f.health.fresh) ? "realtime" : "stale-or-undated",
      observedAt: new Date(now).toISOString(),
      timezones: schedule.timezones,
      feeds: feeds.map((f) => f.health),
      departures: [...unique.values()].sort((a, b) => a.departureTime.localeCompare(b.departureTime)).slice(0, limit),
      note: "Predictions, not guarantees. Only trips matched to the static boarding stop are shown. No walking-time or transfer calculation is performed."
    };
  }
  async vehicles(routeId, limit, scope) {
    const system = await this.selected(scope);
    if (!system.vehicles.length) return { systemId: system.id, status: "unavailable", vehicles: [] };
    const feeds = await this.feeds(system.vehicles, scope);
    const now = Date.now();
    scope.assertCurrent();
    return {
      systemId: system.id,
      observedAt: new Date(now).toISOString(),
      feeds: feeds.map((f) => f.health),
      vehicles: feeds.flatMap((f) => vehiclePositions(f.feed, now, routeId)).slice(0, limit),
      note: "Vehicle location is not evidence of a rider boarding or arriving."
    };
  }
}
export {
  HALIFAX,
  TransitService
};
