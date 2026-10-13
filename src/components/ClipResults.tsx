import React, { useState } from 'react';
import { Download, Archive, RefreshCw, CheckCircle2, Film } from 'lucide-react';
import { ClipSegment, VideoMetadata } from '../types';
import { ClipCard } from './ClipCard';
import { downloadAllAsZip, downloadAllIndividually, triggerDownload } from '../utils/downloadHelper';
import { formatFileSize } from '../utils/formatters';

interface ClipResultsProps {
  clips: ClipSegment[];
  metadata: VideoMetadata;
  onReset: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClipResults: React.FC<ClipResultsProps> = ({
  clips,
  metadata,
  onReset,
  onShowToast,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const totalClips = clips.length;
  const totalBytes = clips.reduce((acc, c) => acc + (c.size || 0), 0);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(5);
      await downloadAllAsZip(clips, metadata.name, (pct) => {
        setZipProgress(pct);
      });
      onShowToast(
        'ZIP Archive Downloaded',
        `Successfully bundled all ${totalClips} MP4 clips into a zip archive.`,
        'success'
      );
    } catch (err) {
      onShowToast(
        'ZIP Creation Failed',
        err instanceof Error ? err.message : String(err),
        'error'
      );
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleDownloadAllSequential = async () => {
    try {
      setIsDownloadingAll(true);
      onShowToast(
        'Downloading Clips',
        `Starting download of ${totalClips} MP4 files to your device...`,
        'info'
      );
      await downloadAllIndividually(clips);
      onShowToast('Downloads Complete', `All ${totalClips} MP4 files triggered.`, 'success');
    } catch (err) {
      onShowToast(
        'Download Error',
        err instanceof Error ? err.message : String(err),
        'error'
      );
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleDownloadSingle = (clip: ClipSegment) => {
    if (clip.blob) {
      triggerDownload(clip.blob, clip.fileName);
      onShowToast('Download Started', `Downloading ${clip.fileName}`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Splitting Complete</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your Clips Are Ready
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Generated <strong className="text-white font-mono">{totalClips}</strong> MP4 clips from{' '}
              <span className="text-slate-300 font-mono">{metadata.name}</span>{' '}
              {totalBytes > 0 && <span>({formatFileSize(totalBytes)} total)</span>}.
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping || isDownloadingAll}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>
                {isZipping ? `Creating ZIP (${zipProgress}%)...` : 'Download All (.zip)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAllSequential}
              disabled={isZipping || isDownloadingAll}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{isDownloadingAll ? 'Downloading...' : 'Download All (Direct)'}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Process Another Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Generated Clips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clips.map((clip) => (
          <ClipCard
            key={clip.index}
            clip={clip}
            onDownloadSingle={handleDownloadSingle}
          />
        ))}
      </div>
    </div>
  );
};
