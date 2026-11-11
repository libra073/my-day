import { useEffect, useRef } from 'react';

let lockCount = 0;
let prevHtmlOverflow = '';
let prevBodyOverflow = '';

/**
 * Coordinates body scroll locking across multiple overlapping modals, drawers,
 * and lightboxes so opening or dismissing layered overlays never breaks scroll
 * restoration. Optionally invokes `onEscape` when Escape is pressed.
 */
export function useBodyScrollLock(isLocked, onEscape) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!isLocked) return undefined;

    if (lockCount === 0) {
      prevHtmlOverflow = document.documentElement.style.overflow;
      prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onEscapeRef.current) {
        onEscapeRef.current(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
      }
    };
  }, [isLocked]);
}

