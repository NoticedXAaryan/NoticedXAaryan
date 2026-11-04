import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Agent {
  id: number;
  color: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  phase: 'fly' | 'click' | 'leave';
  clickUntil: number;
  target: HTMLElement | null;
  opacity: number;
  trail: { x: number; y: number; life: number }[];
}

interface FlashBox {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  life: number;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  life: number;
  color: string;
}

const COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#facc15', '#fb923c', '#c084fc'];

function CursorSvg({ color }: { color: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 18 22" fill="none" aria-hidden>
      <path
        d="M1.2 1.1L16.4 10.2L9.7 12.1L6.9 20.4L1.2 1.1Z"
        fill={color}
        stroke="#0a0a0a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function markBuilt(el: HTMLElement) {
  el.classList.remove('build-pending');
  el.classList.add('build-ready');
  el.dataset.buildState = 'ready';
}

function isPending(el: Element): el is HTMLElement {
  return (
    el instanceof HTMLElement &&
    el.dataset.buildState !== 'ready' &&
    el.dataset.buildState !== 'building'
  );
}

function elementId(el: HTMLElement) {
  return el.dataset.buildId || el.id || `${el.tagName}-${Math.round(el.getBoundingClientRect().top)}`;
}

function nextPendingInView(): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>('[data-build]:not([data-build="hero"])')
  )
    .filter(isPending)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      // Create when the block is entering the lower/mid viewport
      return r.top < window.innerHeight * 0.82 && r.bottom > 64;
    })
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return candidates[0] || null;
}

