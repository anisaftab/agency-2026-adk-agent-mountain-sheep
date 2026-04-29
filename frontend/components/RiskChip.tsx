'use client';

import React from 'react';

type ChipLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'neutral';

interface RiskChipProps {
  level: ChipLevel;
  v: string;
}

const STYLES: Record<ChipLevel, { bg: string; color: string; border: string }> = {
  HIGH:    { bg: 'rgba(255,53,53,0.12)',  color: '#ff5555', border: 'rgba(255,53,53,0.28)' },
  MEDIUM:  { bg: 'rgba(255,170,0,0.12)',  color: '#ffbb33', border: 'rgba(255,170,0,0.28)' },
  LOW:     { bg: 'rgba(136,136,136,0.1)', color: '#aaaaaa', border: 'rgba(136,136,136,0.2)' },
  neutral: { bg: 'rgba(124,109,250,0.1)', color: '#9d93fb', border: 'rgba(124,109,250,0.2)' },
};

export default function RiskChip({ level, v }: RiskChipProps) {
  const s = STYLES[level] ?? STYLES.neutral;
  return (
    <span
      style={{
        display: 'inline-block',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '3px',
        padding: '1px 6px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.07em',
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        verticalAlign: 'middle',
        margin: '1px 2px',
      }}
    >
      {v}
    </span>
  );
}
