const ANIXART_API_ENDPOINT = "https://api-s.anixsekai.com";

export const ANIXART_UA =
  "AnixartApp/9.0 BETA 9-25110702 (Android 9; SDK 28; arm64-v8a; samsung SM-G975N; en)";

export async function proxyRequest(
  url: URL,
  method: "GET" | "POST" = "GET",
  headers: Record<string, string> = {},
  body?: any,
): Promise<Response> {
  const currentBaseURL = new URL(ANIXART_API_ENDPOINT);
  url.protocol = currentBaseURL.protocol;
  url.host = currentBaseURL.host;
  url.port = currentBaseURL.port;

  let requestHeaders = new Headers();
  requestHeaders.set("User-Agent", ANIXART_UA);
  requestHeaders.set("Connection", "keep-alive");
  headers["content-type"] ? requestHeaders.set("content-type", headers["content-type"]) : requestHeaders.set("content-type", "application/json; charset=utf-8");
  headers["content-length"] ? requestHeaders.set("content-length", headers["content-length"]) : null;
  headers["api-version"] ? requestHeaders.set("api-version", headers["api-version"]) : null;
  headers["sign"] ? requestHeaders.set("sign", headers["sign"]) : null;

  if (method === "POST") {
    return await fetch(url, {
          method: "POST",
          headers: requestHeaders,
          body: body,
          duplex: "half",
        });
  }

  if (method === "GET") {
    return await fetch(url, {
          method: "GET",
          headers: requestHeaders,
        });
  }

  throw new Error(`Method '${method}' is not implemented.`);
}
