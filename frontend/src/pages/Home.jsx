import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const services = [
  { type: 'SOBER_DRIVER',   icon: '🍹', label: 'Трезвый\nводитель' },
  { type: 'DRIVER_BY_HOUR', icon: '⏱', label: 'Водитель\nна час' },
  { type: 'DRIVER_WEEKEND', icon: '🗓', label: 'Водитель\nна выходной' },
  { type: 'AIRPORT_TO',     icon: '✈️', label: 'Отвезти\nв аэропорт' },
  { type: 'AIRPORT_FROM',   icon: '🛬', label: 'Встретить\nиз аэропорта' },
  { type: 'OPERATOR',       icon: '🎧', label: 'Оператор' },
];

const styles = {
  root: { minHeight: '100vh', background: '#0a0a0a', padding: '16px' },
  header: { textAlign: 'center', padding: '24px 0 32px' },
  logo: { fontSize: 13, letterSpacing: 4, color: '#888', textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: 1 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
    border: '1px solid #222',
    borderRadius: 16,
    padding: '24px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    cursor: 'pointer', transition: 'all 0.2s',
    minHeight: 120
  },
  icon: { fontSize: 32 },
  label: { fontSize: 13, color: '#ccc', textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.4, fontWeight: 500 },
  footer: { marginTop: 24, textAlign: 'center' },
  myOrdersBtn: {
    background: 'none', border: '1px solid #333', borderRadius: 12,
    color: '#888', padding: '10px 24px', cursor: 'pointer', fontSize: 13
  }
};

export default function Home() {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div style={{ ...styles.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#888' }}>Загрузка...</span></div>;
  if (error) return <div style={{ ...styles.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#f44' }}>{error}</span></div>;

  function handleTile(type) {
    if (type === 'OPERATOR') {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.close();
        // Open bot chat
        window.location.href = `https://t.me/${import.meta.env.VITE_BOT_USERNAME}?start=operator`;
      }
      return;
    }
    if (!user?.phone) {
      navigate('/phone', { state: { next: `/order/${type}` } });
      return;
    }
    navigate(`/order/${type}`);
  }

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={styles.logo}>VIP Service</div>
        <div style={styles.title}>Ваш водитель</div>
        {user && <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>Добро пожаловать, {user.firstName || 'гость'}</div>}
      </div>
      <div style={styles.grid}>
        {services.map(s => (
          <div
            key={s.type}
            style={styles.card}
            onClick={() => handleTile(s.type)}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
          >
            <span style={styles.icon}>{s.icon}</span>
            <span style={styles.label}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={styles.footer}>
        <button style={styles.myOrdersBtn} onClick={() => navigate('/my-orders')}>Мои заказы</button>
      </div>
    </div>
  );
}
