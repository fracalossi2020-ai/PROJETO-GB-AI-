'use client';

import { TrendingUp, TrendingDown, DollarSign, Percent, Truck, Tag, Receipt } from 'lucide-react';
import { useFinanceiroData } from '../useFinanceiroData';
import ExportarPdf from '../ExportarPdf';

export default function LucroTab() {
  const { kpis, lucroData } = useFinanceiroData();
  const { custoTotal, receitaTotal, lucroBruto, margem, cmv, discountTotal, serviceFeeTotal, deliveryFeeTotal, ticketPorTipo } = lucroData;

  return (
    <div className="space-y-5">
      {/* Header com exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Lucro & CMV</h2>
          <p className="text-gray-400 text-xs">Análise de rentabilidade e custos do negócio</p>
        </div>
        <ExportarPdf targetId="lucro-tab-content" fileName="relatorio-lucro-cmv" label="Baixar PDF" />
      </div>

      <div id="lucro-tab-content" className="space-y-5">
        {/* KPIs de lucro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-gray-400 text-xs">Receita Total</span>
          </div>
          <p className="text-2xl font-bold">R$ {receitaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-gray-400 text-xs">Custo dos Produtos (CMV)</span>
          </div>
          <p className="text-2xl font-bold text-red-400">R$ {custoTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{cmv.toFixed(1)}% da receita</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-gray-400 text-xs">Lucro Bruto</span>
          </div>
          <p className="text-2xl font-bold text-green-400">R$ {lucroBruto.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Margem de {margem.toFixed(1)}%</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="h-4 w-4 text-[#ff9607]" />
            <span className="text-gray-400 text-xs">Margem Líquida Est.</span>
          </div>
          <p className="text-2xl font-bold">{margem.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Sem contar despesas fixas</p>
        </div>
      </div>

      {/* Detalhamento de taxas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-red-400" />
            <h3 className="font-bold text-sm">Descontos Concedidos</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">R$ {discountTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {receitaTotal > 0 ? ((discountTotal / receitaTotal) * 100).toFixed(1) : 0}% da receita total
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Descontos reduzem diretamente o lucro. Acompanhe para não extrapolar.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-4 w-4 text-blue-400" />
            <h3 className="font-bold text-sm">Taxa de Serviço (Salão)</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">R$ {serviceFeeTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {receitaTotal > 0 ? ((serviceFeeTotal / receitaTotal) * 100).toFixed(1) : 0}% da receita total
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-4 w-4 text-green-400" />
            <h3 className="font-bold text-sm">Taxa de Entrega</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">R$ {deliveryFeeTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {receitaTotal > 0 ? ((deliveryFeeTotal / receitaTotal) * 100).toFixed(1) : 0}% da receita total
          </p>
        </div>
      </div>

      {/* Ticket por tipo */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <h3 className="font-bold text-sm mb-4">Ticket Médio por Tipo de Pedido</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ticketPorTipo.map(t => (
            <div key={t.type} className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">{t.type}</p>
              <p className="text-2xl font-bold">R$ {t.avg.toFixed(2)}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{t.count} pedidos</span>
                <span>R$ {t.total.toFixed(0)} total</span>
              </div>
            </div>
          ))}
          {ticketPorTipo.length === 0 && (
            <p className="text-sm text-gray-500 col-span-3 text-center py-8">Nenhum pedido entregue no período</p>
          )}
        </div>
      </div>

      {/* Dica */}
      <div className="bg-gradient-to-r from-[#ff9607]/10 to-[#ff0080]/10 border border-[#ff9607]/20 rounded-2xl p-5">
        <h4 className="font-bold text-sm mb-2 text-[#ff9607]">💡 Dica de Gestão</h4>
        <p className="text-sm text-gray-300">
          O CMV ideal para restaurantes fica entre <strong>28% e 35%</strong> da receita. Se o seu está acima de 35%, considere revisar os preços do cardápio ou negociar com fornecedores. Se estiver abaixo de 25%, verifique se a qualidade não está sendo prejudicada.
        </p>
      </div>
      </div>
    </div>
  );
}
