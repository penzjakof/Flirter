import ar from './translations/ar.json';
import de from './translations/de.json';
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';
import hi from './translations/hi.json';
import ja from './translations/ja.json';
import pt from './translations/pt.json';
import uk from './translations/uk.json';
import zh from './translations/zh.json';
import { type SupportedLanguage } from './types';

export const resources: Record<SupportedLanguage, { translation: typeof en }> = {
  en: { translation: en },
  uk: { translation: uk },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  zh: { translation: zh },
  hi: { translation: hi },
  ar: { translation: ar },
  pt: { translation: pt },
  ja: { translation: ja },
};
