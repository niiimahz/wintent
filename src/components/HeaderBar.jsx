import { useEffect, useRef, useState } from 'react';

export function HeaderBar({ setPage, actionListCount, user }) {
  const prevCount = useRef(actionListCount);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (actionListCount > prevCount.current) {
      setBounce(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setBounce(true)));
    }
    prevCount.current = actionListCount;
  }, [actionListCount]);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = (user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase();

  return (
    <>
      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.55); }
          60%  { transform: scale(0.88); }
          80%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .badge-pop { animation: badgePop 0.42s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      <div className="header-bar" style={{ justifyContent: 'space-between' }}>

        {/* RIGHT (first in RTL): brand + action list (only when logged in) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#ECA72C', letterSpacing: '-0.5px', userSelect: 'none' }}>
            wintent
          </span>

          {user && (
            <button
              onClick={() => setPage(4)}
              style={{
                background: 'none', color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                opacity: 0.9, fontFamily: 'Vazirmatn, sans-serif', padding: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
            >
              لیست اقدام
              {actionListCount > 0 && (
                <span
                  key={actionListCount}
                  className={bounce ? 'badge-pop' : ''}
                  style={{
                    background: '#ECA72C', color: '#2b2b2b', borderRadius: 20,
                    minWidth: 22, height: 22, padding: '0 6px', fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, lineHeight: 1,
                  }}
                >
                  {actionListCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* LEFT (second in RTL) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user ? (
            <>
              {/* تحلیل فایل جدید - only when logged in */}
              <button
                onClick={() => setPage(1)}
                style={{
                  background: 'none', color: '#fff', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  opacity: 0.8, fontFamily: 'Vazirmatn, sans-serif', padding: 0,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="white" strokeWidth="1.5"/>
                  <line x1="7.5" y1="4" x2="7.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="4" y1="7.5" x2="11" y2="7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                تحلیل فایل جدید
              </button>

              {/* Avatar → account page */}
              <button
                onClick={() => setPage(5)}
                title="حساب کاربری"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #ECA72C', objectFit: 'cover' }} />
                  : <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ECA72C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#2b2b2b' }}>{initials}</div>
                }
              </button>
            </>
          ) : (
            /* Not logged in: only show ورود button */
            <button
              onClick={() => setPage(5)}
              style={{
                background: '#ECA72C', border: 'none',
                color: '#2b2b2b', borderRadius: 7, padding: '7px 18px', fontSize: 13,
                cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', fontWeight: 700,
              }}
            >
              ورود با Gmail
            </button>
          )}
        </div>

      </div>
    </>
  );
}
