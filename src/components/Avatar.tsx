import React, { useState } from 'react';
import { motion } from 'motion/react';

/**
 * 27 Custom High-Definition Neon Badges for VIP Servers & Traders
 */
export const SERVER_PNG_MAP: Record<number, string> = {
  0: "/assets/aistudio/Tiger_Pro_343a8602.png",         // Tiger Pro
  1: "/assets/aistudio/Dragon_King_6e62e761.png",       // Dragon King
  2: "/assets/aistudio/Phoenix_VIP_94313874.png",       // Phoenix VIP
  3: "/assets/aistudio/Eagle_Eye_223ae776.png",         // Eagle Eye
  4: "/assets/aistudio/Panther_VIP_44c9c816.png",       // Lion Heart -> Panther VIP
  5: "/assets/aistudio/Thunder_Bolt_6ff24b01.png",      // Thunder Bolt
  6: "/assets/aistudio/Shadow_X_5d430730.png",          // Shadow X
  7: "/assets/aistudio/Cobra_Strike_518f070e.png",      // Cobra Strike
  8: "/assets/aistudio/Wolf_Pack_11e584b8.png",         // Wolf Pack
  9: "/assets/aistudio/Blaze_Pro_b32c2aa6.png",         // Blaze Pro
  10: "/assets/aistudio/Viper_Gold_975f4827.png",       // Viper Gold
  11: "/assets/aistudio/Rocket_Star_f4e6f786.png",      // Rocket Star
  12: "/assets/aistudio/Storm_Chaser_95985dc7.png",     // Storm Chaser
  13: "/assets/aistudio/Ghost_Rider_02307f95.png",      // Ninja Master -> Ghost Rider
  14: "/assets/aistudio/Eagle_Eye_223ae776.png",        // Falcon Rush -> Eagle Eye
  15: "/assets/aistudio/Panther_VIP_44c9c816.png",      // Panther VIP
  16: "/assets/aistudio/Ghost_Rider_02307f95.png",      // Ghost Rider
  17: "/assets/aistudio/Shark_Tank_cccbbf95.png",       // Shark Tank
  18: "/assets/aistudio/Bullet_Pro_3870a992.png",       // Bullet Pro
  19: "/assets/aistudio/Dark_Horse_6da57b7e.png",       // Dark Horse
  20: "/assets/aistudio/Quantum_Wave_0227df07.png",     // Quantum Wave
  21: "/assets/aistudio/Bollinger_King_de271694.png",   // Bollinger King
  22: "/assets/aistudio/Kalman_Master_b5f6345a.png",    // Kalman Master
  23: "/assets/aistudio/Fourier_Titan_1f4f439d.png",    // Fourier Titan
  24: "/assets/aistudio/Entropy_Core_61dc7bf8.png",     // Entropy Core
  25: "/assets/aistudio/Orderflow_Pro_f504de20.png",    // Orderflow Pro
  26: "/assets/aistudio/Fractal_VIP_2aec7744.png",      // Fractal VIP
  27: "/assets/aistudio/Hyperion_X_bbad6cc1.png",       // Hyperion X
  28: "/assets/aistudio/Cyber_Q_Alpha_4f6465fd.png",    // Cyber Q Alpha
  29: "/assets/aistudio/Delta_Vector_d92b1ab4.png",     // Delta Vector
};

export const PRO_PNG_MAP: Record<number, string> = {
  0: "/assets/aistudio/Quantum_Wave_0227df07.png",     // Quantum X
  1: "/assets/aistudio/Fourier_Titan_1f4f439d.png",    // Apex Titan
  2: "/assets/aistudio/Hyperion_X_bbad6cc1.png",       // Nova Prime
  3: "/assets/aistudio/Eagle_Eye_223ae776.png",        // Stealth Hawk
  4: "/assets/aistudio/Entropy_Core_61dc7bf8.png",     // Omega Force
  5: "/assets/aistudio/Cyber_Q_Alpha_4f6465fd.png",    // Zenith Pro
  6: "/assets/aistudio/Wolf_Pack_11e584b8.png",        // Crypto Wolf
  7: "/assets/aistudio/Bullet_Pro_3870a992.png",       // Rapid Fire
  8: "/assets/aistudio/Delta_Vector_d92b1ab4.png",     // Iron Pulse
  9: "/assets/aistudio/Shadow_X_5d430730.png",         // Shadow Blade
};

