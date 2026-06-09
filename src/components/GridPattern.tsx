'use client';

export function GridPattern({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-40 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

export function GlowOrb({ color = 'orange', className = '' }: { color?: 'orange' | 'cyan' | 'magenta'; className?: string }) {
  const colors = {
    orange: 'bg-[#ff9607] shadow-[0_0_120px_60px_rgba(255,150,7,0.15)]',
    cyan: 'bg-[#00d4ff] shadow-[0_0_120px_60px_rgba(0,212,255,0.15)]',
    magenta: 'bg-[#ff0080] shadow-[0_0_120px_60px_rgba(255,0,128,0.15)]',
  };

  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${colors[color]} ${className}`}
    />
  );
}
