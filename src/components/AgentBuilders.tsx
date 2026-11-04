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

export default function AgentBuilders() {
  const agentsRef = useRef<Agent[]>([]);
  const queueRef = useRef<HTMLElement[]>([]);
  const flashesRef = useRef<FlashBox[]>([]);
  const ripplesRef = useRef<ClickRipple[]>([]);
  const rafRef = useRef(0);
  const nextId = useRef(1);
  const activeRef = useRef(false);
  const heroDoneRef = useRef(false);
  const dismissTimer = useRef<number | null>(null);
  const [show, setShow] = useState(false);
  const [tick, setTick] = useState(0);
  const claimedIds = useRef<Set<string>>(new Set());

  const pumpPendingInViewRef = useRef<() => void>(() => {});

  const clearAgentsSoon = useCallback(() => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    // Force leave
    for (const agent of agentsRef.current) {
      agent.phase = 'leave';
      agent.target = null;
      agent.speed = 34;
      agent.ty = -80;
      agent.tx = agent.x + (Math.random() - 0.5) * 60;
    }
    dismissTimer.current = window.setTimeout(() => {
      agentsRef.current = [];
      flashesRef.current = [];
      ripplesRef.current = [];
      activeRef.current = false;
      setShow(false);
      setTick((t) => t + 1);
      // Catch elements that entered view while we were busy / dismissing
      pumpPendingInViewRef.current();
    }, 220);
  }, []);

  const spawnAgents = useCallback((count: number, from: { x: number; y: number }) => {
    if (dismissTimer.current) {
      window.clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    // Replace any leftovers — keep the scene clean
    agentsRef.current = [];
    const agents: Agent[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      agents.push({
        id: nextId.current++,
        color: COLORS[i % COLORS.length],
        x: from.x,
        y: from.y,
        tx: from.x + Math.cos(angle) * 36,
        ty: from.y + Math.sin(angle) * 36,
        speed: 26 + Math.random() * 10,
        phase: 'fly',
        clickUntil: 0,
        target: null,
        opacity: 1,
        trail: [],
      });
    }
    agentsRef.current = agents;
    activeRef.current = true;
    setShow(true);
  }, []);

  const takeNext = useCallback((): HTMLElement | null => {
    while (queueRef.current.length) {
      const el = queueRef.current.shift()!;
      if (isPending(el) || el.dataset.buildState === 'building') {
        // skip already ready
        if (el.dataset.buildState === 'ready') continue;
        return el;
      }
    }
    return null;
  }, []);

  const assignWork = useCallback((agent: Agent) => {
    const next = takeNext();
    if (!next) {
      agent.phase = 'leave';
      agent.target = null;
      agent.speed = 32;
      agent.tx = agent.x + (Math.random() - 0.5) * 40;
      agent.ty = -90;
      return;
    }
    next.dataset.buildState = 'building';
    const r = next.getBoundingClientRect();
    agent.target = next;
    agent.phase = 'fly';
    agent.speed = 28 + Math.random() * 12;
    agent.tx = r.left + r.width * (0.3 + Math.random() * 0.4);
    agent.ty = r.top + Math.min(Math.max(r.height * 0.45, 12), 48);
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
    agent.clickUntil = performance.now() + 70;
    agent.target = null;
  }, []);

  const finishIfIdle = useCallback(() => {
    if (queueRef.current.length > 0) return;
    const busy = agentsRef.current.some(
      (a) => (a.phase === 'fly' && !!a.target) || a.phase === 'click'
    );
    if (busy) return;
    // Anyone still flying without a target should be leaving; wait until gone
    const stillVisible = agentsRef.current.some((a) => a.opacity > 0.08);
    if (stillVisible && agentsRef.current.some((a) => a.phase !== 'leave')) return;
    if (!heroDoneRef.current) heroDoneRef.current = true;
    clearAgentsSoon();
  }, [clearAgentsSoon]);

  const enqueue = useCallback((els: HTMLElement[]) => {
    for (const el of els) {
      if (el.dataset.buildState === 'ready') continue;
      if (queueRef.current.includes(el)) continue;
      queueRef.current.push(el);
    }
  }, []);

  const startHeroBuild = useCallback(() => {
    const hero = Array.from(
      document.querySelectorAll<HTMLElement>('[data-build="hero"]')
    ).filter(isPending);
    if (!hero.length) {
      heroDoneRef.current = true;
      return;
    }
    enqueue(hero);
    const from = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
    spawnAgents(Math.min(5, hero.length), from);
    agentsRef.current.forEach((agent, i) => {
      window.setTimeout(() => assignWork(agent), 90 + i * 55);
    });
  }, [assignWork, enqueue, spawnAgents]);

  const buildOnScroll = useCallback((el: HTMLElement) => {
    if (!heroDoneRef.current) return;
    const id = el.dataset.buildId || el.id || el.outerHTML.slice(0, 40);
    if (claimedIds.current.has(id)) return;
    if (el.dataset.buildState === 'ready' || el.dataset.buildState === 'building') return;

    // One element per scroll beat — feels like a person clicking things in
    const living = agentsRef.current.filter((a) => a.phase !== 'leave' && a.opacity > 0.1);
    if (activeRef.current && living.length > 0) {
      // Busy creating something else; leave this for a later intersection tick
      return;
    }

    claimedIds.current.add(id);
    enqueue([el]);

    const r = el.getBoundingClientRect();
    const from = {
      x: Math.min(window.innerWidth - 48, Math.max(48, r.left + r.width * 0.12)),
      y: Math.min(window.innerHeight - 48, Math.max(48, r.top + 12)),
    };
    // Single fast cursor feels more like a human scroll-click; second joins for bigger blocks
    const count = r.height > 80 ? 2 : 1;
    spawnAgents(count, from);
    agentsRef.current.forEach((agent, i) => {
      window.setTimeout(() => assignWork(agent), 16 + i * 30);
    });
  }, [assignWork, enqueue, spawnAgents]);

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

    const boot = window.setTimeout(() => startHeroBuild(), 260);
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-build].build-pending').forEach(markBuilt);
      heroDoneRef.current = true;
      clearAgentsSoon();
    }, 12000);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

        // Only kick the top-most pending element — sequential create-on-scroll
        for (const el of visible) {
          if (el.dataset.build === 'hero') continue;
          if (el.dataset.buildState === 'ready' || el.dataset.buildState === 'building') continue;
          buildOnScroll(el);
          break;
        }
      },
      { root: null, rootMargin: '0px 0px -12% 0px', threshold: [0.25, 0.4] }
    );

    const pumpPendingInView = () => {
      if (!heroDoneRef.current) return;
      if (activeRef.current) return;
      const pending = Array.from(
        document.querySelectorAll<HTMLElement>('[data-build]:not([data-build="hero"])')
      )
        .filter(isPending)
        .filter((el) => {
          const id = el.dataset.buildId || el.id;
          return !id || !claimedIds.current.has(id);
        })
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight * 0.88 && r.bottom > 40;
        })
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      if (pending[0]) buildOnScroll(pending[0]);
    };
    pumpPendingInViewRef.current = pumpPendingInView;

    const onScroll = () => pumpPendingInView();

    const observeTimer = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('[data-build]:not([data-build="hero"])')
        .forEach((el) => io.observe(el));
      window.addEventListener('scroll', onScroll, { passive: true });
    }, 900);

    let last = performance.now();
    let renderAccum = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      renderAccum += dt;

      if (activeRef.current) {
        for (const agent of agentsRef.current) {
          if (agent.phase === 'click') {
            if (now >= agent.clickUntil) {
              if (queueRef.current.length) assignWork(agent);
              else {
                agent.phase = 'leave';
                agent.speed = 34;
                agent.tx = agent.x + (Math.random() - 0.5) * 50;
                agent.ty = -90;
              }
            }
          } else {
            const dx = agent.tx - agent.x;
            const dy = agent.ty - agent.y;
            const dist = Math.hypot(dx, dy) || 1;
            // Fast travel
            const step = Math.min(dist, agent.speed * dt * 60 * 0.42);

            if (dist < 9) {
              if (agent.phase === 'fly' && agent.target) {
                createElement(agent);
              } else if (agent.phase === 'leave') {
                agent.opacity = 0;
              } else if (agent.phase === 'fly' && !agent.target) {
                // Idle burst particle — give it work or leave
                if (queueRef.current.length) assignWork(agent);
                else {
                  agent.phase = 'leave';
                  agent.ty = -90;
                  agent.speed = 34;
                }
              }
            } else {
              agent.x += (dx / dist) * step;
              agent.y += (dy / dist) * step;
              if (agent.phase !== 'leave' && Math.random() < 0.4) {
                agent.trail.push({ x: agent.x, y: agent.y, life: 1 });
                if (agent.trail.length > 6) agent.trail.shift();
              }
            }

            if (agent.phase === 'leave') {
              agent.opacity = Math.max(0, agent.opacity - dt * 5.5);
            }
          }

          for (let i = agent.trail.length - 1; i >= 0; i--) {
            agent.trail[i].life -= dt * 4;
            if (agent.trail[i].life <= 0) agent.trail.splice(i, 1);
          }
        }

        agentsRef.current = agentsRef.current.filter(
          (a) => !(a.phase === 'leave' && a.opacity <= 0.02)
        );

        for (let i = flashesRef.current.length - 1; i >= 0; i--) {
          flashesRef.current[i].life -= dt * 3;
          if (flashesRef.current[i].life <= 0) flashesRef.current.splice(i, 1);
        }
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          ripplesRef.current[i].life -= dt * 3.2;
          if (ripplesRef.current[i].life <= 0) ripplesRef.current.splice(i, 1);
        }

        finishIfIdle();
      }

      if (renderAccum > 1 / 45) {
        renderAccum = 0;
        if (activeRef.current || flashesRef.current.length || ripplesRef.current.length) {
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
      window.removeEventListener('scroll', onScroll);
    };
  }, [assignWork, buildOnScroll, clearAgentsSoon, createElement, finishIfIdle, startHeroBuild]);

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