export const SERVER_NAME_PNG_MAP: Record<string, string> = {
  "tiger pro": "/assets/aistudio/Tiger_Pro_343a8602.png",
  "tiger": "/assets/aistudio/Tiger_Pro_343a8602.png",
  "dragon king": "/assets/aistudio/Dragon_King_6e62e761.png",
  "dragon": "/assets/aistudio/Dragon_King_6e62e761.png",
  "golden dragon": "/assets/aistudio/Dragon_King_6e62e761.png",
  "phoenix vip": "/assets/aistudio/Phoenix_VIP_94313874.png",
  "phoenix": "/assets/aistudio/Phoenix_VIP_94313874.png",
  "phoenix trend": "/assets/aistudio/Phoenix_VIP_94313874.png",
  "eagle eye": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "eagle": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "sniper pro": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "sniper": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "falcon rush": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "falcon": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "stealth hawk": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "hawk": "/assets/aistudio/Eagle_Eye_223ae776.png",
  "lion heart": "/assets/aistudio/Panther_VIP_44c9c816.png",
  "lion": "/assets/aistudio/Panther_VIP_44c9c816.png",
  "panther vip": "/assets/aistudio/Panther_VIP_44c9c816.png",
  "panther": "/assets/aistudio/Panther_VIP_44c9c816.png",
  "thunder bolt": "/assets/aistudio/Thunder_Bolt_6ff24b01.png",
  "thunder": "/assets/aistudio/Thunder_Bolt_6ff24b01.png",
  "shadow x": "/assets/aistudio/Shadow_X_5d430730.png",
  "shadow blade": "/assets/aistudio/Shadow_X_5d430730.png",
  "shadow": "/assets/aistudio/Shadow_X_5d430730.png",
  "cobra strike": "/assets/aistudio/Cobra_Strike_518f070e.png",
  "cobra": "/assets/aistudio/Cobra_Strike_518f070e.png",
  "wolf pack": "/assets/aistudio/Wolf_Pack_11e584b8.png",
  "crypto wolf": "/assets/aistudio/Wolf_Pack_11e584b8.png",
  "wolf": "/assets/aistudio/Wolf_Pack_11e584b8.png",
  "blaze pro": "/assets/aistudio/Blaze_Pro_b32c2aa6.png",
  "blaze": "/assets/aistudio/Blaze_Pro_b32c2aa6.png",
  "viper gold": "/assets/aistudio/Viper_Gold_975f4827.png",
  "viper": "/assets/aistudio/Viper_Gold_975f4827.png",
  "rocket star": "/assets/aistudio/Rocket_Star_f4e6f786.png",
  "rocket": "/assets/aistudio/Rocket_Star_f4e6f786.png",
  "storm chaser": "/assets/aistudio/Storm_Chaser_95985dc7.png",
  "storm": "/assets/aistudio/Storm_Chaser_95985dc7.png",
  "ninja master": "/assets/aistudio/Ghost_Rider_02307f95.png",
  "ninja": "/assets/aistudio/Ghost_Rider_02307f95.png",
  "ghost rider": "/assets/aistudio/Ghost_Rider_02307f95.png",
  "ghost": "/assets/aistudio/Ghost_Rider_02307f95.png",
  "shark tank": "/assets/aistudio/Shark_Tank_cccbbf95.png",
  "shark": "/assets/aistudio/Shark_Tank_cccbbf95.png",
  "bullet pro": "/assets/aistudio/Bullet_Pro_3870a992.png",
  "rapid fire": "/assets/aistudio/Bullet_Pro_3870a992.png",
  "bullet": "/assets/aistudio/Bullet_Pro_3870a992.png",
  "dark horse": "/assets/aistudio/Dark_Horse_6da57b7e.png",
  "horse": "/assets/aistudio/Dark_Horse_6da57b7e.png",
  "quantum wave": "/assets/aistudio/Quantum_Wave_0227df07.png",
  "quantum x": "/assets/aistudio/Quantum_Wave_0227df07.png",
  "quantum": "/assets/aistudio/Quantum_Wave_0227df07.png",
  "bollinger king": "/assets/aistudio/Bollinger_King_de271694.png",
  "bollinger": "/assets/aistudio/Bollinger_King_de271694.png",
  "kalman master": "/assets/aistudio/Kalman_Master_b5f6345a.png",
  "kalman": "/assets/aistudio/Kalman_Master_b5f6345a.png",
  "fourier titan": "/assets/aistudio/Fourier_Titan_1f4f439d.png",
  "apex titan": "/assets/aistudio/Fourier_Titan_1f4f439d.png",
  "titan master": "/assets/aistudio/Fourier_Titan_1f4f439d.png",
  "titan": "/assets/aistudio/Fourier_Titan_1f4f439d.png",
  "fourier": "/assets/aistudio/Fourier_Titan_1f4f439d.png",
  "entropy core": "/assets/aistudio/Entropy_Core_61dc7bf8.png",
  "omega force": "/assets/aistudio/Entropy_Core_61dc7bf8.png",
  "entropy": "/assets/aistudio/Entropy_Core_61dc7bf8.png",
  "orderflow pro": "/assets/aistudio/Orderflow_Pro_f504de20.png",
  "orderflow": "/assets/aistudio/Orderflow_Pro_f504de20.png",
  "fractal vip": "/assets/aistudio/Fractal_VIP_2aec7744.png",
  "fractal": "/assets/aistudio/Fractal_VIP_2aec7744.png",
  "hyperion x": "/assets/aistudio/Hyperion_X_bbad6cc1.png",
  "nova prime": "/assets/aistudio/Hyperion_X_bbad6cc1.png",
  "hyperion": "/assets/aistudio/Hyperion_X_bbad6cc1.png",
  "cyber q alpha": "/assets/aistudio/Cyber_Q_Alpha_4f6465fd.png",
  "zenith pro": "/assets/aistudio/Cyber_Q_Alpha_4f6465fd.png",
  "cyber matrix": "/assets/aistudio/Cyber_Q_Alpha_4f6465fd.png",
  "cyber": "/assets/aistudio/Cyber_Q_Alpha_4f6465fd.png",
  "delta vector": "/assets/aistudio/Delta_Vector_d92b1ab4.png",
  "iron pulse": "/assets/aistudio/Delta_Vector_d92b1ab4.png",
  "delta": "/assets/aistudio/Delta_Vector_d92b1ab4.png",
};

