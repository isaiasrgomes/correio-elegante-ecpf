/** Tipos suportados pelo gerador oficial (spotifycodes.com / scannables.scdn.co) */
const SPOTIFY_TYPES = ["track", "album", "playlist", "artist", "episode", "show"] as const;

export type SpotifyCodeOptions = {
  format?: "png" | "jpeg" | "svg";
  backgroundColor?: string;
  barColor?: "white" | "black";
  size?: number;
};

/**
 * Converte URL ou URI do Spotify para o formato spotify:type:id
 * usado pelo gerador em https://www.spotifycodes.com/
 */
export function spotifyLinkToUri(link: string): string | null {
  const trimmed = link.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("spotify:")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (!host.endsWith("spotify.com")) return null;

    const parts = url.pathname.split("/").filter(Boolean);
    // Remove locale (ex.: intl-pt, br)
    let i = 0;
    if (
      parts.length > 0 &&
      !SPOTIFY_TYPES.includes(parts[0] as (typeof SPOTIFY_TYPES)[number]) &&
      parts[0] !== "user"
    ) {
      i = 1;
    }

    // open.spotify.com/user/{user}/playlist/{id}
    if (parts[i] === "user" && parts[i + 2] === "playlist" && parts[i + 1] && parts[i + 3]) {
      return `spotify:user:${parts[i + 1]}:playlist:${parts[i + 3].split("?")[0]}`;
    }

    const type = parts[i];
    const id = parts[i + 1]?.split("?")[0];

    if (!type || !id || !SPOTIFY_TYPES.includes(type as (typeof SPOTIFY_TYPES)[number])) {
      return null;
    }

    return `spotify:${type}:${id}`;
  } catch {
    return null;
  }
}

/**
 * Gera URL da imagem do Spotify Code (mesmo serviço do spotifycodes.com).
 * Formato: https://scannables.scdn.co/uri/plain/{format}/{bg}/{bar}/{size}/{uri}
 */
export function getSpotifyCodeImageUrl(
  link: string,
  options: SpotifyCodeOptions = {}
): string | null {
  const uri = spotifyLinkToUri(link);
  if (!uri) return null;

  const {
    format = "png",
    backgroundColor = "ffffff",
    barColor = "black",
    size = 640,
  } = options;

  const bg = backgroundColor.replace("#", "");

  return `https://scannables.scdn.co/uri/plain/${format}/${bg}/${barColor}/${size}/${uri}`;
}
