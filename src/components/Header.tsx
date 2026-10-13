import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Sparkles, Scissors, Smartphone } from 'lucide-react';
import { AppFeature } from '../types';

interface HeaderProps {
  currentFeature: AppFeature;
  onChangeFeature: (feature: AppFeature) => void;
  onLoadSample?: () => void;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentFeature,
  onChangeFeature,
  onLoadSample,
  isProcessing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#07090e]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo size="md" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent whitespace-nowrap">
              Clip<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Forgees</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Feature Quick Tabs in Header */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => onChangeFeature('splitter')}
            disabled={isProcessing}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 ${
              currentFeature === 'splitter'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Long Video</span> Splitter
          </button>

          <button
            type="button"
            onClick={() => onChangeFeature('tiktok')}
            disabled={isProcessing}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 relative ${
              currentFeature === 'tiktok'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-pink-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-pink-400" />
            <span>TikTok Short</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>
        </div>

        {/* Zone 3: Primary Action & Privacy Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="font-medium">100% In-Browser</span>
          </div>

          {onLoadSample && currentFeature === 'splitter' && (
            <button
              onClick={onLoadSample}
              disabled={isProcessing}
              className="px-3.5 py-1.5 text-xs font-semibold text-violet-200 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 hover:border-violet-400/50 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
              title="Generate a playable demo video instantly"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Load Demo Video</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
