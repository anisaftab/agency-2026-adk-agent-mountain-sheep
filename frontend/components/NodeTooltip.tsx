'use client';

import React from 'react';
import { NodeData, nodeColorHex } from './data';

interface NodeTooltipProps {
  nodeId: string;
  nodes: NodeData[];
  mp: { x: number; y: number };
  isDark: boolean;
}

export default function NodeTooltip({ nodeId, nodes, mp, isDark }: NodeTooltipProps) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const bg     = isDark ? 'rgba(10,11,18,0.96)' : 'rgba(240,240,246,0.96)';
  const border = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
  const tc     = isDark ? '#e4e4ec' : '#111118';
  const color  = nodeColorHex(node);

  return (
    <div style={{
      position: 'fixed',
      left: mp.x + 15,
      top: mp.y - 12,
      pointerEvents: 'none',
      zIndex: 100,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '6px',
      padding: '5px 11px',
      fontSize: '11px',
      color: tc,
      backdropFilter: 'blur(12px)',
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
    }}>
      <span style={{
        display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
        background: color, boxShadow: `0 0 6px ${color}`,
      }} />
      <span style={{ fontWeight: 500 }}>{node.label}</span>
      {node.risk && (
        <span style={{
          color,
          fontSize: '9px',
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontWeight: 600,
          letterSpacing: '0.08em',
        }}>
          {node.risk}
        </span>
      )}
      {node.type === 'director' && (
        <span style={{
          color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
          fontSize: '9px',
          letterSpacing: '0.08em',
        }}>
          DIRECTOR
        </span>
      )}
    </div>
  );
}
