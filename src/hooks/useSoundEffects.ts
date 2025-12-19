import { useRef, useEffect, useCallback } from 'react';

// Using Web Audio API to avoid external assets
export const useSoundEffects = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext();
        }
    }, []);

    const playTone = useCallback((frequency: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, volume: number = 0.1) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio play error", e);
        }
    }, []);

    const playCorrect = useCallback(() => {
        // Ding sound (high pitch sine)
        playTone(800, 'sine', 0.1, 0.2);
        setTimeout(() => playTone(1200, 'sine', 0.2, 0.2), 50);
    }, [playTone]);

    const playWrong = useCallback(() => {
        // Buzzer (low saw)
        playTone(150, 'sawtooth', 0.3, 0.2);
    }, [playTone]);

    const playWin = useCallback(() => {
        if (!audioContextRef.current) return;
        // Arpeggio
        [400, 500, 600, 800].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 'sine', 0.2, 0.2), i * 100);
        });
    }, [playTone]);

    const playLose = useCallback(() => {
        // Descending tone
        playTone(300, 'triangle', 0.5, 0.2);
        setTimeout(() => playTone(200, 'triangle', 0.5, 0.2), 400);
    }, [playTone]);

    return { playCorrect, playWrong, playWin, playLose };
};
