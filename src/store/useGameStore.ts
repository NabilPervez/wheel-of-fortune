import { create } from 'zustand';
import puzzlesData from '../data/puzzles.json';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'WON' | 'LOST';

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

    actions: {
        startGame: () => void;
        guessLetter: (letter: string) => void;
        attemptSolve: (phrase: string) => void;
        tick: () => void;
        pauseGame: () => void;
        resumeGame: () => void;
        resetGame: () => void;
    };
}

const GLOBAL_TIME_LIMIT = 60;
const TURN_TIME_LIMIT = 10;
const MAX_STRIKES = 3;

// Helper to check if won
const checkWinCondition = (puzzle: Puzzle, guessed: string[]) => {
    const normalizedText = puzzle.text.toUpperCase();
    // We only care about letters A-Z needed to be guessed
    // Spaces are ignored in check
    for (const char of normalizedText) {
        if (/[A-Z]/.test(char) && !guessed.includes(char)) {
            return false; // Found a letter not guessed yet
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

    actions: {
        startGame: () => {
            // Pick random puzzle
            const randomPuzzle = puzzlesData[Math.floor(Math.random() * puzzlesData.length)];

            set({
                status: 'PLAYING',
                currentPuzzle: randomPuzzle,
                guessedLetters: [],
                strikes: 0,
                globalTimeRemaining: GLOBAL_TIME_LIMIT,
                turnTimeRemaining: TURN_TIME_LIMIT,
            });
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
