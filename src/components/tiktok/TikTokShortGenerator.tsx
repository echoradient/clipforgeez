import React, { useState, useMemo, useEffect } from 'react';
import { Smartphone, Sparkles, Scissors, ArrowRight, ShieldCheck, Video } from 'lucide-react';
import { TikTokStepIndicator } from './TikTokStepIndicator';
import { TikTokUploadPanel } from './TikTokUploadPanel';
import { DurationOptionCard } from './DurationOptionCard';
import { LayoutModeSelector } from './LayoutModeSelector';
import { CropPositionEditor } from './CropPositionEditor';
import { ShortEnhancementsPanel } from './ShortEnhancementsPanel';
import { VerticalPreview } from './VerticalPreview';
import { ShortGenerationProgress } from './ShortGenerationProgress';
import { TikTokResultCard } from './TikTokResultCard';

import {
  TikTokGenerationProgress,
  TikTokSettings,
  TikTokShortResult,
  VideoMetadata,
} from '../../types';
import { generateTikTokShort, cancelTikTokGeneration } from '../../utils/tiktokGenerator';
import { formatDuration } from '../../utils/formatters';

interface TikTokShortGeneratorProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToSplitter: () => void;
}

const DEFAULT_SETTINGS: TikTokSettings = {
  durationPreset: '60s',
  targetDuration: 60,
  startMode: 'beginning',
  startTime: 0,
  layoutMode: 'smart_crop',
  resolution: '1080x1920',
  cropPositionX: 0.5,
  solidBgColor: '#070a14',
  titleText: '',
  captionText: '',
  watermarkText: '',
  showSafeZone: false,
  audioMode: 'keep',
  volume: 1.0,
};

