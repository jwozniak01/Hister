import axios from 'axios';

/**
 * Szuka preview utworu w iTunes API na podstawie wykonawcy i tytułu.
 * Jest to fallback dla utworów, które nie mają preview_url w Spotify.
 */
export async function getItunesPreview(artist: string, title: string): Promise<string | null> {
  try {
    // iTunes API wymaga zakodowanych parametrów
    const term = encodeURIComponent(`${artist} ${title}`);
    const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;

    const response = await axios.get(url);

    if (response.data.resultCount > 0) {
      const track = response.data.results[0];
      // Sprawdźmy, czy znaleziony utwór pasuje mniej więcej nazwą (opcjonalne, ale warto)
      // Na razie ufamy pierwszemu wynikowi, iTunes zazwyczaj dobrze trafia.
      return track.previewUrl;
    }

    return null;
  } catch (error) {
    console.error('Błąd wyszukiwania w iTunes:', error);
    return null;
  }
}
