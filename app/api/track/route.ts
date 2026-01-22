import { NextRequest, NextResponse } from 'next/server';
import { getPlaylistTracks } from '@/lib/spotify';
import { getItunesPreview } from '@/lib/itunes';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');

  if (!playlistId) {
    return NextResponse.json({ error: 'Missing playlistId parameter' }, { status: 400 });
  }

  try {
    // 1. Pobierz utwory z playlisty
    const tracks = await getPlaylistTracks(playlistId);

    if (tracks.length === 0) {
      return NextResponse.json({ error: 'Playlist not found or empty' }, { status: 404 });
    }

    // 2. Wylosuj jeden utwór
    // W prawdziwej grze warto by pamiętać historię, żeby nie losować tego samego,
    // ale na potrzeby MVP losujemy.
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    // 3. Sprawdź previewUrl
    let finalPreviewUrl = randomTrack.previewUrl;

    // Jeśli Spotify nie dało preview, szukamy w iTunes
    if (!finalPreviewUrl) {
      console.log(`Brak preview w Spotify dla "${randomTrack.title}", szukam w iTunes...`);
      const itunesUrl = await getItunesPreview(randomTrack.artist, randomTrack.title);
      if (itunesUrl) {
        finalPreviewUrl = itunesUrl;
      }
    }

    // Jeśli nadal brak, to niestety ten utwór się nie nadaje (można by losować ponownie w pętli)
    // Na razie zwracamy info, że brak preview.

    return NextResponse.json({
      ...randomTrack,
      previewUrl: finalPreviewUrl
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
