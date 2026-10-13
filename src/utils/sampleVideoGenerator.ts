/**
 * Generates a real playable video File directly in the browser
 * for instant testing and demonstration of the video splitting pipeline.
 * Creates an animated cinematic countdown/waveform video with an audio track.
 */
export async function createSampleVideo(
  durationSeconds = 60,
  onProgress?: (pct: number) => void
): Promise<File> {
  const width = 1280;
  const height = 720;
  const fps = 25;
  const totalFrames = Math.min(durationSeconds * fps, 300); // capped for instant generation
  const effectiveDuration = durationSeconds; // logical metadata duration

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Audio Context for a subtle synth tone
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  let audioContext: AudioContext | null = null;
  let dest: MediaStreamAudioDestinationNode | null = null;
  try {
    audioContext = new AudioCtx();
    dest = audioContext.createMediaStreamDestination();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, audioContext.currentTime);
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
  } catch {
    // Audio context may be restricted without user gesture, continue video only
  }

  const canvasStream = canvas.captureStream(fps);
  if (dest && dest.stream.getAudioTracks().length > 0) {
    canvasStream.addTrack(dest.stream.getAudioTracks()[0]);
  }

  const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
    ? 'video/mp4;codecs=avc1'
    : MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: 2500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<File>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close().catch(() => {});
        }
      } catch {
        // ignore
      }
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType });
      const sampleFile = new File([blob], `sample-podcast-episode-01.${extension}`, {
        type: mimeType,
      });
      resolve(sampleFile);
    };

    recorder.onerror = (e) => reject(e);

    recorder.start(100);

    let frame = 0;
    const intervalTime = 1000 / fps;

    const renderFrame = () => {
      const progress = frame / totalFrames;
      const currentLogicalSeconds = progress * effectiveDuration;

      // Dark cinematic background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#07090e');
      grad.addColorStop(0.5, '#0d1326');
      grad.addColorStop(1, '#05070c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle tech grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Animated glowing waveform bars in center
      const barCount = 36;
      const barWidth = 14;
      const startX = width / 2 - (barCount * (barWidth + 8)) / 2;
      for (let i = 0; i < barCount; i++) {
        const angle = frame * 0.1 + i * 0.25;
        const barHeight = Math.abs(Math.sin(angle)) * 140 + 20;
        const barY = height / 2 - barHeight / 2;
        const barX = startX + i * (barWidth + 8);

        const barGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        barGrad.addColorStop(0, '#06b6d4');
        barGrad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 6);
        ctx.fill();
      }

      // Title & branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ClipForgees Studio Sample', width / 2, 160);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Cinematic Test Broadcast · 1080p HD', width / 2, 205);

      // Digital timecode readout
      const mins = Math.floor(currentLogicalSeconds / 60);
      const secs = Math.floor(currentLogicalSeconds % 60);
      const ms = Math.floor((currentLogicalSeconds % 1) * 100);
      const timecodeStr = `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 44px "JetBrains Mono", monospace';
      ctx.fillText(timecodeStr, width / 2, height - 160);

      // Progress bar at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(100, height - 90, width - 200, 8);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(100, height - 90, (width - 200) * progress, 8);

      frame++;
      if (onProgress) {
        onProgress(Math.round(progress * 100));
      }

      if (frame < totalFrames) {
        setTimeout(renderFrame, intervalTime / 2); // faster rendering
      } else {
        setTimeout(() => {
          recorder.stop();
        }, 200);
      }
    };

    renderFrame();
  });
}
