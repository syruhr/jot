import React, { useEffect, useRef } from 'react';

interface Props {
  x: number;
  y: number;
  onDone: () => void;
}

export default function Confetti({ x, y, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const colors = ['#8b5cf6', '#a78bfa', '#2dd4bf', '#f472b6', '#38bdf8', '#fbbf24'];
    const particles = Array.from({ length: 16 }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 7,
      vy: -(Math.random() * 5 + 2),
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.02;
        if (p.life <= 0) return;
        alive = true;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      if (alive) {
        frame = requestAnimationFrame(animate);
      } else {
        onDone();
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [x, y, onDone]);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={520}
      className="absolute inset-0 pointer-events-none z-50"
    />
  );
}
