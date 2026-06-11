'use client';

interface Props {
  className?: string;
}

export default function MotoIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <span
      className={`inline-block flex-shrink-0 ${className}`}
      style={{
        maskImage: 'url(/uploads/download_moto.png)',
        WebkitMaskImage: 'url(/uploads/download_moto.png)',
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        backgroundColor: 'currentColor',
        aspectRatio: '1 / 1',
      }}
    />
  );
}
