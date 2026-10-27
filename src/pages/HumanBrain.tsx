import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Zap, Clock, ShieldAlert, Activity, CheckCircle2, XCircle, TrendingUp, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from '../components/Avatar';
import { PredictionCard } from '../components/PredictionCard';
import { NumberBall } from '../components/NumberBall';
import { UnlockModal } from '../components/UnlockModal';
import { fetchWingo30s, fetchWingo1m } from '../services/api';
import { calculatePrediction, getNextPeriod } from '../services/algorithms';
import { Specialist, LotteryResult } from '../types';

const SPECIALISTS: Specialist[] = [
  { index: 0, name: "Tiger Pro", role: "Momentum Trend", badge: "🐯 TIGER PRO", strat: "Orderflow Breakout", category: "TREND", lobe: "RIGHT_MOMENTUM" },
  { index: 1, name: "Dragon King", role: "Mean Reversion", badge: "🐉 DRAGON KING", strat: "Statistical Mean Divergence", category: "REVERSION", lobe: "LEFT_REVERSION" },
  { index: 8, name: "Sniper Pro", role: "Precision Strike", badge: "🎯 SNIPER PRO", strat: "Zero-Lag Pinpoint Target", category: "PRECISION", lobe: "FRONTAL_PRECISION" },
  { index: 6, name: "Shadow X", role: "Dark Pool Core", badge: "👤 SHADOW X", strat: "Algorithmic Liquidity Squeeze", category: "REVERSION", lobe: "LEFT_REVERSION" },
  { index: 3, name: "Eagle Eye", role: "Precision Sniper", badge: "🦅 EAGLE EYE", strat: "Multi-Cycle Arc Target", category: "PRECISION", lobe: "FRONTAL_PRECISION" },
  { index: 2, name: "Phoenix VIP", role: "Volatility Core", badge: "🔥 PHOENIX VIP", strat: "Exponential Wave Continuation", category: "VOLATILITY", lobe: "RIGHT_MOMENTUM" },
  { index: 4, name: "Lion Heart", role: "Volume Anchor", badge: "🦁 LION HEART", strat: "Deep Liquidity Accumulation", category: "VOLUME", lobe: "LEFT_REVERSION" },
  { index: 5, name: "Thunder Bolt", role: "Micro Scalper", badge: "⚡ THUNDER BOLT", strat: "Impulse Velocity Extraction", category: "SCALPING", lobe: "FRONTAL_PRECISION" },
  { index: 7, name: "Cobra Strike", role: "Fibonacci Striker", badge: "🐍 COBRA STRIKE", strat: "Golden Ratio Arc Oscillation", category: "PRECISION", lobe: "FRONTAL_PRECISION" },
  { index: 14, name: "Falcon Rush", role: "Dip Recovery", badge: "🦅 FALCON RUSH", strat: "Oversold Rebound Hunting", category: "REVERSION", lobe: "LEFT_REVERSION" },
  { index: 17, name: "Shark Tank", role: "Liquidity Predator", badge: "🦈 SHARK TANK", strat: "Order Book Delta Imbalance", category: "VOLUME", lobe: "FRONTAL_PRECISION" },
  { index: 19, name: "Dark Horse", role: "Surge Momentum", badge: "🐴 DARK HORSE", strat: "Volatility Band Squeeze", category: "TREND", lobe: "RIGHT_MOMENTUM" },
];

