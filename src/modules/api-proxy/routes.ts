import { Hono } from "hono"
import { proxyRequest } from "./service"
import { hookList, runHooks } from "./hooks/index.js";

export const apiProxyRoutes = new Hono()

apiProxyRoutes.get("/*", async (c) => {
  const url = new URL(c.req.url)
  url.pathname = url.pathname.replace("/api/", "")
  const result = await proxyRequest(url, "GET")
  const data = await result.json()
  await runHooks(hookList, url, data, "GET");
  return c.json(data)
})

apiProxyRoutes.post("/*", async (c) => {
  const url = new URL(c.req.url)
  url.pathname = url.pathname.replace("/api/", "")
  const result = await proxyRequest(url, "POST", c.req.header(), c.req.raw.body)
  const data = await result.json()
  await runHooks(hookList, url, data, "POST");
  return c.json(data)
})