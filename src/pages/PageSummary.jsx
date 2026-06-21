import { useState } from 'react';
import { HeaderBar } from '../components/HeaderBar.jsx';
import { CreatorCTA } from '../components/CreatorCTA.jsx';
import { SettingsModal } from '../components/SettingsModal.jsx';
import { LineChart } from '../components/LineChart.jsx';
import { InfoIcon } from '../components/Tooltip.jsx';

const TOOLTIPS = {
  opportunity: 'اگر روی فرصت‌های زیر کار کنی، تقریباً این تعداد کلیک بیشتر می‌توانی بگیری.',
  weak: 'تعداد ردیف‌هایی که CTR آن‌ها از حد معمول سایت خودت کمتر است.',
  brand: 'چه درصدی از کلیک‌هایت از جستجوی نام برندت می‌آید. اگر خیلی بالا باشد یعنی بیشتر روی نامت تکیه داری تا سئوی واقعی.',
  bottleneck: 'مشکل اصلی‌ات رتبه‌گرفتن است یا کلیک‌خوردن؟',
};

export default function PageSummary({
  setPage,
  user,
  data,
  settings,
  setSettings,
  queriesWithMetrics,
  kpis,
  actionList,
  navigateTo3,
  isPending,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const fmt = (n) => n?.toLocaleString() ?? '—';

  const bottleneckColor = {
    'مشکل اصلی: رتبه‌گرفتن': '#e74c3c',
    'مشکل اصلی: کلیک‌خوردن': '#e67e22',
    'متعادل': '#27ae60',
  }[kpis?.bottleneck?.verdict] ?? '#666';

  const hasBrand = settings.brandTerms.some(t => t.trim());

  return (
    <div className="page-scroll">
      <HeaderBar setPage={setPage} actionListCount={actionList.size} user={user} />
      <CreatorCTA />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

        {/* Notice bar */}
        <div style={{
          background: '#f9f9f9',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          padding: '11px 18px',
          marginBottom: 24,
          fontSize: 13,
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
          textAlign: 'center',
          lineHeight: 1.7,
        }}>
          تحلیل براساس ۱۰۰۰ کوئری و صفحه است. برای تحلیل بهتر، موارد خواسته شده را وارد کنید:
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: 'none',
              color: '#ECA72C',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontFamily: 'Vazirmatn, sans-serif',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {hasBrand ? '✓ ویرایش دیتا' : 'تکمیل دیتا'}
          </button>
        </div>

        {/* Warnings */}
        {data?.warnings?.length > 0 && (
          <div style={{ background: '#fff9f0', border: '1px solid #ECA72C', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#8a5a00' }}>
            {data.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
          </div>
        )}

        {/* KPI cards — full width now, no settings side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <div className="kpi-grid" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <KPICard
              title="مجموع کلیک قابل بازیابی"
              value={kpis ? `+${fmt(kpis.totalOpportunity)}` : '—'}
              valueColor="#ECA72C"
              tooltip={TOOLTIPS.opportunity}
              onMore={() => navigateTo3('opportunityScore', 'desc')}
              loading={isPending}
            />
            <KPICard
              title="کوئری‌های ضعیف‌تر از انتظار"
              value={kpis ? fmt(kpis.weakCount) : '—'}
              tooltip={TOOLTIPS.weak}
              onMore={() => navigateTo3('ctrGap', 'asc')}
              loading={isPending}
            />
            <KPICard
              title="سهم برند"
              value={
                kpis?.brandShare != null
                  ? `${kpis.brandShare.toFixed(1)}٪`
                  : 'ابتدا نام برند را وارد کن'
              }
              valueColor={kpis?.brandShare != null ? '#2b2b2b' : '#aaa'}
              tooltip={TOOLTIPS.brand}
              onMore={() => navigateTo3('clicks', 'desc')}
              loading={isPending}
              onEmptyCTA={kpis?.brandShare == null ? () => setModalOpen(true) : null}
            />
            <KPICard
              title="تشخیص گلوگاه"
              value={kpis?.bottleneck?.verdict ?? '—'}
              valueColor={bottleneckColor}
              subline={kpis?.bottleneck?.line}
              tooltip={TOOLTIPS.bottleneck}
              onMore={() => navigateTo3('opportunityScore', 'desc')}
              loading={isPending}
            />
          </div>
        </div>

        {/* Line charts */}
        {data?.chart?.length > 0 && (
          <div className="chart-grid" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <LineChart data={data.chart} valueKey="clicks" title="کلیک در طول زمان" color="#ECA72C" />
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <LineChart data={data.chart} valueKey="impressions" title="Impression در طول زمان" color="#2b2b2b" />
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {modalOpen && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function KPICard({ title, value, valueColor, subline, tooltip, onMore, loading, onEmptyCTA }) {
  return (
    <div className="kpi-card fade-in" style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{title}</span>
        <InfoIcon text={tooltip} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: valueColor ?? '#2b2b2b', lineHeight: 1.2, wordBreak: 'break-word' }}>
        {value}
      </div>
      {subline && <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{subline}</div>}
      <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={onMore}
          disabled={loading}
          style={{
            background: loading ? '#e8e8e8' : '#f5f5f5',
            border: '1.5px solid #e8e8e8',
            borderRadius: 7,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 600,
            color: loading ? '#aaa' : '#2b2b2b',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'Vazirmatn, sans-serif',
          }}
        >
          {loading ? 'در حال بارگذاری…' : 'مشاهده بیشتر ←'}
        </button>
        {onEmptyCTA && (
          <button
            onClick={onEmptyCTA}
            style={{
              background: '#fff9f0',
              border: '1.5px solid #ECA72C',
              borderRadius: 7,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#ECA72C',
              cursor: 'pointer',
              fontFamily: 'Vazirmatn, sans-serif',
            }}
          >
            + وارد کن
          </button>
        )}
      </div>
    </div>
  );
}
