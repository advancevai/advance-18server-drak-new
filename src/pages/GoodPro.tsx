import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Timer, Zap, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { fetchWingo30s, fetchWingo1m } from '../services/api';
import { calculatePrediction, getNextPeriod } from '../services/algorithms';
import { APP_CONFIG } from '../config/appConfig';

const LOGO_URL = APP_CONFIG.profileImage;

interface GoodProModel {
  rank: number;
  id: number;
  name: string;
  nameBn: string;
  emoji: string;
  fullYearProfit: string;
  roi: string;
  winRate: number;
  allTimeStreak: number;
  totalSignals: number;
  wins: number;
  badge: string;
  borderColor: string;
  badgeColor: string;
}

const TOP_MODELS: GoodProModel[] = [
  {
    rank: 1,
    id: 1,
    name: "Royal Alpha Pro",
    nameBn: "Royal Alpha Pro",
    emoji: "👑",
    fullYearProfit: "+$38,540",
    roi: "+98.4%",
    winRate: 98.2,
    allTimeStreak: 24,
    totalSignals: 4820,
    wins: 4733,
    badge: "🏆 #1 TOP PROFIT",
    borderColor: "border-[#FFB700]/50",
    badgeColor: "bg-[#FFB700]/15 text-[#FFB700] border-[#FFB700]/40"
  },
  {
    rank: 2,
    id: 2,
    name: "Golden Dragon Ultra",
    nameBn: "Golden Dragon Ultra",
    emoji: "🐉",
    fullYearProfit: "+$34,210",
    roi: "+96.8%",
    winRate: 97.6,
    allTimeStreak: 21,
    totalSignals: 4650,
    wins: 4538,
    badge: "🔥 #2 HIGH GAIN",
    borderColor: "border-[#00FF88]/50",
    badgeColor: "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40"
  },
  {
    rank: 3,
    id: 3,
    name: "Titan Master VIP",
    nameBn: "Titan Master VIP",
    emoji: "🏔️",
    fullYearProfit: "+$29,870",
    roi: "+95.1%",
    winRate: 96.9,
    allTimeStreak: 19,
    totalSignals: 4410,
    wins: 4273,
    badge: "💎 #3 ACCURACY",
    borderColor: "border-[#00D9FF]/50",
    badgeColor: "bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/40"
  },
  {
    rank: 4,
    id: 4,
    name: "Apex Quantum Pro",
    nameBn: "Apex Quantum Pro",
    emoji: "⚛️",
    fullYearProfit: "+$27,430",
    roi: "+94.5%",
    winRate: 95.8,
    allTimeStreak: 17,
    totalSignals: 4230,
    wins: 4052,
    badge: "⚡ #4 ULTRA GAIN",
    borderColor: "border-[#8B5CF6]/50",
    badgeColor: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/40"
  },
  {
    rank: 5,
    id: 5,
    name: "Phoenix Prime VIP",
    nameBn: "Phoenix Prime VIP",
    emoji: "🌟",
    fullYearProfit: "+$25,160",
    roi: "+93.7%",
    winRate: 95.2,
    allTimeStreak: 16,
    totalSignals: 4120,
    wins: 3922,
    badge: "🚀 #5 CONSISTENT",
    borderColor: "border-[#FFB700]/50",
    badgeColor: "bg-[#FFB700]/15 text-[#FFB700] border-[#FFB700]/40"
  },
  {
    rank: 6,
    id: 6,
    name: "Ghost Hunter Pro",
    nameBn: "Ghost Hunter Pro",
    emoji: "🐺",
    fullYearProfit: "+$22,890",
    roi: "+92.4%",
    winRate: 94.7,
    allTimeStreak: 15,
    totalSignals: 3980,
    wins: 3769,
    badge: "🎯 #6 SMART RETURN",
    borderColor: "border-[#8B5CF6]/50",
    badgeColor: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/40"
  }
];

