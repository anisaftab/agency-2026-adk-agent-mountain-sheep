export const GLOBE_R = 185;

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | null;
export type NodeType = 'org' | 'director';

export interface NodeData {
  id: string;
  label: string;
  short: string;
  type: NodeType;
  risk: RiskLevel;
  bn: string | null;
  flags: string[];
  brief: string;
  phi: number;
  theta: number;
}

export interface EdgeData {
  from: string;
  to: string;
  loop: boolean;
  relation?: string;
  amount?: number | null;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface InsightData {
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  evidence: string[];
}

export interface AgentGraphNode {
  id?: string;
  label?: string;
  short?: string;
  type?: NodeType;
  risk?: RiskLevel;
  bn?: string | null;
  flags?: string[];
  brief?: string;
}

export interface AgentGraphEdge {
  from?: string;
  to?: string;
  loop?: boolean;
  relation?: string;
  amount?: number | null;
}

export interface AgentStructuredResponse {
  message?: string;
  insights?: {
    title?: string;
    severity?: 'HIGH' | 'MEDIUM' | 'LOW';
    summary?: string;
    evidence?: string[];
  }[];
  graph?: {
    nodes?: AgentGraphNode[];
    edges?: AgentGraphEdge[];
  };
}

export interface MessagePart {
  type: 'text' | 'chip';
  v: string;
  level?: 'HIGH' | 'MEDIUM' | 'LOW' | 'neutral';
}

export interface ChatMessage {
  id: number;
  role: 'agent' | 'user';
  parts: MessagePart[];
}

export interface TweakValues {
  darkMode: boolean;
  dotOpacity: number;
  dotSize: number;
  wireOpacity: number;
  rotationSpeed: number;
  glowIntensity: number;
  edgeOpacity: number;
}

export const NODES: NodeData[] = [
  {
    id: 'genius100',
    label: 'Genius 100 Foundation',
    short: 'Genius 100',
    type: 'org',
    risk: 'HIGH',
    bn: 'BN 123456789 RR0001',
    flags: ['HIGH RISK', 'ZERO PROGRAMS'],
    brief: '$295,795 compensation, $0 program spend received $386,846 in 2020',
    phi: 1.05,
    theta: 0.75,
  },
  {
    id: 'celtic',
    label: 'Celtic Cross Foundation',
    short: 'Celtic Cross',
    type: 'org',
    risk: 'HIGH',
    bn: 'BN 987654321 RR0001',
    flags: ['HIGH RISK', 'LOOP DETECTED'],
    brief: 'Zero program spend. Circular funding loop with Genius 100 — $45,000 total.',
    phi: 0.85,
    theta: 2.35,
  },
  {
    id: 'sharon',
    label: 'Sharon Francis Foundation',
    short: 'Sharon Francis',
    type: 'org',
    risk: 'MEDIUM',
    bn: 'BN 456789123 RR0001',
    flags: ['MEDIUM RISK'],
    brief: 'Shared director with high-risk organizations.',
    phi: 1.42,
    theta: 4.1,
  },
  {
    id: 'jewish',
    label: 'Jewish Legacy Foundation',
    short: 'Jewish Legacy',
    type: 'org',
    risk: 'MEDIUM',
    bn: 'BN 321654987 RR0001',
    flags: ['MEDIUM RISK'],
    brief: 'Director overlap with Genius 100 Foundation.',
    phi: 0.55,
    theta: 5.15,
  },
  {
    id: 'finca',
    label: 'FINCA Canada',
    short: 'FINCA Canada',
    type: 'org',
    risk: 'LOW',
    bn: 'BN 741852963 RR0001',
    flags: ['LOW RISK'],
    brief: 'Minor connection through shared director Robert Chen.',
    phi: 1.65,
    theta: 3.0,
  },
  {
    id: 'smith',
    label: 'John Smith',
    short: 'John Smith',
    type: 'director',
    risk: null,
    bn: null,
    flags: ['DIRECTOR'],
    brief: 'Directs 3 organizations — Genius 100, Celtic Cross, Sharon Francis.',
    phi: 0.32,
    theta: 1.5,
  },
  {
    id: 'doe',
    label: 'Jane Doe',
    short: 'Jane Doe',
    type: 'director',
    risk: null,
    bn: null,
    flags: ['DIRECTOR'],
    brief: 'Director of Genius 100 and Jewish Legacy Foundation.',
    phi: 1.88,
    theta: 0.3,
  },
  {
    id: 'chen',
    label: 'Robert Chen',
    short: 'Robert Chen',
    type: 'director',
    risk: null,
    bn: null,
    flags: ['DIRECTOR'],
    brief: 'Director of Sharon Francis Foundation and FINCA Canada.',
    phi: 1.12,
    theta: 5.82,
  },
];

export const EDGES: EdgeData[] = [
  { from: 'smith', to: 'genius100', loop: false },
  { from: 'smith', to: 'celtic', loop: false },
  { from: 'smith', to: 'sharon', loop: false },
  { from: 'doe', to: 'genius100', loop: false },
  { from: 'doe', to: 'jewish', loop: false },
  { from: 'chen', to: 'sharon', loop: false },
  { from: 'chen', to: 'finca', loop: false },
  { from: 'genius100', to: 'celtic', loop: true },
];

export const CHAT_INIT: ChatMessage[] = [
  {
    id: 1,
    role: 'agent',
    parts: [
      { type: 'text', v: "I've autonomously scanned 420,021 charity filings. Genius 100 Foundation flagged: $295,795 compensation, $0 program spend. " },
      { type: 'chip', level: 'HIGH', v: 'HIGH RISK' },
      { type: 'chip', level: 'HIGH', v: 'ZERO PROGRAMS' },
      { type: 'text', v: ' Investigating director network now.' },
    ],
  },
  {
    id: 2,
    role: 'user',
    parts: [{ type: 'text', v: 'Show me connected organizations' }],
  },
  {
    id: 3,
    role: 'agent',
    parts: [
      { type: 'text', v: 'John Smith directs 3 organizations including Celtic Cross Foundation — also zero program spend. Circular funding loop detected between Genius 100 and Celtic Cross: $45,000 total flow. ' },
      { type: 'chip', level: 'HIGH', v: 'LOOP DETECTED' },
      { type: 'chip', level: 'MEDIUM', v: 'SHARED DIRECTOR' },
    ],
  },
  {
    id: 4,
    role: 'user',
    parts: [{ type: 'text', v: 'Generate the brief' }],
  },
  {
    id: 5,
    role: 'agent',
    parts: [
      { type: 'text', v: 'Genius 100 Foundation received $386,846 in 2020. Zero dollars reached charitable programs. Directors control 3 additional funded organizations. Circular funding loop identified. These findings warrant investigation.' },
    ],
  },
];

export const TWEAK_DEFAULTS: TweakValues = {
  darkMode: true,
  dotOpacity: 0.33,
  dotSize: 1.6,
  wireOpacity: 0.17,
  rotationSpeed: 0.4,
  glowIntensity: 1.5,
  edgeOpacity: 1,
};

export function nodeColorHex(node: NodeData): string {
  if (node.type === 'director') return '#ffffff';
  if (node.risk === 'HIGH') return '#ff3535';
  if (node.risk === 'MEDIUM') return '#ffaa00';
  return '#888888';
}

export function nodeColor3(node: NodeData): number {
  if (node.type === 'director') return 0xffffff;
  if (node.risk === 'HIGH') return 0xff3535;
  if (node.risk === 'MEDIUM') return 0xffaa00;
  return 0x888888;
}

export function getConnected(nodeId: string): Set<string> {
  const s = new Set<string>([nodeId]);
  EDGES.forEach((e) => {
    if (e.from === nodeId) s.add(e.to);
    if (e.to === nodeId) s.add(e.from);
  });
  return s;
}

export function getConnectedFromEdges(nodeId: string, edges: EdgeData[]): Set<string> {
  const s = new Set<string>([nodeId]);
  edges.forEach((e) => {
    if (e.from === nodeId) s.add(e.to);
    if (e.to === nodeId) s.add(e.from);
  });
  return s;
}

export function chipLevel(flag: string): 'HIGH' | 'MEDIUM' | 'LOW' | 'neutral' {
  if (flag.includes('HIGH') || flag.includes('ZERO') || flag.includes('LOOP')) return 'HIGH';
  if (flag.includes('MEDIUM') || flag.includes('SHARED')) return 'MEDIUM';
  if (flag.includes('LOW')) return 'LOW';
  return 'neutral';
}

function stableId(value: string, fallback: string): string {
  const id = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id || fallback;
}

function shortLabel(label: string): string {
  return label
    .replace(/\b(foundation|association|organization|charity|canada|incorporated|inc)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24) || label.slice(0, 24);
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW' || value === null;
}

function isNodeType(value: unknown): value is NodeType {
  return value === 'org' || value === 'director';
}

export function graphFromAgentResponse(graph: AgentStructuredResponse['graph']): GraphData | null {
  if (!graph?.nodes?.length) return null;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const count = graph.nodes.length;
  const nodes = graph.nodes.map((node, i): NodeData => {
    const label = node.label?.trim() || node.short?.trim() || `Entity ${i + 1}`;
    const id = stableId(node.id || label, `node-${i + 1}`);
    const type = isNodeType(node.type) ? node.type : 'org';
    const risk = type === 'director' ? null : isRiskLevel(node.risk) ? node.risk : null;
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;

    return {
      id,
      label,
      short: node.short?.trim() || shortLabel(label),
      type,
      risk,
      bn: node.bn ?? null,
      flags: Array.isArray(node.flags) && node.flags.length ? node.flags : [type === 'director' ? 'DIRECTOR' : 'REVIEW'],
      brief: node.brief?.trim() || 'Included in the latest agent-generated investigation graph.',
      phi: Math.acos(Math.max(-1, Math.min(1, y))),
      theta: goldenAngle * i,
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const aliases = new Map<string, string>();
  graph.nodes.forEach((node, i) => {
    [node.id, node.label, node.short].forEach((value) => {
      if (value) aliases.set(value, nodes[i].id);
    });
  });

  const resolveNodeId = (value?: string): string | null => {
    if (!value) return null;
    if (nodeIds.has(value)) return value;
    return aliases.get(value) ?? null;
  };

  const edges = (graph.edges ?? []).flatMap((edge): EdgeData[] => {
    const from = resolveNodeId(edge.from);
    const to = resolveNodeId(edge.to);
    if (!from || !to) return [];

    return [{
      from,
      to,
      loop: Boolean(edge.loop),
      relation: edge.relation,
      amount: edge.amount ?? null,
    }];
  });

  return { nodes, edges };
}

export function insightsFromAgentResponse(insights: AgentStructuredResponse['insights']): InsightData[] {
  if (!Array.isArray(insights)) return [];

  return insights.flatMap((insight): InsightData[] => {
    if (!insight?.title && !insight?.summary) return [];

    return [{
      title: insight.title?.trim() || 'Investigation insight',
      severity: insight.severity ?? 'LOW',
      summary: insight.summary?.trim() || 'The agent returned this as a notable observation.',
      evidence: Array.isArray(insight.evidence) ? insight.evidence.filter(Boolean) : [],
    }];
  });
}
