import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, LoaderCircle, TriangleAlert, WifiOff, ServerCrash, Lock } from 'lucide-react';
import { useSignalAuth } from '../services/supabase';
import { getPassGateMessage } from '../services/passgate';
import { APP_CONFIG } from '../config/appConfig';

export interface UnlockModalProps {
  children: React.ReactNode;
  englishMode?: boolean;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ children, englishMode = false }) => {
  const { isUnlocked, unlock, isVerifying, telegramLink } = useSignalAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  if (isUnlocked) {
    return <div id="pg-secret" style={{ display: 'block' }}>{children}</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setErrorStatus(null);

    const result = await unlock(password);
    if (result !== "success") {
      setErrorStatus(result);
      if (result === "invalid_password" || result === "wrong_password") {
        setIsShaking(true);
        const link = telegramLink && !telegramLink.includes("SB_COMMUNITY")
          ? telegramLink
          : APP_CONFIG.telegram;
        setTimeout(() => {
          window.location.href = link;
        }, 700);
      }
      setTimeout(() => setErrorStatus(null), 4000);
    }
  };

  const getErrorMessage = () => {
    if (!errorStatus) return null;
    switch (errorStatus) {
      case "invalid_password":
      case "wrong_password":
        return {
          icon: null,
          text: englishMode
            ? "❌ Invalid Key! Redirecting to Telegram..."
            : "❌ ভুল পাসওয়ার্ড! টেলিগ্রামে নিয়ে যাওয়া হচ্ছে..."
        };
      case "rate_limited":
        return {
          icon: <TriangleAlert className="h-3.5 w-3.5" />,
          text: getPassGateMessage("rate_limited", englishMode)
        };
      case "ip_blocked":
        return {
          icon: <TriangleAlert className="h-3.5 w-3.5" />,
          text: getPassGateMessage("ip_blocked", englishMode)
        };
      case "origin_not_allowed":
        return {
          icon: <TriangleAlert className="h-3.5 w-3.5" />,
          text: getPassGateMessage("origin_not_allowed", englishMode)
        };
      case "invalid_api_key":
        return {
          icon: <TriangleAlert className="h-3.5 w-3.5" />,
          text: getPassGateMessage("invalid_api_key", englishMode)
        };
      case "network_error":
        return {
          icon: <WifiOff className="h-3.5 w-3.5" />,
          text: getPassGateMessage("network_error", englishMode)
        };
      case "server_error":
        return {
          icon: <ServerCrash className="h-3.5 w-3.5" />,
          text: englishMode
            ? "Server error, please retry shortly"
            : "সার্ভারে সমস্যা, কিছুক্ষণ পর চেষ্টা করুন"
        };
      default:
        return {
          icon: <TriangleAlert className="h-3.5 w-3.5" />,
          text: errorStatus
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="relative min-h-[65vh] sm:min-h-[72vh] flex items-center justify-center w-full my-auto">
      <div id="pg-secret" style={{ display: 'none' }} className="blur-md pointer-events-none select-none opacity-20">
        {children}
      </div>

      <div id="pg-gate" className="w-full flex items-center justify-center z-20 px-4 py-6">
        <div
          className={`w-full max-w-sm rounded-3xl bg-[#071A38]/90 backdrop-blur-2xl border border-[#00E5FF]/30 shadow-[0_24px_64px_-12px_rgba(2,6,17,0.95),0_0_35px_rgba(0,140,255,0.18)] p-6 sm:p-7 space-y-5 relative overflow-hidden transition-all ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          {/* Ambient luminous glow spots */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#008CFF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#7000FF]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top subtle cyan-blue neon line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_12px_#00E5FF]" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <div className="relative group">
              <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#00E5FF]/40 via-[#008CFF]/30 to-[#7000FF]/40 shadow-[0_0_24px_rgba(0,229,255,0.25)]">
                <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-[#020611] border border-[#00E5FF]/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={APP_CONFIG.profileImage}
                    alt={APP_CONFIG.name}
                    className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-xl drop-shadow-[0_4px_10px_rgba(0,140,255,0.4)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/advance_logo.png";
                    }}
                  />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00FF88] border-2 border-[#071A38] shadow-[0_0_8px_#00FF88]" />
              </span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_14px_rgba(0,229,255,0.35)] flex items-center justify-center gap-2">
                <span>{APP_CONFIG.name} VIP</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#00FF88] bg-[#00FF88]/15 border border-[#00FF88]/40 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(0,255,136,0.3)]">
                  LIVE
                </span>
              </h3>
              <p className="text-xs sm:text-[13px] text-[#A9B8D0] mt-1 flex items-center justify-center gap-1.5 font-mono font-medium">
                <Lock className="h-3.5 w-3.5 text-[#00E5FF] drop-shadow-[0_0_6px_#00E5FF]" />
                <span>{englishMode ? "Enter Access Key to view signals" : "সিগন্যাল দেখতে পাসওয়ার্ড দিন"}</span>
              </p>
            </div>
          </div>

          {/* Password Form with PassGate DOM IDs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00E5FF] drop-shadow-[0_0_6px_rgba(0,229,255,0.4)] transition-colors pointer-events-none" />
              <input
                id="pg-pass"
                type={showPassword ? "text" : "password"}
                placeholder={englishMode ? "Enter VIP Access Key" : "পাসওয়ার্ড লিখুন"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorStatus(null);
                }}
                className={`w-full rounded-xl border bg-[#071A38] pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 transition-all font-mono tracking-wider ${
                  errorStatus === "invalid_password" || errorStatus === "wrong_password"
                    ? "border-[#FF3864] focus:border-[#FF3864] focus:ring-[#FF3864]/30 shadow-[0_0_15px_rgba(255,56,100,0.25)]"
                    : "border-[#00E5FF]/40 focus:border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.12)]"
                }`}
                autoFocus
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B8D0] hover:text-[#00E5FF] hover:drop-shadow-[0_0_8px_#00E5FF] p-1.5 rounded-lg transition-all cursor-pointer"
                id="password-visibility-toggle"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-[#00E5FF]" /> : <Eye className="h-4 w-4 text-[#A9B8D0] hover:text-[#00E5FF]" />}
              </button>
            </div>

            <div id="pg-msg" className="min-h-[18px] text-center font-mono">
              {isVerifying ? (
                <span className="text-xs font-semibold text-[#00E5FF] animate-pulse">
                  {englishMode ? "Verifying VIP Key…" : "যাচাই করা হচ্ছে…"}
                </span>
              ) : errorInfo ? (
                <div
                  className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${
                    errorStatus === "invalid_password" || errorStatus === "wrong_password"
                      ? "text-[#FF3864]"
                      : "text-[#FFB700]"
                  }`}
                >
                  {errorInfo.icon}
                  <span>{errorInfo.text}</span>
                </div>
              ) : null}
            </div>

            <button
              id="pg-btn"
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-xl bg-gradient-to-r from-[#7000FF] via-[#008CFF] to-[#00FF88] hover:from-[#7000FF] hover:via-[#00E5FF] hover:to-[#00FF88] border border-[#00E5FF]/50 hover:border-[#00FF88] px-4 py-3.5 text-sm sm:text-base font-extrabold text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(0,140,255,0.45),0_0_14px_rgba(0,255,136,0.35),0_4px_16px_rgba(112,0,255,0.4)]"
            >
              {isVerifying ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                  <span>{englishMode ? "Verifying…" : "যাচাই করা হচ্ছে..."}</span>
                </>
              ) : (
                <span>{englishMode ? "🔓 UNLOCK VIP SIGNALS" : "🔓 আনলক করুন"}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
