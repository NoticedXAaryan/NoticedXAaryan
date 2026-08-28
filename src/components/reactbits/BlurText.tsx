// Adapted from React Bits by David Haz. See THIRD_PARTY_NOTICES.md.
import { motion, useReducedMotion, type Easing, type Transition } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  easing?: Easing | Easing[];
  stepDuration?: number;
}

type Keyframe = Record<string, string | number>;

function buildKeyframes(from: Keyframe, steps: Keyframe[]): Record<string, Array<string | number>> {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(step => Object.keys(step))]);
  const keyframes: Record<string, Array<string | number>> = {};

  keys.forEach(key => {
    keyframes[key] = [from[key], ...steps.map(step => step[key])];
  });

  return keyframes;
}

export default function BlurText({
  text,
  delay = 90,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
  threshold = 0.1,
  rootMargin = '0px',
  easing = [0.16, 1, 0.3, 1],
  stepDuration = 0.4
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !ref.current) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduceMotion, rootMargin, threshold]);

  const from = useMemo(
    () => ({ filter: 'blur(12px)', opacity: 0, y: direction === 'top' ? -28 : 28 }),
    [direction]
  );
  const to = useMemo(
    () => [
      { filter: 'blur(5px)', opacity: 0.55, y: direction === 'top' ? 4 : -4 },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );
  const keyframes = useMemo(() => buildKeyframes(from, to), [from, to]);
  const totalDuration = stepDuration * to.length;

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        const transition: Transition = {
          duration: reduceMotion ? 0 : totalDuration,
          times: [0, 0.5, 1],
          delay: reduceMotion ? 0 : (index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            key={`${segment}-${index}`}
            initial={reduceMotion ? to.at(-1) : from}
            animate={inView ? keyframes : from}
            transition={transition}
            className="inline-block"
          >
            {segment === ' ' ? '\u00a0' : segment}
            {animateBy === 'words' && index < elements.length - 1 ? '\u00a0' : null}
          </motion.span>
        );
      })}
    </p>
  );
}
