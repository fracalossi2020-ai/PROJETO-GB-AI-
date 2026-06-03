'use client';

import { useState } from 'react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral');

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'pagamento', label: 'Pagamento' },
    { id: 'horario', label: 'Horário' },
    { id: 'entrega', label: 'Entrega' },
    { id: 'salao', label: 'Salão' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'ifood', label: 'iFood' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-400">Personalize seu estabelecimento</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#ff9607] text-black'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        {activeTab === 'geral' && (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome do estabelecimento</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" defaultValue="Burger King do GB" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" defaultValue="(11) 99999-8888" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" defaultValue="(11) 99999-8888" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" defaultValue="Rua das Delícias, 123" />
            </div>
            <button className="bg-[#ff9607] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors">
              Salvar alterações
            </button>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-4 max-w-xl">
            <div className="bg-[#ff9607]/5 border border-[#ff9607]/20 rounded-xl p-4">
              <p className="text-[#ff9607] font-medium">🤖 Robô de WhatsApp</p>
              <p className="text-sm text-gray-400 mt-1">Configure o robô para responder e confirmar pedidos automaticamente</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número do WhatsApp</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="(11) 99999-9999" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 accent-[#ff9607]" />
              <span>Ativar robô automático</span>
            </div>
            <button className="bg-[#ff9607] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors">
              Conectar WhatsApp
            </button>
          </div>
        )}

        {activeTab === 'ifood' && (
          <div className="space-y-4 max-w-xl">
            <div className="bg-[#ff9607]/5 border border-[#ff9607]/20 rounded-xl p-4">
              <p className="text-[#ff9607] font-medium">🛵 Integração iFood</p>
              <p className="text-sm text-gray-400 mt-1">Conecte sua loja do iFood para gerenciar tudo em um só lugar</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ID do merchant iFood</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Digite seu ID" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 accent-[#ff9607]" />
              <span>Ativar integração com iFood</span>
            </div>
            <button className="bg-[#ff9607] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors">
              Conectar iFood
            </button>
          </div>
        )}

        {!['geral', 'whatsapp', 'ifood'].includes(activeTab) && (
          <p className="text-gray-500">Configurações em desenvolvimento</p>
        )}
      </div>
    </div>
  );
}
