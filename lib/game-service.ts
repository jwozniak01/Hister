import axios from 'axios';
import { TrackInfo } from '@/lib/spotify';

export interface ExtendedTrackInfo extends TrackInfo {
    previewUrl?: string | null;
}

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
