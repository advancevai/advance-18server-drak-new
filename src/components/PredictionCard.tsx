import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Activity, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import { NumberBall } from './NumberBall';

export interface PredictionCardProps {
  prediction?: 'BIG' | 'SMALL';
  confidence?: number;
  predictedNumber?: number;
  currentPeriod?: string;
  className?: string;
  mode?: '30s' | '1m';
  theme?: 'white' | 'dark';
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction = "BIG",
  confidence = 85,
  predictedNumber = 7,
  currentPeriod = "",
  className = "",
  mode = "30s"
}) => {
  const isBig = prediction === "BIG";
  const safeConf = Number.isFinite(confidence) ? Math.min(100, Math.max(0, confidence)) : 80;
  const safeNum = Number.isFinite(predictedNumber) ? predictedNumber : (isBig ? 7 : 2);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [currentPeriod, prediction, predictedNumber]);

  const circumference = 2 * Math.PI * 68;
  const strokeDashoffset = circumference - (safeConf / 100) * circumference;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#0B1E3B] border border-[#173B70] shadow-[0_10px_35px_rgba(2,8,23,0.7)] hover:-translate-y-0.5 hover:border-[#00E5FF]/65 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_22px_rgba(0,87,255,0.25),0_0_12px_rgba(0,229,255,0.2)] transition-all duration-300 ${className}`}
      id="prediction-card"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-[#8B5CF6]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#00FF88]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Moving Cyber Scanline */}
      <motion.div
        className="absolute inset-x-0 h-[2px] z-20 pointer-events-none bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_12px_#00D9FF]"
        animate={{
          top: ["-5%", "105%"],
          opacity: [0, 0.85, 0.85, 0]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#173B70] bg-[#061126]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute h-full w-full rounded-full bg-[#00FF88] animate-ping opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A9B8D0]">
            TARGET PERIOD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-[#00D9FF] tabular-nums tracking-wider bg-[#00D9FF]/10 border border-[#00D9FF]/30 px-2.5 py-0.5 rounded-lg shadow-[0_0_10px_rgba(0,217,255,0.15)]">
            {currentPeriod || "—"}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 text-[#8B5CF6]">
            {mode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Signal Display with Glowing Circular Neon Ring */}
      <div className="px-5 py-6 flex flex-col items-center relative z-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`wave-${pulseKey}`}
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className="absolute h-44 w-44 rounded-full border-2 border-[#00D9FF]/40 pointer-events-none"
          />
        </AnimatePresence>

        <div className="relative flex items-center justify-center my-2">
          {/* Outer Multi-Color Rotating Reticle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute h-52 w-52 rounded-full border border-dashed border-[#00D9FF]/30 pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute h-48 w-48 rounded-full border border-dotted border-[#8B5CF6]/40 pointer-events-none"
          />

          {/* Glowing Circular Neon Ring */}
          <div className="relative h-44 w-44 rounded-full flex items-center justify-center neon-ring-container">
            {/* Ambient Multi-Hue Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B5CF6]/20 via-[#00D9FF]/25 to-[#00FF88]/20 blur-md pointer-events-none neon-pulse-ring" />

            <svg className="absolute inset-0 h-44 w-44 -rotate-90 pointer-events-none" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="neonGradientSignal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#00D9FF" />
                  <stop offset="100%" stopColor="#00FF88" />
                </linearGradient>
                <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Base Ring in Navy */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#173B70"
                strokeWidth="6"
                strokeOpacity="0.8"
              />

              {/* Glowing Dynamic SVG Arc */}
              <motion.circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="url(#neonGradientSignal)"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                filter="url(#neonGlowFilter)"
              />
            </svg>

            {/* Dark Inner Background Container */}
            <div className="relative h-32 w-32 rounded-full bg-[#061126] border border-[#173B70] shadow-[inset_0_0_24px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center text-center z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${prediction}-${safeNum}-${currentPeriod}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00D9FF] flex items-center gap-1 mb-0.5">
                    <Sparkles className="h-2.5 w-2.5 text-[#00D9FF]" />
                    AI VIP SIGNAL
                  </span>

                  {/* Clear White Main Prediction Text */}
                  <motion.h2
                    initial={{ y: 6, scale: 0.85 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="text-3xl sm:text-4xl font-extrabold tracking-wider leading-none text-[#FFFFFF] drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  >
                    {prediction}
                  </motion.h2>

                  <div className="flex items-center gap-1.5 mt-2 bg-[#0B1E3B] border border-[#173B70] pl-2 pr-2.5 py-0.5 rounded-full shadow-inner">
                    <Target className="h-3 w-3 text-[#00D9FF]" />
                    <span className="text-[9px] font-mono text-[#A9B8D0] uppercase font-bold">Target:</span>
                    <NumberBall number={safeNum} size="xs" animated />
                    <span className="font-mono text-xs font-black tabular-nums text-[#FFFFFF]">
                      {safeNum}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mt-3 w-full max-w-[260px] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#A9B8D0] font-semibold uppercase flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#00D9FF] neon-icon-glow" />
              CONFIDENCE
            </span>
            <span className="font-bold tabular-nums font-mono text-[#00FF88] glow-text-green">
              {safeConf}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#061126] border border-[#173B70] p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${safeConf}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#00D9FF] to-[#00FF88] shadow-[0_0_8px_#00FF88]"
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] pt-0.5">
            <span>MIN 60%</span>
            <span className="text-[#8B5CF6] font-semibold">NEURAL ACCURACY</span>
            <span className="text-[#00FF88]">MAX 99%</span>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2.5 border-t border-[#173B70] bg-[#061126]/90 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00FF88] font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00FF88] neon-icon-glow" />
          <span>ALGORITHM VERIFIED</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#8B5CF6]">
          <Flame className="h-3 w-3 text-[#8B5CF6] neon-icon-glow" />
          <span>HIGH PROBABILITY</span>
        </div>
      </div>
    </div>
  );
};
