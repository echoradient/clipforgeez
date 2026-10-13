import React, { useRef, useState } from 'react';
import { UploadCloud, Film, Shield, Sparkles, AlertCircle, FileVideo } from 'lucide-react';
import { VideoMetadata } from '../types';
import { createSampleVideo } from '../utils/sampleVideoGenerator';

interface UploadDropzoneProps {
  onVideoSelected: (metadata: VideoMetadata) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onVideoSelected,
  onError,
  isProcessing = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [sampleProgress, setSampleProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processVideoFile = (file: File) => {
    // Validate file type
    const lowerName = file.name.toLowerCase();
    const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const isVideoMime = file.type.startsWith('video/') || file.type === '';

    if (!hasValidExt && !isVideoMime) {
      onError(
        `Unsupported file format: "${file.name}". Please upload an MP4, MOV, WebM, AVI, or MKV video.`
      );
      return;
    }

    if (file.size === 0) {
      onError('The selected file appears to be empty (0 bytes).');
      return;
    }

    // Create object URL to inspect video metadata
    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;

    const timeoutId = setTimeout(() => {
      // If metadata loading hangs after 15s (e.g. unsupported proprietary codec)
      onError('Could not read video metadata. The file may be corrupt or encoded with an unsupported codec.');
    }, 15000);

    tempVideo.onloadedmetadata = () => {
      clearTimeout(timeoutId);
      const duration = tempVideo.duration;

      if (!duration || isNaN(duration) || duration <= 0) {
        onError('Could not determine video duration. Please choose another video file.');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const formatGuess =
        file.name.split('.').pop()?.toUpperCase() ||
        (file.type ? file.type.replace('video/', '').toUpperCase() : 'MP4');

      const metadata: VideoMetadata = {
        file,
        name: file.name,
        size: file.size,
        duration,
        width: tempVideo.videoWidth || 1920,
        height: tempVideo.videoHeight || 1080,
        format: formatGuess,
        url: objectUrl,
      };

      onVideoSelected(metadata);
    };

    tempVideo.onerror = () => {
      clearTimeout(timeoutId);
      onError(
        'Failed to parse video. The container format or codec could not be decoded by your browser.'
      );
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processVideoFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processVideoFile(file);
    }
    // Reset input value so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSample = async () => {
    try {
      setIsGeneratingSample(true);
      setSampleProgress(10);
      const sampleFile = await createSampleVideo(75, (pct) => {
        setSampleProgress(pct);
      });
      processVideoFile(sampleFile);
    } catch (err) {
      onError('Failed to generate sample video: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGeneratingSample(false);
      setSampleProgress(0);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.webm,.avi,.mkv"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing || isGeneratingSample}
        id="video-file-input"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 border-2 border-dashed ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 shadow-2xl shadow-cyan-500/20 scale-[1.01]'
            : 'border-slate-800 hover:border-violet-500/50 bg-[#0b0f19]/70 hover:bg-[#0e1322]/80 backdrop-blur-xl'
        }`}
      >
        {/* Subtle decorative glowing corner accents */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-violet-500/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-violet-500/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-violet-500/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-violet-500/40 rounded-br-sm pointer-events-none" />

        <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
          {/* Main Icon */}
          <div className="relative mb-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400/60 transition-all duration-300 shadow-lg shadow-violet-900/20">
              <UploadCloud className="w-9 h-9 stroke-[1.8]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-violet-400">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Upload a long video to split
          </h3>
          <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
            Drag and drop your video file here, or browse files from your computer. Split it into multiple downloadable MP4 clips in seconds.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isGeneratingSample}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileVideo className="w-4 h-4" />
              <span>Browse Files</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isProcessing || isGeneratingSample}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>
                {isGeneratingSample
                  ? `Generating (${sampleProgress}%)...`
                  : 'Try Sample Video (Demo)'}
              </span>
            </button>
          </div>

          {/* Supported Formats */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Supported formats:</span>
            <span className="text-slate-400 font-mono">MP4</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono">MOV</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono">WebM</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono">AVI</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono">MKV</span>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-300 font-medium">Privacy Guaranteed:</strong> Your video is processed locally in your browser. Nothing is uploaded to any server.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
