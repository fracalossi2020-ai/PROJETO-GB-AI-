'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Wallet, Settings, LogOut, Store, Bell } from 'lucide-react';
import { useAuth } from '@/stores/auth';

const menu = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuth, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuth && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [isAuth, router]);

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-72 bg-gray-950 border-r border-white/5 flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-2xl font-black">
            <span className="text-[#ff9607]">GB</span>.AI
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-[#ff9607] text-black font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/burger-king-gb"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Store className="h-5 w-5" />
            Ver loja
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8">
          <h2 className="font-bold text-lg">
            {menu.find(m => m.href === pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff9607] rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ff9607] rounded-full flex items-center justify-center text-black font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium">{user?.name || 'Usuário'}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
