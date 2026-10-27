import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Radio, Sparkles, Shield, Trophy, Crown, Brain, Star, Flame, ChevronRight, Activity, Cpu } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { fetchWingo30s, fetchWingo1m, calculateTraderHistory } from '../services/api';
import { supabase } from '../services/supabase';
import { TRADERS } from '../services/algorithms';
import { APP_CONFIG } from '../config/appConfig';

const LOGO_URL = APP_CONFIG.profileImage;

export const Home: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeMsg, setWelcomeMsg] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const [top30s, setTop30s] = useState<any[]>([]);
  const [streak30s, setStreak30s] = useState({ index: 0, streak: 0 });

  const [top1m, setTop1m] = useState<any[]>([]);
  const [streak1m, setStreak1m] = useState({ index: 0, streak: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const processDrawStats = (results: any[]) => {
    const byTrader: Record<number, string[]> = {};
    results.forEach(r => {
      if (typeof r.signal_index === "number" && !isNaN(r.signal_index)) {
        if (!byTrader[r.signal_index]) byTrader[r.signal_index] = [];
        if (byTrader[r.signal_index].length < 50 && r.result) {
          byTrader[r.signal_index].push(r.result);
        }
      }
    });

    const stats = Object.entries(byTrader).map(([idxStr, resList]) => {
      const idx = parseInt(idxStr, 10);
      const wins = resList.filter(x => x === "WIN").length;
      const total = resList.length;
      let maxS = 0;
      let curS = 0;
      for (const res of resList) {
        if (res === "WIN") {
          curS++;
          maxS = Math.max(maxS, curS);
        } else {
          curS = 0;
        }
      }
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return {
        index: idx,
        winRate,
        wins,
        total,
        maxWinStreak: maxS
      };
    }).sort((a, b) => b.winRate - a.winRate || (b.maxWinStreak || 0) - (a.maxWinStreak || 0));

    let best = { index: 0, streak: 0 };
    stats.forEach(s => {
      if ((s.maxWinStreak || 0) > best.streak) {
        best = { index: s.index, streak: s.maxWinStreak };
      }
    });

    return {
      top: stats.slice(0, 3),
      bestStreak: best
    };
  };

  const loadData = async () => {
    try {
      const [d30, d1] = await Promise.all([fetchWingo30s(), fetchWingo1m()]);
      const list30: any[] = [];
      for (let i = 0; i < 30; i++) {
        calculateTraderHistory(d30, i, "30s").forEach(r => {
          list30.push({ signal_index: i, result: r.result || "PENDING" });
        });
      }

      const list1: any[] = [];
      for (let i = 0; i < 30; i++) {
        calculateTraderHistory(d1, i, "1m").forEach(r => {
          list1.push({ signal_index: i, result: r.result || "PENDING" });
        });
      }

      const res30 = processDrawStats(list30);
      const res1 = processDrawStats(list1);

      setTop30s(res30.top);
      setStreak30s(res30.bestStreak);
      setTop1m(res1.top);
      setStreak1m(res1.bestStreak);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    (async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("welcome_message")
          .eq("id", 1)
          .maybeSingle();

        if (data?.welcome_message) {
          setWelcomeMsg(data.welcome_message);
          try {
            if (!sessionStorage.getItem("has_seen_welcome")) {
              setShowWelcome(true);
              sessionStorage.setItem("has_seen_welcome", "true");
            }
          } catch {}
        }
      } catch (e) {
        console.warn("Welcome message error:", e);
      }
    })();

    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen futuristic-bg text-[#FFFFFF] pb-14 font-sans antialiased">
      {/* Welcome Message Modal */}
      {showWelcome && welcomeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-center fade-in">
            <div className="h-14 w-14 rounded-2xl bg-[#061126] border border-[#00D9FF]/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(0,217,255,0.25)]">
              <Sparkles className="h-7 w-7 text-[#00D9FF]" />
            </div>
            <h2 className="text-lg font-bold text-[#FFFFFF] mb-2">স্বাগতম!</h2>
            <p className="text-xs text-[#A9B8D0] font-mono leading-relaxed mb-5">{welcomeMsg}</p>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full py-3 rounded-xl btn-vip-gradient font-bold text-xs cursor-pointer shadow-lg"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden bg-[#061126] border border-[#173B70] shadow-[0_0_15px_rgba(0,217,255,0.15)]">
                  <img
                    src={LOGO_URL}
                    alt={APP_CONFIG.name}
                    className="h-9 w-9 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/advance_logo.png";
                    }}
                  />
                </div>
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[#FFFFFF] leading-none">
                  {APP_CONFIG.name}
                </h1>
                <p className="text-[10px] text-[#A9B8D0] mt-1 font-mono flex items-center gap-1 font-semibold">
                  <Zap className="h-3 w-3 text-[#00D9FF] neon-icon-glow" /> VIP Signal Engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={APP_CONFIG.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#061126] border border-[#00D9FF]/40 hover:border-[#00D9FF] px-3 py-1.5 flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-[#00D9FF] neon-icon-glow" />
                <span className="text-[10px] font-bold text-[#00D9FF] font-mono tracking-wider">
                  TELEGRAM VIP
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Subheader Status Banner */}
      <div className="border-b border-[#173B70]/70 bg-[#061126]/90 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-3 w-3 text-[#00FF88] neon-icon-glow" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF88] font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
              LIVE VIP SERVER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#00D9FF] font-mono font-bold tracking-wider tabular-nums">
              {time.toLocaleTimeString("en-US", { hour12: false })} UTC
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-6">
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-2.5 text-center">
            <div className="text-[9px] font-mono uppercase text-[#A9B8D0] font-semibold">Server</div>
            <div className="text-xs font-mono font-bold text-[#00FF88] flex items-center justify-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] animate-ping" />
              ONLINE
            </div>
          </div>
          <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-2.5 text-center">
            <div className="text-[9px] font-mono uppercase text-[#A9B8D0] font-semibold">AI Accuracy</div>
            <div className="text-xs font-mono font-black text-[#00D9FF] mt-0.5 glow-text-cyan">
              98.4%
            </div>
          </div>
          <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-2.5 text-center">
            <div className="text-[9px] font-mono uppercase text-[#A9B8D0] font-semibold">VIP Models</div>
            <div className="text-xs font-mono font-black text-[#8B5CF6] mt-0.5">
              30 Live
            </div>
          </div>
        </div>


        {/* Section 1: Standard Wingo Modes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#00D9FF] neon-icon-glow" />
            <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-[0.2em] font-mono">
              Wingo Predictions
            </p>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#173B70] to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3" id="wingo-modes-direct">
            {/* Wingo 30s Card */}
            <Link
              to="/wingo/30s"
              className="rounded-2xl border border-[#173B70] bg-[#0B1E3B] p-4 flex flex-col justify-between hover:-translate-y-0.5 hover:border-[#00E5FF]/70 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)] transition-all duration-200 active:scale-[0.98] group cursor-pointer relative overflow-hidden"
              id="wingo-30s-card"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="h-12 w-12 rounded-xl bg-[#061126] border border-[#00D9FF]/40 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,217,255,0.2)]">
                  <img
                    src="/assets/wingo_30s.png"
                    alt="Wingo 30s"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = LOGO_URL;
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30 px-2 py-0.5 rounded-md">
                  30s
                </span>
              </div>

              <div className="mt-4 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                  <span className="text-[9px] font-mono font-bold text-[#00FF88] uppercase tracking-wider">
                    LIVE SIGNALS
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#FFFFFF] mt-1 group-hover:text-[#00D9FF] transition-colors">
                  Wingo 30s
                </h2>
                <p className="text-[11px] text-[#A9B8D0] mt-0.5 font-mono">
                  Ultra Fast · ৩০ সিগন্যাল
                </p>
              </div>
            </Link>

            {/* Wingo 1m Card */}
            <Link
              to="/wingo/1m"
              className="rounded-2xl border border-[#173B70] bg-[#0B1E3B] p-4 flex flex-col justify-between hover:-translate-y-0.5 hover:border-[#8B2CFF]/70 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(139,44,255,0.25),0_0_10px_rgba(0,87,255,0.2)] transition-all duration-200 active:scale-[0.98] group cursor-pointer relative overflow-hidden"
              id="wingo-1m-card"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="h-12 w-12 rounded-xl bg-[#061126] border border-[#8B5CF6]/40 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  <img
                    src="/assets/wingo_1m.png"
                    alt="Wingo 1m"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = LOGO_URL;
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 px-2 py-0.5 rounded-md">
                  1m
                </span>
              </div>

              <div className="mt-4 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                  <span className="text-[9px] font-mono font-bold text-[#00FF88] uppercase tracking-wider">
                    LIVE SIGNALS
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#FFFFFF] mt-1 group-hover:text-[#8B5CF6] transition-colors">
                  Wingo 1m
                </h2>
                <p className="text-[11px] text-[#A9B8D0] mt-0.5 font-mono">
                  Standard · ৩০ সিগন্যাল
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Section 2: VIP Suites & Adaptive AI Engine */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[#FFB700] neon-icon-glow" />
            <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-[0.2em] font-mono">
              VIP Suites & AI
            </p>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#173B70] to-transparent" />
          </div>

          {/* Human Brain 2D AI Engine Banner */}
          <Link
            to="/ai"
            className="rounded-2xl border border-[#8B5CF6]/50 bg-gradient-to-r from-[#0B1E3B] via-[#061126] to-[#0B1E3B] relative group block shadow-xl hover:-translate-y-0.5 hover:border-[#00FF88] hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_26px_rgba(0,255,136,0.25)] transition-all duration-300 active:scale-[0.99] overflow-hidden p-4"
            id="human-brain-entry"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#8B5CF6]/20 via-[#00D9FF]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="h-13 w-13 rounded-2xl bg-[#061126] border border-[#8B5CF6]/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.25)] group-hover:scale-105 transition-transform">
                  <Brain className="h-7 w-7 text-[#8B5CF6] neon-icon-glow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#00FF88] transition-colors">
                      Human Brain 2D AI
                    </h3>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/30 px-1.5 py-0.5 rounded">
                      ADAPTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9B8D0] font-mono mt-0.5">
                    Cognitive auto-recovery & zero-loss model switching
                  </p>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-[#A9B8D0] group-hover:text-[#00FF88] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Pro Traders Entry */}
          <Link
            to="/pro"
            className="rounded-2xl border border-[#173B70] bg-[#0B1E3B] relative group block shadow-lg hover:-translate-y-0.5 hover:border-[#FFB700]/70 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(255,183,0,0.2)] transition-all duration-200 active:scale-[0.99] overflow-hidden p-3.5"
            id="pro-traders-entry"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-[#061126] border border-[#FFB700]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Trophy className="h-6 w-6 text-[#FFB700] neon-icon-glow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#FFFFFF]">
                      Pro VIP Traders
                    </h3>
                    <span className="text-[8px] font-mono font-bold uppercase text-[#FFB700] bg-[#FFB700]/10 border border-[#FFB700]/30 px-1.5 py-0.5 rounded">
                      TOP 10
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9B8D0] font-mono mt-0.5">
                    High win streak algorithmic masters
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#A9B8D0] group-hover:text-[#FFB700] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Good Pro High Gain Entry */}
          <Link
            to="/good-pro"
            className="rounded-2xl border border-[#173B70] bg-[#0B1E3B] relative group block shadow-lg hover:-translate-y-0.5 hover:border-[#00E5FF]/70 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)] transition-all duration-200 active:scale-[0.99] overflow-hidden p-3.5"
            id="good-pro-entry"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-[#061126] border border-[#00D9FF]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Crown className="h-6 w-6 text-[#00D9FF] neon-icon-glow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#FFFFFF]">
                      Good Pro · Top Gainers
                    </h3>
                    <span className="text-[8px] font-mono font-bold uppercase text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30 px-1.5 py-0.5 rounded">
                      +98.4% ROI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9B8D0] font-mono mt-0.5">
                    Yearly verified profit & accuracy leaders
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#A9B8D0] group-hover:text-[#00D9FF] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Section 3: Live Top Rankings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#00D9FF] neon-icon-glow" />
            <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-[0.2em] font-mono">
              Signal Leaderboard
            </p>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#173B70] to-transparent" />
          </div>

          <LeaderboardCard
            title="Wingo 30s Top Traders"
            duration="30s"
            topSignals={top30s}
            bestStreak={streak30s}
            isLoading={isLoading}
          />

          <LeaderboardCard
            title="Wingo 1m Top Traders"
            duration="1m"
            topSignals={top1m}
            bestStreak={streak1m}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};
