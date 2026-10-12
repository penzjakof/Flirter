import { useEffect, type RefObject } from 'react';
import { Platform, type FlatList } from 'react-native';

/** Keep the last message anchored during layout, before the browser paints.
 * Readers who scrolled back retain their position. No delayed scrollToEnd and
 * no smooth-scroll animation competing with the OS keyboard animation.
 */
export function useWebChatScroll<T>(
  listRef: RefObject<FlatList<T> | null>,
  nearBottomRef: RefObject<boolean>,
  conversationId: string,
  bottomGap: number,
) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const scroll = listRef.current?.getScrollableNode();
    if (!(scroll instanceof HTMLElement)) return;
    const content = scroll.firstElementChild;
    const overlay = scroll.closest('[data-testid="chat-shell"]')?.querySelector('[data-testid="chat-overlay"]');
    if (!(content instanceof HTMLElement) || !(overlay instanceof HTMLElement)) return;
    nearBottomRef.current = true;

    let lastHeight = scroll.clientHeight;
    let lastContentHeight = scroll.scrollHeight;
    const align = () => {
      const padding = `${overlay.getBoundingClientRect().height + bottomGap}px`;
      if (content.style.paddingBottom !== padding) content.style.paddingBottom = padding;
      if (nearBottomRef.current) scroll.scrollTop = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      lastHeight = scroll.clientHeight;
      lastContentHeight = scroll.scrollHeight;
    };
    const onScroll = () => {
      // A resize/scroll clamp is layout, not a decision to read older messages.
      if (scroll.clientHeight !== lastHeight || scroll.scrollHeight !== lastContentHeight) return;
      nearBottomRef.current = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop < 80;
    };
    scroll.style.overflowAnchor = 'none';
    scroll.addEventListener('scroll', onScroll, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(align);
    observer?.observe(scroll);
    observer?.observe(content);
    observer?.observe(overlay);
    window.addEventListener('resize', align);
    align();
    return () => {
      observer?.disconnect();
      scroll.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', align);
      scroll.style.removeProperty('overflow-anchor');
      content.style.removeProperty('padding-bottom');
    };
  }, [listRef, nearBottomRef, conversationId, bottomGap]);
}
