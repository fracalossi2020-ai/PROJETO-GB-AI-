'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'orange' | 'cyan' | 'magenta' | 'none';
  delay?: number;
}

export function GlassCard({ children, className = '', hover = true, glow = 'none', delay = 0 }: GlassCardProps) {
  const glowClasses = {
    orange: 'hover:shadow-[0_0_30px_rgba(255,150,7,0.2)] hover:border-[#ff9607]/30',
    cyan: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] hover:border-[#00d4ff]/30',
    magenta: 'hover:shadow-[0_0_30px_rgba(255,0,128,0.2)] hover:border-[#ff0080]/30',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative rounded-2xl p-6
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        transition-all duration-300
        ${hover ? 'hover:bg-white/[0.06] hover:-translate-y-1' : ''}
        ${glowClasses[glow]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
