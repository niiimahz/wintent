import { useState } from 'react';

export function NameAnalysisModal({ onSave, onSkip }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const placeholder = `مثلاً: سایت اصلی - ${new Date().toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' })}`;

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
        direction: 'rtl',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 38, textAlign: 'center', marginBottom: 12 }}>📂</div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: '#2b2b2b', marginBottom: 8, textAlign: 'center' }}>
          یه اسم برای این آنالیز بذار
        </h2>
        <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginBottom: 24, lineHeight: 1.8 }}>
          تو بخش حساب کاربری با همین اسم ذخیره میشه
        </p>

        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder={placeholder}
          maxLength={80}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 9,
            border: '1.5px solid #e0e0e0',
            fontSize: 14,
            fontFamily: 'Vazirmatn, sans-serif',
            direction: 'rtl',
            outline: 'none',
            marginBottom: 16,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#ECA72C'; }}
          onBlur={e => { e.target.style.borderColor = '#e0e0e0'; }}
        />

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 10,
            background: name.trim() ? '#ECA72C' : '#f0f0f0',
            color: name.trim() ? '#2b2b2b' : '#bbb',
            fontWeight: 700,
            fontSize: 14,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            border: 'none',
            fontFamily: 'Vazirmatn, sans-serif',
            transition: 'background 0.15s',
          }}
        >
          ذخیره و مشاهده نتایج
        </button>

        <button
          onClick={onSkip}
          style={{
            display: 'block', width: '100%', marginTop: 12,
            background: 'none', border: 'none',
            color: '#aaa', fontSize: 12, cursor: 'pointer',
            fontFamily: 'Vazirmatn, sans-serif',
            textAlign: 'center',
          }}
        >
          بدون ذخیره ادامه بده
        </button>
      </div>
    </div>
  );
}
