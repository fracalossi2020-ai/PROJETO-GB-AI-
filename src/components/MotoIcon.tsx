'use client';

interface Props {
  className?: string;
}

export default function MotoIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <img
      src="/uploads/download.png"
      alt="Moto"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
