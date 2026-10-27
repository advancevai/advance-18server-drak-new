import React from 'react';
import { Shield, Trophy, Medal, Flame } from 'lucide-react';
import { Avatar } from './Avatar';
import { TRADERS } from '../services/algorithms';

export interface LeaderboardCardProps {
  title: string;
  duration: string;
  topSignals: Array<{
    index: number;
    winRate: number;
    wins: number;
    total: number;
    maxWinStreak?: number;
  }>;
  bestStreak?: {
    index: number;
    streak: number;
  };
  isLoading?: boolean;
}

const MEDAL_STYLES = [
  { bg: "bg-[#FFB700]/15", border: "border-[#FFB700]/40", text: "text-[#FFB700]", Icon: Trophy },
  { bg: "bg-[#00D9FF]/15", border: "border-[#00D9FF]/40", text: "text-[#00D9FF]", Icon: Medal },
  { bg: "bg-[#8B5CF6]/15", border: "border-[#8B5CF6]/40", text: "text-[#8B5CF6]", Icon: Medal },
];

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  duration,
  topSignals = [],
  bestStreak,
  isLoading
}) => {
  const safeSignals = Array.isArray(topSignals) ? topSignals : [];
  const maxStreak = Number.isFinite(bestStreak?.streak) ? bestStreak!.streak : 0;

  return (
    <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] overflow-hidden shadow-xl hover:-translate-y-0.5 hover:border-[#00E5FF]/60 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#173B70] bg-[#061126]/90">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#00D9FF] neon-icon-glow" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            {title}
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30 px-2 py-0.5 rounded-lg shadow-sm">
          {duration}
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center bg-[#0B1E3B]">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#173B70] border-t-[#00D9FF]" />
          <p className="text-[11px] text-[#A9B8D0] font-mono mt-2">Loading leaderboard...</p>
        </div>
      ) : safeSignals.length === 0 ? (
        <div className="p-8 text-center bg-[#0B1E3B]">
          <p className="text-xs text-[#A9B8D0] font-mono">No results recorded yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#173B70]/40 bg-[#0B1E3B]">
          {safeSignals.map((item, idx) => {
            const medal = MEDAL_STYLES[idx] || MEDAL_STYLES[0];
            const { Icon } = medal;
            const wins = Number.isFinite(item.wins) ? item.wins : 0;
            const total = Number.isFinite(item.total) ? item.total : 0;
            const losses = Math.max(0, total - wins);
            const winRate = Number.isFinite(item.winRate) ? item.winRate : 0;
            const streak = Number.isFinite(item.maxWinStreak) ? item.maxWinStreak! : 0;

            return (
              <div
                key={item.index}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#061126]/60 transition-colors"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${medal.bg} ${medal.border} shrink-0`}>
                  <Icon className={`h-4 w-4 ${medal.text} neon-icon-glow`} />
                </div>
                <Avatar index={item.index} name={TRADERS[item.index]} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#FFFFFF] truncate">
                    {TRADERS[item.index] || `Trader ${item.index + 1}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 font-mono">
                    <span className="text-[10px] text-[#A9B8D0]">
                      <span className="text-[#00FF88] font-bold">{wins}W</span> · <span className="text-[#FF3864] font-bold">{losses}L</span>
                    </span>
                    {streak > 1 && (
                      <span className="text-[9px] font-bold text-[#FFB700] flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-[#FFB700] neon-icon-glow" />
                        {streak} streak
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black tabular-nums text-[#00D9FF] glow-text-cyan">
                    {winRate}%
                  </div>
                  <div className="text-[8px] font-semibold uppercase tracking-wider text-[#64748B]">
                    ACCURACY
                  </div>
                </div>
              </div>
            );
          })}

          {bestStreak && maxStreak > 1 && (
            <div className="px-4 py-2 bg-[#061126]/70 flex items-center justify-between text-[10px] font-mono border-t border-[#173B70]/50">
              <span className="text-[#A9B8D0] flex items-center gap-1 font-semibold">
                <Flame className="h-3.5 w-3.5 text-[#FFB700] neon-icon-glow" />
                MAX RUNNER: {TRADERS[bestStreak.index] || `Trader ${bestStreak.index + 1}`}
              </span>
              <span className="text-[#FFB700] font-bold">
                {maxStreak} Consecutive Wins
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
