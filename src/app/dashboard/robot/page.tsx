'use client';

import { useState, useEffect } from 'react';
import {
  Bot, MessageSquare, Send, Save, ToggleLeft, ToggleRight, Plus, Trash2,
  Smartphone, QrCode, CheckCircle2, Power, ShieldCheck, Pencil, RefreshCw,
  Copy, ExternalLink
} from 'lucide-react';

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
  const [connected, setConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLink, setQrLink] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    '👋 Olá! Bem-vindo ao *{nome_loja}*!\n\nSou seu assistente virtual. Posso te ajudar com:\n📋 Cardápio\n📦 Status do pedido\n🛵 Informações de entrega\n\nO que você precisa?'
  );
  const [keywords, setKeywords] = useState<KeywordResponse[]>(DEFAULT_KEYWORDS);
  const [orderStatusTemplate, setOrderStatusTemplate] = useState(
    '📦 *Status do Pedido #{pedido_id}*\n\n🛍️ Cliente: {cliente_nome}\n📍 Endereço: {endereco}\n\n📋 Itens:\n{itens_pedido}\n\n💰 Total: R$ {total}\n💳 Pagamento: {forma_pagamento}\n\n📊 Status: *{status}*\n⏰ Atualizado em: {data_hora}'
  );

  // Keyword editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKw, setEditKw] = useState('');
  const [editResp, setEditResp] = useState('');

  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');

  async function generateQr() {
    setLoadingQr(true);
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();
      if (data.success) {
        setQrCode(data.data.qrCode);
        setQrLink(data.data.link);
      }
    } catch {
      // ignore
    } finally {
      setLoadingQr(false);
    }
  }

  function startEdit(kw: KeywordResponse) {
    setEditingId(kw.id);
    setEditKw(kw.keywords);
    setEditResp(kw.response);
  }

  function saveEdit() {
    if (!editingId) return;
    setKeywords(prev => prev.map(k => k.id === editingId ? { ...k, keywords: editKw, response: editResp } : k));
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditKw('');
    setEditResp('');
  }

  function addKeyword() {
    if (!newKeyword.trim() || !newResponse.trim()) return;
    setKeywords(prev => [...prev, { id: Date.now().toString(), keywords: newKeyword, response: newResponse }]);
    setNewKeyword('');
    setNewResponse('');
  }

  function removeKeyword(id: string) {
    setKeywords(prev => prev.filter(k => k.id !== id));
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
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

      {/* WhatsApp Connection */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Conectar WhatsApp</h3>
        </div>

        {!connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Power className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Status: Desconectado</p>
                <p className="text-xs text-gray-500">Gere o QR Code e escaneie com o WhatsApp do estabelecimento</p>
              </div>
            </div>

            {!qrCode ? (
              <button
                onClick={generateQr}
                disabled={loadingQr}
                className="w-full py-3 bg-[#ff9607] text-black rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingQr ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                {loadingQr ? 'Gerando...' : 'Gerar QR Code'}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4 p-4 bg-white/5 rounded-xl">
                {/* QR Code Image */}
                <div className="bg-white p-3 rounded-xl">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-52 h-52" />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Escaneie com o WhatsApp</p>
                  <p className="text-xs text-gray-500">Abra o WhatsApp no celular → Configurações → Aparelhos conectados → Conectar aparelho</p>
                </div>

                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 w-full">
                  <input
                    value={qrLink}
                    readOnly
                    className="flex-1 bg-transparent text-xs text-gray-400 outline-none"
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(qrLink); }}
                    className="p-1.5 text-gray-500 hover:text-[#ff9607] transition-colors"
                    title="Copiar link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={qrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-[#ff9607] transition-colors"
                    title="Abrir link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setQrCode(null)}
                    className="flex-1 py-2.5 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={generateQr}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Novo QR
                  </button>
                  <button
                    onClick={() => setConnected(true)}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-green-500 text-black rounded-xl text-sm font-bold hover:bg-green-400 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Conectado
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400">WhatsApp Conectado</p>
                <p className="text-xs text-gray-500">Robô ativo e respondendo mensagens automaticamente</p>
              </div>
              <button
                onClick={() => setConnected(false)}
                className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Desconectar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#ff9607]">1.247</p>
                <p className="text-xs text-gray-500">Mensagens enviadas</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-400">98%</p>
                <p className="text-xs text-gray-500">Taxa de resposta</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-400">2s</p>
                <p className="text-xs text-gray-500">Tempo médio de resposta</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
            <span key={tag} className="text-[10px] bg-[#ff9607]/10 text-[#ff9607] px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-[#ff9607]/20 transition-colors"
              onClick={() => setWelcomeMessage(prev => prev + ' ' + tag)}>{tag}</span>
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
            <span key={tag} className="text-[10px] bg-[#ff9607]/10 text-[#ff9607] px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-[#ff9607]/20 transition-colors"
              onClick={() => setOrderStatusTemplate(prev => prev + ' ' + tag)}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Palavras-chave e Respostas Automáticas</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Configure palavras-chave que o robô vai reconhecer e as respostas automáticas. Clique no lápis para editar.</p>

        <div className="space-y-3 mb-4">
          {keywords.map(kw => (
            <div key={kw.id} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">
              {editingId === kw.id ? (
                <div className="p-3 space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Palavras-chave (separadas por vírgula)</label>
                    <input
                      value={editKw}
                      onChange={e => setEditKw(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Resposta automática</label>
                    <textarea
                      value={editResp}
                      onChange={e => setEditResp(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff9607] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors">
                      <CheckCircle2 className="h-3 w-3" /> Salvar
                    </button>
                    <button onClick={cancelEdit} className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#ff9607] bg-[#ff9607]/10 px-2 py-0.5 rounded">{kw.keywords}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(kw)} className="p-1.5 text-gray-500 hover:text-[#ff9607] transition-colors rounded-lg hover:bg-white/5">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeKeyword(kw.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">{kw.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new keyword */}
        <div className="border-t border-white/5 pt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500">Adicionar nova palavra-chave</p>
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
        <h3 className="font-bold text-sm mb-3">Configurações de Notificação</h3>
        <div className="space-y-3">
          {[
            { label: 'Solicitar avaliação após entrega', defaultChecked: true },
            { label: 'Enviar comprovante de pagamento no WhatsApp', defaultChecked: true },
            { label: 'Notificar status do pedido em tempo real', defaultChecked: false },
            { label: 'Informar tempo estimado de entrega automaticamente', defaultChecked: false },
            { label: 'Enviar mensagem quando o pedido sair para entrega', defaultChecked: true },
            { label: 'Enviar lembrete de pedido abandonado no carrinho', defaultChecked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
              <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 accent-[#ff9607]" />
              <span className="text-sm text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2">
        <Save className="h-4 w-4" /> Salvar Configurações do Robô
      </button>
    </div>
  );
}
