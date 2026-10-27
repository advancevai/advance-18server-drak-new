import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, ShieldX, ChevronRight, Lock } from 'lucide-react';
import { Avatar } from './Avatar';
import { TRADERS, PRO_TRADERS } from '../services/algorithms';
import { useSignalAuth } from '../services/supabase';
import { PredictionResult } from '../types';

export interface TraderCardProps {
  index: number;
  isActive?: boolean;
  results?: PredictionResult[];
  isRestricted?: boolean;
  rank?: number;
  detailPath?: string;
  isPro?: boolean;
}

export const TraderCard: React.FC<TraderCardProps> = ({
  index,
  isActive = true,
  results = [],
  isRestricted = false,
  rank,
  detailPath,
  isPro = false
}) => {
  const { isUnlocked } = useSignalAuth();

  const name = isPro
    ? PRO_TRADERS[index] || `Pro Trader ${index + 1}`
    : TRADERS[index] || `Trader ${index + 1}`;

  const safeResults = Array.isArray(results) ? results.slice(0, 10) : [];
  const wins = safeResults.filter(r => r?.result === "WIN").length;
  const total = safeResults.filter(r => r?.result && r.result !== "PENDING").length;
  const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const safeRate = Number.isFinite(rate) ? rate : 0;

  const targetPath = detailPath || (isPro ? `/pro/30s/signal/${index}` : `/signal/${index}`);

  return (
    <Link
      to={targetPath}
      className="group relative block rounded-2xl bg-[#0B1E3B] border border-[#173B70] overflow-hidden transition-all duration-200 active:scale-[0.99] shadow-lg hover:-translate-y-0.5 hover:border-[#00E5FF]/70 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)]"
      id={`trader-card-${index}`}
    >
      <div className="relative p-3.5">
        <div className="flex items-center gap-3">
          <Avatar index={index} isPro={isPro} name={name} size="md" className="group-hover:scale-105 transition-transform" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="truncate text-xs sm:text-sm font-bold text-[#FFFFFF] leading-tight group-hover:text-[#00D9FF] transition-colors">
                {name}
              </h3>

              {rank === 1 && (
                <span className="flex-shrink-0 flex items-center gap-0.5 rounded-md bg-[#FFB700]/15 border border-[#FFB700]/40 px-1.5 py-0.5">
                  <Trophy className="h-2.5 w-2.5 text-[#FFB700] neon-icon-glow" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#FFB700]">1st</span>
                </span>
              )}
              {rank === 2 && (
                <span className="flex-shrink-0 flex items-center gap-0.5 rounded-md bg-[#00D9FF]/15 border border-[#00D9FF]/40 px-1.5 py-0.5">
                  <Medal className="h-2.5 w-2.5 text-[#00D9FF] neon-icon-glow" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#00D9FF]">2nd</span>
                </span>
              )}
              {rank === 3 && (
                <span className="flex-shrink-0 flex items-center gap-0.5 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 px-1.5 py-0.5">
                  <Medal className="h-2.5 w-2.5 text-[#8B5CF6] neon-icon-glow" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#8B5CF6]">3rd</span>
                </span>
              )}

              {isRestricted ? (
                <span className="flex-shrink-0 flex items-center gap-0.5 rounded-md bg-[#FF3864]/15 border border-[#FF3864]/40 px-1.5 py-0.5">
                  <ShieldX className="h-2.5 w-2.5 text-[#FF3864]" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#FF3864]">Restricted</span>
                </span>
              ) : isActive && !rank ? (
                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
              ) : null}
            </div>

            {isUnlocked ? (
              <div className="flex items-center gap-2 mt-1.5 font-mono">
                {total > 0 ? (
                  <>
                    <span className="text-xs font-black tabular-nums text-[#00D9FF] glow-text-cyan">
                      {safeRate}%
                    </span>
                    <span className="text-[10px] text-[#A9B8D0]">
                      <span className="text-[#00FF88] font-semibold">{wins}W</span>
                      <span className="text-[#64748B]"> / </span>
                      <span className="text-[#FF3864] font-semibold">{total - wins}L</span>
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-[#64748B]">
                    Awaiting signals
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1 font-mono">
                <Lock className="h-2.5 w-2.5 text-[#8B5CF6]" />
                <span className="text-[10px] text-[#A9B8D0]">
                  VIP Encrypted
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isUnlocked && safeResults.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {safeResults.slice(0, 5).map((r, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      r.result === "WIN"
                        ? "bg-[#00FF88] shadow-[0_0_6px_#00FF88]"
                        : r.result === "LOSS"
                        ? "bg-[#FF3864] shadow-[0_0_6px_#FF3864]"
                        : "bg-[#173B70]"
                    }`}
                  />
                ))}
              </div>
            )}
            <ChevronRight className="h-4 w-4 text-[#A9B8D0] group-hover:text-[#00D9FF] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
};
