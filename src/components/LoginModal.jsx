import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function LoginModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, browser redirects to Google — no further action needed here
  };

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
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        direction: 'rtl',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Icon */}
        <div style={{ fontSize: 42, marginBottom: 12 }}>🔐</div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2b2b2b', marginBottom: 10 }}>
          برای دیدن نتایج لاگین کن
        </h2>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: 28 }}>
          تحلیل فایلت آماده‌ست. با Gmail وارد شو تا نتایج رو ببینی و ذخیره بشن.
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px 20px',
            borderRadius: 10,
            border: '1.5px solid #e0e0e0',
            background: loading ? '#f5f5f5' : '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 14, fontWeight: 600, color: '#2b2b2b',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            fontFamily: 'Vazirmatn, sans-serif',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#ECA72C'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <GoogleIcon />
          {loading ? 'در حال اتصال…' : 'ورود با Gmail'}
        </button>

        {error && (
          <div style={{ marginTop: 12, color: '#c0392b', fontSize: 12 }}>{error}</div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 18, background: 'none', border: 'none',
            color: '#aaa', fontSize: 12, cursor: 'pointer',
            fontFamily: 'Vazirmatn, sans-serif',
          }}
        >
          بعداً لاگین می‌کنم (نتایج ذخیره نمی‌شن)
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
