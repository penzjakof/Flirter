import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** Подія Chromium `beforeinstallprompt` (не стандартизована, тому типізуємо самі). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'in-app-browser' | 'unsupported';

type Listener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

/**
 * Ловимо `beforeinstallprompt` якомога раніше — подія може прийти до монтування екрана.
 * Викликається один раз із кореневого layout.
 */
export function initPwaInstallListener() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

function detectStandalone(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return Platform.OS !== 'web';
  const isDisplayStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const isIosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isDisplayStandalone || isIosStandalone;
}

function detectPlatform(): InstallPlatform {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'unsupported';
  const userAgent = navigator.userAgent;
  if (/FBAN|FBAV|Instagram|Line\/|Telegram|TikTok|Snapchat/i.test(userAgent)) return 'in-app-browser';
  const isIpadOs = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(userAgent) || isIpadOs) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'desktop';
}

export interface PwaInstallState {
  isStandalone: boolean;
  platform: InstallPlatform;
  canPromptNatively: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

/** Стан встановлення PWA. Не малюємо фальшивий системний діалог (06 §2). */
export function usePwaInstall(): PwaInstallState {
  const [, forceRender] = useState(0);
  const [isStandalone] = useState(detectStandalone);
  const [platform] = useState(detectPlatform);

  useEffect(() => {
    const listener = () => forceRender((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return 'unavailable' as const;
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    notify();
    return outcome;
  };

  return { isStandalone, platform, canPromptNatively: deferredPrompt !== null, promptInstall };
}
