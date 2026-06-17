import { useState, useRef } from 'react';
import { parseZip } from '../utils/parseZip.js';
import { CreatorCTA } from '../components/CreatorCTA.jsx';

export default function PageHome({ onUpload }) {
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        gap: 48,
        background: '#f5f5f5',
      }}
    >
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#2b2b2b',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            wintent
          </h1>
          <span
            style={{
              fontSize: 16,
              color: '#888',
              fontWeight: 400,
              borderRight: '2.5px solid #e0e0e0',
              paddingRight: 16,
              lineHeight: 1.5,
            }}
          >
            شعار برند اینجا
          </span>
        </div>
        <p style={{ marginTop: 12, color: '#888', fontSize: 14 }}>
          داده‌های گوگل سرچ کنسول خود را آپلود کن و فرصت‌های پنهان را پیدا کن
        </p>
      </div>

      {/* Upload box */}
      <div style={{ width: '100%', maxWidth: 540 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 48 }}>📂</div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#2b2b2b' }}>
                ZIP سرچ کنسول را اینجا بکش یا کلیک کن
              </div>
              <div style={{ fontSize: 13, color: '#999' }}>
                فایل باید شامل Queries.csv و Pages.csv باشد
              </div>
              <button
                className="btn"
                style={{ marginTop: 8, background: '#ECA72C', color: '#2b2b2b', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 14 }}
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
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        border: '3px solid #e0e0e0',
        borderTop: '3px solid #ECA72C',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

// inject spin keyframe once
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
