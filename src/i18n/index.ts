import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';

import { SUPPORTED_LANGUAGES, type SupportedLanguage, isRtlLanguage } from './types';
import { resources } from './resources';

const i18n = createInstance();

export function resolveDeviceLanguage(): SupportedLanguage {
  try {
    const locales = getLocales();
    const primaryCode = locales[0]?.languageCode?.toLowerCase();
    if (primaryCode && (SUPPORTED_LANGUAGES as readonly string[]).includes(primaryCode)) {
      return primaryCode as SupportedLanguage;
    }
  } catch {
    // Фолбек у разі винятків під час визначення локалей середовища
  }
  return 'en';
}

export function initI18n(initialLanguage?: SupportedLanguage) {
  const lang = initialLanguage ?? resolveDeviceLanguage();
  const isRtl = isRtlLanguage(lang);

  if (I18nManager.isRTL !== isRtl) {
    I18nManager.allowRTL(isRtl);
    I18nManager.forceRTL(isRtl);
  }

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng: lang,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  } else if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  return i18n;
}

export { SUPPORTED_LANGUAGES, type SupportedLanguage, isRtlLanguage } from './types';
export { resources } from './resources';
export default i18n;
