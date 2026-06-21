const BASE = 'https://www.googleapis.com/webmasters/v3';

export async function listSites(token) {
  if (!token) throw new Error('no_token');
  const res = await fetch(`${BASE}/sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  console.log('GSC listSites status:', res.status, data);
  if (res.status === 401) throw new Error('auth_expired');
  if (res.status === 403) throw new Error('no_scope');
  if (!res.ok) throw new Error('fetch_failed: ' + res.status);
  return data.siteEntry || [];
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
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    })),
    pages: pageRows.map(r => ({
      page: r.keys[0],
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    })),
    chart: chartRows.map(r => ({
      date: r.keys[0],
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
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
