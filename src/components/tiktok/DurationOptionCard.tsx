import React from 'react';
import { Clock, Zap, BookOpen, Sliders, PlayCircle } from 'lucide-react';
import { TikTokDurationPreset, TikTokSettings, VideoMetadata } from '../../types';
import { formatDuration, formatTimecode } from '../../utils/formatters';

interface DurationOptionCardProps {
  metadata: VideoMetadata;
  settings: TikTokSettings;
  onChangeSettings: (updates: Partial<TikTokSettings>) => void;
  isProcessing?: boolean;
}

export const DurationOptionCard: React.FC<DurationOptionCardProps> = ({
  metadata,
  settings,
  onChangeSettings,
  isProcessing = false,
}) => {
  const isVideoShorterThan60 = metadata.duration < 60;
  const isVideoShorterThan120 = metadata.duration < 120;

  const handleSelectPreset = (preset: TikTokDurationPreset) => {
    let target = 60;
    if (preset === '120s') target = 120;
    if (preset === 'custom') target = Math.min(settings.targetDuration, 120);

    // Clamp to video duration if video is shorter
    const clampedTarget = Math.min(target, metadata.duration);

    // Also adjust start time if start + target exceeds video duration
    let start = settings.startTime;
    if (start + clampedTarget > metadata.duration) {
      start = Math.max(0, metadata.duration - clampedTarget);
    }

    onChangeSettings({
      durationPreset: preset,
      targetDuration: clampedTarget,
      startTime: start,
    });
  };

  const handleCustomDurationChange = (secs: number) => {
    const clamped = Math.max(5, Math.min(120, Math.min(secs, metadata.duration)));
    let start = settings.startTime;
    if (start + clamped > metadata.duration) {
      start = Math.max(0, metadata.duration - clamped);
    }
    onChangeSettings({
      targetDuration: clamped,
      startTime: start,
    });
  };

  const handleStartTimeChange = (start: number) => {
    const maxStart = Math.max(0, metadata.duration - settings.targetDuration);
    const clampedStart = Math.max(0, Math.min(start, maxStart));
    onChangeSettings({
      startTime: clampedStart,
    });
  };

  const maxPossibleStart = Math.max(0, metadata.duration - settings.targetDuration);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            How long should your TikTok short be?
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
          {formatDuration(settings.targetDuration)} Selected
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Optimized for TikTok, Instagram Reels, and YouTube Shorts algorithms. Maximum duration is 2 minutes.
      </p>

      {/* Two Large Duration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
        {/* Card A: 1 Minute Short */}
        <button
          type="button"
          onClick={() => handleSelectPreset('60s')}
          disabled={isProcessing}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative ${
            settings.durationPreset === '60s'
              ? 'bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-pink-500 shadow-lg shadow-pink-900/30 ring-1 ring-pink-500'
              : 'bg-[#0b0f19]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1424]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Quick Short
            </span>
            <Zap className="w-4 h-4 text-pink-400" />
          </div>

          <h4 className="text-base font-bold text-white mt-1">1 Minute Short</h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {isVideoShorterThan60
              ? `Video is ${formatDuration(metadata.duration)} (will use full video)`
              : 'Recommended for fast, engaging viral content'}
          </p>

          <div className="mt-3 text-xs font-mono font-bold text-pink-300">
            60 seconds max
          </div>
        </button>

        {/* Card B: 2 Minute Short */}
        <button
          type="button"
          onClick={() => handleSelectPreset('120s')}
          disabled={isProcessing}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative ${
            settings.durationPreset === '120s'
              ? 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border-purple-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500'
              : 'bg-[#0b0f19]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1424]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Extended Short
            </span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>

          <h4 className="text-base font-bold text-white mt-1">2 Minute Short</h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {isVideoShorterThan120
              ? `Video is ${formatDuration(metadata.duration)} (will use full video)`
              : 'Recommended for tutorials, stories, and deep dives'}
          </p>

          <div className="mt-3 text-xs font-mono font-bold text-purple-300">
            120 seconds max
          </div>
        </button>
      </div>

      {/* Custom Duration Section */}
      <div
        className={`rounded-xl border p-4 mb-4 transition-all ${
          settings.durationPreset === 'custom'
            ? 'bg-pink-600/10 border-pink-500/50 ring-1 ring-pink-500/30'
            : 'bg-[#0b0f19]/50 border-slate-800/70 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <label
            onClick={() => handleSelectPreset('custom')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="tt-duration-type"
              checked={settings.durationPreset === 'custom'}
              onChange={() => handleSelectPreset('custom')}
              className="w-4 h-4 text-pink-600 accent-pink-600 cursor-pointer"
            />
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Custom Duration (up to 2 min)
            </span>
          </label>

          <span className="text-xs font-mono text-cyan-400 font-bold">
            {settings.targetDuration}s
          </span>
        </div>

        {settings.durationPreset === 'custom' && (
          <div className="pt-2">
            <input
              type="range"
              min={5}
              max={Math.min(120, Math.round(metadata.duration))}
              step={1}
              value={settings.targetDuration}
              onChange={(e) => handleCustomDurationChange(parseInt(e.target.value, 10))}
              disabled={isProcessing}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
              <span>5s</span>
              <span>30s</span>
              <span>60s (1m)</span>
              <span>{Math.min(120, Math.round(metadata.duration))}s max</span>
            </div>
          </div>
        )}
      </div>

      {/* Start Time Section: Beginning vs Custom Start Time */}
      <div className="bg-[#0b0f19]/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Where should the short begin?
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            type="button"
            onClick={() => onChangeSettings({ startMode: 'beginning', startTime: 0 })}
            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
              settings.startMode === 'beginning'
                ? 'bg-pink-600/20 border-pink-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Start from beginning (00:00)
          </button>

          <button
            type="button"
            onClick={() => onChangeSettings({ startMode: 'custom' })}
            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
              settings.startMode === 'custom'
                ? 'bg-pink-600/20 border-pink-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Custom start time
          </button>
        </div>

        {settings.startMode === 'custom' && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Start at:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {formatTimecode(settings.startTime, true)} (to{' '}
                {formatTimecode(settings.startTime + settings.targetDuration, true)})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPossibleStart}
              step={0.5}
              value={settings.startTime}
              onChange={(e) => handleStartTimeChange(parseFloat(e.target.value))}
              disabled={isProcessing || maxPossibleStart <= 0}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {maxPossibleStart <= 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                Video duration matches selected short length.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