export const TikTokShortGenerator: React.FC<TikTokShortGeneratorProps> = ({
  onShowToast,
  onSwitchToSplitter,
}) => {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [settings, setSettings] = useState<TikTokSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<TikTokShortResult | null>(null);

  const [progress, setProgress] = useState<TikTokGenerationProgress>({
    stage: 1,
    stageName: '',
    percent: 0,
    isProcessing: false,
    canCancel: false,
    estimatedDuration: 60,
    layoutMode: 'smart_crop',
    resolution: '1080x1920',
  });

  // Calculate current active step (1 to 5)
  const currentStep = useMemo<1 | 2 | 3 | 4 | 5>(() => {
    if (result) return 5;
    if (progress.isProcessing) return 4;
    if (!metadata) return 1;
    // Step 2 or 3
    return 3;
  }, [result, progress.isProcessing, metadata]);

  // Clean up result object URL on unmount or reset
  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const updateSettings = (updates: Partial<TikTokSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleVideoSelected = (newMeta: VideoMetadata) => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setMetadata(newMeta);

    // If video is shorter than 60s, clamp default duration
    const clampedDur = Math.min(60, Math.round(newMeta.duration));
    updateSettings({
      targetDuration: clampedDur,
      durationPreset: clampedDur >= 60 ? '60s' : 'custom',
      startTime: 0,
      startMode: 'beginning',
      cropPositionX: 0.5,
    });

    onShowToast(
      'Video Loaded',
      `"${newMeta.name}" (${newMeta.width}x${newMeta.height}) ready for vertical conversion.`,
      'success'
    );
  };

  const handleReset = () => {
    if (progress.isProcessing) cancelTikTokGeneration();
    if (result?.url) URL.revokeObjectURL(result.url);
    if (metadata?.url) URL.revokeObjectURL(metadata.url);

    setResult(null);
    setMetadata(null);
    setSettings(DEFAULT_SETTINGS);
    setProgress({
      stage: 1,
      stageName: '',
      percent: 0,
      isProcessing: false,
      canCancel: false,
      estimatedDuration: 60,
      layoutMode: 'smart_crop',
      resolution: '1080x1920',
    });
  };

  const handleStartGeneration = async () => {
    if (!metadata) return;

    setProgress({
      stage: 1,
      stageName: 'Initializing engine...',
      percent: 5,
      isProcessing: true,
      canCancel: true,
      estimatedDuration: settings.targetDuration,
      layoutMode: settings.layoutMode,
      resolution: settings.resolution,
    });

    try {
      const generatedResult = await generateTikTokShort(metadata, settings, (p) => {
        setProgress(p);
      });

      setResult(generatedResult);
      onShowToast(
        'TikTok Short Generated!',
        `Your 9:16 vertical short (${generatedResult.resolution}) is ready to download.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('cancelled')) {
        onShowToast('Generation Cancelled', 'Operation was aborted.', 'info');
      } else {
        onShowToast('Generation Failed', msg, 'error');
      }
    } finally {
      setProgress((prev) => ({
        ...prev,
        isProcessing: false,
        canCancel: false,
      }));
    }
  };

  const handleCancelGeneration = () => {
    cancelTikTokGeneration();
    setProgress((prev) => ({
      ...prev,
      isProcessing: false,
      canCancel: false,
      stageName: 'Cancelled',
    }));
    onShowToast('Cancelled', 'Generation aborted.', 'info');
  };

  const handleQuickReGenerate = (targetSec: number) => {
    if (!metadata) return;
    const clamped = Math.min(targetSec, metadata.duration);
    updateSettings({
      durationPreset: targetSec === 60 ? '60s' : targetSec === 120 ? '120s' : 'custom',
      targetDuration: clamped,
      startTime: 0,
    });
    setResult(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Feature Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3">
          <Smartphone className="w-3.5 h-3.5 text-pink-400" />
          <span>Turn Any Horizontal Video Into a Vertical Short</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          TikTok Short{' '}
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Generator
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Frame it. Format it. Share it. Transform horizontal landscape footage into high-retention 9:16 vertical short videos for TikTok, Reels, and Shorts.
        </p>
      </div>

      {/* 5-Step Progress Indicator */}
      <TikTokStepIndicator currentStep={currentStep} />

      {/* Progress Overlay during Generation */}
      {progress.isProcessing && (
        <ShortGenerationProgress
          progress={progress}
          onCancel={handleCancelGeneration}
        />
      )}

      {/* Step 5: Result Card */}
      {result && !progress.isProcessing ? (
        <TikTokResultCard
          result={result}
          metadata={metadata!}
          onReset={handleReset}
          onEditLayout={() => setResult(null)}
          onQuickGenerate={handleQuickReGenerate}
          onShowToast={onShowToast}
        />
      ) : (
        /* Steps 1 - 4: Main 2-Column Responsive Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload, Duration, Layout Modes, Position & Enhancements */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 1: Upload */}
            <TikTokUploadPanel
              metadata={metadata}
              onVideoSelected={handleVideoSelected}
              onReset={handleReset}
              onError={(err) => onShowToast('Upload Error', err, 'error')}
              isProcessing={progress.isProcessing}
            />

            {metadata && (
              <>
                {/* Step 2: Duration */}
                <DurationOptionCard
                  metadata={metadata}
                  settings={settings}
                  onChangeSettings={updateSettings}
                  isProcessing={progress.isProcessing}
                />

                {/* Step 3: Layout Mode */}
                <LayoutModeSelector
                  settings={settings}
                  onChangeSettings={updateSettings}
                  isProcessing={progress.isProcessing}
                />

                {/* Smart Crop Draggable Position (if smart_crop mode) */}
                {settings.layoutMode === 'smart_crop' && (
                  <CropPositionEditor
                    metadata={metadata}
                    settings={settings}
                    onChangeCropPosition={(posX) => updateSettings({ cropPositionX: posX })}
                    isProcessing={progress.isProcessing}
                  />
                )}

                {/* Step 3 Optional Enhancements */}
                <ShortEnhancementsPanel
                  settings={settings}
                  onChangeSettings={updateSettings}
                  isProcessing={progress.isProcessing}
                />
              </>
            )}
          </div>

          {/* Right Column: Phone Preview & Generate Action */}
          <div className="lg:col-span-6 space-y-6">
            {metadata ? (
              <>
                <VerticalPreview
                  metadata={metadata}
                  settings={settings}
                  isProcessing={progress.isProcessing}
                />

                {/* Primary Generate Button */}
                <div className="glass-panel rounded-2xl p-6 border border-pink-500/30 shadow-xl space-y-3">
                  <button
                    type="button"
                    onClick={handleStartGeneration}
                    disabled={progress.isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:via-purple-500 hover:to-cyan-400 text-white font-extrabold text-base rounded-xl shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 transition-all flex items-center justify-center gap-3 cursor-pointer transform active:scale-[0.99] disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5 stroke-[2.2]" />
                    <span>
                      Generate TikTok Short ({formatDuration(settings.targetDuration)})
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Processed 100% locally in your browser with zero server uploads</span>
                  </div>
                </div>
              </>
            ) : (
              /* Empty Preview Placeholder */
              <div className="glass-panel rounded-2xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center aspect-[9/10] relative overflow-hidden">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 shadow-xl">
                  <Smartphone className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Live Phone Preview
                </h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6">
                  Upload a horizontal video on the left to see the interactive 9:16 vertical crop preview, test TikTok safe zones, and export your short.
                </p>
                <div className="text-xs font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
                  Supports 1m & 2m formats
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
