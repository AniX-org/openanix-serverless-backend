import { Hono } from "hono"
import { parsePlayer } from "./service"
const allowedPlayers = ["kodik", "libria", "sibnet", "mailru"]

export const playerParseRoutes = new Hono()

playerParseRoutes.get("/", async (c) => {
  const url = new URL(c.req.url)
  url.pathname = url.pathname.replace("/player/", "")

  const playerUrl = url.searchParams.get("url")
  if (!playerUrl) {
    return c.json({"code": 400, "message": "no 'url' query provided"}, 400)
  }

  const playerType = url.searchParams.get("player")
  if (!playerType || !allowedPlayers.includes(playerType)) {
    return c.json({"code": 400, "message": `no or invalid 'player' query provided. should be one of: ${allowedPlayers.join(', ')}`}, 400)
  }

  const result = await parsePlayer(playerUrl, playerType as "libria" | "kodik" | "sibnet" | "mailru")
  if (!result || !result.success) {
    return c.json({"code": 500, "message": result?.message || "failed to parse player"}, 500)
  }
  return c.json(result)
})
