import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return twMerge(clsx(inputs));
}
export function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;
    if (hours > 0) {
        return "".concat(hours, ":").concat(minutes.toString().padStart(2, '0'), ":").concat(remainingSeconds.toString().padStart(2, '0'));
    }
    return "".concat(minutes, ":").concat(remainingSeconds.toString().padStart(2, '0'));
}
export function formatFileSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0)
        return '0 Bytes';
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
export function getStatusColor(status) {
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
export function getProgressColor(progress) {
    if (progress >= 100)
        return 'bg-green-500';
    if (progress >= 75)
        return 'bg-blue-500';
    if (progress >= 50)
        return 'bg-yellow-500';
    if (progress >= 25)
        return 'bg-orange-500';
    return 'bg-red-500';
}
export function isValidYouTubeUrl(url) {
    var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
}
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}
export function extractYouTubeVideoId(url) {
    var regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    var match = url.match(regex);
    return match ? match[1] : null;
}
export function generateJobTitle(inputSource, inputType) {
    if (inputType === 'YOUTUBE_URL') {
        var videoId = extractYouTubeVideoId(inputSource);
        return "YouTube Video ".concat(videoId ? "(".concat(videoId, ")") : '');
    }
    if (inputType === 'VIDEO_FILE' || inputType === 'AUDIO_FILE') {
        var fileName = inputSource.split('/').pop() || inputSource;
        return fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    }
    return "Subtitle Job - ".concat(new Date().toLocaleDateString());
}
export function calculateEstimatedTime(duration, whisperModel) {
    // Rough estimates based on model complexity (in seconds)
    var modelMultipliers = {
        'tiny': 0.1,
        'base': 0.2,
        'small': 0.4,
        'medium': 0.8,
        'large': 1.5
    };
    var multiplier = modelMultipliers[whisperModel] || 0.2;
    return Math.ceil(duration * multiplier);
}
export function validateJobSettings(settings) {
    var errors = [];
    if (settings.qualityThreshold && (settings.qualityThreshold < 0 || settings.qualityThreshold > 1)) {
        errors.push('Quality threshold must be between 0 and 1');
    }
    if (settings.maxSegmentLength && (settings.maxSegmentLength < 1 || settings.maxSegmentLength > 300)) {
        errors.push('Max segment length must be between 1 and 300 seconds');
    }
    return errors;
}
export function generateApiKey() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = 'sk-';
    for (var i = 0; i < 48; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
export function maskApiKey(key) {
    if (key.length <= 8)
        return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}
export function debounce(func, wait) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
}
export function throttle(func, limit) {
    var inThrottle;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!inThrottle) {
            func.apply(void 0, args);
            inThrottle = true;
            setTimeout(function () { return inThrottle = false; }, limit);
        }
    };
}
//# sourceMappingURL=utils.js.map