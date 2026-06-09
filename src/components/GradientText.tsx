'use client';

import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'full' | 'orange';
}

export function GradientText({ children, className = '', variant = 'full' }: GradientTextProps) {
  const variants = {
    full: 'bg-gradient-to-r from-[#ff9607] via-[#ff0080] to-[#00d4ff] bg-clip-text text-transparent',
    orange: 'bg-gradient-to-r from-[#ffaa33] to-[#ff9607] bg-clip-text text-transparent',
  };

  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
