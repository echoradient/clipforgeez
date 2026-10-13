import { TikTokGenerationProgress, TikTokSettings, TikTokShortResult, VideoMetadata } from '../types';
import { getFFmpeg, cancelSplitting } from './ffmpegHelper';
import { fetchFile } from '@ffmpeg/util';
import { sanitizeFilename } from './formatters';

let isCancelled = false;

export function cancelTikTokGeneration() {
  isCancelled = true;
  cancelSplitting();
}

/**
 * Generates a 9:16 vertical short video from a horizontal video
 * Supports Smart Crop, Blurred Background, Solid Background, text overlays, and audio control.
 */
export async function generateTikTokShort(
  video: VideoMetadata,
  settings: TikTokSettings,
  onProgress: (progress: TikTokGenerationProgress) => void
): Promise<TikTokShortResult> {
  isCancelled = false;

  const [outW, outH] = settings.resolution === '1080x1920' ? [1080, 1920] : [720, 1280];

  // Duration calculations
  const effectiveDuration = Math.min(
    settings.targetDuration,
    video.duration,
    120 // capped at 2 minutes max
  );

  const startTime = settings.startMode === 'beginning' ? 0 : Math.max(0, settings.startTime);
  const clampedStartTime = Math.min(startTime, Math.max(0, video.duration - 0.5));
  const finalDuration = Math.min(effectiveDuration, video.duration - clampedStartTime);

  const sanitizedBase = sanitizeFilename(video.name);
  const durationLabel = Math.round(finalDuration) + 's';
  const outFileName = `${sanitizedBase}-tiktok-short-${durationLabel}.mp4`;

  // Stage 1: Loading video engine
  onProgress({
    stage: 1,
    stageName: 'Loading video engine',
    percent: 10,
    isProcessing: true,
    canCancel: true,
    estimatedDuration: finalDuration,
    layoutMode: settings.layoutMode,
    resolution: settings.resolution,
  });

  // Try FFmpeg first if file size allows (< 800MB), or fall back to high-fidelity Canvas Video Recorder
  // The Canvas method also allows pixel-perfect text overlays and instant local execution
  try {
    return await generateViaCanvas(video, settings, {
      outW,
      outH,
      startTime: clampedStartTime,
      duration: finalDuration,
      outFileName,
      onProgress,
    });
  } catch (canvasErr) {
    console.warn('Canvas engine reported issue, attempting FFmpeg WASM:', canvasErr);
    return await generateViaFFmpeg(video, settings, {
      outW,
      outH,
      startTime: clampedStartTime,
      duration: finalDuration,
      outFileName,
      onProgress,
    });
  }
}

/**
 * High-performance, pixel-perfect Canvas + MediaRecorder vertical generator.
 * Perfectly renders Smart Crop with manual X offset, Blurred Backgrounds,
 * Solid Colors, and Safe-Zone Text Overlays without WebAssembly memory limits.
 */
