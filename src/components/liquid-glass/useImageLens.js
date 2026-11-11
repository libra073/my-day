import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Builds a lens texture directly from the photograph under a glass chip.
 *
 * No DOM capture: the chip knows which <img> sits under its centre, so we draw
 * that image into a small canvas using the exact offsets between the two rects.
 * The result is pixel-identical to the backdrop, costs a couple of milliseconds,
 * and can follow scroll at 60fps.
 */
export default function useImageLens(hostRef, containerRef) {
  const [lens, setLens] = useState(null);

  const retry = useRef(0);

  const update = useCallback(() => {
    const host = hostRef.current;
    const container = containerRef.current;
    if (!host || !container) return;

    const hr = host.getBoundingClientRect();
    if (!hr.width || !hr.height) return;

    const cx = hr.left + hr.width / 2;
    const cy = hr.top + hr.height / 2;

    const img = [...container.querySelectorAll('img')].find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    });

    if (!img || !img.complete || !img.naturalWidth) {
      // images can still be decoding on first paint — try again next frame
      if (retry.current++ < 90) requestAnimationFrame(update);
      return;
    }
    retry.current = 0;

    const ir = img.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(hr.width));
    canvas.height = Math.max(1, Math.round(hr.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // reproduce the image's on-screen crop, one CSS pixel per texture pixel
    ctx.drawImage(img, ir.left - hr.left, ir.top - hr.top, ir.width, ir.height);

    setLens({ texture: canvas, width: hr.width, height: hr.height });
  }, [hostRef, containerRef]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    update();

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [update]);

  return lens;
}
