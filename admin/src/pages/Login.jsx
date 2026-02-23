import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, setToken } from '../api/client';

const S = {
  root: { minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' },
  sub: { fontSize: 14, color: '#888', marginBottom: 32 },
  label: { display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 600 },
  input: { width: '100%', border: '1px solid #e0e0e0', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', marginBottom: 16 },
  btn: { width: '100%', background: '#1a1a2e', border: 'none', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  error: { color: '#f44', fontSize: 13, marginBottom: 12 }
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminApi.login(form.username, form.password);
      setToken(token);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={S.title}>VIP Driver</div>
        <div style={S.sub}>Панель управления</div>
        <form onSubmit={submit}>
          <label style={S.label}>Логин</label>
          <input style={S.input} value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} required />
          <label style={S.label}>Пароль</label>
          <input style={S.input} type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          {error && <div style={S.error}>{error}</div>}
          <button style={S.btn} type="submit" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
        </form>
      </div>
    </div>
  );
}
