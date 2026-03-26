import { Hono } from "hono";
import { parsePlayer } from "./service";
import { constructMessage } from "../../shared/Message";
import { ErrorResponse } from "../../shared/Responses";
const allowedPlayers = ["kodik", "libria", "sibnet"];

export const playerParseRoutes = new Hono();
const _MODULE_PREFIX = "/player/";
const _MODULE_TITLE = "PLAYER-PARSER";

playerParseRoutes.get("/", async (c) => {
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace(_MODULE_PREFIX, "");

  const playerUrl = url.searchParams.get("url");
  if (!playerUrl) {
    return c.json(<ErrorResponse>{
      code: 400,
      message: constructMessage(_MODULE_TITLE, `'url' query is not provided`),
    });
  }

  const playerType = url.searchParams.get("player");
  if (!playerType) {
    return c.json(<ErrorResponse>{
      code: 400,
      message: constructMessage(
        _MODULE_TITLE,
        `'player' query is not provided`,
      ),
    });
  }
  if (!allowedPlayers.includes(playerType)) {
    return c.json(<ErrorResponse>{
      code: 400,
      message: constructMessage(
        _MODULE_TITLE,
        `player type '${playerType}' is not supported. Supported types: ${allowedPlayers.join(", ")}`,
      ),
    });
  }

  const result = await parsePlayer(
    playerUrl,
    playerType as "libria" | "kodik" | "sibnet",
    url.searchParams
  );
  if (typeof result === "string") {
    return c.json(<ErrorResponse>{
      code: 500,
      message: constructMessage(_MODULE_TITLE, result),
    });
  }

  // @ts-ignore
  return c.json({
    code: 0,
    ...result,
  });
});
