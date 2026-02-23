const BASE = import.meta.env.VITE_API_URL || '/api';

let token = localStorage.getItem('tg_token');

export function setToken(t) {
  token = t;
  localStorage.setItem('tg_token', t);
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: (initData) => request('POST', '/auth/telegram', { initData }),
  updatePhone: (initData, phone) => request('POST', '/auth/phone', { initData, phone }),
  createOrder: (data) => request('POST', '/orders', data),
  myOrders: () => request('GET', '/orders/me')
};
