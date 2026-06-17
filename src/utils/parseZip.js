const parseNum = (s) => {
  if (s === undefined || s === null || s === '') return null;
  const n = parseFloat(String(s).replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
};

export async function parseZip(file) {
  const JSZip = window.JSZip;
  const Papa = window.Papa;

  const zip = await JSZip.loadAsync(file);
  const result = { queries: [], pages: [], chart: [], warnings: [] };

  // Build case-insensitive basename map
  const fileMap = {};
  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const basename = relativePath.split('/').pop().toLowerCase();
      fileMap[basename] = zipEntry;
    }
  });

  const parseCSV = async (key, label, mapper) => {
    const entry = fileMap[key];
    if (!entry) {
      result.warnings.push(`${label} یافت نشد`);
      return [];
    }
    const text = await entry.async('text');
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
    return data.map(mapper).filter(Boolean);
  };

  result.queries = await parseCSV('queries.csv', 'Queries.csv', (row) => {
    try {
      const label = (row['Top queries'] || '').trim();
      if (!label) return null;
      const clicks = parseNum(row['Clicks']);
      const impressions = parseNum(row['Impressions']);
      const ctrRaw = parseNum(String(row['CTR'] || '').replace('%', ''));
      const position = parseNum(row['Position']);
      if (clicks === null || impressions === null || ctrRaw === null || position === null) return null;
      return { label, clicks, impressions, ctr: ctrRaw / 100, position };
    } catch { return null; }
  });

  result.pages = await parseCSV('pages.csv', 'Pages.csv', (row) => {
    try {
      const label = (row['Top pages'] || '').trim();
      if (!label) return null;
      const clicks = parseNum(row['Clicks']);
      const impressions = parseNum(row['Impressions']);
      const ctrRaw = parseNum(String(row['CTR'] || '').replace('%', ''));
      const position = parseNum(row['Position']);
      if (clicks === null || impressions === null || ctrRaw === null || position === null) return null;
      return { label, clicks, impressions, ctr: ctrRaw / 100, position };
    } catch { return null; }
  });

  result.chart = await parseCSV('chart.csv', 'Chart.csv', (row) => {
    try {
      const date = (row['Date'] || '').trim();
      const clicks = parseNum(row['Clicks']);
      const impressions = parseNum(row['Impressions']);
      if (!date || clicks === null || impressions === null) return null;
      return { date, clicks, impressions };
    } catch { return null; }
  });

  return result;
}
