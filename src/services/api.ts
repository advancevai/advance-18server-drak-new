import { LotteryResult, PredictionResult, LogicInfo } from '../types';
import { hashString, calculatePrediction, getNextPeriod } from './algorithms';

const WINGO_30S_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json";
const WINGO_1M_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

const RESULTS_VAULT_KEY = "wingo_permanent_result_vault_v2";
const DRAWS_VAULT_KEY = "wingo_permanent_draw_vault_v2";
const PENDING_VAULT_KEY = "wingo_permanent_pending_vault_v2";

const resolvedVault: Record<string, PredictionResult> = {};
const drawVault: Record<string, LotteryResult> = {};
const pendingVault: Record<string, any> = {};

const memoryCache: Record<string, { data: LotteryResult[]; timestamp: number } | undefined> = {};
const inFlightRequests: Record<string, Promise<LotteryResult[] | null> | undefined> = {};
const lastKnownGood: Record<string, LotteryResult[] | undefined> = {};

const CACHE_TTL_MS = 1500;

if (typeof window !== "undefined") {
  try {
    const rawResults = localStorage.getItem(RESULTS_VAULT_KEY);
    if (rawResults) Object.assign(resolvedVault, JSON.parse(rawResults));
  } catch {}
  try {
    const rawDraws = localStorage.getItem(DRAWS_VAULT_KEY);
    if (rawDraws) Object.assign(drawVault, JSON.parse(rawDraws));
  } catch {}
  try {
    const rawPending = localStorage.getItem(PENDING_VAULT_KEY);
    if (rawPending) Object.assign(pendingVault, JSON.parse(rawPending));
  } catch {}
}

let syncTimeout: any = null;
function scheduleVaultSync() {
  if (syncTimeout) return;
  syncTimeout = setTimeout(() => {
    syncTimeout = null;
    if (typeof window !== "undefined") {
      try {
        const keys = Object.keys(resolvedVault);
        if (keys.length > 500) {
          keys.slice(0, keys.length - 500).forEach(k => delete resolvedVault[k]);
        }
        localStorage.setItem(RESULTS_VAULT_KEY, JSON.stringify(resolvedVault));
      } catch {}
      try {
        const keys = Object.keys(drawVault);
        if (keys.length > 500) {
          keys.slice(0, keys.length - 500).forEach(k => delete drawVault[k]);
        }
        localStorage.setItem(DRAWS_VAULT_KEY, JSON.stringify(drawVault));
      } catch {}
      try {
        const keys = Object.keys(pendingVault);
        if (keys.length > 100) {
          keys.slice(0, keys.length - 100).forEach(k => delete pendingVault[k]);
        }
        localStorage.setItem(PENDING_VAULT_KEY, JSON.stringify(pendingVault));
      } catch {}
    }
  }, 1000);
}

export function generateDeterministicDraws(intervalSec: number = 30): LotteryResult[] {
  const now = Date.now();
  const list: LotteryResult[] = [];
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const totalPeriodsPassed = Math.floor((now - startOfDay.getTime()) / (intervalSec * 1000));
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let i = 0; i < 20; i++) {
    const periodNumber = totalPeriodsPassed - i;
    if (periodNumber <= 0) break;
    const issueNumber = `${dateStr}01${String(periodNumber).padStart(4, "0")}`;

    if (drawVault[issueNumber]) {
      list.push(drawVault[issueNumber]);
      continue;
    }

    const h = hashString(`LOTTERY-DRAW-${issueNumber}`);
    const num = h % 10;
    const colour = num === 0 ? "red,violet" : num === 5 ? "green,violet" : (num % 2 === 0 ? "red" : "green");

    const item: LotteryResult = {
      issueNumber,
      number: String(num),
      colour,
      premium: String(h % 1000)
    };
    drawVault[issueNumber] = item;
    list.push(item);
  }

  scheduleVaultSync();
  return list;
}

