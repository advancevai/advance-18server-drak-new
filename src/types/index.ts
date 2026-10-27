export type Mode = '30s' | '1m';

export interface LotteryResult {
  issueNumber: string;
  number: string;
  colour: string;
  premium: string;
}

export interface PredictionResult {
  period: string;
  prediction: 'BIG' | 'SMALL';
  confidence: number;
  predicted_number: number;
  actual_number?: number;
  actualOutcome?: 'BIG' | 'SMALL';
  result?: 'WIN' | 'LOSS' | 'PENDING';
  created_at?: string;
  reason?: string;
  logicName?: string;
  logicNameBn?: string;
  logicBadge?: string;
}

export interface LogicInfo {
  logicName: string;
  logicNameBn: string;
  logicBadge: string;
  logicCategory: string;
  logicId: number;
  reason: string;
}

export interface Specialist {
  index: number;
  name: string;
  role: string;
  badge: string;
  strat: string;
  category: string;
  lobe: 'LEFT_REVERSION' | 'RIGHT_MOMENTUM' | 'FRONTAL_PRECISION';
}

export interface TraderStats {
  index: number;
  winRate: number;
  wins: number;
  losses: number;
  total: number;
  maxStreak: number;
}
