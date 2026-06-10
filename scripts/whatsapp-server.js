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
let clientInitialized = false;
let robotEnabled = false;
let activationPending = false;
const repliedMessages = new Set();

function getMsgId(msg) {
  return msg.id?._serialized || msg.id?.id || `${msg.from}-${msg.timestamp}`;
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      console.log('[WhatsApp] Config carregada -> enabled:', config.enabled, 'testNumbers:', JSON.stringify(config.testNumbers));
      return config;
    }
  } catch (e) {
    console.error('[WhatsApp] Erro ao carregar config:', e.message);
  }
  return { enabled: false, testNumbers: [], welcomeMessage: '', keywords: [] };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }, null, 2));
  } catch (e) {
    console.error('[WhatsApp] Erro ao salvar config:', e.message);
  }
}

function saveStatus(override = {}) {
  try {
    let state;
    let message;

    if (robotEnabled && isConnected) {
      state = 'connected';
      message = `Conectado: ${currentPhone || ''}`;
    } else if (activationPending && lastPairingCode) {
      state = 'pairing';
      message = `Código de pareamento: ${lastPairingCode}. Confirme no WhatsApp para ativar o robô.`;
    } else if (activationPending && qrAvailable) {
      state = 'qr';
      message = 'QR Code ativo. Escaneie com o WhatsApp para ativar o robô.';
    } else if (activationPending && clientInitialized) {
      state = 'awaiting_connection';
      message = 'Aguardando conexão. Leia o QR Code ou use o código de pareamento para ativar o robô.';
    } else if (activationPending) {
      state = 'awaiting_connection';
      message = 'Ativação pendente. Inicie a conexão com o WhatsApp.';
    } else {
      state = 'disabled';
      message = 'Robô desativado. Ative nas configurações para conectar o WhatsApp.';
    }

    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      qrUrl: qrAvailable && !isConnected ? '/whatsapp-qr.png' : null,
      pairingCode: lastPairingCode,
      connected: isConnected,
      phone: currentPhone,
      robotEnabled,
      activationPending,
      state,
      message,
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
  const id = phone.split('@')[0];
  const digits = id.replace(/\D/g, '');
  return digits.replace(/^55/, '');
}

function shouldRespond(sender) {
  const config = loadConfig();
  const senderClean = normalizePhone(sender);

  console.log(`[WhatsApp] Mensagem recebida de: ${sender} (normalizado: ${senderClean})`);

  if (sender.endsWith('@g.us') || sender.endsWith('@newsletter')) {
    console.log('[WhatsApp] Ignorando grupo/newsletter');
    return false;
  }

  // Robô ativado responde qualquer pessoa (desde que conectado)
  if (robotEnabled && isConnected) {
    console.log('[WhatsApp] Robô ATIVADO e CONECTADO - respondendo!');
    return true;
  }

  // Whitelist funciona mesmo com robô desativado
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

  console.log('[WhatsApp] Robô DESATIVADO - ignorando mensagem.');
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
  robotEnabled = true;
  activationPending = false;
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
  robotEnabled = false;
  currentPhone = null;
  qrAvailable = false;
  lastPairingCode = null;
  saveStatus();
  try { fs.unlinkSync(QR_IMAGE_FILE); } catch {}
  if (clientInitialized) {
    setTimeout(() => {
      console.log('[WhatsApp] Reiniciando...');
      client.initialize();
    }, 5000);
  }
});

client.on('message', async (msg) => {
  if (msg.fromMe) return;

  const msgId = getMsgId(msg);

  // Evita responder a mesma mensagem duas vezes
  if (repliedMessages.has(msgId)) {
    console.log(`[WhatsApp] Mensagem ${msgId} já respondida. Ignorando duplicata.`);
    return;
  }

  // Segurança: nunca responde se o robô está desativado
  if (!robotEnabled) {
    return;
  }

  const text = msg.body || '';
  console.log(`[WhatsApp] 📨 NOVA MENSAGEM de "${msg.from}" -> "${text.substring(0, 50)}"`);

  if (!shouldRespond(msg.from)) {
    return;
  }

  const config = loadConfig();
  const textTrimmed = text.trim();
  const textLower = text.toLowerCase();
  let reply = null;

  // 1. Verifica se digitou um número de menu (1, 2, 3...)
  const menuNumber = parseInt(textTrimmed, 10);
  if (!isNaN(menuNumber) && menuNumber > 0 && config.keywords && config.keywords.length >= menuNumber) {
    reply = config.keywords[menuNumber - 1].response;
    console.log(`[WhatsApp] Opção de menu ${menuNumber} selecionada.`);
  }

  // 2. Verifica palavras-chave configuradas (para quem prefere digitar)
  if (!reply && config.keywords && config.keywords.length > 0) {
    for (const kw of config.keywords) {
      const kwList = kw.keywords.split(',').map((k) => k.trim().toLowerCase());
      if (kwList.some((k) => textLower.includes(k))) {
        reply = kw.response;
        break;
      }
    }
  }

  // 3. Se não achou nada, manda mensagem de boas-vindas com menu
  if (!reply) {
    let menuText = '';
    if (config.keywords && config.keywords.length > 0) {
      menuText = config.keywords.map((kw, idx) => `${idx + 1} - ${kw.keywords.split(',')[0].trim()}`).join('\n');
    }
    const welcome = config.welcomeMessage || '👋 Olá! Bem-vindo!\n\nSou o assistente virtual.';
    reply = menuText ? `${welcome}\n\nEscolha uma opção:\n${menuText}\n\nDigite o número ou escreva o que deseja.` : welcome;
  }

  try {
    await msg.reply(reply);
    repliedMessages.add(msgId);
    console.log(`[WhatsApp] ✅ Resposta enviada para ${msg.from}`);
  } catch (e) {
    console.error('[WhatsApp] Erro ao enviar:', e.message);
  }
});

