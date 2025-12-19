import { useGameStore } from '../store/useGameStore';
import { StrikeTracker } from './StrikeTracker';
import clsx from 'clsx';

export const HUD = () => {
    const { globalTimeRemaining, turnTimeRemaining, status } = useGameStore();

    return (
        <div className="flex items-center justify-center w-full gap-4 sm:gap-8 py-2 md:py-4">

            {/* Global Timer */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Solve Timer</span>
                <div className={clsx(
                    "text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter transition-colors",
                    globalTimeRemaining <= 10 ? "text-red-500 animate-pulse" : "text-white"
                )}>
                    {Math.floor(globalTimeRemaining / 60)}:{String(globalTimeRemaining % 60).padStart(2, '0')}
                </div>
            </div>

            {/* Turn Timer (Circular) */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Turn</span>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform">
                        <circle
                            cx="24" cy="24" r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-white/10"
                        />
                        <circle
                            cx="24" cy="24" r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={(2 * Math.PI * 20) - (turnTimeRemaining / 15) * (2 * Math.PI * 20)}
                            strokeLinecap="round"
                            className={clsx(
                                "transition-[stroke-dashoffset] duration-1000 ease-linear",
                                turnTimeRemaining <= 3 ? "text-red-500" : "text-emerald-400"
                            )}
                        />
                    </svg>
                    <span className={clsx(
                        "absolute font-bold text-lg tabular-nums",
                        turnTimeRemaining <= 3 ? "text-red-500" : "text-white"
                    )}>
                        {turnTimeRemaining}
                    </span>
                </div>
            </div>

            <StrikeTracker />

            {/* Incorrect Letters Log */}
            {/* Removed dynamic hook logic that caused crashes. Simplification. */}

            {/* Game Status Message overlay (if done) */}
            {(status === 'WON' || status === 'LOST') && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 text-center z-50 border-y border-white/10 shadow-2xl animate-fade-in-up w-full">
                    <h2 className={clsx(
                        "text-6xl font-black italic tracking-tighter mb-2",
                        status === 'WON' ? "text-yellow-400" : "text-red-600"
                    )}>
                        {status === 'WON' ? 'SURVIVED!' : 'ELIMINATED'}
                    </h2>

                    {/* Reveal Answer if Lost */}
                    {status === 'LOST' && (
                        <div className="mb-4">
                            <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">The answer was:</div>
                            <div className="text-2xl font-bold text-white tracking-wide">
                                {useGameStore.getState().currentPuzzle?.text || "UNKNOWN"}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={() => window.location.reload()}
                            className={clsx(
                                "px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase transition-all transform hover:scale-105 shadow-lg",
                                status === 'WON'
                                    ? "bg-yellow-400 text-black hover:bg-yellow-300 shadow-yellow-400/20"
                                    : "bg-red-600 text-white hover:bg-red-500 shadow-red-600/20"
                            )}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
