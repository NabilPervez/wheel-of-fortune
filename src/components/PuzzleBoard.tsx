import { useGameStore } from '../store/useGameStore';
import clsx from 'clsx';

export const PuzzleBoard = () => {
    const { currentPuzzle, guessedLetters, status } = useGameStore();

    if (!currentPuzzle) return <div className="text-white opacity-50">Press Start</div>;

    // Split into words to handle wrapping nicely
    const words = currentPuzzle.text.split(' ');

    return (
        <div className="w-full flex flex-col items-center justify-center p-2">
            <div className="bg-yellow-500/20 px-4 py-1 rounded-full mb-6 border border-yellow-500/50">
                <h2 className="text-sm font-bold text-yellow-400 tracking-widest uppercase shadow-sm">
                    {currentPuzzle.category}
                </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 w-full max-w-lg">
                {words.map((word, wIdx) => (
                    <div key={wIdx} className="flex gap-1">
                        {word.split('').map((char, cIdx) => {
                            const isLetter = /[A-Z]/.test(char);
                            const isRevealed = guessedLetters.includes(char) || !isLetter || status === 'LOST';

                            if (!isLetter) return null; // Skip non-letters for tile rendering if any

                            return (
                                <div
                                    key={cIdx}
                                    className={clsx(
                                        "w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-sm shadow-md transition-all duration-300",
                                        isRevealed
                                            ? "bg-white text-black scale-100"
                                            : "bg-white/10 border-2 border-white/30 text-transparent scale-95"
                                    )}
                                >
                                    {isRevealed ? char : '?'}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
