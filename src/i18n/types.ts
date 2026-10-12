import type en from './translations/en.json';

export const SUPPORTED_LANGUAGES = [
  'en',
  'uk',
  'es',
  'fr',
  'de',
  'zh',
  'hi',
  'ar',
  'pt',
  'ja',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set<SupportedLanguage>(['ar']);

export const isRtlLanguage = (code: string): boolean =>
  RTL_LANGUAGES.has(code as SupportedLanguage);

export const LANGUAGE_REGISTRY: Record<SupportedLanguage, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
  uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', isRTL: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  zh: { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', isRTL: false },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false },
};

export type TranslationResources = typeof en;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationResources;
    };
  }
}
