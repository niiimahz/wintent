// English-SERP approximate benchmark CTR by position (fallback when site data is sparse)
const BENCHMARK = [
  { pos: 1, ctr: 0.27 },
  { pos: 2, ctr: 0.15 },
  { pos: 3, ctr: 0.10 },
  { pos: 4, ctr: 0.07 },
  { pos: 5, ctr: 0.05 },
  { pos: 6, ctr: 0.04 },
  { pos: 7, ctr: 0.03 },
  { pos: 8, ctr: 0.025 },
  { pos: 9, ctr: 0.022 },
  { pos: 10, ctr: 0.02 },
];
const BENCHMARK_FALLBACK = 0.015; // >10

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function benchmarkCTR(pos) {
  if (pos > 10) return BENCHMARK_FALLBACK;
  // Interpolate between surrounding benchmark points
  const lower = Math.max(1, Math.floor(pos));
  const upper = Math.min(10, Math.ceil(pos));
  if (lower === upper) return BENCHMARK[lower - 1].ctr;
  const lo = BENCHMARK[lower - 1].ctr;
  const hi = BENCHMARK[upper - 1].ctr;
  const t = pos - lower;
  return lo + t * (hi - lo);
}

// Build a function: position → baseline CTR (site-specific, with benchmark fallback)
// Uses binary search (O(log n) per lookup) instead of linear scan (O(n)).
export function buildBaselineFn(rows) {
  const valid = rows.filter(r => r.impressions >= 50);
  // Pre-sort once so binary search works
  valid.sort((a, b) => a.position - b.position);
  const positions = valid.map(r => r.position);

  // Result cache — positions repeat a lot across 1000 rows
  const cache = new Map();

  return function baselineCTR(pos) {
    const key = Math.round(pos * 100); // cache key with 0.01 precision
    if (cache.has(key)) return cache.get(key);

    const lo = pos - 0.75;
    const hi = pos + 0.75;

    // Binary search for first index >= lo
    let left = 0, right = positions.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (positions[mid] < lo) left = mid + 1;
      else right = mid;
    }

    const ctrs = [];
    for (let i = left; i < positions.length && positions[i] <= hi; i++) {
      ctrs.push(valid[i].ctr);
    }

    const result = ctrs.length >= 5 ? median(ctrs) : benchmarkCTR(pos);
    cache.set(key, result);
    return result;
  };
}

export function computeMetrics(rows, baselineFn, settings, isQueryMode) {
  return rows.map(row => {
    const { label, clicks, impressions, ctr, position } = row;
    const hasData = impressions >= 50;

    const baseline = hasData ? baselineFn(position) : null;
    const ctrGap = hasData ? ctr - baseline : null;

    let opportunityScore = null;
    if (hasData) {
      if (position <= 1.5) {
        opportunityScore = 0;
      } else {
        const baseAbove = baselineFn(position - 1);
        opportunityScore = Math.max(0, Math.round(impressions * (baseAbove - ctr)));
      }
    }

    let intent = null;
    let branded = false;

    if (isQueryMode) {
      const q = label.toLowerCase();
      const trans = settings.transactionalWords.some(w => w && q.includes(w.toLowerCase()));
      const info = settings.informationalWords.some(w => w && q.includes(w.toLowerCase()));
      intent = trans ? 'خرید' : info ? 'اطلاعاتی' : 'نامشخص';
      branded = settings.brandTerms.some(t => t && q.includes(t.toLowerCase()));
    }

    // Flag: good rank but nearly zero CTR → likely SERP feature eating clicks
    const flagged =
      hasData &&
      baseline !== null &&
      position <= 3 &&
      impressions > 500 &&
      ctr < baseline * 0.3;

    return { ...row, baseline, ctrGap, opportunityScore, intent, branded, flagged, hasData };
  });
}

export function computeKPIs(queriesWithMetrics, settings) {
  // 1. Total recoverable clicks
  const totalOpportunity = queriesWithMetrics
    .filter(r => r.opportunityScore !== null)
    .reduce((s, r) => s + r.opportunityScore, 0);

  // 2. Queries weaker than expected (CTR Gap < 0)
  const weakCount = queriesWithMetrics.filter(r => r.ctrGap !== null && r.ctrGap < 0).length;

  // 3. Brand share (by clicks)
  let brandShare = null;
  if (settings.brandTerms.some(t => t.trim())) {
    const totalClicks = queriesWithMetrics.reduce((s, r) => s + r.clicks, 0);
    const brandClicks = queriesWithMetrics
      .filter(r => r.branded)
      .reduce((s, r) => s + r.clicks, 0);
    brandShare = totalClicks > 0 ? (brandClicks / totalClicks) * 100 : 0;
  }

  // 4. Bottleneck detection
  const total = queriesWithMetrics.length;
  let bottleneck = { verdict: 'متعادل', line: 'وضعیت کلی سایت در تعادل است.' };
  if (total > 0) {
    const belowTen = queriesWithMetrics.filter(r => r.position > 10).length;
    if (belowTen > total / 2) {
      bottleneck = {
        verdict: 'مشکل اصلی: رتبه‌گرفتن',
        line: 'بیشتر کلماتت در صفحه دوم‌اند؛ روی محتوا و لینک تمرکز کن.',
      };
    } else {
      const withGap = queriesWithMetrics.filter(r => r.ctrGap !== null);
      if (withGap.length > 0) {
        const avgGap = withGap.reduce((s, r) => s + r.ctrGap, 0) / withGap.length;
        if (avgGap < 0) {
          bottleneck = {
            verdict: 'مشکل اصلی: کلیک‌خوردن',
            line: 'رتبه‌ات خوب است ولی عنوان/توضیحاتت کلیک نمی‌گیرد؛ روی title و meta کار کن.',
          };
        }
      }
    }
  }

  return { totalOpportunity, weakCount, brandShare, bottleneck };
}
