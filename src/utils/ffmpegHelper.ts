import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ClipSegment, VideoMetadata } from '../types';
import { generatePartFilename } from './formatters';

let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;
let isCancelled = false;

/**
 * Initializes and loads the FFmpeg WebAssembly core.
 * Uses the official single-threaded WebAssembly bundle which works reliably
 * in modern browsers and iframes without requiring SharedArrayBuffer COOP/COEP headers.
 */
export async function getFFmpeg(onStatusUpdate?: (status: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      if (onStatusUpdate) onStatusUpdate('Initializing FFmpeg WebAssembly engine...');
      const ffmpeg = new FFmpeg();

      ffmpeg.on('log', ({ message }) => {
        // Helpful diagnostic logs
        if (message.includes('Error') || message.includes('failed')) {
          console.warn('[FFmpeg Log]', message);
        }
      });

      // Single-thread ESM build
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

      if (onStatusUpdate) onStatusUpdate('Downloading WebAssembly video codecs (~25MB, cached)...');
      
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

      if (onStatusUpdate) onStatusUpdate('Compiling WebAssembly modules in browser...');
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      ffmpegInstance = ffmpeg;
      isLoaded = true;
      isLoading = false;
      return ffmpeg;
    } catch (err: unknown) {
      isLoading = false;
      isLoaded = false;
      ffmpegInstance = null;
      loadPromise = null;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to load FFmpeg WASM:', err);
      throw new Error(
        `Could not load browser video engine: ${errorMsg}. Please ensure you have an active internet connection on initial load.`
      );
    }
  })();

  return loadPromise;
}

/**
 * Request cancellation of ongoing split operation
 */
export function cancelSplitting() {
  isCancelled = true;
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch {
      // ignore
    }
    ffmpegInstance = null;
    isLoaded = false;
    isLoading = false;
    loadPromise = null;
  }
}

export interface SplitOptions {
  video: VideoMetadata;
  segments: { startTime: number; endTime: number; duration: number }[];
  onProgress: (progress: {
    currentClip: number;
    totalClips: number;
    percent: number;
    statusText: string;
  }) => void;
}

/**
 * Executes local browser-based video splitting using FFmpeg WASM.
 * Slices input video into clean MP4 clips matching the segment timeline.
 */
