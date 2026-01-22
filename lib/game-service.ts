import axios from 'axios';
import { TrackInfo } from '@/lib/deezer';

export type ExtendedTrackInfo = TrackInfo;

export async function fetchRandomTrack(playlistId: string): Promise<ExtendedTrackInfo | null> {
    try {
        const response = await axios.get('/api/track', {
            params: { playlistId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch track:", error);
        return null;
    }
}
