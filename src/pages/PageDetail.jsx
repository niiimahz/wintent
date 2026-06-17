import { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { HeaderBar } from '../components/HeaderBar.jsx';
import { CreatorCTA } from '../components/CreatorCTA.jsx';
import { InfoIcon } from '../components/Tooltip.jsx';

const COL_TOOLTIPS = {
  ctrGap: 'این عدد CTR این ردیف را با CTR معمول سایت خودت در همان رتبه مقایسه می‌کند. منفی یعنی عنوان/توضیحات ضعیف‌تر از حد معمول عمل می‌کند؛ مثبت یعنی بهتر.',
  opportunityScore: 'اگر این ردیف فقط یک رتبه بالاتر برود، تقریباً این تعداد کلیک بیشتر می‌گیری (تخمینی، بر اساس رفتار معمول سایت خودت). فرض: impression ثابت می‌ماند.',
  intent: 'نیت کاربر بر اساس کلمات کلیدی موجود در کوئری — تقریبی است.',
  flagged: 'رتبه‌ات خوب است ولی کلیک تقریباً صفر — احتمالاً یک قابلیت گوگل (مثل پاسخ مستقیم یا AI Overview) کلیک را می‌خورد. SERP را دستی بررسی کن.',
};

const PAGE_SIZE = 150;

// Fast number formatter — avoids slow toLocaleString('fa-IR') on every cell
function n(num) {
  return num?.toLocaleString() ?? '—';
}

function fmtCTR(v) {
  return (v * 100).toFixed(2) + '%';
}

function gapInfo(row) {
  if (!row.hasData || row.ctrGap === null) return ['داده ناکافی', 'badge-gray'];
  const pct = (row.ctrGap * 100).toFixed(2);
  const sign = row.ctrGap >= 0 ? '+' : '';
  if (Math.abs(row.ctrGap) < 0.005) return [`${sign}${pct}٪`, 'badge-gray'];
  if (row.ctrGap < 0) return [`${sign}${pct}٪`, 'badge-red'];
  return [`${sign}${pct}٪`, 'badge-green'];
}

function oppInfo(row) {
  if (!row.hasData || row.opportunityScore === null) return ['داده ناکافی', 'badge-gray'];
  if (row.opportunityScore === 0) return ['۰', 'badge-gray'];
  return [`+${n(row.opportunityScore)}`, 'badge-orange'];
}

const INTENT_CLS = { 'خرید': 'badge-orange', 'اطلاعاتی': 'badge-green', 'نامشخص': 'badge-gray' };

function sortRows(rows, key, dir) {
  return [...rows].sort((a, b) => {
    let av = a[key], bv = b[key];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    if (typeof av === 'boolean') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
    if (typeof av === 'string') return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === 'asc' ? av - bv : bv - av;
  });
}

// Memoized row — only re-renders when its data or action-list status changes
const TableRow = memo(function TableRow({ row, isQuery, inList, onToggle }) {
  const [gapText, gapCls] = gapInfo(row);
  const [oppText, oppCls] = oppInfo(row);

  return (
    <tr>
      <td
        style={{
          maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          direction: isQuery ? 'rtl' : 'ltr', textAlign: isQuery ? 'right' : 'left',
          fontSize: 12,
        }}
        title={row.label}
      >
        {row.label}
      </td>
      <td>{n(row.clicks)}</td>
      <td>{n(row.impressions)}</td>
      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtCTR(row.ctr)}</td>
      <td>{row.position.toFixed(1)}</td>
      <td><span className={`badge ${gapCls}`}>{gapText}</span></td>
      <td><span className={`badge ${oppCls}`}>{oppText}</span></td>
      {isQuery && (
        <td>
          <span className={`badge ${INTENT_CLS[row.intent] ?? 'badge-gray'}`} style={{ fontSize: 11 }}>
            {row.intent}
          </span>
        </td>
      )}
      {isQuery && (
        <td style={{ textAlign: 'center' }}>
          {row.branded
            ? <span style={{ color: '#27ae60', fontWeight: 700 }}>✓</span>
            : <span style={{ color: '#ddd' }}>✗</span>}
        </td>
      )}
      <td>
        {row.flagged && (
          <span className="badge badge-red" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>بررسی SERP</span>
        )}
      </td>
      <td style={{ textAlign: 'center' }}>
        <button
          onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: inList ? '#ECA72C' : '#f0f0f0',
            color: inList ? '#2b2b2b' : '#aaa',
            fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none',
          }}
        >
          {inList ? '✓' : '+'}
        </button>
      </td>
    </tr>
  );
});

