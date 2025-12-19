import { useGameStore } from '../store/useGameStore';
import clsx from 'clsx';
import { X } from 'lucide-react';

export const StrikeTracker = () => {
    const strikes = useGameStore(s => s.strikes);
    const maxStrikes = 3;

    return (
        <div className="flex gap-3">
            {[...Array(maxStrikes)].map((_, i) => {
                const isStrike = i < strikes;

                // Colors: 1st=Yellow, 2nd=Orange, 3rd=Red
                let colorClass = "bg-white/5 border-white/20 text-transparent";
                if (isStrike) {
                    if (i === 0) colorClass = "bg-yellow-500 border-yellow-500 text-black";
                    if (i === 1) colorClass = "bg-orange-500 border-orange-500 text-white";
                    if (i === 2) colorClass = "bg-red-600 border-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)]";
                }

                return (
                    <div
                        key={i}
                        className={clsx(
                            "w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shadow-sm",
                            colorClass
                        )}
                    >
                        <X size={28} strokeWidth={4} />
                    </div>
                );
            })}
        </div>
    );
};