export function getServerBadge(index?: number, isPro?: boolean, name?: string): string | null {
  if (name) {
    const clean = name.toLowerCase().trim();
    if (SERVER_NAME_PNG_MAP[clean]) {
      return SERVER_NAME_PNG_MAP[clean];
    }
    for (const [k, v] of Object.entries(SERVER_NAME_PNG_MAP)) {
      if (clean.includes(k)) {
        return v;
      }
    }
  }

  if (isPro && typeof index === 'number') {
    const safeIdx = Math.abs(index) % 10;
    if (PRO_PNG_MAP[safeIdx]) return PRO_PNG_MAP[safeIdx];
  }

  if (typeof index === 'number') {
    const safeIdx = Math.abs(index) % 30;
    if (SERVER_PNG_MAP[safeIdx]) return SERVER_PNG_MAP[safeIdx];
  }

  return SERVER_PNG_MAP[0];
}

const AVATAR_NAMES = [
  "tiger", "dragon", "phoenix", "eagle", "lion", "thunder", "shadow", "cobra", "wolf", "blaze",
  "bee", "rocket", "storm", "ninja", "falcon", "panther", "ghost", "shark", "bullet", "horse",
  "quantum", "bull", "target", "radar", "core", "diamond", "fractal", "mecha", "bot", "compass"
];

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

