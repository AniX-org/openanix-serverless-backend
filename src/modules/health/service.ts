import { error } from "node:console";
import { ANIXART_API_ENDPOINT, proxyRequest } from "../api-proxy/service";
import { parsePlayer } from "../player-parser/service";

export async function checkApiAvailability() {
  const start = performance.now();
  const response = await proxyRequest(
    new URL(`${ANIXART_API_ENDPOINT}/profile/1`),
    "GET",
  );
  const end = performance.now();
  const execTime = end - start;
  return {
    isApiAvailable: typeof response !== "string" && response.ok,
    execTimeMs: Number(execTime.toFixed(0)),
  };
}

async function checkParser(
  type: "kodik" | "libria" | "sibnet",
): Promise<[string | object, number]> {
  const start = performance.now();
  let response: any = null;

  switch (type) {
    case "kodik":
      response = await parsePlayer(
        "https://kodikplayer.com/seria/1555937/0b172d5ff1f928607d292bfaa2007a49/720p",
        "kodik",
        new URLSearchParams(),
      );
      break;
    case "libria":
      const params = new URLSearchParams();
      params.set("id", "10095");
      params.set("ep", "1");
      response = await parsePlayer("null", "libria", params);
      break;
    case "sibnet":
      response = await parsePlayer(
        "https://video.sibnet.ru/shell.php?videoid=3463683",
        "sibnet",
        new URLSearchParams(),
      );
      break;
    default:
      break;
  }

  const end = performance.now();
  const execTime = end - start;
  return [response, Number(execTime.toFixed(0))];
}

export async function checkParsersAvailability() {
  const [kodikRes, kodikExecTime] = await checkParser("kodik");
  const [libriaRes, libriaExecTime] = await checkParser("libria");
  const [sibnetRes, sibnetExecTime] = await checkParser("sibnet");

  return {
    kodik: {
      status: !!(typeof kodikRes == "object"),
      error: typeof kodikRes === "string" ? kodikRes : null,
      execTimeMs: kodikExecTime,
    },
    libria: {
      status: !!(typeof libriaRes == "object"),
      error: typeof libriaRes === "string" ? libriaRes : null,
      execTimeMs: libriaExecTime,
    },
    sibnet: {
      status: !!(typeof sibnetRes == "object"),
      error: typeof sibnetRes === "string" ? sibnetRes : null,
      execTimeMs: sibnetExecTime,
    },
  };
}
