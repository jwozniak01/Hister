# HISTER - Muzyczny Turniej Wiedzy 🎵

Aplikacja webowa do gry w zgadywanie utworów muzycznych.
System pobiera muzykę z playlist **Deezer** (publicznych, nie wymaga konta).

## Funkcje

- 📱 **Lokalny Odtwarzacz:** Host puszcza fragmenty muzyczne bezpośrednio w przeglądarce.
- 🎧 **Deezer API:** Brak potrzeby konfiguracji kluczy API! Wystarczy link do publicznej playlisty.
- 🏆 **System Punktacji:** Zliczanie punktów za Tytuł, Wykonawcę, Album, Rok i Popularność.

## Wymagania

- Node.js 18+

## Uruchomienie

1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom grę:
   ```bash
   npm run dev
   ```

Aplikacja dostępna pod adresem: `http://localhost:3000`.

## Jak grać?

1. Znajdź fajną playlistę na [Deezer.com](https://www.deezer.com).
2. Skopiuj link (np. `https://www.deezer.com/pl/playlist/908622995`).
3. Wklej link w aplikacji Hister.
4. Kliknij "Rozpocznij Grę".
5. Puszczaj fragmenty przyciskiem PLAY i sprawdzaj wiedzę znajomych!
