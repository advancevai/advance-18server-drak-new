import React, { memo, useEffect, useRef } from 'react';

export const NeonBackground: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle colors from specified palette
    const colors = [
      '#00E5FF', // Electric Cyan
      '#8B2CFF', // Neon Purple
      '#0057FF', // Neon Blue
      '#00FF88', // Cyber Green
      '#6D28D9', // Soft Violet
    ];

    interface Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedY: number;
      speedX: number;
      baseAlpha: number;
      alpha: number;
      pulseAngle: number;
      pulseSpeed: number;
    }

    const particleCount = Math.min(42, Math.max(22, Math.floor(width / 35)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const baseAlpha = 0.25 + Math.random() * 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 2.5,
        color,
        speedY: -(0.25 + Math.random() * 0.55),
        speedX: (Math.random() - 0.5) * 0.35,
        baseAlpha,
        alpha: baseAlpha,
        pulseAngle: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulseAngle += p.pulseSpeed;
          p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.2;

          // Wrap around screen edges smoothly
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 3.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Navy Base & Slowly Moving Gradient Mesh */}
      <div className="absolute inset-0 bg-[#020817]" />
      <div className="neon-gradient-canvas absolute inset-0" />

      {/* 2. Floating Ambient Glow Orbs (Visibly luminous & living) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-Left Electric Cyan & Blue Orb */}
        <div
          className="ambient-glow-spot ambient-glow-1 absolute -top-32 -left-32 w-96 h-96 sm:w-[580px] sm:h-[580px] rounded-full blur-[75px]"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 229, 255, 0.32) 0%, rgba(0, 87, 255, 0.16) 45%, transparent 70%)',
          }}
        />

        {/* Mid-Right Neon Purple & Violet Orb */}
        <div
          className="ambient-glow-spot ambient-glow-2 absolute top-[25%] -right-32 w-96 h-96 sm:w-[560px] sm:h-[560px] rounded-full blur-[80px]"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 44, 255, 0.30) 0%, rgba(109, 40, 217, 0.16) 45%, transparent 70%)',
          }}
        />

        {/* Bottom-Left Electric Cyan & Greenish Orb */}
        <div
          className="ambient-glow-spot ambient-glow-3 absolute -bottom-32 left-[12%] w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full blur-[75px]"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 229, 255, 0.24) 0%, rgba(0, 255, 136, 0.14) 50%, transparent 70%)',
          }}
        />

        {/* Bottom-Right Deep Neon Blue & Purple Orb */}
        <div
          className="ambient-glow-spot ambient-glow-4 absolute bottom-[18%] right-[8%] w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full blur-[75px]"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 87, 255, 0.26) 0%, rgba(139, 44, 255, 0.15) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* 3. Subtle Cyberpunk Grid with Vignette */}
      <div className="neon-grid-layer absolute inset-0 pointer-events-none" />

      {/* 4. Moving Cyber Laser Scanline traversing the background */}
      <div className="cyber-laser-beam absolute inset-x-0 h-[2px] pointer-events-none" />

      {/* 5. Diagonal Neon Corner Lines & Perimeter Glowing Accents */}
      <div className="neon-edge-wrapper absolute inset-0 pointer-events-none">
        {/* Top-Left Corner Diagonal Lines */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-44 sm:h-44">
          <svg className="w-full h-full" viewBox="0 0 160 160" fill="none">
            <path
              d="M 0 90 L 90 0"
              stroke="url(#edgeGradTL)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 0 130 L 130 0"
              stroke="url(#edgeGradTL)"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* Top-Right Corner Diagonal Lines */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-44 sm:h-44">
          <svg className="w-full h-full" viewBox="0 0 160 160" fill="none">
            <path
              d="M 160 90 L 70 0"
              stroke="url(#edgeGradTR)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 160 130 L 30 0"
              stroke="url(#edgeGradTR)"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* Bottom-Left Corner Diagonal Lines */}
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-44 sm:h-44">
          <svg className="w-full h-full" viewBox="0 0 160 160" fill="none">
            <path
              d="M 0 70 L 90 160"
              stroke="url(#edgeGradBL)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 0 30 L 130 160"
              stroke="url(#edgeGradBL)"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* Bottom-Right Corner Diagonal Lines */}
        <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-44 sm:h-44">
          <svg className="w-full h-full" viewBox="0 0 160 160" fill="none">
            <path
              d="M 160 70 L 70 160"
              stroke="url(#edgeGradBR)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 160 30 L 30 160"
              stroke="url(#edgeGradBR)"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* Subtle Edge Hairlines */}
        <div className="absolute top-0 inset-x-32 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/45 to-transparent shadow-[0_0_8px_#00E5FF]" />
        <div className="absolute bottom-0 inset-x-32 h-[1px] bg-gradient-to-r from-transparent via-[#8B2CFF]/45 to-transparent shadow-[0_0_8px_#8B2CFF]" />
        <div className="absolute left-0 inset-y-32 w-[1px] bg-gradient-to-b from-transparent via-[#0057FF]/35 to-transparent shadow-[0_0_6px_#0057FF]" />
        <div className="absolute right-0 inset-y-32 w-[1px] bg-gradient-to-b from-transparent via-[#6D28D9]/35 to-transparent shadow-[0_0_6px_#6D28D9]" />

        {/* SVG Gradients for Edge Lines */}
        <svg className="w-0 h-0 absolute" aria-hidden="true">
          <defs>
            <linearGradient id="edgeGradTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0057FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0057FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="edgeGradTR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B2CFF" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#6D28D9" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6D28D9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="edgeGradBL" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0057FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0057FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="edgeGradBR" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#8B2CFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8B2CFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 6. High-Performance Canvas for Glowing Drifting Particles & Stars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
      />
    </div>
  );
});

NeonBackground.displayName = 'NeonBackground';
