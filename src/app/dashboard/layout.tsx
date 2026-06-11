'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Wallet,
  Settings, LogOut, Store, Bell, Bot, BarChart3, ChevronLeft, ChevronRight,
  Share2
} from 'lucide-react';
import MotoIcon from '@/components/MotoIcon';
import { useAuth } from '@/stores/auth';

const menu = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/entregadores', label: 'Entregadores', icon: MotoIcon },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/dashboard/robot', label: 'Robô WhatsApp', icon: Bot },
  { href: '/dashboard/compartilhar', label: 'Link da Loja', icon: Share2 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#ff9607] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuth, user, login, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garante que o primeiro render no client seja idêntico ao server (evita hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verifica autenticação apenas após montagem completa
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Se já tem auth no zustand, não precisa verificar de novo
    if (isAuth && user) return;

    // Verifica token no servidor e restaura sessão se necessário
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.success) {
          login(data.data.user, token);
        } else {
          logout();
          router.push('/login');
        }
      })
      .catch(() => {
        if (cancelled) return;
        logout();
        router.push('/login');
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Durante hidratação ou antes de montar, mostra loading consistente
  if (!mounted || (!isAuth && typeof window !== 'undefined' && !localStorage.getItem('token'))) {
    return <LoadingScreen />;
  }

  // Se não autenticado após verificação, não renderiza nada (redirect em andamento)
  if (!isAuth) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'} bg-[#0a0a0f]/80 backdrop-blur-sm border-r border-white/[0.06] flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="p-5 flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="text-xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] bg-clip-text text-transparent">GB</span>.AI
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
                    ? 'bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black font-bold shadow-[0_0_15px_rgba(255,150,7,0.3)]'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
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
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 bg-[#0a0a0f]/50 backdrop-blur-sm sticky top-0 z-10">
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
