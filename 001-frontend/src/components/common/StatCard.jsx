import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = "var(--primary)", borderColor = "var(--hairline)" }) {
  return (
    <div className="panel" style={{ borderColor }}>
      <div className="corner-square" style={{ backgroundColor: color === 'var(--status-danger)' ? color : 'var(--primary)' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="body-md" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
          <h2 className="display-lg" style={{ marginTop: 'var(--space-xs)', color: color === 'var(--primary)' ? 'var(--text-primary)' : color }}>
            {value}
          </h2>
        </div>
        {Icon && <Icon size={24} color={color} opacity={0.8} />}
      </div>
    </div>
  );
}
