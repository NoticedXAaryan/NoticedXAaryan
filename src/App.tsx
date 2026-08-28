import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, useAnimationFrame, useMotionTemplate, useInView, useDragControls } from 'motion/react';
import { ExternalLink, ArrowRight, Trophy, Code2, Github, Twitter, Linkedin, Mail, Terminal, Cpu, Globe, Briefcase, ArrowUpRight, Play, RotateCcw, Camera, XCircle, Folder, FileText, Minus, Maximize2, Monitor, Send } from 'lucide-react';
import type { HandLandmarker as HandLandmarkerInstance } from '@mediapipe/tasks-vision';
import FeaturedProjects from './components/FeaturedProjects';
import ProfileOverview from './components/ProfileOverview';
import BlurText from './components/reactbits/BlurText';
import { HAND_CONNECTIONS, SKILL_TREE, WHAT_I_DO_ROWS } from './data/portfolioData';
import { useGitHubData } from './hooks/useGitHubData';
import type {
  AppUiState,
  DesktopIconProps,
  DesktopWindow,
  DockIconProps,
  ExplorerItem,
  GameRuntimeState,
  GitHubRepo,
  HandPoint,
  OSWindowProps,
  SkillNode
} from './types/app';

// --- COMPONENTS ---

// 0. Galaxy Background
function GalaxyBackground() {
  const [stars, setStars] = useState<{id: number, top: string, left: string, size: number, delay: number, duration: number}[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      <motion.div 
        className="absolute w-[200vw] h-[200vw] opacity-30"
        style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
          backgroundSize: '300px 300px'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      />
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_80%)]" />
    </div>
  );
}

// 1. Custom Cursor
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        if (target.closest('#macos')) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
          if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('.interactive')) {
            setIsHovering(true);
          } else {
            setIsHovering(false);
          }
        }
      }
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <motion.div
      className="custom-cursor fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-white pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
      style={{ x: cursorXSpring, y: cursorYSpring }}
      animate={{ 
        scale: isHovering ? 2 : 1,
        backgroundColor: isHovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
        opacity: isHidden ? 0 : 1
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="w-1 h-1 bg-white rounded-full"
        animate={{ opacity: isHovering ? 0 : 1 }}
      />
    </motion.div>
  );
}

// 2. Magnetic Link
function MagneticLink({ children, className, href }: { children: React.ReactNode, className?: string, href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`interactive relative ${className}`}
    >
      {children}
    </motion.a>
  );
}

