'use client';

interface Props {
  className?: string;
}

export default function MotoIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h-2l-1.5 3H9.5" />
      <path d="M5 14l2-2.5L9 14" />
      <path d="M15 14h3l2-2.5" />
      <path d="M13.5 9H17l1.5 2.5" />
      <path d="M6.5 14h11" />
      <path d="M8 9h2" />
    </svg>
  );
}
