'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PREDEFINED_PLAYLISTS } from '@/lib/constants';
import { Play } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState(PREDEFINED_PLAYLISTS[0].id);
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState('');
  const [winningScore, setWinningScore] = useState(20);
  const [isCustom, setIsCustom] = useState(false);

  const startGame = () => {
    let playlistId = selectedPlaylistId;

    if (isCustom && customPlaylistUrl) {
      // Wyciągnij ID z linku (np. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...)
      const match = customPlaylistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        playlistId = match[1];
      } else {
        alert("Nieprawidłowy link do playlisty Spotify");
        return;
      }
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
            <label className="block text-sm font-medium text-gray-300 mb-3">Wybierz kategorię muzyczną</label>
            <div className="flex space-x-4 mb-4">
               <button
                onClick={() => setIsCustom(false)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${!isCustom ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
               >
                 Gotowe Kategorie
               </button>
               <button
                onClick={() => setIsCustom(true)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${isCustom ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
               >
                 Własna Playlista
               </button>
            </div>

            {!isCustom ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PREDEFINED_PLAYLISTS.map(pl => (
                        <button
                            key={pl.id}
                            onClick={() => setSelectedPlaylistId(pl.id)}
                            className={`p-3 rounded-lg border text-left transition ${selectedPlaylistId === pl.id ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'}`}
                        >
                            {pl.name}
                        </button>
                    ))}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Wklej link do playlisty Spotify (np. https://open.spotify.com/playlist/...)"
                        value={customPlaylistUrl}
                        onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                        className="w-full p-4 rounded-lg bg-gray-900 border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                    />
                </div>
            )}
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
