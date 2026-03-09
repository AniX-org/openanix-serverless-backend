import { Hono } from "hono"
import { proxyRequest } from "./service"

export const apiProxyRoutes = new Hono()

apiProxyRoutes.get('/', (c) => {
  return c.text('Hello API PROXY!')
})

apiProxyRoutes.get("/*", async (c) => {
  const url = new URL(c.req.url)
  url.pathname = url.pathname.replace("/api/", "")
  const result = await proxyRequest(url, "GET")
  return c.json(await result.json())
})

apiProxyRoutes.post("/*", async (c) => {
  const url = new URL(c.req.url)
  url.pathname = url.pathname.replace("/api/", "")
  const result = await proxyRequest(url, "POST", c.req.header(), c.req.raw.body)
  return c.json(await result.json())
})