import { useState, useRef } from 'react';

export function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const TW = 260;
    // Position tooltip above the icon, horizontally aligned to it
    let left = rect.left + rect.width / 2 - TW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - TW - 8));
    setPos({ left, top: rect.top - 8 });
    setVisible(true);
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      >
        {children}
      </span>
      {visible && pos && (
        <div
          style={{
            position: 'fixed',
            left: pos.left,
            top: pos.top,
            transform: 'translateY(-100%)',
            background: '#2b2b2b',
            color: '#f5f5f5',
            padding: '9px 13px',
            borderRadius: 9,
            fontSize: 12,
            width: TW,
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

const TW = 260;

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