const SVGS: Record<string, string> = {
  brain: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bgBrain" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#4c1d95"/>
      <stop offset="60%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#090514"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="26" fill="url(#bgBrain)"/>
  <rect width="94" height="94" x="3" y="3" rx="24" fill="none" stroke="#818cf8" stroke-width="2" stroke-opacity="0.7"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#c084fc" stroke-width="1" stroke-dasharray="3 4" stroke-opacity="0.3"/>
  <circle cx="50" cy="50" r="33" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 3" stroke-opacity="0.4"/>
  <path d="M46 22 C34 22 22 30 22 43 C22 49 25 54 28 58 C24 64 24 72 29 77 C34 82 42 81 46 80 Z" fill="#8b5cf6" stroke="#c084fc" stroke-width="2.5"/>
  <path d="M26 43 C33 41 38 46 46 44" fill="none" stroke="#e0e7ff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M28 58 C35 55 40 62 46 62" fill="none" stroke="#e0e7ff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M33 72 C38 69 42 73 46 72" fill="none" stroke="#e0e7ff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M54 22 C66 22 78 30 78 43 C78 49 75 54 72 58 C76 64 76 72 71 77 C66 82 58 81 54 80 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M74 43 C67 41 62 46 54 44" fill="none" stroke="#f0f9ff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M72 58 C65 55 60 62 54 62" fill="none" stroke="#f0f9ff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M67 72 C62 69 58 73 54 72" fill="none" stroke="#f0f9ff" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="47" y="24" width="6" height="54" rx="3" fill="#38bdf8"/>
  <circle cx="34" cy="36" r="4" fill="#ffffff" stroke="#c084fc" stroke-width="1.5"/>
  <circle cx="66" cy="36" r="4" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="50" cy="50" r="5" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
  <circle cx="36" cy="65" r="3.5" fill="#f43f5e"/>
  <circle cx="64" cy="65" r="3.5" fill="#10b981"/>
</svg>`,
  dragon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bgDragon" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="60%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#01140e"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="26" fill="url(#bgDragon)"/>
  <rect width="94" height="94" x="3" y="3" rx="24" fill="none" stroke="#10b981" stroke-width="2" stroke-opacity="0.8"/>
  <path d="M38 34 C32 18 20 14 12 16 C18 24 24 28 30 40 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
  <path d="M62 34 C68 18 80 14 88 16 C82 24 76 28 70 40 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
  <polygon points="50,14 44,28 56,28" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <path d="M50 24 C34 24 26 38 24 54 C22 68 32 82 50 86 C68 82 78 68 76 54 C74 38 66 24 50 24 Z" fill="#047857" stroke="#34d399" stroke-width="2.5"/>
  <path d="M50 30 C38 30 32 42 30 56 C30 68 38 78 50 80 C62 78 70 68 70 56 C68 42 62 30 50 30 Z" fill="#10b981"/>
  <ellipse cx="38" cy="48" rx="6" ry="4" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
  <ellipse cx="38" cy="48" rx="2" ry="4" fill="#000000"/>
  <ellipse cx="62" cy="48" rx="6" ry="4" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
  <ellipse cx="62" cy="48" rx="2" ry="4" fill="#000000"/>
  <path d="M40 64 C44 60 56 60 60 64 L56 74 L44 74 Z" fill="#022c22" stroke="#34d399" stroke-width="1.5"/>
  <circle cx="45" cy="67" r="2.5" fill="#facc15"/>
  <circle cx="55" cy="67" r="2.5" fill="#facc15"/>
  <polygon points="42,74 46,74 44,82" fill="#ffffff"/>
  <polygon points="54,74 58,74 56,82" fill="#ffffff"/>
  <path d="M38 68 C22 66 12 76 10 86" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  <path d="M62 68 C78 66 88 76 90 86" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  tiger: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bgTiger" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#c2410c"/>
      <stop offset="60%" stop-color="#7c2d12"/>
      <stop offset="100%" stop-color="#240a02"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="26" fill="url(#bgTiger)"/>
  <rect width="94" height="94" x="3" y="3" rx="24" fill="none" stroke="#fb923c" stroke-width="2" stroke-opacity="0.8"/>
  <polygon points="20,20 38,34 18,44" fill="#ea580c" stroke="#fef08a" stroke-width="1.5"/>
  <polygon points="80,20 62,34 82,44" fill="#ea580c" stroke="#fef08a" stroke-width="1.5"/>
  <polygon points="50,22 28,38 24,62 50,86 76,62 72,38" fill="#f97316" stroke="#431407" stroke-width="2"/>
  <path d="M50 24 L50 38 M42 28 L58 28 M44 34 L56 34" stroke="#0f0502" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="38" cy="46" rx="5.5" ry="3.5" fill="#10b981" stroke="#ffffff" stroke-width="1"/>
  <circle cx="38" cy="46" r="2" fill="#064e3b"/>
  <ellipse cx="62" cy="46" rx="5.5" ry="3.5" fill="#10b981" stroke="#ffffff" stroke-width="1"/>
  <circle cx="62" cy="46" r="2" fill="#064e3b"/>
  <polygon points="46,58 54,58 50,64" fill="#ef4444"/>
  <path d="M42 68 C46 64 54 64 58 68 L54 76 L46 76 Z" fill="#ffffff" stroke="#000" stroke-width="1.5"/>
</svg>`,
  pro: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bgPro" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#854d0e"/>
      <stop offset="60%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1f0701"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="26" fill="url(#bgPro)"/>
  <polygon points="22,38 32,60 50,32 68,60 78,38 72,76 28,76" fill="#facc15" stroke="#713f12" stroke-width="2"/>
  <circle cx="50" cy="32" r="4.5" fill="#ffffff"/>
  <circle cx="22" cy="38" r="3.5" fill="#ffffff"/>
  <circle cx="78" cy="38" r="3.5" fill="#ffffff"/>
</svg>`
};

const URI_CACHE: Record<string, string> = {};

function getAvatarUri(key: string): string {
  if (!URI_CACHE[key]) {
    const raw = SVGS[key] || SVGS.tiger;
    URI_CACHE[key] = svgDataUri(raw);
  }
  return URI_CACHE[key];
}

function resolveAvatarKey(index?: number, isAi?: boolean, isPro?: boolean, theme?: string): string {
  if (isAi) return "brain";
  if (theme) return theme;
  if (isPro) return "pro";
  const safeIdx = Math.abs(index ?? 0) % AVATAR_NAMES.length;
  return AVATAR_NAMES[safeIdx] || "tiger";
}

export interface AvatarProps {
  index?: number;
  name?: string;
  isPro?: boolean;
  isAi?: boolean;
  theme?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
  animated?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  index = 0,
  name,
  isPro = false,
  isAi = false,
  theme,
  size = 'md',
  className = '',
  alt,
  animated = true
}) => {
  const [hasImgError, setHasImgError] = useState(false);

  // If AI, use the dedicated animated cognitive brain SVG
  // Otherwise, use the user-uploaded high-definition neon PNG badge
  const pngBadge = !isAi && !hasImgError ? getServerBadge(index, isPro, name) : null;
  const avatarKey = resolveAvatarKey(index, isAi, isPro, theme);
  const fallbackUri = getAvatarUri(avatarKey);

  const displaySrc = pngBadge || fallbackUri;

  const sizeClasses = {
    xs: "h-7 w-7 rounded-lg",
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-xl",
    lg: "h-13 w-13 rounded-2xl",
    xl: "h-16 w-16 rounded-2xl",
    '2xl': "h-20 w-20 rounded-2xl"
  }[size];

  const ringClasses = isAi
    ? "ring-2 ring-violet-500/70 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
    : isPro
    ? "ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
    : "ring-1.5 ring-cyan-400/50 shadow-[0_0_12px_rgba(0,217,255,0.35)]";

  const content = (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden select-none bg-[#020817] ${sizeClasses} ${ringClasses} ${className}`}>
      <img
        src={displaySrc}
        alt={alt || name || `${avatarKey} avatar`}
        onError={() => setHasImgError(true)}
        className="w-full h-full object-cover rounded-[inherit] pointer-events-none select-none contrast-[1.08] brightness-[1.03]"
        loading="eager"
        decoding="sync"
        draggable={false}
      />
      <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20 pointer-events-none" />
      {isAi && (
        <div className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-cyan-400 ring-1 ring-violet-900 animate-ping" />
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1.5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="inline-flex"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
