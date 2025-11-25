import React from 'react';
import { WorkoutState, TimerConfig, Phase } from '../types';
import { CircularProgress } from './CircularProgress';
import { Pause, Play, Square, RefreshCw, Flame, Wind } from 'lucide-react';

interface ActiveSessionProps {
  state: WorkoutState;
  config: TimerConfig;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  state,
  config,
  isPaused,
  onPause,
  onResume,
  onStop,
}) => {
  
  if (state.phase === Phase.COMPLETED) {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in bg-slate-900 w-full rounded-3xl border border-slate-800 p-4">
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-center">
                训练完成
            </h2>
            <div className="text-slate-400 text-xl text-center">
                <p>总计 {config.totalRounds} 轮</p>
                <p>优秀的耐力表现！</p>
            </div>
            <button
                onClick={onStop}
                className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl shadow-xl transition-all transform hover:scale-105 font-bold text-lg w-full md:w-auto justify-center"
            >
                <RefreshCw size={24} />
                再来一轮
            </button>
        </div>
    )
  }

  const isSprint = state.phase === Phase.SPRINT;

  // Uses h-[85dvh] for mobile viewport safety (address bar awareness)
  return (
    <div className={`relative w-full h-[85dvh] max-h-[800px] flex flex-col items-center justify-between rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out touch-none ${
        isSprint 
        ? 'bg-gradient-to-br from-red-950 via-slate-900 to-red-950 shadow-[0_0_50px_rgba(239,68,68,0.3)]' 
        : 'bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 shadow-[0_0_50px_rgba(6,182,212,0.2)]'
    }`}>
      
      {/* Dynamic Background Particles (CSS Radial Gradients) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isSprint ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)] animate-pulse-fast"></div>
      </div>
      <div className={`absolute inset-0 transition-opacity duration-1000 ${!isSprint ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)] animate-breathe"></div>
      </div>

      {/* Header Stats */}
      <div className="z-10 w-full flex justify-between items-start px-6 py-6 mt-safe">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ROUNDS</span>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white leading-none font-mono">
                    {state.currentRound}
                </span>
                <span className="text-xl font-bold text-slate-500 leading-none">
                    / {config.totalRounds}
                </span>
            </div>
        </div>
        
        <div className={`flex flex-col items-end transition-all duration-500 ${isSprint ? 'scale-110' : 'scale-100'}`}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CURRENT PHASE</span>
            {isSprint ? (
                <div className="flex items-center gap-2 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                    <Flame className="w-6 h-6 animate-pulse" fill="currentColor" />
                    <span className="text-2xl font-black italic tracking-wider">SPRINT</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                    <Wind className="w-6 h-6 animate-bounce" />
                    <span className="text-2xl font-black tracking-wider">RECOVER</span>
                </div>
            )}
        </div>
      </div>

      {/* Main Timer Visualization */}
      <div className="z-10 flex-grow flex flex-col items-center justify-center py-4 relative w-full">
        <div className={`transition-transform duration-500 ${isSprint ? 'scale-110' : 'scale-100'}`}>
            <CircularProgress
                timeLeft={state.timeLeft}
                totalTime={state.totalDuration}
                phase={state.phase}
                radius={140}
                stroke={isSprint ? 18 : 12}
            />
        </div>
        
        {/* Urgent Warning Text */}
        <div className="absolute bottom-12 w-full text-center h-12">
             {state.timeLeft <= 3 && state.timeLeft > 0 && (
                 <span className="text-5xl font-black text-white animate-shake inline-block drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                    SWITCH!
                 </span>
             )}
        </div>
      </div>

      {/* Controls */}
      <div className="z-10 w-full flex items-center justify-center gap-6 mb-12 mb-safe">
        {isPaused ? (
          <button
            onClick={onResume}
            className="group flex items-center justify-center w-20 h-20 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 border-4 border-green-600/30"
          >
            <Play size={32} fill="currentColor" className="ml-1" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="group flex items-center justify-center w-20 h-20 bg-slate-700/80 hover:bg-slate-600 text-white rounded-full backdrop-blur-md border border-slate-500/30 transition-all active:scale-95"
          >
            <Pause size={32} fill="currentColor" />
          </button>
        )}

        <button
          onClick={onStop}
          className="flex items-center justify-center w-14 h-14 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-full backdrop-blur-md border border-slate-700 hover:border-red-500/50 transition-all active:scale-95"
        >
          <Square size={20} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};