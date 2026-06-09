const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const http = require('http');

const STATUS_FILE = path.join(__dirname, '..', 'prisma', 'whatsapp-status.json');
const CONFIG_FILE = path.join(__dirname, '..', 'prisma', 'whatsapp-config.json');
const PAIRING_REQUEST_FILE = path.join(__dirname, '..', 'prisma', 'pairing-request.json');
const QR_IMAGE_FILE = path.join(__dirname, '..', 'public', 'whatsapp-qr.png');
const AUTH_DIR = path.join(__dirname, '..', 'prisma', 'baileys-auth');

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

let isConnected = false;
let currentPhone = null;
let lastPairingCode = null;
let qrAvailable = false;

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      console.log('[WhatsApp] Config carregada de:', CONFIG_FILE, '-> testNumbers:', JSON.stringify(config.testNumbers));
      return config;
    }
  } catch (e) {
    console.error('[WhatsApp] Erro ao carregar config:', e.message);
  }
  return { enabled: false, testNumbers: [], welcomeMessage: '', keywords: [] };
}

function saveStatus(override = {}) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      qrUrl: qrAvailable && !isConnected ? '/whatsapp-qr.png' : null,
      pairingCode: lastPairingCode,
      connected: isConnected,
      phone: currentPhone,
      state: isConnected ? 'connected' : (lastPairingCode ? 'pairing' : (qrAvailable ? 'qr' : 'connecting')),
      message: isConnected
        ? `Conectado: ${currentPhone || ''}`
        : (lastPairingCode ? `Código de pareamento: ${lastPairingCode}` : (qrAvailable ? 'QR Code ativo. Escaneie com o WhatsApp.' : 'Iniciando servidor...')),
      updatedAt: new Date().toISOString(),
      ...override,
    }, null, 2));
  } catch (e) {
    console.error('[WhatsApp] Erro ao salvar status:', e.message);
  }
}

async function saveQrImage(qrData) {
  try {
    await QRCode.toFile(QR_IMAGE_FILE, qrData, {
      width: 800,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      type: 'png',
    });
    console.log('[WhatsApp] QR code imagem gerada!');
    qrAvailable = true;
    saveStatus();
  } catch (e) {
    console.error('[WhatsApp] Erro ao gerar QR imagem:', e.message);
  }
}

/* ── Phone normalization ── */
function normalizePhone(phone) {
  // Remove everything after @ (c.us, g.us, lid, etc)
  const id = phone.split('@')[0];
  // Keep only digits
  const digits = id.replace(/\D/g, '');
  // Remove Brazil country code if present
  return digits.replace(/^55/, '');
}

function shouldRespond(sender) {
  const config = loadConfig();
  const senderClean = normalizePhone(sender);

  console.log(`[WhatsApp] Mensagem recebida de: ${sender} (normalizado: ${senderClean})`);
  console.log(`[WhatsApp] Config - enabled: ${config.enabled}, testNumbers: ${JSON.stringify(config.testNumbers)}`);

  // Ignore group chats and broadcast lists
  if (sender.endsWith('@g.us') || sender.endsWith('@lid')) {
    console.log('[WhatsApp] Ignorando grupo/lista de transmissão');
    return false;
  }

  // If robot is enabled, respond to everyone
  if (config.enabled === true) {
    console.log('[WhatsApp] Robô ATIVADO - respondendo!');
    return true;
  }

  // If number is in test list, respond even with robot disabled
  if (config.testNumbers && config.testNumbers.length > 0) {
    const match = config.testNumbers.some((num) => {
      const normalized = normalizePhone(num);
      const isMatch = normalized === senderClean;
      console.log(`[WhatsApp] Comparando testNumber "${num}" -> "${normalized}" vs sender "${senderClean}" = ${isMatch}`);
      return isMatch;
    });
    if (match) {
      console.log('[WhatsApp] Número na whitelist - respondendo!');
      return true;
    }
  }

  console.log('[WhatsApp] Robô DESATIVADO e número NÃO está na whitelist - ignorando');
  return false;
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
  puppeteer: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,720',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
    ],
  },
  qrMaxRetries: Infinity,
});

client.on('qr', async (qr) => {
  console.log('[WhatsApp] QR Code recebido!');
  console.log('[WhatsApp] QR Content:', qr.substring(0, 60) + '...');
  lastPairingCode = null;
  await saveQrImage(qr);
});

