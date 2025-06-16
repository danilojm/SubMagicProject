
export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  usageCount: number;
  usageLimit: number;
  createdAt: Date;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  description?: string;
  inputType: 'YOUTUBE_URL' | 'VIDEO_FILE' | 'AUDIO_FILE' | 'OTHER_URL';
  inputSource: string;
  originalFileName?: string;
  fileSize?: number;
  duration?: number;
  status: JobStatus;
  progress: number;
  sourceLanguage?: string;
  targetLanguages: string[];
  transcriptionText?: string;
  errorMessage?: string;
  statusMessage: any;
  processingStarted?: Date;
  processingEnded?: Date;
  createdAt: Date;
  updatedAt: Date;
  subtitles?: Subtitle[];
  jobSettings?: JobSettings;
  analytics?: JobAnalytics;
}

export type JobStatus = 
  | 'QUEUED'
  | 'PROCESSING'
  | 'DOWNLOADING'
  | 'TRANSCRIBING'
  | 'TRANSLATING'
  | 'GENERATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type TranslatioProviders = 
  | 'google'
  | 'deepl'
  | 'azure'
;

export interface JobSettings {
  whisperModel: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  enableSpeakerDetection: boolean;
  customVocabulary?: string;
  translationProvider: 'google' | 'deepl' | 'azure';
  enableAutoSync: boolean;
  qualityThreshold: number;
  maxSegmentLength: number;
}

export interface JobAnalytics {
  transcriptionTime?: number;
  translationTime?: number;
  totalProcessingTime?: number;
  qualityScore?: number;
  wordCount?: number;
  segmentCount?: number;
  errorCount: number;
  retryCount: number;
}

export interface Subtitle {
  id: string;
  jobId: string;
  language: string;
  format: 'SRT' | 'VTT' | 'ASS' | 'SSA' | 'TTML';
  content: string;
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
  isEdited: boolean;
  editHistory?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  jobs?: Job[];
}

export interface CreateJobRequest {
  title: string;
  description?: string;
  inputType: 'YOUTUBE_URL' | 'VIDEO_FILE' | 'AUDIO_FILE' | 'OTHER_URL';
  inputSource: string;
  targetLanguages: string[];
  projectId?: string;
  settings?: Partial<JobSettings>;
}

export interface JobProgressUpdate {
  jobId: string;
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
}

export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt-pt': 'Portuguese PT',
  'pt-br': 'Portuguese BR',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'mk': 'Macedonian',
  'sq': 'Albanian',
  'sr': 'Serbian',
  'bs': 'Bosnian',
  'me': 'Montenegrin',
  'is': 'Icelandic',
  'mt': 'Maltese',
  'ga': 'Irish',
  'cy': 'Welsh',
  'eu': 'Basque',
  'ca': 'Catalan',
  'gl': 'Galician',
  'ast': 'Asturian'
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const WHISPER_MODELS = {
  'tiny': { name: 'Tiny', size: '39 MB', speed: 'Fastest', accuracy: 'Basic' },
  'base': { name: 'Base', size: '74 MB', speed: 'Fast', accuracy: 'Good' },
  'small': { name: 'Small', size: '244 MB', speed: 'Medium', accuracy: 'Better' },
  'medium': { name: 'Medium', size: '769 MB', speed: 'Slow', accuracy: 'Very Good' },
  'large': { name: 'Large', size: '1550 MB', speed: 'Slowest', accuracy: 'Best' }
} as const;

export const TRANSLATION_PROVIDERS = {
  'google': { name: 'Google Translate', free: true, quality: 'Good' },
  'deepl': { name: 'DeepL', free: false, quality: 'Excellent' },
  'azure': { name: 'Azure Translator', free: false, quality: 'Very Good' }
} as const;


export const SUBTITLE_FORMATS = {
  'SRT': { name: 'SubRip (.srt)', extension: 'srt', description: 'Most compatible format' },
  'VTT': { name: 'WebVTT (.vtt)', extension: 'vtt', description: 'Web standard format' },
  'ASS': { name: 'Advanced SSA (.ass)', extension: 'ass', description: 'Advanced styling support' },
  'SSA': { name: 'Sub Station Alpha (.ssa)', extension: 'ssa', description: 'Legacy styling format' },
  'TTML': { name: 'TTML (.ttml)', extension: 'ttml', description: 'XML-based format' }
} as const;

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  processingJobs: number;
  failedJobs: number;
  totalProcessingTime: number;
  averageQualityScore: number;
  usageThisMonth: number;
  remainingQuota: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
