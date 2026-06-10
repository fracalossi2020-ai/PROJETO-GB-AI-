'use client';

import { Users, UserCheck, UserPlus, MapPin } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useFinanceiroCtx } from '../FinanceiroProvider';
import ExportarPdf from '../ExportarPdf';

export default function ClientesTab() {
  const { clientesData, zonasData } = useFinanceiroCtx();
  const { top, totalUnique, recurrent, newClients, retentionRate } = clientesData;

  // Dados para gráfico de bairros
  const bairrosChart = zonasData.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Header com exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Clientes</h2>
          <p className="text-gray-400 text-xs">Fidelização, top clientes e análise por região</p>
        </div>
        <ExportarPdf targetId="clientes-tab-content" fileName="relatorio-clientes" label="Baixar PDF" />
      </div>

      <div id="clientes-tab-content" className="space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400 text-xs">Clientes Únicos</span>
            </div>
            <p className="text-2xl font-bold">{totalUnique}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-green-400" />
              <span className="text-gray-400 text-xs">Recorrentes</span>
            </div>
            <p className="text-2xl font-bold">{recurrent}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-4 w-4 text-[#ff9607]" />
              <span className="text-gray-400 text-xs">Novos</span>
            </div>
            <p className="text-2xl font-bold">{newClients}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-gray-400 text-xs">Taxa de Retenção</span>
            </div>
            <p className="text-2xl font-bold">{retentionRate.toFixed(1)}%</p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Clientes */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Top 10 Clientes</h3>
          <div className="space-y-2">
            {top.map((c, idx) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center text-xs font-bold text-black">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">R$ {c.spent.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{c.orders} pedidos</p>
                </div>
              </div>
            ))}
            {top.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Nenhum cliente no período</p>
            )}
          </div>
        </div>

        {/* Bairros */}
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[#ff9607]" />
              <h3 className="font-bold text-sm">Top Bairros / Zonas</h3>
            </div>
            <div className="space-y-2">
              {zonasData.map((z, idx) => {
                const max = zonasData[0]?.revenue || 1;
                const pct = (z.revenue / max) * 100;
                return (
                  <div key={z.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{idx + 1}. {z.name}</span>
                      <span className="font-medium">R$ {z.revenue.toFixed(0)} · {z.orders} ped</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className="bg-[#ff9607] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {zonasData.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Sem dados de localização</p>
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <h3 className="font-bold text-sm mb-4">Pedidos por Bairro</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bairrosChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#666" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
