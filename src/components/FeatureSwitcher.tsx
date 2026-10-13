import React from 'react';
import { AppFeature } from '../types';
import { Scissors, Smartphone, Sparkles } from 'lucide-react';

interface FeatureSwitcherProps {
  currentFeature: AppFeature;
  onChangeFeature: (feature: AppFeature) => void;
  isProcessing?: boolean;
}

export const FeatureSwitcher: React.FC<FeatureSwitcherProps> = ({
  currentFeature,
  onChangeFeature,
  isProcessing = false,
}) => {
  return (
    <div className="w-full flex items-center justify-center my-6">
      <div className="bg-[#0b0f19]/90 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1.5 backdrop-blur-xl shadow-2xl">
        {/* Tool A: Long Video Splitter */}
        <button
          type="button"
          onClick={() => onChangeFeature('splitter')}
          disabled={isProcessing}
          className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
            currentFeature === 'splitter'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40 ring-1 ring-violet-400/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Scissors className="w-4 h-4 shrink-0" />
          <span>Long Video Splitter</span>
        </button>

        {/* Tool B: TikTok Short Generator */}
        <button
          type="button"
          onClick={() => onChangeFeature('tiktok')}
          disabled={isProcessing}
          className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50 relative ${
            currentFeature === 'tiktok'
              ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white shadow-lg shadow-pink-900/40 ring-1 ring-pink-400/50'
              : 'text-slate-400 hover:text-pink-300 hover:bg-slate-800/50'
          }`}
        >
          <div className="relative">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span>TikTok Short Generator</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
            New
          </span>
        </button>
      </div>
    </div>
  );
};
