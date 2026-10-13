import React from 'react';
import { Download, CheckCircle2, RotateCcw, Edit3, Zap, BookOpen, Smartphone, HardDrive, Clock, Film } from 'lucide-react';
import { TikTokShortResult, VideoMetadata } from '../../types';
import { triggerDownload } from '../../utils/downloadHelper';
import { formatDuration, formatFileSize } from '../../utils/formatters';

interface TikTokResultCardProps {
  result: TikTokShortResult;
  metadata: VideoMetadata;
  onReset: () => void;
  onEditLayout: () => void;
  onQuickGenerate: (targetSec: number) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const TikTokResultCard: React.FC<TikTokResultCardProps> = ({
  result,
  metadata,
  onReset,
  onEditLayout,
  onQuickGenerate,
  onShowToast,
}) => {
  const handleDownload = () => {
    triggerDownload(result.blob, result.fileName);
    onShowToast('Download Started', `Downloading ${result.fileName}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-pink-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conversion Successful</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-mono">9:16 Vertical MP4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your TikTok Short Is Ready
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Generated vertical short from <span className="font-mono text-white">{metadata.name}</span>.
              Ready for immediate upload to TikTok, Instagram Reels, and YouTube Shorts.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:via-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 transition-all flex items-center gap-2.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <Download className="w-5 h-5 stroke-[2.2]" />
              <span>Download MP4</span>
            </button>

            <button
              type="button"
              onClick={onEditLayout}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>Edit Layout</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Create Another Short</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Showcase: Phone Video Player + Metadata & Quick Re-generators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Phone Player Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-[40px] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-2xl shadow-pink-950/40 ring-1 ring-white/10 flex flex-col justify-between">
            {/* Phone Island */}
            <div className="absolute top-4 inset-x-0 flex justify-center z-40 pointer-events-none">
              <div className="w-24 h-4 bg-black rounded-full border border-white/10 flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/20" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Video Player */}
            <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black flex items-center justify-center shadow-inner">
              <video
                src={result.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Phone Home Bar */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Column: File Details & Quick Versions */}
        <div className="lg:col-span-7 space-y-6">
          {/* File Metadata Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight">
              Output Specifications
            </h4>

            <div className="p-3 bg-[#07090e] border border-slate-800 rounded-xl font-mono text-xs text-pink-300 break-all">
              <span className="text-slate-500 select-none block mb-0.5 text-[10px] uppercase font-sans">
                Generated File Name
              </span>
              {result.fileName}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span>Duration</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  {formatDuration(result.duration)}
                </p>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Resolution</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  {result.resolution}
                </p>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Aspect Ratio</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  9:16 Vertical
                </p>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>File Size</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  {formatFileSize(result.fileSize)}
                </p>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Container</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  MP4 (H.264 / AAC)
                </p>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Layout Mode</span>
                </div>
                <p className="text-xs font-bold text-white capitalize">
                  {result.layoutMode.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Generate Alternate Durations */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight">
              Generate Alternate Durations
            </h4>
            <p className="text-xs text-slate-400">
              Need a shorter clip for TikTok Stories or a longer one for YouTube Shorts? Generate with 1 click:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onQuickGenerate(60)}
                className="p-3.5 rounded-xl border border-pink-500/30 bg-pink-950/20 hover:bg-pink-900/30 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-pink-400" />
                    Generate 1-Minute Version
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Quick 60s viral cut
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-pink-300">60s</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickGenerate(120)}
                className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    Generate 2-Minute Version
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Extended 120s tutorial cut
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300">120s</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
