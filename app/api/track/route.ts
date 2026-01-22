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
      // Jeśli getPlaylistTracks zwróci pustą tablicę, to znaczy że albo playlista jest pusta,
      // albo wystąpił błąd 404/403 w lib/spotify.ts (który łapie błędy i zwraca []).
      // Zwracamy 404, aby frontend wiedział co robić.
      return NextResponse.json({
        error: 'Nie znaleziono playlisty lub jest pusta. Sprawdź ID lub spróbuj innej kategorii.'
      }, { status: 404 });
    }

    // 2. Wylosuj jeden utwór
    // W prawdziwej grze warto by pamiętać historię, żeby nie losować tego samego,
    // ale na potrzeby MVP losujemy.
    let randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    let finalPreviewUrl = randomTrack.previewUrl;
    let attempts = 0;

    // Próba znalezienia utworu z preview (max 3 próby losowania)
    while (!finalPreviewUrl && attempts < 3) {
        if (!finalPreviewUrl) {
            console.log(`Brak preview w Spotify dla "${randomTrack.title}", szukam w iTunes...`);
            const itunesUrl = await getItunesPreview(randomTrack.artist, randomTrack.title);
            if (itunesUrl) {
                finalPreviewUrl = itunesUrl;
            } else {
                 // Jeśli nie ma w iTunes, spróbuj wylosować inny utwór z listy
                 console.log(`Brak w iTunes też. Losuję inny...`);
                 randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
                 finalPreviewUrl = randomTrack.previewUrl; // Resetujemy do tego co ma Spotify
            }
        }
        attempts++;
    }

    // Jeśli po próbach nadal brak, zwracamy to co mamy (frontend obsłuży brak preview)

    return NextResponse.json({
      ...randomTrack,
      previewUrl: finalPreviewUrl
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
