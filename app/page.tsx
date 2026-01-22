'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const [gameMode, setGameMode] = useState<'classic' | 'single' | 'battle'>('classic');
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState('');
  const [customPlaylistUrl2, setCustomPlaylistUrl2] = useState('');
  const [winningScore, setWinningScore] = useState(20);
  const [teamCount, setTeamCount] = useState(2);
  const [duration, setDuration] = useState(30);

  const extractPlaylistId = (url: string) => {
      const match = url.match(/playlist\/([0-9]+)/);
      if (match && match[1]) return match[1];
      if (/^\d+$/.test(url)) return url;
      return null;
  };

  const startGame = () => {
    const playlistId1 = extractPlaylistId(customPlaylistUrl);

    if (!playlistId1) {
        alert("Wklej poprawny link do playlisty 1!");
        return;
    }

    let playlistId2 = '';
    if (gameMode === 'battle') {
        const p2 = extractPlaylistId(customPlaylistUrl2);
        if (!p2) {
             alert("Wklej poprawny link do playlisty 2!");
             return;
        }
        playlistId2 = p2;
    }

    let teams = teamCount;
    if (gameMode === 'single') teams = 1;
    if (gameMode === 'battle') teams = 2; // Fixed for battle

    // Przekazujemy ustawienia w URL do strony gry
    router.push(`/game?playlistId=${playlistId1}&targetScore=${winningScore}&teamCount=${teams}&duration=${duration}&mode=${gameMode}&playlistId2=${playlistId2}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white overflow-y-auto">
      <div className="w-full max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          HISTER
        </h1>
        <p className="text-xl text-gray-400">Turniej wiedzy muzycznej (Powered by Deezer)</p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-left space-y-6">

          {/* Tryb Gry */}
          <div className="flex bg-gray-900 p-1 rounded-xl mb-6">
             <button onClick={() => setGameMode('classic')} className={`flex-1 py-2 rounded-lg font-bold transition ${gameMode === 'classic' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                Klasyczny (Drużyny)
             </button>
             <button onClick={() => setGameMode('single')} className={`flex-1 py-2 rounded-lg font-bold transition ${gameMode === 'single' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                Jeden Gracz
             </button>
             <button onClick={() => setGameMode('battle')} className={`flex-1 py-2 rounded-lg font-bold transition ${gameMode === 'battle' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                Pojedynek Playlist
             </button>
          </div>

          {/* Wybór playlisty */}
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {gameMode === 'battle' ? 'Playlista Gracza 1' : 'Link do Playlisty Deezer'}
                </label>
                <input
                    type="text"
                    placeholder="Wklej link (https://www.deezer.com/pl/playlist/...)"
                    value={customPlaylistUrl}
                    onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                    className="w-full p-4 rounded-lg bg-gray-900 border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
                />
            </div>

            {gameMode === 'battle' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Playlista Gracza 2</label>
                    <input
                        type="text"
                        placeholder="Wklej link do DRUGIEJ playlisty"
                        value={customPlaylistUrl2}
                        onChange={(e) => setCustomPlaylistUrl2(e.target.value)}
                        className="w-full p-4 rounded-lg bg-gray-900 border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
                    />
                </div>
            )}

            <p className="text-xs text-gray-500">Playlista musi być publiczna (nie wymaga logowania).</p>
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

          {/* Liczba drużyn (Tylko w trybie klasycznym) */}
          {gameMode === 'classic' && (
              <div className="animate-in fade-in">
                <label className="block text-sm font-medium text-gray-300 mb-3">Liczba drużyn</label>
                <div className="flex justify-between gap-2">
                    {[2, 3, 4, 5, 6].map(count => (
                        <button
                            key={count}
                            onClick={() => setTeamCount(count)}
                            className={`flex-1 py-3 rounded-lg font-bold border transition ${teamCount === count ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
              </div>
          )}

          {/* Długość fragmentu */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Długość fragmentu</label>
            <div className="flex justify-between gap-2">
                {[
                  { label: 'Max (30s)', value: 30 },
                  { label: '20s', value: 20 },
                  { label: '10s', value: 10 },
                  { label: '5s', value: 5 },
                  { label: '2s', value: 2 },
                ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`flex-1 py-3 px-1 rounded-lg font-bold border transition text-sm ${duration === opt.value ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                    >
                        {opt.label}
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
