import assert from "assert";
import { suggestMood } from "./moodSuggest";
import { optimizeRoute } from "./optimizeRoute";
import { calculateTotalDistance } from "./calculateRoute";
import { analyzeBudget } from "./budgetInsight";
import { MOCK_TRIPS } from "../data/mockData";
import type { Trip } from "../data/mockData";

// suggestMood
assert.strictEqual(suggestMood("amazing sunset"), "🤩");
assert.strictEqual(suggestMood("beautiful beach"), "😍");
assert.strictEqual(suggestMood("just a normal day"), "😊");

// optimizeRoute: reordered total distance ≤ original, stop 0 fixed, labels resequenced
const bali = MOCK_TRIPS[0].route;
const opt = optimizeRoute(bali);
assert.strictEqual(opt[0].id, bali[0].id, "departure stop stays first");
assert.ok(calculateTotalDistance(opt) <= calculateTotalDistance(bali) + 1e-9, "optimized ≤ original");
assert.strictEqual(opt.map((s) => s.label).join(""), "ABCD", "labels resequenced");
assert.strictEqual(opt.length, bali.length, "no stops lost");

// analyzeBudget: over-pace trip flags overBudget; 10× outlier detected
const over: Trip = {
  ...MOCK_TRIPS[0],
  budget: 500,
  spent: 400,
  startDate: "2024-03-10",
  endDate: "2024-03-20",
  expenses: [
    { id: "a", description: "x", amount: 20, currency: "USD", date: "2024-03-11", category: "Food", icon: "🍕", aiSuggested: false },
    { id: "b", description: "y", amount: 25, currency: "USD", date: "2024-03-11", category: "Food", icon: "🍕", aiSuggested: false },
    { id: "c", description: "z", amount: 30, currency: "USD", date: "2024-03-12", category: "Transport", icon: "🚗", aiSuggested: false },
    { id: "big", description: "splurge", amount: 500, currency: "USD", date: "2024-03-12", category: "Shopping", icon: "🛍️", aiSuggested: false },
  ],
};
const ins = analyzeBudget(over);
assert.ok(ins.overBudget, "projected spend exceeds budget");
assert.ok(ins.anomalies.some((e) => e.id === "big"), "10× outlier flagged");

console.log("selfcheck OK");
