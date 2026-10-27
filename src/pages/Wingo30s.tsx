import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio, Zap, Shield, Flame, Activity } from 'lucide-react';
import { TraderCard } from '../components/TraderCard';
import { NumberBall } from '../components/NumberBall';
import { fetchWingo30s, calculateTraderHistory } from '../services/api';
import { PredictionResult, LotteryResult } from '../types';
import { APP_CONFIG } from '../config/appConfig';

const LOGO_URL = APP_CONFIG.profileImage;

export const Wingo30s: React.FC = () => {
  const [dataByTrader, setDataByTrader] = useState<Record<number, PredictionResult[]>>({});
  const [recentDraws, setRecentDraws] = useState<LotteryResult[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [time, setTime] = useState(new Date());

  const loadData = async () => {
    try {
      const draws = await fetchWingo30s();
      if (draws && draws.length > 0) {
        setRecentDraws(draws.slice(0, 10));
        const resultDict: Record<number, PredictionResult[]> = {};
        for (let i = 0; i < 30; i++) {
          resultDict[i] = calculateTraderHistory(draws, i, "30s");
        }
        setDataByTrader(resultDict);
        setIsLive(true);
      } else {
        setDataByTrader({});
        setRecentDraws([]);
        setIsLive(false);
      }
    } catch (e) {
      console.error("[Wingo30s] fetch error:", e);
      setDataByTrader({});
      setRecentDraws([]);
      setIsLive(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const allResults = Object.values(dataByTrader).flat();
  const wins = allResults.filter(r => r?.result === "WIN").length;
  const total = allResults.filter(r => r?.result && r.result !== "PENDING").length;
  const overallRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const safeOverallRate = Number.isFinite(overallRate) ? overallRate : 0;

  const isRestricted = (idx: number) => {
    const history = (dataByTrader[idx] || []).slice(0, 10);
    let streak = 0;
    for (const h of history) {
      if (h.result === "LOSS") {
        streak++;
        if (streak >= 7) return true;
      } else {
        streak = 0;
      }
    }
    const winCount = history.filter(h => h.result === "WIN").length;
    return history.length >= 5 && winCount <= 2;
  };

  const activeIndices = Array.from({ length: 30 }, (_, i) => i)
    .filter(idx => !isRestricted(idx))
    .sort((a, b) => {
      const histA = (dataByTrader[a] || []).slice(0, 10);
      const histB = (dataByTrader[b] || []).slice(0, 10);
      const rateA = histA.length > 0 ? histA.filter(x => x.result === "WIN").length / histA.length : 0;
      const rateB = histB.length > 0 ? histB.filter(x => x.result === "WIN").length / histB.length : 0;
      return rateB - rateA;
    });

  return (
    <div className="min-h-screen futuristic-bg text-[#FFFFFF] pb-10 font-sans antialiased">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3B] border border-[#173B70] hover:border-[#00D9FF] text-[#A9B8D0] hover:text-[#FFFFFF] transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-[#061126] border border-[#00D9FF]/40 shadow-sm shadow-[0_0_10px_rgba(0,217,255,0.2)]">
                  <img
                    src="/assets/wingo_30s.png"
                    alt="Wingo 30s"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = LOGO_URL;
                    }}
                  />
                </div>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-[#FFFFFF] leading-tight">
                  Wingo 30s VIP
                </h1>
                <p className="text-[10px] text-[#A9B8D0] font-mono flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#00D9FF] neon-icon-glow" /> 30 Rapid Neural Signals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-[#061126] border border-[#173B70] px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#00FF88]">
                LIVE 30s
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00E5FF]/50 hover:shadow-[0_10px_25px_-5px_rgba(2,8,23,0.8),0_0_15px_rgba(0,87,255,0.2)]">
            <div className="text-[9px] font-mono uppercase text-[#A9B8D0] font-semibold">Active Models</div>
            <div className="text-base font-mono font-black text-[#00D9FF] mt-0.5 glow-text-cyan">
              {activeIndices.length}/30
            </div>
          </div>

          <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00FF88]/50 hover:shadow-[0_10px_25px_-5px_rgba(2,8,23,0.8),0_0_15px_rgba(0,255,136,0.2)]">
            <div className="text-[9px] font-mono uppercase text-[#A9B8D0] font-semibold">Live Accuracy</div>
            <div className="text-base font-mono font-black text-[#00FF88] mt-0.5 glow-text-green">
              {safeOverallRate}%
            </div>
          </div>

          <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8B2CFF]/50 hover:shadow-[0_10px_25px_-5px_rgba(2,8,23,0.8),0_0_15px_rgba(139,44,255,0.2)]">
            <div className="text-[9px] font-mono uppercase text-[#A9B8D0] font-semibold">Clock Cycle</div>
            <div className="text-base font-mono font-black text-[#8B5CF6] mt-0.5">
              30 Sec
            </div>
          </div>
        </div>

        {/* Live Recent Draw Results (0-9 Number Balls) */}
        {recentDraws.length > 0 && (
          <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A9B8D0] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88] animate-pulse" />
                Live Draw Balls (0-9)
              </span>
              <span className="text-[9px] font-mono font-bold text-[#00D9FF]">
                Draw #{recentDraws[0]?.issueNumber ? recentDraws[0].issueNumber.slice(-5) : ""}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
              {recentDraws.slice(0, 10).map((draw, idx) => (
                <div key={draw.issueNumber || idx} className="flex flex-col items-center gap-1 min-w-[30px]">
                  <NumberBall number={draw.number} size="sm" animated />
                  <span className="text-[8px] font-mono text-[#A9B8D0]">
                    {draw.issueNumber ? draw.issueNumber.slice(-3) : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signals List Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#00D9FF] neon-icon-glow" />
            <h2 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              All 30 Algorithmic Signals
            </h2>
          </div>
          <span className="text-[9px] font-mono text-[#A9B8D0]">
            Tap any signal to view chart
          </span>
        </div>

        {/* 30 Traders List */}
        <div className="space-y-2.5" id="traders-list-30s">
          {activeIndices.map((idx, rankIdx) => (
            <TraderCard
              key={idx}
              index={idx}
              isActive={isLive}
              results={dataByTrader[idx] || []}
              isRestricted={false}
              rank={rankIdx < 3 ? rankIdx + 1 : undefined}
              detailPath={`/signal/${idx}`}
            />
          ))}

          {/* Restricted/Filtered section if any */}
          {Array.from({ length: 30 }, (_, i) => i)
            .filter(idx => isRestricted(idx))
            .map(idx => (
              <TraderCard
                key={idx}
                index={idx}
                isActive={false}
                results={dataByTrader[idx] || []}
                isRestricted={true}
                detailPath={`/signal/${idx}`}
              />
            ))}
        </div>
      </main>
    </div>
  );
};
