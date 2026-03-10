import { randomUA } from "../UserAgent";

export async function parseSibnet(url: string) {
  let userAgent = randomUA();
  let pageRes = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
  });
  if (!pageRes.ok) {
    return {
      success: false,
      message: "[SIBNET] Failed to fetch player page",
    };
  }

  const pageData = await pageRes.text();
  const videoRe = /\/v\/.*?\.mp4/;
  const videoMatch = videoRe.exec(pageData);
  if (!videoMatch || videoMatch.length == 0) {
    return {
      success: false,
      message: "[SIBNET] Failed to parse player page",
    };
  }

  const posterRe = /\/upload\/cover\/.*?\.jpg/;
  const posterMatch = posterRe.exec(pageData);

  const actualVideoRes = await fetch(
    `https://video.sibnet.ru${videoMatch[0]}`,
    {
      headers: {
        "User-Agent": userAgent,
        Referer: url,
      },
      redirect: "manual",
    },
  );

  if (!actualVideoRes.headers.get("location")) {
    return {
      success: false,
      message: "[SIBNET] no `location` header present in response",
    };
  }

  const video = `https:${actualVideoRes.headers.get("location")}`;
  const poster =
    posterMatch ?
      posterMatch.length > 0 ?
        `https://st.sibnet.ru${posterMatch[0]}`
      : null
    : null;

  return {
    success: true,
    manifest: video,
    poster: poster,
  };
}
