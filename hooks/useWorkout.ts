import { useState, useEffect, useRef, useCallback } from 'react';
import { Phase, TimerConfig, WorkoutState } from '../types';
import { audioService } from '../utils/audio';

export const useWorkout = (config: TimerConfig) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [state, setState] = useState<WorkoutState>({
    phase: Phase.IDLE,
    currentRound: 1,
    timeLeft: config.recoverDuration,
    totalDuration: config.recoverDuration,
  });

  const timerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null); // Keep track of wake lock

  const playSound = useCallback((timeLeft: number) => {
    // 3, 2, 1 countdown
    if (timeLeft <= 3 && timeLeft > 0) {
      audioService.playCountdown();
    }
  }, []);

  // --- Wake Lock Logic ---
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        // console.log('Wake Lock active');
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        // console.log('Wake Lock released');
      } catch (err) {
        console.warn('Wake Lock release failed:', err);
      }
    }
  };

  // Re-acquire lock if visibility changes (e.g. user switches tabs and comes back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused]);
  // -----------------------

  const start = useCallback(async () => {
    await audioService.init();
    
    // Request Wake Lock
    await requestWakeLock();

    // Start with RECOVER phase (Warm up / Free rowing)
    setState({
      phase: Phase.RECOVER,
      currentRound: 1,
      timeLeft: config.recoverDuration,
      totalDuration: config.recoverDuration,
    });
    // Start Recover Ambient & Sound
    audioService.playSwitchPhase(false);
    audioService.startAmbient(false);
  }, [config]);
  
  const tick = useCallback(() => {
    setState(prev => {
      const nextTime = prev.timeLeft - 1;

      playSound(nextTime); 

      if (nextTime < 0) {
        // Switch Phase Logic
        if (prev.phase === Phase.RECOVER) {
          // Recover Finished -> Start SPRINT
          audioService.playSwitchPhase(true); 
          audioService.startAmbient(true); // Switch to tension drone
          
          return {
            ...prev,
            phase: Phase.SPRINT,
            timeLeft: config.sprintDuration,
            totalDuration: config.sprintDuration,
          };
        } else if (prev.phase === Phase.SPRINT) {
          // Sprint Finished
          if (prev.currentRound >= config.totalRounds) {
            // Done
            setIsRunning(false);
            audioService.playComplete();
            audioService.stopAmbient();
            releaseWakeLock(); // Release lock
            return { ...prev, phase: Phase.COMPLETED, timeLeft: 0 };
          } else {
            // Back to RECOVER
            audioService.playSwitchPhase(false);
            audioService.startAmbient(false); // Switch to calm drone
            
            return {
              ...prev,
              phase: Phase.RECOVER,
              currentRound: prev.currentRound + 1,
              timeLeft: config.recoverDuration,
              totalDuration: config.recoverDuration,
            };
          }
        }
      }

      return { ...prev, timeLeft: nextTime };
    });
  }, [config, playSound]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(tick, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, tick]);

  useEffect(() => {
      if (isPaused) {
          audioService.stopAmbient();
          releaseWakeLock(); // Save battery if paused for long
      } else if (isRunning && state.phase !== Phase.IDLE && state.phase !== Phase.COMPLETED) {
          // Resume ambient matching the phase
          audioService.startAmbient(state.phase === Phase.SPRINT);
          requestWakeLock(); // Re-acquire lock on resume
      }
  }, [isPaused, isRunning]);

  const startWorkout = () => {
    setIsRunning(true);
    setIsPaused(false);
    start(); 
  };

  const pauseWorkout = () => {
    setIsPaused(true);
  };

  const resumeWorkout = () => {
    setIsPaused(false);
  };

  const stopWorkout = () => {
    setIsRunning(false);
    setIsPaused(false);
    audioService.stopAmbient();
    releaseWakeLock();
    setState({
      phase: Phase.IDLE,
      currentRound: 1,
      timeLeft: config.recoverDuration,
      totalDuration: config.recoverDuration,
    });
  };

  return {
    state,
    isRunning,
    isPaused,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout
  };
};