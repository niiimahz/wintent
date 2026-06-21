import { useState, useEffect } from 'react';

const STEPS = ['brand', 'intent'];

export function SettingsModal({ settings, onSave, onClose }) {
  const [step, setStep] = useState(0); // 0 = brand, 1 = intent

  const [brandInput, setBrandInput] = useState(settings.brandTerms.join('\n'));
  const [transInput, setTransInput] = useState(settings.transactionalWords.join('\n'));
  const [infoInput, setInfoInput] = useState(settings.informationalWords.join('\n'));

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    onSave({
      brandTerms: brandInput.split('\n').map(t => t.trim()).filter(Boolean),
      transactionalWords: transInput.split('\n').map(t => t.trim()).filter(Boolean),
      informationalWords: infoInput.split('\n').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          width: '90%', maxWidth: 480,
          zIndex: 1001,
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          overflow: 'hidden',
          direction: 'rtl',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: '#2b2b2b', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#ECA72C', fontWeight: 700, fontSize: 16 }}>تکمیل دیتا</div>
            <div style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>
              {step === 0 ? 'مرحله ۱ از ۲ — نام برند' : 'مرحله ۲ از ۲ — کلمات نیت'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#ECA72C', transition: 'opacity 0.2s' }} />
          <div style={{ flex: 1, background: step >= 1 ? '#ECA72C' : '#e8e8e8', transition: 'background 0.3s' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px' }}>

          {/* Step 0: Brand */}
          {step === 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>هسته نام برند چیست؟</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 18, lineHeight: 1.7 }}>
                کلماتی که برند تو رو مشخص می‌کنن رو وارد کن (فارسی و انگلیسی، هر خط یکی).
                با این کلمات سهم برندت محاسبه می‌شه.
              </div>
              <textarea
                autoFocus
                rows={5}
                placeholder={'دیجیکالا\ndigikala\nDigi'}
                value={brandInput}
                onChange={e => setBrandInput(e.target.value)}
                style={{
                  width: '100%',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 14,
                  resize: 'vertical',
                  background: '#fafafa',
                  color: '#2b2b2b',
                  lineHeight: 2,
                  outline: 'none',
                  fontFamily: 'Vazirmatn, sans-serif',
                  direction: 'rtl',
                }}
                onFocus={e => e.target.style.borderColor = '#ECA72C'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              {brandInput.trim() === '' && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#ECA72C' }}>
                  اگر برند وارد نکنی، کارت «سهم برند» نمایش داده نمی‌شه
                </div>
              )}
            </div>
          )}

          {/* Step 1: Intent words */}
          {step === 1 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>کلمات تشخیص نیت</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 18, lineHeight: 1.7 }}>
                کوئری‌ها با این کلمات دسته‌بندی می‌شن. هر خط یک کلمه.
              </div>

              <label style={{ fontSize: 12, fontWeight: 700, color: '#2b2b2b', display: 'block', marginBottom: 8 }}>
                🛒 کلمات نیت خرید
              </label>
              <textarea
                autoFocus
                rows={4}
                value={transInput}
                onChange={e => setTransInput(e.target.value)}
                style={taStyle}
                onFocus={e => e.target.style.borderColor = '#ECA72C'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />

              <label style={{ fontSize: 12, fontWeight: 700, color: '#2b2b2b', display: 'block', margin: '16px 0 8px' }}>
                📚 کلمات نیت اطلاعاتی
              </label>
              <textarea
                rows={4}
                value={infoInput}
                onChange={e => setInfoInput(e.target.value)}
                style={taStyle}
                onFocus={e => e.target.style.borderColor = '#ECA72C'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafafa',
        }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ background: 'none', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
            >
              ← مرحله قبل
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#e05555', fontSize: 13, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
            >
              انصراف
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              style={{
                background: '#ECA72C', color: '#2b2b2b',
                borderRadius: 8, padding: '10px 26px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'Vazirmatn, sans-serif',
              }}
            >
              مرحله بعد ←
            </button>
          ) : (
            <button
              onClick={handleSave}
              style={{
                background: '#2b2b2b', color: '#ECA72C',
                borderRadius: 8, padding: '10px 26px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'Vazirmatn, sans-serif',
              }}
            >
              ذخیره و اعمال ✓
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const taStyle = {
  width: '100%',
  border: '1.5px solid #e0e0e0',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  resize: 'vertical',
  background: '#fafafa',
  color: '#2b2b2b',
  lineHeight: 2,
  outline: 'none',
  fontFamily: 'Vazirmatn, sans-serif',
  direction: 'rtl',
  display: 'block',
};