export async function splitVideo(options: SplitOptions): Promise<ClipSegment[]> {
  const { video, segments, onProgress } = options;
  isCancelled = false;

  const totalClips = segments.length;
  if (totalClips === 0) {
    throw new Error('No segments calculated for splitting.');
  }

  // Check browser memory threshold (~1.8GB)
  if (video.size > 1800 * 1024 * 1024) {
    throw new Error(
      `File size (${(video.size / (1024 * 1024)).toFixed(0)}MB) is near browser WebAssembly memory limits (2GB). Please try a shorter video or compress it first.`
    );
  }

  onProgress({
    currentClip: 0,
    totalClips,
    percent: 2,
    statusText: 'Preparing local WebAssembly engine...',
  });

  const ffmpeg = await getFFmpeg((status) => {
    onProgress({
      currentClip: 0,
      totalClips,
      percent: 5,
      statusText: status,
    });
  });

  if (isCancelled) throw new Error('Operation was cancelled by user.');

  // Input file name in FFmpeg virtual memory
  const inputExt = video.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputVfsName = `input_${Date.now()}.${inputExt}`;

  onProgress({
    currentClip: 0,
    totalClips,
    percent: 10,
    statusText: 'Loading video into local browser memory...',
  });

  // Mount source video into FFmpeg virtual filesystem
  const fileData = await fetchFile(video.file);
  if (isCancelled) throw new Error('Operation was cancelled.');
  await ffmpeg.writeFile(inputVfsName, fileData);

  const results: ClipSegment[] = [];

  try {
    for (let i = 0; i < totalClips; i++) {
      if (isCancelled) {
        throw new Error('Operation was cancelled by user.');
      }

      const segment = segments[i];
      const clipNumber = i + 1;
      const partNumberStr = clipNumber.toString().padStart(3, '0');
      const outputFileName = generatePartFilename(video.name, clipNumber, 'mp4');
      const outputVfsName = `out_part_${clipNumber}.mp4`;

      const startPercent = 10 + Math.floor((i / totalClips) * 85);
      const endPercent = 10 + Math.floor(((i + 1) / totalClips) * 85);

      onProgress({
        currentClip: clipNumber,
        totalClips,
        percent: startPercent,
        statusText: `Slicing clip ${clipNumber} of ${totalClips} (${outputFileName})...`,
      });

      // Primary strategy: Fast lossless video copy with guaranteed synchronized audio (-c:v copy -c:a aac)
      // Re-encoding audio to standard AAC takes <0.05s per clip, but completely eliminates audio dropout,
      // silent gaps, timestamp discontinuities, and codec incompatibility across all sliced segments.
      let execResult = -1;
      const clipDuration = segment.duration.toString();
      try {
        execResult = await ffmpeg.exec([
          '-ss',
          segment.startTime.toString(),
          '-i',
          inputVfsName,
          '-t',
          clipDuration,
          '-map',
          '0:v:0?',
          '-map',
          '0:a?',
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-ar',
          '44100',
          '-ac',
          '2',
          '-avoid_negative_ts',
          'make_zero',
          '-y',
          outputVfsName,
        ]);
      } catch (err) {
        console.warn('Fast video-copy slice failed, will attempt full re-encode fallback:', err);
        execResult = -1;
      }

      // Fallback strategy if -c:v copy fails (e.g. keyframe alignment or container incompatibility)
      if (execResult !== 0) {
        if (isCancelled) throw new Error('Operation was cancelled.');
        onProgress({
          currentClip: clipNumber,
          totalClips,
          percent: startPercent + 2,
          statusText: `Re-encoding clip ${clipNumber} of ${totalClips} for keyframe & audio compatibility...`,
        });

        execResult = await ffmpeg.exec([
          '-ss',
          segment.startTime.toString(),
          '-i',
          inputVfsName,
          '-t',
          clipDuration,
          '-map',
          '0:v:0?',
          '-map',
          '0:a?',
          '-c:v',
          'libx264',
          '-preset',
          'ultrafast',
          '-crf',
          '24',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-ar',
          '44100',
          '-ac',
          '2',
          '-y',
          outputVfsName,
        ]);

        if (execResult !== 0) {
          throw new Error(`FFmpeg failed to generate clip ${clipNumber}. Error code: ${execResult}`);
        }
      }

      if (isCancelled) throw new Error('Operation was cancelled.');

      // Read output from virtual memory
      const fileDataOutput = await ffmpeg.readFile(outputVfsName);
      // Clean up virtual filesystem to free memory
      try {
        await ffmpeg.deleteFile(outputVfsName);
      } catch {
        // ignore
      }

      // Convert to blob and object URL safely compatible with TypeScript BlobPart
      const rawData = fileDataOutput as Uint8Array;
      const bufferSlice = rawData.buffer.slice(
        rawData.byteOffset,
        rawData.byteOffset + rawData.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([bufferSlice], { type: 'video/mp4' });
      const clipUrl = URL.createObjectURL(blob);

      results.push({
        index: clipNumber,
        partNumber: partNumberStr,
        fileName: outputFileName,
        startTime: segment.startTime,
        endTime: segment.endTime,
        duration: segment.duration,
        blob,
        url: clipUrl,
        size: blob.size,
      });

      onProgress({
        currentClip: clipNumber,
        totalClips,
        percent: endPercent,
        statusText: `Clip ${clipNumber} ready (${(blob.size / (1024 * 1024)).toFixed(1)} MB)`,
      });
    }

    onProgress({
      currentClip: totalClips,
      totalClips,
      percent: 100,
      statusText: 'All clips generated successfully!',
    });

    return results;
  } finally {
    // Free input video from FFmpeg virtual memory
    try {
      await ffmpeg.deleteFile(inputVfsName);
    } catch {
      // ignore
    }
  }
}
