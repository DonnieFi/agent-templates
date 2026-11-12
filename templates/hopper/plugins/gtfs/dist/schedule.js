import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import yauzl from "yauzl";
import { scheduleWork } from "./workers.js";
async function checkScheduleArchive(bytes) {
  await new Promise((resolve, reject) => {
    yauzl.fromBuffer(Buffer.from(bytes), { lazyEntries: true }, (error, zip) => {
      if (error || !zip) {
        reject(error ?? new Error("Invalid schedule archive."));
        return;
      }
      let expanded = 0;
      let entries = 0;
      zip.on("error", reject);
      zip.on("end", resolve);
      zip.on("entry", (entry) => {
        expanded += entry.uncompressedSize;
        entries++;
        const parts = entry.fileName.replaceAll("\\", "/").split("/");
        const mode = entry.externalFileAttributes >>> 16 & 61440;
        if (entries > 256 || expanded > 512 * 1024 * 1024 || entry.fileName.startsWith("/") || parts.includes("..") || mode === 40960 || entry.generalPurposeBitFlag & 1) {
          zip.close();
          reject(new Error("Unsupported or oversized schedule archive."));
          return;
        }
        zip.readEntry();
      });
      zip.readEntry();
    });
  });
}
class ScheduleCache {
  constructor(root, fetch) {
    this.root = root;
    this.fetch = fetch;
  }
  root;
  fetch;
  async ensure(system, scope) {
    if (system.schedule.requiresAuth) throw new Error("This schedule needs credentials; credentialed feeds are not supported in this first version.");
    const key = createHash("sha256").update(system.schedule.url).digest("hex");
    const directory = join(this.root, "schedules");
    const database = join(directory, key + ".db");
    const existing = await stat(database).catch((error) => {
      if (error.code === "ENOENT") return void 0;
      throw error;
    });
    if (!existing || Date.now() - existing.mtimeMs > 24 * 60 * 6e4) {
      const bytes = await this.fetch(system.schedule.url, 64 * 1024 * 1024, scope);
      await checkScheduleArchive(bytes);
      scope.assertCurrent();
      await mkdir(directory, { recursive: true });
      const temporary = await mkdtemp(join(directory, "import-"));
      try {
        scope.assertCurrent();
        const archive = join(temporary, "feed.zip");
        const pending = join(temporary, "feed.db");
        await writeFile(archive, bytes);
        await scheduleWork({ op: "import", archive, database: pending }, scope.signal, scope.assertCurrent);
        scope.assertCurrent();
        await rename(pending, database);
      } finally {
        await rm(temporary, { recursive: true, force: true });
      }
    }
    const info = await scheduleWork({ op: "info", database }, scope.signal, scope.assertCurrent);
    scope.assertCurrent();
    return { database, timezones: info.timezones ?? [] };
  }
}
export {
  ScheduleCache,
  checkScheduleArchive
};
