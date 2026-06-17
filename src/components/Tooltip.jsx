import { useState } from 'react';

export function Tooltip({ text, children }) {
  const [pos, setPos] = useState(null);

  const handleMove = (e) => {
    const TW = 260; // tooltip width
    const x = Math.min(Math.max(e.clientX - TW / 2, 8), window.innerWidth - TW - 8);
    const y = e.clientY;
    setPos({ x, y });
  };

  return (
    <>
      <span
        onMouseEnter={handleMove}
        onMouseMove={handleMove}
        onMouseLeave={() => setPos(null)}
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      >
        {children}
      </span>
      {pos && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y - 12,
            transform: 'translateY(-100%)',
            background: '#2b2b2b',
            color: '#f5f5f5',
            padding: '9px 13px',
            borderRadius: 9,
            fontSize: 12,
            width: 260,
            zIndex: 99999,
            lineHeight: 1.75,
            pointerEvents: 'none',
            boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
            direction: 'rtl',
            textAlign: 'right',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          {text}
        </div>
      )}
    </>
  );
}

export function InfoIcon({ text }) {
  return (
    <Tooltip text={text}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: '#e0e0e0',
          color: '#666',
          fontSize: 9,
          fontWeight: 700,
          marginRight: 4,
          marginLeft: 2,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        !
      </span>
    </Tooltip>
  );
}
