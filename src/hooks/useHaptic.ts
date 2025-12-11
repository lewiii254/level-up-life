import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface UseHapticOptions {
  enabled?: boolean;
}

export function useHaptic(options: UseHapticOptions = {}) {
  const { enabled = true } = options;

  const triggerHaptic = useCallback(
    (type: HapticType = 'medium') => {
      if (!enabled) return;

      // Check if the device supports haptic feedback
      if (!navigator.vibrate) return;

      const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 50,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50],
      };

      const pattern = patterns[type];
      
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern);
      } else {
        navigator.vibrate(pattern);
      }
    },
    [enabled]
  );

  return { triggerHaptic };
}
