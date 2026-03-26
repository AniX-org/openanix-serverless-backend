import { constructMessage } from "../../../shared/Message";

const ANILIBRIA_API_ENDPOINT = "https://anilibria.top";

const _PLAYER = "libria";

export interface LibriaLinkResponse {
  default: number;
  episode: any;
  manifest: string;
  poster: string;
}

const _RESOLUTIONS = {
  hls_360: "578x360",
  hls_480: "854x480",
  hls_720: "1280x720",
  hls_1080: "1920x1080",
};

export async function parseLibria(
  url: string | null,
  params: URLSearchParams,
): Promise<LibriaLinkResponse | string> {
  let decodedUrl: URL | null = null;
  if (url) decodedUrl = new URL(url);

  const releaseId =
    decodedUrl?.searchParams.get("id") || params.get("id") || null;
  const releaseEp =
    decodedUrl?.searchParams.get("ep") || params.get("ep") || null;

  if (!releaseId || !releaseEp) {
    return constructMessage(
      _PLAYER,
      "No release id or episode number was provided",
      "()",
    );
  }

  const __response = await fetch(
    `${ANILIBRIA_API_ENDPOINT}/api/v1/anime/releases/${releaseId}`,
  );

  if (!__response.ok) {
    if (__response.status == 404) {
      return constructMessage(
        _PLAYER,
        "Release not found, maybe it was deleted",
        "()",
      );
    }
    return constructMessage(_PLAYER, "Failed to get API response", "()");
  }

  const data: any = await __response.json();
  if (!data) {
    return constructMessage(_PLAYER, "No data returned from API", "()");
  }

  const episode = data.episodes.find(
    (item: any) => item.ordinal == Number(releaseEp),
  );

  for (const [key] of Object.entries(_RESOLUTIONS)) {
    if (!episode[key]) continue;
    const url = new URL(episode[key]);
    url.search = "";
    episode[key] = url.toString();
  }

  return <LibriaLinkResponse>{
    default: 480,
    episode: episode,
    manifest: createManifest(episode),
    poster: getPoster(data, episode),
  };
}

function createManifest(episode: any) {
  const stringBuilder: string[] = [];

  stringBuilder.push("#EXTM3U");
  for (const [key, value] of Object.entries(_RESOLUTIONS)) {
    if (!episode[key]) continue;
    stringBuilder.push(`#EXT-X-STREAM-INF:RESOLUTION=${value}`);
    stringBuilder.push(episode[key]);
  }

  return stringBuilder.join("\n");
}

function getPoster(data: any, episode: any) {
  if (episode.preview && episode.preview.preview)
    return `${ANILIBRIA_API_ENDPOINT}${episode.preview.preview}`;
  return `${ANILIBRIA_API_ENDPOINT}${data.posters.preview}`;
}
