'use client';

import { Clock, ShoppingBag, TrendingUp, TrendingDown, Star, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useFinanceiroData } from '../useFinanceiroData';

const TYPE_COLORS = ['#ff9607', '#22c55e', '#3b82f6'];

function RelCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-sm p-4">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function OperacionalTab() {
  const { kpis, temporalData, typeData, tempoMedio, allFiltered, delivered } = useFinanceiroData();
  const { weekday, hourly } = temporalData;

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekdayData = diasSemana.map((day, i) => {
    const d = weekday.find(w => w.day === day);
    return { day, revenue: d?.revenue || 0, orders: d?.orders || 0 };
  });

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <RelCard icon={ShoppingBag} label="Total Pedidos" value={String(allFiltered.length)} color="bg-blue-500" />
        <RelCard icon={TrendingUp} label="Entregues" value={String(delivered.length)} color="bg-green-500" />
        <RelCard icon={TrendingDown} label="Cancelados" value={String(kpis.cancelledCount)} color="bg-red-500" />
        <RelCard icon={Clock} label="Tempo Médio" value={`${tempoMedio.toFixed(0)} min`} color="bg-purple-500" />
        <RelCard icon={Star} label="Taxa Conversão" value={`${allFiltered.length > 0 ? ((delivered.length / allFiltered.length) * 100).toFixed(0) : 0}%`} color="bg-[#ff9607]" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Faturamento por Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#ff9607" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Pedidos por Hora do Dia</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="orders" stroke="#ff9607" strokeWidth={2} dot={{ fill: '#ff9607', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Pedidos por Tipo</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {typeData.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {typeData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="font-medium">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Resumo Operacional</h3>
          <div className="space-y-3">
            <SummaryRow label="Total de pedidos" value={allFiltered.length.toString()} />
            <SummaryRow label="Pedidos entregues" value={delivered.length.toString()} color="text-green-400" />
            <SummaryRow label="Pedidos cancelados" value={kpis.cancelledCount.toString()} color="text-red-400" />
            <SummaryRow label="Faturamento bruto" value={`R$ ${kpis.revenue.toFixed(2)}`} />
            <SummaryRow label="Ticket médio" value={`R$ ${kpis.avgTicket.toFixed(2)}`} />
            <SummaryRow label="Taxa de conversão" value={`${allFiltered.length > 0 ? ((delivered.length / allFiltered.length) * 100).toFixed(1) : 0}%`} />
            <SummaryRow label="Tempo médio (estimado)" value={`${tempoMedio.toFixed(0)} minutos`} />
            <SummaryRow label="Média diária" value={`${(delivered.length / Math.max(1, temporalData.daily.filter(d => d.orders > 0).length || temporalData.daily.length)).toFixed(1)} pedidos`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}
