'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExtendedTrackInfo, fetchPlaylistTracks, fetchTrackDetails } from '@/lib/game-service';
import { Loader2, Music, CheckCircle2, Trophy, RotateCcw, Play, Pause, Volume2, ThumbsUp, ThumbsDown } from 'lucide-react';

type GameState = 'LOADING' | 'READY' | 'PLAYING' | 'REVEALED' | 'GAME_OVER';

interface TeamScore {
    name: string;
    score: number;
}

function GameContent() {
    const searchParams = useSearchParams();
    const playlistId = searchParams.get('playlistId');
    const playlistId2 = searchParams.get('playlistId2');
    const gameMode = searchParams.get('mode') || 'classic';
    const targetScore = parseInt(searchParams.get('targetScore') || '20', 10);
    const teamCount = parseInt(searchParams.get('teamCount') || '2', 10);
    const duration = parseInt(searchParams.get('duration') || '30', 10);

    const [gameState, setGameState] = useState<GameState>('LOADING');
    const [currentTrack, setCurrentTrack] = useState<ExtendedTrackInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Playlist queues (Array of arrays for battle mode)
    const [queues, setQueues] = useState<ExtendedTrackInfo[][]>([]);
    const [isQueueLoaded, setIsQueueLoaded] = useState(false);

    // Audio Player State
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);

    // Scores
    const [teams, setTeams] = useState<TeamScore[]>([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [totalRounds, setTotalRounds] = useState(0); // For single player stats

    // Initialize teams
    useEffect(() => {
        const initialTeams = Array.from({ length: teamCount }, (_, i) => ({
            name: gameMode === 'single' ? 'Gracz' : `Drużyna ${String.fromCharCode(65 + i)}`,
            score: 0
        }));
        setTeams(initialTeams);
    }, [teamCount, gameMode]);

    // Confetti effect
    useEffect(() => {
        if (gameState === 'GAME_OVER') {
            const duration = 5000;
            const end = Date.now() + duration;

            import('@/lib/confetti').then((mod) => {
                const confetti = mod.default || mod;

                const frame = () => {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#a855f7', '#ec4899']
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#a855f7', '#ec4899']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
            });
        }
    }, [gameState]);

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

        const fetchAndPrepareQueue = async (pid: string) => {
             const tracks = await fetchPlaylistTracks(pid);
             if (tracks.length === 0) return [];
             const unique = tracks.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
             return unique.sort(() => Math.random() - 0.5);
        };

        const initQueues = async () => {
            try {
                const queue1 = await fetchAndPrepareQueue(playlistId);

                let loadedQueues = [queue1];

                if (gameMode === 'battle' && playlistId2) {
                    const queue2 = await fetchAndPrepareQueue(playlistId2);
                    loadedQueues = [queue1, queue2];
                }

                if (loadedQueues.some(q => q.length > 0)) {
                    setQueues(loadedQueues);
                    setIsQueueLoaded(true);
                } else {
                    setError("Nie udało się pobrać utworów.");
                }

            } catch (e) {
                console.error(e);
                setError("Błąd pobierania playlist.");
            }
        };

        initQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlistId, playlistId2, gameMode]);

    useEffect(() => {
        if (isQueueLoaded) {
            loadNextRound();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isQueueLoaded]);

    // Resetuj odtwarzacz przy zmianie utworu
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = volume;
            audioRef.current.load(); // Wymuś przeładowanie źródła
        }
        setIsPlaying(false);
        setProgress(0);
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const loadNextRound = async () => {
        setIsPlaying(false);
        setGameState('LOADING');
        setError(null);
        setPoints({ title: false, artist: false, album: false, year: false, popularity: false });

        // Determine which queue to use
        let queueIndex = 0;
        if (gameMode === 'battle') {
            queueIndex = currentTeamIndex % 2;
        }

        const activeQueue = queues[queueIndex] || queues[0];

        if (!activeQueue || activeQueue.length === 0) {
            // Check if ALL queues are empty or just this one?
            // Simple logic: if active queue is empty, game over (or skip turn?)
            // For now: Game Over
             setWinner("KONIEC GRY (Brak utworów)");
             setGameState('GAME_OVER');
             return;
        }

        const nextTrackBasic = activeQueue[0];
        const newActiveQueue = activeQueue.slice(1);

        // Update queues state
        const newQueues = [...queues];
        if (gameMode === 'battle') {
             newQueues[queueIndex] = newActiveQueue;
        } else {
             newQueues[0] = newActiveQueue;
        }
        setQueues(newQueues);

        // Fetch details for the track (year, full artists)
        const details = await fetchTrackDetails(nextTrackBasic.id);

        const fullTrack: ExtendedTrackInfo = {
            ...nextTrackBasic,
            ...(details || {})
        };

        setCurrentTrack(fullTrack);
        setGameState('READY');
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack?.previewUrl) return;

        if (audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        } else {
            audioRef.current.pause();
        }
    };

    // Handlery zdarzeń audio do synchronizacji stanu
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleAudioEnded = () => setIsPlaying(false);

    // Limit duration check
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const percentage = Math.min((current / duration) * 100, 100);
            setProgress(percentage);

            if (current >= duration) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
                setProgress(0);
            }
        }
    };

    const handleReveal = () => {
        setIsPlaying(false);
        setGameState('REVEALED');
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleSinglePlayerGuess = (guessed: boolean) => {
        const newTeams = [...teams];
        if (guessed) {
            newTeams[0].score += 1;
        }
        setTeams(newTeams);
        setTotalRounds(prev => prev + 1);
        loadNextRound();
    };

    const submitPoints = () => {
        let roundPoints = 0;
        if (points.title) roundPoints++;
        if (points.artist) roundPoints++;
        if (points.album) roundPoints++;
        if (points.year) roundPoints++;
        if (points.popularity) roundPoints++;

        const newTeams = [...teams];
        newTeams[currentTeamIndex].score += roundPoints;
        setTeams(newTeams);

        // In Single Player mode, we don't end by score, only by queue empty
        if (gameMode !== 'single' && newTeams[currentTeamIndex].score >= targetScore) {
            setWinner(newTeams[currentTeamIndex].name);
            setGameState('GAME_OVER');
            return;
        }

        setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
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
                {gameMode === 'single' ? (
                    <>
                        <h1 className="text-5xl font-black mb-4">KONIEC GRY!</h1>
                        <div className="text-3xl font-bold mb-8 text-gray-300">
                            Twój wynik: <span className="text-white">{teams[0]?.score}</span> / {totalRounds}
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-5xl font-black mb-4">WYGRYWA {winner}!</h1>
                        <div className="flex gap-8 text-2xl font-bold mb-8 flex-wrap justify-center">
                            {teams.map((team, index) => (
                                <div key={index} className="text-gray-300">
                                    {team.name}: <span className="text-white">{team.score}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <button onClick={() => window.location.href = '/'} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">Wróć do Menu</button>
             </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
            {/* Lewy panel - Wyniki */}
            <div className="w-1/4 bg-gray-800 p-6 flex flex-col justify-between border-r border-gray-700 overflow-y-auto">
                <div>
                    <Link href="/">
                        <h1 className="text-2xl font-black italic tracking-widest text-gray-500 mb-10 hover:text-white transition-colors cursor-pointer">HISTER</h1>
                    </Link>

                    <div className="space-y-4">
                        {teams.map((team, index) => (
                             <div key={index} className={`p-4 rounded-2xl transition-all ${currentTeamIndex === index ? 'bg-blue-600/20 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-gray-700/30 border border-gray-600'}`}>
                                <h2 className="text-gray-400 text-xs font-bold uppercase mb-1">
                                    {currentTeamIndex === index ? 'Zgaduje' : 'Czeka'}
                                </h2>
                                <div className={`text-xl font-bold ${currentTeamIndex === index ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {team.name}
                                </div>
                                <div className="text-3xl font-black mt-1">
                                    {team.score} <span className="text-sm text-gray-500 font-normal">/ {targetScore}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center text-gray-500 text-sm mt-4">
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

                {(gameState === 'READY' || gameState === 'PLAYING') && currentTrack && teams.length > 0 && (
                    <div className="flex flex-col items-center space-y-10 w-full max-w-2xl animate-in fade-in zoom-in duration-500">
                        <div className="text-center space-y-2">
                             <h2 className="text-3xl font-bold">Tura: <span className="text-blue-400">{teams[currentTeamIndex]?.name}</span></h2>
                             <p className="text-gray-400">Posłuchaj fragmentu i zgadnij!</p>
                             <div className="text-xs font-mono bg-gray-800 px-2 py-1 rounded inline-block text-gray-500">
                                Limit czasu: {duration}s
                             </div>
                        </div>

                        <div className="bg-gray-800 p-10 rounded-full shadow-2xl border-4 border-gray-700 flex items-center justify-center w-64 h-64 relative">
                            {/* Player Interface */}
                            {currentTrack.previewUrl ? (
                                <>
                                    <audio
                                        ref={audioRef}
                                        key={currentTrack.id} // Wymuszamy odświeżenie elementu audio przy zmianie utworu
                                        src={currentTrack.previewUrl}
                                        onPlay={handlePlay}
                                        onPause={handlePause}
                                        onEnded={handleAudioEnded}
                                        onTimeUpdate={handleTimeUpdate}
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
                                        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping pointer-events-none"></div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <div className="font-bold text-red-400 mb-2">Brak audio</div>
                                    <div className="text-xs">Nie znaleziono fragmentu :(</div>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                         {currentTrack.previewUrl && (
                            <div className="w-64 mt-4 mb-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>0s</span>
                                    <span>{duration}s</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-pink-500 h-full transition-all duration-100 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Volume Control */}
                        {currentTrack.previewUrl && (
                            <div className="flex items-center gap-3 w-64 bg-gray-800/80 px-4 py-2 rounded-full border border-gray-700">
                                <Volume2 size={20} className="text-gray-400" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:bg-purple-400"
                                />
                            </div>
                        )}

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
                                    <div className="text-3xl font-bold text-white leading-tight">{currentTrack.title}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wykonawca</div>
                                    <div className="text-2xl text-purple-300 leading-tight">{currentTrack.artist}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Album</div>
                                        <div className="text-lg text-gray-300 leading-tight">{currentTrack.album}</div>
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
                            {gameMode === 'single' ? (
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => handleSinglePlayerGuess(false)}
                                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xl shadow-lg transition flex items-center justify-center gap-2"
                                    >
                                        <ThumbsDown /> NIE ZGADŁEM
                                    </button>
                                    <button
                                        onClick={() => handleSinglePlayerGuess(true)}
                                        className="flex-1 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xl shadow-lg transition flex items-center justify-center gap-2"
                                    >
                                        <ThumbsUp /> ZGADŁEM
                                    </button>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
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
