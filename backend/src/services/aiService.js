/**
 * src/services/aiService.js
 * Lightweight deterministic "AI" for POC:
 * - parseSegmentFromNL(text): heuristics -> conditionTree
 * - suggestMessages(objective, audienceHints): template + small variation generator
 */

export function parseSegmentFromNL(text = "") {
  text = (text || "").toString().trim().toLowerCase();

  // default empty tree
  const tree = { op: "AND", rules: [] };

  if (!text) return tree;

  // helper: find number (handles "6 months", "5000", "₹5k", "5k")
  function findNumber(s) {
    const m = s.match(/(\d+(\.\d+)?)(\s*(k|km|k₹|krs)?)?/);
    if (!m) return null;
    let n = Number(m[1]);
    const suffix = (m[4] || "").toLowerCase();
    if (suffix && suffix.startsWith("k")) n = n * 1000;
    return n;
  }

  // 1) inactive / haven't shopped in X months -> inactive_days_gt
  const inactiveMatch = text.match(/(haven't|have not|not)\s+shopp(?:ed|ing)\s+in\s+(\d+)\s+month/);
  const inactiveMatch2 = text.match(/inactive\s+for\s+(\d+)\s+days?/);
  if (inactiveMatch) {
    const months = Number(inactiveMatch[2] || 0);
    const days = months * 30;
    tree.rules.push({ field: "lastOrderAt", cmp: "inactive_days_gt", value: days });
  } else if (inactiveMatch2) {
    const days = Number(inactiveMatch2[1]);
    tree.rules.push({ field: "lastOrderAt", cmp: "inactive_days_gt", value: days });
  } else {
    // generic "inactive X months"
    const m = text.match(/inactive\s+(\d+)\s+month/);
    if (m) tree.rules.push({ field: "lastOrderAt", cmp: "inactive_days_gt", value: Number(m[1]) * 30 });
  }

  // 2) spent > amount detection (₹, rs, inr, k suffix)
  const spentMatch = text.match(/spend(?:t|s)?\s*(?:over|>|greater than|above)?\s*(?:inr|rs|₹)?\s*([0-9,.kK]+)/);
  if (spentMatch) {
    let raw = spentMatch[1].replace(/[, ]+/g, "");
    let val = 0;
    if (/k/i.test(raw)) {
      val = parseFloat(raw.replace(/k/i, "")) * 1000;
    } else val = parseFloat(raw);
    if (!Number.isNaN(val)) tree.rules.push({ field: "totalSpend", cmp: ">", value: Math.round(val) });
  } else {
    // alternate pattern: "over 5k" or "₹5000"
    const alt = text.match(/(?:over|above|greater than)\s*(?:inr|rs|₹)?\s*([0-9,.kK]+)/);
    if (alt) {
      let raw = alt[1].replace(/[, ]+/g, "");
      let val = /k/i.test(raw) ? parseFloat(raw.replace(/k/i, "")) * 1000 : parseFloat(raw);
      if (!Number.isNaN(val)) tree.rules.push({ field: "totalSpend", cmp: ">", value: Math.round(val) });
    }
  }

  // 3) visits < N
  const visitsMatch = text.match(/visits?\s*(?:<|less than|under|fewer than)\s*(\d+)/);
  if (visitsMatch) {
    tree.rules.push({ field: "visits", cmp: "<", value: Number(visitsMatch[1]) });
  } else {
    const visitsMatch2 = text.match(/visits?\s*(\d+)\s*or less/);
    if (visitsMatch2) tree.rules.push({ field: "visits", cmp: "<=", value: Number(visitsMatch2[1]) });
  }

  // 4) tags or segments like "vip", "high value", "new customers"
  const tagMap = [
    { re: /vip|high[- ]?value/, tag: "vip" },
    { re: /new customer|new users|new signups/, tag: "new" },
    { re: /churn|win[- ]?back|inactive/, tag: "inactive" }
  ];
  const tags = [];
  for (const t of tagMap) if (t.re.test(text)) tags.push(t.tag);
  if (tags.length) tree.rules.push({ field: "tags", cmp: "in", value: tags });

  // If no rules parsed, attempt a fallback: look for numeric spend or months
  if (tree.rules.length === 0) {
    const n = findNumber(text);
    if (n && /month|months/.test(text)) {
      tree.rules.push({ field: "lastOrderAt", cmp: "inactive_days_gt", value: n * 30 });
    } else if (n && /spend|spent|₹|rs|inr/.test(text)) {
      tree.rules.push({ field: "totalSpend", cmp: ">", value: Math.round(n) });
    }
  }

  return tree;
}

// Simple message suggestion engine: templates + small synonym picks
export function suggestMessages(objective = "", audienceHints = "") {
  // base templates
  const base = [
    "Hi {{name}}, here's a special offer just for you — save 10% on your next order!",
    "Hey {{name}} — we miss you! Use code WELCOME10 for 10% off your next purchase.",
    "Hello {{name}} — enjoy an exclusive 10% discount as a thank-you for being with us."
  ];

  // synonyms / small variations
  const verbs = ["grab", "redeem", "use", "claim"];
  const opener = ["Hi", "Hey", "Hello", "Hi there"];
  const closers = ["on your next order", "on your next purchase", "on your next visit"];

  // bias messages based on simple keywords in objective/audienceHints
  const obj = (objective || "").toLowerCase();
  const hint = (audienceHints || "").toLowerCase();

  const out = [];
  for (let i = 0; i < 3; i++) {
    const o = opener[i % opener.length];
    const v = verbs[(i + 1) % verbs.length];
    const c = closers[i % closers.length];

    // if objective contains "win" or "bring back", emphasize "we miss you"
    if (obj.includes("win") || obj.includes("bring back") || hint.includes("inactive")) {
      out.push(`${o} {{name}}, we miss you — ${v} 10% off to come back ${c}!`);
      continue;
    }

    // if objective mentions "vip" or audience mentions "high"
    if (obj.includes("vip") || hint.includes("vip") || hint.includes("high value")) {
      out.push(`${o} {{name}}, an exclusive 15% offer for top customers — ${v} today ${c}.`);
      continue;
    }

    // fallback template
    out.push(`${o} {{name}}, ${v} 10% off with code SAVE10 ${c}.`);
  }

  // dedupe and return
  return Array.from(new Set(out)).slice(0, 3);
}