export async function fetchLotteryWithFallback(url: string, intervalSec: number = 30): Promise<LotteryResult[]> {
  const now = Date.now();
  if (memoryCache[url] && (now - memoryCache[url].timestamp < CACHE_TTL_MS)) {
    return memoryCache[url].data;
  }

  if (inFlightRequests[url]) {
    const existing = await inFlightRequests[url];
    if (existing && existing.length > 0) return existing;
  }

  const reqPromise = (async () => {
    function parseJsonList(json: any): LotteryResult[] {
      if (!json) return [];
      const rawList = Array.isArray(json?.data?.list)
        ? json.data.list
        : Array.isArray(json?.list)
        ? json.list
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.data?.items)
        ? json.data.items
        : Array.isArray(json?.items)
        ? json.items
        : [];

      if (!Array.isArray(rawList) || rawList.length === 0) return [];

      return rawList.map((item: any) => {
        const issue = item?.issueNumber || item?.period || item?.issue_number || item?.issue || item?.issueNum || item?.periodNumber || item?.drawId;
        if (!issue) return null;
        const numRaw = item?.number ?? item?.num ?? item?.openNumber ?? item?.result ?? item?.drawNumber ?? item?.lotteryNum;
        const numberStr = numRaw !== undefined && numRaw !== null ? String(numRaw).trim() : "0";
        const issueStr = String(issue).trim();
        const n = Number(numberStr);
        const colour = item?.colour || item?.color || (n === 0 ? "red,violet" : n === 5 ? "green,violet" : n % 2 === 0 ? "red" : "green");
        return {
          issueNumber: issueStr,
          number: numberStr,
          colour,
          premium: String(item?.premium || item?.openPremium || "100")
        };
      }).filter(Boolean) as LotteryResult[];
    }

    const is30s = url.includes("WinGo_30S");
    const candidates = [
      is30s ? "/api/wingo30s" : "/api/wingo1m",
      `${url}?ts=${Date.now()}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    for (const targetUrl of candidates) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const resp = await fetch(targetUrl, {
          method: "GET",
          headers: { Accept: "application/json, text/plain, */*" },
          signal: controller.signal
        });
        clearTimeout(timer);
        if (!resp.ok) continue;

        const text = await resp.text();
        let json: any = null;
        try {
          json = JSON.parse(text);
        } catch {
          continue;
        }

        const parsed = parseJsonList(json);
        if (parsed.length > 0) {
          parsed.forEach(item => {
            drawVault[item.issueNumber] = item;
          });
          scheduleVaultSync();
          memoryCache[url] = { data: parsed, timestamp: Date.now() };
          lastKnownGood[url] = parsed;
          return parsed;
        }
      } catch {
        clearTimeout(timer);
      }
    }

    return null;
  })();

  inFlightRequests[url] = reqPromise;
  let result: LotteryResult[] | null = null;
  try {
    result = await reqPromise;
  } finally {
    delete inFlightRequests[url];
  }

  if (result && result.length > 0) return result;
  if (lastKnownGood[url] && lastKnownGood[url].length > 0) return lastKnownGood[url];

  const synthetic = generateDeterministicDraws(intervalSec);
  lastKnownGood[url] = synthetic;
  return synthetic;
}

export async function fetchWingo30s(): Promise<LotteryResult[]> {
  return fetchLotteryWithFallback(WINGO_30S_URL, 30);
}

export async function fetchWingo1m(): Promise<LotteryResult[]> {
  return fetchLotteryWithFallback(WINGO_1M_URL, 60);
}

export function calculateTraderHistory(
  draws: LotteryResult[],
  modelIndex: number,
  mode: string = "30s"
): PredictionResult[] {
  if (!Array.isArray(draws) || draws.length === 0) return [];
  const list: PredictionResult[] = [];
  const limit = Math.min(10, draws.length);
  let changed = false;

  for (let i = 0; i < limit; i++) {
    const draw = draws[i];
    if (!draw || !draw.issueNumber) continue;
    const period = String(draw.issueNumber);
    const vaultKey = `${mode}-${period}-${modelIndex}`;

    if (resolvedVault[vaultKey]) {
      list.push(resolvedVault[vaultKey]);
      continue;
    }

    const pendingKey = `${mode}-${period}-${modelIndex}`;
    const pred = pendingVault[pendingKey] || calculatePrediction(period, modelIndex, mode);

    const actualNumber = Number(draw.number);
    const safeActual = Number.isFinite(actualNumber) ? actualNumber : 0;
    const actualOutcome: 'BIG' | 'SMALL' = safeActual >= 5 ? "BIG" : "SMALL";
    const isWin = pred.prediction === actualOutcome;

    const record: PredictionResult = {
      period,
      prediction: pred.prediction,
      predicted_number: Number.isFinite(pred.predictedNumber) ? pred.predictedNumber : (pred.prediction === "BIG" ? 7 : 2),
      actual_number: safeActual,
      confidence: Number.isFinite(pred.confidence) ? pred.confidence : 85,
      result: isWin ? "WIN" : "LOSS",
      created_at: new Date().toISOString(),
      reason: pred.reason,
      logicName: pred.logicName,
      logicNameBn: pred.logicNameBn,
      logicBadge: pred.logicBadge
    };

    resolvedVault[vaultKey] = record;
    list.push(record);
    changed = true;
  }

  if (changed) scheduleVaultSync();
  return list;
}

export async function fetchSignalDetail(mode: '30s' | '1m', modelIndex: number): Promise<{
  pending: PredictionResult[];
  latest: PredictionResult | null;
  isRestricted: boolean;
  history: PredictionResult[];
  logicInfo: LogicInfo | null;
}> {
  let draws: LotteryResult[] = [];
  try {
    draws = mode === "30s" ? await fetchWingo30s() : await fetchWingo1m();
  } catch {
    draws = [];
  }

  if (!Array.isArray(draws) || draws.length === 0) {
    draws = generateDeterministicDraws(mode === "30s" ? 30 : 60);
  }

  const history = calculateTraderHistory(draws, modelIndex, mode);
  const pending: PredictionResult[] = [];
  let logicInfo: LogicInfo | null = null;

  if (draws.length > 0) {
    const nextPeriod = getNextPeriod(draws);
    const pendingKey = `${mode}-${nextPeriod}-${modelIndex}`;
    let pred = pendingVault[pendingKey];
    if (!pred) {
      pred = calculatePrediction(nextPeriod, modelIndex, mode);
      pendingVault[pendingKey] = pred;
      scheduleVaultSync();
    }

    logicInfo = {
      logicName: pred.logicName,
      logicNameBn: pred.logicNameBn,
      logicBadge: pred.logicBadge,
      logicCategory: pred.logicCategory,
      logicId: pred.logicId,
      reason: pred.reason
    };

    pending.push({
      period: nextPeriod,
      prediction: pred.prediction,
      confidence: Number.isFinite(pred.confidence) ? pred.confidence : 85,
      predicted_number: Number.isFinite(pred.predictedNumber) ? pred.predictedNumber : (pred.prediction === "BIG" ? 7 : 2),
      reason: pred.reason,
      logicName: pred.logicName,
      logicNameBn: pred.logicNameBn,
      logicBadge: pred.logicBadge
    });
  }

  let lossStreak = 0;
  for (const h of history) {
    if (h.result === "LOSS") {
      lossStreak++;
      if (lossStreak >= 7) break;
    } else {
      lossStreak = 0;
    }
  }

  const winCount = history.filter(h => h.result === "WIN").length;
  const isRestricted = lossStreak >= 7 || (history.length >= 5 && winCount <= 2);

  return {
    pending,
    latest: pending[0] ?? null,
    isRestricted,
    history,
    logicInfo
  };
}
