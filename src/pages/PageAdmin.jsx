import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const ADMIN_EMAIL = 'niiimahz76@gmail.com';

export default function PageAdmin({ user, setPage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_admin_users');
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  async function saveExtra(id) {
    setSaving(true);
    await supabase.rpc('admin_set_extra_analyses', {
      target_id: id,
      new_value: parseInt(editValue) || 0,
    });
    setSaving(false);
    setEditingId(null);
    fetchUsers();
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>دسترسی ندارید.</div>
      </div>
    );
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.includes(search) ||
    u.first_name?.includes(search) ||
    u.last_name?.includes(search) ||
    u.phone?.includes(search)
  );

  const totalUsers = users.length;
  const totalAnalyses = users.reduce((s, u) => s + (u.total_analyses_created || 0), 0);
  const completeProfiles = users.filter(u => u.phone && u.first_name && u.job_position).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ background: '#2b2b2b', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#ECA72C', letterSpacing: '-0.5px' }}>wintent — پنل ادمین</div>
        <button
          onClick={() => setPage(1)}
          style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
        >
          ← بازگشت به اپ
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'کل کاربران', value: totalUsers },
            { label: 'پروفایل تکمیل‌شده', value: completeProfiles },
            { label: 'کل آنالیزها', value: totalAnalyses },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 24px', flex: 1, minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#ECA72C' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو با ایمیل، نام، یا شماره..."
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 8,
              border: '1.5px solid #e0e0e0', fontSize: 13,
              fontFamily: 'Vazirmatn, sans-serif', background: '#fff',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>در حال بارگذاری…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                    {['ایمیل', 'نام', 'شماره', 'پوزیشن', 'نحوه آشنایی', 'تاریخ عضویت', 'آنالیز ساخته', 'رفرال', 'آنالیز اضافه', 'ویرایش'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '11px 14px', direction: 'ltr', textAlign: 'left', color: '#2b2b2b', fontWeight: 500 }}>{u.email}</td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        {u.first_name || u.last_name
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                          : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td style={{ padding: '11px 14px', direction: 'ltr' }}>{u.phone || <span style={{ color: '#ccc' }}>—</span>}</td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{u.job_position || <span style={{ color: '#ccc' }}>—</span>}</td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{u.how_found || <span style={{ color: '#ccc' }}>—</span>}</td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: '#888' }}>
                        {new Date(u.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 600 }}>{u.total_analyses_created || 0}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        {u.referral_count > 0
                          ? <span style={{ color: '#27ae60', fontWeight: 600 }}>{u.referral_count}</span>
                          : <span style={{ color: '#ccc' }}>۰</span>}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        {editingId === u.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              style={{ width: 56, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #ECA72C', fontSize: 13, textAlign: 'center', outline: 'none' }}
                              autoFocus
                            />
                            <button
                              onClick={() => saveExtra(u.id)}
                              disabled={saving}
                              style={{ background: '#ECA72C', color: '#2b2b2b', border: 'none', borderRadius: 6, padding: '5px 10px', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}
                            >
                              {saving ? '…' : '✓'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{ background: 'none', border: 'none', color: '#e05555', fontSize: 16, cursor: 'pointer' }}
                            >×</button>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 600, color: u.extra_analyses > 0 ? '#27ae60' : '#ccc' }}>
                            {u.extra_analyses || 0}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        {editingId !== u.id && (
                          <button
                            onClick={() => { setEditingId(u.id); setEditValue(String(u.extra_analyses || 0)); }}
                            style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', color: '#555' }}
                          >
                            ویرایش
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>کاربری پیدا نشد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
