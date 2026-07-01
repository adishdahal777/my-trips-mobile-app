import type { Expense, Trip } from "../data/mockData";
import { formatCurrency } from "./formatCurrency";

export interface BudgetInsight {
  pctBudget: number;        // 0..1+
  dailyBurn: number;        // spent per elapsed day
  projectedTotal: number;   // dailyBurn × trip duration
  topCategory: string | null;
  topCategoryPct: number;   // share of spent, 0..1
  overBudget: boolean;      // projectedTotal > budget
  anomalies: Expense[];     // expenses above mean + 2·stdDev
  summary: string;
}

function daysBetween(a: string, b: string): number {
  return Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Derives spending insights from a trip's expenses. Pure, offline, no LLM.
 */
export function analyzeBudget(trip: Trip): BudgetInsight {
  const { expenses, budget, spent, currency } = trip;
  const duration = daysBetween(trip.startDate, trip.endDate);

  // Elapsed days = span from trip start to the latest expense (clamped to duration).
  const lastDate = expenses.reduce((max, e) => (e.date > max ? e.date : max), trip.startDate);
  const elapsed = Math.min(duration, daysBetween(trip.startDate, lastDate));

  const dailyBurn = spent / elapsed;
  const projectedTotal = Math.round(dailyBurn * duration);
  const pctBudget = budget > 0 ? spent / budget : 0;

  // Top category
  const catTotals = expenses.reduce((a, e) => {
    a[e.category] = (a[e.category] || 0) + e.amount;
    return a;
  }, {} as Record<string, number>);
  let topCategory: string | null = null;
  let topVal = 0;
  for (const [cat, val] of Object.entries(catTotals)) {
    if (val > topVal) { topVal = val; topCategory = cat; }
  }
  const topCategoryPct = spent > 0 ? topVal / spent : 0;

  // Outlier detection: robust modified z-score (median + MAD). Robust to a single
  // extreme expense masking itself, which mean+2σ suffers from at small n.
  let anomalies: Expense[] = [];
  if (expenses.length >= 3) {
    const amounts = expenses.map((e) => e.amount);
    const med = median(amounts);
    const mad = median(amounts.map((a) => Math.abs(a - med)));
    if (mad > 0) {
      anomalies = expenses.filter((e) => (0.6745 * (e.amount - med)) / mad > 3.5);
    }
  }

  const overBudget = projectedTotal > budget;

  let summary: string;
  if (spent === 0) {
    summary = "No spending logged yet.";
  } else if (overBudget) {
    summary = `⚠️ Over budget: projected ${formatCurrency(projectedTotal, currency)} of ${formatCurrency(budget, currency)}`;
    if (topCategory) summary += ` — ${Math.round(topCategoryPct * 100)}% on ${topCategory}`;
  } else {
    summary = `On track — projected ${formatCurrency(projectedTotal, currency)} of ${formatCurrency(budget, currency)}`;
  }

  return { pctBudget, dailyBurn, projectedTotal, topCategory, topCategoryPct, overBudget, anomalies, summary };
}
