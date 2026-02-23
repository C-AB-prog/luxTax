import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/client';

const SERVICE_LABELS = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT_TO: 'В аэропорт',
  AIRPORT_FROM: 'Из аэропорта',
};

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS = { NEW: 'Новый', IN_PROGRESS: 'В работе', COMPLETED: 'Завершён', CANCELLED: 'Отменён' };

const S = {
  root: { minHeight: '100vh', background: '#f0f2f5' },
  nav: { background: '#1a1a2e', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 },
  back: { background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer' },
  navTitle: { color: '#fff', fontWeight: 700, fontSize: 18 },
  content: { padding: 24, maxWidth: 640, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 },
  sectionTitle: { fontSize: 12, color: '#aaa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 16 },
  row: { display: 'flex', marginBottom: 12, gap: 12 },
  key: { fontSize: 13, color: '#888', width: 140, flexShrink: 0 },
  val: { fontSize: 14, color: '#222', fontWeight: 500 },
  select: { padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 14, background: '#f8f8f8', cursor: 'pointer' },
  btn: { marginLeft: 10, background: '#1a1a2e', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  success: { color: '#4caf50', fontSize: 13, marginTop: 8 }
};

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={S.row}>
      <div style={S.key}>{label}</div>
      <div style={S.val}>{value}</div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getOrder(id).then(o => { setOrder(o); setStatus(o.status); }).catch(console.error);
  }, [id]);

  async function saveStatus() {
    setSaving(true);
    try {
      const updated = await adminApi.setStatus(id, status);
      setOrder(o => ({ ...o, status: updated.status }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!order) return <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>Загрузка...</div>;

  return (
    <div style={S.root}>
      <nav style={S.nav}>
        <button style={S.back} onClick={() => navigate('/')}>←</button>
        <div style={S.navTitle}>Заказ #{order.id}</div>
      </nav>
      <div style={S.content}>
        <div style={S.card}>
          <div style={S.sectionTitle}>Клиент</div>
          <Row label="Имя" value={`${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()} />
          <Row label="Username" value={order.user?.username ? `@${order.user.username}` : null} />
          <Row label="Телефон" value={order.user?.phone} />
          <Row label="Telegram ID" value={order.user?.telegramId} />
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle}>Заказ</div>
          <Row label="Услуга" value={SERVICE_LABELS[order.serviceType]} />
          <Row label="Адрес" value={order.address} />
          <Row label="Время" value={order.scheduledTime ? new Date(order.scheduledTime).toLocaleString('ru-RU') : null} />
          <Row label="Длительность" value={order.durationHours ? `${order.durationHours} ч.` : null} />
          <Row label="Прим. длит." value={order.approxDuration} />
          <Row label="Аэропорт" value={order.airport} />
          <Row label="Рейс" value={order.flightNumber} />
          <Row label="Комментарий" value={order.comment} />
          <Row label="Создан" value={new Date(order.createdAt).toLocaleString('ru-RU')} />
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle}>Статус</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select style={S.select} value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button style={S.btn} onClick={saveStatus} disabled={saving}>{saving ? '...' : 'Сохранить'}</button>
          </div>
          {saved && <div style={S.success}>✓ Статус обновлён</div>}
        </div>
      </div>
    </div>
  );
}
