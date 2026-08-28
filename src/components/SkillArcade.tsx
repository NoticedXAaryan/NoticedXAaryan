import { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair, Heart, Play, RotateCcw, Zap } from 'lucide-react';
import { SKILL_TREE } from '../data/portfolioData';

type Orb = { x: number; y: number; vx: number; vy: number; radius: number; name: string; color: string };
type Shot = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Runtime = {
  playing: boolean;
  last: number;
  spawn: number;
  spawnEvery: number;
  playerX: number;
  score: number;
  lives: number;
  combo: number;
  orbs: Orb[];
  shots: Shot[];
  particles: Particle[];
};

const makeRuntime = (): Runtime => ({
  playing: true,
  last: performance.now(),
  spawn: 800,
  spawnEvery: 880,
  playerX: 640,
  score: 0,
  lives: 3,
  combo: 0,
  orbs: [],
  shots: [],
  particles: []
});

export default function SkillArcade() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Runtime>(makeRuntime());
  const heldRef = useRef({ left: false, right: false });
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0 });

  const fire = useCallback(() => {
    const state = runtimeRef.current;
    if (!state.playing || phase !== 'playing') return;
    state.shots.push({ x: state.playerX, y: 620 });
  }, [phase]);

  const start = useCallback(() => {
    runtimeRef.current = makeRuntime();
    setHud({ score: 0, lives: 3, combo: 0 });
    setPhase('playing');
    requestAnimationFrame(() => canvasRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent, value: boolean) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') heldRef.current.left = value;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') heldRef.current.right = value;
      if (value && (event.code === 'Space' || event.code === 'ArrowUp')) {
        event.preventDefault();
        fire();
      }
    };
    const down = (event: KeyboardEvent) => onKey(event, true);
    const up = (event: KeyboardEvent) => onKey(event, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [fire]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;

    const loop = (now: number) => {
      const state = runtimeRef.current;
      const dt = Math.min(now - state.last, 34);
      state.last = now;

      context.clearRect(0, 0, 1280, 720);
      const background = context.createLinearGradient(0, 0, 0, 720);
      background.addColorStop(0, '#090b12');
      background.addColorStop(1, '#050607');
      context.fillStyle = background;
      context.fillRect(0, 0, 1280, 720);
      context.strokeStyle = 'rgba(103,232,249,.05)';
      for (let x = 0; x < 1280; x += 64) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 720); context.stroke();
      }

      if (phase === 'playing' && state.playing) {
        if (heldRef.current.left) state.playerX -= dt * 0.72;
        if (heldRef.current.right) state.playerX += dt * 0.72;
        state.playerX = Math.max(34, Math.min(1246, state.playerX));

        state.spawn += dt;
        if (state.spawn >= state.spawnEvery) {
          state.spawn = 0;
          state.spawnEvery = Math.max(360, state.spawnEvery - 10);
          const skill = SKILL_TREE[Math.floor(Math.random() * SKILL_TREE.length)];
          state.orbs.push({
            x: 55 + Math.random() * 1170,
            y: -50,
            vx: (Math.random() - 0.5) * 0.16,
            vy: 0.18 + Math.random() * 0.12,
            radius: 32 + Math.random() * 14,
            name: skill.name,
            color: skill.color
          });
        }

        for (let index = state.shots.length - 1; index >= 0; index -= 1) {
          const shot = state.shots[index];
          shot.y -= dt * 1.25;
          if (shot.y < -20) state.shots.splice(index, 1);
        }

        for (let orbIndex = state.orbs.length - 1; orbIndex >= 0; orbIndex -= 1) {
          const orb = state.orbs[orbIndex];
          orb.x += orb.vx * dt;
          orb.y += orb.vy * dt;
          if (orb.x < orb.radius || orb.x > 1280 - orb.radius) orb.vx *= -1;

          let destroyed = false;
          for (let shotIndex = state.shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
            const shot = state.shots[shotIndex];
            if (Math.hypot(shot.x - orb.x, shot.y - orb.y) < orb.radius + 8) {
              state.shots.splice(shotIndex, 1);
              state.orbs.splice(orbIndex, 1);
              state.combo += 1;
              state.score += 10 * Math.min(state.combo, 8);
              for (let particle = 0; particle < 18; particle += 1) {
                state.particles.push({ x: orb.x, y: orb.y, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8, life: 1, color: orb.color });
              }
              setHud({ score: state.score, lives: state.lives, combo: state.combo });
              destroyed = true;
              break;
            }
          }
          if (destroyed) continue;
          if (orb.y > 760) {
            state.orbs.splice(orbIndex, 1);
            state.lives -= 1;
            state.combo = 0;
            setHud({ score: state.score, lives: state.lives, combo: 0 });
            if (state.lives <= 0) {
              state.playing = false;
              setPhase('over');
            }
          }
        }

        for (let index = state.particles.length - 1; index >= 0; index -= 1) {
          const particle = state.particles[index];
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.life -= dt * .0028;
          if (particle.life <= 0) state.particles.splice(index, 1);
        }
      }

      for (const orb of state.orbs) {
        context.shadowBlur = 24; context.shadowColor = orb.color;
        context.fillStyle = orb.color; context.beginPath(); context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2); context.fill();
        context.shadowBlur = 0; context.fillStyle = '#fff'; context.font = '700 14px Space Grotesk'; context.textAlign = 'center'; context.fillText(orb.name, orb.x, orb.y + 5);
      }
      for (const shot of state.shots) {
        context.fillStyle = '#67e8f9'; context.shadowBlur = 18; context.shadowColor = '#22d3ee'; context.fillRect(shot.x - 3, shot.y - 14, 6, 22); context.shadowBlur = 0;
      }
      for (const particle of state.particles) {
        context.globalAlpha = particle.life; context.fillStyle = particle.color; context.fillRect(particle.x, particle.y, 5, 5); context.globalAlpha = 1;
      }
      const pulse = 1 + Math.sin(now / 100) * .08;
      context.save(); context.translate(state.playerX, 650); context.scale(pulse, pulse);
      context.fillStyle = '#e4e4e7'; context.beginPath(); context.moveTo(0, -34); context.lineTo(26, 25); context.lineTo(0, 14); context.lineTo(-26, 25); context.closePath(); context.fill();
      context.fillStyle = '#22d3ee'; context.fillRect(-5, 16, 10, 18); context.restore();

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const movePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== 'playing') return;
    const rect = event.currentTarget.getBoundingClientRect();
    runtimeRef.current.playerX = ((event.clientX - rect.left) / rect.width) * 1280;
  };

  return (
    <section id="play" className="border-t border-white/10 bg-[#07080a] px-5 py-28 md:px-12">
      <div className="mx-auto mb-10 max-w-6xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-cyan-300">05 / Take a break</p>
        <h2 className="max-w-4xl text-5xl font-black tracking-[-0.055em] text-white md:text-8xl">Fast hands. Faster ideas.</h2>
        <p className="mt-5 max-w-xl text-lg text-zinc-400">Move to aim. Click or press Space to fire. Miss three and the stack wins.</p>
      </div>
      <div className="relative mx-auto aspect-video max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_40px_120px_rgba(0,0,0,.55)]">
        <canvas ref={canvasRef} width={1280} height={720} tabIndex={0} onPointerMove={movePointer} onPointerDown={fire} className="h-full w-full touch-none cursor-crosshair" aria-label="Skill shooter arcade game" />
        <div className="pointer-events-none absolute left-5 top-5 flex gap-3 md:left-7 md:top-7">
          <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-2 backdrop-blur"><span className="text-[10px] text-zinc-500">SCORE</span><p className="text-2xl font-black text-white">{hud.score}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-2 backdrop-blur"><span className="text-[10px] text-zinc-500">COMBO</span><p className="text-2xl font-black text-cyan-300">×{hud.combo}</p></div>
        </div>
        <div className="pointer-events-none absolute right-5 top-5 flex gap-1 rounded-xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur md:right-7 md:top-7">
          {Array.from({ length: 3 }, (_, index) => <Heart key={index} className={`h-5 w-5 ${index < hud.lives ? 'fill-rose-500 text-rose-500' : 'text-zinc-700'}`} />)}
        </div>
        {phase !== 'playing' && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center backdrop-blur-sm">
            <div>
              {phase === 'ready' ? <Crosshair className="mx-auto mb-5 h-14 w-14 text-cyan-300" /> : <Zap className="mx-auto mb-5 h-14 w-14 text-amber-300" />}
              <h3 className="text-4xl font-black text-white md:text-6xl">{phase === 'ready' ? 'BREAK THE STACK' : 'STACK OVERFLOW'}</h3>
              <p className="mx-auto mt-4 max-w-md text-zinc-400">{phase === 'ready' ? 'Instant play—no camera permission, no loading model, no sluggish controls.' : `You scored ${hud.score}. Your combo peaked at ${hud.combo}.`}</p>
              <button type="button" onClick={start} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-bold text-black transition-transform hover:scale-105">
                {phase === 'ready' ? <Play className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />} {phase === 'ready' ? 'Play now' : 'Run it back'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
