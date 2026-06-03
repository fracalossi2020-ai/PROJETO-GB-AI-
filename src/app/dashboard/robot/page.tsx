'use client';

import { useState } from 'react';
import { Bot, MessageSquare, Send, Save, ToggleLeft, ToggleRight, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface KeywordResponse {
  id: string;
  keywords: string;
  response: string;
}

const DEFAULT_KEYWORDS: KeywordResponse[] = [
  { id: '1', keywords: 'cardápio, menu, o que tem', response: '📋 Olá! Aqui está nosso cardápio: {link_cardapio}\n\nQual item te interessa? Posso te ajudar a fazer o pedido!' },
  { id: '2', keywords: 'horário, aberto, fecha', response: '⏰ Nosso horário de funcionamento é:\n{horario_funcionamento}\n\nEstamos ansiosos para atendê-lo!' },
  { id: '3', keywords: 'status, pedido, onde está', response: '📦 Deixe-me verificar o status do seu pedido...\n\nSeu pedido #{pedido_id} está: {status_pedido}\nTempo estimado: {tempo_entrega} minutos' },
  { id: '4', keywords: 'entrega, frete, taxa', response: '🛵 Taxa de entrega:\n{taxa_entrega}\n\nÁreas atendidas: {zonas_entrega}' },
  { id: '5', keywords: 'pix, pagamento, como pagar', response: '💳 Aceitamos:\n✅ PIX\n✅ Dinheiro\n✅ Cartão de Crédito/Débito\n\nChave PIX: {pix_key}' },
];

export default function RobotPage() {
  const [enabled, setEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    '👋 Olá! Bem-vindo ao *{nome_loja}*!\n\nSou seu assistente virtual. Posso te ajudar com:\n📋 Cardápio\n📦 Status do pedido\n🛵 Informações de entrega\n\nO que você precisa?'
  );
  const [keywords, setKeywords] = useState<KeywordResponse[]>(DEFAULT_KEYWORDS);
  const [orderStatusTemplate, setOrderStatusTemplate] = useState(
    '📦 *Status do Pedido #{pedido_id}*\n\n🛍️ Cliente: {cliente_nome}\n📍 Endereço: {endereco}\n\n📋 Itens:\n{itens_pedido}\n\n💰 Total: R$ {total}\n💳 Pagamento: {forma_pagamento}\n\n📊 Status: *{status}*\n⏰ Atualizado em: {data_hora}'
  );
  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');

  function addKeyword() {
    if (!newKeyword.trim() || !newResponse.trim()) return;
    setKeywords([...keywords, { id: Date.now().toString(), keywords: newKeyword, response: newResponse }]);
    setNewKeyword('');
    setNewResponse('');
  }

  function removeKeyword(id: string) {
    setKeywords(keywords.filter(k => k.id !== id));
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Robô WhatsApp</h1>
          <p className="text-gray-400 text-sm">Automatize o atendimento ao cliente via WhatsApp</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            enabled
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {enabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          {enabled ? 'Robô Ativo' : 'Robô Desativado'}
        </button>
      </div>

      {!enabled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-400">Ative o robô para começar a atender seus clientes automaticamente no WhatsApp.</p>
        </div>
      )}

      {/* Welcome Message */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Mensagem de Boas-vindas</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Esta é a primeira mensagem que o cliente recebe ao iniciar uma conversa.</p>
        <textarea
          value={welcomeMessage}
          onChange={e => setWelcomeMessage(e.target.value)}
          rows={5}
          className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-[#ff9607] resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['{nome_loja}', '{link_cardapio}', '{horario_funcionamento}', '{telefone}'].map(tag => (
            <span key={tag} className="text-[10px] bg-[#ff9607]/10 text-[#ff9607] px-1.5 py-0.5 rounded font-mono">{tag}</span>
          ))}
        </div>
      </div>

      {/* Order Status Template */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Send className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Template de Comprovante do Pedido</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Esta mensagem é enviada automaticamente ao cliente com os detalhes do pedido.</p>
        <textarea
          value={orderStatusTemplate}
          onChange={e => setOrderStatusTemplate(e.target.value)}
          rows={8}
          className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-[#ff9607] resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['{pedido_id}', '{cliente_nome}', '{endereco}', '{itens_pedido}', '{total}', '{forma_pagamento}', '{status}', '{data_hora}'].map(tag => (
            <span key={tag} className="text-[10px] bg-[#ff9607]/10 text-[#ff9607] px-1.5 py-0.5 rounded font-mono">{tag}</span>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Palavras-chave e Respostas</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Configure palavras-chave que o robô vai reconhecer e as respostas automáticas.</p>

        <div className="space-y-3 mb-4">
          {keywords.map(kw => (
            <div key={kw.id} className="bg-black/30 border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#ff9607]">{kw.keywords}</span>
                <button onClick={() => removeKeyword(kw.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{kw.response}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            placeholder="Palavras-chave (separadas por vírgula)"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]"
          />
          <textarea
            value={newResponse}
            onChange={e => setNewResponse(e.target.value)}
            placeholder="Resposta automática..."
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607] resize-none"
          />
          <button
            onClick={addKeyword}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-[#ff9607]/10 hover:text-[#ff9607] transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar palavra-chave
          </button>
        </div>
      </div>

      {/* Feedback Settings */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-3">Feedback dos Clientes</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#ff9607]" defaultChecked />
            <span className="text-sm text-gray-300">Solicitar avaliação após entrega</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#ff9607]" defaultChecked />
            <span className="text-sm text-gray-300">Enviar comprovante de pagamento no WhatsApp</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#ff9607]" />
            <span className="text-sm text-gray-300">Notificar status do pedido em tempo real</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#ff9607]" />
            <span className="text-sm text-gray-300">Informar tempo estimado de entrega automaticamente</span>
          </label>
        </div>
      </div>

      <button className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2">
        <Save className="h-4 w-4" /> Salvar Configurações do Robô
      </button>
    </div>
  );
}
