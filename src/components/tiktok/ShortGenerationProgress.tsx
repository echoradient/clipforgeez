import React from 'react';
import { Loader2, Smartphone, XCircle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { TikTokGenerationProgress } from '../../types';
import { formatDuration } from '../../utils/formatters';

interface ShortGenerationProgressProps {
  progress: TikTokGenerationProgress;
  onCancel: () => void;
}

export const ShortGenerationProgress: React.FC<ShortGenerationProgressProps> = ({
  progress,
  onCancel,
}) => {
  const {
    stage,
    stageName,
    percent,
    canCancel,
    estimatedDuration,
    layoutMode,
    resolution,
  } = progress;

  const stagesList = [
    { num: 1, name: 'Loading video engine' },
    { num: 2, name: 'Preparing vertical canvas' },
    {
      num: 3,
      name:
        layoutMode === 'smart_crop'
          ? 'Applying 9:16 Smart Crop'
          : layoutMode === 'blurred_bg'
          ? 'Rendering blurred background'
          : 'Applying solid background',
    },
    { num: 4, name: 'Encoding MP4 stream' },
    { num: 5, name: 'Finalizing download file' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-pink-500/40 shadow-2xl relative overflow-hidden">
      {/* Animated glowing gradient top border */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-pulse" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-pink-600/30 animate-pulse">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Generating TikTok Short
              </h3>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Stage {stage} of 5: <span className="text-pink-300 font-semibold">{stageName}</span>
            </p>
          </div>
        </div>

        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Generation</span>
          </button>
        )}
      </div>

      {/* Five-Stage Stepper visual */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {stagesList.map((st) => {
          const isDone = stage > st.num;
          const isCurrent = stage === st.num;

          return (
            <div key={st.num} className="flex flex-col gap-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-400'
                    : isCurrent
                    ? 'bg-gradient-to-r from-pink-500 to-cyan-400 animate-pulse'
                    : 'bg-slate-800'
                }`}
              />
              <span
                className={`text-[10px] leading-tight truncate hidden md:block ${
                  isCurrent ? 'text-pink-300 font-bold' : isDone ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {st.num}. {st.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Percentage Progress Track */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300">{stageName}</span>
          <span className="font-extrabold text-cyan-400 tabular-nums text-sm">
            {percent}%
          </span>
        </div>

        <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-300 shadow-md shadow-pink-500/30"
            style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
          />
        </div>
      </div>

      {/* Parameters Metadata Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0b0f19]/80 border border-slate-800/80 text-xs mb-4">
        <div>
          <span className="text-[10px] text-slate-500 block">Target Duration</span>
          <span className="font-mono font-bold text-white">
            {formatDuration(estimatedDuration)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Layout Mode</span>
          <span className="font-semibold text-purple-300 capitalize">
            {layoutMode.replace('_', ' ')}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Resolution</span>
          <span className="font-mono font-bold text-cyan-400">
            {resolution} (9:16)
          </span>
        </div>
      </div>

      {/* Privacy Guarantee Message */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Privacy Guaranteed:</strong> Your video is processed locally in your browser and is not permanently uploaded or stored.
        </span>
      </div>
    </div>
  );
};