function evaluateSpecialists(draws: LotteryResult[], mode: string) {
  if (!draws || draws.length < 2) {
    const defaultTop = SPECIALISTS.slice(0, 4).map((s, idx) => ({
      specialist: s,
      recentWins: 8,
      recentTotal: 10,
      winRate: 85 - idx * 2,
      winStreak: 3 - Math.min(idx, 2),
      lossStreak: 0,
      lastResult: "WIN" as const,
      isLosing: false,
      score: 100 - idx * 5,
      rank: idx + 1
    }));
    return {
      top4: defaultTop,
      bestSpecialist: defaultTop[0].specialist,
      excludedLosingCount: 0
    };
  }

  const recentDraws = draws.slice(0, Math.min(10, draws.length));

  const scored = SPECIALISTS.map(spec => {
    let wins = 0;
    const total = recentDraws.length;
    let winStreak = 0;
    let lossStreak = 0;
    let streakFound = false;

    for (let i = 0; i < recentDraws.length; i++) {
      const d = recentDraws[i];
      const actualOutcome = Number(d.number) >= 5 ? "BIG" : "SMALL";
      const pred = calculatePrediction(d.issueNumber, spec.index, mode);
      const isWin = pred.prediction === actualOutcome;

      if (isWin) wins++;

      if (!streakFound) {
        if (i === 0) {
          if (isWin) winStreak = 1;
          else lossStreak = 1;
        } else {
          if (winStreak > 0 && isWin) winStreak++;
          else if (lossStreak > 0 && !isWin) lossStreak++;
          else streakFound = true;
        }
      }
    }

    const lastPred = calculatePrediction(recentDraws[0].issueNumber, spec.index, mode);
    const lastActual = Number(recentDraws[0].number) >= 5 ? "BIG" : "SMALL";
    const lastResult: 'WIN' | 'LOSS' = lastPred.prediction === lastActual ? "WIN" : "LOSS";
    const isLosing = lastResult === "LOSS";

    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    let score = 0;
    if (isLosing) {
      score = winRate - 500 - (lossStreak * 50);
    } else {
      score = 1000 + (winRate * 2) + (winStreak * 30);
    }

    return {
      specialist: spec,
      recentWins: wins,
      recentTotal: total,
      winRate,
      winStreak,
      lossStreak,
      lastResult,
      isLosing,
      score,
      rank: 0
    };
  });

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((item, idx) => { item.rank = idx + 1; });

  const top4 = scored.slice(0, 4);
  const excludedLosingCount = scored.filter(s => s.isLosing).length;

  return {
    top4,
    bestSpecialist: top4[0].specialist,
    excludedLosingCount
  };
}

function detectMarketRegime(draws: LotteryResult[], consecutiveLosses: number = 0) {
  if (!draws || draws.length < 2) {
    return {
      type: "EQUILIBRIUM FLOW",
      recommendedModelIndex: 0,
      description: "Neutral orderflow equilibrium",
      streakCount: 1,
      activeLobe: "FRONTAL_PRECISION" as const
    };
  }

  const outcomes = draws.slice(0, 8).map(d => Number(d.number) >= 5 ? "BIG" : "SMALL");
  let streak = 1;
  for (let i = 1; i < outcomes.length; i++) {
    if (outcomes[i] === outcomes[0]) streak++;
    else break;
  }

  if (consecutiveLosses >= 2) {
    return {
      type: "PING-PONG REVERSAL",
      recommendedModelIndex: 1,
      description: "High-loss defense: Mean Reversion engaged",
      streakCount: streak,
      activeLobe: "LEFT_REVERSION" as const
    };
  }

  if (streak >= 3) {
    return {
      type: "DRAGON TREND",
      recommendedModelIndex: 0,
      description: `${streak}x consecutive ${outcomes[0]} trend`,
      streakCount: streak,
      activeLobe: "RIGHT_MOMENTUM" as const
    };
  }

  let isAlternating = true;
  for (let i = 0; i < Math.min(3, outcomes.length - 1); i++) {
    if (outcomes[i] === outcomes[i + 1]) {
      isAlternating = false;
      break;
    }
  }

  if (isAlternating && outcomes.length >= 3) {
    return {
      type: "PING-PONG REVERSAL",
      recommendedModelIndex: 1,
      description: "Oscillating mean reversion pattern",
      streakCount: 1,
      activeLobe: "LEFT_REVERSION" as const
    };
  }

  const lastNums = draws.slice(0, 6).map(d => Number(d.number)).filter(n => !isNaN(n));
  let variance = 0;
  if (lastNums.length >= 4) {
    const mean = lastNums.reduce((a, b) => a + b, 0) / lastNums.length;
    variance = lastNums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lastNums.length;
  }

  if (variance > 8) {
    return {
      type: "VOLATILITY SPIKE",
      recommendedModelIndex: 2,
      description: "High variance volatility expansion",
      streakCount: 1,
      activeLobe: "FRONTAL_PRECISION" as const
    };
  }

  return {
    type: "EQUILIBRIUM FLOW",
    recommendedModelIndex: 4,
    description: "Balanced multi-cycle orderflow",
    streakCount: 1,
    activeLobe: "FRONTAL_PRECISION" as const
  };
}

