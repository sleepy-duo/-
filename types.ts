export enum Phase {
  IDLE = 'IDLE',
  SPRINT = 'SPRINT',
  RECOVER = 'RECOVER',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

export interface TimerConfig {
  sprintDuration: number;
  recoverDuration: number;
  totalRounds: number;
}

export interface WorkoutState {
  phase: Phase;
  currentRound: number;
  timeLeft: number;
  totalDuration: number; // For progress bar calculation
}