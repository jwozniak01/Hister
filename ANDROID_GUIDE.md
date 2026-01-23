# Wdrażanie aplikacji Hister na Androida (Prywatnie)

Ponieważ aplikacja Hister korzysta z funkcji backendowych Next.js (API Routes do komunikacji z Deezerem), nie można jej po prostu "wyeksportować" do statycznego pliku HTML, który działałby offline. Aplikacja mobilna musi łączyć się z serwerem.

Masz dwie główne opcje:

## Opcja A: Wersja "Pojemnik" (Capacitor) - Zalecana do Android Studio

Ta metoda tworzy prawdziwą aplikację `.apk`, która jednak w środku wyświetla stronę hostowaną na Twoim komputerze lub w chmurze.

### Krok 1: Uruchomienie Serwera
Musisz mieć uruchomioną aplikację Next.js, aby telefon mógł się z nią połączyć.
1. Upewnij się, że komputer i telefon są w tej samej sieci Wi-Fi.
2. Sprawdź IP swojego komputera (np. wpisując `ipconfig` w Windows lub `ifconfig` w Linux/Mac). Załóżmy, że to `192.168.1.15`.
3. Uruchom aplikację na komputerze: `npm run dev`.

### Krok 2: Konfiguracja Capacitora
1. Otwórz plik `capacitor.config.ts` w głównym folderze projektu.
2. W sekcji `server.url` wpisz adres z kroku 1, np.:
   ```typescript
   server: {
     url: 'http://192.168.1.15:3000', // Zmień na swoje IP
     cleartext: true
   }
   ```
   *Uwaga: Jeśli używasz emulatora Androida na tym samym komputerze, możesz użyć `http://10.0.2.2:3000`.*

### Krok 3: Budowanie Aplikacji
1. W terminalu w folderze projektu uruchom:
   ```bash
   npx cap add android
   ```
   (To stworzy folder `android` z projektem Android Studio).

2. Otwórz projekt w Android Studio:
   ```bash
   npx cap open android
   ```

3. W Android Studio:
   - Poczekaj aż Gradle zsynchronizuje projekt.
   - Podłącz telefon kablem USB (z włączonym debugowaniem USB) lub uruchom Emulator.
   - Kliknij zielony przycisk **Play (Run)**.

Aplikacja zainstaluje się na telefonie. Będzie ona działać tak długo, jak długo uruchomiony jest serwer na Twoim komputerze (lub jeśli wdrożysz aplikację np. na Vercel i podasz tamten adres URL).

---

## Opcja B: PWA (Progressive Web App) - Bez Android Studio

To prostsza metoda, jeśli nie potrzebujesz pliku `.apk`, a jedynie ikonki na pulpicie.

1. Wdróż aplikację w sieci (np. darmowe konto na [Vercel](https://vercel.com/)).
2. Wejdź na stronę aplikacji w przeglądarce Chrome na telefonie.
3. Kliknij menu (trzy kropki) -> **"Dodaj do ekranu głównego"** (lub "Zainstaluj aplikację").

Aplikacja będzie wyglądać i zachowywać się prawie jak natywna.
