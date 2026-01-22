import axios from 'axios';

/**
 * Usuwa "śmieci" z tytułów (np. "Remastered 2009", "Radio Edit", "feat. X").
 */
function cleanString(str: string): string {
    return str
        .replace(/\(.*\)/g, '') // Usuń wszystko w nawiasach okrągłych
        .replace(/\[.*\]/g, '') // Usuń wszystko w nawiasach kwadratowych
        .replace(/-.*remaster.*/yi, '') // Usuń " - Remaster..."
        .replace(/feat\..*/yi, '') // Usuń "feat. ..."
        .replace(/ft\..*/yi, '') // Usuń "ft. ..."
        .trim();
}

/**
 * Szuka preview utworu w iTunes API na podstawie wykonawcy i tytułu.
 * Używa strategii "Fuzzy Search" dla lepszych wyników.
 */
export async function getItunesPreview(artist: string, title: string): Promise<string | null> {
  try {
    const cleanTitle = cleanString(title);
    const cleanArtist = cleanString(artist);

    // Strategia 1: Pełne wyszukiwanie (Wykonawca + Tytuł)
    // Używamy 'term' z obiema wartościami
    let term = encodeURIComponent(`${cleanArtist} ${cleanTitle}`);
    let url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`; // Pobieramy więcej wyników

    let response = await axios.get(url);

    if (response.data.resultCount > 0) {
       // Sprawdźmy pierwszy wynik
       // iTunes zazwyczaj sortuje dobrze. Bierzemy pierwszy, który ma previewUrl
       for (const track of response.data.results) {
           if (track.previewUrl) return track.previewUrl;
       }
    }

    // Strategia 2: Jeśli nic nie znaleziono, szukamy tylko po Tytule i filtrujemy po Wykonawcy
    // To pomaga, gdy iTunes ma inną pisownię wykonawcy
    console.log(`Strategia 1 nieudana dla "${artist} - ${title}". Próba szukania po samym tytule...`);

    term = encodeURIComponent(cleanTitle);
    url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=25`; // Szersze poszukiwania

    response = await axios.get(url);

    if (response.data.resultCount > 0) {
        // Szukamy utworu, którego nazwa wykonawcy zawiera kluczowe słowo z oryginalnego wykonawcy
        // Np. Oryginał: "Guns N' Roses", iTunes: "Guns N Roses" -> wspólne "Guns" lub "Roses"
        // Uproszczenie: sprawdzamy czy artistName z iTunes zawiera chociaż jedno słowo z cleanArtist (o długości > 3 znaków)

        const artistWords = cleanArtist.split(' ').filter(w => w.length > 3).map(w => w.toLowerCase());

        for (const track of response.data.results) {
            if (!track.previewUrl || !track.artistName) continue;

            const itunesArtistLower = track.artistName.toLowerCase();

            // Jeśli nie mamy słów > 3 znaki (np. "U2"), to sprawdzamy exact match (z tolerancją)
            if (artistWords.length === 0) {
                 if (itunesArtistLower.includes(cleanArtist.toLowerCase())) return track.previewUrl;
            } else {
                // Czy pasuje chociaż jedno znaczące słowo?
                const match = artistWords.some(word => itunesArtistLower.includes(word));
                if (match) {
                     console.log(`Trafienie rozmyte: "${track.artistName} - ${track.trackName}"`);
                     return track.previewUrl;
                }
            }
        }
    }

    return null;
  } catch (error) {
    console.error('Błąd wyszukiwania w iTunes:', error);
    return null;
  }
}
