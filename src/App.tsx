import { lazy, Suspense, useEffect, useState } from 'react';

const StoryExperience = lazy(() => import('./pages/StoryExperience'));
const ArchDesktop = lazy(() => import('./pages/ArchDesktop'));

type Experience = 'story' | 'desktop';

function resolveExperience(pathname: string): Experience {
  if (pathname.startsWith('/desktop')) return 'desktop';
  if (pathname.startsWith('/story')) return 'story';

  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  const choice: Experience = value[0] % 2 === 0 ? 'story' : 'desktop';
  window.history.replaceState({}, '', `/${choice}`);
  return choice;
}

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#08090b] text-zinc-100">
      <div className="font-mono text-sm tracking-[0.3em] text-cyan-300">BOOTING AARYAN.SPACE</div>
    </div>
  );
}

export default function App() {
  const [experience, setExperience] = useState<Experience>(() => resolveExperience(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setExperience(resolveExperience(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const isDesktop = experience === 'desktop';
    const url = `https://aaaryan.space/${experience}`;
    const title = isDesktop
      ? 'Aaryan OS — Arch Linux Portfolio Desktop'
      : 'Aaryan Kumar Tiwari — Founder, AI & Systems Developer';
    const description = isDesktop
      ? 'Explore Aaryan Kumar Tiwari’s projects and personality through an interactive Arch Linux desktop.'
      : 'Official website of Aaryan Kumar Tiwari, founder of Blendable3D and software developer building accessible products, AI systems, language models, and compilers.';

    document.title = title;
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', url);
  }, [experience]);

  return (
    <Suspense fallback={<RouteFallback />}>
      {experience === 'desktop' ? <ArchDesktop /> : <StoryExperience />}
    </Suspense>
  );
}
