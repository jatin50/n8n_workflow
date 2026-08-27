import { NodeExecutor } from "../types";

const httpRequest: NodeExecutor = async (config) => {
  const method = (config.method as string) || "GET";
  const url = config.url as string;
  // __secretToken is injected by resolveNodeCredentials just before this
  // runs — it's never something set directly in the node's own config UI.
  const secretToken = config.__secretToken as string | undefined;

  if (!url) {
    throw new Error("HTTP Request node has no URL configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: secretToken ? { Authorization: `Bearer ${secretToken}` } : undefined,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return { status: response.status, body };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out after 10 seconds");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};

export default httpRequest;
