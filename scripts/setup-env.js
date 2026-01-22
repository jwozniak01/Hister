const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env.local');

console.log('\n🎵 Hister - Konfiguracja Środowiska 🎵\n');
console.log('Ten skrypt pomoże Ci skonfigurować dostęp do Spotify API.');
console.log('Klucze znajdziesz na: https://developer.spotify.com/dashboard\n');

rl.question('Wklej Spotify Client ID: ', (clientId) => {
  rl.question('Wklej Spotify Client Secret: ', (clientSecret) => {

    const content = `SPOTIFY_CLIENT_ID=${clientId.trim()}
SPOTIFY_CLIENT_SECRET=${clientSecret.trim()}
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

    fs.writeFileSync(envPath, content);

    console.log('\n✅ Sukces! Plik .env.local został utworzony.');
    console.log('Możesz teraz uruchomić aplikację komendą: npm run dev\n');

    rl.close();
  });
});
