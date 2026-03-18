import { useEffect, useState } from 'react';

const Toast = ({ message, type = 'error', onClose }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
      setTimeout(onClose, 300);
    }, 3200);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    error:   { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', icon: '✕' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', icon: '⚠' },
    success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', icon: '✓' },
  };

  const c = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: '300px',
        maxWidth: '400px',
        animation: closing
          ? 'slideOut 0.3s ease forwards'
          : 'slideIn 0.3s ease'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(120%); opacity: 0; }
        }
      `}</style>

      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: c.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: c.text,
        flexShrink: 0
      }}>
        {c.icon}
      </div>

      <span style={{
        fontSize: '14px',
        color: c.text,
        fontWeight: '500',
        flex: 1
      }}>
        {message}
      </span>

      <button
        onClick={() => setClosing(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.text,
          fontSize: '16px',
          padding: '2px',
          opacity: 0.6
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;