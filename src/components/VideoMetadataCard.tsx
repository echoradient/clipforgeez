import React from 'react';
import { Film, Clock, HardDrive, Monitor, RefreshCw } from 'lucide-react';
import { VideoMetadata } from '../types';
import { formatDuration, formatFileSize } from '../utils/formatters';

interface VideoMetadataCardProps {
  metadata: VideoMetadata;
  onReset: () => void;
  isProcessing?: boolean;
}

export const VideoMetadataCard: React.FC<VideoMetadataCardProps> = ({
  metadata,
  onReset,
  isProcessing = false,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4
              className="text-base font-bold text-white truncate max-w-sm sm:max-w-md"
              title={metadata.name}
            >
              {metadata.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="font-mono text-cyan-400 font-semibold">{metadata.format}</span>
              <span aria-hidden="true">·</span>
              <span>Ready for splitting</span>
            </div>
          </div>
        </div>

        <button
          onClick={onReset}
          disabled={isProcessing}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Change Video</span>
        </button>
      </div>

      {/* Metadata Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <div className="bg-[#0b0f19]/60 border border-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>Duration</span>
          </div>
          <div className="text-sm font-bold text-white font-mono tabular-nums">
            {formatDuration(metadata.duration)}
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 border border-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>File Size</span>
          </div>
          <div className="text-sm font-bold text-white font-mono tabular-nums">
            {formatFileSize(metadata.size)}
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 border border-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            <span>Resolution</span>
          </div>
          <div className="text-sm font-bold text-white font-mono tabular-nums">
            {metadata.width} × {metadata.height}
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 border border-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span>Container</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {metadata.format}
          </div>
        </div>
      </div>
    </div>
  );
};
