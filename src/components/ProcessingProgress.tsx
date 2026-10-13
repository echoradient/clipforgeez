import React from 'react';
import { Loader2, Scissors, XCircle, ShieldCheck } from 'lucide-react';
import { SplitProgress } from '../types';

interface ProcessingProgressProps {
  progress: SplitProgress;
  onCancel: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  onCancel,
}) => {
  const { currentClip, totalClips, percent, statusText, canCancel } = progress;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-violet-500/30 shadow-2xl relative overflow-hidden">
      {/* Animated subtle ambient top glow line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-400 to-indigo-600 animate-pulse" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 animate-pulse">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {currentClip > 0
                  ? `Processing Clip ${currentClip} of ${totalClips}`
                  : 'Preparing Video Engine...'}
              </h3>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Your video is processed locally in your browser.
            </p>
          </div>
        </div>

        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Splitting</span>
          </button>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 truncate max-w-xs sm:max-w-md">
            {statusText || 'Working on video segments...'}
          </span>
          <span className="font-bold text-cyan-400 tabular-nums text-sm">
            {percent}%
          </span>
        </div>

        {/* Glowing Progress Track */}
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-300 shadow-md shadow-cyan-500/20"
            style={{ width: `${Math.max(3, Math.min(100, percent))}%` }}
          />
        </div>
      </div>

      {/* Processing Subtext & Local guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Lossless local stream cutting enabled</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Please keep this tab open while processing completes
        </span>
      </div>
    </div>
  );
};
