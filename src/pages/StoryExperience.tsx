import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, ExternalLink, Github, Linkedin, Mail, MonitorUp } from 'lucide-react';
import { useRef } from 'react';
import SkillArcade from '../components/SkillArcade';
import BlurText from '../components/reactbits/BlurText';
import ClickSpark from '../components/reactbits/ClickSpark';
import { WHAT_I_DO_ROWS } from '../data/portfolioData';
import { LINKEDIN_PROFILE } from '../data/profileData';
import { useGitHubData } from '../hooks/useGitHubData';

const chapters = [
  {
    year: 'Second grade',
    title: 'The office computer became a portal.',
    body: 'I did not begin with a roadmap. I began by taking apart the possibilities inside an old office PC—clicking, breaking, rebuilding, and learning that computers reward curiosity.'
  },
  {
    year: 'Fifth → sixth grade',
    title: 'From assembling machines to speaking their language.',
    body: 'By fifth grade I was assembling rigs. A year later I was writing code. The fascination moved beneath the screen: what makes a system work, and how far can one person push it?'
  },
  {
    year: 'Class eleven → now',
    title: 'Building products, models, and systems.',
    body: 'Data science opened the door to AI. Today I move between inclusive software, language models, compilers, 3D tools, and companies—still following the same instinct: understand the whole machine.'
  }
] as const;

function StoryProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 25 });
  return <motion.div aria-hidden="true" style={{ scaleX }} className="fixed left-0 top-0 z-[80] h-0.5 w-full origin-left bg-cyan-300" />;
}

