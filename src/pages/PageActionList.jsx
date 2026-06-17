import { HeaderBar } from '../components/HeaderBar.jsx';
import { CreatorCTA } from '../components/CreatorCTA.jsx';

function fmtCTR(v) {
  return (v * 100).toFixed(2) + '%';
}

function fmtGap(row) {
  if (!row.hasData || row.ctrGap === null) return 'داده ناکافی';
  const sign = row.ctrGap >= 0 ? '+' : '';
  return `${sign}${(row.ctrGap * 100).toFixed(2)}%`;
}

function fmtOpp(row) {
  if (!row.hasData || row.opportunityScore === null) return 'داده ناکافی';
  return `+${row.opportunityScore}`;
}

function downloadCSV(rows) {
  const BOM = '﻿';
  const headers = [
    'نوع', 'کوئری / صفحه', 'Click', 'Impression', 'CTR', 'رتبه',
    'شکاف CTR', 'امتیاز فرصت', 'نیت', 'برند', 'فلگ',
  ];

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const dataRows = rows.map(row => [
    row._mode === 'queries' ? 'کوئری' : 'صفحه',
    row.label,
    row.clicks,
    row.impressions,
    fmtCTR(row.ctr),
    row.position.toFixed(1),
    fmtGap(row),
    fmtOpp(row),
    row.intent ?? '—',
    row.branded ? 'بله' : 'خیر',
    row.flagged ? 'بله' : '',
  ].map(escape).join(','));

  const csv = [headers.map(escape).join(','), ...dataRows].join('\n');
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wintent-action-list.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PageActionList({ setPage, actionList, toggleActionList }) {
  const rows = Array.from(actionList.values());

  return (
    <div className="page-scroll">
      <HeaderBar setPage={setPage} actionListCount={actionList.size} />
      <CreatorCTA />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 22 }}>لیست اقدام</h2>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>دانلود کن و به ترتیب اقدام کن</p>
          </div>
          {rows.length > 0 && (
            <button
              className="btn"
              onClick={() => downloadCSV(rows)}
              style={{ background: '#ECA72C', color: '#2b2b2b', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 14 }}
            >
              دانلود اکسل (CSV)
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#aaa',
              background: '#fff',
              borderRadius: 14,
              border: '2px dashed #e8e8e8',
              marginTop: 24,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>هنوز چیزی اضافه نکردی</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              در جدول جزئیات، روی + هر ردیف بزن تا اینجا اضافه شود
            </div>
            <button
              className="btn"
              onClick={() => setPage(3)}
              style={{ marginTop: 20, background: '#ECA72C', color: '#2b2b2b', borderRadius: 8, padding: '10px 22px', fontWeight: 600 }}
            >
              رفتن به جدول جزئیات
            </button>
          </div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>نوع</th>
                  <th>کوئری / صفحه</th>
                  <th>Click</th>
                  <th>Impression</th>
                  <th>CTR</th>
                  <th>رتبه</th>
                  <th>شکاف CTR</th>
                  <th>امتیاز فرصت</th>
                  <th>نیت</th>
                  <th>برند</th>
                  <th>فلگ</th>
                  <th>حذف</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const key = (row._mode === 'queries' ? 'q:' : 'p:') + row.label;
                  return (
                    <tr key={i}>
                      <td>
                        <span className={`badge ${row._mode === 'queries' ? 'badge-orange' : 'badge-green'}`}>
                          {row._mode === 'queries' ? 'کوئری' : 'صفحه'}
                        </span>
                      </td>
                      <td
                        style={{
                          maxWidth: 260,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          direction: row._mode === 'queries' ? 'rtl' : 'ltr',
                          textAlign: row._mode === 'queries' ? 'right' : 'left',
                          fontSize: 12,
                        }}
                        title={row.label}
                      >
                        {row.label}
                      </td>
                      <td>{row.clicks.toLocaleString('fa-IR')}</td>
                      <td>{row.impressions.toLocaleString('fa-IR')}</td>
                      <td>{fmtCTR(row.ctr)}</td>
                      <td>{row.position.toFixed(1)}</td>
                      <td>
                        <GapBadge row={row} />
                      </td>
                      <td>
                        <OppBadge row={row} />
                      </td>
                      <td>{row.intent ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {row._mode === 'queries'
                          ? (row.branded ? <span style={{ color: '#27ae60', fontWeight: 700 }}>✓</span> : <span style={{ color: '#ccc' }}>✗</span>)
                          : '—'}
                      </td>
                      <td>
                        {row.flagged && (
                          <span className="badge badge-red" style={{ fontSize: 10 }}>بررسی SERP</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => toggleActionList(key, row)}
                          title="حذف از لیست"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: '#ffe5e5',
                            color: '#c0392b',
                            fontSize: 14,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function GapBadge({ row }) {
  if (!row.hasData || row.ctrGap === null) return <span className="badge badge-gray">داده ناکافی</span>;
  const gap = row.ctrGap;
  const sign = gap >= 0 ? '+' : '';
  const pct = `${sign}${(gap * 100).toFixed(2)}٪`;
  if (Math.abs(gap) < 0.005) return <span className="badge badge-gray">{pct}</span>;
  if (gap < 0) return <span className="badge badge-red">{pct}</span>;
  return <span className="badge badge-green">{pct}</span>;
}

function OppBadge({ row }) {
  if (!row.hasData || row.opportunityScore === null) return <span className="badge badge-gray">داده ناکافی</span>;
  if (row.opportunityScore === 0) return <span className="badge badge-gray">۰</span>;
  return <span className="badge badge-orange">+{row.opportunityScore.toLocaleString()} Click</span>;
}
