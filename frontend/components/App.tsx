'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { NODES, CHAT_INIT, TWEAK_DEFAULTS, TweakValues, ChatMessage, NodeData } from './data';
import TopBar from './TopBar';
import ChatPanel from './ChatPanel';
import InfoBar from './InfoBar';
import NodeTooltip from './NodeTooltip';
import TweaksPanel from './TweaksPanel';
import Legend from './Legend';

// Globe uses Three.js — must be client-only with no SSR
const Globe = dynamic(() => import('./Globe'), { ssr: false });

export default function App() {
  const [tweaks, setTweaks] = useState<TweakValues>(TWEAK_DEFAULTS);
  const isDark = tweaks.darkMode;

  const setTweak = useCallback(<K extends keyof TweakValues>(key: K, value: TweakValues[K]) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setIsDark = useCallback((v: boolean) => setTweak('darkMode', v), [setTweak]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode,  setHoveredNode]  = useState<string | null>(null);
  const [chatOpen,     setChatOpen]     = useState(false);
  const [tweaksOpen,   setTweaksOpen]   = useState(false);
  const [infoNode,     setInfoNode]     = useState<NodeData | null>(null);
  const [infoVisible,  setInfoVisible]  = useState(false);
  const [messages,     setMessages]     = useState<ChatMessage[]>(CHAT_INIT);
  const [inputVal,     setInputVal]     = useState('');
  const [mp,           setMp]           = useState({ x: 0, y: 0 });

  /* Stable event handlers passed to Globe */
  const onNodeClick = useCallback((nodeId: string | null) => {
    if (!nodeId) {
      setSelectedNode(null);
      setInfoVisible(false);
      return;
    }
    setSelectedNode((prev) => {
      if (prev === nodeId) {
        setInfoVisible(false);
        return null;
      }
      const nd = NODES.find((n) => n.id === nodeId) ?? null;
      setInfoNode(nd);
      setInfoVisible(true);
      return nodeId;
    });
  }, []);

  const onNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  /* Mouse position for tooltip */
  useEffect(() => {
    const h = (e: MouseEvent) => setMp({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const dismiss = useCallback(() => {
    setInfoVisible(false);
    setSelectedNode(null);
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: isDark ? '#08090e' : '#f5f5f7',
      position: 'relative',
      color: isDark ? '#e4e4ec' : '#111118',
      fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif',
    }}>
      <Globe
        tweaks={tweaks}
        selectedNode={selectedNode}
        hoveredNode={hoveredNode}
        chatOpen={chatOpen}
        infoVisible={infoVisible}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
      />

      <TopBar
        isDark={isDark}
        setIsDark={setIsDark}
        tweaksOpen={tweaksOpen}
        setTweaksOpen={setTweaksOpen}
      />

      <ChatPanel
        open={chatOpen}
        setOpen={setChatOpen}
        isDark={isDark}
        messages={messages}
        setMessages={setMessages}
        inputVal={inputVal}
        setInputVal={setInputVal}
      />

      <InfoBar
        node={infoNode}
        visible={infoVisible}
        onDismiss={dismiss}
        isDark={isDark}
      />

      {hoveredNode && !selectedNode && (
        <NodeTooltip nodeId={hoveredNode} mp={mp} isDark={isDark} />
      )}

      <TweaksPanel
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        tweaks={tweaks}
        setTweak={setTweak}
      />

      <Legend isDark={isDark} />
    </div>
  );
}
