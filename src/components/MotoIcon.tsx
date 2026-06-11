'use client';

interface Props {
  className?: string;
}

export default function MotoIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <img
      src="/uploads/download_moto.png"
      alt="Moto"
      className={`${className} flex-shrink-0`}
      style={{ objectFit: 'contain' }}
      draggable={false}
    />
  );
}
