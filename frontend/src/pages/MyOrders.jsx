import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const SERVICE_LABELS = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT_TO: 'В аэропорт',
  AIRPORT_FROM: 'Из аэропорта',
};

const STATUS_COLORS = {
  NEW: '#c9a84c',
  IN_PROGRESS: '#4a9eff',
  COMPLETED: '#4caf50',
  CANCELLED: '#f44'
};

const STATUS_LABELS = { NEW: 'Новый', IN_PROGRESS: 'В работе', COMPLETED: 'Завершён', CANCELLED: 'Отменён' };

const S = {
  root: { minHeight: '100vh', background: '#0a0a0a', padding: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  back: { background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' },
  title: { fontSize: 20, fontWeight: 700, color: '#fff' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: 16, marginBottom: 12 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  service: { fontSize: 15, fontWeight: 600, color: '#fff' },
  status: { fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  address: { fontSize: 13, color: '#888', marginBottom: 4 },
  date: { fontSize: 12, color: '#555' }
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.root}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate('/')}>←</button>
        <div style={S.title}>Мои заказы</div>
      </div>
      {loading && <div style={{ color: '#888', textAlign: 'center' }}>Загрузка...</div>}
      {!loading && orders.length === 0 && <div style={{ color: '#555', textAlign: 'center', marginTop: 60 }}>Заказов пока нет</div>}
      {orders.map(o => (
        <div key={o.id} style={S.card}>
          <div style={S.row}>
            <div style={S.service}>{SERVICE_LABELS[o.serviceType]}</div>
            <div style={{ ...S.status, background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
              {STATUS_LABELS[o.status]}
            </div>
          </div>
          <div style={S.address}>{o.address}</div>
          {o.scheduledTime && <div style={S.date}>{new Date(o.scheduledTime).toLocaleString('ru-RU')}</div>}
          <div style={S.date}>#{o.id} · {new Date(o.createdAt).toLocaleDateString('ru-RU')}</div>
        </div>
      ))}
    </div>
  );
}
