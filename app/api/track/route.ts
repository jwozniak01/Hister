import { NextRequest, NextResponse } from 'next/server';
import { getDeezerPlaylist, getTrackDetails } from '@/lib/deezer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');

  if (!playlistId) {
    return NextResponse.json({ error: 'Missing playlistId parameter' }, { status: 400 });
  }

  try {
    // 1. Pobierz utwory z playlisty Deezer
    const tracks = await getDeezerPlaylist(playlistId);

    if (tracks.length === 0) {
      return NextResponse.json({
        error: 'Nie znaleziono playlisty Deezer lub jest pusta. Sprawdź ID.'
      }, { status: 404 });
    }

    // 2. Wylosuj jeden utwór
    // Filtrujemy tylko te z preview (Deezer zazwyczaj ma wszystkie, ale dla pewności)
    const playableTracks = tracks.filter(t => t.previewUrl);

    if (playableTracks.length === 0) {
        return NextResponse.json({ error: 'Ta playlista nie zawiera utworów z podglądem audio.' }, { status: 404 });
    }

    const randomTrack = playableTracks[Math.floor(Math.random() * playableTracks.length)];

    // 3. Pobierz szczegóły (rok wydania)
    // Deezer playlist endpoint nie zwraca daty, więc robimy szybki fetch szczegółów
    const details = await getTrackDetails(randomTrack.id);

    const finalTrack = {
        ...randomTrack,
        year: details?.year || 'N/A',
        album: details?.album || randomTrack.album
    };

    return NextResponse.json(finalTrack);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
