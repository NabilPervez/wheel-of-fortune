import { useGameStore } from '../store/useGameStore';
import clsx from 'clsx';

export const PuzzleBoard = () => {
    const { currentPuzzle, guessedLetters, status } = useGameStore();

    if (!currentPuzzle) return <div className="text-white opacity-50">Press Start</div>;

    // Split into words to handle wrapping nicely
    const words = currentPuzzle.text.split(' ');

    return (
        <div className="w-full h-full flex flex-col items-center justify-start py-2 overflow-y-auto noscroll">
            <div className="bg-yellow-500/10 px-3 py-0.5 rounded-full mb-2 border border-yellow-500/30 shrink-0">
                <h2 className="text-[10px] sm:text-xs font-bold text-yellow-400 tracking-widest uppercase shadow-sm">
                    {currentPuzzle.category}
                </h2>
            </div>

            <div className="flex flex-wrap justify-center content-start gap-x-3 gap-y-3 w-full max-w-4xl px-2 flex-1">
                {words.map((word, wIdx) => (
                    <div key={wIdx} className="flex flex-nowrap gap-1">
                        {word.split('').map((char, cIdx) => {
                            const isLetter = /[A-Z]/.test(char);
                            const isRevealed = guessedLetters.includes(char) || !isLetter || status === 'LOST';

                            // Render punctuation visually if needed, but for now we skip logic tiles
                            // Actually, standard Wheel adds spaces/punctuation.
                            // Our regex `/[A-Z]/` handles standard letters.
                            // If we have punctuation in JSON text, it might be skipped here.
                            // Let's render everything but style letters as tiles.

                            if (!isLetter) {
                                // Punctuation/Space render
                                return (
                                    <div key={cIdx} className="w-4 h-10 sm:w-8 sm:h-16 flex items-end justify-center text-white text-2xl sm:text-4xl font-bold pb-1">
                                        {char}
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={cIdx}
                                    className={clsx(
                                        "w-8 h-12 xs:w-10 xs:h-14 sm:w-14 sm:h-20 flex items-center justify-center font-bold rounded-sm shadow-md transition-all duration-300",
                                        "text-2xl xs:text-3xl sm:text-5xl", // Significantly larger text
                                        isRevealed
                                            ? "bg-white text-black scale-100"
                                            : "bg-white/10 border-2 border-white/30 text-transparent scale-95"
                                    )}
                                >
                                    {isRevealed ? char : ''}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
