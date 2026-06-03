'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const steps = [
  { href: '/setup/step-1-dados', label: 'Dados' },
  { href: '/setup/step-2-pagamento', label: 'Pagamento' },
  { href: '/setup/step-3-horario', label: 'Horário' },
  { href: '/setup/step-4-cardapio', label: 'Cardápio' },
  { href: '/setup/step-5-entrega', label: 'Entrega' },
  { href: '/setup/step-6-salao', label: 'Salão' },
];

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = steps.findIndex(s => s.href === pathname);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/" className="text-2xl font-black">
          <span className="text-[#ff9607]">GB</span>.AI
        </Link>

        <div className="mt-8 mb-10">
          <p className="text-gray-400 text-sm mb-4">
            Configuração inicial • {currentIndex + 1} de {steps.length} passos
          </p>
          <div className="flex gap-2">
            {steps.map((step, i) => (
              <div
                key={step.href}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  i <= currentIndex ? 'bg-[#ff9607]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
