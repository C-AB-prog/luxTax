import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, clearToken } from '../api/client';

const SERVICE_LABELS = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT_TO: 'В аэропорт',
  AIRPORT_FROM: 'Из аэропорта',
};

const STATUS_COLORS = {
  NEW: { bg: '#fff8e1', text: '#f59e0b' },
  IN_PROGRESS: { bg: '#e3f2fd', text: '#2196f3' },
  COMPLETED: { bg: '#e8f5e9', text: '#4caf50' },
  CANCELLED: { bg: '#fce4ec', text: '#f44336' },
};

const STATUS_LABELS = { NEW: 'Новый', IN_PROGRESS: 'В работе', COMPLETED: 'Завершён', CANCELLED: 'Отменён' };

const S = {
  root: { minHeight: '100vh', background: '#f0f2f5' },
  nav: { background: '#1a1a2e', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navTitle: { color: '#fff', fontWeight: 700, fontSize: 18 },
  logoutBtn: { background: 'none', border: '1px solid #fff3', borderRadius: 8, color: '#aaa', padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  content: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  filters: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 700, background: '#fafafa', borderBottom: '1px solid #eee', textTransform: 'uppercase' },
  td: { padding: '14px 16px', fontSize: 14, color: '#333', borderBottom: '1px solid #f0f0f0' },
  badge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  link: { color: '#1a1a2e', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }
};

const STATUSES = [null, 'NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_FILTER_LABELS = { null: 'Все', NEW: 'Новые', IN_PROGRESS: 'В работе', COMPLETED: 'Завершённые', CANCELLED: 'Отменённые' };

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    adminApi.getOrders(filter).then(setOrders).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  function logout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div style={S.root}>
      <nav style={S.nav}>
        <div style={S.navTitle}>VIP Driver Admin</div>
        <button style={S.logoutBtn} onClick={logout}>Выйти</button>
      </nav>
      <div style={S.content}>
        <div style={S.filters}>
          {STATUSES.map(s => (
            <button
              key={String(s)}
              style={{
                ...S.filterBtn,
                background: filter === s ? '#1a1a2e' : '#fff',
                color: filter === s ? '#fff' : '#555',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}
              onClick={() => setFilter(s)}
            >
              {STATUS_FILTER_LABELS[String(s)]}
            </button>
          ))}
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Клиент</th>
              <th style={S.th}>Телефон</th>
              <th style={S.th}>Услуга</th>
              <th style={S.th}>Адрес</th>
              <th style={S.th}>Время</th>
              <th style={S.th}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#aaa' }}>Загрузка...</td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#aaa' }}>Заказов нет</td></tr>}
            {orders.map(o => {
              const sc = STATUS_COLORS[o.status];
              return (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                  <td style={S.td}>{o.id}</td>
                  <td style={S.td}>{o.user?.firstName} {o.user?.lastName}</td>
                  <td style={S.td}>{o.user?.phone || '—'}</td>
                  <td style={S.td}>{SERVICE_LABELS[o.serviceType]}</td>
                  <td style={S.td}>{o.address}</td>
                  <td style={S.td}>{o.scheduledTime ? new Date(o.scheduledTime).toLocaleString('ru-RU') : '—'}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: sc.bg, color: sc.text }}>{STATUS_LABELS[o.status]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
