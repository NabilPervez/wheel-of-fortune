import { useGameStore } from '../store/useGameStore';
import { StrikeTracker } from './StrikeTracker';
import clsx from 'clsx';

export const HUD = () => {
    const { globalTimeRemaining, turnTimeRemaining, status } = useGameStore();

    const radius = 24;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (turnTimeRemaining / 10) * circumference;

    return (
        <div className="flex flex-col items-center justify-center w-full gap-6 py-4">

            <div className="flex items-end gap-12">
                {/* Global Timer */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Survivor</span>
                    <div className={clsx(
                        "text-5xl font-black tabular-nums tracking-tighter transition-colors",
                        globalTimeRemaining <= 10 ? "text-red-500 animate-pulse" : "text-white"
                    )}>
                        {Math.floor(globalTimeRemaining / 60)}:{String(globalTimeRemaining % 60).padStart(2, '0')}
                    </div>
                </div>

                {/* Turn Timer (Circular) */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Turn</span>
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform">
                            <circle
                                cx="28" cy="28" r={radius}
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-white/10"
                            />
                            <circle
                                cx="28" cy="28" r={radius}
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
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
            </div>

            <StrikeTracker />

            {/* Game Status Message overlay (if done) */}
            {(status === 'WON' || status === 'LOST') && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 text-center z-50 border-y border-white/10 shadow-2xl animate-fade-in-up">
                    <h2 className={clsx(
                        "text-6xl font-black italic tracking-tighter mb-2",
                        status === 'WON' ? "text-yellow-400" : "text-red-600"
                    )}>
                        {status === 'WON' ? 'SURVIVED!' : 'ELIMINATED'}
                    </h2>
                    <div className="text-gray-400 text-sm uppercase tracking-widest mt-2">
                        Refresh to play again
                    </div>
                </div>
            )}
        </div>
    );
};
