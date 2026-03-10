const ANILIBRIA_API_ENDPOINT = "https://anilibria.top";

export async function parseLibria(url: string) {
  const decodedUrl = new URL(url);

  const releaseId = decodedUrl.searchParams.get("id") || null;
  const releaseEp = decodedUrl.searchParams.get("ep") || null;

  if (!releaseId || !releaseEp) {
    return {
      success: false,
      message: "[LIBRIA] No release id or episode number was provided",
    };
  }

  let apiRes = await fetch(
    `${ANILIBRIA_API_ENDPOINT}/api/v1/anime/releases/${releaseId}`,
  );
  if (!apiRes.ok) {
    if (apiRes.status == 404) {
      return {
        success: false,
        message: "[LIBRIA] Release not found",
      };
    }

    return {
      success: false,
      message: "[LIBRIA] Failed to get API response",
    };
  }

  const data = await apiRes.json();
  if (!data) {
    return {
      success: false,
      message: "[LIBRIA] No data returned",
    };
  }

  return {
    success: true,
    posters: data.poster,
    episodes: data.episodes,
    manifest: createManifest(data),
    poster: getPoster(data, Number(releaseEp)),
  };
}

function createManifest(data: any) {
  const episode = data.episodes[0];
  const resolutions = {
    hls_480: "854x480",
    hls_720: "1280x720",
    hls_1080: "1920x1080",
  };

  const stringBuilder: string[] = [];

  stringBuilder.push("#EXTM3U");
  for (const [key, value] of Object.entries(resolutions)) {
    if (!episode[key]) continue;
    stringBuilder.push(`#EXT-X-STREAM-INF:RESOLUTION=${value}`);
    const url = new URL(episode[key]);
    url.search = "";
    stringBuilder.push(url.toString());
  }

  return stringBuilder.join("\n");
}

function getPoster(data: any, episodeId: number) {
  const episode = data.episodes.find((item: any) => item.ordinal == episodeId);

  if (episode.preview && episode.preview.preview)
    return `${ANILIBRIA_API_ENDPOINT}${episode.preview.preview}`;
  return `${ANILIBRIA_API_ENDPOINT}${data.posters.preview}`;
}
