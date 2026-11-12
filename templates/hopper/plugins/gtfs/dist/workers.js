import { Worker } from "node:worker_threads";
async function scheduleWork(request, signal, assertCurrent) {
  signal?.throwIfAborted();
  assertCurrent();
  const worker = new Worker(new URL("./schedule-worker.js", import.meta.url), { workerData: request, resourceLimits: { maxOldGenerationSizeMb: 384 } });
  let timer;
  let abort;
  try {
    return await new Promise((resolve, reject) => {
      abort = () => reject(signal?.reason ?? new Error("Transit operation canceled."));
      signal?.addEventListener("abort", abort, { once: true });
      timer = setTimeout(() => reject(new Error("Transit schedule operation timed out.")), 12e4);
      worker.once("message", (reply) => reply.ok ? resolve(reply.result) : reject(new Error(reply.error)));
      worker.once("error", reject);
      worker.once("exit", (code) => {
        if (code !== 0) reject(new Error("Transit worker exited: " + code));
      });
    });
  } finally {
    if (timer) clearTimeout(timer);
    if (abort) signal?.removeEventListener("abort", abort);
    await worker.terminate();
  }
}
export {
  scheduleWork
};
