import { Hono } from "hono";
import { proxyRequest } from "./service";
import { hookList, runHooks } from "./hooks/index.js";
import { ErrorResponse } from "../../shared/Responses";
import { constructMessage } from "../../shared/Message";

export const apiProxyRoutes = new Hono();
const _MODULE_PREFIX = "/api/";
const _MODULE_TITLE = "API-PROXY";

apiProxyRoutes.get("/*", async (c) => {
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace(_MODULE_PREFIX, "");
  const result = await proxyRequest(url, "GET");

  if (typeof result === "string") {
    return c.json(
      <ErrorResponse>{
        code: 500,
        message: constructMessage(_MODULE_TITLE, result),
        description: null,
      },
      200,
    );
  }

  if (
    result.headers.get("content-length") &&
    Number(result.headers.get("content-length")) == 0
  ) {
    return c.json(
      <ErrorResponse>{
        code: 404,
        message: constructMessage(
          _MODULE_TITLE,
          "path not found or invalid parameters provided",
        ),
        description: null,
      },
      200,
    );
  }

  const data = await result.json();
  await runHooks(hookList, url, data, "GET");
  return c.json(data);
});

apiProxyRoutes.post("/*", async (c) => {
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace(_MODULE_PREFIX, "");
  const result = await proxyRequest(
    url,
    "POST",
    c.req.header(),
    c.req.raw.body,
  );

  if (typeof result === "string") {
    return c.json(
      <ErrorResponse>{
        code: 500,
        message: constructMessage(_MODULE_TITLE, result),
        description: null,
      },
      200,
    );
  }

  if (
    result.headers.get("content-length") &&
    Number(result.headers.get("content-length")) == 0
  ) {
    return c.json(
      <ErrorResponse>{
        code: 404,
        message: constructMessage(
          _MODULE_TITLE,
          "path not found or invalid parameters provided",
        ),
        description: null,
      },
      200,
    );
  }

  const data = await result.json();
  await runHooks(hookList, url, data, "POST");
  return c.json(data);
});

apiProxyRoutes.all("/*", async (c) => {
  return c.json(
    <ErrorResponse>{
      code: 500,
      message: constructMessage(
        _MODULE_TITLE,
        `Method '${c.req.method}' is not supported`,
      ),
      description: null,
    },
    200,
  );
});
