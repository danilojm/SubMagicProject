export var SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
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
};
export var WHISPER_MODELS = {
    'tiny': { name: 'Tiny', size: '39 MB', speed: 'Fastest', accuracy: 'Basic' },
    'base': { name: 'Base', size: '74 MB', speed: 'Fast', accuracy: 'Good' },
    'small': { name: 'Small', size: '244 MB', speed: 'Medium', accuracy: 'Better' },
    'medium': { name: 'Medium', size: '769 MB', speed: 'Slow', accuracy: 'Very Good' },
    'large': { name: 'Large', size: '1550 MB', speed: 'Slowest', accuracy: 'Best' }
};
export var TRANSLATION_PROVIDERS = {
    'google': { name: 'Google Translate', free: true, quality: 'Good' },
    'deepl': { name: 'DeepL', free: false, quality: 'Excellent' },
    'azure': { name: 'Azure Translator', free: false, quality: 'Very Good' }
};
export var SUBTITLE_FORMATS = {
    'SRT': { name: 'SubRip (.srt)', extension: 'srt', description: 'Most compatible format' },
    'VTT': { name: 'WebVTT (.vtt)', extension: 'vtt', description: 'Web standard format' },
    'ASS': { name: 'Advanced SSA (.ass)', extension: 'ass', description: 'Advanced styling support' },
    'SSA': { name: 'Sub Station Alpha (.ssa)', extension: 'ssa', description: 'Legacy styling format' },
    'TTML': { name: 'TTML (.ttml)', extension: 'ttml', description: 'XML-based format' }
};
//# sourceMappingURL=types.js.map