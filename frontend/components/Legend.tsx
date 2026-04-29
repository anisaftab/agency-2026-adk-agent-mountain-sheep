'use client';

import React from 'react';

interface LegendProps {
  isDark: boolean;
}

const NODE_TYPES = [
  { color: '#ff3535', label: 'HIGH RISK' },
  { color: '#ffaa00', label: 'MEDIUM RISK' },
  { color: '#888888', label: 'LOW RISK' },
  { color: '#ffffff', label: 'DIRECTOR' },
];

export default function Legend({ isDark }: LegendProps) {
  const bg     = isDark ? 'rgba(8,9,14,0.75)' : 'rgba(245,245,247,0.75)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const muted  = isDark ? '#44445a' : '#8888a0';

  return (
    <div style={{
      position: 'fixed', right: '20px', top: '72px', zIndex: 15,
      display: 'flex', flexDirection: 'column', gap: '7px',
      padding: '12px 14px',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      backdropFilter: 'blur(12px)',
      fontSize: '10px',
      letterSpacing: '0.05em',
      color: muted,
    }}>
      {NODE_TYPES.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: color,
            boxShadow: `0 0 5px ${color}`,
            flexShrink: 0,
          }} />
          <span>{label}</span>
        </div>
      ))}
      <div style={{
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
        paddingTop: '7px',
        marginTop: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '16px', height: '1.5px',
          background: '#7c6dfa', opacity: 0.7, flexShrink: 0,
        }} />
        <span>DIRECTOR LINK</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '16px', height: '1.5px', background: '#ff3535', flexShrink: 0 }} />
        <span>FUNDING LOOP</span>
      </div>
    </div>
  );
}
