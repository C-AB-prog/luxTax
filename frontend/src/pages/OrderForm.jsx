import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const SERVICE_LABELS = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT: 'Аэропорт',
  AIRPORT_TO: 'Отвезти в аэропорт',
  AIRPORT_FROM: 'Встретить из аэропорта',
  VALET_PARKING: '🚘 Valet Parking',
};

// Рестораны — добавь свои
const RESTAURANTS = [
  'White Rabbit',
  'Selfie',
  'Savva',
  'Grand Cru',
  'Brasserie Мост',
  'Другое',
];

const EXTRA_SERVICES = [
  { id: 'fuel', label: '⛽ Заправить авто' },
  { id: 'wash', label: '🚿 Помыть авто' },
];

const S = {
  root: { minHeight: '100vh', background: '#0a0a0a', padding: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  back: { background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' },
  title: { fontSize: 20, fontWeight: 700, color: '#fff' },
  group: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '13px 14px', color: '#fff', fontSize: 15, outline: 'none' },
  select: { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '13px 14px', color: '#fff', fontSize: 15, outline: 'none', appearance: 'none' },
  textarea: { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '13px 14px', color: '#fff', fontSize: 15, outline: 'none', resize: 'vertical', minHeight: 80 },
  btn: { width: '100%', marginTop: 8, background: 'linear-gradient(90deg, #c9a84c 0%, #e6c97a 100%)', border: 'none', borderRadius: 14, padding: '16px', color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  segmented: { display: 'flex', gap: 8, marginBottom: 4 },
  seg: { flex: 1, padding: '12px 8px', border: '1px solid #2a2a2a', borderRadius: 12, background: '#141414', color: '#888', fontSize: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' },
  segActive: { border: '1px solid #c9a84c', background: '#1a1500', color: '#c9a84c', fontWeight: 700 },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, marginBottom: 8, cursor: 'pointer' },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxChecked: { background: '#c9a84c', border: '2px solid #c9a84c' },
  error: { color: '#f44', fontSize: 13, marginTop: 8 },
  success: { color: '#4f4', fontSize: 15, textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 14, color: '#c9a84c', fontWeight: 700, marginBottom: 12, marginTop: 8 },
};

export default function OrderForm() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: '',
    scheduledTime: '',
    durationHours: '',
    approxDuration: '',
    airportDirection: 'TO', // TO or FROM
    airport: 'SVO',
    flightNumber: '',
    valetAction: 'PARK',
    restaurant: RESTAURANTS[0],
    comment: ''
  });
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setDirect = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleExtra(id) {
    setExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let serviceType = type;
      let payload = {
        address: form.address,
        comment: form.comment || undefined,
      };

      if (type === 'SOBER_DRIVER') {
        serviceType = 'SOBER_DRIVER';
        payload.scheduledTime = form.scheduledTime || undefined;
      } else if (type === 'DRIVER_BY_HOUR') {
        serviceType = 'DRIVER_BY_HOUR';
        payload.scheduledTime = form.scheduledTime || undefined;
        payload.durationHours = form.durationHours ? Number(form.durationHours) : undefined;
      } else if (type === 'DRIVER_WEEKEND') {
        serviceType = 'DRIVER_WEEKEND';
        payload.scheduledTime = form.scheduledTime || undefined;
        payload.approxDuration = form.approxDuration || undefined;
      } else if (type === 'AIRPORT') {
        serviceType = form.airportDirection === 'TO' ? 'AIRPORT_TO' : 'AIRPORT_FROM';
        payload.scheduledTime = form.scheduledTime || undefined;
        payload.airport = form.airport;
        payload.flightNumber = form.flightNumber || undefined;
      } else if (type === 'VALET_PARKING') {
        serviceType = 'VALET_PARKING';
        payload.valetAction = form.valetAction;
        payload.restaurant = form.restaurant;
        payload.scheduledTime = form.scheduledTime || undefined;
        if (extras.length > 0) {
          payload.extraServices = extras.map(id => EXTRA_SERVICES.find(e => e.id === id)?.label).join(', ');
        }
      }

      await api.createOrder({ serviceType, ...payload });
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
        <div style={{ fontSize: 56 }}>✅</div>
        <div style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginTop: 16, textAlign: 'center' }}>Заявка принята!</div>
        <div style={{ fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' }}>Оператор свяжется с вами.</div>
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

        {/* AIRPORT — выбор направления */}
        {type === 'AIRPORT' && (
          <div style={S.group}>
            <label style={S.label}>Направление</label>
            <div style={S.segmented}>
              <div
                style={{ ...S.seg, ...(form.airportDirection === 'TO' ? S.segActive : {}) }}
                onClick={() => setDirect('airportDirection', 'TO')}
              >✈️ Отвезти</div>
              <div
                style={{ ...S.seg, ...(form.airportDirection === 'FROM' ? S.segActive : {}) }}
                onClick={() => setDirect('airportDirection', 'FROM')}
              >🛬 Встретить</div>
            </div>
          </div>
        )}

        {/* VALET — выбор действия */}
        {type === 'VALET_PARKING' && (
          <div style={S.group}>
            <label style={S.label}>Что нужно сделать?</label>
            <div style={S.segmented}>
              <div
                style={{ ...S.seg, ...(form.valetAction === 'PARK' ? S.segActive : {}) }}
                onClick={() => setDirect('valetAction', 'PARK')}
              >🅿️ Припарковать</div>
              <div
                style={{ ...S.seg, ...(form.valetAction === 'PICKUP' ? S.segActive : {}) }}
                onClick={() => setDirect('valetAction', 'PICKUP')}
              >🚗 Забрать</div>
            </div>
          </div>
        )}

        {/* VALET — ресторан */}
        {type === 'VALET_PARKING' && (
          <div style={S.group}>
            <label style={S.label}>Ресторан</label>
            <select style={S.select} value={form.restaurant} onChange={set('restaurant')}>
              {RESTAURANTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        {/* Адрес */}
        <div style={S.group}>
          <label style={S.label}>{type === 'VALET_PARKING' ? 'Где находится авто' : 'Адрес подачи *'}</label>
          <input style={S.input} required value={form.address} onChange={set('address')}
            placeholder={type === 'VALET_PARKING' ? 'Укажите где стоит авто' : 'ул. Тверская, 1'} />
        </div>

        {/* Дата/время */}
        {['SOBER_DRIVER', 'DRIVER_BY_HOUR', 'AIRPORT', 'VALET_PARKING'].includes(type) && (
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

        {/* Часы */}
        {type === 'DRIVER_BY_HOUR' && (
          <div style={S.group}>
            <label style={S.label}>Количество часов</label>
            <input style={S.input} type="number" min="1" value={form.durationHours} onChange={set('durationHours')} placeholder="3" />
          </div>
        )}

        {/* Прим. длительность */}
        {type === 'DRIVER_WEEKEND' && (
          <div style={S.group}>
            <label style={S.label}>Примерная длительность</label>
            <input style={S.input} value={form.approxDuration} onChange={set('approxDuration')} placeholder="Весь день / половину дня" />
          </div>
        )}

        {/* Аэропорт */}
        {type === 'AIRPORT' && (
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

        {/* Доп. услуги для Valet */}
        {type === 'VALET_PARKING' && (
          <div style={S.group}>
            <label style={S.label}>Дополнительные услуги</label>
            {EXTRA_SERVICES.map(ex => (
              <div key={ex.id} style={S.checkboxRow} onClick={() => toggleExtra(ex.id)}>
                <div style={{ ...S.checkbox, ...(extras.includes(ex.id) ? S.checkboxChecked : {}) }}>
                  {extras.includes(ex.id) && <span style={{ color: '#000', fontSize: 12 }}>✓</span>}
                </div>
                <span style={{ color: '#ccc', fontSize: 14 }}>{ex.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Комментарий */}
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
