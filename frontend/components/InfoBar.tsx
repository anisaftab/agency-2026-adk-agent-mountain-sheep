'use client';

import React from 'react';
import RiskChip from './RiskChip';
import { NodeData, chipLevel } from './data';

interface InfoBarProps {
  node: NodeData | null;
  visible: boolean;
  onDismiss: () => void;
  isDark: boolean;
}

export default function InfoBar({ node, visible, onDismiss, isDark }: InfoBarProps) {
  const bg     = isDark ? 'rgba(8,9,14,0.97)' : 'rgba(245,245,247,0.97)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const tc     = isDark ? '#ffffff' : '#111118';
  const muted  = isDark ? '#44445a' : '#8888a0';

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '76px', zIndex: 25,
      background: bg, backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: '28px',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
    }}>
      {node && (
        <>
          {/* Name + BN */}
          <div style={{ flexShrink: 0, minWidth: 0, maxWidth: '220px' }}>
            <div style={{
              fontSize: '14px', fontWeight: 600, color: tc,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {node.label}
            </div>
            {node.bn && (
              <div style={{
                fontSize: '10px', color: muted, marginTop: '3px',
                fontFamily: 'var(--font-ibm-plex-mono), monospace',
              }}>
                {node.bn}
              </div>
            )}
          </div>

          {/* Flags */}
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {node.flags.map((f, i) => (
              <RiskChip key={i} level={chipLevel(f)} v={f} />
            ))}
          </div>

          {/* Brief */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: '11px', color: muted,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {node.brief}
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              flexShrink: 0, background: 'transparent',
              border: `1px solid ${border}`, borderRadius: '5px',
              padding: '4px 11px', cursor: 'pointer', color: muted,
              fontSize: '11px', fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
            }}
          >
            Dismiss ✕
          </button>
        </>
      )}
    </div>
  );
}
