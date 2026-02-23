const axios = require('axios');

const BOT_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

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

async function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
  return axios.post(`${BOT_URL}/editMessageReplyMarkup`, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup
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
  const serviceMap = {
    SOBER_DRIVER: 'Трезвый водитель',
    DRIVER_BY_HOUR: 'Водитель на час',
    DRIVER_WEEKEND: 'Водитель на выходной',
    AIRPORT_TO: 'Отвезти в аэропорт',
    AIRPORT_FROM: 'Встретить из аэропорта'
  };

  const lines = [
    `<b>🚗 Новый заказ #${order.id}</b>`,
    ``,
    `👤 <b>Клиент:</b> ${user.firstName || ''} ${user.lastName || ''}`.trim(),
    `📱 <b>Телефон:</b> ${user.phone || 'не указан'}`,
    `🎯 <b>Услуга:</b> ${serviceMap[order.serviceType]}`,
    `📍 <b>Адрес:</b> ${order.address}`,
  ];

  if (order.scheduledTime) lines.push(`⏰ <b>Время:</b> ${new Date(order.scheduledTime).toLocaleString('ru-RU')}`);
  if (order.durationHours) lines.push(`⌛ <b>Длительность:</b> ${order.durationHours} ч.`);
  if (order.approxDuration) lines.push(`⌛ <b>Примерная длит.:</b> ${order.approxDuration}`);
  if (order.airport) lines.push(`✈️ <b>Аэропорт:</b> ${order.airport}`);
  if (order.flightNumber) lines.push(`🛫 <b>Рейс:</b> ${order.flightNumber}`);
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

module.exports = { sendMessage, answerCallbackQuery, editMessageReplyMarkup, forwardMessage, notifyOperator };
