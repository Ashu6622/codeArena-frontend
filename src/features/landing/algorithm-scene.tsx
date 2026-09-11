'use client';

import { useEffect, useRef } from 'react';

export function AlgorithmScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let hover = -1;
    let width = 0;
    let height = 0;

    function paint() {
      if (!ctx) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#e9ece4';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Array cells are part of the algorithm scene, kept outside the title's reading area.
      if (width < 1050) return;
      const origins = [48, width - 160];
      origins.forEach((x, side) => {
        const values = side === 0 ? ['02', '07'] : ['11', '15'];
        values.forEach((value, index) => {
          const y = 90 + index * 88 + side * 34;
          const selected = hover === side * 2 + index;
          ctx.fillStyle = selected ? '#d1f85c' : '#f4f6ef';
          ctx.fillRect(x, y, 72, 64);
          ctx.strokeStyle = selected ? '#9cb941' : '#d5dacc';
          ctx.strokeRect(x, y, 72, 64);
          ctx.fillStyle = selected ? '#182014' : '#8f9688';
          ctx.font = '24px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(value, x + 36, y + 40);
          ctx.fillStyle = '#92998c';
          ctx.font = '10px "IBM Plex Mono", monospace';
          ctx.fillText('[' + (side * 2 + index) + ']', x + 92, y + 35);
        });
        ctx.strokeStyle = '#c5ccbc';
        ctx.beginPath();
        ctx.moveTo(x + 36, 154 + side * 34);
        ctx.lineTo(x + 36, 178 + side * 34);
        ctx.stroke();
      });
    }
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      hover = -1;
      [48, width - 160].forEach((origin, side) => {
        for (let index = 0; index < 2; index++) {
          const top = 90 + index * 88 + side * 34;
          if (x >= origin && x <= origin + 72 && y >= top && y <= top + 64)
            hover = side * 2 + index;
        }
      });
      paint();
    };
    canvas.addEventListener('pointermove', onMove);
    const onLeave = () => {
      hover = -1;
      paint();
    };
    canvas.addEventListener('pointerleave', onLeave);
    paint();
    return () => {
      observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="algorithm-scene" aria-hidden="true" />;
}
