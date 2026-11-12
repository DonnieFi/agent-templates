import GtfsRealtimeBindings from "gtfs-realtime-bindings";
const MAX_FEED_AGE_SECONDS = 120;
function decodeFeed(bytes) {
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes);
  if (feed.header.incrementality === 1) throw new Error("Differential realtime feeds are not supported; a full dataset is required.");
  return feed;
}
function ageSeconds(timestamp, nowMs) {
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(nowMs / 1e3 - value);
}
function freshness(feed, nowMs) {
  const age = ageSeconds(feed.header.timestamp, nowMs);
  return { ageSeconds: age, fresh: age !== null && age >= -30 && age <= MAX_FEED_AGE_SECONDS };
}
function departurePredictions(feeds, stopId, nowMs) {
  const observations = [];
  const starts = /* @__PURE__ */ new Map();
  for (const feed of feeds) {
    if (!freshness(feed, nowMs).fresh) continue;
    for (const entity of feed.entity) {
      const update = entity.tripUpdate;
      if (entity.isDeleted || !update?.trip?.tripId) continue;
      const timestamp = Number(update.timestamp) || Number(feed.header.timestamp);
      const age = ageSeconds(timestamp, nowMs);
      if (age === null || age > MAX_FEED_AGE_SECONDS || age < -30) continue;
      const baseKey = JSON.stringify([update.trip.tripId, update.trip.startDate || ""]);
      const startTime = update.trip.startTime || "";
      let known = starts.get(baseKey);
      if (!known) {
        known = /* @__PURE__ */ new Set();
        starts.set(baseKey, known);
      }
      if (startTime) known.add(startTime);
      observations.push({ update, timestamp, baseKey, startTime });
    }
  }
  const latest = /* @__PURE__ */ new Map();
  for (const observation of observations) {
    const { update, timestamp, baseKey } = observation;
    const known = starts.get(baseKey);
    if (!observation.startTime && known.size > 1) continue;
    const startTime = observation.startTime || known.values().next().value || "";
    const key = JSON.stringify([baseKey, startTime]);
    const previous = latest.get(key);
    if (!previous || timestamp > previous.timestamp || timestamp === previous.timestamp && update.trip?.scheduleRelationship === 3) {
      latest.set(key, { update, timestamp });
    }
  }
  const predictions = [];
  for (const [tripKey, { update }] of latest) {
    const trip = update.trip;
    if (!trip?.tripId || trip.scheduleRelationship === 3) continue;
    for (const stop of update.stopTimeUpdate ?? []) {
      if (stop.stopId !== stopId || stop.scheduleRelationship === 1 || stop.scheduleRelationship === 2) continue;
      const departure = Number(stop.departure?.time);
      const seconds = departure > 0 ? departure : Number(stop.arrival?.time);
      if (!Number.isFinite(seconds) || seconds <= 0 || seconds * 1e3 < nowMs) continue;
      predictions.push({
        tripId: trip.tripId,
        tripKey,
        routeId: trip.routeId || null,
        stopId,
        departureMs: seconds * 1e3,
        stopSequence: Object.hasOwn(stop, "stopSequence") ? stop.stopSequence ?? null : null
      });
    }
  }
  return predictions.sort((a, b) => a.departureMs - b.departureMs);
}
function vehiclePositions(feed, nowMs, routeId) {
  if (!freshness(feed, nowMs).fresh) return [];
  return feed.entity.flatMap((entity) => {
    const vehicle = entity.vehicle;
    if (entity.isDeleted || !vehicle?.position || routeId && vehicle.trip?.routeId !== routeId) return [];
    const age = ageSeconds(vehicle.timestamp, nowMs);
    if (age !== null && (age > MAX_FEED_AGE_SECONDS || age < -30)) return [];
    const p = vehicle.position;
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180) return [];
    return [{
      vehicleId: vehicle.vehicle?.id || entity.id,
      label: vehicle.vehicle?.label || null,
      routeId: vehicle.trip?.routeId || null,
      tripId: vehicle.trip?.tripId || null,
      latitude: p.latitude,
      longitude: p.longitude,
      bearing: Object.hasOwn(p, "bearing") ? p.bearing ?? null : null,
      speedKmh: Object.hasOwn(p, "speed") && p.speed != null ? p.speed * 3.6 : null,
      ageSeconds: age
    }];
  });
}
export {
  MAX_FEED_AGE_SECONDS,
  ageSeconds,
  decodeFeed,
  departurePredictions,
  freshness,
  vehiclePositions
};
