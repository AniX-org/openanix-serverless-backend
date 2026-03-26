import { constructMessage } from "../../../shared/Message";
import { randomUA } from "../UserAgent";

const _PLAYER = "sibnet";

export interface SibnetLinkResponse {
  manifest: string;
  poster: string | null;
}

export async function parseSibnet(
  url: string | null,
): Promise<string | SibnetLinkResponse> {
  if (!url) {
    return constructMessage(_PLAYER, "URL is REQUIRED", "()");
  }

  const __USER_AGENT = randomUA();
  let pageRes = await fetch(url, {
    headers: {
      "User-Agent": __USER_AGENT,
    },
  });
  if (!pageRes.ok) {
    return constructMessage(_PLAYER, "Failed to fetch player page", "()");
  }

  const pageData = await pageRes.text();
  const videoRe = /\/v\/.*?\.mp4/;
  const videoMatch = videoRe.exec(pageData);
  if (!videoMatch || videoMatch.length == 0) {
    return constructMessage(_PLAYER, "Failed to get link request parameters from player page", "()");
  }

  const posterRe = /\/upload\/cover\/.*?\.jpg/;
  const posterMatch = posterRe.exec(pageData);

  const actualVideoRes = await fetch(
    `https://video.sibnet.ru${videoMatch[0]}`,
    {
      headers: {
        "User-Agent": __USER_AGENT,
        Referer: url,
      },
      redirect: "manual",
    },
  );

  if (!actualVideoRes.headers.get("location")) {
    return constructMessage(_PLAYER, "Failed to get `location` header", "()");
  }

  const video = `https:${actualVideoRes.headers.get("location")}`;
  const poster =
    posterMatch ?
      posterMatch.length > 0 ?
        `https://st.sibnet.ru${posterMatch[0]}`
      : null
    : null;

  return <SibnetLinkResponse> {
    manifest: video,
    poster: poster,
  };
}
