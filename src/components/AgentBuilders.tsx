import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Play, SkipForward, Layers } from 'lucide-react';

type AgentColor = string;

interface Agent {
  id: number;
  color: AgentColor;
  name: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  trail: { x: number; y: number; life: number; kind: 'plus' | 'cross' | 'dot' }[];
  selecting: boolean;
  targetEl: Element | null;
  pauseUntil: number;
  labelOpacity: number;
}

interface SelectionBox {
  id: string;
  el: Element;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  label: string;
  life: number;
  maxLife: number;
}

interface DrawLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
}

const AGENT_COLORS = [
  '#22d3ee', // cyan
  '#f472b6', // pink
  '#a3e635', // lime
  '#facc15', // yellow
  '#fb7185', // rose
  '#60a5fa', // blue
  '#c084fc', // purple
  '#fb923c', // orange
  '#4ade80', // green
  '#f87171', // red
  '#e2e8f0', // slate
  '#2dd4bf', // teal
];

const AGENT_NAMES = [
  'Atlas', 'Nova', 'Pixel', 'Forge', 'Echo', 'Orbit',
  'Prism', 'Quark', 'Relay', 'Spark', 'Vector', 'Wave',
  'Bolt', 'Cipher', 'Drift', 'Flux', 'Glyph', 'Helix',
  'Ion', 'Jade', 'Knot', 'Lynx', 'Mesh', 'Nexus',
];

