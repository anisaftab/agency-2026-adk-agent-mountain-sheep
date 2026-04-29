'use client';

import React from 'react';
import RiskChip from './RiskChip';
import { InsightData } from './data';

interface InsightsPanelProps {
  insights: InsightData[];
  isDark: boolean;
  chatOpen: boolean;
}

export default function InsightsPanel({ insights, isDark, chatOpen }: InsightsPanelProps) {
  if (!insights.length) return null;

  const bg = isDark ? 'rgba(8,9,14,0.92)' : 'rgba(245,245,247,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const tc = isDark ? '#e4e4ec' : '#111118';
  const muted = isDark ? '#8f8fa3' : '#5f5f72';

  return (
    <div style={{
      position: 'fixed',
      right: 18,
      top: 72,
      width: '330px',
      maxHeight: '42vh',
      overflowY: 'auto',
      zIndex: 18,
      transform: chatOpen ? 'translateX(0)' : 'translateX(0)',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '10px',
      backdropFilter: 'blur(18px)',
      boxShadow: isDark ? '0 18px 60px rgba(0,0,0,0.35)' : '0 18px 60px rgba(0,0,0,0.12)',
      padding: '13px',
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '0.12em',
        color: muted,
        marginBottom: '10px',
        fontFamily: 'var(--font-ibm-plex-mono), monospace',
      }}>
        AGENT INSIGHTS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {insights.map((insight, i) => (
          <div key={`${insight.title}-${i}`} style={{
            borderTop: i === 0 ? 'none' : `1px solid ${border}`,
            paddingTop: i === 0 ? 0 : '11px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <RiskChip level={insight.severity} v={insight.severity} />
              <div style={{
                fontSize: '12px',
                color: tc,
                fontWeight: 600,
                lineHeight: 1.35,
              }}>
                {insight.title}
              </div>
            </div>
            <div style={{ color: muted, fontSize: '11px', lineHeight: 1.5 }}>
              {insight.summary}
            </div>
            {insight.evidence.length > 0 && (
              <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {insight.evidence.slice(0, 3).map((item, idx) => (
                  <div key={idx} style={{
                    color: muted,
                    fontSize: '10px',
                    lineHeight: 1.45,
                    fontFamily: 'var(--font-ibm-plex-mono), monospace',
                  }}>
                    - {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
