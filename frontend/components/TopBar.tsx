'use client';

import React from 'react';

interface TopBarProps {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  tweaksOpen: boolean;
  setTweaksOpen: (v: boolean) => void;
}

export default function TopBar({ isDark, setIsDark, tweaksOpen, setTweaksOpen }: TopBarProps) {
  const bg     = isDark ? 'rgba(8,9,14,0.82)' : 'rgba(245,245,247,0.82)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const tc     = isDark ? '#ffffff' : '#111118';
  const muted  = isDark ? '#44445a' : '#8888a0';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '56px', zIndex: 30,
      background: bg, backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <polygon points="9,1 17,5.5 17,12.5 9,17 1,12.5 1,5.5" stroke="#7c6dfa" strokeWidth="1.2" fill="rgba(124,109,250,0.1)" />
          <circle cx="9" cy="9" r="2.5" fill="#7c6dfa" />
          <line x1="9" y1="6.5" x2="9" y2="1" stroke="#7c6dfa" strokeWidth="0.8" opacity="0.5" />
        </svg>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: tc, letterSpacing: '0.22em',
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
        }}>
          AGENCY 2026
        </span>
        <div style={{ width: '1px', height: '16px', background: border, margin: '0 4px' }} />
        <span style={{ fontSize: '11px', color: muted, letterSpacing: '0.02em' }}>
          Investigating:{' '}
          <span style={{ color: '#7c6dfa', fontWeight: 500 }}>Genius 100 Foundation</span>
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Tweaks toggle */}
        <button
          onClick={() => setTweaksOpen(!tweaksOpen)}
          title="Toggle tweaks"
          style={{
            background: tweaksOpen
              ? 'rgba(124,109,250,0.15)'
              : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
            border: `1px solid ${tweaksOpen ? 'rgba(124,109,250,0.4)' : border}`,
            borderRadius: '6px',
            padding: '5px 9px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px',
            color: tweaksOpen ? '#9d93fb' : muted,
            fontSize: '10px', letterSpacing: '0.04em',
            fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.6 2.6l1.1 1.1M8.3 8.3l1.1 1.1M2.6 9.4l1.1-1.1M8.3 3.7l1.1-1.1"
              stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          Tweaks
        </button>

        {/* Dark/light toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          title="Toggle theme"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            padding: '5px 9px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px',
            color: muted, fontSize: '10px', letterSpacing: '0.04em',
            fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
          }}
        >
          {isDark ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 1v1.2M6 9.8V11M1 6h1.2M9.8 6H11M2.4 2.4l.85.85M8.75 8.75l.85.85M2.4 9.6l.85-.85M8.75 3.25l.85-.85"
                stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M9.5 6.8A4 4 0 115.2 2.5a3 3 0 004.3 4.3z"
                stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <button style={{
          background: 'transparent', borderRadius: '6px', padding: '5px 13px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.14)'}`,
          cursor: 'pointer', fontSize: '11px', color: tc, letterSpacing: '0.04em',
          fontFamily: 'var(--font-ibm-plex-sans), sans-serif', fontWeight: 400,
        }}>
          New Investigation
        </button>
      </div>
    </div>
  );
}
