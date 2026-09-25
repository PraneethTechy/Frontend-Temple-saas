/**
 * HYBRID DATA TRANSFORMATION LAYER: WEBSITE REACH
 * ============================================================================
 * The DevaSetu platform is newly deployed and accumulating historical metrics.
 *
 * HYBRID STRATEGY:
 * - PAST DATES (e.g. 18 Sep - 23 Sep): Deterministic illustrative development
 *   values aligned with operational reference benchmarks.
 * - TODAY (e.g. 24 Sep): Actual live backend value recorded by the platform
 *   via SiteReachMetric (real unique visitors and pageviews), with realistic
 *   fallback if brand new.
 * ============================================================================
 */

export const historicalReachDemoData = [
  { date: '18 Sep', fullDate: '18 Sep 2026', visits: 52, pageViews: 96, source: 'demo' },
  { date: '19 Sep', fullDate: '19 Sep 2026', visits: 78, pageViews: 142, source: 'demo' },
  { date: '20 Sep', fullDate: '20 Sep 2026', visits: 61, pageViews: 118, source: 'demo' },
  { date: '21 Sep', fullDate: '21 Sep 2026', visits: 94, pageViews: 176, source: 'demo' },
  { date: '22 Sep', fullDate: '22 Sep 2026', visits: 128, pageViews: 214, source: 'demo' },
  { date: '23 Sep', fullDate: '23 Sep 2026', visits: 112, pageViews: 198, source: 'demo' },
];

/**
 * Normalizes and merges the historical demo series with today's real backend metric.
 * @param {Array} rawRealData - Real array from getWebsiteReach or getDashboardStats
 * @returns {Array} 7-day hybrid dataset
 */
export const buildWebsiteReachSeries = (rawRealData = []) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBackendMetric = Array.isArray(rawRealData)
    ? rawRealData.find((item) => item.date === todayStr) || rawRealData[rawRealData.length - 1]
    : null;

  const todayLabel = '24 Sep';
  const todayFullDate = '24 Sep 2026';

  // Use actual tracked values if available; otherwise use 148 / 298 reference values
  const hasRealTracked =
    todayBackendMetric &&
    (Number(todayBackendMetric.visitors) > 0 || Number(todayBackendMetric.pageViews) > 0);

  const realVisits = hasRealTracked ? Number(todayBackendMetric.visitors) : 148;
  const realPageViews = hasRealTracked ? Number(todayBackendMetric.pageViews) : 298;

  const todayEntry = {
    date: todayLabel,
    fullDate: todayFullDate,
    visits: realVisits,
    pageViews: realPageViews,
    source: hasRealTracked ? 'real' : 'demo',
    isToday: true,
  };

  return [...historicalReachDemoData, todayEntry];
};

export default buildWebsiteReachSeries;
