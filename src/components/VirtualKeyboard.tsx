import { useGameStore, useGameActions } from '../store/useGameStore';
import clsx from 'clsx';

const KEYS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const VirtualKeyboard = () => {
    const { guessedLetters, currentPuzzle, status } = useGameStore();
    const { guessLetter } = useGameActions();

    const puzzleText = currentPuzzle?.text.toUpperCase() || "";

    const getKeyStatus = (char: string) => {
        if (!guessedLetters.includes(char)) return 'unused';
        if (puzzleText.includes(char)) return 'correct';
        return 'wrong';
    };

    const handlePress = (char: string) => {
        // Only allow guessing if playing
        if (status !== 'PLAYING') return;
        guessLetter(char);
    };

    return (
        <div className="w-full flex-1 flex flex-col justify-end pb-4 px-1 gap-2 select-none">
            {KEYS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1.5 w-full">
                    {row.map((char) => {
                        const keyStatus = getKeyStatus(char);
                        const isUnused = keyStatus === 'unused';

                        return (
                            <button
                                key={char}
                                onClick={() => handlePress(char)}
                                disabled={!isUnused || status !== 'PLAYING'}
                                className={clsx(
                                    "h-14 sm:h-16 rounded-lg font-bold text-xl transition-all shadow-sm flex items-center justify-center",
                                    // Touch target optimization
                                    "flex-1 max-w-[48px] min-w-[32px]",
                                    isUnused ? "bg-white text-gray-900 active:scale-95 active:bg-gray-200" : "",
                                    keyStatus === 'correct' && "bg-emerald-500 text-white opacity-80 cursor-not-allowed border-emerald-600 border-b-4 translate-y-[2px]",
                                    keyStatus === 'wrong' && "bg-gray-700 text-gray-500 opacity-50 cursor-not-allowed border-gray-800 border-b-4 translate-y-[2px]",
                                    isUnused && status === 'PLAYING' && "border-b-4 border-gray-300 hover:border-gray-400"
                                )}
                            >
                                {char}
                            </button>
                        )
                    })}
                </div>
            ))}
        </div>
    );
};
