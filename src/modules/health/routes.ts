import { Hono } from "hono";
import { checkApiAvailability, checkParsersAvailability } from "./service";
import { ErrorResponse } from "../../shared/Responses";
import { constructMessage } from "../../shared/Message";

export const healthRoutes = new Hono();
const _MODULE_PREFIX = "/health/";
const _MODULE_TITLE = "HEALTH-CHECK";

healthRoutes.get("/", async (c) => {
  const apiHealth = await checkApiAvailability();
  const parserHealth = await checkParsersAvailability();

  return c.json({
    "api-proxy": apiHealth,
    "player-parser": parserHealth,
  });
});

healthRoutes.get("/api-proxy", async (c) => {
  const apiHealth = await checkApiAvailability();

  return c.json({
    "api-proxy": apiHealth,
  });
});

healthRoutes.get("/player-parser", async (c) => {
  const parserHealth = await checkParsersAvailability();

  return c.json({
    "player-parser": parserHealth,
  });
});