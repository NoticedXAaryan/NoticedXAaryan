import type { GitHubProfile, GitHubRepo } from '../types/app';

export const GITHUB_USERNAME = 'NoticedXAaryan';

export const GITHUB_PROFILE_FALLBACK: GitHubProfile = {
  login: GITHUB_USERNAME,
  name: 'Aaryan Kumar Tiwari',
  bio: 'Just love computer and programming.',
  company: 'Blendable3D & Picobooth LLP',
  public_repos: 21,
  followers: 8,
  following: 0,
  avatar_url: 'https://avatars.githubusercontent.com/u/157978892?v=4',
  html_url: 'https://github.com/NoticedXAaryan'
};

export const FEATURED_REPOSITORY_NAMES = ['SamjhoAI', 'Rusty', 'Calmant', 'NanoLLM', 'JanSevak', 'Ozone'] as const;

export const FEATURED_REPOSITORIES_FALLBACK: GitHubRepo[] = [
  {
    id: 1,
    name: 'SamjhoAI',
    description: 'A sign-language-enabled meeting app designed for inclusive collaboration.',
    html_url: 'https://github.com/NoticedXAaryan/SamjhoAI',
    homepage: 'https://samjho-ai.vercel.app',
    language: 'TypeScript',
    stargazers_count: 1,
    forks_count: 0,
    updated_at: '2026-08-28T04:04:31Z'
  },
  {
    id: 2,
    name: 'Rusty',
    description: 'A programming language designed around neural native-code compilation.',
    html_url: 'https://github.com/NoticedXAaryan/Rusty',
    language: 'Rust',
    stargazers_count: 0,
    forks_count: 0,
    updated_at: '2026-08-19T16:51:04Z'
  },
  {
    id: 3,
    name: 'Calmant',
    description: 'An AI personal executive assistant for commitments, deadlines, and high-cognitive-load work.',
    html_url: 'https://github.com/NoticedXAaryan/Calmant',
    homepage: 'https://calmant.aaaryan.space',
    language: 'TypeScript',
    stargazers_count: 0,
    forks_count: 0,
    updated_at: '2026-07-11T14:08:04Z'
  },
  {
    id: 4,
    name: 'NanoLLM',
    description: 'A 30M-parameter language model built from scratch with a modern LLaMA-style architecture.',
    html_url: 'https://github.com/NoticedXAaryan/NanoLLM',
    language: 'Python',
    stargazers_count: 1,
    forks_count: 0,
    updated_at: '2026-05-23T05:55:09Z'
  },
  {
    id: 5,
    name: 'JanSevak',
    description: 'A multilingual AI platform that helps Indian citizens navigate government services.',
    html_url: 'https://github.com/NoticedXAaryan/JanSevak',
    language: 'TypeScript',
    stargazers_count: 0,
    forks_count: 0,
    updated_at: '2026-07-10T16:10:19Z'
  },
  {
    id: 6,
    name: 'Ozone',
    description: 'A compiler built in Rust.',
    html_url: 'https://github.com/NoticedXAaryan/Ozone',
    language: 'Rust',
    stargazers_count: 0,
    forks_count: 0,
    updated_at: '2026-05-15T15:31:09Z'
  }
];

export const LINKEDIN_PROFILE = {
  url: 'https://www.linkedin.com/in/noticedxaaryan',
  headline: 'Founder at Blendable3D',
  education: 'BCA (Hons), Parul University',
  dates: '2025—2029',
  location: 'Panaji, Goa, India'
} as const;
