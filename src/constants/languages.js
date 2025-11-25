export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting: 'Hello',
    flag: '🇬🇧',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    greeting: 'नमस्ते',
    flag: '🇮🇳',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    greeting: 'வணக்கம்',
    flag: '🇮🇳',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    greeting: 'నమస్కారం',
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    greeting: 'नमस्कार',
    flag: '🇮🇳',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    greeting: 'નમસ્તે',
    flag: '🇮🇳',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ನಮಸ್ಕಾರ',
    flag: '🇮🇳',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    greeting: 'নমস্কার',
    flag: '🇮🇳',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    flag: '🇮🇳',
  },
];

export const getLanguageByCode = (code) => {
  return LANGUAGES.find(lang => lang.code === code) || LANGUAGES[0];
};
