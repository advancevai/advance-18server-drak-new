import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles, Trophy, Medal, Timer, Clock, Flame, ChevronRight, Lock, Shield } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { fetchWingo30s, fetchWingo1m, calculateTraderHistory } from '../services/api';
import { useSignalAuth } from '../services/supabase';
import { PRO_TRADERS } from '../services/algorithms';
import { PredictionResult, TraderStats } from '../types';
import { APP_CONFIG } from '../config/appConfig';

const LOGO_URL = APP_CONFIG.profileImage;

const MEDAL_STYLES = [
  { bg: "bg-[#FFB700]/15", border: "border-[#FFB700]/40", text: "text-[#FFB700]", Icon: Trophy },
  { bg: "bg-[#00D9FF]/15", border: "border-[#00D9FF]/40", text: "text-[#00D9FF]", Icon: Medal },
  { bg: "bg-[#8B5CF6]/15", border: "border-[#8B5CF6]/40", text: "text-[#8B5CF6]", Icon: Medal },
];

export const ProTraders: React.FC = () => {
  const navigate = useNavigate();
  const { isUnlocked } = useSignalAuth();
  const [mode, setMode] = useState<'30s' | '1m'>("30s");
  const [data30s, setData30s] = useState<Record<number, PredictionResult[]>>({});
  const [data1m, setData1m] = useState<Record<number, PredictionResult[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [d30, d1] = await Promise.all([fetchWingo30s(), fetchWingo1m()]);
      const res30: Record<number, PredictionResult[]> = {};
      const res1: Record<number, PredictionResult[]> = {};

      for (let i = 0; i < 10; i++) {
        res30[i] = calculateTraderHistory(d30, i, "30s");
        res1[i] = calculateTraderHistory(d1, i, "1m");
      }

      setData30s(res30);
      setData1m(res1);
    } catch (e) {
      console.error("[ProTraders] load error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentData = mode === "30s" ? data30s : data1m;

  const calculateStats = (data: Record<number, PredictionResult[]>): TraderStats[] => {
    return Object.entries(data).map(([idxStr, list]) => {
      const idx = parseInt(idxStr, 10);
      const safeList = Array.isArray(list) ? list : [];
      const wins = safeList.filter(r => r?.result === "WIN").length;
      const total = safeList.length;
      let maxS = 0;
      let curS = 0;
      for (const r of safeList) {
        if (r?.result === "WIN") {
          curS++;
          maxS = Math.max(maxS, curS);
        } else {
          curS = 0;
        }
      }
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      const safeWinRate = Number.isFinite(winRate) ? winRate : 0;
      return {
        index: idx,
        winRate: safeWinRate,
        wins,
        losses: Math.max(0, total - wins),
        total,
        maxStreak: maxS
      };
    }).sort((a, b) => b.winRate - a.winRate || b.maxStreak - a.maxStreak);
  };

  const traderStats = calculateStats(currentData);
  const totalWins = traderStats.reduce((acc, cur) => acc + (Number.isFinite(cur.wins) ? cur.wins : 0), 0);
  const totalPlays = traderStats.reduce((acc, cur) => acc + (Number.isFinite(cur.total) ? cur.total : 0), 0);
  const overallRate = totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0;
  const safeOverallRate = Number.isFinite(overallRate) ? overallRate : 0;

  const renderLeaderboard = (
    title: string,
    badge: string,
    Icon: React.ComponentType<{ className?: string }>,
    data: Record<number, PredictionResult[]>
  ) => {
    const stats = calculateStats(data);
    let best = { index: 0, streak: 0 };
    stats.forEach(s => {
      if (s.maxStreak > best.streak) {
        best = { index: s.index, streak: s.maxStreak };
      }
    });

    return (
      <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] overflow-hidden shadow-xl hover:-translate-y-0.5 hover:border-[#00E5FF]/60 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#173B70] bg-[#061126]/90">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#00D9FF] neon-icon-glow" />
            <span className="text-xs font-bold text-[#FFFFFF] font-mono">{title}</span>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30 px-2 py-0.5 rounded-lg">
            {badge}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-[#0B1E3B]">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#173B70] border-t-[#00D9FF]" />
            <p className="text-xs text-[#A9B8D0] font-mono mt-2">Loading VIP data...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="p-8 text-center bg-[#0B1E3B]">
            <p className="text-xs text-[#A9B8D0] font-mono">No signals recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#173B70]/40 bg-[#0B1E3B]">
            {stats.slice(0, 3).map((item, idx) => {
              const medal = MEDAL_STYLES[idx] || MEDAL_STYLES[0];
              const { Icon: MedalIcon } = medal;
              return (
                <div
                  key={item.index}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#061126]/60 transition-colors"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${medal.bg} ${medal.border}`}>
                    <MedalIcon className={`h-4 w-4 ${medal.text} neon-icon-glow`} />
                  </div>
                  <Avatar index={item.index} isPro={true} name={PRO_TRADERS[item.index]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#FFFFFF] truncate">
                      {PRO_TRADERS[item.index] || `Pro Trader ${item.index + 1}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 font-mono">
                      <span className="text-[10px] text-[#00FF88] font-bold">{item.wins}W</span>
                      <span className="text-[10px] text-[#64748B]">·</span>
                      <span className="text-[10px] text-[#FF3864] font-bold">{item.losses}L</span>
                      {item.maxStreak > 1 && (
                        <span className="text-[9px] font-bold text-[#FFB700] flex items-center gap-0.5">
                          <Flame className="h-3 w-3" />
                          {item.maxStreak} streak
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-black tabular-nums text-[#00D9FF] glow-text-cyan">
                      {item.winRate}%
                    </p>
                  </div>
                </div>
              );
            })}

            {best.streak > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-[#061126]/80 border-t border-[#173B70]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFB700]/15 border border-[#FFB700]/30">
                  <Flame className="h-4 w-4 text-[#FFB700]" />
                </div>
                <Avatar index={best.index} isPro={true} size="xs" />
                <div className="flex-1 min-w-0 font-mono">
                  <p className="text-[9px] font-bold text-[#FFB700] uppercase tracking-wider">
                    MAX WIN STREAK
                  </p>
                  <p className="text-xs font-bold text-[#FFFFFF] truncate">
                    {PRO_TRADERS[best.index] || `Pro Trader ${best.index + 1}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-[#0B1E3B] border border-[#173B70] px-3 py-1 font-mono">
                  <span className="text-sm font-black tabular-nums text-[#FFB700]">{best.streak}</span>
                  <span className="text-[10px] text-[#A9B8D0]">Wins</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen futuristic-bg pb-12 font-sans antialiased text-[#FFFFFF]">
      <header className="sticky top-0 z-20 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3B] border border-[#173B70] hover:border-[#00D9FF] text-[#A9B8D0] hover:text-[#FFFFFF] transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#061126] border border-[#173B70] overflow-hidden shadow-sm">
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
                <h1 className="text-base font-extrabold tracking-tight text-[#FFFFFF] leading-none flex items-center gap-1.5">
                  Pro VIP Traders
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#FFB700] bg-[#FFB700]/15 border border-[#FFB700]/40 px-1.5 py-0.5 rounded">
                    ELITE
                  </span>
                </h1>
                <p className="text-[10px] text-[#A9B8D0] mt-1 font-mono flex items-center gap-1">
                  <Shield className="h-3 w-3 text-[#00D9FF]" /> VIP Execution Server
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#061126] border border-[#173B70] px-3 py-1.5 text-center shadow-sm font-mono">
              <div className="text-[8px] font-bold text-[#A9B8D0] uppercase leading-none">OVERALL</div>
              <div className="text-sm font-black tabular-nums leading-tight mt-0.5 text-[#00FF88] glow-text-green">
                {safeOverallRate}%
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00D9FF]" />
          <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-[0.2em] font-mono">
            Pro Prediction Suite
          </p>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#173B70] to-transparent" />
        </div>

        {/* 30s / 1m Mode selector */}
        <div className="rounded-2xl bg-[#061126] border border-[#173B70] p-1 shadow-md">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setMode("30s")}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer font-mono ${
                mode === "30s"
                  ? "btn-vip-gradient text-white shadow-md"
                  : "text-[#A9B8D0] hover:text-[#FFFFFF]"
              }`}
            >
              <Timer className="h-4 w-4" /> 30s Pro Mode
            </button>
            <button
              onClick={() => setMode("1m")}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer font-mono ${
                mode === "1m"
                  ? "btn-vip-gradient text-white shadow-md"
                  : "text-[#A9B8D0] hover:text-[#FFFFFF]"
              }`}
            >
              <Clock className="h-4 w-4" /> 1m Pro Mode
            </button>
          </div>
        </div>

        {/* Grid of 10 Pro Traders */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {traderStats.map((st) => {
            const history = (currentData[st.index] || []).slice(0, 10);
            const wins = history.filter(r => r?.result === "WIN").length;
            const total = history.filter(r => r?.result && r.result !== "PENDING").length;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            const safeWinRate = Number.isFinite(winRate) ? winRate : 0;
            const linkPath = `/pro/${mode}/signal/${st.index}`;

            return (
              <Link
                key={st.index}
                to={linkPath}
                className="group relative block rounded-2xl bg-[#0B1E3B] overflow-hidden transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,217,255,0.2)] active:scale-[0.98] border border-[#173B70] hover:border-[#00D9FF] p-3.5 shadow-lg"
                id={`pro-trader-card-${st.index}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar index={st.index} isPro={true} name={PRO_TRADERS[st.index]} size="md" className="group-hover:scale-105" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="truncate text-xs font-bold text-[#FFFFFF] leading-tight group-hover:text-[#00D9FF] transition-colors">
                        {PRO_TRADERS[st.index] || `Pro Trader ${st.index + 1}`}
                      </h3>
                      <Trophy className="h-3 w-3 text-[#FFB700] flex-shrink-0" />
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                    </div>

                    {isUnlocked ? (
                      <div className="flex items-center gap-2 mt-1.5 font-mono">
                        {total > 0 ? (
                          <>
                            <span className="text-xs font-black tabular-nums text-[#00D9FF] glow-text-cyan">
                              {safeWinRate}%
                            </span>
                            <span className="text-[10px] text-[#A9B8D0]">
                              <span className="text-[#00FF88] font-bold">{wins}W</span>
                              <span className="text-[#64748B]"> · </span>
                              <span className="text-[#FF3864] font-bold">{total - wins}L</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-[#64748B]">No data</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-1 font-mono">
                        <Lock className="h-3 w-3 text-[#8B5CF6]" />
                        <span className="text-[10px] text-[#A9B8D0]">VIP Encrypted</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#A9B8D0] transition-all duration-200 group-hover:text-[#00D9FF] group-hover:translate-x-0.5" />
                </div>

                {isUnlocked && history.length > 0 && (
                  <div className="mt-3 flex items-center gap-[3px] h-[5px]">
                    {history.map((res, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all ${
                          res.result === "WIN"
                            ? "bg-[#00FF88] shadow-[0_0_6px_#00FF88]"
                            : "bg-[#FF3864]"
                        }`}
                        style={{ height: res.result === "WIN" ? "5px" : "3px" }}
                      />
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Pro Leaderboards */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#00D9FF]" />
            <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-[0.2em] font-mono">
              Pro Leaderboard
            </p>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#173B70] to-transparent" />
          </div>

          {renderLeaderboard("Pro Wingo 30s", "30s", Timer, data30s)}
          {renderLeaderboard("Pro Wingo 1m", "1m", Clock, data1m)}
        </div>
      </main>
    </div>
  );
};
