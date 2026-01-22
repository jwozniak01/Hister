# HISTER - Muzyczny Turniej Wiedzy 🎵

Aplikacja webowa do gry w zgadywanie utworów muzycznych. Idealna na imprezy!
System wyświetla kod QR, który jedna drużyna skanuje, aby puścić fragment utworu drugiej drużynie.

## Funkcje

- 📱 **Gra Hybrydowa:** Ekran główny (Host) + Telefony graczy (Pilot/Odtwarzacz).
- 🎧 **Inteligentne Źródła:** Pobiera playlisty ze Spotify, a fragmenty audio (preview) z iTunes (jeśli Spotify ich nie udostępnia).
- 🏆 **System Punktacji:** Zliczanie punktów za Tytuł, Wykonawcę, Album, Rok i Popularność.
- ⚙️ **Konfiguracja:** Wybór gotowych kategorii lub własnej playlisty Spotify.

## Wymagania

- Node.js 18+
- Konto Developer Spotify (darmowe) do uzyskania kluczy API.

## Konfiguracja

1. Sklonuj repozytorium.
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skopiuj plik `.env.local.example` na `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Uzupełnij klucze w `.env.local`:
   - Wejdź na [Spotify for Developers](https://developer.spotify.com/dashboard).
   - Utwórz nową aplikację ("Create App").
   - Skopiuj **Client ID** oraz **Client Secret**.
   - Wklej je do pliku `.env.local`.

## Uruchomienie

```bash
npm run dev
```

Aplikacja dostępna pod adresem: `http://localhost:3000`.

## Jak grać?

1. Uruchom grę na dużym ekranie (TV/Laptop).
2. Wybierz kategorię i limit punktów.
3. Gdy pojawi się kod QR - drużyna B (atakująca) skanuje go telefonem.
4. Na telefonie odpala się odtwarzacz - puszczają fragment drużynie A.
5. Drużyna A zgaduje.
6. Host klika "Pokaż odpowiedź" i zaznacza, co udało się zgadnąć.
7. Punkty lecą na konto!