async function generateViaCanvas(
  video: VideoMetadata,
  settings: TikTokSettings,
  opts: {
    outW: number;
    outH: number;
    startTime: number;
    duration: number;
    outFileName: string;
    onProgress: (p: TikTokGenerationProgress) => void;
  }
): Promise<TikTokShortResult> {
  const { outW, outH, startTime, duration, outFileName, onProgress } = opts;

  // Stage 2: Preparing vertical canvas
  onProgress({
    stage: 2,
    stageName: 'Preparing 9:16 vertical canvas',
    percent: 25,
    isProcessing: true,
    canCancel: true,
    estimatedDuration: duration,
    layoutMode: settings.layoutMode,
    resolution: settings.resolution,
  });

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not initialize canvas rendering context');

  // Load video element
  const videoEl = document.createElement('video');
  videoEl.src = video.url;
  videoEl.crossOrigin = 'anonymous';
  videoEl.muted = settings.audioMode === 'mute';
  videoEl.currentTime = startTime;

  await new Promise((res, rej) => {
    videoEl.onloadeddata = () => res(true);
    videoEl.onerror = () => rej(new Error('Failed to load video element for canvas recording'));
  });

  if (isCancelled) throw new Error('Operation was cancelled.');

  // Set up audio if keep original audio is enabled
  const fps = 30;
  const canvasStream = canvas.captureStream(fps);

  let audioContext: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  if (settings.audioMode === 'keep') {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') {
        await audioContext.resume().catch(() => {});
      }
      const source = audioContext.createMediaElementSource(videoEl);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = settings.volume || 1.0;
      audioDest = audioContext.createMediaStreamDestination();
      source.connect(gainNode);
      gainNode.connect(audioDest);

      if (audioDest.stream.getAudioTracks().length > 0) {
        canvasStream.addTrack(audioDest.stream.getAudioTracks()[0]);
      }
    } catch {
      // Browsers may restrict MediaElementSource without playback, continue with stream
    }
  }

  // Supported MIME types
  const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
    ? 'video/mp4;codecs=avc1'
    : MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: outW >= 1080 ? 8000000 : 4500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  // Stage 3: Applying crop or background
  onProgress({
    stage: 3,
    stageName:
      settings.layoutMode === 'smart_crop'
        ? 'Applying Smart Crop to 9:16 frame'
        : settings.layoutMode === 'blurred_bg'
        ? 'Rendering blurred background & center fit'
        : 'Framing video with solid background',
    percent: 40,
    isProcessing: true,
    canCancel: true,
    estimatedDuration: duration,
    layoutMode: settings.layoutMode,
    resolution: settings.resolution,
  });

  return new Promise<TikTokShortResult>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
      } catch {
        // ignore
      }

      // Stage 5: Finalizing download file
      onProgress({
        stage: 5,
        stageName: 'Finalizing download file',
        percent: 100,
        isProcessing: true,
        canCancel: false,
        estimatedDuration: duration,
        layoutMode: settings.layoutMode,
        resolution: settings.resolution,
      });

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      resolve({
        fileName: outFileName,
        duration,
        resolution: `${outW} × ${outH}`,
        fileSize: blob.size,
        layoutMode: settings.layoutMode,
        url,
        blob,
      });
    };

    recorder.onerror = (e) => reject(e);

    recorder.start(100);

    videoEl.currentTime = startTime;
    videoEl.play().catch(() => {});

    const renderLoop = () => {
      if (isCancelled) {
        try {
          videoEl.pause();
          recorder.stop();
        } catch {
          // ignore
        }
        reject(new Error('Operation cancelled by user.'));
        return;
      }

      const elapsed = videoEl.currentTime - startTime;
      const progressPercent = Math.min(95, 40 + Math.floor((elapsed / duration) * 55));

      // Stage 4: Encoding MP4
      onProgress({
        stage: 4,
        stageName: `Encoding MP4 frame (${Math.round(elapsed)}s / ${Math.round(duration)}s)`,
        percent: progressPercent,
        isProcessing: true,
        canCancel: true,
        estimatedDuration: duration,
        layoutMode: settings.layoutMode,
        resolution: settings.resolution,
      });

      // RENDER LAYOUT ONTO CANVAS
      const vw = videoEl.videoWidth || 1280;
      const vh = videoEl.videoHeight || 720;

      if (settings.layoutMode === 'smart_crop') {
        // SMART CROP:
        // Source crop rectangle that has 9:16 aspect ratio:
        // cropH = vh, cropW = vh * 9 / 16
        const cropW = Math.min(vw, Math.round((vh * 9) / 16));
        const cropH = vh;
        const maxOffset = Math.max(0, vw - cropW);
        const cropX = Math.round(maxOffset * (settings.cropPositionX ?? 0.5));

        ctx.drawImage(videoEl, cropX, 0, cropW, cropH, 0, 0, outW, outH);
      } else if (settings.layoutMode === 'blurred_bg') {
        // BLURRED BACKGROUND:
        // 1. Draw zoomed/blurred background video
        ctx.save();
        ctx.filter = 'blur(35px) brightness(0.65)';
        // Scale video up to fill outW x outH
        const bgScale = Math.max(outW / vw, outH / vh);
        const bgW = vw * bgScale;
        const bgH = vh * bgScale;
        const bgX = (outW - bgW) / 2;
        const bgY = (outH - bgH) / 2;
        ctx.drawImage(videoEl, bgX, bgY, bgW, bgH);
        ctx.restore();

        // Dark subtle gradient overlay to enhance center focus
        const overlayGrad = ctx.createLinearGradient(0, 0, 0, outH);
        overlayGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
        overlayGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        overlayGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(0, 0, outW, outH);

        // 2. Draw crisp horizontal video centered
        const fgScale = outW / vw;
        const fgW = outW;
        const fgH = vh * fgScale;
        const fgY = (outH - fgH) / 2;
        ctx.drawImage(videoEl, 0, fgY, fgW, fgH);
      } else {
        // SOLID BACKGROUND:
        ctx.fillStyle = settings.solidBgColor || '#070a14';
        ctx.fillRect(0, 0, outW, outH);

        // Draw crisp horizontal video centered
        const fgScale = outW / vw;
        const fgW = outW;
        const fgH = vh * fgScale;
        const fgY = (outH - fgH) / 2;
        ctx.drawImage(videoEl, 0, fgY, fgW, fgH);
      }

      // OPTIONAL TEXT OVERLAYS (SAFE ZONE COMPLIANT)
      // 1. Title at top (inside safe zone ~120px from top)
      if (settings.titleText && settings.titleText.trim().length > 0) {
        ctx.save();
        ctx.font = `bold ${Math.round(outW * 0.052)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const titleY = Math.round(outH * 0.16);
        const text = settings.titleText.trim();
        const metrics = ctx.measureText(text);
        const paddingX = 24;
        const paddingY = 12;

        // Subtle dark translucent badge behind title
        ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';
        ctx.beginPath();
        ctx.roundRect(
          outW / 2 - metrics.width / 2 - paddingX,
          titleY - 24,
          metrics.width + paddingX * 2,
          48,
          16
        );
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, outW / 2, titleY);
        ctx.restore();
      }

      // 2. Caption at bottom (inside safe zone ~240px from bottom, above TikTok sound/desc)
      if (settings.captionText && settings.captionText.trim().length > 0) {
        ctx.save();
        ctx.font = `bold ${Math.round(outW * 0.042)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const captionY = Math.round(outH * 0.76);
        const text = settings.captionText.trim();
        const metrics = ctx.measureText(text);
        const paddingX = 20;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(
          outW / 2 - metrics.width / 2 - paddingX,
          captionY - 20,
          metrics.width + paddingX * 2,
          40,
          12
        );
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(text, outW / 2, captionY);
        ctx.restore();
      }

      // 3. Watermark text (top right or bottom left)
      if (settings.watermarkText && settings.watermarkText.trim().length > 0) {
        ctx.save();
        ctx.font = `${Math.round(outW * 0.026)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(settings.watermarkText.trim(), 40, Math.round(outH * 0.1));
        ctx.restore();
      }

      // Check termination
      if (elapsed >= duration || videoEl.ended) {
        videoEl.pause();
        setTimeout(() => recorder.stop(), 200);
      } else {
        requestAnimationFrame(renderLoop);
      }
    };

    renderLoop();
  });
}

/**
 * Fallback to FFmpeg WebAssembly if Canvas video recording encounters environment issues.
 */
async function generateViaFFmpeg(
  video: VideoMetadata,
  settings: TikTokSettings,
  opts: {
    outW: number;
    outH: number;
    startTime: number;
    duration: number;
    outFileName: string;
    onProgress: (p: TikTokGenerationProgress) => void;
  }
): Promise<TikTokShortResult> {
  const { outW, outH, startTime, duration, outFileName, onProgress } = opts;

  const ffmpeg = await getFFmpeg((status) => {
    onProgress({
      stage: 1,
      stageName: status,
      percent: 15,
      isProcessing: true,
      canCancel: true,
      estimatedDuration: duration,
      layoutMode: settings.layoutMode,
      resolution: settings.resolution,
    });
  });

  const inputName = `input_tt_${Date.now()}.mp4`;
  const outputName = `output_tt_${Date.now()}.mp4`;

  await ffmpeg.writeFile(inputName, await fetchFile(video.file));

  // Build filter graph
  let filterStr = '';
  if (settings.layoutMode === 'smart_crop') {
    const cropRatio = settings.cropPositionX ?? 0.5;
    filterStr = `crop=ih*9/16:ih:(iw-ih*9/16)*${cropRatio}:0,scale=${outW}:${outH}`;
  } else if (settings.layoutMode === 'blurred_bg') {
    filterStr = `[0:v]scale=${outW}:${outH}:force_original_aspect_ratio=increase,crop=${outW}:${outH},boxblur=25:5[bg];[0:v]scale=${outW}:-1[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
  } else {
    const col = settings.solidBgColor ? settings.solidBgColor.replace('#', '0x') : 'black';
    filterStr = `[0:v]scale=${outW}:-1[fg];color=c=${col}:s=${outW}x${outH}[bg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
  }

  const audioArgs =
    settings.audioMode === 'mute'
      ? ['-an']
      : ['-map', '0:a?', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2'];

  await ffmpeg.exec([
    '-ss',
    startTime.toString(),
    '-t',
    duration.toString(),
    '-i',
    inputName,
    '-map',
    '0:v:0?',
    '-vf',
    filterStr,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '24',
    ...audioArgs,
    '-y',
    outputName,
  ]);

  const outputData = (await ffmpeg.readFile(outputName)) as Uint8Array;
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const bufferSlice = outputData.buffer.slice(
    outputData.byteOffset,
    outputData.byteOffset + outputData.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([bufferSlice], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);

  return {
    fileName: outFileName,
    duration,
    resolution: `${outW} × ${outH}`,
    fileSize: blob.size,
    layoutMode: settings.layoutMode,
    url,
    blob,
  };
}
