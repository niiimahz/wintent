import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { HeaderBar } from '../components/HeaderBar.jsx';

const JOB_POSITIONS = [
  'متخصص سئو',
  'متخصص دیجیتال مارکتینگ',
  'تولیدکننده محتوا',
  'توسعه‌دهنده وب',
  'صاحب کسب‌وکار',
  'فریلنسر',
  'سایر',
];

const HOW_FOUND = [
  'یوتوب',
  'اینستاگرام',
  'تلگرام',
  'توییتر / X',
  'معرفی دوست',
  'جستجوی گوگل',
  'سایر',
];

// Convert Persian/Arabic digits to English
function toEnDigits(str) {
  return str
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

export default function PageAccount({ setPage, user, actionList, onLoadAnalysis, onSignOut }) {
  const [profile, setProfile] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [howFound, setHowFound] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([fetchProfile(), fetchAnalyses()]).finally(() => setLoading(false));
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setPhone(data.phone || '');
      setJobPosition(data.job_position || '');
      setHowFound(data.how_found || '');
    }
  }

  async function fetchAnalyses() {
    const { data, error } = await supabase
      .from('analyses')
      .select('id, name, file_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { console.error('fetchAnalyses error:', error); return; }
    setAnalyses(data || []);
  }

  async function saveProfile() {
    if (!phone.trim() || !firstName.trim() || !lastName.trim() || !jobPosition || !howFound) {
      setProfileMsg('همه فیلدها الزامی هستند');
      return;
    }
    setProfileSaving(true);
    setProfileMsg('');
    const { error } = await supabase.from('profiles').update({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: toEnDigits(phone.trim()),
      job_position: jobPosition,
      how_found: howFound,
      phone_verified: true,
    }).eq('id', user.id);
    setProfileSaving(false);
    if (error) {
      setProfileMsg('خطا در ذخیره: ' + error.message);
    } else {
      setProfileMsg('✓ پروفایل ذخیره شد');
      fetchProfile();
    }
  }

  async function loadAnalysis(id) {
    const { data, error } = await supabase.from('analyses').select('*').eq('id', id).single();
    if (error || !data) return;
    onLoadAnalysis({
      rawData: { queries: data.queries_data || [], pages: data.pages_data || [], chart: data.chart_data || [] },
      settings: data.settings || null,
      analysisId: id,
      analysisName: data.name,
    });
  }

  async function deleteAnalysis(id) {
    await supabase.from('analyses').delete().eq('id', id);
    setAnalyses(prev => prev.filter(a => a.id !== id));
  }

  // Not logged in
  if (!loading && !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <HeaderBar setPage={setPage} actionListCount={actionList?.size || 0} user={null} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center', direction: 'rtl', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>ورود به حساب کاربری</h2>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: 28 }}>برای مشاهده آنالیزها و ذخیره نتایج، با Gmail وارد شو.</p>
            <LoginButton />
            <button onClick={() => setPage(1)} style={{ display: 'block', width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>برگشت به صفحه اصلی</button>
          </div>
        </div>
      </div>
    );
  }

  const isProfileComplete = profile?.phone_verified && profile?.phone && profile?.first_name && profile?.job_position && profile?.how_found;
  const totalCreated = profile?.total_analyses_created ?? analyses.length;
  const extraAnalyses = profile?.extra_analyses ?? 0;
  const baseLimit = isProfileComplete ? 3 : 1;
  const maxAnalyses = baseLimit + extraAnalyses;
  const canCreateMore = totalCreated < maxAnalyses;

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email;

  const referralLink = profile?.referral_code
    ? `${window.location.origin}?ref=${profile.referral_code}`
    : null;

  return (
    <div className="page-scroll" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <HeaderBar setPage={setPage} actionListCount={actionList.size} user={user} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px', direction: 'rtl' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: 54, height: 54, borderRadius: '50%', border: '2px solid #ECA72C' }} />
              : <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#ECA72C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#2b2b2b' }}>{displayName?.[0]?.toUpperCase() || 'U'}</div>
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#2b2b2b' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{user?.email}</div>
            </div>
          </div>

          {/* Profile form */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              تکمیل پروفایل
              {isProfileComplete && <span style={{ background: '#e8f8ee', color: '#27ae60', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>تکمیل شده ✓</span>}
            </div>

            {!isProfileComplete && (
              <div style={{ fontSize: 12, color: '#e67e22', background: '#fff8ee', borderRadius: 8, padding: '8px 12px', marginBottom: 14, lineHeight: 1.7 }}>
                با تکمیل پروفایل، سقف تعداد آنالیزهات از <b>۱</b> به <b>۳</b> میرسه
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="نام" style={inputStyle} onFocus={e => e.target.style.borderColor = '#ECA72C'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="نام خانوادگی" style={inputStyle} onFocus={e => e.target.style.borderColor = '#ECA72C'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
            </div>

            <input
              value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="شماره موبایل (09xxxxxxxxx)"
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'left', marginBottom: 10, width: '100%' }}
              onFocus={e => e.target.style.borderColor = '#ECA72C'} onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <select value={jobPosition} onChange={e => setJobPosition(e.target.value)} style={inputStyle}>
                <option value="">پوزیشن شغلی</option>
                {JOB_POSITIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              <select value={howFound} onChange={e => setHowFound(e.target.value)} style={inputStyle}>
                <option value="">نحوه آشنایی</option>
                {HOW_FOUND.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <button
              onClick={saveProfile}
              disabled={profileSaving}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#ECA72C', color: '#2b2b2b', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
            >
              {profileSaving ? 'در حال ذخیره…' : 'ذخیره پروفایل'}
            </button>
            {profileMsg && <span style={{ marginRight: 12, fontSize: 12, color: profileMsg.startsWith('✓') ? '#27ae60' : '#c0392b' }}>{profileMsg}</span>}
          </div>
        </div>

        {/* Analyses */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>آنالیزهای من</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>{analyses.length} نمایش فعلی</span>
              <span style={{ fontSize: 12, color: canCreateMore ? '#27ae60' : '#c0392b', background: canCreateMore ? '#e8f8ee' : '#ffe5e5', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>
                {totalCreated} از {maxAnalyses} ساخته شده
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '24px 0', fontSize: 13 }}>در حال مشاهده گزارش…</div>
          ) : analyses.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 13 }}>هنوز آنالیزی نداری</div>
              <button onClick={() => setPage(1)} style={{ marginTop: 14, background: '#ECA72C', color: '#2b2b2b', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>
                آنالیز جدید
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analyses.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #f0f0f0', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#ECA72C'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#f0f0f0'}
                >
                  <span style={{ fontSize: 22 }}>📊</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2b2b2b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                      {new Date(a.created_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <button onClick={() => loadAnalysis(a.id)} style={{ background: '#ECA72C', color: '#2b2b2b', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', whiteSpace: 'nowrap' }}>
                    مشاهده گزارش
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral */}
        {isProfileComplete && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>🎁 رفع محدودیت آنالیز</div>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, marginBottom: 16 }}>
              به ازای هر نفری که از لینک اختصاصی تو ثبت‌نام کنه، یه آنالیز اضافه بهت تعلق میگیره.
            </p>
            {referralLink ? (
              <>
                <div style={{ background: '#f8f8f8', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 12, direction: 'ltr', textAlign: 'left', wordBreak: 'break-all', marginBottom: 10 }}>
                  {referralLink}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(referralLink); alert('لینک کپی شد!'); }}
                  style={{ background: '#2b2b2b', color: '#ECA72C', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
                >
                  📋 کپی لینک رفرال
                </button>
                <div style={{ marginTop: 12, fontSize: 13, color: extraAnalyses > 0 ? '#27ae60' : '#aaa', fontWeight: extraAnalyses > 0 ? 600 : 400 }}>
                  {extraAnalyses > 0
                    ? `🎉 ${extraAnalyses} نفر از لینکت ثبت‌نام کردن — ${extraAnalyses} آنالیز اضافه گرفتی`
                    : 'هنوز کسی از لینکت ثبت‌نام نکرده'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: '#aaa' }}>در حال ساخت لینک…</div>
            )}
          </div>
        )}

        {/* Sign out */}
        <div style={{ textAlign: 'center', marginTop: 8, paddingBottom: 32 }}>
          <button
            onClick={onSignOut}
            style={{ background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 28px', fontSize: 13, color: '#c0392b', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', fontWeight: 600, transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c0392b'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          >
            🚪 خروج از حساب
          </button>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid #e0e0e0', fontSize: 13,
  fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl',
  background: '#fff', color: '#2b2b2b', outline: 'none',
  boxSizing: 'border-box',
};

function LoginButton() {
  const [loading, setLoading] = useState(false);
  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  };
  return (
    <button onClick={handleGoogle} disabled={loading}
      style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#2b2b2b', fontFamily: 'Vazirmatn, sans-serif' }}>
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
      </svg>
      {loading ? 'در حال اتصال…' : 'ورود با Gmail'}
    </button>
  );
}
