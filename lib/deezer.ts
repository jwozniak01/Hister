import axios from 'axios';

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  popularity: number; // 0-100
  previewUrl: string | null;
  deezerUrl: string;
}

/**
 * Pobiera szczegóły utworu (w tym rok wydania).
 */
export async function getTrackDetails(trackId: string): Promise<Partial<TrackInfo> | null> {
    try {
        const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
        if (response.data && !response.data.error) {
            const t = response.data;
            return {
                year: t.release_date ? t.release_date.substring(0, 4) : 'N/A',
                // Możemy też uściślić album
                album: t.album ? t.album.title : undefined
            };
        }
    } catch (e) {
        console.error("Error fetching track details:", e);
    }
    return null;
}

/**
 * Pobiera utwory z playlisty Deezer.
 */
export async function getDeezerPlaylist(playlistId: string): Promise<TrackInfo[]> {
  try {
    const url = `https://api.deezer.com/playlist/${playlistId}`;
    const response = await axios.get(url);

    if (response.data.error) {
        throw new Error(`Deezer API Error: ${response.data.error.message}`);
    }

    const playlistData = response.data;

    if (!playlistData.tracks || !playlistData.tracks.data) {
        return [];
    }

    const tracks = playlistData.tracks.data.map((t: any) => {
        // Normalizacja rankingu (heurystyka)
        let pop = Math.min(Math.round(t.rank / 5000), 100);

        return {
            id: t.id.toString(),
            title: t.title,
            artist: t.artist.name,
            album: t.album.title,
            year: '...', // Będzie uzupełnione później
            popularity: pop,
            previewUrl: t.preview,
            deezerUrl: t.link
        };
    });

    return tracks;

  } catch (error) {
    console.error(`Błąd pobierania playlisty Deezer ${playlistId}:`, error);
    return [];
  }
}
