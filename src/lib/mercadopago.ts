const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

if (!ACCESS_TOKEN) {
  throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
}

export { ACCESS_TOKEN, PUBLIC_KEY };

export async function mpFetch(path: string, options?: RequestInit) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  return res;
}

export function formatMoney(amount: number) {
  return Number(amount.toFixed(2));
}
