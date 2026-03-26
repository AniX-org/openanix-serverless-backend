import { constructMessage } from "../../../shared/Message";
import { randomUA } from "../UserAgent";

const _PLAYER = "kodik";

interface KodikLinkType {
  src: string;
  type: string;
}

export interface KodikLinkResponse {
  default: number;
  links: {
    240: [KodikLinkType];
    360: [KodikLinkType];
    480: [KodikLinkType];
    720: [KodikLinkType];
    1080: [KodikLinkType];
  };
  manifest: string;
  poster: string;
}

async function _getBody(
  response: Response,
  expectedBody: "text" | "json",
): Promise<string | unknown | null> {
  if (response.ok)
    return expectedBody == "text" ?
        await response.text()
      : await response.json();
  return null;
}

export async function parseKodik(
  url: string | null,
): Promise<string | KodikLinkResponse> {
  if (!url) {
    return constructMessage(_PLAYER, "URL is REQUIRED", "()");
  }

  const __USER_AGENT = randomUA();
  let __tmp_resp: Response | null = null;
  let __tmp_resp_body: any = null;
  __tmp_resp = await fetch(url, {
    headers: {
      "User-Agent": __USER_AGENT,
    },
  });
  __tmp_resp_body = await _getBody(__tmp_resp, "text");
  if (!__tmp_resp_body) {
    return constructMessage(_PLAYER, "Failed to fetch player page", "()");
  }

  const urlParamsRegex = /var urlParams = .*;$/m;
  const urlParamsMatch = urlParamsRegex.exec(__tmp_resp_body);
  if (!urlParamsMatch || urlParamsMatch.length == 0) {
    return constructMessage(
      _PLAYER,
      "Failed to get link request parameters from player page",
      "()",
    );
  }
  const urlParamsStr = urlParamsMatch[0]
    .replace("var urlParams = '", "")
    .replace("';", "");

  const origDomain = url.replace("https://", "").split("/")[0];
  const urlStr = url.replace(`https://${origDomain}/`, "");
  const urlParams = JSON.parse(urlParamsStr);
  urlParams["type"] = urlStr.split("/")[0];
  urlParams["id"] = urlStr.split("/")[1];
  urlParams["hash"] = urlStr.split("/")[2];

  const formData = new FormData();
  for (const [key, value] of Object.entries(urlParams)) {
    formData.append(key, value as any);
  }

  __tmp_resp = await fetch(`https://${origDomain}/ftor`, {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": __USER_AGENT,
      referrer: "",
      referrerPolicy: "no-referrer",
    },
  });
  __tmp_resp_body = await _getBody(__tmp_resp, "json");
  if (!__tmp_resp_body) {
    return constructMessage(
      _PLAYER,
      "Returned an error or empty response from links endpoint",
      "()",
    );
  }

  _parseLinks(__tmp_resp_body);
  return <KodikLinkResponse>{
    default: __tmp_resp_body.default,
    links: __tmp_resp_body.links,
    manifest: createManifest(__tmp_resp_body),
    poster: createPoster(__tmp_resp_body),
  };
}

function _parseLinks(data: any) {
  for (const [key] of Object.entries(data.links)) {
    if (!data.links[key][0].src.includes("//")) {
      data.links[key][0].src = _decrypt(data.links[key][0].src);
    }
    if (!data.links[key][0].src.startsWith("http")) {
      data.links[key][0].src = `https:${data.links[key][0].src}`;
    }
  }
}

function _decrypt(enc: string) {
  const decryptedBase64 = enc.replace(/[a-zA-Z]/g, (e: any) => {
    return String.fromCharCode(
      (e <= "Z" ? 90 : 122) >= (e = e.charCodeAt(0) + 18) ? e : e - 26,
    );
  });
  return atob(decryptedBase64);
}

function isAnimeTvSeries(data: any) {
  return (
    data.links[data.default][0].src.includes("animetvseries") ||
    data.links[data.default][0].src.includes("tvseries")
  );
}

function createManifest(data: any) {
  if (!isAnimeTvSeries(data)) {
    return data.links[data.default][0].src.replace(
      `${data.default}.mp4:hls:`,
      "",
    );
  }

  const resolutions = {
    240: "427x240",
    360: "578x360",
    480: "854x480",
    720: "1280x720",
    1080: "1920x1080",
  };

  const stringBuilder: string[] = [];

  stringBuilder.push("#EXTM3U");
  for (const [key] of Object.entries(data.links)) {
    //@ts-ignore
    stringBuilder.push(`#EXT-X-STREAM-INF:RESOLUTION=${resolutions[key]}`);
    stringBuilder.push(data.links[key][0].src);
  }

  return stringBuilder.join("\n");
}

function createPoster(data: any) {
  return data.links[data.default][0].src.replace(
    `${data.default}.mp4:hls:manifest.m3u8`,
    "thumb001.jpg",
  );
}
