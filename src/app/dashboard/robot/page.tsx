'use client';

import { useState, useEffect } from 'react';
import {
  Bot, MessageSquare, Send, Save, ToggleLeft, ToggleRight, Plus, Trash2,
  Smartphone, QrCode, CheckCircle2, Power, ShieldCheck, Pencil, RefreshCw,
  AlertTriangle, UserCheck
} from 'lucide-react';
import TechToast, { ToastData } from '@/components/TechToast';

interface KeywordResponse {
  id: string;
  keywords: string;
  response: string;
}

interface WpStatus {
  qr: string | null;
  qrUrl: string | null;
  pairingCode: string | null;
  connected: boolean;
  phone: string | null;
  state: string;
  message: string;
  updatedAt?: string;
}

interface RobotConfig {
  enabled: boolean;
  testNumbers: string[];
  welcomeMessage: string;
  keywords: KeywordResponse[];
}

const DEFAULT_KEYWORDS: KeywordResponse[] = [
  { id: '1', keywords: 'cardápio, menu, o que tem', response: '📋 Acesse nosso cardápio:\nhttp://localhost:3000/hamburgueria-dois-irmaos\n\nQual item te interessa?' },
  { id: '2', keywords: 'horário, aberto, fecha', response: '⏰ Funcionamos todos os dias das 08:00 às 22:00.' },
  { id: '3', keywords: 'pedido, status, onde está', response: '📦 Para verificar seu pedido, acesse:\nhttp://localhost:3000/pedido/{id_do_pedido}\n\n_Substitua {id_do_pedido} pelo código do seu pedido._' },
  { id: '4', keywords: 'entrega, frete, taxa', response: '🛵 Taxa de entrega: R$ 5,00\nTempo estimado: 25-45 minutos' },
  { id: '5', keywords: 'pix, pagamento, como pagar', response: '💳 Aceitamos:\n✅ PIX\n✅ Dinheiro\n✅ Cartão de Crédito/Débito\n\nChave PIX: admin@gbai.com' },
];