function OSExperience() {
  const [windows, setWindows] = useState<DesktopWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const constraintsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openWindow = (id: string, title: string, content?: React.ReactNode) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        if (existing.isMinimized) {
          return prev.map(w => w.id === id ? { ...w, isMinimized: false } : w);
        }
        return prev;
      }
      return [...prev, { id, title, content, isMaximized: false, isMinimized: false }];
    });
    setActiveWindow(id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindow(prev => prev === id ? null : prev);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindow(prev => prev === id ? null : prev);
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const bringToFront = (id: string) => {
    setActiveWindow(id);
  };

  return (
    <section className="h-screen w-full relative bg-zinc-950 overflow-hidden flex items-center justify-center p-4 md:p-8 snap-center" id="macos">
      {/* Monitor Frame */}
      <div className="w-full h-full max-w-[1600px] mx-auto bg-black rounded-2xl md:rounded-3xl border-[4px] md:border-[8px] border-[#1a1a1a] relative overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_30px_100px_rgba(0,0,0,0.9)] flex flex-col ring-1 ring-white/5">
        
        {/* Screen Content with Animated Background */}
        <div ref={constraintsRef} className="flex-1 relative overflow-hidden rounded-xl md:rounded-2xl m-1 md:m-1.5 border border-white/10 bg-black isolate">
          {/* Animated Wallpaper */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center"
          />

          {/* Menu Bar */}
          <div className="absolute top-0 left-0 w-full h-7 bg-black/20 backdrop-blur-2xl border-b border-white/10 flex items-center px-4 text-[13px] font-medium text-white/90 z-50 rounded-t-xl md:rounded-t-2xl pointer-events-none">
            <div className="font-bold mr-4 text-sm drop-shadow-md">A</div>
            <div className="font-bold mr-4 drop-shadow-md">Finder</div>
            <div className="mr-4 hidden sm:block drop-shadow-md">File</div>
            <div className="mr-4 hidden sm:block drop-shadow-md">Edit</div>
            <div className="mr-4 hidden sm:block drop-shadow-md">View</div>
            <div className="mr-4 hidden sm:block drop-shadow-md">Go</div>
            <div className="mr-4 hidden sm:block drop-shadow-md">Window</div>
            <div className="mr-4 hidden sm:block drop-shadow-md">Help</div>
            <div className="ml-auto flex items-center gap-4 drop-shadow-md">
              <span className="hidden md:inline-block">100%</span>
              <span>{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="absolute top-12 right-4 flex flex-col gap-4 items-end z-10">
            <DesktopIcon 
              icon={<Folder className="w-12 h-12 text-cyan-400 fill-cyan-400/20 drop-shadow-lg" />} 
              label="Projects" 
              onDoubleClick={() => openWindow('projects', 'Projects')} 
            />
            <DesktopIcon 
              icon={<FileText className="w-12 h-12 text-white drop-shadow-lg" />} 
              label="About.txt" 
              onDoubleClick={() => openWindow('about', 'About.txt', <AboutText />)} 
            />
            <DesktopIcon 
              icon={<Linkedin className="w-12 h-12 text-blue-500 drop-shadow-lg" />} 
              label="LinkedIn" 
              onDoubleClick={() => window.open('https://www.linkedin.com/in/noticedxaaryan', '_blank')} 
            />
            <DesktopIcon 
              icon={<Github className="w-12 h-12 text-white drop-shadow-lg" />} 
              label="GitHub" 
              onDoubleClick={() => window.open('https://github.com/NoticedxAaryan', '_blank')} 
            />
            <DesktopIcon 
              icon={<Mail className="w-12 h-12 text-white drop-shadow-lg" />} 
              label="Mail" 
              onDoubleClick={() => openWindow('mail', 'Mail', <MailApp />)} 
            />
          </div>

          {/* Windows */}
          <AnimatePresence>
            {windows.map((win, index) => {
              const content = win.id === 'projects' ? <FileExplorer openWindow={openWindow} /> : win.content;
              return (
                <OSWindow 
                  key={win.id}
                  win={{ ...win, content }}
                  index={index}
                  isActive={activeWindow === win.id}
                  onClose={() => closeWindow(win.id)}
                  onMinimize={() => minimizeWindow(win.id)}
                  onMaximize={() => toggleMaximize(win.id)}
                  onFocus={() => bringToFront(win.id)}
                  constraintsRef={constraintsRef}
                />
              );
            })}
          </AnimatePresence>

          {/* Dock */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl p-2 flex items-center gap-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
            <DockIcon icon={<Folder className="w-10 h-10 text-cyan-400 fill-cyan-400/20" />} label="Projects" onClick={() => openWindow('projects', 'Projects')} isOpen={windows.some(w => w.id === 'projects')} />
            <DockIcon icon={<Linkedin className="w-10 h-10 text-blue-500" />} label="LinkedIn" onClick={() => window.open('https://www.linkedin.com/in/noticedxaaryan', '_blank')} />
            <DockIcon icon={<Github className="w-10 h-10 text-white" />} label="GitHub" onClick={() => window.open('https://github.com/NoticedxAaryan', '_blank')} />
            <div className="w-px h-10 bg-white/20 mx-1" />
            <DockIcon icon={<Mail className="w-10 h-10 text-white" />} label="Mail" onClick={() => openWindow('mail', 'Mail', <MailApp />)} isOpen={windows.some(w => w.id === 'mail')} />
            <DockIcon icon={<Terminal className="w-10 h-10 text-zinc-800" />} label="Terminal" onClick={() => openWindow('terminal', 'Terminal', <TerminalApp />)} isOpen={windows.some(w => w.id === 'terminal')} />
            
            {/* Dynamic Windows */}
            {windows.filter(w => !['projects', 'mail', 'terminal'].includes(w.id)).map(win => (
              <DockIcon 
                key={win.id} 
                icon={<FileText className="w-10 h-10 text-white" />} 
                label={win.title} 
                onClick={() => openWindow(win.id, win.title)} 
                isOpen={true} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
  return (
    <motion.div 
      drag 
      dragMomentum={false}
      onDoubleClick={onDoubleClick}
      className="flex flex-col items-center gap-1 cursor-pointer w-24 group"
    >
      <div className="p-2 rounded-lg group-hover:bg-white/10 transition-colors border border-transparent group-hover:border-white/10">
        {icon}
      </div>
      <span className="text-white text-[12px] font-medium text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1.5 py-0.5 rounded group-hover:bg-emerald-500/80 group-hover:text-white transition-colors">
        {label}
      </span>
    </motion.div>
  );
}

function DockIcon({ icon, label, onClick, isOpen }: DockIconProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.2, y: -10 }}
      onClick={onClick}
      className="w-12 h-12 bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 rounded-xl flex items-center justify-center cursor-pointer relative group border border-white/20 shadow-lg transition-colors"
    >
      {icon}
      <span className="absolute -top-12 bg-black/50 backdrop-blur-md text-white text-[13px] font-medium px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl z-50">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/50 rotate-45 border-r border-b border-white/10" />
      </span>
      {isOpen && <div className="absolute -bottom-2 w-1 h-1 bg-white/80 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />}
    </motion.div>
  );
}

function OSWindow({ win, isActive, onClose, onMinimize, onMaximize, onFocus, constraintsRef, index }: OSWindowProps) {
  const dragControls = useDragControls();

  if (win.isMinimized) return null;

  return (
    <motion.div
      drag={!win.isMaximized}
      dragConstraints={constraintsRef}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        x: win.isMaximized ? 0 : undefined,
        y: win.isMaximized ? 0 : undefined,
      }}
      exit={{ scale: 0.95, opacity: 0 }}
      onMouseDown={onFocus}
      style={{ 
        zIndex: isActive ? 40 : 30,
        ...(win.isMaximized ? {} : {
          marginTop: `${(index || 0) * 30}px`,
          marginLeft: `${(index || 0) * 30}px`
        })
      }}
      className={`absolute overflow-hidden flex flex-col transition-[width,height,top,left,border-radius] duration-300 ease-in-out transform-gpu
        ${win.isMaximized 
          ? 'top-[28px] left-0 w-full h-[calc(100%-28px)] rounded-none' 
          : 'top-[10vh] left-[5vw] md:left-[calc(50%-425px)] md:top-[calc(50%-275px)] w-[90vw] max-w-[850px] h-[60vh] md:h-[550px] rounded-xl'
        }
        bg-[#1c1c1e]/80 backdrop-blur-3xl border border-white/10 
        ${isActive ? 'shadow-[0_30px_60px_-12px_rgba(0,0,0,1)]' : 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]'}
      `}
    >
      {/* Titlebar */}
      <div 
        className="titlebar h-12 flex items-center px-4 cursor-grab active:cursor-grabbing relative z-10 bg-white/5 border-b border-white/5"
        onPointerDown={(event) => {
          if (!win.isMaximized) dragControls.start(event);
        }}
        onDoubleClick={(e) => { e.stopPropagation(); onMaximize(); }}
      >
        <div className="flex gap-2 absolute left-4">
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 flex items-center justify-center group border border-black/20 shadow-sm"
          >
            <XCircle className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 flex items-center justify-center group border border-black/20 shadow-sm"
          >
            <Minus className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }} 
            className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 flex items-center justify-center group border border-black/20 shadow-sm"
          >
            <Maximize2 className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="flex-1 text-center text-white/70 text-sm font-medium pointer-events-none select-none">
          {win.title}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex bg-black/20">
        {win.content}
      </div>
    </motion.div>
  );
}

function FileExplorer({ openWindow }: { openWindow: (id: string, title: string, content: React.ReactNode) => void }) {
  const [currentPath, setCurrentPath] = useState('Projects');
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPath === 'Projects' && githubRepos.length === 0) {
      setLoading(true);
      fetch('https://api.github.com/users/NoticedxAaryan/repos?sort=updated&per_page=15')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setGithubRepos(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [currentPath]);
  
  const fileSystem: Record<string, ExplorerItem[]> = {
    'Home': [
      { name: 'Desktop', type: 'folder', icon: Monitor, action: () => setCurrentPath('Desktop') },
      { name: 'Documents', type: 'folder', icon: FileText, action: () => setCurrentPath('Documents') },
      { name: 'Projects', type: 'folder', icon: Folder, action: () => setCurrentPath('Projects') },
    ],
    'Desktop': [
      { name: 'About.txt', type: 'file', icon: FileText, action: () => openWindow('about', 'About.txt', <AboutText />) },
    ],
    'Documents': [
      { name: 'Resume.pdf', type: 'file', icon: FileText, action: () => window.open('#', '_blank') },
    ],
    'Projects': githubRepos.map((repo) => ({
      name: repo.name,
      type: 'file' as const,
      icon: Code2,
      action: () => window.open(repo.html_url, '_blank')
    }))
  };

  const contents = fileSystem[currentPath] || [];

  return (
    <div className="flex w-full h-full bg-[#1e1e1e] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 bg-[#252526] border-r border-white/10 p-2 flex flex-col gap-1 hidden sm:flex">
        <div className="text-[11px] font-semibold text-white/50 px-2 py-1 mb-1 uppercase tracking-wider">Favorites</div>
        {['Home', 'Desktop', 'Documents', 'Projects'].map(path => (
          <div 
            key={path}
            onClick={() => setCurrentPath(path)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-colors ${currentPath === path ? 'bg-[#37373d] text-white' : 'text-white/70 hover:bg-[#2a2d2e]'}`}
          >
            {path === 'Home' ? <Monitor className="w-4 h-4" /> : path === 'Projects' ? <Folder className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4" />} 
            {path}
          </div>
        ))}
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-[#1e1e1e]">
          <div className="flex gap-2">
            <button onClick={() => setCurrentPath('Home')} className="text-white/50 hover:text-white"><ArrowRight className="w-4 h-4 rotate-180" /></button>
          </div>
          <div className="text-sm font-medium">{currentPath}</div>
        </div>
        <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 content-start overflow-y-auto custom-scrollbar">
          {loading && currentPath === 'Projects' ? (
            <div className="col-span-full text-center text-white/50 text-sm mt-10">Loading repositories from GitHub...</div>
          ) : contents.map((item, i) => (
            <div key={i} onDoubleClick={item.action} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer group">
              <item.icon className={`w-12 h-12 ${item.type === 'folder' ? 'text-cyan-400 fill-cyan-400/20' : 'text-white/80'}`} />
              <span className="text-xs text-center break-words w-full line-clamp-2 group-hover:text-white text-white/90">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutText() {
  return (
    <div className="font-mono text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
      {`Hi, I'm Aaryan.

I am a developer focused on performance, precision, and scale.
My work spans across crafting high-fidelity web interfaces, training machine learning models, and designing low-level system architectures.

I believe in writing code that is not just functional, but elegant and robust. Every project is an opportunity to push boundaries and build something meaningful.

Skills:
- Frontend: React, TypeScript, Tailwind, Framer Motion, WebGL
- Backend: Node.js, Go, Rust, PostgreSQL, Redis
- AI/ML: Python, PyTorch, TensorRT
- Systems: C++, Linux, Docker, AWS

Contact: noticedxaaryan@gmail.com`}
    </div>
  );
}

function TerminalApp() {
  const [history, setHistory] = useState<{cmd: string, output: React.ReactNode}[]>([
    { cmd: '', output: 'AaryanOS v1.0.0\nType "help" for a list of available commands.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    
    setInput('');
    let output: React.ReactNode = '';
    const args = cmd.toLowerCase().split(' ');

    switch (args[0]) {
      case 'help':
        output = (
          <div className="grid grid-cols-[100px_1fr] gap-2 mt-1">
            <span className="text-cyan-400">help</span><span>Show this help message</span>
            <span className="text-cyan-400">about</span><span>About Aaryan</span>
            <span className="text-cyan-400">skills</span><span>List technical skills</span>
            <span className="text-cyan-400">projects</span><span>List projects</span>
            <span className="text-cyan-400">clear</span><span>Clear terminal</span>
            <span className="text-cyan-400">date</span><span>Show current date</span>
            <span className="text-cyan-400">echo</span><span>Print text</span>
          </div>
        );
        break;
      case 'about':
        output = "Hi, I'm Aaryan. A Systems Architect & Full-Stack Developer passionate about building robust, scalable software.";
        break;
      case 'skills':
        output = "Languages: TypeScript, Python, Rust, C++\nTechnologies: React, Node.js, WebGL, Docker, AWS";
        break;
      case 'projects':
        output = "1. Ethereal Engine (WebGL)\n2. Neural Nexus (AI)\n3. Quantum Ledger (Rust)";
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'date':
        output = new Date().toString();
        break;
      case 'echo':
        output = args.slice(1).join(' ');
        break;
      default:
        output = `Command not found: ${args[0]}. Type "help" for a list of commands.`;
    }

    setHistory(prev => [...prev, { cmd, output }]);
  };

  return (
    <div className="font-mono text-xs md:text-sm h-full flex flex-col bg-zinc-950/90 text-zinc-300 p-6 md:p-8">
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 whitespace-pre-wrap">
        {history.map((item, i) => (
          <div key={i}>
            {item.cmd && <div className="text-zinc-400 flex gap-2">
              <span className="text-green-400">guest@aaryan-os:~$</span>
              <span className="text-white">{item.cmd}</span>
            </div>}
            <div className="text-zinc-300 mt-1">{item.output}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleCommand} className="mt-2 flex items-center gap-2">
        <span className="text-green-400">guest@aaryan-os:~$</span>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-white"
          autoFocus
        />
      </form>
    </div>
  );
}

function MailApp() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    window.location.href = `mailto:noticedxaaryan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="w-full h-full bg-[#1c1c1e]/40 backdrop-blur-md text-white flex flex-col overflow-hidden">
      <div className="h-14 border-b border-white/10 flex items-center px-4 bg-white/5">
        <div className="font-semibold text-sm">New Message</div>
        <button onClick={handleSend} className="ml-auto bg-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg">
          <Send className="w-4 h-4 inline-block mr-1" /> Send
        </button>
      </div>
      <div className="flex flex-col p-6 gap-4 flex-1">
        <div className="flex items-center border-b border-white/10 pb-3">
          <span className="text-white/50 text-sm w-16">To:</span>
          <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full border border-white/5">noticedxaaryan@gmail.com</span>
        </div>
        <div className="flex items-center border-b border-white/10 pb-3">
          <span className="text-white/50 text-sm w-16">Subject:</span>
          <input 
            type="text" 
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="flex-1 outline-none text-sm bg-white/5 border border-transparent focus:border-white/20 focus:bg-white/10 px-3 py-2 rounded-md transition-all text-white placeholder:text-white/30" 
            placeholder="Enter subject..."
          />
        </div>
        <textarea 
          value={body}
          onChange={e => setBody(e.target.value)}
          className="flex-1 w-full resize-none outline-none text-sm mt-2 bg-white/5 border border-transparent focus:border-white/20 focus:bg-white/10 p-4 rounded-md transition-all text-white placeholder:text-white/30 custom-scrollbar"
          placeholder="Write your message here..."
        />
      </div>
    </div>
  );
}

// 5. Four-Line Opposite Scroll "What I Do"
function WhatIDoScroll() {
  const targetRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start end", "end start"] });
  
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const x3 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const x4 = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  return (
    <section ref={targetRef} className="py-32 relative bg-zinc-950 border-t border-zinc-900 overflow-hidden flex flex-col justify-center min-h-screen snap-center">
      <div className="px-6 md:px-12 mb-16 text-center">
        <h2 className="text-2xl md:text-3xl font-mono text-zinc-400 tracking-widest mb-4">MY ARSENAL</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">A comprehensive toolkit spanning the entire stack, from low-level systems to high-fidelity user interfaces.</p>
      </div>
      
      <div className="flex flex-col gap-8 md:gap-12">
        {/* Row 1 */}
        <motion.div style={{ x: x1 }} className="flex gap-8 md:gap-12 whitespace-nowrap">
          {WHAT_I_DO_ROWS[0].map((item, i) => (
            <div key={`r1-${i}`} className="flex items-center gap-8 md:gap-12 group cursor-default">
              <h3 className="text-[8vw] md:text-[5vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tighter uppercase transition-all duration-500 group-hover:scale-110 group-hover:from-emerald-400 group-hover:to-cyan-400">
                {item}
              </h3>
              <span className="text-zinc-700 text-[4vw] md:text-[3vw] transition-colors duration-500 group-hover:text-emerald-500">✦</span>
            </div>
          ))}
        </motion.div>

        {/* Row 2 */}
        <motion.div style={{ x: x2 }} className="flex gap-8 md:gap-12 whitespace-nowrap">
          {WHAT_I_DO_ROWS[1].map((item, i) => (
            <div key={`r2-${i}`} className="flex items-center gap-8 md:gap-12 group cursor-default">
              <h3 className="text-[8vw] md:text-[5vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-100 tracking-tighter uppercase transition-all duration-500 group-hover:scale-110 group-hover:from-cyan-400 group-hover:to-blue-400">
                {item}
              </h3>
              <span className="text-zinc-700 text-[4vw] md:text-[3vw] transition-colors duration-500 group-hover:text-cyan-500">✦</span>
            </div>
          ))}
        </motion.div>

        {/* Row 3 */}
        <motion.div style={{ x: x3 }} className="flex gap-8 md:gap-12 whitespace-nowrap">
          {WHAT_I_DO_ROWS[2].map((item, i) => (
            <div key={`r3-${i}`} className="flex items-center gap-8 md:gap-12 group cursor-default">
              <h3 className="text-[8vw] md:text-[5vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tighter uppercase transition-all duration-500 group-hover:scale-110 group-hover:from-blue-400 group-hover:to-purple-400">
                {item}
              </h3>
              <span className="text-zinc-700 text-[4vw] md:text-[3vw] transition-colors duration-500 group-hover:text-blue-500">✦</span>
            </div>
          ))}
        </motion.div>

        {/* Row 4 */}
        <motion.div style={{ x: x4 }} className="flex gap-8 md:gap-12 whitespace-nowrap">
          {WHAT_I_DO_ROWS[3].map((item, i) => (
            <div key={`r4-${i}`} className="flex items-center gap-8 md:gap-12 group cursor-default">
              <h3 className="text-[8vw] md:text-[5vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-100 tracking-tighter uppercase transition-all duration-500 group-hover:scale-110 group-hover:from-purple-400 group-hover:to-pink-400">
                {item}
              </h3>
              <span className="text-zinc-700 text-[4vw] md:text-[3vw] transition-colors duration-500 group-hover:text-purple-500">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SkillShooterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uiState, setUiState] = useState<AppUiState>('start');
  const [score, setScore] = useState(0);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarkerInstance | null>(null);

  const gameRef = useRef<GameRuntimeState>({
    state: 'start',
    score: 0,
    balls: [],
    projectiles: [],
    player: { x: 400, y: 550, isShooting: false },
    lastTime: performance.now(),
    spawnTimer: 0,
    spawnInterval: 3000,
    shootTimer: 0,
    particles: [],
    lastVideoTime: -1
  });

  const loadHandLandmarker = useCallback(async () => {
    if (handLandmarker) return handLandmarker;

    const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
    );
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    setHandLandmarker(landmarker);
    return landmarker;
  }, [handLandmarker]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      handLandmarker?.close();
    };
  }, [handLandmarker, stopCamera]);

  const enableCam = async () => {
    setUiState('loading_cam');

    try {
      await loadHandLandmarker();
    } catch (error) {
      console.error('Unable to load the hand-tracking model:', error);
      setUiState('setup_error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", startGame);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setUiState('permission_denied');
    }
  };

  const quitGame = () => {
    stopCamera();
    setUiState('start');
  };

  const startGame = () => {
    gameRef.current = {
      state: 'playing',
      score: 0,
      balls: [],
      projectiles: [],
      player: { x: 400, y: 550, isShooting: false },
      lastTime: performance.now(),
      spawnTimer: 0,
      spawnInterval: 3000,
      shootTimer: 0,
      particles: [],
      lastVideoTime: -1
    };
    setScore(0);
    setUiState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentLandmarks: HandPoint[] | null = null;

    const draw = (time: number) => {
      const state = gameRef.current;
      const dt = Math.min(time - state.lastTime, 50); // cap dt
      state.lastTime = time;

      // Clear canvas (transparent background)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.state === 'playing' && handLandmarker && video.readyState >= 2) {
        // Hand Tracking
        if (video.currentTime !== state.lastVideoTime) {
          state.lastVideoTime = video.currentTime;
          const results = handLandmarker.detectForVideo(video, performance.now());
          
          if (results.landmarks && results.landmarks.length > 0) {
            currentLandmarks = results.landmarks[0];
            const landmarks = currentLandmarks;
            // Use index finger tip (8) and thumb tip (4)
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            
            // Mirror X coordinate because camera is mirrored
            const targetX = (1 - indexTip.x) * canvas.width;
            const targetY = indexTip.y * canvas.height;
            
            // Smooth movement
            state.player.x += (targetX - state.player.x) * 0.4;
            state.player.y += (targetY - state.player.y) * 0.4;

            // Check pinch distance to shoot
            const dx = indexTip.x - thumbTip.x;
            const dy = indexTip.y - thumbTip.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            state.player.isShooting = distance < 0.06; // Pinch threshold
          } else {
            currentLandmarks = null;
            state.player.isShooting = false;
          }
        }

        // Draw Hand Skeleton
        if (currentLandmarks) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; // Emerald
          
          // Draw connections
          HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = currentLandmarks[i];
            const p2 = currentLandmarks[j];
            ctx.beginPath();
            ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
            ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
            ctx.stroke();
          });

          // Draw points
          currentLandmarks.forEach((p: HandPoint, index: number) => {
            ctx.fillStyle = (index === 8 || index === 4) ? '#10b981' : 'rgba(16, 185, 129, 0.8)';
            ctx.beginPath();
            ctx.arc((1 - p.x) * canvas.width, p.y * canvas.height, (index === 8 || index === 4) ? 6 : 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw pinch line
          if (state.player.isShooting) {
            const p1 = currentLandmarks[4];
            const p2 = currentLandmarks[8];
            ctx.beginPath();
            ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
            ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
            ctx.strokeStyle = '#fbbf24'; // Amber
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }

        // Spawn logic
        state.spawnTimer += dt;
        if (state.spawnTimer > state.spawnInterval) {
          state.spawnTimer = 0;
          state.spawnInterval = Math.max(1000, state.spawnInterval - 50);
          const template = SKILL_TREE[Math.floor(Math.random() * SKILL_TREE.length)];
          state.balls.push({
            x: Math.random() * (canvas.width - 120) + 60,
            y: -60,
            vx: (Math.random() - 0.5) * 0.05,
            vy: Math.random() * 0.02 + 0.03,
            ...template
          });
        }

        // Auto-shoot if pinching
        if (state.player.isShooting) {
          state.shootTimer += dt;
          if (state.shootTimer > 150) { // Shoot every 150ms
            state.shootTimer = 0;
            state.projectiles.push({
              x: state.player.x,
              y: state.player.y - 35,
              vy: -0.8,
              radius: 6,
              color: '#10b981' // emerald-500
            });
          }
        }

        // Move balls
        for (let i = state.balls.length - 1; i >= 0; i--) {
          const ball = state.balls[i];
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;
          
          if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
            ball.vx *= -1;
            ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
          }

          if (ball.y > canvas.height + ball.radius) {
            state.state = 'gameover';
            setUiState('gameover');
            stopCamera();
          }
        }

        // Move projectiles & Collisions
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
          const p = state.projectiles[i];
          p.y += p.vy * dt;

          if (p.y < -10) {
            state.projectiles.splice(i, 1);
            continue;
          }

          let hit = false;
          for (let j = state.balls.length - 1; j >= 0; j--) {
            const ball = state.balls[j];
            const dx = p.x - ball.x;
            const dy = p.y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < p.radius + ball.radius) {
              hit = true;
              state.score += 10;
              setScore(state.score);
              
              // Spawn children (Aspects)
              if (ball.children && ball.children.length > 0) {
                ball.children.forEach((child: SkillNode) => {
                  state.balls.push({
                    x: ball.x + (Math.random() - 0.5) * 30,
                    y: ball.y + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: Math.random() * 0.05 + 0.02,
                    ...child
                  });
                });
              }

              // Particles
              for(let k=0; k<15; k++) {
                state.particles.push({
                  x: ball.x, y: ball.y,
                  vx: (Math.random() - 0.5) * 1.2,
                  vy: (Math.random() - 0.5) * 1.2,
                  life: 1,
                  color: ball.color
                });
              }
              
              state.balls.splice(j, 1);
              break;
            }
          }
          if (hit) {
            state.projectiles.splice(i, 1);
          }
        }

        // Update particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt * 0.002;
          if (p.life <= 0) state.particles.splice(i, 1);
        }
      }

      // Draw balls
      state.balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius*0.3, ball.y - ball.radius*0.3, ball.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${ball.radius * 0.35}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.name, ball.x, ball.y);
        
        if (ball.pun) {
          ctx.font = `italic ${ball.radius * 0.2}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText(ball.pun, ball.x, ball.y + ball.radius * 0.4);
        }
      });

      // Draw projectiles
      state.projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x - 2, p.y - 2, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      });

      // Draw particles
      state.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw player (Hand Cannon)
      if (state.state === 'playing') {
        const { x: px, y: py, isShooting } = state.player;
        
        // Glow if shooting
        if (isShooting) {
          ctx.beginPath();
          ctx.arc(px, py, 50, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // emerald glow
          ctx.fill();
        }

        // Base
        ctx.beginPath();
        ctx.arc(px, py, 25, 0, Math.PI * 2);
        ctx.fillStyle = isShooting ? '#10b981' : '#a1a1aa';
        ctx.fill();
        
        // Inner detail
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#09090b';
        ctx.fill();

        // Barrel
        ctx.fillStyle = isShooting ? '#10b981' : '#a1a1aa';
        ctx.beginPath();
        ctx.roundRect(px - 8, py - 45, 16, 35, 6);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameId);
  }, [handLandmarker]);

  return (
    <section className="py-32 px-4 md:px-12 w-full min-h-screen flex flex-col justify-center border-t border-zinc-900 bg-zinc-950 relative snap-center">
      <div className="relative z-10 mb-12 text-center">
        <h2 className="text-zinc-400 font-mono tracking-widest mb-4">04 // PLAYGROUND</h2>
        <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter">BREAK THE STACK</h3>
        <p className="text-zinc-400 mt-4 text-xl">Play a fun computer vision game! Move your hand to aim, pinch to shoot.</p>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-xl shadow-2xl">
        
        {/* Unified Game Window */}
        <div className="relative w-full aspect-[16/9] bg-transparent">
          
          {/* Camera Feed (Mirrored and faint in background) */}
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-20 scale-x-[-1]"
            autoPlay 
            playsInline 
            muted
          />

          {/* Score Overlay (Transparent) */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <p className="text-zinc-400 font-mono text-sm mb-1 drop-shadow-md">SCORE</p>
            <p className="text-5xl font-black text-white leading-none drop-shadow-lg">{score}</p>
          </div>

          {/* Camera Active Indicator & Quit Button */}
          {uiState === 'playing' && (
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-white/80">CAMERA ACTIVE</span>
              </div>
              <button 
                onClick={quitGame}
                className="interactive bg-white/10 hover:bg-red-500/20 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
                title="Quit Game & Turn Off Camera"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          )}

          <canvas 
            ref={canvasRef}
            width={1280}
            height={720}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlays */}
          {uiState === 'start' && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center flex-col gap-6 z-30">
              <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
                <Camera className="w-12 h-12 text-zinc-400" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter">ENABLE CAMERA TO PLAY</h3>
              <p className="text-zinc-400 text-center max-w-md">
                This game uses on-device machine learning to track your hand. No video is sent to any server.
              </p>
              <button 
                onClick={enableCam}
                className="interactive bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5" /> Start Game
              </button>
            </div>
          )}

          {uiState === 'setup_error' && (
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center flex-col gap-6 z-30 px-6">
              <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <Cpu className="w-12 h-12 text-amber-300" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter text-center">AI MODEL UNAVAILABLE</h3>
              <p className="text-zinc-400 text-center max-w-md">
                The hand-tracking model could not load. Check your connection and try again.
              </p>
              <button
                onClick={() => setUiState('start')}
                className="interactive bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-white/20 transition-colors border border-white/10"
              >
                <RotateCcw className="w-5 h-5" /> Try Again
              </button>
            </div>
          )}

          {uiState === 'permission_denied' && (
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center flex-col gap-6 z-30">
              <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <Camera className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter">CAMERA ACCESS DENIED</h3>
              <p className="text-zinc-400 text-center max-w-md">
                We need camera access to track your hand movements using MediaPipe. 
                Please allow camera access in your browser settings and try again.
              </p>
              <button 
                onClick={() => setUiState('start')}
                className="interactive bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-white/20 transition-colors border border-white/10"
              >
                <RotateCcw className="w-5 h-5" /> Go Back
              </button>
            </div>
          )}

          {uiState === 'loading_cam' && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center flex-col gap-6 z-30">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              <h3 className="text-2xl font-bold text-white tracking-tighter">Loading AI & Camera...</h3>
            </div>
          )}
          
          {uiState === 'gameover' && (
            <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex items-center justify-center flex-col gap-6 z-30">
              <h3 className="text-6xl font-black text-white tracking-tighter">GAME OVER</h3>
              <p className="text-white font-black text-4xl drop-shadow-lg">Final Score: {score}</p>
              <button 
                onClick={startGame}
                className="interactive bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform mt-4"
              >
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- MAIN APP ---
export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const osRef = useRef<HTMLDivElement | null>(null);
  const isOsInView = useInView(osRef, { amount: 0.5 });
  const { profile, repositories, isLive } = useGitHubData();

  return (
    <div ref={containerRef} className="relative bg-zinc-950 text-zinc-50 min-h-screen font-sans selection:bg-zinc-300 selection:text-black overflow-x-hidden">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <CustomCursor />

      {/* Navigation */}
      <AnimatePresence>
        {!isOsInView && (
          <motion.nav
            aria-label="Primary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-difference"
          >
            <span className="text-xl font-bold tracking-tighter text-white">AARYAN.</span>
            <div className="flex gap-3 sm:gap-6 font-mono text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase text-white">
              <a href="#github" className="interactive hover:text-zinc-400 transition-colors">Projects</a>
              <a href="#about" className="interactive hover:text-zinc-400 transition-colors">About</a>
              <a href="#contact" className="interactive hover:text-zinc-400 transition-colors">Contact</a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 bg-zinc-950 snap-center">
        <GalaxyBackground />

        <motion.div 
          className="z-10 flex flex-col items-center text-center px-4 w-full max-w-6xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <p className="text-2xl md:text-4xl font-script text-zinc-400 mb-4 -rotate-2">Hi, I'm</p>
            <h1 className="text-[clamp(4rem,15vw,10rem)] md:text-[clamp(6rem,12vw,12rem)] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-600 drop-shadow-2xl pb-4">
              AARYAN
            </h1>
          </motion.div>
          
          <BlurText
            text="Founder. AI builder. Systems thinker. Turning ambitious ideas into software people can use."
            className="mt-6 max-w-3xl justify-center text-lg font-light leading-relaxed text-zinc-300 md:text-2xl"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row gap-6"
          >
            <MagneticLink href="#github" className="px-8 py-4 rounded-full bg-white text-black font-bold tracking-wide hover:scale-105 transition-transform flex items-center gap-2">
                View Projects <ArrowRight className="w-5 h-5" />
            </MagneticLink>
            <MagneticLink href="#contact" className="px-8 py-4 rounded-full border border-zinc-700 text-white font-bold tracking-wide hover:bg-zinc-900 transition-colors flex items-center gap-2">
                Contact Me <Mail className="w-5 h-5" />
            </MagneticLink>
          </motion.div>
        </motion.div>
      </section>

      {/* MacOS Experience (Interactive Desktop) */}
      <div ref={osRef}>
        <OSExperience />
      </div>

      {/* What I Do (Four-Line Opposite Scroll) */}
      <WhatIDoScroll />

      <ProfileOverview profile={profile} isLive={isLive} />

      <FeaturedProjects repositories={repositories} totalRepositories={profile.public_repos ?? 21} />

      {/* Fun Playground (Shooter) */}
      <SkillShooterGame />

      {/* Contact Section */}
      <section id="contact" className="py-40 px-4 md:px-12 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden snap-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-zinc-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-400 font-mono tracking-widest uppercase mb-6"
          >
            Initiate Contact
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-12 text-white"
          >
            HAVE A PROJECT? <br/>
            <span className="text-zinc-600 hover:text-white transition-colors duration-500 cursor-none">LET'S TALK.</span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <MagneticLink href="mailto:noticedxaaryan@gmail.com?subject=Portfolio%20inquiry" className="bg-white text-black px-8 sm:px-12 py-5 sm:py-6 rounded-full text-base sm:text-xl font-bold tracking-wide hover:scale-105 transition-transform inline-flex items-center gap-3">
              <Mail className="w-6 h-6" /> noticedxaaryan@gmail.com
            </MagneticLink>
          </motion.div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 bg-black">
        <p className="font-mono text-sm text-zinc-400">© {new Date().getFullYear()} AARYAN. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <a href="https://github.com/NoticedXAaryan" target="_blank" rel="noopener noreferrer" aria-label="Aaryan on GitHub" className="interactive text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" aria-hidden="true" /></a>
          <a href="https://twitter.com/noticed_aaryan" target="_blank" rel="noopener noreferrer" aria-label="Aaryan on X" className="interactive text-zinc-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" aria-hidden="true" /></a>
          <a href="https://www.linkedin.com/in/noticedxaaryan" target="_blank" rel="noopener noreferrer" aria-label="Aaryan on LinkedIn" className="interactive text-zinc-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
}

