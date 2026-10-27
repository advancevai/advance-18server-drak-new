import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShieldX, ShieldAlert, Zap, Clock } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PredictionCard } from '../components/PredictionCard';
import { HistoryTable } from '../components/HistoryTable';
import { UnlockModal } from '../components/UnlockModal';
import { fetchSignalDetail } from '../services/api';
import { TRADERS, PRO_TRADERS } from '../services/algorithms';
import { PredictionResult, LogicInfo } from '../types';

export const SignalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const modelIndex = parseInt(id || "0", 10);
  const isPro = location.pathname.includes("/pro");
  const traderName = isPro
    ? PRO_TRADERS[modelIndex] || "Pro Trader"
    : TRADERS[modelIndex] || "Trader";

  const is1m = location.pathname.includes("1m");
  const mode: '30s' | '1m' = is1m ? "1m" : "30s";
  const intervalSec = is1m ? 60 : 30;

  const [timeLeft, setTimeLeft] = useState(intervalSec);
  const [latestPred, setLatestPred] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [logicInfo, setLogicInfo] = useState<LogicInfo | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchSignalDetail(mode, modelIndex);
      setLatestPred(data.latest);
      setHistory(data.history);
      setIsRestricted(data.isRestricted);
      setLogicInfo(data.logicInfo);
    } catch (e) {
      console.error("[SignalDetail] fetch error:", e);
      setLatestPred(null);
      setHistory([]);
      setIsRestricted(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [modelIndex, mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const remaining = intervalSec - (nowSec % intervalSec);
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [intervalSec]);

  const backPath = isPro ? "/pro" : is1m ? "/wingo/1m" : "/wingo/30s";

  return (
    <div className="min-h-screen futuristic-bg text-[#FFFFFF] pb-12 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to={backPath}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3B] border border-[#173B70] text-[#A9B8D0] hover:text-[#FFFFFF] hover:border-[#00D9FF] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <Avatar index={modelIndex} isPro={isPro} name={traderName} size="md" />
              <div>
                <h1 className="text-sm font-bold text-[#FFFFFF] leading-tight">
                  {traderName}
                </h1>
                <p className="text-[10px] text-[#A9B8D0] font-mono font-semibold">
                  {logicInfo?.logicBadge || (isPro ? "VIP VIP Signal" : `${mode} Server`)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#061126] border border-[#00D9FF]/40 pl-2.5 pr-3 py-1.5 shadow-[0_0_12px_rgba(0,217,255,0.2)]">
            <span className="h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88] animate-pulse" />
            <span className="text-xs font-mono font-black tabular-nums text-[#00D9FF]">
              {timeLeft}s
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center fade-in">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#173B70] border-t-[#00D9FF]" />
              <p className="text-xs text-[#A9B8D0] font-mono">Loading VIP signal analysis...</p>
            </div>
          </div>
        ) : latestPred ? (
          <div className="fade-in space-y-4">
            {isRestricted && (
              <div className="relative rounded-2xl border border-[#FF3864]/40 bg-[#FF3864]/10 overflow-hidden p-4">
                <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FF3864]/20">
                  <ShieldX className="h-4 w-4 text-[#FF3864]" />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF3864]/20 border border-[#FF3864]/40">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#FF3864]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF3864] font-mono">
                    Restricted Status
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#FF3864] animate-ping" />
                </div>
                <p className="text-[11px] text-[#A9B8D0] leading-relaxed pr-10">
                  7 consecutive losses detected. Model is temporarily cooled down by the AI risk manager.
                </p>
              </div>
            )}

            <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-3.5 flex items-center gap-3.5 shadow-xl relative overflow-hidden group hover:border-[#00E5FF]/60 transition-all">
              <Avatar index={modelIndex} isPro={isPro} name={traderName} size="xl" className="shadow-[0_0_20px_rgba(0,217,255,0.35)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30 px-2 py-0.5 rounded-md">
                    {isPro ? "PRO VIP ALGO" : `SERVER #${(modelIndex % 30) + 1}`}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88] animate-pulse" />
                </div>
                <h2 className="text-base font-black text-[#FFFFFF] mt-1 truncate">
                  {traderName}
                </h2>
                <p className="text-[11px] text-[#A9B8D0] font-mono mt-0.5">
                  {logicInfo?.logicBadge || "Official DRX-TM AI Signal Server"}
                </p>
              </div>
            </div>

            <UnlockModal>
              <div className="space-y-3.5">
                <PredictionCard
                  prediction={latestPred.prediction || "BIG"}
                  confidence={Number.isFinite(latestPred.confidence) ? latestPred.confidence : 85}
                  predictedNumber={Number.isFinite(latestPred.predicted_number) ? latestPred.predicted_number : 7}
                  currentPeriod={latestPred.period ? String(latestPred.period) : ""}
                  mode={mode}
                />

                {logicInfo?.reason && (
                  <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] px-4 py-2.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00E5FF]/50 hover:shadow-[0_10px_25px_-5px_rgba(2,8,23,0.8),0_0_15px_rgba(0,87,255,0.2)]">
                    <span className="text-[11px] font-mono font-medium text-[#A9B8D0]">
                      <span className="text-[#8B5CF6] font-bold">🎯 STRATEGY:</span> {logicInfo.reason}
                    </span>
                  </div>
                )}

                <HistoryTable history={history} />
              </div>
            </UnlockModal>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center fade-in">
            <div className="text-center">
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-xs text-[#A9B8D0] font-mono">Waiting for next lottery draw cycle...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
