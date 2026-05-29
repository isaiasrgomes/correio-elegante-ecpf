import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSpotifyCodeImageUrl, spotifyLinkToUri } from "@/lib/spotify-code";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const link = new URL(request.url).searchParams.get("link")?.trim();
  if (!link) {
    return NextResponse.json({ error: "Link não informado." }, { status: 400 });
  }

  const uri = spotifyLinkToUri(link);
  if (!uri) {
    return NextResponse.json(
      { error: "Link do Spotify inválido. Use um link de música, álbum ou playlist." },
      { status: 400 }
    );
  }

  const codeUrl = getSpotifyCodeImageUrl(link);
  if (!codeUrl) {
    return NextResponse.json({ error: "Não foi possível gerar o código." }, { status: 400 });
  }

  const imageRes = await fetch(codeUrl);
  if (!imageRes.ok) {
    return NextResponse.json(
      { error: "Não foi possível obter o Spotify Code." },
      { status: 502 }
    );
  }

  const buffer = await imageRes.arrayBuffer();
  const safeId = uri.replace(/[^a-z0-9]/gi, "-");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": imageRes.headers.get("content-type") ?? "image/png",
      "Content-Disposition": `attachment; filename="spotify-code-${safeId}.png"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
