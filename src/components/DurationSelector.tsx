import React from 'react';
import { Clock, Sliders, AlertCircle, Sparkles } from 'lucide-react';
import { PresetDuration, VideoMetadata } from '../types';
import { formatDuration } from '../utils/formatters';

interface DurationSelectorProps {
  metadata: VideoMetadata;
  selectedPreset: PresetDuration;
  onSelectPreset: (preset: PresetDuration) => void;
  customMinutes: string;
  customSeconds: string;
  onChangeCustomMinutes: (val: string) => void;
  onChangeCustomSeconds: (val: string) => void;
  effectiveSegmentSeconds: number;
  totalClips: number;
  error?: string | null;
  isProcessing?: boolean;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  metadata,
  selectedPreset,
  onSelectPreset,
  customMinutes,
  customSeconds,
  onChangeCustomMinutes,
  onChangeCustomSeconds,
  effectiveSegmentSeconds,
  totalClips,
  error,
  isProcessing = false,
}) => {
  const presets: { id: PresetDuration; label: string; sub: string; seconds: number }[] = [
    { id: '5m', label: '5 minutes', sub: 'Short clips & shorts', seconds: 300 },
    { id: '10m', label: '10 minutes', sub: 'Standard episodes', seconds: 600 },
    { id: '15m', label: '15 minutes', sub: 'Extended sections', seconds: 900 },
    { id: '30m', label: '30 minutes', sub: 'Long deep dives', seconds: 1800 },
  ];

  // If the video duration is under 5 minutes (e.g. testing or short sample video),
  // offer quick test buttons so the user can easily split a 1m or 2m video!
  const isShortVideo = metadata.duration < 300;

  // Breakdown detail text
  const fullClipsCount = Math.floor(metadata.duration / effectiveSegmentSeconds);
  const remainderSecs = Math.round(metadata.duration % effectiveSegmentSeconds);

  let breakdownDetail = '';
  if (totalClips > 0 && effectiveSegmentSeconds > 0) {
    if (remainderSecs > 0 && fullClipsCount > 0) {
      breakdownDetail = ` (${fullClipsCount} ${
        fullClipsCount === 1 ? 'clip' : 'clips'
      } of ${formatDuration(effectiveSegmentSeconds)} + 1 final clip of ${formatDuration(remainderSecs)})`;
    } else if (fullClipsCount > 0) {
      breakdownDetail = ` (all ${totalClips} clips of ${formatDuration(effectiveSegmentSeconds)})`;
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          How long should each clip be?
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Choose a preset or enter a custom duration. ClipForgees will automatically calculate each segment with clean timestamps.
      </p>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {presets.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          const isTooLong = preset.seconds >= metadata.duration;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              disabled={isProcessing}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-violet-600/20 border-violet-500 shadow-lg shadow-violet-900/30 ring-1 ring-violet-500'
                  : 'bg-[#0b0f19]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1424]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-bold ${
                    isSelected ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {preset.label}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {isTooLong ? `Video is shorter (${formatDuration(metadata.duration)})` : preset.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Test options if video is short */}
      {isShortVideo && (
        <div className="mb-4 p-3 bg-violet-950/20 border border-violet-800/30 rounded-xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Short test video detected. Quick test presets:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectPreset('custom');
                onChangeCustomMinutes('0');
                onChangeCustomSeconds('15');
              }}
              className="px-2.5 py-1 text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 rounded-md border border-violet-500/40 transition-colors cursor-pointer"
            >
              15 seconds
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectPreset('custom');
                onChangeCustomMinutes('0');
                onChangeCustomSeconds('30');
              }}
              className="px-2.5 py-1 text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 rounded-md border border-violet-500/40 transition-colors cursor-pointer"
            >
              30 seconds
            </button>
          </div>
        </div>
      )}

      {/* Custom Duration Toggle & Inputs */}
      <div
        className={`rounded-xl border p-4 transition-all ${
          selectedPreset === 'custom'
            ? 'bg-violet-600/10 border-violet-500/50 ring-1 ring-violet-500/30'
            : 'bg-[#0b0f19]/50 border-slate-800/70 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <label
            onClick={() => onSelectPreset('custom')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="duration-type"
              checked={selectedPreset === 'custom'}
              onChange={() => onSelectPreset('custom')}
              className="w-4 h-4 text-violet-600 accent-violet-600 cursor-pointer"
            />
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Custom duration
            </span>
          </label>
          <span className="text-xs text-slate-400">Enter minutes & seconds</span>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Minutes
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="600"
                value={customMinutes}
                onChange={(e) => {
                  onSelectPreset('custom');
                  onChangeCustomMinutes(e.target.value);
                }}
                disabled={isProcessing}
                placeholder="0"
                className="w-full bg-[#07090e] border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 disabled:opacity-50"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                min
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Seconds
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => {
                  onSelectPreset('custom');
                  onChangeCustomSeconds(e.target.value);
                }}
                disabled={isProcessing}
                placeholder="0"
                className="w-full bg-[#07090e] border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 disabled:opacity-50"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                sec
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Dynamic Estimation Banner matching the required example */}
      {totalClips > 0 && effectiveSegmentSeconds > 0 && !error && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-cyan-950/40 border border-violet-500/20 text-xs sm:text-sm text-slate-200 flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="leading-relaxed">
            <p>
              If your video is{' '}
              <strong className="text-white font-semibold">
                {formatDuration(metadata.duration)}
              </strong>{' '}
              long and you choose{' '}
              <strong className="text-cyan-400 font-semibold">
                {formatDuration(effectiveSegmentSeconds)}
              </strong>{' '}
              clips, ClipForgees will create{' '}
              <strong className="text-violet-300 font-bold">
                {totalClips} {totalClips === 1 ? 'clip' : 'clips'}
              </strong>
              {breakdownDetail}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
