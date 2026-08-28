import { AnimatePresence, motion } from 'motion/react';
import {
  Activity, BatteryFull, BookOpen, Box, ChevronRight, CircleUserRound, Code2, ExternalLink,
  FileCode2, Folder, Github, Globe2, Maximize2, Minus, MonitorCog, Palette, Search, Settings,
  TerminalSquare, Volume2, Wifi, X
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Dock, { type DockItem } from '../components/reactbits/Dock';
import { LINKEDIN_PROFILE } from '../data/profileData';
import { useGitHubData } from '../hooks/useGitHubData';

type AppId = 'about' | 'projects' | 'terminal' | 'files' | 'browser' | 'monitor' | 'settings';
type OpenWindow = { id: AppId; minimized: boolean; maximized: boolean; z: number };
type Accent = 'cyan' | 'violet' | 'amber';

const appMeta: Record<AppId, { title: string; subtitle: string }> = {
  about: { title: 'About Aaryan', subtitle: 'identity.profile' },
  projects: { title: 'Project Vault', subtitle: 'github://NoticedXAaryan' },
  terminal: { title: 'Alacritty', subtitle: 'aaryan@arch:~' },
  files: { title: 'Thunar', subtitle: '/home/aaryan' },
  browser: { title: 'Field Notes', subtitle: 'aaryan://bookmarks' },
  monitor: { title: 'System Monitor', subtitle: 'btop — personal runtime' },
  settings: { title: 'Appearance', subtitle: '~/.config/hypr' }
};

const appIcon = (id: AppId, className = 'h-6 w-6') => {
  const icons = { about: CircleUserRound, projects: Code2, terminal: TerminalSquare, files: Folder, browser: Globe2, monitor: Activity, settings: Settings };
  const Icon = icons[id];
  return <Icon className={className} />;
};

function ArchMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 5 8 57c7-5 14-8 21-9l3-12 3 12c7 1 14 4 21 9L32 5Z" fill="currentColor" />
      <path d="m32 17-5 12 5-3 5 3-5-12Z" fill="#080b10" />
    </svg>
  );
}

function TerminalApp() {
  const [lines, setLines] = useState<string[]>(['Arch Linux 6.16.3-arch1-1', 'Type “help” to explore this machine.']);
  const [command, setCommand] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const run = (event: FormEvent) => {
    event.preventDefault();
    const normalized = command.trim().toLowerCase();
    const output: Record<string, string[]> = {
      help: ['about · projects · neofetch · github · linkedin · story · clear'],
      about: ['Aaryan Kumar Tiwari — founder, AI builder, systems thinker.', 'Current quest: make ambitious technology feel useful and human.'],
      projects: ['SamjhoAI  Rusty  Calmant  NanoLLM  JanSevak  Ozone'],
      neofetch: ['       /\\        aaryan@arch', '      /  \\       OS: Arch Linux x86_64', '     / /\\ \\      WM: Hyprland', '    / ____ \\     Shell: zsh', '   /_/    \\_\\    Focus: AI · systems · product'],
      github: ['Opening github.com/NoticedXAaryan…'],
      linkedin: ['Opening linkedin.com/in/noticedxaaryan…'],
      story: ['Switching to the story experience…']
    };
    if (normalized === 'clear') setLines([]);
    else {
      setLines(previous => [...previous, `❯ ${command}`, ...(output[normalized] ?? [`zsh: command not found: ${normalized || '…'}`])]);
      if (normalized === 'github') window.open('https://github.com/NoticedXAaryan', '_blank', 'noopener,noreferrer');
      if (normalized === 'linkedin') window.open(LINKEDIN_PROFILE.url, '_blank', 'noopener,noreferrer');
      if (normalized === 'story') window.location.href = '/story';
    }
    setCommand('');
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <div className="flex h-full flex-col bg-[#080a0c] p-5 font-mono text-sm text-zinc-300">
      <div className="flex-1 overflow-y-auto leading-7">
        {lines.map((line, index) => <p key={`${line}-${index}`} className={line.startsWith('❯') ? 'text-cyan-300' : ''}>{line}</p>)}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={run} className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
        <span className="text-cyan-300">❯</span>
        <input value={command} onChange={event => setCommand(event.target.value)} autoFocus spellCheck={false} aria-label="Terminal command" className="min-w-0 flex-1 bg-transparent outline-none" placeholder="help" />
      </form>
    </div>
  );
}

