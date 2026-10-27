import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from 'react';
import { createClient } from '@supabase/supabase-js';
import { verifyPassGatePassword, verifyPassGateSession } from './passgate';

export const SUPABASE_URL = "https://oqwotbubsfondfhsmteu.supabase.co";
export const SUPABASE_KEY = "sb_publishable_w7vUXswlyg2lmmjmGDqxEQ_lshbzjad";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const VERSION = "v5";
const UNLOCK_KEY = "signal_unlocked";
const VERSION_KEY = "signal_pw_version";
const PG_TOKEN_KEY = "pg_token";
import { APP_CONFIG } from '../config/appConfig';

const FAIL_COUNT_KEY = "signal_fail_count";
const LOCKOUT_KEY = "signal_lockout_until";
const MAX_FAILS = 5;
const LOCKOUT_MS = 30000;
const FALLBACK_PASSWORD = "DRX-TM-12321";
export const DEFAULT_TELEGRAM = APP_CONFIG.telegram;

export interface SignalAuthContextType {
  isUnlocked: boolean;
  unlock: (pw: string) => Promise<string>;
  lock: () => void;
  isVerifying: boolean;
  telegramLink: string;
}

export const SignalAuthContext = createContext<SignalAuthContextType>({
  isUnlocked: false,
  unlock: async () => "network_error",
  lock: () => {},
  isVerifying: false,
  telegramLink: DEFAULT_TELEGRAM,
});

export const useSignalAuth = () => useContext(SignalAuthContext);

export function SignalAuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      if (localStorage.getItem(PG_TOKEN_KEY)) return true;
      if (sessionStorage.getItem(VERSION_KEY) !== VERSION) {
        sessionStorage.removeItem(UNLOCK_KEY);
        sessionStorage.removeItem(VERSION_KEY);
        return false;
      }
      return sessionStorage.getItem(UNLOCK_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [telegramLink, setTelegramLink] = useState(DEFAULT_TELEGRAM);

  const [failCount, setFailCount] = useState<number>(() => {
    try {
      const v = sessionStorage.getItem(FAIL_COUNT_KEY);
      return (v && parseInt(v, 10)) || 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    try {
      const v = sessionStorage.getItem(LOCKOUT_KEY);
      return (v && parseInt(v, 10)) || 0;
    } catch {
      return 0;
    }
  });

  // Verify existing PassGate token on mount
  useEffect(() => {
    const pgToken = typeof localStorage !== "undefined" ? localStorage.getItem(PG_TOKEN_KEY) : null;
    if (pgToken) {
      verifyPassGateSession(pgToken).then((valid) => {
        if (valid) {
          setIsUnlocked(true);
          try {
            sessionStorage.setItem(UNLOCK_KEY, "true");
            sessionStorage.setItem(VERSION_KEY, VERSION);
          } catch {}
        } else {
          try {
            localStorage.removeItem(PG_TOKEN_KEY);
          } catch {}
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("telegram_link")
          .eq("id", 1)
          .maybeSingle();

        if (data?.telegram_link && !data.telegram_link.includes("SB_COMMUNITY")) {
          setTelegramLink(data.telegram_link);
        } else {
          setTelegramLink(DEFAULT_TELEGRAM);
        }
      } catch (e) {
        console.warn("Could not fetch telegram_link:", e);
      }
    })();
  }, []);

  const unlock = useCallback(async (rawInput: string): Promise<string> => {
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      return `অনুগ্রহ করে ${remainingSec} সেকেন্ড অপেক্ষা করুন`;
    }

    setIsVerifying(true);
    const trimmed = typeof rawInput === "string" ? rawInput.trim().slice(0, 100) : "";

    try {
      // 1. First, verify with PassGate API
      const pgResult = await verifyPassGatePassword(trimmed);
      if (pgResult.valid) {
        setIsUnlocked(true);
        setFailCount(0);
        try {
          if (pgResult.token) localStorage.setItem(PG_TOKEN_KEY, pgResult.token);
          sessionStorage.setItem(UNLOCK_KEY, "true");
          sessionStorage.setItem(VERSION_KEY, VERSION);
          sessionStorage.removeItem(FAIL_COUNT_KEY);
          sessionStorage.removeItem(LOCKOUT_KEY);
        } catch {}
        return "success";
      }

      if (pgResult.reason === "rate_limited") {
        return "rate_limited";
      }
      if (pgResult.reason === "ip_blocked") {
        return "ip_blocked";
      }

      // 2. Local Master Overrides & Supabase DB password fallbacks
      if (
        trimmed === "DRX-TM-12321" ||
        trimmed.toUpperCase() === "DRX-TM-12321" ||
        trimmed === "@#৳_&-+()/" ||
        trimmed.toUpperCase() === "VIP" ||
        trimmed === "1234"
      ) {
        setIsUnlocked(true);
        setFailCount(0);
        try {
          sessionStorage.setItem(UNLOCK_KEY, "true");
          sessionStorage.setItem(VERSION_KEY, VERSION);
          sessionStorage.removeItem(FAIL_COUNT_KEY);
          sessionStorage.removeItem(LOCKOUT_KEY);
        } catch {}
        return "success";
      }

      const { data, error } = await supabase
        .from("app_settings")
        .select("signal_password")
        .eq("id", 1)
        .maybeSingle();

      if (error) console.warn("Supabase fetch error:", error);

      const dbPass = data?.signal_password || FALLBACK_PASSWORD;
      if (dbPass && (trimmed === dbPass.trim() || trimmed.toUpperCase() === dbPass.trim().toUpperCase())) {
        setIsUnlocked(true);
        setFailCount(0);
        try {
          sessionStorage.setItem(UNLOCK_KEY, "true");
          sessionStorage.setItem(VERSION_KEY, VERSION);
          sessionStorage.removeItem(FAIL_COUNT_KEY);
          sessionStorage.removeItem(LOCKOUT_KEY);
        } catch {}
        return "success";
      }

      if (pgResult.reason && pgResult.reason !== "wrong_password") {
        return pgResult.reason;
      }

      const nextFails = failCount + 1;
      setFailCount(nextFails);
      try {
        sessionStorage.setItem(FAIL_COUNT_KEY, String(nextFails));
      } catch {}

      if (nextFails >= MAX_FAILS) {
        const lockoutTime = Date.now() + LOCKOUT_MS;
        setLockoutUntil(lockoutTime);
        try {
          sessionStorage.setItem(LOCKOUT_KEY, String(lockoutTime));
        } catch {}
        return "অনেকবার ভুল পাসওয়ার্ড দেওয়া হয়েছে। ৩০ সেকেন্ড অপেক্ষা করুন।";
      }

      return "invalid_password";
    } catch (e) {
      console.error("Error during unlock:", e);
      return "network_error";
    } finally {
      setIsVerifying(false);
    }
  }, [failCount, lockoutUntil]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem(PG_TOKEN_KEY);
      sessionStorage.removeItem(UNLOCK_KEY);
    } catch {}
  }, []);

  return createElement(
    SignalAuthContext.Provider,
    { value: { isUnlocked, unlock, lock, isVerifying, telegramLink } },
    children
  );
}

