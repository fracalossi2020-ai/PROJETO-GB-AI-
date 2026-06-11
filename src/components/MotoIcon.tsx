'use client';

interface Props {
  className?: string;
}

export default function MotoIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        maskImage: 'url(/uploads/download_moto.png)',
        WebkitMaskImage: 'url(/uploads/download_moto.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        backgroundColor: 'currentColor',
      }}
    />
  );
}
