import { useState } from 'react';

export function Tooltip({ text, children }) {
  const [pos, setPos] = useState(null);

  const handleMove = (e) => setPos({ x: e.clientX, y: e.clientY });

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
            left: Math.min(pos.x + 12, window.innerWidth - 300),
            top: pos.y - 8,
            transform: 'translateY(-100%)',
            background: '#2b2b2b',
            color: '#f5f5f5',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            maxWidth: 280,
            zIndex: 99999,
            lineHeight: 1.75,
            pointerEvents: 'none',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            direction: 'rtl',
            textAlign: 'right',
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
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#e0e0e0',
          color: '#666',
          fontSize: 10,
          fontWeight: 700,
          marginRight: 5,
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