function AboutApp() {
  const { profile, isLive } = useGitHubData();
  return (
    <div className="h-full overflow-y-auto bg-[#0d1016] p-6 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <img src={profile.avatar_url} alt="Aaryan Kumar Tiwari" className="h-28 w-28 rounded-3xl border border-white/10 object-cover" />
        <div><p className="font-mono text-xs uppercase tracking-[.24em] text-cyan-300">{isLive ? 'GitHub connected' : 'Local identity cache'}</p><h2 className="mt-2 text-4xl font-black tracking-[-.05em] text-white">Aaryan Kumar Tiwari</h2><p className="mt-2 text-zinc-400">Founder · AI builder · systems thinker</p></div>
      </div>
      <p className="mt-10 max-w-3xl text-xl leading-8 text-zinc-300">I build across layers: interfaces people can trust, AI that solves real problems, and the lower-level systems that make everything possible.</p>
      <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
        {[
          ['Now', 'Founder at Blendable3D'], ['Also building', 'Picobooth LLP'],
          ['Education', 'BCA (Hons), Parul University'], ['Home', LINKEDIN_PROFILE.location]
        ].map(([term, value]) => <div key={term} className="bg-[#10141b] p-5"><dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{term}</dt><dd className="mt-2 text-zinc-100">{value}</dd></div>)}
      </dl>
    </div>
  );
}

