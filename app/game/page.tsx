'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExtendedTrackInfo, fetchRandomTrack } from '@/lib/game-service';
import { Loader2, Music, CheckCircle2, Trophy, RotateCcw, Play, Pause } from 'lucide-react';

type GameState = 'LOADING' | 'READY' | 'PLAYING' | 'REVEALED' | 'GAME_OVER';

interface TeamScore {
    name: string;
    score: number;
}

function GameContent() {
    const searchParams = useSearchParams();
    const playlistId = searchParams.get('playlistId');
    const targetScore = parseInt(searchParams.get('targetScore') || '20', 10);

    const [gameState, setGameState] = useState<GameState>('LOADING');
    const [currentTrack, setCurrentTrack] = useState<ExtendedTrackInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Audio Player State
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Scores
    const [teamA, setTeamA] = useState<TeamScore>({ name: 'Drużyna A', score: 0 });
    const [teamB, setTeamB] = useState<TeamScore>({ name: 'Drużyna B', score: 0 });
    const [currentTeamTurn, setCurrentTeamTurn] = useState<'A' | 'B'>('A');

    // Checkboxes for scoring
    const [points, setPoints] = useState({
        title: false,
        artist: false,
        album: false,
        year: false,
        popularity: false
    });

    const [winner, setWinner] = useState<string | null>(null);

    useEffect(() => {
        if (!playlistId) {
            setError("Brak ID playlisty.");
            return;
        }
        loadNextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlistId]);

    // Resetuj odtwarzacz przy zmianie utworu
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [currentTrack]);

    const loadNextRound = async () => {
        setGameState('LOADING');
        setError(null);
        setPoints({ title: false, artist: false, album: false, year: false, popularity: false });

        if (playlistId) {
            const track = await fetchRandomTrack(playlistId);
            if (track) {
                // Nawet jak nie ma preview, pozwalamy grać (może host puści z innego źródła?)
                // Ale komunikat o braku preview wyświetlimy w UI playera
                setCurrentTrack(track);
                setGameState('READY');
            } else {
                setError("Nie udało się pobrać utworu. Sprawdź czy playlista jest publiczna i ma utwory.");
            }
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack?.previewUrl) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const handleReveal = () => {
        setGameState('REVEALED');
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const submitPoints = () => {
        let roundPoints = 0;
        if (points.title) roundPoints++;
        if (points.artist) roundPoints++;
        if (points.album) roundPoints++;
        if (points.year) roundPoints++;
        if (points.popularity) roundPoints++;

        if (currentTeamTurn === 'A') {
            const newScore = teamA.score + roundPoints;
            setTeamA({ ...teamA, score: newScore });
            if (newScore >= targetScore) {
                setWinner(teamA.name);
                setGameState('GAME_OVER');
                return;
            }
            setCurrentTeamTurn('B');
        } else {
            const newScore = teamB.score + roundPoints;
            setTeamB({ ...teamB, score: newScore });
            if (newScore >= targetScore) {
                setWinner(teamB.name);
                setGameState('GAME_OVER');
                return;
            }
            setCurrentTeamTurn('A');
        }

        loadNextRound();
    };

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                <h2 className="text-2xl text-red-500 font-bold mb-4">Ups! Coś poszło nie tak</h2>
                <p className="mb-6">{error}</p>
                <button onClick={loadNextRound} className="bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-700 transition">Spróbuj ponownie</button>
            </div>
        );
    }

    if (gameState === 'GAME_OVER') {
        return (
             <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce" />
                <h1 className="text-5xl font-black mb-4">WYGRYWA {winner}!</h1>
                <div className="flex gap-8 text-2xl font-bold mb-8">
                    <div className="text-blue-400">{teamA.name}: {teamA.score}</div>
                    <div className="text-red-400">{teamB.name}: {teamB.score}</div>
                </div>
                <button onClick={() => window.location.href = '/'} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">Wróć do Menu</button>
             </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
            {/* Lewy panel - Wyniki */}
            <div className="w-1/4 bg-gray-800 p-6 flex flex-col justify-between border-r border-gray-700">
                <div>
                    <h1 className="text-2xl font-black italic tracking-widest text-gray-500 mb-10">HISTER</h1>

                    <div className={`p-6 rounded-2xl mb-6 transition-all ${currentTeamTurn === 'A' ? 'bg-blue-600/20 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-gray-700/30 border border-gray-600'}`}>
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-1">Zgaduje</h2>
                        <div className="text-3xl font-bold text-blue-400">{teamA.name}</div>
                        <div className="text-5xl font-black mt-2">{teamA.score} <span className="text-lg text-gray-500 font-normal">/ {targetScore}</span></div>
                    </div>

                    <div className={`p-6 rounded-2xl mb-6 transition-all ${currentTeamTurn === 'B' ? 'bg-red-600/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gray-700/30 border border-gray-600'}`}>
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-1">Zgaduje</h2>
                        <div className="text-3xl font-bold text-red-400">{teamB.name}</div>
                        <div className="text-5xl font-black mt-2">{teamB.score} <span className="text-lg text-gray-500 font-normal">/ {targetScore}</span></div>
                    </div>
                </div>

                <div className="text-center text-gray-500 text-sm">
                    {gameState === 'LOADING' ? 'Losowanie utworu...' : 'Gra w toku'}
                </div>
            </div>

            {/* Prawy panel - Gra */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 relative">

                {gameState === 'LOADING' && (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 size={64} className="animate-spin text-purple-500 mb-4" />
                        <h2 className="text-2xl font-bold">Szukam idealnego hitu...</h2>
                    </div>
                )}

                {(gameState === 'READY' || gameState === 'PLAYING') && currentTrack && (
                    <div className="flex flex-col items-center space-y-10 w-full max-w-2xl animate-in fade-in zoom-in duration-500">
                        <div className="text-center space-y-2">
                             <h2 className="text-3xl font-bold">Tura: <span className={currentTeamTurn === 'A' ? 'text-blue-400' : 'text-red-400'}>{currentTeamTurn === 'A' ? teamA.name : teamB.name}</span></h2>
                             <p className="text-gray-400">Posłuchaj fragmentu i zgadnij!</p>
                        </div>

                        <div className="bg-gray-800 p-10 rounded-full shadow-2xl border-4 border-gray-700 flex items-center justify-center w-64 h-64 relative">
                            {/* Player Interface */}
                            {currentTrack.previewUrl ? (
                                <>
                                    <audio
                                        ref={audioRef}
                                        src={currentTrack.previewUrl}
                                        onEnded={handleAudioEnded}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={togglePlay}
                                        className={`w-40 h-40 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${isPlaying ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]'}`}
                                    >
                                        {isPlaying ? <Pause size={60} fill="white" /> : <Play size={60} fill="white" className="ml-2" />}
                                    </button>

                                    {/* Wizualizacja - pulsujący okrąg gdy gra */}
                                    {isPlaying && (
                                        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <div className="font-bold text-red-400 mb-2">Brak audio</div>
                                    <div className="text-xs">Nie znaleziono fragmentu :(</div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                             <button
                                onClick={handleReveal}
                                className="bg-white text-black px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition shadow-lg flex items-center gap-2"
                             >
                                <Music size={24} /> POKAŻ ODPOWIEDŹ
                             </button>
                             <button
                                onClick={loadNextRound}
                                className="bg-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-600 transition"
                             >
                                <RotateCcw size={24} />
                             </button>
                        </div>
                    </div>
                )}

                {gameState === 'REVEALED' && currentTrack && (
                    <div className="w-full max-w-3xl animate-in slide-in-from-bottom-10 duration-500">
                        <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl mb-8 flex gap-8 items-center">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tytuł</div>
                                    <div className="text-3xl font-bold text-white">{currentTrack.title}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wykonawca</div>
                                    <div className="text-2xl text-purple-300">{currentTrack.artist}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Album</div>
                                        <div className="text-lg text-gray-300">{currentTrack.album}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rok</div>
                                        <div className="text-lg text-gray-300">{currentTrack.year}</div>
                                    </div>
                                </div>
                                <div>
                                     <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Popularność Deezer</div>
                                     <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
                                        <div className="bg-green-500 h-4 rounded-full" style={{width: `${currentTrack.popularity}%`}}></div>
                                     </div>
                                     <div className="text-right text-xs text-green-400 font-bold mt-1">{currentTrack.popularity}/100</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-center">Przyznaj Punkty</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                                <label className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${points.title ? 'border-green-500 bg-green-500/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="checkbox" className="hidden" checked={points.title} onChange={() => setPoints({...points, title: !points.title})} />
                                    <CheckCircle2 className={points.title ? 'text-green-500' : 'text-gray-500'} />
                                    <span className="font-bold">Tytuł</span>
                                </label>
                                <label className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${points.artist ? 'border-green-500 bg-green-500/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="checkbox" className="hidden" checked={points.artist} onChange={() => setPoints({...points, artist: !points.artist})} />
                                    <CheckCircle2 className={points.artist ? 'text-green-500' : 'text-gray-500'} />
                                    <span className="font-bold">Wykonawca</span>
                                </label>
                                <label className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${points.album ? 'border-green-500 bg-green-500/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="checkbox" className="hidden" checked={points.album} onChange={() => setPoints({...points, album: !points.album})} />
                                    <CheckCircle2 className={points.album ? 'text-green-500' : 'text-gray-500'} />
                                    <span className="font-bold">Album</span>
                                </label>
                                <label className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${points.year ? 'border-green-500 bg-green-500/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="checkbox" className="hidden" checked={points.year} onChange={() => setPoints({...points, year: !points.year})} />
                                    <CheckCircle2 className={points.year ? 'text-green-500' : 'text-gray-500'} />
                                    <span className="font-bold">Rok</span>
                                </label>
                                <label className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${points.popularity ? 'border-green-500 bg-green-500/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="checkbox" className="hidden" checked={points.popularity} onChange={() => setPoints({...points, popularity: !points.popularity})} />
                                    <CheckCircle2 className={points.popularity ? 'text-green-500' : 'text-gray-500'} />
                                    <span className="font-bold">Popularność</span>
                                </label>
                            </div>

                            <button
                                onClick={submitPoints}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-xl shadow-lg transform transition hover:scale-[1.01]"
                            >
                                ZATWIERDŹ WYNIK (+{Object.values(points).filter(Boolean).length})
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GamePage() {
    return (
        <Suspense fallback={<div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Ładowanie gry...</div>}>
            <GameContent />
        </Suspense>
    )
}
