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
          <button
            onClick={() => setPage(1)}
            style={{ fontWeight: 700, fontSize: 20, color: '#ECA72C', letterSpacing: '-0.5px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            wintent
          </button>

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
              {/* Admin link — only for admin */}
              {user?.email === 'niiimahz76@gmail.com' && (
                <button
                  onClick={() => setPage(6)}
                  style={{ background: 'none', border: 'none', color: '#ECA72C', fontSize: 12, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', opacity: 0.7 }}
                >
                  ادمین
                </button>
              )}

              {/* Avatar + حساب کاربری → account page */}
              <button
                onClick={() => setPage(5)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', gap: 7,
                  opacity: 0.9, transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              >
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'Vazirmatn, sans-serif' }}>
                  حساب کاربری
                </span>
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
              ورود
            </button>
          )}
        </div>

      </div>
    </>
  );
}
