/**
 * Format seconds into human readable duration, e.g. "52m 14s", "1h 05m 20s", "45s"
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0s';
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

/**
 * Format seconds to standard video timecode: "HH:MM:SS" or "MM:SS"
 */
export function formatTimecode(seconds: number, forceHours = false): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0 || forceHours) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format byte count to human readable file size
 */
export function formatFileSize(bytes: number): string {
  if (isNaN(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(size >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Clean and sanitize a filename for safe download naming
 * Removes extension, replaces non-alphanumeric/dash/underscore with hyphens,
 * collapses multiple hyphens, and truncates if overly long.
 */
export function sanitizeFilename(originalName: string): string {
  if (!originalName) return 'clip';
  // Remove extension
  const withoutExt = originalName.replace(/\.[^/.]+$/, '');
  // Replace unsafe chars with hyphen
  const cleaned = withoutExt
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();

  return cleaned.slice(0, 50) || 'video';
}

/**
 * Generate output part filename matching requirement:
 * [original-file-name]-part-001.mp4
 */
export function generatePartFilename(baseName: string, index: number, ext = 'mp4'): string {
  const cleanBase = sanitizeFilename(baseName);
  const paddedIndex = index.toString().padStart(3, '0');
  return `${cleanBase}-part-${paddedIndex}.${ext}`;
}
