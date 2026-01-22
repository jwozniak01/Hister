import { NextRequest, NextResponse } from 'next/server';
import { getDeezerPlaylist } from '@/lib/deezer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');

  if (!playlistId) {
    return NextResponse.json({ error: 'Missing playlistId parameter' }, { status: 400 });
  }

  try {
    const tracks = await getDeezerPlaylist(playlistId);

    if (tracks.length === 0) {
      return NextResponse.json({
        error: 'Nie znaleziono playlisty Deezer lub jest pusta. Sprawdź ID.'
      }, { status: 404 });
    }

    // Filtrujemy tylko te z preview
    const playableTracks = tracks.filter(t => t.previewUrl);

    if (playableTracks.length === 0) {
        return NextResponse.json({ error: 'Ta playlista nie zawiera utworów z podglądem audio.' }, { status: 404 });
    }

    return NextResponse.json(playableTracks);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