function MyArsenal() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const left = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const right = useTransform(scrollYProgress, [0, 1], ['-18%', '0%']);

  return (
    <section ref={sectionRef} id="arsenal" className="overflow-hidden border-y border-white/10 bg-[#f1f0ea] py-24 text-[#111216] md:py-32">
      <div className="mx-auto mb-16 max-w-7xl px-5 md:px-12">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">03 / The toolkit</p>
        <h2 className="text-6xl font-black tracking-[-0.07em] md:text-9xl">MY ARSENAL</h2>
      </div>
      <div className="flex flex-col gap-4 md:gap-7">
        {WHAT_I_DO_ROWS.map((row, rowIndex) => (
          <motion.div key={rowIndex} style={{ x: rowIndex % 2 === 0 ? left : right }} className="flex w-max items-center gap-6 whitespace-nowrap md:gap-10">
            {row.map((skill, index) => (
              <span key={`${skill}-${index}`} className={`text-4xl font-black tracking-[-0.045em] md:text-7xl ${index % 2 ? 'text-zinc-400' : ''}`}>
                {skill}<span className="ml-6 text-cyan-600 md:ml-10">✦</span>
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function OriginStory() {
  return (
    <section id="about" className="bg-[#0a0b0e] px-5 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">02 / Origin story</p>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.06em] text-white md:text-7xl">I kept going one layer deeper.</h2>
            <p className="mt-7 max-w-sm text-lg leading-relaxed text-zinc-400">This is less a résumé and more the path that made me.</p>
          </div>
          <div>
            {chapters.map((chapter, index) => (
              <motion.article
                key={chapter.year}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .35 }}
                className="grid gap-5 border-t border-white/15 py-12 md:grid-cols-[9rem_1fr] md:py-16"
              >
                <p className="font-mono text-xs uppercase tracking-[.18em] text-zinc-500">0{index + 1} — {chapter.year}</p>
                <div>
                  <h3 className="max-w-2xl text-3xl font-semibold tracking-[-.04em] text-zinc-100 md:text-5xl">{chapter.title}</h3>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">{chapter.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkNarrative() {
  const { profile, repositories, isLive } = useGitHubData();
  return (
    <section id="work" className="bg-[#0a0b0e] px-5 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 grid items-end gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">04 / Current chapter</p>
            <h2 className="mt-6 text-5xl font-black tracking-[-0.06em] text-white md:text-8xl">Things I’m making real.</h2>
          </div>
          <p className="max-w-lg text-lg leading-8 text-zinc-400 md:justify-self-end">From tools for people who communicate differently to experiments that ask how languages and intelligence should be built.</p>
        </div>

        <div className="border-t border-white/15">
          {repositories.map((repository, index) => (
            <motion.a
              key={repository.id}
              href={repository.html_url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * .04 }}
              className="group grid gap-4 border-b border-white/15 py-9 transition-colors hover:bg-white/[.025] md:grid-cols-[5rem_1fr_10rem_2rem] md:items-center md:px-4"
            >
              <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
              <div>
                <h3 className="text-3xl font-semibold tracking-[-.04em] text-white transition-transform group-hover:translate-x-2 md:text-5xl">{repository.name}</h3>
                <p className="mt-3 max-w-2xl text-zinc-500">{repository.description}</p>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">{repository.language ?? 'Exploration'}</span>
              <ExternalLink className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-cyan-300" />
            </motion.a>
          ))}
        </div>

        <div className="mt-20 grid gap-10 border-l-2 border-cyan-300 pl-7 md:grid-cols-[auto_1fr] md:items-center md:gap-14">
          <img src={profile.avatar_url} alt="Aaryan Kumar Tiwari" className="h-24 w-24 rounded-full object-cover grayscale" />
          <div>
            <p className="max-w-4xl text-2xl leading-relaxed text-zinc-200 md:text-4xl">Founder at Blendable3D. Building alongside Picobooth LLP. Studying BCA (Hons) at Parul University, {LINKEDIN_PROFILE.dates}. Based in {LINKEDIN_PROFILE.location}.</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[.2em] text-zinc-500">{isLive ? `Live from GitHub · ${profile.public_repos} public repositories` : 'Verified profile snapshot'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StoryExperience() {
  return (
    <ClickSpark>
      <div className="min-h-screen overflow-x-hidden bg-[#090a0c] text-zinc-100 selection:bg-cyan-300 selection:text-black">
        <StoryProgress />
        <a href="#main" className="skip-link">Skip to story</a>
        <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#090a0c]/70 px-5 py-4 backdrop-blur-xl md:px-10" aria-label="Primary">
          <a href="#main" className="text-lg font-black tracking-[-.04em]">AARYAN<span className="text-cyan-300">.</span></a>
          <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            <a href="#about" className="hidden hover:text-white sm:block">Story</a>
            <a href="#work" className="hidden hover:text-white sm:block">Work</a>
            <a href="/desktop" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-zinc-100 hover:border-cyan-300/60 hover:text-cyan-300"><MonitorUp className="h-4 w-4" /> Arch desktop</a>
          </div>
        </nav>

        <main id="main">
          <section className="relative flex min-h-screen items-end overflow-hidden px-5 pb-16 pt-32 md:px-12 md:pb-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(34,211,238,.12),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,.07),transparent_32%)]" />
            <div className="absolute right-[8%] top-[18%] hidden font-mono text-[10px] leading-6 text-zinc-700 md:block">01°15′N<br />103°51′E<br />SYSTEMS / AI / HUMAN</div>
            <div className="relative mx-auto w-full max-w-7xl">
              <p className="mb-5 font-script text-3xl text-zinc-500 md:text-5xl">Hi, I’m</p>
              <h1 className="text-[clamp(5rem,18vw,15rem)] font-black leading-[.72] tracking-[-.09em] text-white">AARYAN</h1>
              <div className="mt-12 grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
                <BlurText text="A founder and systems builder who follows ideas all the way down—from the interface to the compiler." className="max-w-3xl text-2xl leading-tight text-zinc-300 md:text-4xl" />
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <a href="#about" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black">Read the story <ArrowDown className="h-4 w-4" /></a>
                  <a href="/desktop" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-bold text-white">Boot Arch <ArrowRight className="h-4 w-4" /></a>
                </div>
              </div>
            </div>
          </section>

          <OriginStory />
          <MyArsenal />
          <WorkNarrative />
          <SkillArcade />

          <section id="contact" className="relative overflow-hidden border-t border-white/10 bg-[#efeee8] px-5 py-32 text-[#111216] md:px-12 md:py-44">
            <div className="mx-auto max-w-7xl">
              <p className="font-mono text-xs uppercase tracking-[.3em] text-zinc-500">06 / Let’s make something matter</p>
              <h2 className="mt-8 max-w-6xl text-6xl font-black leading-[.88] tracking-[-.075em] md:text-[9rem]">Have an impossible idea?</h2>
              <a href="mailto:noticedxaaryan@gmail.com?subject=Let%27s%20build" className="mt-14 inline-flex items-center gap-3 border-b-2 border-black pb-2 text-xl font-bold md:text-3xl">Tell me about it <Mail className="h-6 w-6" /></a>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-5 border-t border-white/10 bg-black px-5 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between md:px-12">
          <p>© {new Date().getFullYear()} Aaryan Kumar Tiwari</p>
          <div className="flex gap-5">
            <a href="https://github.com/NoticedXAaryan" target="_blank" rel="noreferrer" className="inline-flex gap-2 hover:text-white"><Github className="h-4 w-4" /> GitHub</a>
            <a href={LINKEDIN_PROFILE.url} target="_blank" rel="noreferrer" className="inline-flex gap-2 hover:text-white"><Linkedin className="h-4 w-4" /> LinkedIn</a>
          </div>
        </footer>
      </div>
    </ClickSpark>
  );
}