export default function RobotPage() {
  const [wpStatus, setWpStatus] = useState<WpStatus | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingPhone, setPairingPhone] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Notificações toast tecnológicas
  const [toasts, setToasts] = useState<ToastData[]>([]);

  function addToast(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Configurações do robô
  const [robotEnabled, setRobotEnabled] = useState(false);
  const [testNumbers, setTestNumbers] = useState<string[]>([]);
  const [newTestNumber, setNewTestNumber] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState(
    "👋 Olá! Bem-vindo!\n\nSou o assistente virtual. Escolha uma opção:\n\n1 - Cardápio\n2 - Horário de funcionamento\n3 - Status do pedido\n4 - Entrega\n5 - Pagamento\n\nDigite o número ou escreva o que deseja."
  );
  const [originalWelcomeMessage, setOriginalWelcomeMessage] = useState('');
  const [keywords, setKeywords] = useState<KeywordResponse[]>(DEFAULT_KEYWORDS);
  const [orderStatusTemplate, setOrderStatusTemplate] = useState(
    '🛒 *Pedido #{numero_pedido} confirmado!*\n\nOi {cliente_nome}! 👋\nRecebemos seu pedido na *{nome_loja}*:\n\n📋 Itens:\n{itens_pedido}\n\n💰 *Total: R$ {total}*\n📊 Status: *Em preparação* ⏳\n\nEstamos preparando com muito carinho! 🍳\n\nPrecisa de mais alguma coisa? É só mandar aqui! 😊'
  );
  const [originalOrderStatusTemplate, setOriginalOrderStatusTemplate] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKw, setEditKw] = useState('');
  const [editResp, setEditResp] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');

  // Carrega configurações do robô
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/whatsapp/config');
        const data = await res.json();
        if (data.success) {
          const cfg = data.data;
          setRobotEnabled(cfg.enabled ?? false);
          setTestNumbers(cfg.testNumbers ?? []);
          if (cfg.welcomeMessage) {
            setWelcomeMessage(cfg.welcomeMessage);
            setOriginalWelcomeMessage(cfg.welcomeMessage);
          }
          if (cfg.keywords && cfg.keywords.length > 0) setKeywords(cfg.keywords);
          if (cfg.orderStatusTemplate) {
            setOrderStatusTemplate(cfg.orderStatusTemplate);
            setOriginalOrderStatusTemplate(cfg.orderStatusTemplate);
          }
        }
      } catch {
        // ignora
      }
    }
    loadConfig();
  }, []);

  // Polling do status do WhatsApp
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkStatus() {
      try {
        const res = await fetch('/api/whatsapp/status');
        const data = await res.json();
        if (data.success) {
          setWpStatus(data.data);
          if (data.data.qrUrl) {
            setQrUrl(data.data.qrUrl);
          } else if (data.data.state !== 'qr') {
            setQrUrl(null);
          }
          if (data.data.pairingCode) {
            setPairingCode(data.data.pairingCode);
          } else if (data.data.state !== 'pairing') {
            setPairingCode(null);
          }
          // Sincroniza estado ativo baseado na conexão real
          if (data.data.connected) {
            setRobotEnabled(true);
          } else if (data.data.state === 'disabled') {
            setRobotEnabled(false);
          }
        }
      } catch {
        // ignore
      }
    }

    checkStatus();
    interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  function generateWelcomeMessage() {
    if (keywords.length === 0) {
      return "👋 Olá! Bem-vindo!\n\nSou o assistente virtual.\n\nO que você precisa?";
    }
    const menu = keywords.map((kw, idx) => `${idx + 1} - ${kw.keywords.split(',')[0].trim()}`).join('\n');
    return `👋 Olá! Bem-vindo!\n\nSou o assistente virtual. Escolha uma opção:\n\n${menu}\n\nDigite o número ou escreva o que deseja.`;
  }

  function cancelWelcomeMessage() {
    setWelcomeMessage(originalWelcomeMessage || "👋 Olá! Bem-vindo!\n\nSou o assistente virtual. Escolha uma opção:\n\n1 - Cardápio\n2 - Horário de funcionamento\n3 - Status do pedido\n4 - Entrega\n5 - Pagamento\n\nDigite o número ou escreva o que deseja.");
  }

  async function saveWelcomeMessageOnly() {
    if (saving) return;
    setSaving(true);
    try {
      const current = await fetch('/api/whatsapp/config').then(r => r.json());
      const cfg = current.success ? current.data : {};
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cfg,
          welcomeMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalWelcomeMessage(welcomeMessage);
        addToast('Preview salvo com sucesso!', 'success');
      } else {
        addToast('Erro ao salvar mensagem', 'error');
      }
    } catch {
      addToast('Erro ao salvar mensagem', 'error');
    } finally {
      setSaving(false);
    }
  }

  function cancelOrderTemplate() {
    setOrderStatusTemplate(originalOrderStatusTemplate || '🛒 *Pedido #{numero_pedido} confirmado!*\n\nOi {cliente_nome}! 👋\nRecebemos seu pedido na *{nome_loja}*:\n\n📋 Itens:\n{itens_pedido}\n\n💰 *Total: R$ {total}*\n📊 Status: *Em preparação* ⏳\n\nEstamos preparando com muito carinho! 🍳\n\nPrecisa de mais alguma coisa? É só mandar aqui! 😊');
  }

  async function saveOrderTemplateOnly() {
    if (saving) return;
    setSaving(true);
    try {
      const current = await fetch('/api/whatsapp/config').then(r => r.json());
      const cfg = current.success ? current.data : {};
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cfg,
          orderStatusTemplate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalOrderStatusTemplate(orderStatusTemplate);
        addToast('Preview salvo com sucesso!', 'success');
      } else {
        addToast('Erro ao salvar template', 'error');
      }
    } catch {
      addToast('Erro ao salvar template', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveConfig() {
    if (saving) return;
    setSaving(true);
    const autoWelcome = generateWelcomeMessage();
    setWelcomeMessage(autoWelcome);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: robotEnabled,
          testNumbers,
          welcomeMessage: autoWelcome,
          keywords,
          orderStatusTemplate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Preview salvo com sucesso!', 'success');
      } else {
        addToast('Erro ao salvar configurações', 'error');
      }
    } catch {
      addToast('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  }

  function openModal(message: string) {
    setModalMessage(message);
    setShowModal(true);
  }

  async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 4000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Timeout');
      }
      throw err;
    }
  }

  async function toggleRobot() {
    if (robotEnabled) {
      setEnabling(true);
      try {
        const res = await fetchWithTimeout('/api/whatsapp/disable', { method: 'POST' }, 4000);
        const data = await res.json();
        if (data.success) {
          setRobotEnabled(false);
          setQrUrl(null);
          setPairingCode(null);
        } else {
          openModal('Não é possível desativar o robô no momento. Tente novamente.');
        }
      } catch {
        openModal('Não é possível desativar pois o servidor WhatsApp não está respondendo.');
      } finally {
        setEnabling(false);
      }
    } else {
      setEnabling(true);
      try {
        const res = await fetchWithTimeout('/api/whatsapp/enable', { method: 'POST' }, 4000);
        const data = await res.json();
        if (data.success) {
          setRobotEnabled(data.activationPending || data.robotEnabled);
          // Se o QR já estiver disponível no servidor, mostra imediatamente
          if (data.qrUrl) {
            setQrUrl(data.qrUrl + '?t=' + Date.now());
          }
          if (data.pairingCode) {
            setPairingCode(data.pairingCode);
          }
          if (!data.robotEnabled && !data.qrUrl && data.activationPending) {
            setQrUrl(null);
            setPairingCode(null);
          }
        } else {
          openModal(data.error || 'Não é possível ativar pois precisa de um aparelho conectado');
        }
      } catch {
        openModal('Não é possível ativar pois precisa de um aparelho conectado');
      } finally {
        setEnabling(false);
      }
    }
  }

  async function generateQr() {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();
      if (data.success) {
        setWpStatus(data.data);
        if (data.data.qrUrl) {
          setQrUrl(data.data.qrUrl);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function addTestNumber() {
    if (!newTestNumber.trim()) return;
    const clean = newTestNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      alert('Número inválido');
      return;
    }
    if (!testNumbers.includes(clean)) {
      setTestNumbers(prev => [...prev, clean]);
    }
    setNewTestNumber('');
  }

  function removeTestNumber(num: string) {
    setTestNumbers(prev => prev.filter(n => n !== num));
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
          <p className="text-gray-400 text-sm">Controle total do atendimento automático</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border ${
            wpStatus?.connected
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {wpStatus?.connected ? <ShieldCheck className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            {wpStatus?.connected ? 'Conectado' : 'Desconectado'}
          </div>
          {phoneDisplay && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#ff9607]/10 text-[#ff9607] rounded-xl text-sm font-bold border border-[#ff9607]/20">
              <Smartphone className="h-4 w-4" />
              {phoneDisplay}
            </div>
          )}
        </div>
      </div>

      {/* Controle Master — Ativar/Desativar Robô */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Power className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Controle do Robô</h3>
        </div>

        {(() => {
          const isActive = wpStatus?.connected;
          const isActivating = robotEnabled && !isActive;
          return (
            <div className={`p-4 rounded-xl border mb-4 ${
              isActive
                ? 'bg-green-500/5 border-green-500/20'
                : isActivating
                  ? 'bg-[#ff9607]/5 border-[#ff9607]/20'
                  : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-bold ${
                    isActive ? 'text-green-400' : isActivating ? 'text-[#ff9607]' : 'text-red-400'
                  }`}>
                    {isActive
                      ? '🟢 Robô ATIVO — respondendo todo mundo'
                      : isActivating
                        ? '🟠 Robô ATIVANDO — aguardando conexão'
                        : '🔴 Robô DESATIVADO — silencioso'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isActive
                      ? 'O robô vai responder qualquer mensagem que receber.'
                      : isActivating
                        ? 'Leia o QR Code ou use o código de pareamento para conectar.'
                        : 'O robô NÃO responde NINGUÉM, exceto números de teste (abaixo).'}
                  </p>
                </div>
                <button
                  onClick={toggleRobot}
                  disabled={enabling}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                    isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                      : isActivating
                        ? 'bg-[#ff9607]/20 text-[#ff9607] border border-[#ff9607]/30 hover:bg-[#ff9607]/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  }`}
                >
                  {enabling ? <RefreshCw className="h-5 w-5 animate-spin" /> : (robotEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />)}
                  {enabling ? 'Processando...' : (robotEnabled ? 'Desativar' : 'Ativar')}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Números de Teste */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-cyan-400" />
            <h4 className="font-bold text-sm text-cyan-400">Números de Teste (Whitelist)</h4>
          </div>
          <p className="text-xs text-gray-500">
            Mesmo com o robô DESATIVADO, esses números <strong>sempre</strong> recebem respostas.
            Adicione seu número para testar antes de ativar para todos.
          </p>

          {testNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {testNumbers.map(num => (
                <div key={num} className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-2.5 py-1">
                  <span className="text-xs text-cyan-400 font-mono">{num}</span>
                  <button
                    onClick={() => removeTestNumber(num)}
                    className="text-cyan-400/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="tel"
              value={newTestNumber}
              onChange={e => setNewTestNumber(e.target.value)}
              placeholder="Número com DDD (ex: 11999998888)"
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
              onKeyDown={e => { if (e.key === 'Enter') addTestNumber(); }}
            />
            <button
              onClick={addTestNumber}
              className="px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-sm text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Connection */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Conectar WhatsApp</h3>
        </div>

        {!wpStatus?.connected ? (
          <div className="space-y-4">
            {wpStatus?.state === 'offline' || !wpStatus ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Servidor WhatsApp não está respondendo</p>
                    <p className="text-xs text-gray-400 mt-1">O servidor precisa estar rodando para gerar o QR Code. Se você é o desenvolvedor, inicie com:</p>
                    <code className="block mt-2 bg-[#050505]/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400">
                      node scripts/whatsapp-server.js
                    </code>
                  </div>
                </div>
              </div>
            ) : robotEnabled ? (
              /* Ativando / QR / Pairing - Área unificada de conexão */
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-4 p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                  {qrUrl ? (
                    <>
                      <div className="bg-white p-4 rounded-2xl shadow-lg">
                        <img
                          src={qrUrl}
                          alt="QR Code WhatsApp"
                          className="w-56 h-56"
                          key={qrUrl}
                        />
                      </div>
                      {wpStatus?.updatedAt && (
                        <p className="text-[10px] text-white/30">
                          QR atualizado: {new Date(wpStatus.updatedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-16 h-16 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 text-[#ff9607] animate-spin" />
                      </div>
                      <p className="text-sm font-medium text-[#ff9607]">Gerando QR Code...</p>
                      <p className="text-xs text-gray-500">Aguarde alguns segundos</p>
                    </div>
                  )}

                  <div className="text-center space-y-3 max-w-sm w-full">
                    <div className="bg-[#ff9607]/10 border border-[#ff9607]/20 rounded-xl p-3">
                      <p className="text-sm font-bold text-[#ff9607]">📱 Como conectar</p>
                      <ol className="text-xs text-white/60 mt-2 text-left space-y-1 list-decimal list-inside">
                        <li>Abra o <strong>WhatsApp</strong> no seu celular</li>
                        <li>Toque em <strong>Configurações</strong> (ou ⋮ no Android)</li>
                        <li>Escolha <strong>Aparelhos vinculados / Dispositivos vinculados</strong></li>
                        <li>Toque em <strong>Vincular um dispositivo</strong></li>
                        <li><strong>Aponte a câmera</strong> para o QR Code acima</li>
                      </ol>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                      <p className="text-xs text-blue-400">
                        💡 O QR Code muda a cada ~20-40 segundos. A imagem atualiza automaticamente — escaneie rapidamente!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Código de pareamento — sempre visível abaixo */}
                <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="h-4 w-4 text-cyan-400" />
                    <h4 className="font-bold text-sm">Código de pareamento (mais fácil)</h4>
                  </div>
                  <p className="text-xs text-white/40 mb-3">
                    Em vez de escanear QR Code, digite um código de 8 dígitos no celular.
                  </p>

                  {pairingCode ? (
                    <div className="text-center space-y-3">
                      <div className="bg-[#050505] border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-xs text-white/40 mb-1">Seu código</p>
                        <p className="text-4xl font-black tracking-[0.3em] text-cyan-400">{pairingCode}</p>
                      </div>
                      <div className="text-left bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                        <p className="text-xs text-cyan-400 font-bold mb-1">Como usar:</p>
                        <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
                          <li>Abra o <strong>WhatsApp</strong> no celular</li>
                          <li>Toque em <strong>Configurações → Aparelhos vinculados</strong></li>
                          <li>Toque em <strong>Vincular com número de telefone</strong></li>
                          <li>Digite o código acima: <strong>{pairingCode}</strong></li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="tel"
                        value={pairingPhone}
                        onChange={(e) => setPairingPhone(e.target.value)}
                        placeholder="Seu número com DDD (ex: 11999998888)"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                      <button
                        onClick={async () => {
                          if (!pairingPhone.trim()) return;
                          setPairingLoading(true);
                          try {
                            const res = await fetch('/api/whatsapp/pairing-code', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phoneNumber: pairingPhone }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setPairingCode(data.data.code);
                              setQrUrl(null);
                            } else {
                              alert(data.message);
                            }
                          } catch {
                            alert('Erro ao gerar código');
                          } finally {
                            setPairingLoading(false);
                          }
                        }}
                        disabled={pairingLoading || !pairingPhone.trim()}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {pairingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                        {pairingLoading ? 'Gerando código...' : 'Gerar código de pareamento'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Power className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">WhatsApp desconectado</p>
                  <p className="text-xs text-gray-500">Clique em "Ativar" acima para iniciar a conexão.</p>
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
                <p className="text-xs text-gray-500">{phoneDisplay} · Pronto para uso</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setEnabling(true);
                try {
                  const res = await fetchWithTimeout('/api/whatsapp/logout', { method: 'POST' }, 10000);
                  const data = await res.json();
                  if (data.success) {
                    setRobotEnabled(false);
                    setQrUrl(null);
                    setPairingCode(null);
                    setWpStatus(prev => prev ? { ...prev, connected: false, state: 'disabled', phone: null } : null);
                  } else {
                    openModal(data.error || 'Erro ao desconectar.');
                  }
                } catch {
                  openModal('Não foi possível desconectar. Tente novamente.');
                } finally {
                  setEnabling(false);
                }
              }}
              disabled={enabling}
              className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {enabling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              {enabling ? 'Desconectando...' : 'Desconectar WhatsApp'}
            </button>
          </div>
        )}
      </div>

      {/* Welcome Message */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Mensagem de Boas-vindas</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Esta é a primeira mensagem que o cliente recebe. O menu com números é gerado automaticamente baseado nas palavras-chave abaixo.</p>
        <textarea
          value={welcomeMessage}
          onChange={e => setWelcomeMessage(e.target.value)}
          rows={5}
          className="w-full bg-[#050505]/30 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-[#ff9607] resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['{nome_loja}', '{link_cardapio}', '{horario_funcionamento}', '{telefone}'].map(tag => (
            <span key={tag} className="text-[10px] bg-[#ff9607]/10 text-[#ff9607] px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-[#ff9607]/20 transition-colors"
              onClick={() => setWelcomeMessage(prev => prev + ' ' + tag)}>{tag}</span>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={saveWelcomeMessageOnly}
            disabled={saving}
            className="flex-1 bg-[#ff9607] text-black py-2.5 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Salvar Mensagem'}
          </button>
          <button
            onClick={cancelWelcomeMessage}
            disabled={saving}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Order Status Template */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Send className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Template de Comprovante do Pedido</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Template de mensagem para referência futura.</p>
        <textarea
          value={orderStatusTemplate}
          onChange={e => setOrderStatusTemplate(e.target.value)}
          rows={8}
          className="w-full bg-[#050505]/30 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-[#ff9607] resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['{numero_pedido}', '{cliente_nome}', '{nome_loja}', '{itens_pedido}', '{total}', '{pedido_id}', '{endereco}', '{forma_pagamento}', '{status}', '{data_hora}'].map(tag => (
            <span key={tag} className="text-[10px] bg-[#ff9607]/10 text-[#ff9607] px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-[#ff9607]/20 transition-colors"
              onClick={() => setOrderStatusTemplate(prev => prev + ' ' + tag)}>{tag}</span>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={saveOrderTemplateOnly}
            disabled={saving}
            className="flex-1 bg-[#ff9607] text-black py-2.5 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Salvar Template'}
          </button>
          <button
            onClick={cancelOrderTemplate}
            disabled={saving}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-[#ff9607]" />
          <h3 className="font-bold text-sm">Palavras-chave e Respostas Automáticas</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">O robô cria um menu numerado automaticamente (1, 2, 3...) com base nesta lista. O cliente pode digitar o número ou escrever a palavra-chave.</p>

        <div className="space-y-3 mb-4">
          {keywords.map(kw => (
            <div key={kw.id} className="bg-[#050505]/30 border border-white/[0.08] rounded-xl backdrop-blur-sm overflow-hidden">
              {editingId === kw.id ? (
                <div className="p-3 space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Palavras-chave (separadas por vírgula)</label>
                    <input
                      value={editKw}
                      onChange={e => setEditKw(e.target.value)}
                      className="w-full bg-[#050505]/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Resposta automática</label>
                    <textarea
                      value={editResp}
                      onChange={e => setEditResp(e.target.value)}
                      rows={3}
                      className="w-full bg-[#050505]/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff9607] resize-none"
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
            className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]"
          />
          <textarea
            value={newResponse}
            onChange={e => setNewResponse(e.target.value)}
            placeholder="Resposta automática..."
            rows={3}
            className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607] resize-none"
          />
          <button
            onClick={addKeyword}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-[#ff9607]/10 hover:text-[#ff9607] transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar palavra-chave
          </button>
        </div>
      </div>

      <button
        onClick={saveConfig}
        disabled={saving}
        className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Salvando...' : 'Salvar Configurações do Robô'}
      </button>

      {/* Modal de Notificação Central */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#0a0a0a]/90 border border-white/[0.08] rounded-2xl backdrop-blur-xl p-6 shadow-2xl shadow-black/50 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#ff9607]/10 border border-[#ff9607]/20 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-[#ff9607]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Conexão Necessária</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {modalMessage}
                </p>
              </div>

              <div className="w-full pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black rounded-xl font-bold text-sm hover:shadow-[0_0_25px_rgba(255,150,7,0.4)] transition-all"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Tecnológico */}
      <TechToast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
