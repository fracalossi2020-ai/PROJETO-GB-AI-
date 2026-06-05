const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.join(__dirname, '..', 'prisma', 'whatsapp-status.json');
const AUTH_DIR = path.join(__dirname, '..', 'prisma', 'baileys-auth');

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

let currentQr = null;
let isConnected = false;
let currentPhone = null;

function saveStatus() {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      qr: currentQr,
      connected: isConnected,
      phone: currentPhone,
      state: isConnected ? 'connected' : (currentQr ? 'qr' : 'connecting'),
      message: isConnected ? `Conectado: ${currentPhone || ''}` : (currentQr ? 'Escaneie o QR Code com o WhatsApp' : 'Gerando QR Code...'),
      updatedAt: new Date().toISOString(),
    }, null, 2));
  } catch (e) {
    console.error('[WhatsApp] Erro ao salvar status:', e.message);
  }
}

async function start() {
  console.log('[WhatsApp] Iniciando servidor...');
  saveStatus();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Desktop'),
    qrMaxRetries: Infinity,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        currentQr = await QRCode.toDataURL(qr, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
        console.log('[WhatsApp] QR Code gerado! Escaneie para conectar.');
        saveStatus();
      } catch (e) {
        console.error('[WhatsApp] Erro ao gerar QR:', e.message);
      }
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log('[WhatsApp] Conexão fechada. Reconectar:', shouldReconnect);
      isConnected = false;
      currentPhone = null;
      // IMPORTANTE: NÃO limpa currentQr — mantém o último QR visível até o novo ser gerado
      saveStatus();
      if (shouldReconnect) {
        setTimeout(start, 2000);
      }
    } else if (connection === 'open') {
      const userJid = sock.user?.id;
      currentPhone = userJid ? userJid.split(':')[0].split('@')[0] : null;
      isConnected = true;
      currentQr = null;
      console.log(`[WhatsApp] Conectado! Número: ${currentPhone || 'Desconhecido'}`);
      saveStatus();
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;
      const text = msg.message?.conversation?.toLowerCase() || msg.message?.extendedTextMessage?.text?.toLowerCase();
      if (!text) continue;

      let reply = null;
      if (text.includes('oi') || text.includes('olá') || text.includes('ola') || text.includes('bom dia') || text.includes('boa tarde') || text.includes('boa noite')) {
        reply = '👋 Olá! Bem-vindo! Sou o robô do GB.AI.\n\nEnvie:\n• *cardápio* - Ver nosso cardápio\n• *horário* - Horário de funcionamento\n• *pedido* - Status do pedido';
      } else if (text.includes('cardápio') || text.includes('menu') || text.includes('cardapio')) {
        reply = '📋 Acesse nosso cardápio:\nhttp://localhost:3000/burger-king-gb\n\nQual item te interessa?';
      } else if (text.includes('horário') || text.includes('hora') || text.includes('horario')) {
        reply = '⏰ Funcionamos todos os dias das 08:00 às 22:00.';
      } else if (text.includes('pedido') || text.includes('status')) {
        reply = '📦 Para verificar seu pedido, acesse:\nhttp://localhost:3000/pedido/[numero]';
      } else if (text.includes('entrega') || text.includes('frete')) {
        reply = '🛵 Taxa de entrega: R$ 5,00\nTempo estimado: 25-45 minutos';
      } else if (text.includes('pix') || text.includes('pagamento')) {
        reply = '💳 Aceitamos:\n✅ PIX\n✅ Dinheiro\n✅ Cartão de Crédito/Débito\n\nChave PIX: admin@gbai.com';
      }

      if (reply) {
        await sock.sendMessage(msg.key.remoteJid, { text: reply });
      }
    }
  });
}

start();

process.on('SIGINT', () => {
  console.log('\n[WhatsApp] Desligando...');
  fs.writeFileSync(STATUS_FILE, JSON.stringify({ qr: null, connected: false, phone: null, state: 'stopped', message: 'Servidor parado' }, null, 2));
  process.exit(0);
});
