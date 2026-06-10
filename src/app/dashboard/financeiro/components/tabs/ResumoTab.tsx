'use client';

import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useFinanceiroCtx } from '../FinanceiroProvider';
import ExportarPdf from '../ExportarPdf';

const PAYMENT_COLORS = ['#ff9607', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

function KpiCard({ title, value, subtitle, icon: Icon, color, trend, negative }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            negative ? (trend >= 0 ? 'text-red-400' : 'text-green-400') : (trend >= 0 ? 'text-green-400' : 'text-red-400')
          }`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-xs">{title}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

export default function ResumoTab() {
  const { kpis, temporalData, paymentData, previsao, meta, saveMeta, period } = useFinanceiroCtx();

  const metaInput = meta;
  const progress = metaInput > 0 ? Math.min(100, (previsao.monthRevenue / metaInput) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header com exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Resumo Financeiro</h2>
          <p className="text-gray-400 text-xs">Visão geral de receitas, metas e formas de pagamento</p>
        </div>
        <ExportarPdf targetId="resumo-tab-content" fileName="relatorio-resumo" label="Baixar PDF" />
      </div>

      <div id="resumo-tab-content" className="space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Faturamento" value={`R$ ${kpis.revenue.toFixed(2)}`} icon={DollarSign} color="bg-green-500" trend={kpis.revenueGrowth} />
          <KpiCard title="Pedidos" value={String(kpis.orderCount)} subtitle="No período" icon={Wallet} color="bg-[#ff9607]" trend={kpis.orderGrowth} />
        <KpiCard title="Ticket Médio" value={`R$ ${kpis.avgTicket.toFixed(2)}`} icon={TrendingUp} color="bg-blue-500" />
        <KpiCard title="Cancelamentos" value={`R$ ${kpis.cancelledValue.toFixed(2)}`} subtitle={`${kpis.cancelledCount} pedidos`} icon={TrendingDown} color="bg-red-500" negative />
      </div>

      {/* Meta + Previsão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Faturamento Diário</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={temporalData.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} formatter={(value: any, name: any) => [name === 'revenue' ? `R$ ${Number(value).toFixed(2)}` : value, name === 'revenue' ? 'Faturamento' : 'Lucro']} />
              <Bar dataKey="revenue" fill="#ff9607" radius={[4, 4, 0, 0]} name="Faturamento" />
              <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {/* Meta */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-[#ff9607]" />
              <h3 className="font-bold text-sm">Meta do Mês</h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-xs">R$</span>
              <input
                type="number"
                value={metaInput || ''}
                onChange={e => saveMeta(Number(e.target.value))}
                placeholder="Digite a meta"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:border-[#ff9607]"
              />
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 mb-2">
              <div className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{progress.toFixed(1)}% atingido</span>
              <span>R$ {previsao.monthRevenue.toFixed(0)} / R$ {metaInput.toFixed(0)}</span>
            </div>
          </div>

          {/* Previsão */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <h3 className="font-bold text-sm mb-2">Previsão de Fechamento</h3>
            <p className="text-2xl font-bold text-green-400">R$ {previsao.projected.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Média diária: R$ {previsao.dailyAvg.toFixed(0)} · Dia {previsao.daysPassed} de {previsao.daysInMonth}
            </p>
          </div>

          {/* Comparativo */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <h3 className="font-bold text-sm mb-2">vs Período Anterior</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Faturamento ant.</span>
                <span className="font-medium">R$ {kpis.prevRevenue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pedidos ant.</span>
                <span className="font-medium">{kpis.prevOrderCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Por Forma de Pagamento</h3>
          {paymentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {paymentData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                      <span className="text-gray-400">{item.name}</span>
                    </div>
                    <span className="font-medium">R$ {item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-gray-500">
              <div className="w-24 h-24 rounded-full border-8 border-white/10 mb-3" />
              <p className="text-sm">Sem dados de pagamento</p>
              <p className="text-xs text-gray-600">Nenhum pedido entregue no período</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Resumo por Forma de Pagamento</h3>
          {paymentData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentData.map((item, i) => (
                <div key={item.name} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PAYMENT_COLORS[i % PAYMENT_COLORS.length]}20` }}>
                      <DollarSign className="h-4 w-4" style={{ color: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <p className="text-lg font-bold">R$ {item.value.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {kpis.revenue > 0 ? ((item.value / kpis.revenue) * 100).toFixed(1) : 0}% do total
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-gray-500">
              <DollarSign className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma forma de pagamento registrada</p>
              <p className="text-xs text-gray-600">Adicione pedidos para ver o resumo</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
