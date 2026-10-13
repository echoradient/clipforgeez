import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Smartphone, Monitor, Shield, Sparkles } from 'lucide-react';
import { TikTokSettings, VideoMetadata } from '../../types';
import { formatDuration, formatTimecode } from '../../utils/formatters';
import { SafeZoneOverlay } from './SafeZoneOverlay';

interface VerticalPreviewProps {
  metadata: VideoMetadata;
  settings: TikTokSettings;
  onStartSplit?: () => void;
  isProcessing?: boolean;
}

export const VerticalPreview: React.FC<VerticalPreviewProps> = ({
  metadata,
  settings,
  onStartSplit,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(settings.startTime || 0);
  const [isMuted, setIsMuted] = useState(settings.audioMode === 'mute');
  const [previewMode, setPreviewMode] = useState<'tiktok' | 'original'>('tiktok');

  // Effective segment duration
  const effectiveDuration = Math.min(settings.targetDuration, metadata.duration);
  const segmentEndTime = settings.startTime + effectiveDuration;

  // Sync video time within the target short range
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = settings.startTime;
      setCurrentTime(settings.startTime);
    }
    if (bgVideoRef.current) {
      bgVideoRef.current.currentTime = settings.startTime;
    }
  }, [settings.startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Loop within the short window
      if (video.currentTime >= segmentEndTime) {
        video.currentTime = settings.startTime;
      }
      if (bgVideoRef.current && Math.abs(bgVideoRef.current.currentTime - video.currentTime) > 0.3) {
        bgVideoRef.current.currentTime = video.currentTime;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (bgVideoRef.current) bgVideoRef.current.play().catch(() => {});
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (bgVideoRef.current) bgVideoRef.current.pause();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [segmentEndTime, settings.startTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartClip = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = settings.startTime;
    videoRef.current.play().catch(() => {});
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    if (bgVideoRef.current) bgVideoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const progressPercent =
    effectiveDuration > 0
      ? Math.max(0, Math.min(100, ((currentTime - settings.startTime) / effectiveDuration) * 100))
      : 0;

  const cropPosPercent = (settings.cropPositionX ?? 0.5) * 100;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col items-center">
      {/* Top Header & Toggle: Original Horizontal vs TikTok Vertical */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span>Interactive Phone Preview</span>
          </h3>
          <p className="text-xs text-slate-400">
            9:16 Vertical frame with real-time crop simulation
          </p>
        </div>

        {/* Preview Format Switcher */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-slate-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setPreviewMode('tiktok')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewMode === 'tiktok'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>TikTok (9:16)</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode('original')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewMode === 'original'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Original (16:9)</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="relative flex justify-center w-full my-2">
        {previewMode === 'original' ? (
          /* Original Horizontal 16:9 View */
          <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 relative shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              src={metadata.url}
              className="w-full h-full object-contain"
              playsInline
              onClick={togglePlay}
            />
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute w-14 h-14 rounded-full bg-pink-600/80 hover:bg-pink-500 text-white flex items-center justify-center backdrop-blur-md shadow-xl cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </button>
            )}
          </div>
        ) : (
          /* Phone Frame Mockup (9:16 Aspect Ratio) */
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-[40px] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-2xl shadow-pink-950/40 ring-1 ring-white/10 flex flex-col justify-between">
            {/* Top Phone Speaker / Island notch */}
            <div className="absolute top-4 inset-x-0 flex justify-center z-40 pointer-events-none">
              <div className="w-24 h-4 bg-black rounded-full border border-white/10 flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/20" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Inner Screen Canvas */}
            <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black flex flex-col items-center justify-center shadow-inner">
              {/* LAYOUT RENDERING ENGINE */}
              {settings.layoutMode === 'smart_crop' ? (
                /* Smart Crop: 9:16 covering frame with horizontal position offset */
                <video
                  ref={videoRef}
                  src={metadata.url}
                  className="w-full h-full object-cover select-none cursor-pointer"
                  style={{
                    objectPosition: `${cropPosPercent}% center`,
                  }}
                  playsInline
                  onClick={togglePlay}
                />
              ) : settings.layoutMode === 'blurred_bg' ? (
                /* Blurred Background: Zoomed blurred video behind + centered horizontal video */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
                  {/* Background blurred layer */}
                  <video
                    ref={bgVideoRef}
                    src={metadata.url}
                    className="absolute inset-0 w-full h-full object-cover scale-150 blur-xl opacity-65 pointer-events-none"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />
                  {/* Foreground sharp video */}
                  <video
                    ref={videoRef}
                    src={metadata.url}
                    className="relative z-10 w-full aspect-video object-contain cursor-pointer shadow-2xl"
                    playsInline
                    onClick={togglePlay}
                  />
                </div>
              ) : (
                /* Solid Background: Colored bars top/bottom + centered horizontal video */
                <div
                  className="relative w-full h-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: settings.solidBgColor || '#070a14' }}
                >
                  <video
                    ref={videoRef}
                    src={metadata.url}
                    className="w-full aspect-video object-contain cursor-pointer shadow-2xl"
                    playsInline
                    onClick={togglePlay}
                  />
                </div>
              )}

              {/* OVERLAYS */}
              {/* 1. Title Text Overlay (Top) */}
              {settings.titleText && settings.titleText.trim().length > 0 && (
                <div className="absolute top-16 inset-x-4 z-20 pointer-events-none flex justify-center">
                  <div className="bg-black/75 backdrop-blur-md border border-pink-500/50 px-3 py-1.5 rounded-xl shadow-lg text-center max-w-[90%]">
                    <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight block">
                      {settings.titleText}
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Caption Text Overlay (Bottom Safe Zone) */}
              {settings.captionText && settings.captionText.trim().length > 0 && (
                <div className="absolute bottom-24 inset-x-4 z-20 pointer-events-none flex justify-center">
                  <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl shadow-lg text-center max-w-[90%]">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-100 leading-tight block">
                      {settings.captionText}
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Watermark text (Top left) */}
              {settings.watermarkText && settings.watermarkText.trim().length > 0 && (
                <div className="absolute top-10 left-3.5 z-20 pointer-events-none">
                  <span className="text-[10px] font-mono text-white/50 tracking-wider">
                    {settings.watermarkText}
                  </span>
                </div>
              )}

              {/* 4. Center Play Button if paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute z-20 w-14 h-14 rounded-full bg-pink-600/80 hover:bg-pink-500 text-white flex items-center justify-center backdrop-blur-md shadow-2xl cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </button>
              )}

              {/* 5. TikTok UI Safe Zone Overlay */}
              <SafeZoneOverlay isVisible={settings.showSafeZone} />
            </div>

            {/* Bottom Phone Home Indicator Bar */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls & Timeline Bar */}
      <div className="w-full max-w-sm mt-4 p-3 bg-[#0b0f19]/80 border border-slate-800 rounded-xl space-y-2">
        {/* Scrub Bar within the short segment */}
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={settings.startTime}
            max={segmentEndTime}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            style={{
              background: `linear-gradient(to right, #ec4899 0%, #06b6d4 ${progressPercent}%, rgba(51, 65, 85, 0.7) ${progressPercent}%, rgba(51, 65, 85, 0.7) 100%)`,
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="hover:text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={restartClip}
              className="hover:text-white transition-colors cursor-pointer"
              title="Restart from beginning of short"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="hover:text-white transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              <span className="text-white font-bold">
                {formatTimecode(Math.max(0, currentTime - settings.startTime))}
              </span>{' '}
              / {formatTimecode(effectiveDuration)}
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">
            9:16 Vertical
          </span>
        </div>
      </div>
    </div>
  );
};
