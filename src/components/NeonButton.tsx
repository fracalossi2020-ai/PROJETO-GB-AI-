'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface NeonButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
}

export function NeonButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}: NeonButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300';

  const variants = {
    primary: `
      bg-gradient-to-r from-[#ff9607] to-[#ffaa33]
      text-black
      hover:shadow-[0_0_30px_rgba(255,150,7,0.4)]
      hover:scale-[1.02]
      active:scale-[0.98]
    `,
    secondary: `
      bg-white/[0.05] backdrop-blur-xl
      text-white border border-white/[0.15]
      hover:bg-white/[0.1] hover:border-white/[0.25]
      hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
    `,
    ghost: `
      text-white/70
      hover:text-white
      hover:bg-white/[0.05]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
