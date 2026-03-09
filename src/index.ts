import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { apiProxyRoutes } from './modules/api-proxy/routes';

const app = new Hono()
app.use('/*', cors({
  origin: (origin) => {
    return origin || "*"
  },
  allowMethods: ["GET", "HEAD", "POST", "OPTIONS"],
  allowHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Sign", "Allow", "User-Agent", "Api-Version"]
}))

app.route("/api/", apiProxyRoutes)

export default app
