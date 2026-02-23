const axios = require('axios');

const BOT_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

const SERVICE_MAP = {
  SOBER_DRIVER: 'Трезвый водитель',
  DRIVER_BY_HOUR: 'Водитель на час',
  DRIVER_WEEKEND: 'Водитель на выходной',
  AIRPORT_TO: '✈️ Отвезти в аэропорт',
  AIRPORT_FROM: '🛬 Встретить из аэропорта',
  VALET_PARKING: '🚘 Valet Parking'
};

async function sendMessage(chatId, text, extra = {}) {
  return axios.post(`${BOT_URL}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra
  });
}

async function answerCallbackQuery(callbackQueryId, text = '') {
  return axios.post(`${BOT_URL}/answerCallbackQuery`, {
    callback_query_id: callbackQueryId,
    text
  });
}

async function forwardMessage(fromChatId, toChatId, messageId) {
  return axios.post(`${BOT_URL}/forwardMessage`, {
    chat_id: toChatId,
    from_chat_id: fromChatId,
    message_id: messageId
  });
}

function buildOrderNotification(order, user) {
  const lines = [
    `<b>🚗 Новый заказ #${order.id}</b>`,
    ``,
    `👤 <b>Клиент:</b> ${[user.firstName, user.lastName].filter(Boolean).join(' ')}`,
    `📱 <b>Телефон:</b> ${user.phone || 'не указан'}`,
    `🎯 <b>Услуга:</b> ${SERVICE_MAP[order.serviceType] || order.serviceType}`,
    `📍 <b>Адрес:</b> ${order.address}`,
  ];

  if (order.scheduledTime) lines.push(`⏰ <b>Время:</b> ${new Date(order.scheduledTime).toLocaleString('ru-RU')}`);
  if (order.durationHours) lines.push(`⌛ <b>Длительность:</b> ${order.durationHours} ч.`);
  if (order.approxDuration) lines.push(`⌛ <b>Примерная длит.:</b> ${order.approxDuration}`);
  if (order.airport) lines.push(`✈️ <b>Аэропорт:</b> ${order.airport}`);
  if (order.flightNumber) lines.push(`🛫 <b>Рейс:</b> ${order.flightNumber}`);
  if (order.valetAction) lines.push(`🅿️ <b>Действие:</b> ${order.valetAction === 'PARK' ? 'Припарковать' : 'Забрать машину'}`);
  if (order.restaurant) lines.push(`🍽 <b>Ресторан:</b> ${order.restaurant}`);
  if (order.extraServices) lines.push(`➕ <b>Доп. услуги:</b> ${order.extraServices}`);
  if (order.comment) lines.push(`💬 <b>Комментарий:</b> ${order.comment}`);

  return lines.join('\n');
}

async function notifyOperator(order, user) {
  const text = buildOrderNotification(order, user);
  return sendMessage(process.env.OPERATOR_CHAT_ID, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Взять в работу', callback_data: `status:IN_PROGRESS:${order.id}` },
          { text: '🏁 Завершить', callback_data: `status:COMPLETED:${order.id}` },
        ],
        [
          { text: '❌ Отменить', callback_data: `status:CANCELLED:${order.id}` }
        ]
      ]
    }
  });
}

async function notifyUser(telegramId, status, orderId, operatorName) {
  const messages = {
    IN_PROGRESS: `✅ <b>Ваш заказ #${orderId} принят!</b>\n\nОператор${operatorName ? ' ' + operatorName : ''} взял ваш заказ в работу. Ожидайте — с вами свяжутся.`,
    COMPLETED: `🏁 <b>Заказ #${orderId} завершён</b>\n\nСпасибо, что воспользовались нашим сервисом!`,
    CANCELLED: `❌ <b>Заказ #${orderId} отменён</b>\n\nЕсли у вас вопросы — напишите оператору.`
  };
  const text = messages[status];
  if (!text) return;
  try {
    await sendMessage(telegramId, text);
  } catch (e) {
    console.error('Failed to notify user:', e.message);
  }
}

module.exports = { sendMessage, answerCallbackQuery, forwardMessage, notifyOperator, notifyUser, SERVICE_MAP };
