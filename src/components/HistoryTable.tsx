import React from 'react';
import { Lock } from 'lucide-react';
import { PredictionResult } from '../types';
import { useSignalAuth } from '../services/supabase';
import { NumberBall } from './NumberBall';

export interface HistoryTableProps {
  history: PredictionResult[];
  isLoading?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, isLoading }) => {
  const { isUnlocked } = useSignalAuth();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-8 text-center shadow-lg">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#173B70] border-t-[#00D9FF]" />
        <p className="text-xs text-[#A9B8D0] mt-3 font-mono">Loading history...</p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-6 text-center shadow-xl" id="locked-history">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 shadow-lg shadow-[#8B5CF6]/15">
          <Lock className="h-6 w-6 text-[#8B5CF6]" />
        </div>
        <h3 className="text-sm font-bold text-[#FFFFFF]">History Locked</h3>
        <p className="mt-1 text-[11px] text-[#A9B8D0] leading-relaxed max-w-xs mx-auto">
          Enter VIP access key to unlock historical performance, win rates, and verify algorithm outcomes.
        </p>
      </div>
    );
  }

  const list = Array.isArray(history) ? history : [];
  const wins = list.filter(item => item?.result === "WIN").length;
  const losses = list.filter(item => item?.result === "LOSS").length;
  const total = list.length;
  const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const safeRate = Number.isFinite(rate) ? rate : 0;

  return (
    <div className="space-y-3">
      {/* Stat Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-[#0B1E3B] border border-[#00FF88]/30 p-3 text-center shadow-sm">
          <div className="text-2xl font-black tabular-nums leading-none text-[#00FF88] glow-text-green font-mono">
            {wins}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00FF88]/80 mt-1.5 font-mono">
            Wins
          </div>
        </div>

        <div className="rounded-xl bg-[#0B1E3B] border border-[#FF3864]/30 p-3 text-center shadow-sm">
          <div className="text-2xl font-black tabular-nums leading-none text-[#FF3864] font-mono">
            {losses}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF3864]/80 mt-1.5 font-mono">
            Losses
          </div>
        </div>

        <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-3 text-center shadow-sm">
          <div
            className={`text-2xl font-black tabular-nums leading-none font-mono ${
              safeRate >= 60 ? "text-[#00D9FF] glow-text-cyan" : safeRate >= 40 ? "text-[#FFB700]" : "text-[#FF3864]"
            }`}
          >
            {safeRate}%
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A9B8D0] mt-1.5 font-mono">
            Win Rate
          </div>
        </div>
      </div>

      {/* Table Display */}
      <div className="rounded-2xl bg-[#061126] overflow-hidden border border-[#173B70] shadow-xl" id="history-data-table">
        <div className="grid grid-cols-[1fr_36px_40px_44px_48px] items-center gap-1 px-3.5 py-2.5 bg-[#0B1E3B] border-b border-[#173B70] text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#A9B8D0]">
          <span>Period</span>
          <span className="text-center">#</span>
          <span className="text-center">Size</span>
          <span className="text-center">Sig</span>
          <span className="text-center">Status</span>
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y divide-[#173B70]/40">
          {list.map((item) => {
            const num = item.actual_number !== null && item.actual_number !== undefined && Number.isFinite(Number(item.actual_number))
              ? Number(item.actual_number)
              : null;

            return (
              <div
                key={item.period}
                className="grid grid-cols-[1fr_36px_40px_44px_48px] items-center gap-1 px-3.5 py-2.5 transition-colors hover:bg-[#0B1E3B]/60"
              >
                <span className="font-mono text-[11px] text-[#FFFFFF] font-semibold tabular-nums truncate">
                  {item.period}
                </span>

                <div className="flex justify-center">
                  <NumberBall number={num} size="sm" animated />
                </div>

                <span
                  className={`text-center text-xs font-black font-mono ${
                    num === null ? "text-[#64748B]" : num >= 5 ? "text-[#00D9FF]" : "text-[#8B5CF6]"
                  }`}
                >
                  {num !== null ? (num >= 5 ? "BIG" : "SML") : "—"}
                </span>

                <span
                  className={`text-center text-xs font-bold font-mono ${
                    item.prediction === "BIG" ? "text-[#00D9FF]" : "text-[#8B5CF6]"
                  }`}
                >
                  {item.prediction ? (item.prediction === "BIG" ? "B" : "S") : "—"}
                </span>

                <div className="flex justify-center">
                  <span
                    className={`inline-flex h-[22px] px-2 items-center justify-center rounded-md text-[9px] font-black uppercase tracking-wider font-mono ${
                      item.result === "WIN"
                        ? "badge-win"
                        : item.result === "LOSS"
                        ? "badge-loss"
                        : "bg-[#0B1E3B] text-[#64748B] border border-[#173B70]"
                    }`}
                  >
                    {item.result || "PENDING"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
