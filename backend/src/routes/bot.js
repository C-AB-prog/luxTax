const router = require('express').Router();
const prisma = require('../prisma');
const { sendMessage, answerCallbackQuery, forwardMessage, notifyUser } = require('../services/bot');
const axios = require('axios');

router.use((req, res, next) => {
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

router.post('/', async (req, res) => {
  const body = req.body;

  if (body.callback_query) {
    const { id, data, message, from } = body.callback_query;
    const parts = data.split(':');
    const newStatus = parts[1];
    const orderId = Number(parts[2]);

    try {
      const operatorName = from?.first_name || from?.username || null;

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          ...(newStatus === 'IN_PROGRESS' ? { operatorName } : {})
        },
        include: { user: true }
      });

      const statusMap = {
        IN_PROGRESS: '🔄 Взято в работу',
        COMPLETED: '✅ Завершено',
        CANCELLED: '❌ Отменено'
      };

      await answerCallbackQuery(id, `Статус: ${statusMap[newStatus]}`);

      const operatorText = message.text + `\n\n<b>Статус: ${statusMap[newStatus]}</b>${operatorName ? `\nОператор: ${operatorName}` : ''}`;

      const remainingButtons = newStatus === 'IN_PROGRESS'
        ? { inline_keyboard: [[
            { text: '🏁 Завершить', callback_data: `status:COMPLETED:${orderId}` },
            { text: '❌ Отменить', callback_data: `status:CANCELLED:${orderId}` }
          ]]}
        : { inline_keyboard: [] };

      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: operatorText,
        parse_mode: 'HTML',
        reply_markup: remainingButtons
      });

      if (order.user?.telegramId) {
        await notifyUser(order.user.telegramId, newStatus, orderId, operatorName);
      }

    } catch (e) {
      console.error('Callback error:', e.message);
      await answerCallbackQuery(id, 'Ошибка обновления');
    }

    return res.json({ ok: true });
  }

  if (body.message) {
    const { message } = body;
    const chatId = message.chat.id;
    const text = message.text;

    if (text === '/start' || text?.startsWith('/start')) {
      await sendMessage(chatId,
        '👋 Добро пожаловать в LuxTaxi!\n\nОткройте приложение для заказа водителя.',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🚗 Открыть приложение', web_app: { url: process.env.MINI_APP_URL || 'https://luxtax1.ru' } }
            ]]
          }
        }
      );
      return res.json({ ok: true });
    }

    if (String(chatId) === String(process.env.OPERATOR_CHAT_ID)) {
      return res.json({ ok: true });
    }

    if (text === '/operator') {
      await sendMessage(chatId, '💬 Опишите вашу задачу. Оператор свяжется с вами в ближайшее время.');
      return res.json({ ok: true });
    }

    try {
      await forwardMessage(chatId, process.env.OPERATOR_CHAT_ID, message.message_id);
      const user = message.from;
      await sendMessage(process.env.OPERATOR_CHAT_ID,
        `📨 Сообщение от ${user.first_name || ''}${user.username ? ' @' + user.username : ''} (ID: ${user.id})`
      );
    } catch (e) {
      console.error('Forward error:', e.message);
    }
  }

  res.json({ ok: true });
});

module.exports = router;
