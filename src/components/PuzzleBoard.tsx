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

            <div className="flex flex-wrap justify-center content-center gap-x-4 gap-y-2 w-full max-w-2xl px-2">
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
                                // Punctuation/Space render (simple spacer or character)
                                return (
                                    <div key={cIdx} className="w-4 h-8 sm:w-6 sm:h-10 flex items-center justify-center text-white text-xl font-bold">
                                        {char}
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={cIdx}
                                    className={clsx(
                                        "w-7 h-9 xs:w-8 xs:h-10 sm:w-10 sm:h-12 flex items-center justify-center font-bold rounded-sm shadow-md transition-all duration-300",
                                        "text-xl xs:text-2xl sm:text-3xl", // Responsive text size
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
