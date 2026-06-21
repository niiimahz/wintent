import { useState, useRef } from 'react';
import { parseZip } from '../utils/parseZip.js';
import { CreatorCTA } from '../components/CreatorCTA.jsx';
import { HeaderBar } from '../components/HeaderBar.jsx';

export default function PageHome({ onUpload, user, setPage }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      setError('لطفاً یک فایل ZIP از Google Search Console آپلود کنید.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await parseZip(file);
      onUpload(result);
    } catch (e) {
      setError('خطا در پردازش فایل: ' + (e.message || 'فایل معتبر نیست'));
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

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
          <h1 style={{ fontSize: 58, fontWeight: 700, color: '#2b2b2b', letterSpacing: '-2px', lineHeight: 1 }}>
            wintent
          </h1>
          <p style={{ marginTop: 14, color: '#666', fontSize: 15, fontWeight: 400 }}>
            دیتای سرچ کنسول بده، گزارشی بگیر که تا حالا ندیدی!
          </p>
        </div>

        {/* Upload box */}
        <div style={{ width: '100%', maxWidth: 560 }}>
          <div
            className={`upload-zone${dragOver ? ' drag-over' : ''}`}
            onClick={() => !loading && inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Spinner />
                <span style={{ color: '#888', fontSize: 14 }}>در حال پردازش فایل…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 44 }}>📂</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#2b2b2b', textAlign: 'center', lineHeight: 1.6 }}>
                  فایل zip گزارشات سرچ کنسول را اینجا بنداز یا برای انتخاب فایل کلیک کن
                </div>
                <div style={{ fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 1.8, maxWidth: 400 }}>
                  وارد بخش Performance سرچ کنسول خود شوید. از بالا سمت راست روی گزینه Export کلیک کرده و دیتا را در قالب .csv خروجی بگیرید. فایل zip را اینجا آپلود کنید.
                </div>
                <button
                  className="btn"
                  style={{ marginTop: 6, background: '#ECA72C', color: '#2b2b2b', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 14 }}
                  onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
                >
                  انتخاب فایل
                </button>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {error && (
            <div style={{ marginTop: 12, background: '#ffe5e5', color: '#c0392b', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Creator CTA */}
        <div style={{ width: '100%', maxWidth: 640, borderRadius: 14, overflow: 'hidden' }}>
          <CreatorCTA />
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36,
      border: '3px solid #e0e0e0',
      borderTop: '3px solid #ECA72C',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
