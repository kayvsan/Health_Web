import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 'var(--space-xl)'
    }}>
      <div className="panel" style={{ 
        width: '100%', maxWidth: '500px', 
        backgroundColor: 'var(--bg-app)',
        padding: 0,
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ 
          padding: 'var(--space-md) var(--space-xl)', 
          borderBottom: '1px solid var(--hairline)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 className="heading-md">{title}</h3>
          <button onClick={onClose} style={{ 
            background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 'var(--space-xl)', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