async function startClient() {
  if (clientInitialized) return;
  try {
    console.log('[WhatsApp] Inicializando cliente WhatsApp...');
    clientInitialized = true;
    await client.initialize();
  } catch (e) {
    console.error('[WhatsApp] Erro ao inicializar cliente:', e.message);
    clientInitialized = false;
    saveStatus({ state: 'error', message: `Erro ao iniciar: ${e.message}` });
  }
}

async function stopClient() {
  if (!clientInitialized) return;
  try {
    console.log('[WhatsApp] Parando cliente WhatsApp...');
    await client.destroy();
  } catch (e) {
    console.error('[WhatsApp] Erro ao parar cliente:', e.message);
  }
  clientInitialized = false;
  isConnected = false;
  currentPhone = null;
  qrAvailable = false;
  lastPairingCode = null;
  try { fs.unlinkSync(QR_IMAGE_FILE); } catch {}
}

function formatWhatsAppId(phone) {
  const clean = phone.replace(/\D/g, '');
  const withCountry = clean.startsWith('55') && clean.length >= 12 ? clean : `55${clean}`;
  return `${withCountry}@c.us`;
}

async function setRobotEnabled(enabled) {
  const config = loadConfig();
  config.enabled = enabled;
  saveConfig(config);

  if (enabled) {
    activationPending = true;
    if (isConnected) {
      robotEnabled = true;
      console.log('[WhatsApp] Robô ativado (já conectado).');
    } else {
      robotEnabled = false;
      console.log('[WhatsApp] Ativação iniciada. Aguardando leitura do QR Code ou código de pareamento.');
    }
    saveStatus();
  } else {
    activationPending = false;
    robotEnabled = false;
    saveStatus();
    console.log('[WhatsApp] Robô desativado. Cliente continua rodando em background.');
  }
}

const httpServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      robotEnabled,
      activationPending,
      clientInitialized,
      isConnected,
      qrAvailable,
      qrUrl: qrAvailable && !isConnected ? '/whatsapp-qr.png' : null,
      pairingCode: lastPairingCode,
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/toggle') {
    const newState = !robotEnabled && !activationPending;
    console.log(`[WhatsApp] Alternando estado do robô: ${robotEnabled || activationPending} -> ${newState}`);
    await setRobotEnabled(newState);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, robotEnabled, activationPending, clientInitialized, isConnected }));
    return;
  }

  if (req.method === 'POST' && req.url === '/enable') {
    console.log('[WhatsApp] Ativando robô...');
    await setRobotEnabled(true);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      robotEnabled,
      activationPending,
      clientInitialized,
      isConnected,
      qrAvailable,
      qrUrl: qrAvailable && !isConnected ? '/whatsapp-qr.png' : null,
      pairingCode: lastPairingCode,
      message: robotEnabled
        ? 'Robô ativado e conectado!'
        : qrAvailable
          ? 'QR Code disponível! Escaneie para conectar.'
          : 'Robô em processo de ativação. Leia o QR Code ou use o código de pareamento para conectar.',
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/disable') {
    console.log('[WhatsApp] Desativando robô...');
    await setRobotEnabled(false);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, robotEnabled, activationPending, clientInitialized, isConnected }));
    return;
  }

  if (req.method === 'POST' && req.url === '/logout') {
    console.log('[WhatsApp] Desconectando e limpando sessão...');
    try {
      await setRobotEnabled(false);
      if (clientInitialized) {
        await client.logout();
        console.log('[WhatsApp] ✅ Sessão encerrada.');
      }
      // Limpa auth local
      const fs = require('fs');
      const path = require('path');
      const authDir = path.join(__dirname, '..', 'prisma', 'baileys-auth');
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
        fs.mkdirSync(authDir, { recursive: true });
      }
      clientInitialized = false;
      isConnected = false;
      currentPhone = null;
      qrAvailable = false;
      lastPairingCode = null;
      try { fs.unlinkSync(QR_IMAGE_FILE); } catch {}
      saveStatus({ state: 'disabled', message: 'Desconectado. Clique em Ativar para conectar novamente.' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Desconectado com sucesso.' }));
    } catch (e) {
      console.error('[WhatsApp] Erro ao desconectar:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
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
        if (!robotEnabled && !activationPending) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'WhatsApp robot is disabled' }));
          return;
        }
        if (!robotEnabled || !isConnected) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Não é possível conectar porque você não está conectado no whatsapp',
            state: qrAvailable ? 'qr' : (activationPending ? 'awaiting_connection' : 'disabled'),
            qrUrl: qrAvailable && !isConnected ? '/whatsapp-qr.png' : null,
          }));
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

setInterval(async () => {
  if (isConnected || !clientInitialized || !activationPending) return;
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

async function init() {
  const config = loadConfig();
  if (config.enabled === true) {
    activationPending = true;
    robotEnabled = false;
  }

  console.log('[WhatsApp] Iniciando servidor...');
  saveStatus();

  // Cliente sempre inicia em background para QR ficar disponível rapidamente
  console.log('[WhatsApp] Iniciando cliente WhatsApp em background...');
  await startClient();

  httpServer.listen(3001, () => {
    console.log('[WhatsApp] API de envio interna rodando em http://localhost:3001');
  });
}

init();

process.on('SIGINT', async () => {
  console.log('\n[WhatsApp] Desligando...');
  saveStatus({ connected: false, phone: null, state: 'stopped', message: 'Servidor parado' });
  httpServer.close();
  if (clientInitialized) {
    await client.destroy();
  }
  process.exit(0);
});
