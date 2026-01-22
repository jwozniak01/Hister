'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function PlayerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('Nieprawidłowy link do utworu.');
    }
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Play error:", e);
        setError("Nie udało się odtworzyć dźwięku. Kliknij ponownie.");
      });
    }
    setIsPlaying(!isPlaying);
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Błąd</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Hister Player
        </h1>

        <div className="mb-8">
            <p className="text-gray-400 mb-4">Odtwórz fragment dla drużyny przeciwnej</p>
            {/* Animacja fal dźwiękowych (wizualna atrapa) */}
            <div className={`flex justify-center items-end space-x-1 h-12 mb-4 ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-2 bg-green-500 rounded-t-md animate-pulse`} style={{height: isPlaying ? '100%' : '20%', animationDuration: `${0.5 + i * 0.1}s`}}></div>
                ))}
            </div>
        </div>

        {url && (
            <audio
                ref={audioRef}
                src={url}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="hidden"
            />
        )}

        <button
          onClick={togglePlay}
          className={`w-full py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
            isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-black'
          }`}
        >
          {isPlaying ? 'PAUZA' : 'ODTWÓRZ'}
        </button>

        <p className="mt-6 text-xs text-gray-500">
          Zeskanuj kod QR na ekranie głównym, aby załadować kolejny utwór.
        </p>
      </div>
    </div>
  );
}

export default function PlayPage() {
    return (
        <Suspense fallback={<div className="text-white p-10 text-center">Ładowanie odtwarzacza...</div>}>
            <PlayerContent />
        </Suspense>
    )
}
