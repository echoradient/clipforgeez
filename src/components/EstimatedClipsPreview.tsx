import React from 'react';
import { Scissors, ListFilter, ShieldCheck } from 'lucide-react';
import { VideoMetadata } from '../types';
import { formatDuration, formatTimecode, generatePartFilename } from '../utils/formatters';

interface EstimatedClipsPreviewProps {
  metadata: VideoMetadata;
  segments: { startTime: number; endTime: number; duration: number }[];
  onStartSplit: () => void;
  isProcessing: boolean;
  isValidDuration: boolean;
}

export const EstimatedClipsPreview: React.FC<EstimatedClipsPreviewProps> = ({
  metadata,
  segments,
  onStartSplit,
  isProcessing,
  isValidDuration,
}) => {
  const totalClips = segments.length;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <h4 className="text-base font-bold text-white tracking-tight">
              Estimated Output Clips
            </h4>
          </div>
          <span className="text-xs font-mono font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-md">
            {totalClips} {totalClips === 1 ? 'Clip' : 'Clips'} Planned
          </span>
        </div>

        {/* Scrollable list of estimated segments */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {segments.map((seg, idx) => {
            const clipNum = idx + 1;
            const fileName = generatePartFilename(metadata.name, clipNum);
            const isLast = idx === segments.length - 1;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19]/70 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                    {clipNum}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-slate-200 truncate max-w-[180px] sm:max-w-[220px]">
                      {fileName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {formatTimecode(seg.startTime, true)} → {formatTimecode(seg.endTime, true)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-semibold text-cyan-400">
                    {formatDuration(seg.duration)}
                  </span>
                  {isLast && seg.duration < segments[0]?.duration && (
                    <span className="block text-[10px] text-amber-400">Final segment</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Split Button & Privacy note */}
      <div className="pt-6 mt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onStartSplit}
          disabled={isProcessing || !isValidDuration || totalClips === 0}
          className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-base rounded-xl shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
        >
          <Scissors className="w-5 h-5 stroke-[2.2]" />
          <span>Split Video into {totalClips} {totalClips === 1 ? 'Clip' : 'Clips'}</span>
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Processes 100% locally in your browser with FFmpeg WASM</span>
        </div>
      </div>
    </div>
  );
};