export const GoodPro: React.FC = () => {
  const [speed, setSpeed] = useState<'30s' | '1m'>("30s");
  const [predictions30s, setPredictions30s] = useState<Record<number, any>>({});
  const [predictions1m, setPredictions1m] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  const loadData = async () => {
    try {
      const [d30, d1] = await Promise.all([
        fetchWingo30s().catch(() => []),
        fetchWingo1m().catch(() => [])
      ]);

      const p30: Record<number, any> = {};
      const p1: Record<number, any> = {};

      const next30 = getNextPeriod(d30);
      const next1m = getNextPeriod(d1);

      TOP_MODELS.forEach(m => {
        const modelIdx = m.id - 1;
        p30[m.id] = {
          targetPeriod: next30,
          ...calculatePrediction(next30, modelIdx, "30s")
        };
        p1[m.id] = {
          targetPeriod: next1m,
          ...calculatePrediction(next1m, modelIdx, "1m")
        };
      });

      setPredictions30s(p30);
      setPredictions1m(p1);
    } catch (e) {
      console.warn("Could not load predictions for Good Pro:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const clock = setInterval(() => setTime(new Date()), 1000);
    const interval = setInterval(loadData, 5000);
    return () => {
      clearInterval(clock);
      clearInterval(interval);
    };
  }, []);

  const activePredictions = speed === "30s" ? predictions30s : predictions1m;

  return (
    <div className="min-h-screen futuristic-bg pb-14 text-[#FFFFFF] font-sans antialiased">
      <header className="sticky top-0 z-20 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3B] border border-[#173B70] hover:border-[#00D9FF] transition-colors active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-[#A9B8D0]" />
              </Link>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden bg-[#061126] border border-[#173B70]">
                  <img
                    src={LOGO_URL}
                    alt={APP_CONFIG.name}
                    className="h-8 w-8 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/advance_logo.png";
                    }}
                  />
                </div>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[#FFFFFF] leading-none flex items-center gap-1.5">
                  Good Pro VIP
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00FF88] bg-[#00FF88]/15 border border-[#00FF88]/40 px-1.5 py-0.5 rounded">
                    PRO SUITE
                  </span>
                </h1>
                <p className="text-[10px] text-[#A9B8D0] mt-0.5 font-mono">
                  {time.toLocaleTimeString("en-US", { hour12: false })} · Verified Yearly Alpha
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="rounded-xl bg-[#061126] border border-[#173B70] px-3 py-1.5 text-center shadow-sm">
                <div className="text-[8px] font-mono font-bold text-[#A9B8D0] uppercase leading-none">TOP ROI</div>
                <div className="text-sm font-mono font-black tabular-nums leading-tight mt-0.5 text-[#00FF88] glow-text-green">
                  +98.4%
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-4">
        {/* Banner */}
        <div className="rounded-2xl p-4 bg-[#0B1E3B] border border-[#173B70] relative overflow-hidden shadow-xl">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/40 text-[10px] font-mono font-bold text-[#00FF88]">
                <Crown className="h-3 w-3 neon-icon-glow" />
                <span>ALL-TIME ALPHA RANKING</span>
              </div>
              <h2 className="text-lg font-bold text-[#FFFFFF] tracking-tight pt-1">
                Top 6 High-Profit AI Models
              </h2>
              <p className="text-xs text-[#A9B8D0] leading-relaxed">
                Audited models with the highest multi-round win streaks and lowest drawdown risk.
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[#061126] border border-[#00D9FF]/40 flex items-center justify-center text-xl flex-shrink-0 shadow-[0_0_15px_rgba(0,217,255,0.2)]">
              💎
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#173B70] flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A9B8D0] uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-[#00D9FF] neon-icon-glow" /> SPEED CYCLE:
            </span>
            <div className="flex rounded-xl bg-[#061126] p-1 border border-[#173B70]">
              <button
                onClick={() => setSpeed("30s")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  speed === "30s"
                    ? "btn-vip-gradient text-white shadow-md"
                    : "text-[#A9B8D0] hover:text-[#FFFFFF]"
                }`}
              >
                <img src="/assets/wingo_30s.png" alt="" className="w-3.5 h-3.5 rounded object-cover" />
                30s
              </button>
              <button
                onClick={() => setSpeed("1m")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  speed === "1m"
                    ? "btn-vip-gradient text-white shadow-md"
                    : "text-[#A9B8D0] hover:text-[#FFFFFF]"
                }`}
              >
                <img src="/assets/wingo_1m.png" alt="" className="w-3.5 h-3.5 rounded object-cover" />
                1m
              </button>
            </div>
          </div>
        </div>

        {/* 6 Top Cards */}
        <div className="space-y-3.5">
          {TOP_MODELS.map((item) => {
            const pred = activePredictions[item.id];
            const isBig = pred?.prediction === "BIG";
            const signalUrl = speed === "30s" ? `/signal/${item.id}` : `/wingo/1m/signal/${item.id}`;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] hover:-translate-y-0.5 hover:border-[#00E5FF]/60 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)] overflow-hidden shadow-xl transition-all"
              >
                <div className="p-3.5 border-b border-[#173B70] flex items-center justify-between bg-[#061126]/90">
                  <div className="flex items-center gap-3">
                    <Avatar index={item.id} isPro={true} name={item.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#FFFFFF]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-[#A9B8D0]">
                          <strong className="text-[#FFB700]">{item.allTimeStreak}</strong> Streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[9px] font-semibold text-[#A9B8D0] uppercase leading-none">
                      YEARLY RETURN
                    </div>
                    <div className="text-sm font-black text-[#00FF88] mt-1 glow-text-green">
                      {item.fullYearProfit}
                    </div>
                    <div className="text-[9px] font-bold text-[#00D9FF]">
                      ROI {item.roi}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="rounded-xl bg-[#061126] border border-[#173B70] p-2">
                      <p className="text-[9px] font-semibold text-[#A9B8D0] uppercase">WIN RATE</p>
                      <p className="text-xs font-black text-[#00D9FF] mt-0.5 glow-text-cyan">{item.winRate}%</p>
                    </div>
                    <div className="rounded-xl bg-[#061126] border border-[#173B70] p-2">
                      <p className="text-[9px] font-semibold text-[#A9B8D0] uppercase">TOTAL SIGNALS</p>
                      <p className="text-xs font-black text-[#FFFFFF] mt-0.5">{item.totalSignals}</p>
                    </div>
                    <div className="rounded-xl bg-[#061126] border border-[#173B70] p-2">
                      <p className="text-[9px] font-semibold text-[#A9B8D0] uppercase">TOTAL WINS</p>
                      <p className="text-xs font-black text-[#00FF88] mt-0.5">{item.wins}</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#061126] border border-[#173B70] flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                        <span className="text-[10px] font-mono font-bold uppercase text-[#00FF88] tracking-wider">
                          LIVE PREDICTION
                        </span>
                        {pred && (
                          <span className="text-[10px] text-[#A9B8D0] font-mono">
                            #{String(pred.targetPeriod).slice(-4)}
                          </span>
                        )}
                      </div>
                      {isLoading ? (
                        <p className="text-xs text-[#A9B8D0] font-mono">Computing neural cycle...</p>
                      ) : pred ? (
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`text-base font-black tracking-wider px-2.5 py-0.5 rounded-lg border ${
                              isBig
                                ? "badge-cyan glow-text-cyan"
                                : "badge-purple glow-text-purple"
                            }`}
                          >
                            {pred.prediction}
                          </span>
                          <span className="text-xs text-[#A9B8D0]">
                            Target: <strong className="text-[#00D9FF]">{pred.predictedNumber}</strong>
                          </span>
                          <span className="text-[10px] font-bold text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/30 px-1.5 py-0.5 rounded">
                            {pred.confidence}% Conf
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-[#A9B8D0] font-mono">Analyzing next draw...</p>
                      )}
                    </div>

                    <Link
                      to={signalUrl}
                      className="btn-vip-gradient flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-md flex-shrink-0 cursor-pointer"
                    >
                      <span>VIEW</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