function ProjectsApp() {
  const { repositories, isLive } = useGitHubData();
  return (
    <div className="h-full overflow-y-auto bg-[#0c0f14] p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-2xl font-bold text-white">Pinned work</h2><p className="text-sm text-zinc-500">{isLive ? 'Live GitHub metadata' : 'Offline project snapshot'}</p></div><Github className="h-7 w-7 text-zinc-500" /></div>
      <div className="grid gap-3 md:grid-cols-2">
        {repositories.map(repository => (
          <a key={repository.id} href={repository.html_url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-cyan-300/40 hover:bg-white/[.06]">
            <div className="flex items-start justify-between"><FileCode2 className="h-6 w-6 text-cyan-300" /><ExternalLink className="h-4 w-4 text-zinc-600 group-hover:text-white" /></div>
            <h3 className="mt-5 text-xl font-bold text-white">{repository.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{repository.description}</p>
            <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><span className="h-2 w-2 rounded-full bg-cyan-300" />{repository.language ?? 'Research'}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function FilesApp() {
  const folders = [
    ['projects', 'Six public builds and many experiments'], ['notes', 'Ideas, product questions, sketches'],
    ['models', 'NanoLLM checkpoints and research'], ['companies', 'Blendable3D · Picobooth LLP'], ['README.md', 'The story behind the machine']
  ];
  return <div className="h-full bg-[#101319] p-5"><div className="mb-5 flex items-center gap-2 rounded-xl bg-black/30 px-4 py-3 font-mono text-xs text-zinc-500"><span className="text-cyan-300">~</span> /home/aaryan</div>{folders.map(([name, detail], index) => <div key={name} className="flex items-center gap-4 border-b border-white/[.07] px-2 py-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.05] text-cyan-300">{index === folders.length - 1 ? <FileCode2 className="h-5 w-5" /> : <Folder className="h-5 w-5 fill-cyan-300/20" />}</div><div><p className="font-medium text-white">{name}</p><p className="text-xs text-zinc-500">{detail}</p></div><ChevronRight className="ml-auto h-4 w-4 text-zinc-700" /></div>)}</div>;
}

function NotesApp() {
  return <div className="h-full overflow-y-auto bg-[#e8e3d5] p-7 text-[#202124] md:p-12"><p className="font-mono text-[10px] uppercase tracking-[.3em] text-zinc-500">Field notes / pinned</p><h2 className="mt-5 text-5xl font-black tracking-[-.06em]">What I care about.</h2><div className="mt-10 space-y-8 text-lg leading-8"><p><strong>Accessibility is infrastructure.</strong> SamjhoAI started with a simple conviction: communication tools should adapt to people, not exclude them.</p><p><strong>Small models are interesting.</strong> NanoLLM is my way of understanding language models from the tensor upward, not only through an API.</p><p><strong>Languages shape thought.</strong> Rusty and Ozone are explorations in compiler design, safety, and how better abstractions become real machines.</p><p><strong>Products need personality.</strong> The best software should feel unmistakably made by someone.</p></div></div>;
}

function MonitorApp() {
  const stats = [['curiosity', 96], ['shipping', 84], ['low-level depth', 78], ['design instinct', 87], ['sleep', 42]];
  return <div className="h-full bg-[#080b0e] p-7 font-mono"><div className="mb-8 grid grid-cols-3 gap-3">{[['UPTIME', '18 years'], ['REPOS', '21+'], ['STATUS', 'building']].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-[10px] text-zinc-600">{label}</p><p className="mt-2 text-lg text-cyan-300">{value}</p></div>)}</div>{stats.map(([label, value]) => <div key={label as string} className="mb-6"><div className="mb-2 flex justify-between text-xs text-zinc-400"><span>{label}</span><span>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: .8 }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-400" /></div></div>)}</div>;
}

function SettingsApp({ accent, setAccent }: { accent: Accent; setAccent: (accent: Accent) => void }) {
  return <div className="h-full bg-[#11141a] p-7"><h2 className="text-2xl font-bold text-white">Appearance</h2><p className="mt-1 text-sm text-zinc-500">Hyprland profile: aaryan.conf</p><p className="mt-8 font-mono text-xs uppercase tracking-widest text-zinc-500">Accent colour</p><div className="mt-4 flex gap-4">{(['cyan', 'violet', 'amber'] as Accent[]).map(value => <button key={value} onClick={() => setAccent(value)} aria-label={`Use ${value} accent`} className={`h-12 w-12 rounded-2xl border-2 ${accent === value ? 'border-white' : 'border-transparent'} ${value === 'cyan' ? 'bg-cyan-400' : value === 'violet' ? 'bg-violet-500' : 'bg-amber-400'}`} />)}</div><div className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-sm text-zinc-300">This desktop is intentionally Arch, not a macOS skin: pacman-style packages, Hyprland conventions, terminal-first navigation, and a modular workspace.</p></div></div>;
}

export default function ArchDesktop() {
  const [time, setTime] = useState(new Date());
  const [windows, setWindows] = useState<OpenWindow[]>([{ id: 'about', minimized: false, maximized: false, z: 1 }]);
  const [launcher, setLauncher] = useState(false);
  const [query, setQuery] = useState('');
  const [accent, setAccent] = useState<Accent>('cyan');
  const desktopRef = useRef<HTMLDivElement>(null);
  const accentClass = accent === 'cyan' ? 'text-cyan-300' : accent === 'violet' ? 'text-violet-300' : 'text-amber-300';

  useEffect(() => { const timer = window.setInterval(() => setTime(new Date()), 1000); return () => window.clearInterval(timer); }, []);

  const open = (id: AppId) => setWindows(previous => {
    const highest = Math.max(0, ...previous.map(item => item.z)) + 1;
    const exists = previous.some(item => item.id === id);
    return exists ? previous.map(item => item.id === id ? { ...item, minimized: false, z: highest } : item) : [...previous, { id, minimized: false, maximized: false, z: highest }];
  });
  const focus = (id: AppId) => setWindows(previous => { const z = Math.max(...previous.map(item => item.z), 0) + 1; return previous.map(item => item.id === id ? { ...item, z } : item); });
  const close = (id: AppId) => setWindows(previous => previous.filter(item => item.id !== id));
  const toggle = (id: AppId, key: 'minimized' | 'maximized') => setWindows(previous => previous.map(item => item.id === id ? { ...item, [key]: !item[key] } : item));

  const renderApp = (id: AppId) => {
    if (id === 'about') return <AboutApp />;
    if (id === 'projects') return <ProjectsApp />;
    if (id === 'terminal') return <TerminalApp />;
    if (id === 'files') return <FilesApp />;
    if (id === 'browser') return <NotesApp />;
    if (id === 'monitor') return <MonitorApp />;
    return <SettingsApp accent={accent} setAccent={setAccent} />;
  };

  const ids = Object.keys(appMeta) as AppId[];
  const filtered = ids.filter(id => appMeta[id].title.toLowerCase().includes(query.toLowerCase()));
  const dockItems: DockItem[] = useMemo(() => ids.slice(0, 5).map(id => ({ id, label: appMeta[id].title, icon: appIcon(id), active: windows.some(item => item.id === id && !item.minimized), onClick: () => open(id) })), [windows]);

  return (
    <div ref={desktopRef} id="arch-desktop" className="relative h-[100dvh] overflow-hidden bg-[#080b10] text-zinc-100 selection:bg-cyan-300 selection:text-black">
      <div className={`absolute inset-0 ${accent === 'cyan' ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.18),transparent_28%),radial-gradient(circle_at_82%_75%,rgba(59,130,246,.16),transparent_32%)]' : accent === 'violet' ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,.2),transparent_28%),radial-gradient(circle_at_82%_75%,rgba(236,72,153,.12),transparent_32%)]' : 'bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,.18),transparent_28%),radial-gradient(circle_at_82%_75%,rgba(249,115,22,.12),transparent_32%)]'}`} />
      <div className="absolute inset-0 opacity-[.025] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />

      <header className="absolute inset-x-3 top-3 z-[90] flex h-10 items-center rounded-xl border border-white/10 bg-[#0b0e14]/80 px-3 text-xs shadow-xl backdrop-blur-2xl">
        <button onClick={() => setLauncher(value => !value)} className={`flex items-center gap-2 font-bold ${accentClass}`}><ArchMark className="h-5 w-5" /> Applications</button>
        <div className="ml-5 hidden gap-2 md:flex">{[1, 2, 3, 4].map(number => <button key={number} className={`h-6 w-7 rounded-md ${number === 1 ? 'bg-white/15 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}>{number}</button>)}</div>
        <button className="absolute left-1/2 -translate-x-1/2 font-mono text-zinc-300">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</button>
        <div className="ml-auto flex items-center gap-3 text-zinc-400"><Wifi className="h-4 w-4" /><Volume2 className="hidden h-4 w-4 sm:block" /><BatteryFull className="h-4 w-4" /></div>
      </header>

      <div className="absolute left-5 top-20 z-10 grid gap-4">
        {(['projects', 'terminal', 'files'] as AppId[]).map(id => <button key={id} onDoubleClick={() => open(id)} onClick={() => matchMedia('(pointer: coarse)').matches && open(id)} className="group flex w-20 flex-col items-center gap-2 rounded-xl p-2 text-xs text-zinc-300 hover:bg-white/5"><span className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#111620]/90 shadow-xl ${accentClass}`}>{appIcon(id)}</span>{appMeta[id].title.split(' ')[0]}</button>)}
      </div>

      <AnimatePresence>
        {launcher && <motion.div initial={{ opacity: 0, y: -10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .98 }} className="absolute left-3 top-16 z-[100] w-[min(92vw,420px)] rounded-3xl border border-white/15 bg-[#0c1017]/95 p-4 shadow-2xl backdrop-blur-3xl"><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"><Search className="h-4 w-4 text-zinc-500" /><input value={query} onChange={event => setQuery(event.target.value)} autoFocus placeholder="Search applications" className="w-full bg-transparent text-sm outline-none" /></div><div className="mt-3 grid grid-cols-2 gap-2">{filtered.map(id => <button key={id} onClick={() => { open(id); setLauncher(false); }} className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-white/10"><span className={accentClass}>{appIcon(id, 'h-5 w-5')}</span><span><b className="block text-sm text-white">{appMeta[id].title}</b><small className="text-zinc-600">{appMeta[id].subtitle}</small></span></button>)}</div><a href="/story" className="mt-3 flex items-center justify-between border-t border-white/10 px-3 pt-4 text-sm text-zinc-400 hover:text-white"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Read the story</span><ChevronRight className="h-4 w-4" /></a></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {windows.filter(item => !item.minimized).map((item, index) => (
          <motion.section
            key={item.id}
            drag={!item.maximized}
            dragConstraints={desktopRef}
            dragMomentum={false}
            onPointerDown={() => focus(item.id)}
            initial={{ opacity: 0, scale: .94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: 20 }}
            style={{ zIndex: item.z + 20, left: item.maximized ? 12 : `${15 + index * 5}%`, top: item.maximized ? 62 : `${12 + index * 5}%` }}
            className={`absolute flex flex-col overflow-hidden border border-white/15 bg-[#0d1118] shadow-[0_35px_110px_rgba(0,0,0,.65)] ${item.maximized ? 'right-3 bottom-24 rounded-2xl' : 'h-[min(68vh,620px)] w-[min(84vw,820px)] rounded-2xl'}`}
          >
            <div className="flex h-12 shrink-0 cursor-grab items-center border-b border-white/10 bg-[#151a22] px-4 active:cursor-grabbing">
              <span className={accentClass}>{appIcon(item.id, 'h-4 w-4')}</span><div className="ml-3"><p className="text-xs font-semibold text-zinc-200">{appMeta[item.id].title}</p><p className="text-[9px] text-zinc-600">{appMeta[item.id].subtitle}</p></div>
              <div className="ml-auto flex gap-1"><button onClick={() => toggle(item.id, 'minimized')} className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white/10 hover:text-white" aria-label="Minimize"><Minus className="h-4 w-4" /></button><button onClick={() => toggle(item.id, 'maximized')} className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white/10 hover:text-white" aria-label="Maximize"><Maximize2 className="h-3.5 w-3.5" /></button><button onClick={() => close(item.id)} className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-rose-500/20 hover:text-rose-300" aria-label="Close"><X className="h-4 w-4" /></button></div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">{renderApp(item.id)}</div>
          </motion.section>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 z-[90] -translate-x-1/2"><Dock items={dockItems} /></div>
      <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 font-mono text-[10px] text-zinc-500 backdrop-blur md:flex"><MonitorCog className="h-3.5 w-3.5" /> ARCH / HYPRLAND / AARYAN</div>
    </div>
  );
}
