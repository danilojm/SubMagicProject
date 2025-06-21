
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600 bg-green-100';
    case 'PROCESSING':
    case 'DOWNLOADING':
    case 'TRANSCRIBING':
    case 'TRANSLATING':
    case 'GENERATING':
      return 'text-blue-600 bg-blue-100';
    case 'QUEUED':
      return 'text-yellow-600 bg-yellow-100';
    case 'FAILED':
      return 'text-red-600 bg-red-100';
    case 'CANCELLED':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

export function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function generateJobTitle(inputSource: string, inputType: string): string {
  if (inputType === 'YOUTUBE_URL') {
    const videoId = extractYouTubeVideoId(inputSource);
    return `YouTube Video ${videoId ? `(${videoId})` : ''}`;
  }
  if (inputType === 'VIDEO_FILE' || inputType === 'AUDIO_FILE') {
    const fileName = inputSource.split('/').pop() || inputSource;
    return fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  }
  return `Subtitle Job - ${new Date().toLocaleDateString()}`;
}

export function calculateEstimatedTime(duration: number, whisperModel: string): number {
  // Rough estimates based on model complexity (in seconds)
  const modelMultipliers = {
    'tiny': 0.1,
    'base': 0.2,
    'small': 0.4,
    'medium': 0.8,
    'large': 1.5
  };
  
  const multiplier = modelMultipliers[whisperModel as keyof typeof modelMultipliers] || 0.2;
  return Math.ceil(duration * multiplier);
}

export function validateJobSettings(settings: any): string[] {
  const errors: string[] = [];
  
  if (settings.qualityThreshold && (settings.qualityThreshold < 0 || settings.qualityThreshold > 1)) {
    errors.push('Quality threshold must be between 0 and 1');
  }
  
  if (settings.maxSegmentLength && (settings.maxSegmentLength < 1 || settings.maxSegmentLength > 300)) {
    errors.push('Max segment length must be between 1 and 300 seconds');
  }
  
  return errors;
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk-';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return key;
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
