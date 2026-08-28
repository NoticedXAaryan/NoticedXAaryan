import { ArrowRight, ExternalLink, GitFork, Github, Star } from 'lucide-react';
import type { GitHubRepo } from '../types/app';
import CountUp from './reactbits/CountUp';
import SpotlightCard from './reactbits/SpotlightCard';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  Rust: '#f97316',
  Python: '#facc15',
  JavaScript: '#f7df1e',
  HTML: '#e34c26',
  'Jupyter Notebook': '#f37626'
};

interface FeaturedProjectsProps {
  repositories: GitHubRepo[];
  totalRepositories: number;
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'Recently updated';
  return `Updated ${new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value))}`;
}

export default function FeaturedProjects({ repositories, totalRepositories }: FeaturedProjectsProps) {
  return (
    <section id="github" className="border-t border-white/8 bg-black px-4 py-28 md:px-12 md:py-36 snap-center">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-sm tracking-[0.3em] text-zinc-500">03 // SELECTED WORK</p>
            <h2 className="text-5xl font-black tracking-[-0.06em] text-white md:text-7xl">BUILT IN PUBLIC.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
              Current work pulled from the real GitHub profile—from accessible communication and civic AI to language models and compilers.
            </p>
          </div>
          <a
            href="https://github.com/NoticedXAaryan?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="interactive inline-flex items-center gap-3 text-zinc-300 transition hover:text-white"
          >
            <Github className="h-5 w-5" />
            <span><CountUp to={totalRepositories} /> public repositories</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {repositories.map((repository, index) => (
            <SpotlightCard
              key={repository.id || repository.name}
              className="group min-h-[320px] rounded-[1.75rem] border border-white/10 bg-zinc-950 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20"
              spotlightColor={index % 2 === 0 ? 'rgba(255, 255, 255, 0.16)' : 'rgba(96, 165, 250, 0.16)'}
            >
              <a
                href={repository.html_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repository.name} on GitHub`}
                className="interactive relative z-10 flex h-full flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs tracking-[0.2em] text-zinc-600">0{index + 1}</span>
                  <ExternalLink className="h-5 w-5 text-zinc-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
                <h3 className="mt-10 text-2xl font-bold tracking-tight text-white">{repository.name}</h3>
                <p className="mt-4 flex-1 leading-relaxed text-zinc-400">
                  {repository.description || 'An active open-source experiment from Aaryan’s GitHub.'}
                </p>
                <div className="mt-8 border-t border-white/8 pt-5">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: LANGUAGE_COLORS[repository.language || ''] || '#a1a1aa' }}
                      />
                      {repository.language || 'Mixed'}
                    </span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {repository.stargazers_count ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" /> {repository.forks_count ?? 0}</span>
                  </div>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-zinc-700">
                    {repository.homepage ? 'Live project · ' : ''}{formatUpdatedAt(repository.updated_at)}
                  </p>
                </div>
              </a>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
