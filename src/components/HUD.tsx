import { useGameStore } from '../store/useGameStore';
import { StrikeTracker } from './StrikeTracker';
import clsx from 'clsx';

export const HUD = () => {
    const { globalTimeRemaining, turnTimeRemaining, status } = useGameStore();

    return (
        <div className="flex items-center justify-center w-full gap-4 sm:gap-8 py-0.5">

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
            {/* Incorrect Letters Log */}
            {/* Removed dynamic hook logic that caused crashes. Simplification. */}
        </div>
    );
};
