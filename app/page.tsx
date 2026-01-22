'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const [customPlaylistUrl, setCustomPlaylistUrl] = useState('');
  const [winningScore, setWinningScore] = useState(20);

  const startGame = () => {
    let playlistId = '';

    if (customPlaylistUrl) {
      // Wyciągnij ID z linku (np. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...)
      // Obsługa różnych formatów linków spotify
      const match = customPlaylistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        playlistId = match[1];
      } else {
         // Fallback: może user wpisał samo ID?
         if (customPlaylistUrl.length > 15 && !customPlaylistUrl.includes('/')) {
             playlistId = customPlaylistUrl;
         } else {
             alert("Nieprawidłowy link do playlisty Spotify");
             return;
         }
      }
    } else {
        alert("Wklej link do playlisty!");
        return;
    }

    // Przekazujemy ustawienia w URL do strony gry
    router.push(`/game?playlistId=${playlistId}&targetScore=${winningScore}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          HISTER
        </h1>
        <p className="text-xl text-gray-400">Turniej wiedzy muzycznej</p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-left space-y-6">

          {/* Wybór playlisty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Link do Playlisty Spotify</label>
            <div>
                <input
                    type="text"
                    placeholder="Wklej link (https://open.spotify.com/playlist/...)"
                    value={customPlaylistUrl}
                    onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                    className="w-full p-4 rounded-lg bg-gray-900 border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Playlista musi być publiczna.</p>
            </div>
          </div>

          {/* Wybór punktów */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Gramy do ilu punktów?</label>
            <div className="flex justify-between gap-2">
                {[10, 20, 30, 40].map(score => (
                    <button
                        key={score}
                        onClick={() => setWinningScore(score)}
                        className={`flex-1 py-3 rounded-lg font-bold border transition ${winningScore === score ? 'bg-pink-600 border-pink-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                    >
                        {score} pkt
                    </button>
                ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl text-xl font-bold shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Play size={24} fill="currentColor" /> ROZPOCZNIJ GRĘ
          </button>
        </div>
      </div>
    </main>
  );
}
