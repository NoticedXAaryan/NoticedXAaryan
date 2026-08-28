import type React from 'react';

export type AppUiState = 'start' | 'loading_cam' | 'playing' | 'gameover' | 'permission_denied' | 'setup_error';

export type IconType = React.ComponentType<{ className?: string }>;

export interface DesktopWindow {
  id: string;
  title: string;
  content?: React.ReactNode;
  isMaximized: boolean;
  isMinimized: boolean;
}

export interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onDoubleClick: () => void;
}

export interface DockIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isOpen?: boolean;
}

export interface OSWindowProps {
  win: DesktopWindow;
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  index: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  description?: string | null;
  updated_at?: string;
  topics?: string[];
  archived?: boolean;
  fork?: boolean;
}

export interface GitHubProfile {
  avatar_url?: string;
  name?: string | null;
  login?: string;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  html_url?: string;
}

export interface ExplorerItem {
  name: string;
  type: 'folder' | 'file';
  icon: IconType;
  action?: () => void;
}

export interface FeaturedProject {
  title: string;
  category: string;
  img: string;
  desc: string;
}

export interface SkillNode {
  name: string;
  color: string;
  radius: number;
  pun?: string;
  children: SkillNode[];
}

export interface GameBall extends SkillNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Projectile {
  x: number;
  y: number;
  vy: number;
  radius: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface HandPoint {
  x: number;
  y: number;
}

export interface GameRuntimeState {
  state: 'start' | 'playing' | 'gameover';
  score: number;
  balls: GameBall[];
  projectiles: Projectile[];
  player: { x: number; y: number; isShooting: boolean };
  lastTime: number;
  spawnTimer: number;
  spawnInterval: number;
  shootTimer: number;
  particles: Particle[];
  lastVideoTime: number;
}