export default function PageDetail({
  setPage,
  queriesWithMetrics,
  pagesWithMetrics,
  actionList,
  toggleActionList,
  tableMode,
  setTableMode,
  initialSort,
  setInitialSort,
}) {
  const [sortKey, setSortKey] = useState('opportunityScore');
  const [sortDir, setSortDir] = useState('desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (initialSort) {
      setSortKey(initialSort.key);
      setSortDir(initialSort.dir);
      setInitialSort(null);
    }
  }, [initialSort, setInitialSort]);

  // Reset visible count when sort or mode changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [sortKey, sortDir, tableMode]);

  const rows = tableMode === 'queries' ? queriesWithMetrics : pagesWithMetrics;
  const isQuery = tableMode === 'queries';

  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir]);
  const visible = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);

  const handleSort = useCallback((key) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }, [sortKey]);

  const TH = ({ col, label, tooltip }) => (
    <th onClick={() => handleSort(col)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <span style={{ opacity: col === sortKey ? 1 : 0.3, marginRight: 2, fontSize: 11 }}>
          {col === sortKey ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
        {label}
        {tooltip && <InfoIcon text={tooltip} />}
      </span>
    </th>
  );

  return (
    <div className="page-scroll">
      <HeaderBar setPage={setPage} actionListCount={actionList.size} />
      <CreatorCTA />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            جدول جزئیات
            <span style={{ fontSize: 12, fontWeight: 400, color: '#aaa', marginRight: 10 }}>
              {n(sorted.length)} ردیف
            </span>
          </div>
          <div className="toggle-group">
            <button
              className={`toggle-btn${isQuery ? ' active' : ''}`}
              onClick={() => { setTableMode('queries'); setSortKey('opportunityScore'); setSortDir('desc'); }}
            >
              کوئری
            </button>
            <button
              className={`toggle-btn${!isQuery ? ' active' : ''}`}
              onClick={() => { setTableMode('pages'); setSortKey('opportunityScore'); setSortDir('desc'); }}
            >
              صفحه
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <TH col="label" label={isQuery ? 'کوئری' : 'صفحه'} />
                <TH col="clicks" label="کلیک" />
                <TH col="impressions" label="Impression" />
                <TH col="ctr" label="CTR" />
                <TH col="position" label="رتبه" />
                <TH col="ctrGap" label="شکاف CTR" tooltip={COL_TOOLTIPS.ctrGap} />
                <TH col="opportunityScore" label="امتیاز فرصت" tooltip={COL_TOOLTIPS.opportunityScore} />
                {isQuery && <TH col="intent" label="نیت" tooltip={COL_TOOLTIPS.intent} />}
                {isQuery && <TH col="branded" label="برند؟" />}
                <TH col="flagged" label="فلگ" tooltip={COL_TOOLTIPS.flagged} />
                <th style={{ cursor: 'default' }}>افزودن</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => {
                const key = (isQuery ? 'q:' : 'p:') + row.label;
                return (
                  <TableRow
                    key={key}
                    row={row}
                    isQuery={isQuery}
                    inList={actionList.has(key)}
                    onToggle={() => toggleActionList(key, { ...row, _mode: isQuery ? 'queries' : 'pages' })}
                  />
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={20} style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
                    داده‌ای برای نمایش وجود ندارد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {visibleCount < sorted.length && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              className="btn"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              style={{ background: '#2b2b2b', color: '#ECA72C', borderRadius: 8, padding: '10px 28px', fontSize: 14, fontWeight: 600 }}
            >
              نمایش {Math.min(PAGE_SIZE, sorted.length - visibleCount)} ردیف بعدی
              <span style={{ opacity: 0.6, fontSize: 12, marginRight: 8 }}>
                ({n(visibleCount)} از {n(sorted.length)})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
