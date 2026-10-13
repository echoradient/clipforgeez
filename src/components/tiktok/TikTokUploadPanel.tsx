import React, { useRef, useState } from 'react';
import { UploadCloud, Film, Sparkles, RefreshCw, CheckCircle2, AlertCircle, HardDrive, Clock, Monitor, Compass } from 'lucide-react';
import { VideoMetadata, VideoOrientation } from '../../types';
import { formatDuration, formatFileSize } from '../../utils/formatters';
import { createHorizontalSampleVideo } from '../../utils/horizontalSampleVideoGenerator';

interface TikTokUploadPanelProps {
  metadata: VideoMetadata | null;
  onVideoSelected: (metadata: VideoMetadata) => void;
  onReset: () => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

const SUPPORTED_EXTS = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];

export const TikTokUploadPanel: React.FC<TikTokUploadPanelProps> = ({
  metadata,
  onVideoSelected,
  onReset,
  onError,
  isProcessing = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const determineOrientation = (w: number, h: number): VideoOrientation => {
    const ratio = w / h;
    if (ratio > 1.15) return 'horizontal';
    if (ratio < 0.85) return 'vertical';
    return 'square';
  };

  const processFile = (file: File) => {
    const lower = file.name.toLowerCase();
    const hasExt = SUPPORTED_EXTS.some((ext) => lower.endsWith(ext));
    if (!hasExt && !file.type.startsWith('video/')) {
      onError(`Unsupported format: "${file.name}". Please upload MP4, MOV, WebM, AVI, or MKV.`);
      return;
    }

    if (file.size === 0) {
      onError('The selected file is empty.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;

    const timeout = setTimeout(() => {
      onError('Timed out reading video metadata.');
    }, 15000);

    tempVideo.onloadedmetadata = () => {
      clearTimeout(timeout);
      const w = tempVideo.videoWidth || 1280;
      const h = tempVideo.videoHeight || 720;
      const orientation = determineOrientation(w, h);

      const meta: VideoMetadata = {
        file,
        name: file.name,
        size: file.size,
        duration: tempVideo.duration || 60,
        width: w,
        height: h,
        format: file.name.split('.').pop()?.toUpperCase() || 'MP4',
        url: objectUrl,
        orientation,
      };

      onVideoSelected(meta);
    };

    tempVideo.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      onError('Failed to parse video. The container format or codec may not be supported.');
    };
  };

  const handleGenerateSample = async () => {
    try {
      setIsGeneratingDemo(true);
      setDemoProgress(15);
      const sampleFile = await createHorizontalSampleVideo(65, (pct) => {
        setDemoProgress(pct);
      });
      processFile(sampleFile);
    } catch (err) {
      onError('Demo video generation failed: ' + String(err));
    } finally {
      setIsGeneratingDemo(false);
      setDemoProgress(0);
    }
  };

  // If a video is already uploaded, show its rich metadata card
  if (metadata) {
    const isHorizontal = metadata.orientation === 'horizontal';
    const isVertical = metadata.orientation === 'vertical';

    return (
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-bold text-white truncate max-w-sm" title={metadata.name}>
                {metadata.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-cyan-400 font-semibold">{metadata.format}</span>
                <span aria-hidden="true">·</span>
                <span>{metadata.width} × {metadata.height}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={isProcessing}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change Video</span>
          </button>
        </div>

        {/* Orientation Status Banner */}
        <div
          className={`mt-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            isHorizontal
              ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
              : isVertical
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0 text-pink-400" />
          <div className="flex-1">
            {isHorizontal && (
              <span>
                <strong className="text-white">Horizontal Video Detected:</strong> This horizontal video will be converted into a vertical 9:16 short.
              </span>
            )}
            {isVertical && (
              <span>
                <strong className="text-white">Vertical Video Detected:</strong> This video is already optimized for vertical viewing.
              </span>
            )}
            {!isHorizontal && !isVertical && (
              <span>
                <strong className="text-white">Square Video Detected:</strong> This square video will be framed into a vertical 9:16 short.
              </span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="bg-[#0b0f19]/70 border border-slate-800/80 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-pink-400" />
              <span>Duration</span>
            </div>
            <p className="text-xs font-bold text-white font-mono tabular-nums">
              {formatDuration(metadata.duration)}
            </p>
          </div>

          <div className="bg-[#0b0f19]/70 border border-slate-800/80 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>File Size</span>
            </div>
            <p className="text-xs font-bold text-white font-mono tabular-nums">
              {formatFileSize(metadata.size)}
            </p>
          </div>

          <div className="bg-[#0b0f19]/70 border border-slate-800/80 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Monitor className="w-3 h-3 text-purple-400" />
              <span>Aspect Ratio</span>
            </div>
            <p className="text-xs font-bold text-white font-mono">
              {(metadata.width / metadata.height).toFixed(2)}:1 ({metadata.orientation})
            </p>
          </div>

          <div className="bg-[#0b0f19]/70 border border-slate-800/80 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Film className="w-3 h-3 text-emerald-400" />
              <span>Resolution</span>
            </div>
            <p className="text-xs font-bold text-white font-mono">
              {metadata.width} × {metadata.height}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty Dropzone
  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.webm,.avi,.mkv"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
        disabled={isProcessing || isGeneratingDemo}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        className={`relative rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 border-2 border-dashed ${
          isDragging
            ? 'border-pink-400 bg-pink-950/25 shadow-2xl shadow-pink-500/20 scale-[1.01]'
            : 'border-slate-800 hover:border-pink-500/50 bg-[#0b0f19]/80 backdrop-blur-xl'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          {/* Glowing Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600/25 via-purple-600/25 to-cyan-500/25 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 shadow-lg shadow-pink-900/20">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Upload a Horizontal Video
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Drag and drop your landscape recording here, or browse files. We will convert it into a 9:16 vertical short ready for TikTok, Shorts, and Reels.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isGeneratingDemo}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              Browse Files
            </button>

            <button
              type="button"
              onClick={handleGenerateSample}
              disabled={isProcessing || isGeneratingDemo}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>
                {isGeneratingDemo ? `Creating 16:9 Video (${demoProgress}%)...` : 'Try 16:9 Sample Video'}
              </span>
            </button>
          </div>

          <div className="mt-5 text-[11px] text-slate-500">
            Supported: MP4, MOV, WebM, AVI, MKV · Max 2 minutes output
          </div>
        </div>
      </div>
    </div>
  );
};
