import React, { useState } from 'react';
import { TimerConfig } from './types';
import { useWorkout } from './hooks/useWorkout';
import { ConfigForm } from './components/ConfigForm';
import { ActiveSession } from './components/ActiveSession';
import { Waves } from 'lucide-react';

const DEFAULT_CONFIG: TimerConfig = {
  sprintDuration: 30,
  recoverDuration: 90,
  totalRounds: 9,
};

export default function App() {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  
  const {
    state,
    isRunning,
    isPaused,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout
  } = useWorkout(config);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* App Title (only show when not running to reduce clutter) */}
      {!isRunning && (
        <header className="mb-8 text-center animate-fade-in-down">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-xl shadow-lg shadow-cyan-900/20">
              <Waves className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            划船节奏大师
          </h1>
          <p className="text-slate-500 mt-2 text-sm">间歇训练 · 声音导航 · 精准控时</p>
        </header>
      )}

      <main className="w-full max-w-lg">
        {!isRunning ? (
          <ConfigForm 
            config={config} 
            onChange={setConfig} 
            onStart={startWorkout} 
          />
        ) : (
          <ActiveSession
              state={state}
              config={config}
              isPaused={isPaused}
              onPause={pauseWorkout}
              onResume={resumeWorkout}
              onStop={stopWorkout}
          />
        )}
      </main>

      {/* Footer/Credit */}
      {!isRunning && (
         <footer className="mt-12 text-slate-700 text-xs">
            FitTimer &copy; {new Date().getFullYear()}
         </footer>
      )}
    </div>
  );
}