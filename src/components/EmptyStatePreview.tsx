import React, { useState } from 'react';
import { Film, Play, Scissors, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { createSampleVideo } from '../utils/sampleVideoGenerator';
import { VideoMetadata } from '../types';

interface EmptyStatePreviewProps {
  onVideoSelected: (metadata: VideoMetadata) => void;
  onError: (err: string) => void;
  isProcessing?: boolean;
}

export const EmptyStatePreview: React.FC<EmptyStatePreviewProps> = ({
  onVideoSelected,
  onError,
  isProcessing = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleQuickDemo = async () => {
    try {
      setIsGenerating(true);
      setProgress(15);
      const sampleFile = await createSampleVideo(75, (pct) => {
        setProgress(pct);
      });

      const objectUrl = URL.createObjectURL(sampleFile);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      tempVideo.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          file: sampleFile,
          name: sampleFile.name,
          size: sampleFile.size,
          duration: tempVideo.duration || 75,
          width: tempVideo.videoWidth || 1280,
          height: tempVideo.videoHeight || 720,
          format: 'MP4',
          url: objectUrl,
        };
        onVideoSelected(metadata);
      };
    } catch (err) {
      onError('Failed to generate sample video: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Mock Video Preview Window */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-slate-800 mb-6 flex flex-col items-center justify-center group shadow-2xl">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.07)_0,transparent_70%)] pointer-events-none" />

          {/* Film timeline markers at top */}
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3 text-[10px] font-mono text-slate-400">
            <span>00:00:00</span>
            <div className="flex items-center gap-1 text-cyan-400">
              <Scissors className="w-3 h-3" />
              <span>Multi-Segment Split Track</span>
            </div>
            <span>01:15:00</span>
          </div>

          {/* Center visual representation */}
          <div className="flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-cyan-500/20 border border-violet-500/40 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white tracking-tight mb-1">
              Interactive Video Preview
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Upload a long video to split it into downloadable MP4 clips.
            </p>
          </div>

          {/* Timeline Cutting Track visual at bottom */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="relative h-4 w-full bg-slate-900 rounded-md overflow-hidden flex border border-slate-800">
              <div className="h-full w-1/4 bg-violet-600/60 border-r border-violet-400/80 flex items-center justify-center text-[9px] font-mono text-white">
                Part 1
              </div>
              <div className="h-full w-1/4 bg-cyan-600/60 border-r border-cyan-400/80 flex items-center justify-center text-[9px] font-mono text-white">
                Part 2
              </div>
              <div className="h-full w-1/4 bg-indigo-600/60 border-r border-indigo-400/80 flex items-center justify-center text-[9px] font-mono text-white">
                Part 3
              </div>
              <div className="h-full w-1/4 bg-fuchsia-600/60 flex items-center justify-center text-[9px] font-mono text-white">
                Part 4
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <div className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span>
              <strong className="text-white">Precision Timestamps:</strong> Choose 5, 10, 15, 30 minutes, or custom minutes & seconds.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span>
              <strong className="text-white">Clean File Naming:</strong> Generates tidy <code className="text-cyan-300 font-mono">[video]-part-001.mp4</code> files automatically.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span>
              <strong className="text-white">Instant Downloads:</strong> Download clips individually or export all in a single ZIP bundle.
            </span>
          </div>
        </div>
      </div>

      {/* Instant Demo Generator Action */}
      <div className="pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={isGenerating || isProcessing}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600/30 via-slate-800 to-cyan-600/30 hover:from-violet-600/50 hover:to-cyan-600/50 border border-violet-500/40 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>
            {isGenerating
              ? `Creating Test Video (${progress}%)...`
              : 'Try Now with a 75s Demo Video'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
