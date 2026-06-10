'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Package, Users, Settings, DollarSign
} from 'lucide-react';
import { useFinanceiroData, Period } from './components/useFinanceiroData';
import ResumoTab from './components/tabs/ResumoTab';
import ProdutosTab from './components/tabs/ProdutosTab';
import ClientesTab from './components/tabs/ClientesTab';
import OperacionalTab from './components/tabs/OperacionalTab';
import LucroTab from './components/tabs/LucroTab';

type TabKey = 'resumo' | 'produtos' | 'clientes' | 'operacional' | 'lucro';

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: 'resumo', label: 'Resumo', icon: LayoutDashboard },
  { key: 'lucro', label: 'Lucro & CMV', icon: DollarSign },
  { key: 'produtos', label: 'Produtos', icon: Package },
  { key: 'clientes', label: 'Clientes', icon: Users },
  { key: 'operacional', label: 'Operacional', icon: Settings },
];

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('resumo');
  const { loading, period, setPeriod } = useFinanceiroData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Financeiro</h1>
          <p className="text-gray-400 text-sm">Controle completo de receitas, lucros e métricas do seu negócio</p>
        </div>
        <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/5">
          {(['7d', '30d', '90d', 'mes', 'mes_anterior'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '90 dias' : p === 'mes' ? 'Este mês' : 'Mês passado'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black shadow-[0_0_15px_rgba(255,150,7,0.3)]'
                  : 'bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'resumo' && <ResumoTab />}
        {activeTab === 'lucro' && <LucroTab />}
        {activeTab === 'produtos' && <ProdutosTab />}
        {activeTab === 'clientes' && <ClientesTab />}
        {activeTab === 'operacional' && <OperacionalTab />}
      </div>
    </div>
  );
}
