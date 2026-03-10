import { parseKodik } from "./parser/kodik";
import { parseLibria } from "./parser/libria";
import { parseSibnet } from "./parser/sibnet";

export async function parsePlayer(
  url: string,
  player: "kodik" | "libria" | "sibnet" | "mailru",
) {
  const u = new URL(url);
  if (player === "kodik") return await parseKodik(u.href);
  if (player === "libria") return await parseLibria(u.href);
  if (player === "sibnet") return await parseSibnet(u.href);
  return {
    success: false,
    message: `[PLAYER-PARSER] player '${player}' is not supported`,
  };
}
