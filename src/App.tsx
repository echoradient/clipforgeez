import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FeatureSwitcher } from './components/FeatureSwitcher';
import { StepIndicator } from './components/StepIndicator';
import { UploadDropzone } from './components/UploadDropzone';
import { VideoMetadataCard } from './components/VideoMetadataCard';
import { VideoPreview } from './components/VideoPreview';
import { DurationSelector } from './components/DurationSelector';
import { EstimatedClipsPreview } from './components/EstimatedClipsPreview';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ClipResults } from './components/ClipResults';
import { EmptyStatePreview } from './components/EmptyStatePreview';
import { ToastNotification } from './components/ToastNotification';
import { InfoSections } from './components/InfoSections';
import { Footer } from './components/Footer';

// TikTok Short Generator components
import { TikTokPromoCard } from './components/tiktok/TikTokPromoCard';
import { TikTokShortGenerator } from './components/tiktok/TikTokShortGenerator';

import {
  AppFeature,
  ClipSegment,
  PresetDuration,
  SplitProgress,
  ToastMessage,
  VideoMetadata,
} from './types';
import { splitVideo, cancelSplitting } from './utils/ffmpegHelper';
import { createSampleVideo } from './utils/sampleVideoGenerator';

export default function App() {
  // Feature Switcher: 'splitter' | 'tiktok'
  const [currentFeature, setCurrentFeature] = useState<AppFeature>('splitter');

  // Video selection state (Splitter tool)
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);

  // Duration selection state
  const [selectedPreset, setSelectedPreset] = useState<PresetDuration>('10m');
  const [customMinutes, setCustomMinutes] = useState<string>('5');
  const [customSeconds, setCustomSeconds] = useState<string>('0');

  // Processing state
  const [progress, setProgress] = useState<SplitProgress>({
    currentClip: 0,
    totalClips: 0,
    percent: 0,
    statusText: '',
    isProcessing: false,
    canCancel: false,
  });

  // Generated clips state
  const [generatedClips, setGeneratedClips] = useState<ClipSegment[]>([]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Determine current active step for Splitter: 1 (Upload), 2 (Duration/Settings), 3 (Download/Results)
  const currentStep = useMemo<1 | 2 | 3>(() => {
    if (generatedClips.length > 0) return 3;
    if (videoMetadata) return 2;
    return 1;
  }, [generatedClips.length, videoMetadata]);

  // Clean up Object URLs on component unmount
  useEffect(() => {
    return () => {
      if (videoMetadata?.url) {
        URL.revokeObjectURL(videoMetadata.url);
      }
      generatedClips.forEach((clip) => {
        if (clip.url) URL.revokeObjectURL(clip.url);
      });
    };
  }, [videoMetadata, generatedClips]);

  // Calculate effective segment duration in seconds
  const effectiveSegmentSeconds = useMemo(() => {
    if (selectedPreset === '3m') return 180;
    if (selectedPreset === '5m') return 300;
    if (selectedPreset === '10m') return 600;
    if (selectedPreset === '15m') return 900;
    if (selectedPreset === '30m') return 1800;
    if (selectedPreset === 'test_30s') return 30;
    if (selectedPreset === 'test_1m') return 60;

    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    return mins * 60 + secs;
  }, [selectedPreset, customMinutes, customSeconds]);

  // Validation logic
  const durationValidation = useMemo(() => {
    if (!videoMetadata) return { isValid: true, error: null };

    if (effectiveSegmentSeconds <= 0) {
      return {
        isValid: false,
        error: 'Duration must be greater than 0 seconds.',
      };
    }

    if (effectiveSegmentSeconds >= videoMetadata.duration) {
      return {
        isValid: false,
        error: `Segment duration (${Math.round(
          effectiveSegmentSeconds
        )}s) must be less than total video duration (${Math.round(
          videoMetadata.duration
        )}s).`,
      };
    }

    return { isValid: true, error: null };
  }, [videoMetadata, effectiveSegmentSeconds]);

  // Calculate planned segments with start and end times
  const calculatedSegments = useMemo(() => {
    if (!videoMetadata || !durationValidation.isValid || effectiveSegmentSeconds <= 0) {
      return [];
    }

    const totalSec = videoMetadata.duration;
    const segments: { startTime: number; endTime: number; duration: number }[] = [];
    let curStart = 0;

    while (curStart < totalSec) {
      const curEnd = Math.min(curStart + effectiveSegmentSeconds, totalSec);
      const segDuration = curEnd - curStart;
      if (segDuration > 0.05) {
        segments.push({
          startTime: Math.round(curStart * 100) / 100,
          endTime: Math.round(curEnd * 100) / 100,
          duration: Math.round(segDuration * 100) / 100,
        });
      }
      curStart = curEnd;
    }

    return segments;
  }, [videoMetadata, durationValidation.isValid, effectiveSegmentSeconds]);

  // When a video is selected
  const handleVideoSelected = (metadata: VideoMetadata) => {
    if (videoMetadata?.url) {
      URL.revokeObjectURL(videoMetadata.url);
    }
    generatedClips.forEach((c) => c.url && URL.revokeObjectURL(c.url));
    setGeneratedClips([]);

    setVideoMetadata(metadata);

    if (metadata.duration <= 180) {
      setSelectedPreset('custom');
      setCustomMinutes('0');
      setCustomSeconds('30');
    } else if (metadata.duration <= 360) {
      setSelectedPreset('3m');
    } else if (metadata.duration <= 600) {
      setSelectedPreset('5m');
    } else {
      setSelectedPreset('10m');
    }

    addToast(
      'Video Loaded',
      `"${metadata.name}" is ready for splitting.`,
      'success'
    );
  };

  // Reset all state to upload another video
  const handleReset = () => {
    if (progress.isProcessing) {
      cancelSplitting();
    }
    if (videoMetadata?.url) {
      URL.revokeObjectURL(videoMetadata.url);
    }
    generatedClips.forEach((c) => c.url && URL.revokeObjectURL(c.url));
    setGeneratedClips([]);
    setVideoMetadata(null);
    setProgress({
      currentClip: 0,
      totalClips: 0,
      percent: 0,
      statusText: '',
      isProcessing: false,
      canCancel: false,
    });
    addToast('Reset Complete', 'Upload or generate a new video to split.', 'info');
  };

  // Start the video split process
  const handleStartSplit = async () => {
    if (!videoMetadata || calculatedSegments.length === 0 || !durationValidation.isValid) {
      return;
    }

    setProgress({
      currentClip: 0,
      totalClips: calculatedSegments.length,
      percent: 5,
      statusText: 'Preparing local WebAssembly engine...',
      isProcessing: true,
      canCancel: true,
    });

    try {
      const clips = await splitVideo({
        video: videoMetadata,
        segments: calculatedSegments,
        onProgress: (p) => {
          setProgress((prev) => ({
            ...prev,
            ...p,
            isProcessing: true,
            canCancel: true,
          }));
        },
      });

      setGeneratedClips(clips);
      addToast(
        'Splitting Finished!',
        `Successfully generated ${clips.length} MP4 clips.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('cancelled')) {
        addToast('Process Cancelled', 'Splitting was cancelled by user.', 'info');
      } else {
        addToast('Splitting Failed', msg, 'error');
      }
    } finally {
      setProgress((prev) => ({
        ...prev,
        isProcessing: false,
        canCancel: false,
      }));
    }
  };

  // Cancel running operation
  const handleCancelSplit = () => {
    cancelSplitting();
    setProgress((prev) => ({
      ...prev,
      isProcessing: false,
      canCancel: false,
      statusText: 'Cancelled',
    }));
    addToast('Splitting Cancelled', 'Operation was aborted.', 'info');
  };

  // Load sample demo video from anywhere in the app
  const handleLoadSampleVideo = async () => {
    if (progress.isProcessing) return;
    try {
      addToast('Generating Demo Video', 'Creating a test broadcast video...', 'info');
      const sampleFile = await createSampleVideo(75);
      const objectUrl = URL.createObjectURL(sampleFile);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      tempVideo.onloadedmetadata = () => {
        handleVideoSelected({
          file: sampleFile,
          name: sampleFile.name,
          size: sampleFile.size,
          duration: tempVideo.duration || 75,
          width: tempVideo.videoWidth || 1280,
          height: tempVideo.videoHeight || 720,
          format: 'MP4',
          url: objectUrl,
        });
      };
    } catch (err) {
      addToast('Demo Error', 'Could not generate demo video: ' + String(err), 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 relative overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      {currentFeature === 'tiktok' && (
        <div className="fixed top-10 right-1/3 w-[500px] h-[500px] bg-pink-600/[0.05] rounded-full blur-[140px] pointer-events-none -z-10" />
      )}

      {/* Subtle background tech grid */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Header */}
      <Header
        currentFeature={currentFeature}
        onChangeFeature={setCurrentFeature}
        onLoadSample={handleLoadSampleVideo}
        isProcessing={progress.isProcessing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Main Feature Switcher Navigation */}
        <FeatureSwitcher
          currentFeature={currentFeature}
          onChangeFeature={setCurrentFeature}
          isProcessing={progress.isProcessing}
        />

        {/* ---------------------------------------------------- */}
        {/* TOOL B: TIKTOK SHORT GENERATOR DEDICATED WORKFLOW */}
        {/* ---------------------------------------------------- */}
        {currentFeature === 'tiktok' ? (
          <TikTokShortGenerator
            onShowToast={addToast}
            onSwitchToSplitter={() => setCurrentFeature('splitter')}
          />
        ) : (
          /* ---------------------------------------------------- */
          /* TOOL A: LONG VIDEO SPLITTER WORKFLOW */
          /* ---------------------------------------------------- */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Prominent TikTok Promo Card on Home Page */}
            {!videoMetadata && (
              <TikTokPromoCard onSelect={() => setCurrentFeature('tiktok')} />
            )}

            {/* Splitter Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-800/40 text-violet-300 text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Fast, In-Browser Video Slicing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
                Turn Long Videos Into{' '}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Perfect Moments
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Split podcasts, lectures, and captures into downloadable MP4 clips in seconds.
                Processed 100% locally in your browser with zero server uploads.
              </p>
            </div>

            {/* 3-Step Progress Indicator */}
            <div className="mb-8">
              <StepIndicator currentStep={currentStep} />
            </div>

            {/* Splitter Processing Progress Bar */}
            {progress.isProcessing && (
              <div className="mb-10">
                <ProcessingProgress
                  progress={progress}
                  onCancel={handleCancelSplit}
                />
              </div>
            )}

            {/* Output Results Screen (Step 3) */}
            {generatedClips.length > 0 && !progress.isProcessing ? (
              <ClipResults
                clips={generatedClips}
                metadata={videoMetadata!}
                onReset={handleReset}
                onShowToast={addToast}
              />
            ) : (
              /* Two-Column Responsive Workspace (Steps 1 & 2) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Upload Area & Duration Controls */}
                <div className="lg:col-span-6 space-y-6">
                  {!videoMetadata ? (
                    <UploadDropzone
                      onVideoSelected={handleVideoSelected}
                      onError={(err) => addToast('Upload Error', err, 'error')}
                      isProcessing={progress.isProcessing}
                    />
                  ) : (
                    <>
                      <VideoMetadataCard
                        metadata={videoMetadata}
                        onReset={handleReset}
                        isProcessing={progress.isProcessing}
                      />

                      <DurationSelector
                        metadata={videoMetadata}
                        selectedPreset={selectedPreset}
                        onSelectPreset={setSelectedPreset}
                        customMinutes={customMinutes}
                        customSeconds={customSeconds}
                        onChangeCustomMinutes={setCustomMinutes}
                        onChangeCustomSeconds={setCustomSeconds}
                        effectiveSegmentSeconds={effectiveSegmentSeconds}
                        totalClips={calculatedSegments.length}
                        error={durationValidation.error}
                        isProcessing={progress.isProcessing}
                      />
                    </>
                  )}
                </div>

                {/* Right Column: Video Preview & Estimated Output */}
                <div className="lg:col-span-6 space-y-6">
                  {videoMetadata ? (
                    <>
                      <VideoPreview
                        src={videoMetadata.url}
                        title={videoMetadata.name}
                      />

                      <EstimatedClipsPreview
                        metadata={videoMetadata}
                        segments={calculatedSegments}
                        onStartSplit={handleStartSplit}
                        isProcessing={progress.isProcessing}
                        isValidDuration={durationValidation.isValid}
                      />
                    </>
                  ) : (
                    <EmptyStatePreview
                      onVideoSelected={handleVideoSelected}
                      onError={(err) => addToast('Demo Error', err, 'error')}
                      isProcessing={progress.isProcessing}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informational Architecture & FAQ Sections */}
        <InfoSections />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications Stack */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
