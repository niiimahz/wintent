const BASE = 'https://www.googleapis.com/webmasters/v3';

export async function listSites(token) {
  const res = await fetch(`${BASE}/sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('auth_expired');
  if (!res.ok) throw new Error('fetch_failed');
  const data = await res.json();
  return (data.siteEntry || []).filter(
    s => s.permissionLevel !== 'siteUnverifiedUser'
  );
}

export async function fetchGSCData(token, siteUrl, startDate, endDate) {
  const url = `${BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  async function query(dimensions, rowLimit = 25000) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    });
    if (res.status === 401) throw new Error('auth_expired');
    if (!res.ok) throw new Error('fetch_failed');
    const data = await res.json();
    return data.rows || [];
  }

  const [queryRows, pageRows, chartRows] = await Promise.all([
    query(['query']),
    query(['page']),
    query(['date'], 500),
  ]);

  return {
    queries: queryRows.map(r => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
    pages: pageRows.map(r => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
    chart: chartRows.map(r => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
    })),
    warnings: [],
  };
}

export function getDateRange(months) {
  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC has ~3 day delay
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}
