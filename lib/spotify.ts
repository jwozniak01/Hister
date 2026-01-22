import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Pobiera Access Token w ramach Client Credentials Flow.
 * Token jest cache'owany do czasu wygaśnięcia.
 */
async function getAccessToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Brak konfiguracji Spotify API (CLIENT_ID / CLIENT_SECRET)');
  }

  // Sprawdź czy token jest ważny (z marginesem 60 sekund)
  if (accessToken && Date.now() < tokenExpiresAt - 60000) {
    return accessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
    });

    accessToken = response.data.access_token;
    // expires_in jest w sekundach
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    return accessToken as string;
  } catch (error) {
    console.error('Błąd autoryzacji Spotify:', error);
    throw new Error('Nie udało się uzyskać tokenu Spotify');
  }
}

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  popularity: number;
  spotifyUrl: string;
  previewUrl?: string | null; // Może być null ze Spotify
}

/**
 * Pobiera listę utworów z podanej playlisty.
 * Zwraca uproszczone obiekty TrackInfo.
 */
export async function getPlaylistTracks(playlistId: string): Promise<TrackInfo[]> {
  const token = await getAccessToken();

  try {
    // Pobieramy pierwsze 50 utworów (można dodać paginację w przyszłości)
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track(id,name,artists(name),album(name,release_date),popularity,external_urls,preview_url))`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const tracks = response.data.items
      .map((item: any) => item.track)
      .filter((t: any) => t && t.id) // Filtruj puste lub null
      .map((t: any) => ({
        id: t.id,
        title: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        album: t.album.name,
        year: t.album.release_date ? t.album.release_date.substring(0, 4) : 'N/A',
        popularity: t.popularity,
        spotifyUrl: t.external_urls.spotify,
        previewUrl: t.preview_url,
      }));

    return tracks;
  } catch (error) {
    console.error(`Błąd pobierania playlisty ${playlistId}:`, error);
    // Jeśli playlista nie istnieje lub jest prywatna, zwróć pustą tablicę lub rzuć błąd
    return [];
  }
}
