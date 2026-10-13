import React from 'react';
import { Download, Film, Clock, HardDrive } from 'lucide-react';
import { ClipSegment } from '../types';
import { formatDuration, formatFileSize, formatTimecode } from '../utils/formatters';
import { triggerDownload } from '../utils/downloadHelper';

interface ClipCardProps {
  clip: ClipSegment;
  onDownloadSingle?: (clip: ClipSegment) => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip, onDownloadSingle }) => {
  const handleDownload = () => {
    if (onDownloadSingle) {
      onDownloadSingle(clip);
    } else if (clip.blob) {
      triggerDownload(clip.blob, clip.fileName);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg">
      {/* Mini Video Player */}
      <div className="relative aspect-video bg-black/90 w-full overflow-hidden border-b border-slate-800">
        {clip.url ? (
          <video
            src={clip.url}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Film className="w-8 h-8" />
          </div>
        )}

        {/* Clip badge top left */}
        <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-cyan-400">
          Part {clip.partNumber}
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* File Name */}
          <h4
            className="font-mono text-sm font-bold text-white truncate mb-2"
            title={clip.fileName}
          >
            {clip.fileName}
          </h4>

          {/* Time & Size Info */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
            <div className="bg-[#0b0f19]/70 border border-slate-800/80 rounded-lg p-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Clock className="w-3 h-3 text-violet-400" />
                <span>Timecode</span>
              </div>
              <p className="font-mono tabular-nums text-slate-200">
                {formatTimecode(clip.startTime, true)} - {formatTimecode(clip.endTime, true)}
              </p>
            </div>

            <div className="bg-[#0b0f19]/70 border border-slate-800/80 rounded-lg p-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                <span>Duration · Size</span>
              </div>
              <p className="font-mono tabular-nums text-slate-200">
                {formatDuration(clip.duration)} · {clip.size ? formatFileSize(clip.size) : 'Ready'}
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-2.5 bg-violet-600/20 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/40 hover:border-violet-500 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-900/20 group-hover:bg-violet-600 group-hover:text-white"
        >
          <Download className="w-4 h-4" />
          <span>Download MP4</span>
        </button>
      </div>
    </div>
  );
};
