const YT_URL = 'https://www.youtube.com/playlist?list=PLbh2nHy2IvgV-NxuieBnSrSiJrh1nJsmu';

function Avatar({ size }) {
  return (
    <img
      src="/avatar.jpg"
      alt="نیما حسن زاده"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #ECA72C' }}
      onError={e => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
}

export function CreatorCTA() {
  return (
    <div style={{ background: '#2b2b2b', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar size={50} />
        <div style={{
          display: 'none', width: 50, height: 50, borderRadius: '50%',
          background: '#ECA72C', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#2b2b2b', flexShrink: 0, border: '2px solid #ECA72C',
        }}>ن</div>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#ECA72C', marginBottom: 4 }}>
          نیما حسن زاده | متخصص CRO
        </div>
        <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.6 }}>
          این ابزار ۱۰۰٪ با Claude AI ساخته شده! برای آموزش ساخت این پروژه روی لینک کلیک کنید و ویدئو یوتوب را ببینید.
        </div>
      </div>

      {/* YouTube CTA */}
      <a
        href={YT_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: '#ECA72C', color: '#2b2b2b', borderRadius: 7,
          padding: '8px 18px', fontWeight: 700, fontSize: 13,
          textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block',
          transition: 'opacity 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        ▶ یوتوب من
      </a>
    </div>
  );
}
