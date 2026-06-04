import makeWASocket, { DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(process.cwd(), 'prisma', 'baileys-auth');
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

let currentQr: string | null = null;
let isConnected = false;
let sock: ReturnType<typeof makeWASocket> | null = null;

export function getWhatsAppStatus() {
  return { qr: currentQr, connected: isConnected };
}

export async function initWhatsApp() {
  if (sock) return;

  // Dynamic import to avoid SSR issues
  const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Desktop'),
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQr = await QRCode.toDataURL(qr, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      isConnected = false;
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      isConnected = false;
      currentQr = null;
      sock = null;
      if (shouldReconnect) {
        setTimeout(initWhatsApp, 5000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      currentQr = null;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}
