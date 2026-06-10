'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useFinanceiroCtx } from '../FinanceiroProvider';
import { ShoppingBag, TrendingUp, Package } from 'lucide-react';
import ExportarPdf from '../ExportarPdf';

const COLORS = ['#ff9607', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

export default function ProdutosTab() {
  const { produtosData, temporalData } = useFinanceiroCtx();
  const { produtos, topLucrativos, categorias } = produtosData;

  const top10Vendidos = produtos.slice(0, 10);
  const top10Lucrativos = topLucrativos.slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Header com exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Produtos</h2>
          <p className="text-gray-400 text-xs">Ranking de vendas, lucratividade e análise por categoria</p>
        </div>
        <ExportarPdf targetId="produtos-tab-content" fileName="relatorio-produtos" label="Baixar PDF" />
      </div>

      <div id="produtos-tab-content" className="space-y-5">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-[#ff9607]" />
              <span className="text-gray-400 text-xs">Produtos Vendidos</span>
            </div>
            <p className="text-2xl font-bold">{produtos.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-green-400" />
              <span className="text-gray-400 text-xs">Total de Itens</span>
            </div>
            <p className="text-2xl font-bold">{produtos.reduce((s, p) => s + p.qty, 0)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400 text-xs">Lucro Total em Produtos</span>
            </div>
            <p className="text-2xl font-bold text-green-400">R$ {produtos.reduce((s, p) => s + p.profit, 0).toFixed(2)}</p>
          </div>
        </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Top 10 Mais Vendidos (Qtd)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10Vendidos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#666" fontSize={11} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
              <Bar dataKey="qty" fill="#ff9607" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Top 10 Mais Lucrativos (R$)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10Lucrativos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" fontSize={11} tickFormatter={v => `R$${v}`} />
              <YAxis dataKey="name" type="category" stroke="#666" fontSize={11} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
              <Bar dataKey="profit" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Receita por Categoria</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categorias} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="revenue">
                {categorias.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {categorias.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Detalhamento por Categoria</h3>
          <div className="space-y-3">
            {categorias.map((cat, i) => {
              const totalRev = categorias.reduce((s, c) => s + c.revenue, 0);
              const pct = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{cat.name}</span>
                    <span className="font-medium">R$ {cat.revenue.toFixed(2)} <span className="text-gray-500">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{cat.qty} itens vendidos</span>
                    <span className="text-green-400">Lucro: R$ {cat.profit.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de produtos */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <h3 className="font-bold text-sm mb-4">Todos os Produtos no Período</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/5">
                <th className="pb-2 pr-4">Produto</th>
                <th className="pb-2 pr-4">Categoria</th>
                <th className="pb-2 pr-4 text-right">Qtd</th>
                <th className="pb-2 pr-4 text-right">Receita</th>
                <th className="pb-2 pr-4 text-right">Custo</th>
                <th className="pb-2 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {produtos.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{p.category}</td>
                  <td className="py-2.5 pr-4 text-right">{p.qty}</td>
                  <td className="py-2.5 pr-4 text-right">R$ {p.revenue.toFixed(2)}</td>
                  <td className="py-2.5 pr-4 text-right text-red-400">R$ {p.cost.toFixed(2)}</td>
                  <td className={`py-2.5 text-right font-bold ${p.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {p.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
