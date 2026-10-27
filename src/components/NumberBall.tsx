import React, { useState } from 'react';

export interface NumberBallProps {
  number: number | string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showGlow?: boolean;
}

export const NUMBER_ASSETS: Record<number, string> = {
  0: "/assets/numbers/0.png",
  1: "/assets/numbers/1.png",
  2: "/assets/numbers/2.png",
  3: "/assets/numbers/3.png",
  4: "/assets/numbers/4.png",
  5: "/assets/numbers/5.png",
  6: "/assets/numbers/6.png",
  7: "/assets/numbers/7.png",
  8: "/assets/numbers/8.png",
  9: "/assets/numbers/9.png",
};

const SIZE_MAP = {
  xs: {
    container: "h-4 w-4 min-w-[16px]",
    text: "text-[9px]",
    glow: "shadow-[0_0_6px_rgba(0,217,255,0.3)]"
  },
  sm: {
    container: "h-6 w-6 min-w-[24px]",
    text: "text-xs",
    glow: "shadow-[0_0_8px_rgba(0,217,255,0.35)]"
  },
  md: {
    container: "h-8 w-8 min-w-[32px]",
    text: "text-sm",
    glow: "shadow-[0_0_12px_rgba(0,217,255,0.4)]"
  },
  lg: {
    container: "h-11 w-11 min-w-[44px]",
    text: "text-lg",
    glow: "shadow-[0_0_16px_rgba(0,217,255,0.45)]"
  },
  xl: {
    container: "h-14 w-14 min-w-[56px]",
    text: "text-2xl",
    glow: "shadow-[0_0_20px_rgba(0,217,255,0.5)]"
  }
};

export const NumberBall: React.FC<NumberBallProps> = ({
  number,
  size = "sm",
  animated = false,
  className = "",
  showGlow = true
}) => {
  const [hasError, setHasError] = useState(false);

  const parsed = number !== null && number !== undefined && number !== ""
    ? Number(number)
    : NaN;

  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 9;
  const num = isValid ? Math.floor(parsed) : null;
  const config = SIZE_MAP[size] || SIZE_MAP.sm;

  if (num === null) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#0B1E3B] text-[#64748B] border border-[#173B70] font-mono font-bold ${config.container} ${config.text} ${className}`}
      >
        —
      </span>
    );
  }

  const imageSrc = NUMBER_ASSETS[num];

  // If image loaded cleanly
  if (!hasError && imageSrc) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${config.container} ${className} ${
          animated ? "hover:scale-110 transition-transform duration-200" : ""
        }`}
      >
        <img
          src={imageSrc}
          alt={`Number ${num}`}
          onError={() => setHasError(true)}
          className={`h-full w-full object-contain ${showGlow ? config.glow : ""} rounded-full`}
        />
      </div>
    );
  }

  // Fallback CSS styled ball if image fails
  const isPurple = num === 0 || num === 5;
  const isRed = num % 2 === 0;

  const bgStyle = isPurple
    ? "bg-gradient-to-tr from-[#8B5CF6] via-[#6D28D9] to-[#00E5FF] text-white border-[#8B5CF6]"
    : isRed
    ? "bg-gradient-to-tr from-[#FF3864] to-[#FF6B8B] text-white border-[#FF3864]"
    : "bg-gradient-to-tr from-[#00FF88] to-[#00D9FF] text-[#020817] border-[#00FF88]";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-black border shadow-sm ${config.container} ${config.text} ${bgStyle} ${className} ${
        animated ? "hover:scale-110 transition-transform duration-200" : ""
      }`}
    >
      {num}
    </span>
  );
};
