const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let token = localStorage.getItem('admin_token');

export function setToken(t) {
  token = t;
  localStorage.setItem('admin_token', t);
}

export function clearToken() {
  token = null;
  localStorage.removeItem('admin_token');
}

export function getToken() { return token; }

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
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

export const adminApi = {
  login: (username, password) => request('POST', '/auth/admin', { username, password }),
  getOrders: (status) => request('GET', `/admin/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id) => request('GET', `/admin/orders/${id}`),
  setStatus: (id, status) => request('PATCH', `/admin/orders/${id}/status`, { status }),
};
