import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}

export default function Dock({ items }: { items: DockItem[] }) {
  return (
    <nav aria-label="Applications" className="flex items-end gap-1 rounded-2xl border border-white/15 bg-[#11141b]/75 p-2 shadow-2xl backdrop-blur-2xl">
      {items.map(item => (
        <motion.button
          key={item.id}
          type="button"
          aria-label={item.label}
          title={item.label}
          whileHover={{ y: -8, scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={item.onClick}
          className="group relative grid h-12 w-12 place-items-center rounded-xl border border-white/5 bg-white/[0.06] text-zinc-100 transition-colors hover:bg-white/15"
        >
          {item.icon}
          <span className="pointer-events-none absolute -top-9 scale-90 rounded-md bg-black/80 px-2 py-1 text-[10px] opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">{item.label}</span>
          {item.active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-cyan-300" />}
        </motion.button>
      ))}
    </nav>
  );
}
