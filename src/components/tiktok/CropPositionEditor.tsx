import React, { useRef, useState, useCallback, useEffect } from 'react';
import { SlidersHorizontal, MoveHorizontal, UserCheck } from 'lucide-react';
import { TikTokSettings, VideoMetadata } from '../../types';

interface CropPositionEditorProps {
  metadata: VideoMetadata;
  settings: TikTokSettings;
  onChangeCropPosition: (posX: number) => void;
  isProcessing?: boolean;
}

export const CropPositionEditor: React.FC<CropPositionEditorProps> = ({
  metadata,
  settings,
  onChangeCropPosition,
  isProcessing = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Position is 0 (left) to 1 (right), default 0.5 (center)
  const cropPos = settings.cropPositionX ?? 0.5;

  // The 9:16 crop window width relative to a 16:9 container is:
  // (9/16) / (16/9) = 81 / 256 ≈ 31.64% of container width
  const cropBoxWidthPercent = 31.64;
  const maxLeftPercent = 100 - cropBoxWidthPercent;
  const currentLeftPercent = cropPos * maxLeftPercent;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isProcessing) return;
    setIsDragging(true);
    updatePositionFromClientX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isProcessing) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const updatePositionFromClientX = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerW = rect.width;
      const boxW = (cropBoxWidthPercent / 100) * containerW;
      const clickX = clientX - rect.left - boxW / 2;
      const maxOffset = containerW - boxW;

      const clampedOffset = Math.max(0, Math.min(maxOffset, clickX));
      const ratio = maxOffset > 0 ? clampedOffset / maxOffset : 0.5;
      onChangeCropPosition(Math.round(ratio * 100) / 100);
    },
    [cropBoxWidthPercent, onChangeCropPosition]
  );

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-pink-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Smart Subject Positioning
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">
          {Math.round(cropPos * 100)}% Horizontal
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Drag the frame to choose which part of your horizontal video appears in the vertical short.
      </p>

      {/* Interactive Draggable 9:16 Crop Overlay on Video Thumbnail */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/90 border border-slate-800 cursor-ew-resize select-none touch-none shadow-inner"
      >
        {/* Source Video Frame Preview */}
        <video
          src={metadata.url}
          className="w-full h-full object-cover pointer-events-none opacity-70"
          muted
          playsInline
        />

        {/* Dimmed backdrop masks outside the crop box */}
        <div
          className="absolute inset-y-0 left-0 bg-black/75 pointer-events-none transition-all duration-75"
          style={{ width: `${currentLeftPercent}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/75 pointer-events-none transition-all duration-75"
          style={{
            width: `${100 - (currentLeftPercent + cropBoxWidthPercent)}%`,
          }}
        />

        {/* Highlighted 9:16 Crop Window */}
        <div
          className={`absolute inset-y-0 border-2 rounded-sm pointer-events-none transition-all duration-75 flex flex-col items-center justify-between p-2 shadow-2xl ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/15 shadow-cyan-500/30 ring-2 ring-cyan-400/30'
              : 'border-pink-500 bg-pink-500/10 shadow-pink-500/30 ring-1 ring-pink-500/30'
          }`}
          style={{
            left: `${currentLeftPercent}%`,
            width: `${cropBoxWidthPercent}%`,
          }}
        >
          {/* Top Label */}
          <div className="bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-2.5 h-2.5 text-pink-400" />
            <span>9:16 Short</span>
          </div>

          {/* Center Drag Icon */}
          <div className="w-7 h-7 rounded-full bg-black/80 border border-white/30 text-white flex items-center justify-center shadow-lg">
            <MoveHorizontal className="w-3.5 h-3.5" />
          </div>

          {/* Bottom Timecode/Pos indicator */}
          <div className="bg-black/85 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300">
            {cropPos < 0.33 ? 'Left' : cropPos > 0.66 ? 'Right' : 'Center'}
          </div>
        </div>
      </div>

      {/* Preset Quick Buttons: Left, Center, Right */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChangeCropPosition(0)}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            cropPos === 0
              ? 'bg-pink-600/30 border-pink-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Left Focus (0%)
        </button>

        <button
          type="button"
          onClick={() => onChangeCropPosition(0.5)}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            cropPos === 0.5
              ? 'bg-pink-600/30 border-pink-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Center (50%)
        </button>

        <button
          type="button"
          onClick={() => onChangeCropPosition(1)}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            cropPos === 1
              ? 'bg-pink-600/30 border-pink-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Right Focus (100%)
        </button>
      </div>

      {/* Fine-tuned slider */}
      <div className="pt-1">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={cropPos}
          onChange={(e) => onChangeCropPosition(parseFloat(e.target.value))}
          disabled={isProcessing}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
      </div>
    </div>
  );
};
