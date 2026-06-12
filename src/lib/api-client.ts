export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');

  return fetch(input, {
    ...init,
    headers,
  });
}
