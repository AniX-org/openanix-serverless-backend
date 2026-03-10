import { randomUA } from "../UserAgent";

export async function parseKodik(url: string) {
  let userAgent = randomUA();
  let pageRes = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
  });
  if (!pageRes.ok) {
    return {
      success: false,
      message: "[KODIK] Failed to fetch player page",
    }
  }

  const pageData = await pageRes.text();
  const urlParamsRe = /var urlParams = .*;$/m;
  const urlParamsMatch = urlParamsRe.exec(pageData);
  if (!urlParamsMatch || urlParamsMatch.length == 0) {
    return {
      success: false,
      message: "[KODIK] Failed to parse parameters from player page",
    }
  }
  const urlParamsStr = urlParamsMatch[0]
    .replace("var urlParams = '", "")
    .replace("';", "");

  const origDomain = url.replace("https://", "").split("/")[0];
  const urlStr = url.replace(`https://${origDomain}/`, "");
  const type = urlStr.split("/")[0];
  const id = urlStr.split("/")[1];
  const hash = urlStr.split("/")[2];
  const urlParams = JSON.parse(urlParamsStr);
  urlParams["type"] = type;
  urlParams["id"] = id;
  urlParams["hash"] = hash;

  const formData = new FormData();
  for (const [key, value] of Object.entries(urlParams)) {
    formData.append(key, value as any);
  }
  const linksRes = await fetch(`https://${origDomain}/ftor`, {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": userAgent,
      referrer: "",
      referrerPolicy: "no-referrer",
    },
  });
  if (!linksRes.ok) {
    return {
      success: false,
      message: "[KODIK] Returned an error or empty response from links endpoint",
    }
  }

  let data = await linksRes.json();
  if (isEncrypted(data)) {
    for (const [key] of Object.entries(data.links)) {
      data.links[key][0].src = decryptSrc(data.links[key][0].src);
    }
  }
  if (!hasProto(data)) {
    for (const [key] of Object.entries(data.links)) {
      data.links[key][0].src = addProto(data.links[key][0].src);
    }
  }

  return {
    success: true,
    default: data.default,
    links: data.links,
    manifest: createManifest(data),
    poster: createPoster(data)
  };
}

function isEncrypted(data: any) {
  return !data.links[data.default][0].src.includes("//");
}

function decryptSrc(enc: string) {
  const decryptedBase64 = enc.replace(/[a-zA-Z]/g, (e: any) => {
    return String.fromCharCode(
      (e <= "Z" ? 90 : 122) >= (e = e.charCodeAt(0) + 18) ? e : e - 26,
    );
  });
  return atob(decryptedBase64);
}

function hasProto(data: any) {
  return data.links[data.default][0].src.startsWith("http");
}

function addProto(string: string) {
  return `https:${string}`;
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
        ""
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
    stringBuilder.push(`#EXT-X-STREAM-INF:RESOLUTION=${resolutions[key]}`);
    stringBuilder.push(data.links[key][0].src);
  }

  return stringBuilder.join("\n");
}

function createPoster(data: any) {
  return data.links[data.default][0].src.replace(
    `${data.default}.mp4:hls:manifest.m3u8`,
    "thumb001.jpg"
  );
}