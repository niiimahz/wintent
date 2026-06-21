import { CreatorCTA } from '../components/CreatorCTA.jsx';
import { HeaderBar } from '../components/HeaderBar.jsx';

export default function PageHome({ user, setPage, providerToken, onConnectGSC, onOpenGSC }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <HeaderBar setPage={setPage} actionListCount={0} user={user} />

      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', gap: 40,
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 58, fontWeight: 700, color: '#2b2b2b', letterSpacing: '-2px', lineHeight: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6 }}>
            wintent
            <span style={{ fontSize: 13, fontWeight: 500, color: '#aaa', letterSpacing: 0, marginTop: 10 }}>Beta</span>
          </h1>
          <p style={{ marginTop: 14, color: '#666', fontSize: 15, fontWeight: 400 }}>
            دیتای سرچ کنسول بده، گزارشی بگیر که تا حالا ندیدی!
          </p>
        </div>

        {/* CTA box */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '40px 36px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          direction: 'rtl',
        }}>
          {!user ? (
            <>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, textAlign: 'center' }}>
                گزارشی هدفمند برای سئو هدفمندتر!
              </div>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.9, marginBottom: 6, textAlign: 'center' }}>
                برای شروع، با جیمیل لاگین کنید و سرچ کنسول خود را متصل کنید.
              </p>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.9, marginBottom: 24, textAlign: 'center' }}>
                وینتنت گزارشات را برای شما آماده می‌کند...
              </p>
              <button
                onClick={() => setPage(5)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: '#ECA72C', color: '#2b2b2b', fontWeight: 700, fontSize: 15,
                  border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
                }}
              >
                ورود
              </button>
            </>
          ) : providerToken ? (
            <>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: 28, textAlign: 'center' }}>
                سرچ کنسولت رو وصل کن، آنالیزش رو تحویل بگیر.
              </p>
              <button
                onClick={onOpenGSC}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: '#ECA72C', color: '#2b2b2b', fontWeight: 700, fontSize: 15,
                  border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
                  transition: 'background 0.15s, transform 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5b535'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ECA72C'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                اتصال سرچ کنسول و دریافت گزارش
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🔌</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
                اتصال به سرچ کنسول
              </div>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: 24, textAlign: 'center' }}>
                یک بار به وینتنت اجازه بده به سرچ کنسولت دسترسی داشته باشه. بعدش کافیه سایت و بازه زمانی انتخاب کنی.
              </p>
              <button
                onClick={onConnectGSC}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: '#2b2b2b', color: '#ECA72C', fontWeight: 700, fontSize: 15,
                  border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
                }}
              >
                اتصال به سرچ کنسول گوگل
              </button>
            </>
          )}
        </div>

        {/* Creator CTA */}
        <div style={{ width: '100%', maxWidth: 480, borderRadius: 14, overflow: 'hidden' }}>
          <CreatorCTA />
        </div>
      </div>
    </div>
  );
}
