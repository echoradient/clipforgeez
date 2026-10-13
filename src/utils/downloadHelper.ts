import JSZip from 'jszip';
import { ClipSegment } from '../types';
import { sanitizeFilename } from './formatters';

/**
 * Triggers a direct browser download for a single file Blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
}

/**
 * Packages all generated clips into a single .zip file using JSZip
 * and triggers a single download for the entire bundle.
 */
export async function downloadAllAsZip(
  clips: ClipSegment[],
  originalName: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folderName = `${sanitizeFilename(originalName)}-clips`;
  const folder = zip.folder(folderName) || zip;

  for (const clip of clips) {
    if (clip.blob) {
      folder.file(clip.fileName, clip.blob);
    }
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'STORE', // Store mode: MP4 is already compressed, faster zip creation
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const zipFilename = `${sanitizeFilename(originalName)}-split-clips.zip`;
  triggerDownload(zipBlob, zipFilename);
}

/**
 * Sequentially triggers individual browser downloads for all clips
 */
export async function downloadAllIndividually(clips: ClipSegment[]): Promise<void> {
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    if (clip.blob) {
      triggerDownload(clip.blob, clip.fileName);
      // Small pause between downloads to let browser handle queue
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
}