export default function AgentBuilders() {
  const agentsRef = useRef<Agent[]>([]);
  const queueRef = useRef<HTMLElement[]>([]);
  const flashesRef = useRef<FlashBox[]>([]);
  const ripplesRef = useRef<ClickRipple[]>([]);
  const rafRef = useRef(0);
  const nextId = useRef(1);
  const busyRef = useRef(false);
  const heroDoneRef = useRef(false);
  const dismissTimer = useRef<number | null>(null);
  const claimedIds = useRef<Set<string>>(new Set());
  const tryBuildRef = useRef<() => void>(() => {});
  const [show, setShow] = useState(false);
  const [tick, setTick] = useState(0);

  const endSession = useCallback(() => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    for (const agent of agentsRef.current) {
      agent.phase = 'leave';
      agent.target = null;
      agent.speed = 36;
      agent.ty = -100;
      agent.tx = agent.x + (Math.random() - 0.5) * 40;
    }
    dismissTimer.current = window.setTimeout(() => {
      agentsRef.current = [];
      flashesRef.current = [];
      ripplesRef.current = [];
      busyRef.current = false;
      setShow(false);
      setTick((t) => t + 1);
      // Immediately try the next in-view block
      window.setTimeout(() => tryBuildRef.current(), 40);
    }, 200);
  }, []);

  const spawnAgents = useCallback((count: number, from: { x: number; y: number }) => {
    if (dismissTimer.current) {
      window.clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    const agents: Agent[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2 + (Math.random() - 0.5) * 0.35;
      agents.push({
        id: nextId.current++,
        color: COLORS[i % COLORS.length],
        x: from.x,
        y: from.y,
        tx: from.x + Math.cos(angle) * 30,
        ty: from.y + Math.sin(angle) * 30,
        speed: 28 + Math.random() * 10,
        phase: 'fly',
        clickUntil: 0,
        target: null,
        opacity: 1,
        trail: [],
      });
    }
    agentsRef.current = agents;
    busyRef.current = true;
    setShow(true);
  }, []);

  const takeNext = useCallback((): HTMLElement | null => {
    while (queueRef.current.length) {
      const el = queueRef.current.shift()!;
      if (el.dataset.buildState === 'ready') continue;
      return el;
    }
    return null;
  }, []);

  const assignWork = useCallback((agent: Agent) => {
    const next = takeNext();
    if (!next) {
      agent.phase = 'leave';
      agent.target = null;
      agent.speed = 34;
      agent.tx = agent.x + (Math.random() - 0.5) * 36;
      agent.ty = -100;
      return;
    }
    next.dataset.buildState = 'building';
    const r = next.getBoundingClientRect();
    agent.target = next;
    agent.phase = 'fly';
    agent.speed = 30 + Math.random() * 12;
    agent.tx = r.left + r.width * (0.28 + Math.random() * 0.44);
    agent.ty = r.top + Math.min(Math.max(r.height * 0.4, 10), 44);
    agent.opacity = 1;
  }, [takeNext]);

  const createElement = useCallback((agent: Agent) => {
    const el = agent.target;
    if (!el) return;
    const r = el.getBoundingClientRect();
    markBuilt(el);
    flashesRef.current.push({
      id: nextId.current++,
      left: r.left,
      top: r.top,
      width: Math.max(r.width, 8),
      height: Math.max(r.height, 8),
      life: 1,
    });
    ripplesRef.current.push({
      id: nextId.current++,
      x: agent.x,
      y: agent.y,
      life: 1,
      color: agent.color,
    });
    agent.phase = 'click';
    agent.clickUntil = performance.now() + 65;
    agent.target = null;
  }, []);

  const finishIfIdle = useCallback(() => {
    if (queueRef.current.length > 0) return;
    const busy = agentsRef.current.some(
      (a) => (a.phase === 'fly' && !!a.target) || a.phase === 'click'
    );
    if (busy) return;
    if (!heroDoneRef.current) heroDoneRef.current = true;
    endSession();
  }, [endSession]);

  const startHeroBuild = useCallback(() => {
    const hero = Array.from(
      document.querySelectorAll<HTMLElement>('[data-build="hero"]')
    ).filter(isPending);
    if (!hero.length) {
      heroDoneRef.current = true;
      tryBuildRef.current();
      return;
    }
    queueRef.current = [...hero];
    const from = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
    spawnAgents(Math.min(5, Math.max(3, hero.length)), from);
    agentsRef.current.forEach((agent, i) => {
      window.setTimeout(() => assignWork(agent), 80 + i * 50);
    });
  }, [assignWork, spawnAgents]);

  const buildOne = useCallback((el: HTMLElement) => {
    if (!heroDoneRef.current) return;
    if (busyRef.current) return;
    if (!isPending(el)) return;

    const id = elementId(el);
    if (claimedIds.current.has(id)) return;
    claimedIds.current.add(id);

    queueRef.current = [el];
    const r = el.getBoundingClientRect();
    const from = {
      x: Math.min(window.innerWidth - 40, Math.max(40, r.left + Math.min(r.width * 0.2, 120))),
      y: Math.min(window.innerHeight - 40, Math.max(40, r.top + 8)),
    };
    const count = r.height > 90 ? 2 : 1;
    spawnAgents(count, from);
    agentsRef.current.forEach((agent, i) => {
      window.setTimeout(() => assignWork(agent), 12 + i * 28);
    });
  }, [assignWork, spawnAgents]);

  const tryBuildNext = useCallback(() => {
    if (!heroDoneRef.current || busyRef.current) return;
    const el = nextPendingInView();
    if (el) buildOne(el);
  }, [buildOne]);

  useEffect(() => {
    tryBuildRef.current = tryBuildNext;
  }, [tryBuildNext]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('[data-build]').forEach(markBuilt);
      return;
    }

    document.querySelectorAll<HTMLElement>('[data-build]').forEach((el) => {
      if (el.dataset.buildState === 'ready') return;
      el.classList.add('build-pending');
      el.dataset.buildState = 'pending';
    });

    const boot = window.setTimeout(() => startHeroBuild(), 240);

    // Accessibility-only fallback — do NOT race the scroll demo
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-build].build-pending').forEach(markBuilt);
      heroDoneRef.current = true;
      busyRef.current = false;
      agentsRef.current = [];
      setShow(false);
    }, 90000);

    const onScrollOrResize = () => tryBuildNext();
    const io = new IntersectionObserver(() => tryBuildNext(), {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: [0.15, 0.35, 0.6],
    });

    const observeTimer = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('[data-build]:not([data-build="hero"])')
        .forEach((el) => io.observe(el));
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize);
    }, 700);

    let last = performance.now();
    let renderAccum = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      renderAccum += dt;

      if (busyRef.current || agentsRef.current.length) {
        for (const agent of agentsRef.current) {
          if (agent.phase === 'click') {
            if (now >= agent.clickUntil) {
              if (queueRef.current.length) assignWork(agent);
              else {
                agent.phase = 'leave';
                agent.speed = 36;
                agent.tx = agent.x + (Math.random() - 0.5) * 40;
                agent.ty = -100;
              }
            }
          } else {
            const dx = agent.tx - agent.x;
            const dy = agent.ty - agent.y;
            const dist = Math.hypot(dx, dy) || 1;
            const step = Math.min(dist, agent.speed * dt * 60 * 0.45);

            if (dist < 8) {
              if (agent.phase === 'fly' && agent.target) {
                createElement(agent);
              } else if (agent.phase === 'leave') {
                agent.opacity = 0;
              } else if (agent.phase === 'fly' && !agent.target) {
                if (queueRef.current.length) assignWork(agent);
                else {
                  agent.phase = 'leave';
                  agent.ty = -100;
                  agent.speed = 36;
                }
              }
            } else {
              agent.x += (dx / dist) * step;
              agent.y += (dy / dist) * step;
              if (agent.phase !== 'leave' && Math.random() < 0.35) {
                agent.trail.push({ x: agent.x, y: agent.y, life: 1 });
                if (agent.trail.length > 5) agent.trail.shift();
              }
            }

            if (agent.phase === 'leave') {
              agent.opacity = Math.max(0, agent.opacity - dt * 6);
            }
          }

          for (let i = agent.trail.length - 1; i >= 0; i--) {
            agent.trail[i].life -= dt * 4.2;
            if (agent.trail[i].life <= 0) agent.trail.splice(i, 1);
          }
        }

        agentsRef.current = agentsRef.current.filter(
          (a) => !(a.phase === 'leave' && a.opacity <= 0.02)
        );

        for (let i = flashesRef.current.length - 1; i >= 0; i--) {
          flashesRef.current[i].life -= dt * 3.2;
          if (flashesRef.current[i].life <= 0) flashesRef.current.splice(i, 1);
        }
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          ripplesRef.current[i].life -= dt * 3.4;
          if (ripplesRef.current[i].life <= 0) ripplesRef.current.splice(i, 1);
        }

        if (busyRef.current) finishIfIdle();
      }

      if (renderAccum > 1 / 45) {
        renderAccum = 0;
        if (busyRef.current || flashesRef.current.length || ripplesRef.current.length) {
          setTick((t) => t + 1);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.clearTimeout(boot);
      window.clearTimeout(safety);
      window.clearTimeout(observeTimer);
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [assignWork, createElement, finishIfIdle, startHeroBuild, tryBuildNext]);

  void tick;

  if (!show && flashesRef.current.length === 0 && ripplesRef.current.length === 0) {
    return null;
  }

  const agents = agentsRef.current;
  const flashes = flashesRef.current;
  const ripples = ripplesRef.current;

  return (
    <div id="agent-builders-root" className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      {flashes.map((f) => (
        <div
          key={f.id}
          className="absolute border border-sky-400/80"
          style={{
            left: f.left,
            top: f.top,
            width: f.width,
            height: f.height,
            opacity: Math.max(0, f.life * 0.95),
          }}
        >
          <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-sky-400" />
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-sky-400" />
          <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-sky-400" />
          <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-sky-400" />
        </div>
      ))}

      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full border"
          style={{
            left: r.x,
            top: r.y,
            width: 10 + (1 - r.life) * 22,
            height: 10 + (1 - r.life) * 22,
            marginLeft: -(5 + (1 - r.life) * 11),
            marginTop: -(5 + (1 - r.life) * 11),
            borderColor: r.color,
            opacity: r.life * 0.65,
          }}
        />
      ))}

      {agents.map((agent) => (
        <React.Fragment key={agent.id}>
          {agent.trail.map((p, i) => (
            <span
              key={`${agent.id}-${i}`}
              className="absolute font-mono text-[9px] leading-none"
              style={{
                left: p.x,
                top: p.y,
                color: agent.color,
                opacity: p.life * agent.opacity * 0.65,
                transform: 'translate(-50%, -50%)',
              }}
            >
              +
            </span>
          ))}
          <div
            className="absolute will-change-transform"
            style={{
              transform: `translate3d(${agent.x}px, ${agent.y}px, 0) scale(${agent.phase === 'click' ? 0.84 : 1})`,
              opacity: agent.opacity,
              filter: `drop-shadow(0 0 3px ${agent.color}aa)`,
            }}
          >
            <CursorSvg color={agent.color} />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
