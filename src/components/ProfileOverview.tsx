import { ArrowUpRight, BriefcaseBusiness, Github, GraduationCap, Linkedin, MapPin } from 'lucide-react';
import { LINKEDIN_PROFILE } from '../data/profileData';
import type { GitHubProfile } from '../types/app';
import CountUp from './reactbits/CountUp';
import SpotlightCard from './reactbits/SpotlightCard';

interface ProfileOverviewProps {
  profile: GitHubProfile;
  isLive: boolean;
}

export default function ProfileOverview({ profile, isLive }: ProfileOverviewProps) {
  return (
    <section id="about" className="relative border-t border-white/8 bg-zinc-950 px-4 py-28 md:px-12 md:py-36 snap-center">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-sm tracking-[0.3em] text-zinc-500">02 // PROFILE</p>
            <h2 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-white md:text-7xl">
              BUILDING ACROSS AI, SYSTEMS, AND THE PHYSICAL WORLD.
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {isLive ? 'LIVE GITHUB DATA' : 'VERIFIED SNAPSHOT'}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <SpotlightCard className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-9">
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <img
                  src={profile.avatar_url}
                  alt="Aaryan Kumar Tiwari"
                  width="112"
                  height="112"
                  className="h-28 w-28 rounded-3xl border border-white/10 object-cover grayscale transition duration-500 hover:grayscale-0"
                />
                <div>
                  <p className="mb-2 font-mono text-sm text-zinc-500">@{profile.login}</p>
                  <h3 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{profile.name}</h3>
                  <p className="mt-2 text-lg text-zinc-400">{profile.company}</p>
                </div>
              </div>

              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-zinc-300 md:text-2xl">
                Founder, computer-applications student, and hands-on builder creating accessible software, AI products,
                compilers, and tools that connect code with real-world outcomes.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                  <BriefcaseBusiness className="h-4 w-4" /> {LINKEDIN_PROFILE.headline}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                  <GraduationCap className="h-4 w-4" /> {LINKEDIN_PROFILE.education}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                  <MapPin className="h-4 w-4" /> {LINKEDIN_PROFILE.location}
                </span>
              </div>

              <div className="mt-auto flex flex-wrap gap-3 pt-9">
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="interactive inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
                >
                  <Github className="h-4 w-4" /> GitHub <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={LINKEDIN_PROFILE.url}
                  target="_blank"
                  rel="noreferrer"
                  className="interactive inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/8"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </SpotlightCard>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <SpotlightCard className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7">
              <div className="relative z-10">
                <p className="font-mono text-xs tracking-[0.25em] text-zinc-500">PUBLIC REPOSITORIES</p>
                <p className="mt-4 text-6xl font-black tracking-tighter text-white">
                  <CountUp to={profile.public_repos ?? 21} />
                </p>
                <p className="mt-3 text-zinc-400">Open experiments, products, learning archives, and systems work.</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7" spotlightColor="rgba(96, 165, 250, 0.18)">
              <div className="relative z-10">
                <p className="font-mono text-xs tracking-[0.25em] text-zinc-500">PARUL UNIVERSITY</p>
                <p className="mt-4 text-3xl font-black tracking-tight text-white">BCA (HONS)</p>
                <p className="mt-2 font-mono text-sm text-blue-300">{LINKEDIN_PROFILE.dates}</p>
                <p className="mt-4 text-zinc-400">Applying coursework in data structures and software development to startup work.</p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
