import { useEffect, useRef, type MouseEvent, type PropsWithChildren } from 'react';

type Spark = { x: number; y: number; angle: number; bornAt: number };

export default function ClickSpark({ children }: PropsWithChildren) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const now = performance.now();
    context.clearRect(0, 0, canvas.width, canvas.height);
    sparksRef.current = sparksRef.current.filter(spark => now - spark.bornAt < 430);

    for (const spark of sparksRef.current) {
      const progress = (now - spark.bornAt) / 430;
      const distance = 12 + progress * 34;
      const length = 10 * (1 - progress);
      const x = spark.x + Math.cos(spark.angle) * distance;
      const y = spark.y + Math.sin(spark.angle) * distance;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + Math.cos(spark.angle) * length, y + Math.sin(spark.angle) * length);
      context.strokeStyle = `rgba(103, 232, 249, ${1 - progress})`;
      context.lineWidth = 2;
      context.stroke();
    }

    frameRef.current = sparksRef.current.length ? requestAnimationFrame(draw) : null;
  };

  const spark = (event: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    sparksRef.current.push(...Array.from({ length: 8 }, (_, index) => ({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      angle: (Math.PI * 2 * index) / 8,
      bornAt: performance.now()
    })));
    if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
  };

  return (
    <div className="relative" onClick={spark}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        width={typeof window === 'undefined' ? 1920 : window.innerWidth}
        height={typeof window === 'undefined' ? 1080 : window.innerHeight}
        className="pointer-events-none fixed inset-0 z-[100] h-screen w-screen"
      />
    </div>
  );
}
