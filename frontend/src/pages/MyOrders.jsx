import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const SERVICE_LABELS = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT_TO: '✈️ Отвезти в аэропорт',
  AIRPORT_FROM: '🛬 Встретить из аэропорта',
  VALET_PARKING: '🚘 Valet Parking',
};

const STATUS = {
  NEW:         { color: '#c9a84c', bg: '#c9a84c22', label: 'Новый', icon: '🕐' },
  IN_PROGRESS: { color: '#4a9eff', bg: '#4a9eff22', label: 'В работе', icon: '🔄' },
  COMPLETED:   { color: '#4caf50', bg: '#4caf5022', label: 'Завершён', icon: '✅' },
  CANCELLED:   { color: '#f44336', bg: '#f4433622', label: 'Отменён', icon: '❌' },
};

const S = {
  root: { minHeight: '100vh', background: '#0a0a0a', padding: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  back: { background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' },
  title: { fontSize: 20, fontWeight: 700, color: '#fff' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  service: { fontSize: 15, fontWeight: 700, color: '#fff' },
  badge: { fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 },
  divider: { borderTop: '1px solid #1e1e1e', margin: '10px 0' },
  row: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  rowKey: { fontSize: 12, color: '#666', width: 90, flexShrink: 0, paddingTop: 1 },
  rowVal: { fontSize: 13, color: '#ccc', flex: 1 },
  operatorBanner: { background: '#0a2a0a', border: '1px solid #1a4a1a', borderRadius: 12, padding: '10px 14px', marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' },
  orderNum: { fontSize: 12, color: '#555', marginTop: 8 },
  empty: { color: '#555', textAlign: 'center', marginTop: 80, fontSize: 15 },
};

function InfoRow({ k, v }) {
  if (!v) return null;
  return (
    <div style={S.row}>
      <div style={S.rowKey}>{k}</div>
      <div style={S.rowVal}>{v}</div>
    </div>
  );
}

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

      {loading && <div style={{ color: '#888', textAlign: 'center', marginTop: 60 }}>Загрузка...</div>}
      {!loading && orders.length === 0 && <div style={S.empty}>Заказов пока нет</div>}

      {orders.map(o => {
        const st = STATUS[o.status] || STATUS.NEW;
        return (
          <div key={o.id} style={S.card}>
            <div style={S.cardHeader}>
              <div style={S.service}>{SERVICE_LABELS[o.serviceType] || o.serviceType}</div>
              <div style={{ ...S.badge, background: st.bg, color: st.color }}>
                {st.icon} {st.label}
              </div>
            </div>

            <InfoRow k="Адрес" v={o.address} />
            {o.scheduledTime && <InfoRow k="Время" v={new Date(o.scheduledTime).toLocaleString('ru-RU')} />}
            {o.durationHours && <InfoRow k="Длит." v={`${o.durationHours} ч.`} />}
            {o.approxDuration && <InfoRow k="Длит." v={o.approxDuration} />}
            {o.airport && <InfoRow k="Аэропорт" v={o.airport} />}
            {o.flightNumber && <InfoRow k="Рейс" v={o.flightNumber} />}
            {o.valetAction && <InfoRow k="Действие" v={o.valetAction === 'PARK' ? '🅿️ Припарковать' : '🚗 Забрать'} />}
            {o.restaurant && <InfoRow k="Ресторан" v={o.restaurant} />}
            {o.extraServices && <InfoRow k="Доп." v={o.extraServices} />}
            {o.comment && <InfoRow k="Коммент." v={o.comment} />}

            {/* Оператор взял в работу */}
            {o.status === 'IN_PROGRESS' && o.operatorName && (
              <div style={S.operatorBanner}>
                <span style={{ fontSize: 18 }}>👤</span>
                <span style={{ fontSize: 13, color: '#7ec87e' }}>
                  Заказ взял оператор <b>{o.operatorName}</b>. Ожидайте звонка.
                </span>
              </div>
            )}
            {o.status === 'IN_PROGRESS' && !o.operatorName && (
              <div style={S.operatorBanner}>
                <span style={{ fontSize: 18 }}>🔄</span>
                <span style={{ fontSize: 13, color: '#7ec87e' }}>Заказ принят в работу. Ожидайте звонка.</span>
              </div>
            )}

            <div style={S.orderNum}>Заказ #{o.id} · {new Date(o.createdAt).toLocaleDateString('ru-RU')}</div>
          </div>
        );
      })}
    </div>
  );
}
