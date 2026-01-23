import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hister.app',
  appName: 'Hister',
  webDir: 'out',
  server: {
    // To: Zmień ten adres na IP swojego komputera w sieci lokalnej (np. http://192.168.1.15:3000)
    // lub adres wdrożonej aplikacji (np. https://hister.vercel.app)
    // Dzięki temu aplikacja mobilna będzie miała dostęp do API Next.js.
    url: 'http://10.0.2.2:3000',
    cleartext: true
  }
};

export default config;
