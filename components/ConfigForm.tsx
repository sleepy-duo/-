import React from 'react';
import { TimerConfig } from '../types';
import { Settings, Timer, RotateCcw, Wind } from 'lucide-react';

interface ConfigFormProps {
  config: TimerConfig;
  onChange: (newConfig: TimerConfig) => void;
  onStart: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ config, onChange, onStart }) => {
  const handleChange = (key: keyof TimerConfig, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onChange({ ...config, [key]: num });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
      <div className="flex items-center gap-3 mb-8 text-slate-100">
        <Settings className="w-6 h-6 text-recover" />
        <h2 className="text-2xl font-bold">训练设置</h2>
      </div>

      <div className="space-y-6">
        {/* Recover Input (Moved to First) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wider">
            <Wind className="w-4 h-4 text-recover" />
            自由/恢复划船 (秒)
          </label>
          <input
            type="number"
            value={config.recoverDuration}
            onChange={(e) => handleChange('recoverDuration', e.target.value)}
            className="w-full bg-slate-800 text-white text-2xl font-bold p-4 rounded-xl border-2 border-transparent focus:border-recover focus:outline-none transition-colors text-center"
          />
        </div>

        {/* Sprint Input (Moved to Second) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wider">
            <Timer className="w-4 h-4 text-sprint" />
            快速划船 (秒)
          </label>
          <input
            type="number"
            value={config.sprintDuration}
            onChange={(e) => handleChange('sprintDuration', e.target.value)}
            className="w-full bg-slate-800 text-white text-2xl font-bold p-4 rounded-xl border-2 border-transparent focus:border-sprint focus:outline-none transition-colors text-center"
          />
        </div>

        {/* Rounds Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wider">
            <RotateCcw className="w-4 h-4 text-slate-200" />
            总轮次
          </label>
          <input
            type="number"
            value={config.totalRounds}
            onChange={(e) => handleChange('totalRounds', e.target.value)}
            className="w-full bg-slate-800 text-white text-2xl font-bold p-4 rounded-xl border-2 border-transparent focus:border-slate-500 focus:outline-none transition-colors text-center"
          />
        </div>

        <button
          onClick={onStart}
          className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xl font-bold py-5 rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          开始训练
        </button>
      </div>
    </div>
  );
};