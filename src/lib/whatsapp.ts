import makeWASocket, { DisconnectReason, useSingleFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(process.cwd(), 'prisma', 'whatsapp-auth');
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

let currentQr: string | null = null;
let isConnected = false;
let sock: ReturnType<typeof makeWASocket> | null = null;

export function getWhatsAppStatus() {
  return { qr: currentQr, connected: isConnected };
}

export async function initWhatsApp() {
  if (sock) return;

  const { state, saveState } = useSingleFileAuthState(path.join(AUTH_DIR, 'auth.json'));

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQr = await QRCode.toDataURL(qr, { width: 400, margin: 2 });
      isConnected = false;
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      isConnected = false;
      currentQr = null;
      sock = null;
      if (shouldReconnect) {
        setTimeout(initWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      currentQr = null;
    }
  });

  sock.ev.on('creds.update', saveState);
}
