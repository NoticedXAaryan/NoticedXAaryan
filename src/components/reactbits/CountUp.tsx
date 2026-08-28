// Adapted from React Bits by David Haz. See THIRD_PARTY_NOTICES.md.
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  separator?: string;
}

export default function CountUp({ to, from = 0, duration = 1.6, className = '', separator = ',' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    damping: 20 + 40 / duration,
    stiffness: 100 / duration
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const formatValue = useCallback(
    (value: number) => Intl.NumberFormat('en-US', { useGrouping: Boolean(separator) }).format(Math.round(value)),
    [separator]
  );

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(reduceMotion ? to : from);
  }, [formatValue, from, reduceMotion, to]);

  useEffect(() => {
    if (isInView) motionValue.set(to);
  }, [isInView, motionValue, to]);

  useEffect(() => {
    if (reduceMotion) return;
    return springValue.on('change', latest => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
  }, [formatValue, reduceMotion, springValue]);

  return <span ref={ref} className={className} />;
}
