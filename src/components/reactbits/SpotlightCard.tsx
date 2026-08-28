// Adapted from React Bits by David Haz. See THIRD_PARTY_NOTICES.md.
import { useRef, useState, type PropsWithChildren } from 'react';

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.14)'
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={event => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      onFocus={() => setOpacity(0.7)}
      onBlur={() => setOpacity(0)}
      onMouseEnter={() => setOpacity(0.7)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 72%)`
        }}
      />
      {children}
    </div>
  );
}
