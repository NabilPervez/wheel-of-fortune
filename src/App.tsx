import { useEffect } from 'react'
import { PuzzleBoard } from './components/PuzzleBoard'
import { HUD } from './components/HUD'
import { VirtualKeyboard } from './components/VirtualKeyboard'
import { useGameStore, useGameActions } from './store/useGameStore'

function App() {
  const { status } = useGameStore()
  const { startGame, tick, attemptSolve } = useGameActions()

  // Init game
  useEffect(() => {
    startGame()
  }, [])

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

  // Handle visibility change (Pause on minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'PLAYING') {
        // Optionally pause, but spec says "Timer logic... prevent throttling... if user minimizes... pause the game".
        // Actually if we pause, we don't need a worker!
        // So pausing is the solution to throttling.
        // But the user said "must use RAF... OR pause".
        // Wait, "Timer logic must use... to prevent throttling... (though gameplay is primarily active). Note: If the user minimizes the app, pause the game."
        // This implies if I pause, I don't need the worker for background running.
        // I'll implementing pausing.
        useGameStore.getState().actions.pauseGame();
      } else if (!document.hidden && status === 'PAUSED') {
        // Optionally resume or let user resume manually.
        // Usually games pause and show a "Resume" button.
        // But for now I'll just pause it.
      }
    };

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

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Top 35% - Puzzle Board */}
      <section className="h-[35%] flex-none flex items-center justify-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative z-10 pt-safe-top">
        <PuzzleBoard />
      </section>

      {/* Middle 30% - HUD */}
      <section className="h-[30%] flex-none flex flex-col justify-center items-center relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
        <HUD />
      </section>

      {/* Bottom - Input (Rest of space) */}
      <section className="flex-1 min-h-0 bg-neutral-900 border-t border-white/10 flex flex-col pb-safe-bottom z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="w-full flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">
            WordRush Survial v1.0
          </div>
          <div className="flex gap-2">
            {(status === 'WON' || status === 'LOST') && (
              <button
                onClick={() => startGame()}
                className="text-xs font-bold text-white uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-colors"
              >
                New Game
              </button>
            )}
            <button
              onClick={handleSolve}
              disabled={status !== 'PLAYING'}
              className="text-xs font-bold text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-yellow-300 uppercase tracking-wider border border-yellow-500/30 px-3 py-1.5 rounded hover:bg-yellow-500/10 transition-colors shadow-[0_0_10px_rgba(234,179,8,0.2)]"
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
