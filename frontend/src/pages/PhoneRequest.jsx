import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const S = {
  root: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, color: '#888', marginBottom: 32, textAlign: 'center' },
  input: {
    width: '100%', background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '14px', color: '#fff', fontSize: 16,
    outline: 'none', marginBottom: 12
  },
  btn: {
    width: '100%', background: 'linear-gradient(90deg, #c9a84c 0%, #e6c97a 100%)',
    border: 'none', borderRadius: 14, padding: '16px', color: '#000',
    fontSize: 16, fontWeight: 700, cursor: 'pointer'
  },
  error: { color: '#f44', fontSize: 13, marginBottom: 8 }
};

export default function PhoneRequest() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData || '';
      const { user } = await api.updatePhone(initData, phone);
      setUser(user);
      navigate(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.root}>
      <div style={S.icon}>📱</div>
      <div style={S.title}>Укажите телефон</div>
      <div style={S.sub}>Это нужно, чтобы оператор мог с вами связаться</div>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 340 }}>
        <input
          style={S.input}
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+7 900 000 00 00"
        />
        {error && <div style={S.error}>{error}</div>}
        <button style={S.btn} type="submit" disabled={loading}>
          {loading ? 'Сохраняем...' : 'Продолжить'}
        </button>
      </form>
    </div>
  );
}
