import React from 'react';
import { Phase } from '../types';

interface CircularProgressProps {
  timeLeft: number;
  totalTime: number;
  phase: Phase;
  radius?: number;
  stroke?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  timeLeft,
  totalTime,
  phase,
  radius = 120,
  stroke = 12
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const strokeDashoffset = circumference - progress * circumference;

  let colorClass = 'stroke-slate-700';
  let dropShadowClass = '';
  
  if (phase === Phase.SPRINT) {
      colorClass = 'stroke-red-500';
      dropShadowClass = 'drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]';
  } else if (phase === Phase.RECOVER) {
      colorClass = 'stroke-cyan-400';
      dropShadowClass = 'drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
  } else if (phase === Phase.COMPLETED) {
      colorClass = 'stroke-green-500';
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className={`transform -rotate-90 transition-all duration-300 ${dropShadowClass}`}
      >
        {/* Background Circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-800/50"
        />
        {/* Progress Circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${colorClass} transition-colors duration-500`}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-8xl font-black font-mono tracking-tighter tabular-nums text-white drop-shadow-lg ${phase === Phase.SPRINT ? 'animate-pulse' : ''}`}>
          {timeLeft}
        </span>
        <span className="text-lg uppercase tracking-[0.2em] font-bold mt-2 text-slate-400">
            {phase === Phase.SPRINT && 'GO GO GO!'}
            {phase === Phase.RECOVER && 'BREATHE'}
        </span>
      </div>
    </div>
  );
};