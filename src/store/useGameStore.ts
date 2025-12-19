import { create } from 'zustand';
import puzzlesData from '../data/puzzles.json';

export type GameStatus = 'IDLE' | 'STARTING' | 'PLAYING' | 'PAUSED' | 'WON' | 'LOST';

export interface Puzzle {
    id: string;
    category: string;
    text: string;
    difficulty: number;
}

interface GameState {
    status: GameStatus;
    currentPuzzle: Puzzle | null;
    guessedLetters: string[];
    strikes: number;
    globalTimeRemaining: number;
    turnTimeRemaining: number;
    hintsRemaining: number;

    actions: {
        startGame: () => void;
        startActiveGameplay: () => void;
        guessLetter: (letter: string) => void;
        attemptSolve: (phrase: string) => void;
        useHint: () => void;
        tick: () => void;
        pauseGame: () => void;
        resumeGame: () => void;
        resetGame: () => void;
    };
}

const GLOBAL_TIME_LIMIT = 60;
const TURN_TIME_LIMIT = 15;
const MAX_STRIKES = 3;

// Helper to check if won
const checkWinCondition = (puzzle: Puzzle, guessed: string[]) => {
    const normalizedText = puzzle.text.toUpperCase();
    for (const char of normalizedText) {
        if (/[A-Z]/.test(char) && !guessed.includes(char)) {
            return false;
        }
    }
    return true;
};

export const useGameStore = create<GameState>((set, get) => ({
    status: 'IDLE',
    currentPuzzle: null,
    guessedLetters: [],
    strikes: 0,
    globalTimeRemaining: GLOBAL_TIME_LIMIT,
    turnTimeRemaining: TURN_TIME_LIMIT,
    hintsRemaining: 3,

    actions: {
        startGame: () => {
            // Pick random puzzle
            const randomPuzzle = puzzlesData[Math.floor(Math.random() * puzzlesData.length)];

            // Get all unique letters in the puzzle (A-Z only)
            const uniqueLetters = Array.from(new Set(
                randomPuzzle.text.toUpperCase().split('').filter(char => /[A-Z]/.test(char))
            ));

            // Shuffle and pick 3
            const shuffled = uniqueLetters.sort(() => 0.5 - Math.random());
            const initialGuessed = shuffled.slice(0, 3);

            set({
                status: 'STARTING', // Countdown state
                currentPuzzle: randomPuzzle,
                guessedLetters: initialGuessed,
                strikes: 0,
                globalTimeRemaining: GLOBAL_TIME_LIMIT,
                turnTimeRemaining: TURN_TIME_LIMIT,
                hintsRemaining: 3
            });
        },

        startActiveGameplay: () => {
            const state = get();
            if (state.status === 'STARTING') {
                set({ status: 'PLAYING' });
            }
        },

        guessLetter: (letter: string) => {
            const state = get();
            if (state.status !== 'PLAYING') return;

            const normalizedLetter = letter.toUpperCase();
            if (state.guessedLetters.includes(normalizedLetter)) return;

            const newGuessed = [...state.guessedLetters, normalizedLetter];

            const puzzleText = state.currentPuzzle?.text.toUpperCase() || "";
            const isCorrect = puzzleText.includes(normalizedLetter);

            if (isCorrect) {
                // Check win
                if (state.currentPuzzle && checkWinCondition(state.currentPuzzle, newGuessed)) {
                    set({
                        guessedLetters: newGuessed,
                        status: 'WON',
                        turnTimeRemaining: TURN_TIME_LIMIT, // visual reset
                    });
                } else {
                    set({
                        guessedLetters: newGuessed,
                        turnTimeRemaining: TURN_TIME_LIMIT, // Reset turn timer on valid action
                    });
                }
            } else {
                // Strike
                const newStrikes = state.strikes + 1;
                if (newStrikes >= MAX_STRIKES) {
                    set({
                        guessedLetters: newGuessed,
                        strikes: newStrikes,
                        status: 'LOST',
                        turnTimeRemaining: TURN_TIME_LIMIT,
                    });
                } else {
                    set({
                        guessedLetters: newGuessed,
                        strikes: newStrikes,
                        turnTimeRemaining: TURN_TIME_LIMIT, // Spec says reset turn timer on valid input (guess)
                    });
                }
            }
        },

        useHint: () => {
            const state = get();
            if (state.status !== 'PLAYING' || state.hintsRemaining <= 0 || !state.currentPuzzle) return;

            const puzzleText = state.currentPuzzle.text.toUpperCase();

            // Find unrevealed letters (A-Z only)
            const availableLetters = Array.from(new Set(
                puzzleText.split('').filter(char =>
                    /[A-Z]/.test(char) && !state.guessedLetters.includes(char)
                )
            ));

            if (availableLetters.length === 0) return;

            // Pick random
            const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

            // Decrement hints and reset turn timer
            const newGuessed = [...state.guessedLetters, randomLetter];

            set({
                hintsRemaining: state.hintsRemaining - 1,
                guessedLetters: newGuessed,
                turnTimeRemaining: TURN_TIME_LIMIT
            });

            // Check win condition after hint
            if (checkWinCondition(state.currentPuzzle, newGuessed)) {
                set({ status: 'WON' });
            }
        },

        attemptSolve: (phrase: string) => {
            const state = get();
            if (state.status !== 'PLAYING' || !state.currentPuzzle) return;

            const normalizedInput = phrase.trim().toUpperCase();
            const normalizedTarget = state.currentPuzzle.text.toUpperCase();

            if (normalizedInput === normalizedTarget) {
                set({ status: 'WON', turnTimeRemaining: TURN_TIME_LIMIT });
            } else {
                const newStrikes = state.strikes + 1;
                if (newStrikes >= MAX_STRIKES) {
                    set({ strikes: newStrikes, status: 'LOST', turnTimeRemaining: TURN_TIME_LIMIT });
                } else {
                    set({ strikes: newStrikes, turnTimeRemaining: TURN_TIME_LIMIT });
                }
            }
        },

        tick: () => {
            const state = get();
            if (state.status !== 'PLAYING') return;

            // Decrement Global
            let newGlobal = state.globalTimeRemaining - 1;
            // Decrement Turn
            let newTurn = state.turnTimeRemaining - 1;
            let newStrikes = state.strikes;
            let newStatus: GameStatus = state.status;

            // Check Global Timer
            if (newGlobal <= 0) {
                newGlobal = 0;
                newStatus = 'LOST';
            }

            // Check Turn Timer (only if not already lost by global)
            if (newStatus === 'PLAYING') {
                if (newTurn <= 0) {
                    // Timeout penalty
                    newStrikes += 1;
                    newTurn = TURN_TIME_LIMIT; // Reset
                    if (newStrikes >= MAX_STRIKES) {
                        newStatus = 'LOST';
                    }
                }
            }

            set({
                globalTimeRemaining: newGlobal,
                turnTimeRemaining: newTurn,
                strikes: newStrikes,
                status: newStatus,
            });
        },

        pauseGame: () => {
            const state = get();
            if (state.status === 'PLAYING') {
                set({ status: 'PAUSED' });
            }
        },

        resumeGame: () => {
            const state = get();
            if (state.status === 'PAUSED') {
                set({ status: 'PLAYING' });
            }
        },

        resetGame: () => {
            set({ status: 'IDLE', currentPuzzle: null, guessedLetters: [], strikes: 0, globalTimeRemaining: GLOBAL_TIME_LIMIT });
        }
    },
}));

export const useGameActions = () => useGameStore((state) => state.actions);
