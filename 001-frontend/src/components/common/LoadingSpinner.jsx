import React from 'react';

export default function LoadingSpinner({ size = 24, color = "var(--primary)" }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid var(--hairline)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
