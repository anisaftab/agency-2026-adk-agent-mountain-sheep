'use client';

import React, { useRef, useEffect } from 'react';
import RiskChip from './RiskChip';
import { ChatMessage } from './data';

interface BubbleProps {
  msg: ChatMessage;
  isDark: boolean;
}

function Bubble({ msg, isDark }: BubbleProps) {
  const isA = msg.role === 'agent';
  const bubbleBg     = isA ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'rgba(124,109,250,0.16)';
  const bubbleBorder = isA ? (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)') : 'rgba(124,109,250,0.28)';
  const tc           = isDark ? '#d0d0da' : '#222230';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isA ? 'flex-start' : 'flex-end',
      marginBottom: '10px',
      gap: '7px',
      alignItems: 'flex-start',
      animation: 'fade-in 0.25s ease both',
    }}>
      {isA && (
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(124,109,250,0.18)', border: '1px solid rgba(124,109,250,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', color: '#9d93fb', fontWeight: 700, letterSpacing: 0,
        }}>
          AI
        </div>
      )}
      <div style={{
        maxWidth: '84%',
        background: bubbleBg,
        border: `1px solid ${bubbleBorder}`,
        borderRadius: isA ? '2px 8px 8px 8px' : '8px 2px 8px 8px',
        padding: '8px 11px',
        fontSize: '12px',
        lineHeight: '1.6',
        color: tc,
      }}>
        {msg.parts.map((p, i) =>
          p.type === 'chip' ? (
            <RiskChip key={i} level={p.level ?? 'neutral'} v={p.v} />
          ) : (
            <span key={i}>{p.v}</span>
          )
        )}
      </div>
    </div>
  );
}

interface ChatPanelProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  isDark: boolean;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputVal: string;
  setInputVal: (v: string) => void;
}

export default function ChatPanel({
  open, setOpen, isDark, messages, setMessages, inputVal, setInputVal,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelBg = isDark ? 'rgba(8,9,14,0.97)' : 'rgba(245,245,247,0.97)';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const tc      = isDark ? '#e4e4ec' : '#111118';
  const muted   = isDark ? '#44445a' : '#8888a0';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    const txt = inputVal.trim();
    if (!txt) return;
    setMessages((p) => [...p, { id: Date.now(), role: 'user', parts: [{ type: 'text', v: txt }] }]);
    setInputVal('');
    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 1,
          role: 'agent',
          parts: [{ type: 'text', v: 'Analyzing query against CRA filings database. Cross-referencing director registry and funding records...' }],
        },
      ]);
    }, 850);
  };

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, height: '100vh', width: '360px',
      transform: `translateX(${open ? 0 : -328}px)`,
      transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
      zIndex: 20, display: 'flex', flexDirection: 'column',
      background: panelBg, borderRight: `1px solid ${border}`,
      backdropFilter: 'blur(24px)',
    }}>
      {/* Tab handle */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: 'absolute', right: -32, top: '50%', transform: 'translateY(-50%)',
          width: '32px', height: '56px',
          background: panelBg, backdropFilter: 'blur(24px)',
          border: `1px solid ${border}`, borderLeft: 'none',
          borderRadius: '0 10px 10px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {open ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="#7c6dfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
            <rect x="1" y="1.5" width="14" height="2" rx="1" fill={isDark ? '#44445a' : '#aaaabc'} />
            <rect x="1" y="6" width="10" height="2" rx="1" fill={isDark ? '#44445a' : '#aaaabc'} />
            <rect x="1" y="10.5" width="12" height="2" rx="1" fill={isDark ? '#44445a' : '#aaaabc'} />
            <circle cx="13.5" cy="11.5" r="2.5" fill="#7c6dfa" />
          </svg>
        )}
      </div>

      {/* Header */}
      <div style={{
        padding: '16px', borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', background: '#7c6dfa',
          flexShrink: 0, animation: 'pulse-dot 2.2s infinite',
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: tc, letterSpacing: '0.05em' }}>
            Investigation Agent
          </div>
          <div style={{ fontSize: '9px', color: '#7c6dfa', letterSpacing: '0.1em', marginTop: '2px' }}>
            ● ACTIVE
          </div>
        </div>
        <div style={{
          fontSize: '9px', color: muted,
          fontFamily: 'var(--font-ibm-plex-mono), monospace', textAlign: 'right',
        }}>
          <div>420,021</div>
          <div style={{ opacity: 0.6 }}>records</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          fontSize: '10px', color: muted, letterSpacing: '0.06em',
          textAlign: 'center', marginBottom: '14px',
        }}>
          SESSION STARTED · APR 29 2026
        </div>
        {messages.map((m) => <Bubble key={m.id} msg={m} isDark={isDark} />)}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px', borderTop: `1px solid ${border}`,
        flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask the agent…"
          style={{
            flex: 1,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '12px',
            color: tc,
            fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
          }}
        />
        <button
          onClick={send}
          style={{
            width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0,
            background: '#7c6dfa', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M7.5 2.5l4.5 4.5-4.5 4.5"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
