import { constructMessage } from "../../shared/Message";
import { KodikLinkResponse, parseKodik } from "./parser/kodik";
import { LibriaLinkResponse, parseLibria } from "./parser/libria";
import { parseSibnet, SibnetLinkResponse } from "./parser/sibnet";

export async function parsePlayer(
  url: string,
  player: "kodik" | "libria" | "sibnet",
  params: URLSearchParams,
): Promise<string | object> {
  let _URL: URL | null = null;
  if (url.startsWith("http")) {
    _URL = new URL(url);
  }

  let _tmp_parsed:
    | null
    | string
    | KodikLinkResponse
    | LibriaLinkResponse
    | SibnetLinkResponse = null;
  switch (player) {
    case "kodik":
      _tmp_parsed = await parseKodik(_URL ? _URL.href : null);
      break;
    case "libria":
      _tmp_parsed = await parseLibria(_URL ? _URL.href : null, params);
      break;
    case "sibnet":
      _tmp_parsed = await parseSibnet(_URL ? _URL.href : null);
      break;
    default:
      return `'${player}' is not supported player type`;
  }

  return _tmp_parsed;
}
