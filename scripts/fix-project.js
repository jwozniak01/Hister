const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Hister - Naprawa Projektu 🔧');

const rootDir = path.join(__dirname, '..');
const wrongConfig = path.join(rootDir, 'next.config.ts');
const nodeModules = path.join(rootDir, 'node_modules');
const packageLock = path.join(rootDir, 'package-lock.json');

// 1. Usuń next.config.ts
if (fs.existsSync(wrongConfig)) {
  console.log('🗑️  Usuwanie błędnego pliku next.config.ts...');
  fs.unlinkSync(wrongConfig);
}

// 2. Wyczyść cache (opcjonalnie)
console.log('🧹 Czyszczenie node_modules i cache...');
try {
  fs.rmSync(nodeModules, { recursive: true, force: true });
  fs.rmSync(packageLock, { force: true });
} catch (e) {
  console.warn('⚠️  Nie udało się usunąć niektórych plików (mogą być zablokowane). Spróbuj ręcznie.');
}

// 3. Zainstaluj ponownie
console.log('📦 Instalowanie zależności (może to chwilę potrwać)...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: rootDir });
  console.log('✅ Naprawa zakończona! Uruchom teraz: npm run dev');
} catch (e) {
  console.error('❌ Błąd podczas instalacji. Sprawdź logi.');
}
