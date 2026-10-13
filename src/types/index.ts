export interface VideoMetadata {
  file: File;
  name: string;
  size: number;
  duration: number; // in seconds
  width: number;
  height: number;
  format: string;
  url: string; // Object URL
  orientation?: VideoOrientation;
}

export type VideoOrientation = 'horizontal' | 'vertical' | 'square';

export interface ClipSegment {
  index: number;
  partNumber: string; // e.g. "001"
  fileName: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  blob?: Blob;
  url?: string;
  size?: number;
}

export type PresetDuration = '3m' | '5m' | '10m' | '15m' | '30m' | 'custom' | 'test_30s' | 'test_1m';

export interface SplitProgress {
  currentClip: number;
  totalClips: number;
  percent: number;
  statusText: string;
  isProcessing: boolean;
  canCancel: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

// ----------------------------------------------------
// TikTok Short Generator Types
// ----------------------------------------------------

export type AppFeature = 'splitter' | 'tiktok';

export type TikTokLayoutMode = 'smart_crop' | 'blurred_bg' | 'solid_bg';

export type TikTokDurationPreset = '60s' | '120s' | 'custom';

export type TikTokResolution = '1080x1920' | '720x1280';

export interface TikTokSettings {
  durationPreset: TikTokDurationPreset;
  targetDuration: number; // in seconds (60, 120, or custom <= 120)
  startMode: 'beginning' | 'custom';
  startTime: number; // in seconds
  layoutMode: TikTokLayoutMode;
  resolution: TikTokResolution;
  cropPositionX: number; // 0 (left) to 1 (right), default 0.5 (center)
  solidBgColor: string;
  // Enhancements
  titleText: string;
  captionText: string;
  watermarkText: string;
  showSafeZone: boolean;
  audioMode: 'keep' | 'mute';
  volume: number; // 0.5 to 2.0
}

export interface TikTokGenerationProgress {
  stage: number; // 1 to 5
  stageName: string;
  percent: number;
  isProcessing: boolean;
  canCancel: boolean;
  estimatedDuration: number;
  layoutMode: TikTokLayoutMode;
  resolution: TikTokResolution;
}

export interface TikTokShortResult {
  fileName: string;
  duration: number;
  resolution: string;
  fileSize: number;
  layoutMode: TikTokLayoutMode;
  url: string;
  blob: Blob;
}
