const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Boom } = require('@hapi/boom');

const STATUS_FILE = path.join(__dirname, '..', 'prisma', 'whatsapp-status.json');
const AUTH_DIR = path.join(__dirname, '..', 'prisma', 'baileys-auth');

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

let sock = null;

function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

async function start() {
  console.log('[WhatsApp] Iniciando servidor...');

  saveStatus({ qr: null, connected: false, phone: null, state: 'connecting', message: 'Gerando QR Code...' });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Desktop'),
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrBase64 = await QRCode.toDataURL(qr, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      saveStatus({ qr: qrBase64, connected: false, phone: null, state: 'qr', message: 'Escaneie o QR Code com o WhatsApp' });
      console.log('[WhatsApp] QR Code gerado! Escaneie para conectar.');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      saveStatus({ qr: null, connected: false, phone: null, state: 'disconnected', message: 'Desconectado' });
      console.log('[WhatsApp] Conexão fechada.');

      sock = null;
      if (shouldReconnect) {
        console.log('[WhatsApp] Reconectando em 3s...');
        setTimeout(start, 3000);
      }
    } else if (connection === 'open') {
      // Pega o número do WhatsApp conectado
      const userJid = sock.user?.id;
      const phone = userJid ? userJid.split(':')[0].split('@')[0] : null;

      saveStatus({
        qr: null,
        connected: true,
        phone: phone || 'Desconhecido',
        state: 'connected',
        message: `Conectado: ${phone || 'Desconhecido'}`,
      });
      console.log(`[WhatsApp] Conectado! Número: ${phone || 'Desconhecido'}`);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Handler de mensagens recebidas (para o robô responder)
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type === 'notify') {
      for (const msg of m.messages) {
        if (!msg.key.fromMe && msg.message?.conversation) {
          const text = msg.message.conversation.toLowerCase();
          console.log(`[WhatsApp] Mensagem recebida de ${msg.key.remoteJid}: ${text}`);

          // Respostas automáticas simples
          let reply = null;
          if (text.includes('oi') || text.includes('olá') || text.includes('ola')) {
            reply = '👋 Olá! Bem-vindo! Sou o robô do GB.AI. Como posso te ajudar?\n\nEnvie:\n• *cardápio* - Ver nosso cardápio\n• *horário* - Horário de funcionamento\n• *pedido* - Status do seu pedido';
          } else if (text.includes('cardápio') || text.includes('menu')) {
            reply = '📋 Acesse nosso cardápio:\nhttp://localhost:3000/burger-king-gb\n\nQual item te interessa?';
          } else if (text.includes('horário') || text.includes('hora')) {
            reply = '⏰ Funcionamos de Segunda a Domingo das 08:00 às 22:00.';
          } else if (text.includes('pedido') || text.includes('status')) {
            reply = '📦 Para verificar seu pedido, acesse:\nhttp://localhost:3000/pedido/[seu-numero]';
          }

          if (reply) {
            await sock.sendMessage(msg.key.remoteJid, { text: reply });
            console.log(`[WhatsApp] Resposta enviada: ${reply.substring(0, 50)}...`);
          }
        }
      }
    }
  });
}

start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[WhatsApp] Desligando...');
  saveStatus({ qr: null, connected: false, phone: null, state: 'stopped', message: 'Servidor parado' });
  process.exit(0);
});
