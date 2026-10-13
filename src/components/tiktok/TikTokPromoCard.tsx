import React from 'react';
import { Smartphone, Sparkles, ArrowRight, Video, Flame } from 'lucide-react';

interface TikTokPromoCardProps {
  onSelect: () => void;
}

export const TikTokPromoCard: React.FC<TikTokPromoCardProps> = ({ onSelect }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#170c24] via-[#0f1128] to-[#0a1829] border border-pink-500/30 hover:border-pink-500/60 shadow-2xl shadow-pink-950/30 transition-all duration-300 group">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            <span>New Feature Launch</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-mono">1m & 2m Formats</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            TikTok Short Generator
          </h3>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Transform horizontal videos into engaging vertical short videos for TikTok, Reels, and Shorts.
            Smart crop subjects or use cinematic blurred backgrounds with safe-zone guides.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-pink-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              9:16 Vertical Export
            </span>
            <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Smart Crop / Blurred Background
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              100% In-Browser Privacy
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onSelect}
            className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:via-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group-hover:scale-[1.02] active:scale-[0.99]"
          >
            <Smartphone className="w-5 h-5" />
            <span>Create TikTok Short</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
