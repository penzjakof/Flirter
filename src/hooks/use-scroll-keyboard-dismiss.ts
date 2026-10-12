import { useMemo, useRef } from 'react';
import { Keyboard, Platform, type GestureResponderEvent } from 'react-native';

/** RN Web's on-drag mode dismisses on programmatic scroll too. Only a real
 * one-finger vertical gesture outside the editor should dismiss on the web. */
export function useScrollKeyboardDismiss() {
  const start = useRef<{ x: number; y: number; editor: HTMLElement } | null>(null);
  return useMemo(() => {
    if (Platform.OS !== 'web') return {};
    const reset = () => { start.current = null; };
    return {
      onTouchStart: (event: GestureResponderEvent) => {
        reset();
        const touches = event.nativeEvent.touches;
        const editor = document.activeElement;
        const target = event.target as unknown;
        if (touches.length !== 1 || !(editor instanceof HTMLElement) ||
          !(editor.matches('input, textarea') || editor.isContentEditable)) return;
        // Text selection and scrolling inside the textarea keep the keyboard.
        if (target instanceof Element && target.closest('input, textarea, [contenteditable="true"]')) return;
        start.current = { x: touches[0].pageX, y: touches[0].pageY, editor };
      },
      onTouchMove: (event: GestureResponderEvent) => {
        const touches = event.nativeEvent.touches;
        if (touches.length !== 1) { reset(); return; }
        const origin = start.current;
        if (!origin) return;
        const dx = touches[0].pageX - origin.x;
        const dy = touches[0].pageY - origin.y;
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.2) {
          if (document.activeElement === origin.editor) Keyboard.dismiss();
          reset();
        }
      },
      onTouchEnd: reset,
      onTouchCancel: reset,
    };
  }, []);
}
