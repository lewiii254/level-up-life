import { useCallback } from 'react';

type SoundType = 'xp' | 'levelUp' | 'missionComplete' | 'achievement';

interface UseSoundOptions {
  enabled?: boolean;
  volume?: number;
}

const soundFrequencies: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }[]> = {
  xp: [
    { frequency: 523.25, duration: 0.1, type: 'sine' }, // C5
    { frequency: 659.25, duration: 0.1, type: 'sine' }, // E5
  ],
  levelUp: [
    { frequency: 523.25, duration: 0.15, type: 'triangle' }, // C5
    { frequency: 659.25, duration: 0.15, type: 'triangle' }, // E5
    { frequency: 783.99, duration: 0.15, type: 'triangle' }, // G5
    { frequency: 1046.50, duration: 0.3, type: 'triangle' }, // C6
  ],
  missionComplete: [
    { frequency: 659.25, duration: 0.1, type: 'square' }, // E5
    { frequency: 783.99, duration: 0.1, type: 'square' }, // G5
    { frequency: 880.00, duration: 0.2, type: 'square' }, // A5
  ],
  achievement: [
    { frequency: 392.00, duration: 0.1, type: 'sawtooth' }, // G4
    { frequency: 523.25, duration: 0.1, type: 'sawtooth' }, // C5
    { frequency: 659.25, duration: 0.1, type: 'sawtooth' }, // E5
    { frequency: 783.99, duration: 0.3, type: 'sawtooth' }, // G5
  ],
};

export function useSound(options: UseSoundOptions = {}) {
  const { enabled = true, volume = 0.3 } = options;

  const playSound = useCallback(
    (type: SoundType) => {
      if (!enabled) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = volume;

      const notes = soundFrequencies[type];
      let currentTime = audioContext.currentTime;

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = note.type;
        oscillator.frequency.value = note.frequency;
        oscillator.connect(gainNode);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration + 0.05; // Small gap between notes
      });

      // Cleanup
      setTimeout(() => {
        audioContext.close();
      }, (currentTime - audioContext.currentTime + 0.5) * 1000);
    },
    [enabled, volume]
  );

  return { playSound };
}