const STORAGE_KEY = "human_brain_live_zero_v2";

export const HumanBrain: React.FC = () => {
  const [mode, setMode] = useState<'30s' | '1m'>("30s");
  const [draws, setDraws] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isShiftFlash, setIsShiftFlash] = useState(false);

  const intervalSec = mode === "30s" ? 30 : 60;
  const isResolvingRef = useRef(false);

  const [state, setState] = useState<{
    "30s": any;
    "1m": any;
  }>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      "30s": {
        activeSpecialistIndex: 0,
        history: [],
        lastResolvedPeriod: "",
        consecutiveLosses: 0,
        pendingPrediction: null,
        lastIntervention: null
      },
      "1m": {
        activeSpecialistIndex: 0,
        history: [],
        lastResolvedPeriod: "",
        consecutiveLosses: 0,
        pendingPrediction: null,
        lastIntervention: null
      }
    };
  });

  const currentModeState = state[mode] || {
    activeSpecialistIndex: 0,
    history: [],
    consecutiveLosses: 0,
    pendingPrediction: null
  };

  const activeSpecialist = SPECIALISTS.find(s => s.index === currentModeState.activeSpecialistIndex) || SPECIALISTS[0];
  const regime = detectMarketRegime(draws, currentModeState.consecutiveLosses);

  const updateCurrentModeState = (updater: (prev: any) => any) => {
    setState(prev => {
      const updated = updater(prev[mode] || {
        activeSpecialistIndex: 0,
        history: [],
        lastResolvedPeriod: "",
        consecutiveLosses: 0,
        pendingPrediction: null,
        lastIntervention: null
      });
      const next = { ...prev, [mode]: updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const loadDraws = async () => {
    try {
      let res: LotteryResult[] = [];
      if (mode === "30s") res = await fetchWingo30s();
      else res = await fetchWingo1m();
      if (res && res.length > 0) setDraws(res);
    } catch (e) {
      console.error("Failed to load Wingo data for Human Brain:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadDraws();
    const interval = setInterval(loadDraws, 2000);
    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    const tick = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const remaining = intervalSec - (nowSec % intervalSec);
      setTimeLeft(remaining);
      if (remaining === intervalSec - 1) {
        loadDraws();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [intervalSec, mode]);

  useEffect(() => {
    if (!draws || draws.length === 0) return;
    if (isResolvingRef.current) return;
    isResolvingRef.current = true;

    try {
      const latestDraw = draws[0];
      if (!latestDraw || !latestDraw.issueNumber) return;

      const issue = String(latestDraw.issueNumber);
      const actualNum = Number(latestDraw.number);
      if (isNaN(actualNum)) return;
      const actualOutcome: 'BIG' | 'SMALL' = actualNum >= 5 ? "BIG" : "SMALL";

      updateCurrentModeState(prev => {
        let activeIdx = prev.activeSpecialistIndex;
        let history = [...prev.history];
        const pending = prev.pendingPrediction;
        let losses = prev.consecutiveLosses || 0;
        let intervention = prev.lastIntervention;
        let didSwitch = false;

        // Baseline initialization if no history
        if (!prev.lastResolvedPeriod) {
          const nextTarget = getNextPeriod(issue);
          const evaluation = evaluateSpecialists(draws, mode);
          const best = evaluation.bestSpecialist;
          const pred = calculatePrediction(nextTarget, best.index, mode);

          return {
            activeSpecialistIndex: best.index,
            history: [],
            lastResolvedPeriod: issue,
            consecutiveLosses: 0,
            pendingPrediction: {
              period: nextTarget,
              modelIndex: best.index,
              modelName: best.name,
              prediction: pred.prediction,
              predictedNumber: pred.predictedNumber,
              confidence: pred.confidence,
              reason: pred.reason || best.strat,
              timestamp: Date.now()
            },
            lastIntervention: `Baseline initialized. Top model ${best.name} engaged (Excluding losing models).`
          };
        }

        // Period resolution
        if (prev.lastResolvedPeriod !== issue && history.findIndex(h => h.period === issue) === -1) {
          let predOutcome: 'BIG' | 'SMALL';
          let predNumber: number;
          let predConf: number;
          let modelUsedIdx = activeIdx;

          if (pending && pending.period === issue) {
            predOutcome = pending.prediction;
            predNumber = pending.predictedNumber;
            predConf = pending.confidence;
            modelUsedIdx = pending.modelIndex;
          } else {
            const spec = SPECIALISTS.find(s => s.index === activeIdx) || SPECIALISTS[0];
            const pred = calculatePrediction(issue, spec.index, mode);
            predOutcome = pred.prediction;
            predNumber = pred.predictedNumber;
            predConf = pred.confidence;
            modelUsedIdx = spec.index;
          }

          const modelUsed = SPECIALISTS.find(s => s.index === modelUsedIdx) || SPECIALISTS[0];
          const isWin = predOutcome === actualOutcome;
          const evaluation = evaluateSpecialists(draws, mode);
          const topWinningSpecialist = evaluation.bestSpecialist;

          if (isWin) {
            losses = 0;
            history.unshift({
              period: issue,
              modelIndex: modelUsed.index,
              modelName: modelUsed.name,
              prediction: predOutcome,
              predictedNumber: predNumber,
              confidence: predConf,
              actualNumber: actualNum,
              actualOutcome,
              result: "WIN",
              switchedAfter: false,
              reason: `${modelUsed.name} win verified`,
              timestamp: Date.now()
            });

            if (activeIdx !== topWinningSpecialist.index) {
              activeIdx = topWinningSpecialist.index;
              didSwitch = true;
              intervention = `${modelUsed.name} won. Shifted to #1 rank ${topWinningSpecialist.name} (${evaluation.top4[0].winStreak}x streak).`;
            } else {
              intervention = `${modelUsed.name} secured WIN. Model leading with active streak.`;
            }
          } else {
            losses++;
            activeIdx = topWinningSpecialist.index;
            didSwitch = true;

            history.unshift({
              period: issue,
              modelIndex: modelUsed.index,
              modelName: modelUsed.name,
              prediction: predOutcome,
              predictedNumber: predNumber,
              confidence: predConf,
              actualNumber: actualNum,
              actualOutcome,
              result: "LOSS",
              switchedAfter: true,
              switchedTo: topWinningSpecialist.name,
              reason: `${modelUsed.name} loss. Filter disqualified model. Brain activated #1 winning contender: ${topWinningSpecialist.name}`,
              timestamp: Date.now()
            });

            intervention = `${modelUsed.name} loss. Disqualified from signals. Brain engaged #1 contender ${topWinningSpecialist.name} (${evaluation.top4[0].winStreak}x streak, ${evaluation.top4[0].winRate}% acc)`;
          }
        }

        // Next prediction
        const nextTarget = getNextPeriod(issue);
        const currentSpec = SPECIALISTS.find(s => s.index === activeIdx) || SPECIALISTS[0];
        const nextPred = calculatePrediction(nextTarget, currentSpec.index, mode);

        const newPending = {
          period: nextTarget,
          modelIndex: currentSpec.index,
          modelName: currentSpec.name,
          prediction: nextPred.prediction,
          predictedNumber: nextPred.predictedNumber,
          confidence: nextPred.confidence,
          reason: nextPred.reason || currentSpec.strat,
          timestamp: Date.now()
        };

        if (history.length > 60) history = history.slice(0, 60);

        if (didSwitch) {
          setIsShiftFlash(true);
          setTimeout(() => setIsShiftFlash(false), 2500);
        }

        return {
          activeSpecialistIndex: activeIdx,
          history,
          lastResolvedPeriod: issue,
          consecutiveLosses: losses,
          pendingPrediction: newPending,
          lastIntervention: intervention
        };
      });
    } finally {
      isResolvingRef.current = false;
    }
  }, [draws, mode, intervalSec]);

  const history = currentModeState.history || [];
  const wins = history.filter((h: any) => h.result === "WIN").length;
  const losses = history.filter((h: any) => h.result === "LOSS").length;
  const total = wins + losses;
  const accuracy = total > 0 ? Math.round((wins / total) * 100) : 0;

  const pending = currentModeState.pendingPrediction;
  const displayPeriod = pending ? pending.period : (draws[0]?.issueNumber ? getNextPeriod(draws[0].issueNumber) : "—");
  const displayPrediction = pending ? pending.prediction : "BIG";
  const displayPredictedNumber = pending ? pending.predictedNumber : 7;
  const displayConfidence = pending ? pending.confidence : 88;

  const isUrgent = timeLeft <= 5;

  const resetHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      "30s": {
        activeSpecialistIndex: 0,
        history: [],
        lastResolvedPeriod: "",
        consecutiveLosses: 0,
        pendingPrediction: null,
        lastIntervention: null
      },
      "1m": {
        activeSpecialistIndex: 0,
        history: [],
        lastResolvedPeriod: "",
        consecutiveLosses: 0,
        pendingPrediction: null,
        lastIntervention: null
      }
    });
    loadDraws();
  };

  return (
    <div className="min-h-screen futuristic-bg pb-12 font-sans antialiased text-[#FFFFFF]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#173B70] bg-[#0B1E3B] text-[#A9B8D0] hover:text-[#FFFFFF] hover:border-[#00D9FF] transition-all active:scale-90 shadow-sm"
              id="ai-brain-back-btn"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Avatar isAi={true} size="sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-extrabold tracking-wider uppercase text-[#FFFFFF]">
                    HUMAN BRAIN 2D
                  </h1>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/30 px-1.5 py-0.5 rounded">
                    ADAPTIVE
                  </span>
                </div>
                <p className="text-[9px] text-[#A9B8D0] font-mono tracking-tight leading-none mt-0.5">
                  Cognitive win/loss specialist arbiter
                </p>
              </div>
            </div>
          </div>

          <motion.div
            animate={isUrgent ? { scale: [1, 1.04, 1], borderColor: ["#FF3864", "#173B70", "#FF3864"] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 transition-colors bg-[#061126] ${
              isUrgent ? "border-[#FF3864]/50 text-[#FF3864]" : "border-[#173B70] text-[#00D9FF]"
            }`}
          >
            {isUrgent ? (
              <ShieldAlert className="h-3 w-3 animate-bounce text-[#FF3864]" />
            ) : (
              <motion.span
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-[#00FF88]"
              />
            )}
            <div className="flex items-baseline gap-0.5">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={timeLeft}
                  initial={{ y: -3, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 3, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-mono font-black tabular-nums"
                >
                  {timeLeft}
                </motion.span>
              </AnimatePresence>
              <span className="text-[9px] font-mono opacity-80 font-bold">s</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3.5 px-4 py-4">
        {/* Speed Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-[#173B70] bg-[#061126] relative shadow-lg">
          <button
            onClick={() => setMode("30s")}
            className={`relative z-10 py-2 px-3 rounded-lg text-[11px] font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer font-mono ${
              mode === "30s" ? "text-white" : "text-[#A9B8D0] hover:text-white"
            }`}
            id="ai-tab-30s"
          >
            {mode === "30s" && (
              <motion.div
                layoutId="activeAiModePill"
                className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#00FF88] rounded-lg border border-[#00D9FF]/40 shadow-[0_0_15px_rgba(0,217,255,0.3)] -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Zap className={`h-3.5 w-3.5 neon-icon-glow ${mode === "30s" ? "text-white" : "text-[#00D9FF]"}`} />
            <span className="uppercase tracking-wider">
              30 SECONDS
            </span>
          </button>

          <button
            onClick={() => setMode("1m")}
            className={`relative z-10 py-2 px-3 rounded-lg text-[11px] font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer font-mono ${
              mode === "1m" ? "text-white" : "text-[#A9B8D0] hover:text-white"
            }`}
            id="ai-tab-1m"
          >
            {mode === "1m" && (
              <motion.div
                layoutId="activeAiModePill"
                className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#00FF88] rounded-lg border border-[#00D9FF]/40 shadow-[0_0_15px_rgba(0,217,255,0.3)] -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Clock className={`h-3.5 w-3.5 neon-icon-glow ${mode === "1m" ? "text-white" : "text-[#8B5CF6]"}`} />
            <span className="uppercase tracking-wider">
              1 MINUTE
            </span>
          </button>
        </div>

        {/* 2D Brain Canvas & Lobe Visualization */}
        <div className="rounded-2xl border border-[#173B70] bg-[#0B1E3B] p-4 space-y-3 relative overflow-hidden shadow-xl hover:-translate-y-0.5 hover:border-[#00E5FF]/60 hover:shadow-[0_14px_34px_-5px_rgba(2,8,23,0.85),0_0_20px_rgba(0,87,255,0.25),0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#00D9FF] font-bold">
              <Brain className="h-4 w-4 text-[#8B5CF6] animate-pulse" />
              <span>COGNITIVE NEURAL ARBITER</span>
            </span>
            <div className="flex items-center gap-1.5 text-[#00FF88] text-[9px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] animate-ping" />
              <span>SYNAPSE ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-[#061126] border border-[#173B70] rounded-xl p-3">
            {/* Visual Brain 2D SVG */}
            <div className="relative h-16 w-20 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 85" className="h-full w-full">
                {/* Left Hemisphere */}
                <path
                  d="M48 10 C32 10 18 22 18 42 C18 60 30 72 48 76 Z"
                  fill="none"
                  stroke={activeSpecialist.lobe === "LEFT_REVERSION" ? "#00D9FF" : "#173B70"}
                  strokeWidth="2.5"
                  strokeDasharray={activeSpecialist.lobe === "LEFT_REVERSION" ? "none" : "3 2"}
                  className="transition-colors duration-300"
                />
                {/* Right Hemisphere */}
                <path
                  d="M52 10 C68 10 82 22 82 42 C82 60 70 72 52 76 Z"
                  fill="none"
                  stroke={activeSpecialist.lobe === "RIGHT_MOMENTUM" ? "#00FF88" : "#173B70"}
                  strokeWidth="2.5"
                  strokeDasharray={activeSpecialist.lobe === "RIGHT_MOMENTUM" ? "none" : "3 2"}
                  className="transition-colors duration-300"
                />
                <path d="M50 12 L50 74" stroke={activeSpecialist.lobe === "FRONTAL_PRECISION" ? "#8B5CF6" : "#173B70"} strokeWidth="2" strokeDasharray="2 2" />
                {/* Synapse nodes */}
                <circle cx="34" cy="28" r="3.5" fill={activeSpecialist.lobe === "LEFT_REVERSION" ? "#00D9FF" : "#173B70"} />
                <circle cx="28" cy="48" r="3" fill={activeSpecialist.lobe === "LEFT_REVERSION" ? "#00D9FF" : "#173B70"} />
                <circle cx="38" cy="62" r="2.5" fill={activeSpecialist.lobe === "LEFT_REVERSION" ? "#00D9FF" : "#173B70"} />
                <circle cx="66" cy="28" r="3.5" fill={activeSpecialist.lobe === "RIGHT_MOMENTUM" ? "#00FF88" : "#173B70"} />
                <circle cx="72" cy="48" r="3" fill={activeSpecialist.lobe === "RIGHT_MOMENTUM" ? "#00FF88" : "#173B70"} />
                <circle cx="62" cy="62" r="2.5" fill={activeSpecialist.lobe === "RIGHT_MOMENTUM" ? "#00FF88" : "#173B70"} />
                <circle cx="50" cy="20" r="4" fill={activeSpecialist.lobe === "FRONTAL_PRECISION" ? "#8B5CF6" : "#00D9FF"} />
                {/* Synapse Pulse Line */}
                <motion.line
                  x1="50"
                  y1="20"
                  x2={activeSpecialist.lobe === "LEFT_REVERSION" ? 34 : activeSpecialist.lobe === "RIGHT_MOMENTUM" ? 66 : 50}
                  y2={activeSpecialist.lobe === "FRONTAL_PRECISION" ? 60 : 48}
                  stroke="#00D9FF"
                  strokeWidth="2"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#A9B8D0] font-semibold uppercase">REGIME:</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#173B70] bg-[#0B1E3B] text-[#00D9FF]">
                  {regime.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#A9B8D0] font-semibold uppercase">ACTIVE ROUTE:</span>
                <span className="text-[10px] font-bold text-[#00FF88] truncate">
                  {activeSpecialist.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[8px]">
                <span className="text-[#A9B8D0] font-semibold">SHIELD:</span>
                <span className={currentModeState.consecutiveLosses >= 2 ? "text-[#FF3864] font-bold" : "text-[#00FF88] font-bold"}>
                  {currentModeState.consecutiveLosses >= 2 ? "⚠️ RECOVERY MODE" : "ACTIVE PROFIT MODE"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Specialist Tag */}
          <div className="flex items-center gap-3 pt-0.5">
            <Avatar index={activeSpecialist.index} name={activeSpecialist.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFFFFF] tracking-tight truncate">
                  {activeSpecialist.name}
                </span>
                <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#8B5CF6]">
                  {activeSpecialist.role}
                </span>
              </div>
              <p className="text-[10px] text-[#A9B8D0] font-mono truncate leading-none mt-1">
                {activeSpecialist.strat}
              </p>
            </div>
          </div>
        </div>

        {/* Prediction & Execution History protected by UnlockModal */}
        <UnlockModal englishMode={true}>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-[#173B70] bg-[#0B1E3B]">
              <div className="text-center space-y-2">
                <div className="relative mx-auto h-7 w-7">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="h-7 w-7 rounded-full border-2 border-[#00D9FF] border-t-transparent"
                  />
                  <Brain className="absolute inset-0 m-auto h-3.5 w-3.5 text-[#8B5CF6]" />
                </div>
                <p className="text-[10px] text-[#A9B8D0] font-bold tracking-wider uppercase font-mono">
                  Synchronizing Neural Data Stream...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <PredictionCard
                prediction={displayPrediction}
                confidence={displayConfidence}
                predictedNumber={displayPredictedNumber}
                currentPeriod={displayPeriod}
                mode={mode}
              />

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2">
                <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-[#00FF88]/30 bg-[#0B1E3B] p-2.5 text-center shadow-md">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <CheckCircle2 className="h-3 w-3 text-[#00FF88]" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#00FF88]">WINS</span>
                  </div>
                  <div className="text-xl font-mono font-black tabular-nums text-[#00FF88] glow-text-green">{wins}</div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-[#FF3864]/30 bg-[#0B1E3B] p-2.5 text-center shadow-md">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <XCircle className="h-3 w-3 text-[#FF3864]" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FF3864]">LOSSES</span>
                  </div>
                  <div className="text-xl font-mono font-black tabular-nums text-[#FF3864]">{losses}</div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-[#173B70] bg-[#0B1E3B] p-2.5 text-center shadow-md">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <TrendingUp className="h-3 w-3 text-[#00D9FF]" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#A9B8D0]">ACCURACY</span>
                  </div>
                  <div className="text-xl font-mono font-black tabular-nums text-[#00D9FF] glow-text-cyan">{accuracy}%</div>
                </motion.div>
              </div>

              {/* History Table */}
              <div className="rounded-2xl border border-[#173B70] overflow-hidden bg-[#061126] shadow-xl" id="ai-history-table">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#173B70] bg-[#0B1E3B]">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#A9B8D0]">
                    <Activity className="h-3.5 w-3.5 text-[#00D9FF]" />
                    <span className="text-[#FFFFFF]">EXECUTION HISTORY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetHistory}
                      title="Reset Human Brain History"
                      className="p-1 rounded text-[#A9B8D0] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                    <span className="text-[8px] font-mono text-[#00FF88] font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                      IMMUTABLE
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-[1.1fr_1fr_32px_44px_54px] items-center gap-1 px-3 py-2 bg-[#061126] border-b border-[#173B70] text-[8px] font-mono font-bold uppercase tracking-wider text-[#A9B8D0]">
                  <span>PERIOD</span>
                  <span>MODEL</span>
                  <span className="text-center">#</span>
                  <span className="text-center">SIG</span>
                  <span className="text-center">STATUS</span>
                </div>

                <div className="max-h-[320px] overflow-y-auto divide-y divide-[#173B70]/30 bg-[#061126]">
                  {history.length === 0 ? (
                    <div className="p-6 text-center space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5 text-[#00D9FF]">
                        <Activity className="h-3.5 w-3.5 animate-pulse text-[#00D9FF]" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                          READY FOR LIVE FEED
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#A9B8D0] max-w-xs mx-auto">
                        Historical tracking starts recording upon first resolved round.
                      </p>
                    </div>
                  ) : (
                    history.map((item: any, idx: number) => {
                      const isBig = item.prediction === "BIG";
                      return (
                        <div
                          key={`${item.period}-${idx}`}
                          className="grid grid-cols-[1.1fr_1fr_32px_44px_54px] items-center gap-1 px-3 py-2 transition-colors hover:bg-[#0B1E3B]/60"
                        >
                          <div className="font-mono text-[10px] font-bold text-[#FFFFFF] truncate tabular-nums">
                            {item.period.length > 7 ? "..." + item.period.slice(-7) : item.period}
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                            <Avatar index={item.modelIndex} size="xs" animated={false} />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono font-bold text-[#FFFFFF] truncate block leading-none">
                                {item.modelName.replace(/ (Pro|King|VIP|Master)/, "")}
                              </span>
                              {item.switchedAfter && item.switchedTo && (
                                <span className="text-[8px] font-mono text-[#00D9FF] block truncate leading-none mt-0.5 font-bold">
                                  ↳ {item.switchedTo.split(" ")[0]}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-center items-center">
                            <NumberBall number={item.actualNumber} size="xs" animated />
                          </div>
                          <div className="text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                                isBig
                                  ? "badge-cyan"
                                  : "badge-purple"
                              }`}
                            >
                              {item.prediction === "BIG" ? "BIG" : "SML"}
                            </span>
                          </div>
                          <div className="text-center">
                            {item.result === "WIN" ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase badge-win shadow-sm">
                                <CheckCircle2 className="h-2 w-2 text-[#00FF88]" />
                                WIN
                              </span>
                            ) : item.result === "LOSS" ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase badge-loss">
                                <XCircle className="h-2 w-2 text-[#FF3864]" />
                                LOSS
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-[#0B1E3B] text-[#A9B8D0] border border-[#173B70] text-[8px] font-mono font-bold uppercase animate-pulse">
                                WAIT
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </UnlockModal>
      </main>
    </div>
  );
};
