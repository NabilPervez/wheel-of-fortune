import { useRef, useEffect, useState } from 'react'
import { PuzzleBoard } from './components/PuzzleBoard'
import { HUD } from './components/HUD'
import { VirtualKeyboard } from './components/VirtualKeyboard'
import { useGameStore, useGameActions } from './store/useGameStore'
import { useSoundEffects } from './hooks/useSoundEffects'

function App() {
  const { status, currentPuzzle, guessedLetters, hintsRemaining, turnTimeRemaining } = useGameStore()
  const { startGame, tick, attemptSolve, useHint, startActiveGameplay } = useGameActions()
  const { playCorrect, playWrong, playWin, playLose, playCountdown, playGo, playTick } = useSoundEffects()

  // Refs to track previous values for sound triggers
  const prevGuessedLetters = useRef<string[]>([])
  const prevStatus = useRef(status)

  // Countdown State handled locally purely for visual/sound
  const [countdown, setCountdown] = useState<number | null>(null);

  // Init game
  useEffect(() => {
    startGame()
  }, [])

  // Handle STARTING state (Countdown)
  useEffect(() => {
    if (status === 'STARTING') {
      setCountdown(3);
      let count = 3;
      playCountdown(); // Initial beep

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          playCountdown();
        } else {
          setCountdown(null);
          playGo();
          startActiveGameplay();
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, playCountdown, playGo, startActiveGameplay]);

  // Timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (status === 'PLAYING') {
      interval = setInterval(() => {
        tick()
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [status, tick])

  // Status Change Sounds (Win/Lose)
  useEffect(() => {
    if (status === 'WON' && prevStatus.current !== 'WON') playWin();
    if (status === 'LOST' && prevStatus.current !== 'LOST') playLose();
    prevStatus.current = status;
  }, [status, playWin, playLose]);

  // Turn Timer Ticking Sound (Last 5 seconds)
  useEffect(() => {
    if (status === 'PLAYING' && turnTimeRemaining <= 5 && turnTimeRemaining > 0) {
      playTick();
    }
  }, [turnTimeRemaining, status, playTick]);

  // Guess Sounds (Letters)
  useEffect(() => {
    if (!currentPuzzle) return;

    // Skip logic if we just mounted or reset (simple check: if prev is empty and current has 3+)
    // This might skip the first manual guess if we are incredibly fast, but prevents the "startup Ding"
    if (prevGuessedLetters.current.length === 0 && guessedLetters.length >= 3) {
      prevGuessedLetters.current = guessedLetters;
      return;
    }

    const currentLen = guessedLetters.length;
    const prevLen = prevGuessedLetters.current.length;

    if (currentLen > prevLen) {
      // A new letter was added
      const newLetter = guessedLetters[guessedLetters.length - 1];
      // Check if it's in the puzzle
      if (currentPuzzle.text.toUpperCase().includes(newLetter)) {
        playCorrect();
      } else {
        playWrong();
      }
    }
    prevGuessedLetters.current = guessedLetters;
  }, [guessedLetters, currentPuzzle, playCorrect, playWrong]);


  const handleVisibilityChange = () => {
    if (document.hidden && status === 'PLAYING') {
      useGameStore.getState().actions.pauseGame();
    }
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);


  const handleSolve = () => {
    // Simple prompt for now as per MVP
    const guess = prompt("Enter your solution:");
    if (guess) {
      attemptSolve(guess);
    }
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#1a1a1a] text-white overflow-hidden relative">

      {/* Countdown Overlay */}
      {status === 'STARTING' && countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-9xl font-black text-white animate-ping">
            {countdown}
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Top 30% - Puzzle Board */}
      <section className="h-[30%] flex-none flex items-center justify-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative z-10 pt-safe-top">
        <PuzzleBoard />
      </section>

      {/* Middle 25% - HUD */}
      <section className="h-[25%] flex-none flex flex-col justify-center items-center relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
        <HUD />
      </section>

      {/* Bottom - Input (Rest of space) */}
      <section className="flex-1 min-h-0 bg-neutral-900 border-t border-white/10 flex flex-col pb-safe-bottom z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">

        {/* Controls Bar (Hint + Solve + New Game) */}
        <div className="w-full flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">

          <div className="flex-1 flex justify-start">
            {(status === 'WON' || status === 'LOST') && (
              <button
                onClick={() => startGame()}
                className="text-xs font-bold text-white uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-colors"
              >
                New Game
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={useHint}
              disabled={status !== 'PLAYING' || hintsRemaining <= 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-blue-200/50 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm disabled:shadow-none transform active:scale-95"
            >
              <span>Hint</span>
              <span className="bg-white/20 px-1.5 rounded text-[10px]">{hintsRemaining}</span>
            </button>

            <button
              onClick={handleSolve}
              disabled={status !== 'PLAYING'}
              className="text-xs font-bold text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-yellow-300 uppercase tracking-wider border border-yellow-500/30 px-3 py-1.5 rounded hover:bg-yellow-500/10 transition-colors shadow-sm"
            >
              Solve
            </button>
          </div>
        </div>

        <VirtualKeyboard />
      </section>

    </div>
  )
}

export default App