client.on('ready', () => {
  const info = client.info;
  currentPhone = info?.wid?.user || null;
  isConnected = true;
  qrAvailable = false;
  lastPairingCode = null;
  console.log(`[WhatsApp] ✅ CONECTADO! Número: ${currentPhone || 'Desconhecido'}`);
  saveStatus();
  try { fs.unlinkSync(QR_IMAGE_FILE); } catch {}
});

client.on('authenticated', () => {
  console.log('[WhatsApp] Autenticado!');
});

client.on('auth_failure', (msg) => {
  console.error('[WhatsApp] Falha:', msg);
  isConnected = false;
  saveStatus({ state: 'error', message: `Falha: ${msg}` });
});

client.on('disconnected', (reason) => {
  console.log('[WhatsApp] Desconectado:', reason);
  isConnected = false;
  currentPhone = null;
  qrAvailable = false;
  lastPairingCode = null;
  saveStatus();
  try { fs.unlinkSync(QR_IMAGE_FILE); } catch {}
  setTimeout(() => {
    console.log('[WhatsApp] Reiniciando...');
    client.initialize();
  }, 5000);
});

client.on('message', async (msg) => {
  if (msg.fromMe) return;
  const text = msg.body || '';
  console.log(`[WhatsApp] 📨 NOVA MENSAGEM de "${msg.from}" -> "${text.substring(0, 50)}"`);

  // Check if should respond
  if (!shouldRespond(msg.from)) {
    return;
  }

  const config = loadConfig();
  let reply = null;

  // Check configured keywords
  if (config.keywords && config.keywords.length > 0) {
    for (const kw of config.keywords) {
      const kwList = kw.keywords.split(',').map((k) => k.trim().toLowerCase());
      if (kwList.some((k) => text.includes(k))) {
        reply = kw.response;
        break;
      }
    }
  }

  // Default greeting if no keyword matched
  if (!reply && (text.includes('oi') || text.includes('olá') || text.includes('ola') || text.includes('bom dia') || text.includes('boa tarde') || text.includes('boa noite'))) {
    reply = config.welcomeMessage || '👋 Olá! Bem-vindo! Sou o assistente virtual.';
  }

  if (reply) {
    try {
      await msg.reply(reply);
      console.log(`[WhatsApp] ✅ Resposta enviada para ${msg.from}`);
    } catch (e) {
      console.error('[WhatsApp] Erro ao enviar:', e.message);
    }
  }
});

// ===== API INTERNA PARA ENVIO DE MENSAGENS (usada pela API de pedidos) =====
function formatWhatsAppId(phone) {
  const clean = phone.replace(/\D/g, '');
  const withCountry = clean.startsWith('55') && clean.length >= 12 ? clean : `55${clean}`;
  return `${withCountry}@c.us`;
}

const httpServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { to, message } = JSON.parse(body);
        if (!to || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing to or message' }));
          return;
        }
        if (!isConnected) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'WhatsApp not connected' }));
          return;
        }

        const chatId = formatWhatsAppId(to);
        console.log(`[WhatsApp] Enviando mensagem de pedido para ${chatId}...`);
        await client.sendMessage(chatId, message);
        console.log(`[WhatsApp] ✅ Mensagem de pedido enviada para ${chatId}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        console.error('[WhatsApp] Erro ao enviar mensagem:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Not found' }));
});

// Monitora pedido de pairing code
setInterval(async () => {
  if (isConnected) return;
  try {
    if (fs.existsSync(PAIRING_REQUEST_FILE)) {
      const req = JSON.parse(fs.readFileSync(PAIRING_REQUEST_FILE, 'utf-8'));
      if (req.phoneNumber && !lastPairingCode) {
        console.log(`[WhatsApp] Gerando Pairing Code para ${req.phoneNumber}...`);
        const cleanPhone = req.phoneNumber.replace(/\D/g, '');
        const code = await client.requestPairingCode(cleanPhone, true);
        lastPairingCode = code;
        qrAvailable = false;
        console.log(`[WhatsApp] Pairing Code: ${code}`);
        saveStatus();
        fs.unlinkSync(PAIRING_REQUEST_FILE);
      }
    }
  } catch (e) {
    console.error('[WhatsApp] Erro no pairing:', e.message);
  }
}, 2000);

console.log('[WhatsApp] Iniciando servidor...');
saveStatus();
client.initialize();

httpServer.listen(3001, () => {
  console.log('[WhatsApp] API de envio interna rodando em http://localhost:3001');
});

process.on('SIGINT', () => {
  console.log('\n[WhatsApp] Desligando...');
  saveStatus({ connected: false, phone: null, state: 'stopped', message: 'Servidor parado' });
  httpServer.close();
  client.destroy().then(() => process.exit(0));
});
