import axios from 'axios';
import { TrackInfo } from '@/lib/deezer';

export type ExtendedTrackInfo = TrackInfo;

export async function fetchPlaylistTracks(playlistId: string): Promise<ExtendedTrackInfo[]> {
    try {
        const response = await axios.get('/api/playlist', {
            params: { playlistId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch playlist tracks:", error);
        return [];
    }
}

export async function fetchTrackDetails(trackId: string): Promise<Partial<ExtendedTrackInfo> | null> {
    try {
        const response = await axios.get('/api/track', {
            params: { trackId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch track details:", error);
        return null;
    }
}
