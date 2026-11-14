const MAX_JSON_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 1e4;
function message(error) {
  if (error instanceof Error && error.name === "AbortError") return "Flyer search timed out.";
  return "Flyer search is unavailable right now.";
}
const fetchJson = async (url, { signal, maxBytes = MAX_JSON_BYTES }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort, { once: true });
  try {
    if (signal?.aborted) throw new Error("Flyer search was cancelled.");
    const response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "openclaw-meals/0.1.0" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Flyer service returned HTTP ${response.status}.`);
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) {
      throw new Error("Flyer response was too large.");
    }
    const body = response.body;
    if (!body) throw new Error("Flyer service returned no body.");
    const reader = body.getReader();
    const chunks = [];
    let total = 0;
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("Flyer response was too large.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    throw new Error(message(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", forwardAbort);
  }
};
export {
  fetchJson
};
