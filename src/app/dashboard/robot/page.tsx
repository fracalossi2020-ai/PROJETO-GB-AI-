'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bot, MessageSquare, Send, Save, ToggleLeft, ToggleRight, Plus, Trash2,
  Smartphone, QrCode, CheckCircle2, Power, ShieldCheck, Pencil, RefreshCw,
  Copy, ExternalLink, AlertTriangle
} from 'lucide-react';

interface KeywordResponse {
  id: string;
  keywords: string;
  response: string;
}

interface WpStatus {
  qr: string | null;
  connected: boolean;
  phone: string | null;
  state: string;
  message: string;
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
  const [wpStatus, setWpStatus] = useState<WpStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    '👋 Olá! Bem-vindo ao *{nome_loja}*!\n\nSou seu assistente virtual. Posso te ajudar com:\n📋 Cardápio\n📦 Status do pedido\n🛵 Informações de entrega\n\nO que você precisa?'
  );
  const [keywords, setKeywords] = useState<KeywordResponse[]>(DEFAULT_KEYWORDS);
  const [orderStatusTemplate, setOrderStatusTemplate] = useState(
    '📦 *Status do Pedido #{pedido_id}*\n\n🛍️ Cliente: {cliente_nome}\n📍 Endereço: {endereco}\n\n📋 Itens:\n{itens_pedido}\n\n💰 Total: R$ {total}\n💳 Pagamento: {forma_pagamento}\n\n📊 Status: *{status}*\n⏰ Atualizado em: {data_hora}'
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKw, setEditKw] = useState('');
  const [editResp, setEditResp] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');

  // Polling do status do WhatsApp
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkStatus() {
      try {
        const res = await fetch('/api/whatsapp/status');
        const data = await res.json();
        if (data.success) {
          setWpStatus(data.data);
          // Se conectou, ativa o robô automaticamente
          if (data.data.connected && !enabled) {
            setEnabled(true);
          }
        }
      } catch {
        // ignore
      }
    }

    checkStatus();
    interval = setInterval(checkStatus, 1500);
    return () => clearInterval(interval);
  }, [enabled]);

  async function generateQr() {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();
      if (data.success) {
        setWpStatus(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
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

  const phoneDisplay = wpStatus?.phone
    ? wpStatus.phone.startsWith('55') ? `+${wpStatus.phone}` : wpStatus.phone
    : null;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Robô WhatsApp</h1>
          <p className="text-gray-400 text-sm">Automatize o atendimento ao cliente via WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border ${
            wpStatus?.connected
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : enabled
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {wpStatus?.connected ? <ShieldCheck className="h-4 w-4" /> : enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {wpStatus?.connected ? 'Conectado' : enabled ? 'Robô Ativo' : 'Desconectado'}
          </div>
          {/* Phone number */}
          {phoneDisplay && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#ff9607]/10 text-[#ff9607] rounded-xl text-sm font-bold border border-[#ff9607]/20">
              <Smartphone className="h-4 w-4" />
              {phoneDisplay}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Connection */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Conectar WhatsApp</h3>
        </div>

        {!wpStatus?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Power className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">WhatsApp desconectado</p>
                <p className="text-xs text-gray-500">
                  {wpStatus?.state === 'offline'
                    ? 'Inicie o servidor WhatsApp no terminal: node scripts/whatsapp-server.js'
                    : 'Gere o QR Code e escaneie com o WhatsApp'}
                </p>
              </div>
            </div>

            {wpStatus?.state === 'offline' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Servidor WhatsApp não iniciado</p>
                    <p className="text-xs text-gray-400 mt-1">Para conectar seu WhatsApp, abra um terminal separado e rode:</p>
                    <code className="block mt-2 bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400">
                      node scripts/whatsapp-server.js
                    </code>
                  </div>
                </div>
              </div>
            )}

            {wpStatus?.qr ? (
              <div className="flex flex-col items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="bg-white p-3 rounded-xl">
                  <img src={wpStatus.qr} alt="QR Code WhatsApp" className="w-52 h-52" />
                </div>

                <div className="text-center space-y-2">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <p className="text-sm font-bold text-red-400">⏱️ QR Code atualiza automaticamente!</p>
                    <p className="text-xs text-gray-400 mt-1">Escaneie RÁPIDO — o QR code muda a cada 20 segundos</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                    <p className="text-sm font-bold text-green-400">📱 Escaneie dentro do WhatsApp</p>
                    <p className="text-xs text-gray-400 mt-1">Abra o WhatsApp → Configurações → Aparelhos Conectados → Conectar Aparelho</p>
                  </div>
                </div>

                <button
                  onClick={generateQr}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar QR
                </button>
              </div>
            ) : (
              <button
                onClick={generateQr}
                disabled={loading}
                className="w-full py-3 bg-[#ff9607] text-black rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                {loading ? 'Gerando...' : 'Gerar QR Code'}
              </button>
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
                <p className="text-xs text-gray-500">{phoneDisplay} · Robô ativo e respondendo</p>
              </div>
              <button
                onClick={() => { setEnabled(false); }}
                className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Desativar Robô
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
        <p className="text-xs text-gray-500 mb-4">Configure palavras-chave que o robô vai reconhecer. Clique no lápis para editar.</p>

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
                    <span className="text-xs font-medium text-[#ff9607] bg-[#ff9607]/10 px-2 py-0.5 rounded">{kw.keywords}</span>
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

      <button className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2">
        <Save className="h-4 w-4" /> Salvar Configurações do Robô
      </button>
    </div>
  );
}
