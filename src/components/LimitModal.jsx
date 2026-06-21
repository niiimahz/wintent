export function LimitModal({ isProfileComplete, onClose, onGoAccount }) {
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
        maxWidth: 400,
        width: '100%',
        direction: 'rtl',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>😬</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2b2b2b', marginBottom: 12 }}>
          آخ! سقف آنالیز حسابت پر شده...
        </h2>

        {!isProfileComplete ? (
          <>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.9, marginBottom: 28 }}>
              سقف یه آنالیزیت پر شده. برو تو حساب کاربری اطلاعاتت رو تکمیل کن تا <b>۲ تا آنالیز اضافه</b> بگیری.
            </p>
            <button onClick={onGoAccount} style={btnStyle}>
              تکمیل اطلاعات
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.9, marginBottom: 28 }}>
              به سقف ۳ آنالیز رسیدی. از اینجا به بعد به ازای هر نفری که با <b>لینک اختصاصیت</b> ثبت‌نام کنه، یه آنالیز اضافه بهت تعلق میگیره.
            </p>
            <button onClick={onGoAccount} style={btnStyle}>
              دعوت دوستان
            </button>
          </>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#e05555',
            fontSize: 13, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
            marginTop: 10,
          }}
        >
          بستن
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '100%', padding: '13px', borderRadius: 10,
  background: '#ECA72C', color: '#2b2b2b', fontWeight: 700, fontSize: 14,
  border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
};
