import React from 'react';

export default function StatusBadge({ status }) {
  let config = {
    color: 'var(--text-secondary)',
    label: 'TIDAK DIKETAHUI',
    bgColor: 'transparent',
    borderColor: 'var(--hairline-strong)'
  };

  if (status === 'up') {
    config = {
      color: 'var(--status-success)',
      label: 'AKTIF',
      bgColor: 'rgba(118, 185, 0, 0.1)',
      borderColor: 'rgba(118, 185, 0, 0.3)'
    };
  } else if (status === 'down') {
    config = {
      color: 'var(--status-danger)',
      label: 'MATI',
      bgColor: 'rgba(229, 32, 32, 0.1)',
      borderColor: 'rgba(229, 32, 32, 0.3)'
    };
  } else if (status === 'degraded') {
    config = {
      color: 'var(--status-warning)',
      label: 'LAMBAT',
      bgColor: 'rgba(223, 101, 0, 0.1)',
      borderColor: 'rgba(223, 101, 0, 0.3)'
    };
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: 'var(--rounded-sm)',
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      color: config.color,
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.5px'
    }}>
      <span className={status === 'up' ? 'animate-pulseGlow' : ''} style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: config.color,
      }}></span>
      {config.label}
    </span>
  );
}
