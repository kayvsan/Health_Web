import React from 'react';
import { Search } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Search, 
  title = "No Data Found", 
  description = "There is currently no data to display in this section." 
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-section) var(--space-xl)',
      textAlign: 'center', color: 'var(--text-secondary)',
      border: '1px dashed var(--hairline-strong)',
      borderRadius: 'var(--rounded-sm)',
      backgroundColor: 'rgba(255,255,255,0.01)'
    }}>
      <Icon size={48} color="var(--hairline-strong)" style={{ marginBottom: 'var(--space-md)' }} />
      <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>{title}</h3>
      <p className="body-md">{description}</p>
    </div>
  );
}
