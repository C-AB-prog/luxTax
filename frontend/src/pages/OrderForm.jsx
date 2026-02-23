import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const SERVICE_LABELS = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT_TO: 'Отвезти в аэропорт',
  AIRPORT_FROM: 'Встретить из аэропорта',
};

const S = {
  root: { minHeight: '100vh', background: '#0a0a0a', padding: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  back: { background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' },
  title: { fontSize: 20, fontWeight: 700, color: '#fff' },
  group: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    width: '100%', background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '13px 14px', color: '#fff', fontSize: 15,
    outline: 'none'
  },
  select: {
    width: '100%', background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '13px 14px', color: '#fff', fontSize: 15,
    outline: 'none', appearance: 'none'
  },
  textarea: {
    width: '100%', background: '#141414', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '13px 14px', color: '#fff', fontSize: 15,
    outline: 'none', resize: 'vertical', minHeight: 80
  },
  btn: {
    width: '100%', marginTop: 8,
    background: 'linear-gradient(90deg, #c9a84c 0%, #e6c97a 100%)',
    border: 'none', borderRadius: 14, padding: '16px', color: '#000',
    fontSize: 16, fontWeight: 700, cursor: 'pointer'
  },
  error: { color: '#f44', fontSize: 13, marginTop: 8 },
  success: { color: '#4f4', fontSize: 15, textAlign: 'center', marginTop: 20 }
};

export default function OrderForm() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    address: '', scheduledTime: '', durationHours: '',
    approxDuration: '', airport: 'SVO', flightNumber: '', comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createOrder({
        serviceType: type,
        address: form.address,
        scheduledTime: form.scheduledTime || undefined,
        durationHours: form.durationHours ? Number(form.durationHours) : undefined,
        approxDuration: form.approxDuration || undefined,
        airport: ['AIRPORT_TO', 'AIRPORT_FROM'].includes(type) ? form.airport : undefined,
        flightNumber: form.flightNumber || undefined,
        comment: form.comment || undefined,
      });
      setSuccess(true);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => navigate('/'), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ ...S.root, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <div style={S.success}>Заявка принята!<br/>Оператор свяжется с вами.</div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div style={S.title}>{SERVICE_LABELS[type] || type}</div>
      </div>
      <form onSubmit={submit}>
        <div style={S.group}>
          <label style={S.label}>Адрес подачи *</label>
          <input style={S.input} required value={form.address} onChange={set('address')} placeholder="ул. Тверская, 1" />
        </div>

        {['SOBER_DRIVER', 'DRIVER_BY_HOUR', 'AIRPORT_TO', 'AIRPORT_FROM'].includes(type) && (
          <div style={S.group}>
            <label style={S.label}>Дата и время</label>
            <input style={S.input} type="datetime-local" value={form.scheduledTime} onChange={set('scheduledTime')} />
          </div>
        )}

        {type === 'DRIVER_WEEKEND' && (
          <div style={S.group}>
            <label style={S.label}>Дата</label>
            <input style={S.input} type="date" value={form.scheduledTime} onChange={set('scheduledTime')} />
          </div>
        )}

        {type === 'DRIVER_BY_HOUR' && (
          <div style={S.group}>
            <label style={S.label}>Количество часов</label>
            <input style={S.input} type="number" min="1" value={form.durationHours} onChange={set('durationHours')} placeholder="3" />
          </div>
        )}

        {type === 'DRIVER_WEEKEND' && (
          <div style={S.group}>
            <label style={S.label}>Примерная длительность</label>
            <input style={S.input} value={form.approxDuration} onChange={set('approxDuration')} placeholder="Весь день / половину дня" />
          </div>
        )}

        {['AIRPORT_TO', 'AIRPORT_FROM'].includes(type) && (
          <>
            <div style={S.group}>
              <label style={S.label}>Аэропорт</label>
              <select style={S.select} value={form.airport} onChange={set('airport')}>
                <option value="SVO">SVO — Шереметьево</option>
                <option value="DME">DME — Домодедово</option>
                <option value="VKO">VKO — Внуково</option>
              </select>
            </div>
            <div style={S.group}>
              <label style={S.label}>Номер рейса (необязательно)</label>
              <input style={S.input} value={form.flightNumber} onChange={set('flightNumber')} placeholder="SU 123" />
            </div>
          </>
        )}

        <div style={S.group}>
          <label style={S.label}>Комментарий</label>
          <textarea style={S.textarea} value={form.comment} onChange={set('comment')} placeholder="Любые пожелания..." />
        </div>

        {error && <div style={S.error}>{error}</div>}

        <button style={S.btn} type="submit" disabled={loading}>
          {loading ? 'Отправляем...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  );
}
