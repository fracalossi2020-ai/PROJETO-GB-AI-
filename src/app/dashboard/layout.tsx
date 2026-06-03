'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Wallet,
  Settings, LogOut, Store, Bell, Bot, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/stores/auth';

const menu = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/dashboard/robot', label: 'Robô WhatsApp', icon: Bot },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuth, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAuth && !token) {
      router.push('/login');
    }
    setChecking(false);
  }, [isAuth, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#ff9607] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuth && !localStorage.getItem('token')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'} bg-zinc-900 border-r border-white/5 flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="p-5 flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="text-xl font-black tracking-tight">
              <span className="text-[#ff9607]">GB</span>.AI
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  active
                    ? 'bg-[#ff9607] text-black font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="/burger-king-gb"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Ver loja' : undefined}
          >
            <Store className="h-5 w-5" />
            {!collapsed && <span>Ver loja</span>}
          </Link>
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm w-full ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="font-bold text-sm text-gray-200">
              {menu.find(m => pathname === m.href || pathname.startsWith(m.href + '/'))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff9607] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-white/5">
              <div className="w-7 h-7 bg-[#ff9607] rounded-full flex items-center justify-center text-black font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="hidden sm:block">
                  <p className="text-xs font-medium">{user?.name || 'Usuário'}</p>
                  <p className="text-[10px] text-gray-500">Administrador</p>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
