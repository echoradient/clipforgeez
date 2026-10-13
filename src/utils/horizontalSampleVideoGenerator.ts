/**
 * Generates a real playable 16:9 widescreen horizontal video directly in the browser.
 * Features a dynamic studio multi-zone layout (left subject, center speaker, right graphic)
 * so users can immediately test Smart Crop (left/center/right) and Vertical framing.
 */
export async function createHorizontalSampleVideo(
  durationSeconds = 65,
  onProgress?: (pct: number) => void
): Promise<File> {
  const width = 1280;
  const height = 720;
  const fps = 25;
  const totalFrames = Math.min(durationSeconds * fps, 250); // fast generation
  const effectiveDuration = durationSeconds;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Rich audible synth sound track for horizontal test video
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  let audioContext: AudioContext | null = null;
  let dest: MediaStreamAudioDestinationNode | null = null;
  try {
    audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    dest = audioContext.createMediaStreamDestination();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, audioContext.currentTime);
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
  } catch {
    // Continue without audio if restricted
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
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `podcast-interview-horizontal-16x9.${ext}`, {
        type: mimeType,
      });
      resolve(file);
    };

    recorder.onerror = (e) => reject(e);

    recorder.start(100);

    let frame = 0;
    const intervalTime = 1000 / fps;

    const renderFrame = () => {
      const progress = frame / totalFrames;
      const currentLogicalSeconds = progress * effectiveDuration;

      // Deep dark cinematic studio background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a0d18');
      grad.addColorStop(0.5, '#121729');
      grad.addColorStop(1, '#070912');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Studio light accents
      const radGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 500);
      radGrad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      radGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.08)');
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // Zone 1: Left Subject (e.g. Guest Avatar/Cam)
      const leftX = 220;
      const leftY = height / 2;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.beginPath();
      ctx.arc(leftX, leftY - 30, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Host / Guest A', leftX, leftY + 90);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f472b6';
      ctx.fillText('[Left Zone]', leftX, leftY + 115);

      // Zone 2: Center Subject (Main Focus Point)
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 30, 105, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Speaker waveform inside center avatar
      const waveOffset = Math.sin(frame * 0.2) * 20;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Keynote Speaker', centerX, centerY + 110);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#c084fc';
      ctx.fillText('[Center Focus Zone]', centerX, centerY + 135);

      // Zone 3: Right Subject (Diagram / Co-host)
      const rightX = width - 220;
      const rightY = height / 2;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      ctx.arc(rightX, rightY - 30, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Product Demo / Guest B', rightX, rightY + 90);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('[Right Zone]', rightX, rightY + 115);

      // Header Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ClipForgees Podcast Broadcast', width / 2, 80);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Horizontal 16:9 Full HD · Convert to 9:16 Vertical Short', width / 2, 115);

      // Bottom Digital Timecode
      const mins = Math.floor(currentLogicalSeconds / 60);
      const secs = Math.floor(currentLogicalSeconds % 60);
      const ms = Math.floor((currentLogicalSeconds % 1) * 100);
      const timecodeStr = `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText(timecodeStr, width / 2, height - 60);

      // Animated bottom audio visualizer bars
      for (let i = 0; i < 24; i++) {
        const barH = 15 + Math.abs(Math.sin(frame * 0.15 + i * 0.4)) * 35;
        const barX = width / 2 - 120 + i * 10;
        ctx.fillStyle = 'rgba(147, 51, 234, 0.7)';
        ctx.fillRect(barX, height - 120 - barH / 2, 6, barH);
      }

      frame++;
      if (onProgress) {
        onProgress(Math.round(progress * 100));
      }

      if (frame < totalFrames) {
        setTimeout(renderFrame, intervalTime / 2);
      } else {
        setTimeout(() => {
          recorder.stop();
        }, 150);
      }
    };

    renderFrame();
  });
}
