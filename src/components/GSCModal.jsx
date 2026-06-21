import { useState, useEffect } from 'react';
import { listSites, fetchGSCData, getDateRange } from '../lib/gsc.js';
import { supabase } from '../lib/supabase.js';

const DATE_PRESETS = [
  { label: '۳ ماه', months: 3 },
  { label: '۶ ماه', months: 6 },
  { label: '۱۲ ماه', months: 12 },
  { label: '۱۶ ماه', months: 16 },
];

export function GSCModal({ providerToken, onData, onClose, onReconnect }) {
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');
  const [months, setMonths] = useState(6);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setLoadingSites(true);
    setAuthError(false);
    try {
      const list = await listSites(providerToken);
      setSites(list);
      if (list.length > 0) setSelectedSite(list[0].siteUrl);
    } catch (e) {
      console.log('loadSites error:', e.message);
      if (e.message === 'auth_expired' || e.message === 'no_scope' || e.message === 'no_token') setAuthError(true);
      else setFetchError('خطا: ' + e.message);
    } finally {
      setLoadingSites(false);
    }
  }

  async function handleFetch() {
    if (!selectedSite) return;
    setFetching(true);
    setFetchError('');
    try {
      const { startDate, endDate } = getDateRange(months);
      const data = await fetchGSCData(providerToken, selectedSite, startDate, endDate);
      onData(data);
    } catch (e) {
      if (e.message === 'auth_expired') {
        setAuthError(true);
      } else {
        setFetchError('خطا در دریافت دیتا. دوباره امتحان کن.');
      }
      setFetching(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '36px 32px',
        maxWidth: 460,
        width: '100%',
        direction: 'rtl',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 10 }}>🔌</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
          انتخاب سایت از سرچ کنسول
        </h2>

        {loadingSites ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa', fontSize: 13 }}>
            <Spinner />
            <div style={{ marginTop: 14 }}>در حال دریافت سایت‌ها…</div>
          </div>
        ) : authError ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 20, lineHeight: 1.8 }}>
              دسترسی به سرچ کنسول منقضی شده.<br />یک بار دیگه با Google وصل شو.
            </div>
            <button onClick={onReconnect} style={btnStyle('#2b2b2b', '#ECA72C')}>
              اتصال مجدد به Google
            </button>
          </div>
        ) : sites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#888', fontSize: 13, lineHeight: 1.8 }}>
            هیچ سایتی در سرچ کنسول این حساب پیدا نشد.<br />
            مطمئن شو با ایمیلی که دسترسی داره وارد شدی.
          </div>
        ) : (
          <>
            {/* Site selector */}
            <div style={{ marginTop: 20, marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>سایت</label>
              <select
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                style={{
                  width: '100%', padding: '11px 12px', borderRadius: 8,
                  border: '1.5px solid #e0e0e0', fontSize: 13,
                  fontFamily: 'Vazirmatn, sans-serif', direction: 'ltr',
                  textAlign: 'left', background: '#fff', outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {sites.map(s => (
                  <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>بازه زمانی</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DATE_PRESETS.map(p => (
                  <button
                    key={p.months}
                    onClick={() => setMonths(p.months)}
                    style={{
                      flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      fontFamily: 'Vazirmatn, sans-serif', cursor: 'pointer', transition: 'all 0.15s',
                      background: months === p.months ? '#ECA72C' : '#f5f5f5',
                      color: months === p.months ? '#2b2b2b' : '#666',
                      border: months === p.months ? '1.5px solid #ECA72C' : '1.5px solid #e8e8e8',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {fetchError && (
              <div style={{ marginBottom: 12, fontSize: 12, color: '#c0392b', background: '#ffe5e5', borderRadius: 7, padding: '8px 12px' }}>
                {fetchError}
              </div>
            )}

            <button
              onClick={handleFetch}
              disabled={fetching || !selectedSite}
              style={btnStyle(fetching ? '#e0e0e0' : '#ECA72C', fetching ? '#aaa' : '#2b2b2b')}
            >
              {fetching ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Spinner small /> در حال دریافت دیتا…
                </span>
              ) : 'دریافت گزارش'}
            </button>
          </>
        )}

        <button
          onClick={onClose}
          style={{ display: 'block', width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#e05555', fontSize: 13, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
        >
          انصراف
        </button>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    width: '100%', padding: '13px', borderRadius: 10,
    background: bg, color, fontWeight: 700, fontSize: 14,
    border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.15s',
  };
}

function Spinner({ small }) {
  const size = small ? 16 : 32;
  const border = small ? 2 : 3;
  return (
    <div style={{
      width: size, height: size,
      border: `${border}px solid #e0e0e0`,
      borderTop: `${border}px solid #ECA72C`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
      flexShrink: 0,
    }} />
  );
}