function CursorSvg({ color }: { color: string }) {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden>
      <path
        d="M1.2 1.1L16.4 10.2L9.7 12.1L6.9 20.4L1.2 1.1Z"
        fill={color}
        stroke="#0a0a0a"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function pickTargets(): Element[] {
  const selectors = [
    'nav',
    'h1',
    'h2',
    'h3',
    'p',
    'a',
    'button',
    'section',
    '[data-agent-target]',
    '.interactive',
  ];
  const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
  return nodes.filter((el) => {
    if (el.closest('#agent-builders-root')) return false;
    if (el.closest('#macos') || el.id === 'macos') return false;
    const r = el.getBoundingClientRect();
    return r.width > 24 && r.height > 12 && r.bottom > 0 && r.top < window.innerHeight;
  });
}

function rectLabel(w: number, h: number) {
  return `${Math.round(w)} × ${Math.round(h)}`;
}

export default function AgentBuilders() {
  const rootRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<Agent[]>([]);
  const selectionsRef = useRef<SelectionBox[]>([]);
  const linesRef = useRef<DrawLine[]>([]);
  const rafRef = useRef<number>(0);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [agentCount, setAgentCount] = useState(0);
  const [layersBuilt, setLayersBuilt] = useState(0);
  const [layersTotal, setLayersTotal] = useState(180);
  const [scanning, setScanning] = useState(true);
  const playingRef = useRef(true);
  const builtSetRef = useRef<Set<Element>>(new Set());
  const layersTotalRef = useRef(180);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const spawnAgents = useCallback(() => {
    const count = Math.min(18, Math.max(10, Math.floor(window.innerWidth / 90)));
    const w = window.innerWidth;
    const h = window.innerHeight;
    agentsRef.current = Array.from({ length: count }, (_, i) => {
      const edge = i % 4;
      const x =
        edge === 0 ? Math.random() * w :
        edge === 1 ? w + 40 :
        edge === 2 ? Math.random() * w :
        -40;
      const y =
        edge === 0 ? -40 :
        edge === 1 ? Math.random() * h :
        edge === 2 ? h + 40 :
        Math.random() * h;
      return {
        id: i,
        color: AGENT_COLORS[i % AGENT_COLORS.length],
        name: AGENT_NAMES[i % AGENT_NAMES.length],
        x,
        y,
        tx: w * 0.5 + (Math.random() - 0.5) * 200,
        ty: h * 0.4 + (Math.random() - 0.5) * 160,
        speed: 2.2 + Math.random() * 3.4,
        trail: [],
        selecting: false,
        targetEl: null,
        pauseUntil: 0,
        labelOpacity: Math.random() > 0.45 ? 1 : 0,
      } satisfies Agent;
    });
    setAgentCount(count);
    const total = 140 + Math.floor(Math.random() * 120);
    layersTotalRef.current = total;
    setLayersTotal(total);
    setScanning(true);
    window.setTimeout(() => setScanning(false), 2200);
  }, []);

  const assignTarget = useCallback((agent: Agent) => {
    const targets = pickTargets();
    if (!targets.length) {
      agent.tx = Math.random() * window.innerWidth;
      agent.ty = Math.random() * window.innerHeight;
      agent.targetEl = null;
      return;
    }
    const el = targets[Math.floor(Math.random() * targets.length)];
    const r = el.getBoundingClientRect();
    agent.targetEl = el;
    agent.tx = r.left + r.width * (0.2 + Math.random() * 0.6);
    agent.ty = r.top + r.height * (0.2 + Math.random() * 0.6);
  }, []);

  const createSelection = useCallback((el: Element, color: string, fromX: number, fromY: number) => {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const id = `${el.tagName}-${Math.round(r.left)}-${Math.round(r.top)}-${Date.now()}-${Math.random()}`;
    selectionsRef.current.push({
      id,
      el,
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      color,
      label: rectLabel(r.width, r.height),
      life: 1,
      maxLife: 0.85 + Math.random() * 1.4,
    });
    // Blueprint connector from agent to the box corner
    linesRef.current.push({
      id: `line-${id}`,
      x1: fromX,
      y1: fromY,
      x2: r.left,
      y2: r.top,
      color: '#38bdf8',
      life: 1,
    });
    // Extra guide lines across the box (wireframe feel)
    if (Math.random() > 0.4) {
      linesRef.current.push({
        id: `hline-${id}`,
        x1: r.left,
        y1: r.top + r.height * 0.5,
        x2: r.right,
        y2: r.top + r.height * 0.5,
        color: '#38bdf866',
        life: 0.85,
      });
    }
    if (!builtSetRef.current.has(el)) {
      builtSetRef.current.add(el);
      setLayersBuilt((n) => Math.min(n + 1, layersTotalRef.current));
    } else if (Math.random() > 0.65) {
      setLayersBuilt((n) => Math.min(n + 1, layersTotalRef.current));
    }
  }, []);

  useEffect(() => {
    spawnAgents();
    agentsRef.current.forEach(assignTarget);

    let last = performance.now();
    let renderAccum = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      renderAccum += dt;

      if (playingRef.current && !reducedMotion.current) {
        const agents = agentsRef.current;
        for (const agent of agents) {
          if (now < agent.pauseUntil) {
            agent.selecting = true;
            continue;
          }
          agent.selecting = false;

          const dx = agent.tx - agent.x;
          const dy = agent.ty - agent.y;
          const dist = Math.hypot(dx, dy) || 1;

          if (dist < 8) {
            // Arrived — select / build, then retarget
            if (agent.targetEl) {
              createSelection(agent.targetEl, agent.color, agent.x, agent.y);
              agent.pauseUntil = now + 280 + Math.random() * 700;
              agent.selecting = true;
            }
            assignTarget(agent);
          } else {
            const step = Math.min(dist, agent.speed * (dt * 60));
            agent.x += (dx / dist) * step;
            agent.y += (dy / dist) * step;

            // subtle wander
            agent.x += Math.sin(now / 320 + agent.id) * 0.15;
            agent.y += Math.cos(now / 290 + agent.id * 1.3) * 0.15;

            if (Math.random() < 0.35) {
              agent.trail.push({
                x: agent.x - 4 + Math.random() * 8,
                y: agent.y - 4 + Math.random() * 8,
                life: 1,
                kind: Math.random() > 0.55 ? 'plus' : Math.random() > 0.5 ? 'cross' : 'dot',
              });
              if (agent.trail.length > 18) agent.trail.shift();
            }
          }

          for (let i = agent.trail.length - 1; i >= 0; i--) {
            agent.trail[i].life -= dt * 1.6;
            if (agent.trail[i].life <= 0) agent.trail.splice(i, 1);
          }
        }

        for (let i = selectionsRef.current.length - 1; i >= 0; i--) {
          const s = selectionsRef.current[i];
          s.life -= dt / s.maxLife;
          if (s.life <= 0 || !s.el.isConnected) {
            selectionsRef.current.splice(i, 1);
            continue;
          }
          // Keep boxes glued to their DOM targets while scrolling
          const r = s.el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4 || r.bottom < -40 || r.top > window.innerHeight + 40) {
            selectionsRef.current.splice(i, 1);
            continue;
          }
          s.left = r.left;
          s.top = r.top;
          s.width = r.width;
          s.height = r.height;
          s.label = rectLabel(r.width, r.height);
        }
        for (let i = linesRef.current.length - 1; i >= 0; i--) {
          const line = linesRef.current[i];
          line.life -= dt * 1.1;
          if (line.life <= 0) linesRef.current.splice(i, 1);
        }
      }

      if (renderAccum > 1 / 30) {
        renderAccum = 0;
        setTick((t) => t + 1);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      spawnAgents();
      agentsRef.current.forEach(assignTarget);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [assignTarget, createSelection, spawnAgents]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // keep tick referenced so React re-renders from rAF
  void tick;

  const agents = agentsRef.current;
  const selections = selectionsRef.current;
  const lines = linesRef.current;

  return (
    <div
      id="agent-builders-root"
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      aria-hidden
    >
      {/* Blueprint connectors */}
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth="1"
            opacity={Math.max(0, line.life)}
          />
        ))}
      </svg>

      {/* Selection boxes */}
      {selections.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: s.left,
            top: s.top,
            width: s.width,
            height: s.height,
            opacity: Math.max(0, Math.min(1, s.life * 1.4)),
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              border: `1px solid ${s.color === '#e2e8f0' ? '#38bdf8' : '#38bdf8'}`,
              boxShadow: '0 0 0 1px rgba(56,189,248,0.15)',
            }}
          />
          {/* Corner + edge handles */}
          {[
            ['-3px', '-3px'], ['calc(50% - 3px)', '-3px'], ['calc(100% - 3px)', '-3px'],
            ['-3px', 'calc(50% - 3px)'], ['calc(100% - 3px)', 'calc(50% - 3px)'],
            ['-3px', 'calc(100% - 3px)'], ['calc(50% - 3px)', 'calc(100% - 3px)'], ['calc(100% - 3px)', 'calc(100% - 3px)'],
          ].map(([l, t], i) => (
            <span
              key={i}
              className="absolute w-[6px] h-[6px] bg-sky-400 border border-sky-200"
              style={{ left: l, top: t }}
            />
          ))}
          <span
            className="absolute -top-5 left-0 font-mono text-[10px] tracking-tight text-sky-300 whitespace-nowrap px-1 py-0.5 bg-black/70 border border-sky-500/40"
          >
            {s.label}
          </span>
        </div>
      ))}

      {/* Trails + cursors */}
      {agents.map((agent) => (
        <React.Fragment key={agent.id}>
          {agent.trail.map((p, i) => (
            <span
              key={`${agent.id}-t-${i}`}
              className="absolute font-mono leading-none select-none"
              style={{
                left: p.x,
                top: p.y,
                color: agent.color,
                opacity: p.life * 0.85,
                fontSize: p.kind === 'dot' ? 8 : 11,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {p.kind === 'plus' ? '+' : p.kind === 'cross' ? '×' : '•'}
            </span>
          ))}
          <div
            className="absolute will-change-transform"
            style={{
              left: 0,
              top: 0,
              transform: `translate3d(${agent.x}px, ${agent.y}px, 0)`,
            }}
          >
            <div
              className="relative"
              style={{
                filter: agent.selecting
                  ? `drop-shadow(0 0 6px ${agent.color})`
                  : `drop-shadow(0 0 2px ${agent.color}88)`,
              }}
            >
              <CursorSvg color={agent.color} />
              {agent.labelOpacity > 0 && (
                <span
                  className="absolute left-4 top-4 whitespace-nowrap font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-sm border"
                  style={{
                    color: '#0a0a0a',
                    background: agent.color,
                    borderColor: 'rgba(0,0,0,0.25)',
                    opacity: 0.95,
                  }}
                >
                  {agent.name}
                </span>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Bottom status bar */}
      <div className="pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 z-[81]">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/80 backdrop-blur-xl px-3 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.55)]">
          <div className="flex -space-x-1.5 pl-1">
            {AGENT_COLORS.slice(0, 6).map((c) => (
              <span
                key={c}
                className="w-2.5 h-2.5 rounded-full ring-2 ring-zinc-950"
                style={{ background: c }}
              />
            ))}
          </div>
          {scanning ? (
            <span className="font-mono text-[11px] text-sky-300 tracking-tight animate-pulse">
              Scanning page…
            </span>
          ) : (
            <span className="font-mono text-[11px] text-zinc-200 tracking-tight">
              {agentCount} agents
            </span>
          )}
          <span className="w-px h-3 bg-white/15" />
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <Layers className="w-3 h-3" />
            {layersBuilt} / {layersTotal} layers
          </span>
          <span className="hidden sm:inline-block w-16 h-1 rounded-full bg-white/10 overflow-hidden">
            <span
              className="block h-full bg-sky-400/80 transition-[width] duration-300"
              style={{ width: `${Math.min(100, (layersBuilt / Math.max(1, layersTotal)) * 100)}%` }}
            />
          </span>
          <span className="w-px h-3 bg-white/15" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={playing ? 'Pause agents' : 'Play agents'}
              onClick={() => setPlaying((p) => !p)}
              className="interactive p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              aria-label="Reseed agents"
              onClick={() => {
                builtSetRef.current.clear();
                setLayersBuilt(0);
                spawnAgents();
                agentsRef.current.forEach(assignTarget);
                setPlaying(true);
              }}
              className="interactive p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
