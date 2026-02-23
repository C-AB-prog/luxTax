const router = require('express').Router();
const prisma = require('../prisma');
const { sendMessage, answerCallbackQuery, forwardMessage } = require('../services/bot');

// Verify webhook secret
router.use((req, res, next) => {
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

router.post('/', async (req, res) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Handle callback queries (operator buttons)
  if (body.callback_query) {
    const { id, data, message } = body.callback_query;
    const [, newStatus, orderId] = data.split(':');

    try {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: newStatus }
      });

      const statusMap = {
        IN_PROGRESS: '🔄 Взято в работу',
        COMPLETED: '✅ Завершено',
        CANCELLED: '❌ Отменено'
      };

      await answerCallbackQuery(id, `Статус обновлён: ${statusMap[newStatus]}`);

      // Remove inline keyboard after action
      const axios = require('axios');
      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: message.text + `\n\n<b>Статус: ${statusMap[newStatus]}</b>`,
        parse_mode: 'HTML'
      });
    } catch (e) {
      console.error('Callback error:', e.message);
      await answerCallbackQuery(id, 'Ошибка обновления');
    }

    return res.json({ ok: true });
  }

  // Handle messages
  if (body.message) {
    const { message } = body;
    const chatId = message.chat.id;
    const text = message.text;

    // Handle /start command
    if (text === '/start') {
      await sendMessage(chatId,
        '👋 Добро пожаловать в VIP Driver!\n\nОткройте приложение для заказа водителя.',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🚗 Открыть приложение', web_app: { url: process.env.MINI_APP_URL || 'https://yourdomain.com' } }
            ]]
          }
        }
      );
      return res.json({ ok: true });
    }

    // If message is from operator chat — ignore
    if (String(chatId) === String(process.env.OPERATOR_CHAT_ID)) {
      return res.json({ ok: true });
    }

    // User wants to talk to operator (triggered by mini app)
    if (text === '/operator') {
      await sendMessage(chatId, '💬 Опишите вашу задачу. Оператор свяжется с вами в ближайшее время.');
      return res.json({ ok: true });
    }

    // Forward all user messages to operator chat
    try {
      await forwardMessage(chatId, process.env.OPERATOR_CHAT_ID, message.message_id);
      // Add context
      const user = message.from;
      await sendMessage(process.env.OPERATOR_CHAT_ID,
        `📨 Сообщение от @${user.username || user.first_name} (ID: ${user.id})`
      );
    } catch (e) {
      console.error('Forward error:', e.message);
    }
  }

  res.json({ ok: true });
});

module.exports = router;
