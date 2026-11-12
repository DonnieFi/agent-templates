import { parse } from "csv-parse/sync";
const CATALOG_URL = "https://files.mobilitydatabase.org/feeds_v2.csv";
function cells(value) {
  return (value ?? "").split(/[;,|\s]+/).filter(Boolean);
}
function feed(row) {
  const value = row["urls.direct_download"]?.trim();
  if (!value) return void 0;
  let url;
  try {
    url = new URL(value);
  } catch {
    return void 0;
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return void 0;
  if (url.hostname === "gtfs.halifax.ca") url.protocol = "https:";
  return { url: url.href, requiresAuth: !["", "0"].includes(row["urls.authentication_type"] ?? "") };
}
function parseCatalog(bytes) {
  const rows = parse(bytes, { columns: true, bom: true, skip_empty_lines: true, max_record_size: 1e5 });
  const result = [];
  for (const row of rows) {
    if (row.data_type !== "gtfs" || !row.id || row.status && row.status !== "active") continue;
    const schedule = feed(row);
    if (!schedule) continue;
    const system = {
      id: row.id,
      name: row.provider || row.name || row.id,
      location: [row["location.municipality"], row["location.subdivision_name"], row["location.country_code"]].filter(Boolean).join(", "),
      status: row.status || "unspecified",
      schedule,
      tripUpdates: [],
      vehicles: [],
      alerts: [],
      ...row["urls.license"] ? { licenseUrl: row["urls.license"] } : {}
    };
    for (const realtime of rows) {
      if (!["gtfs_rt", "gtfs-rt"].includes(realtime.data_type ?? "") || realtime.status && realtime.status !== "active" || !cells(realtime.static_reference).includes(row.id)) continue;
      const endpoint = feed(realtime);
      if (!endpoint) continue;
      const types = cells(realtime.entity_type);
      if (types.includes("tu")) system.tripUpdates.push(endpoint);
      if (types.includes("vp")) system.vehicles.push(endpoint);
      if (types.includes("sa")) system.alerts.push(endpoint);
    }
    result.push(system);
  }
  if (!result.length) throw new Error("The catalog contains no active schedule feeds.");
  return result;
}
function searchCatalog(systems, query, limit = 5) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) throw new Error("Enter a city or agency name.");
  return systems.filter((system) => {
    const text = (system.name + " " + system.location).toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  }).sort((a, b) => a.name.length - b.name.length || a.id.localeCompare(b.id)).slice(0, limit);
}
export {
  CATALOG_URL,
  parseCatalog,
  searchCatalog
};
