const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { validateTelegramInitData } = require('../services/telegram');

// Telegram Mini App auth
router.post('/telegram', async (req, res) => {
  const { initData } = req.body;
  if (!initData) return res.status(400).json({ error: 'initData required' });

  const tgUser = validateTelegramInitData(initData);
  if (!tgUser) return res.status(401).json({ error: 'Invalid initData' });

  let user = await prisma.user.findUnique({
    where: { telegramId: String(tgUser.id) }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: String(tgUser.id),
        username: tgUser.username || null,
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
      }
    });
  }

  const token = jwt.sign({ userId: user.id, telegramId: user.telegramId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Update phone
router.post('/phone', async (req, res) => {
  const { initData, phone } = req.body;
  if (!initData || !phone) return res.status(400).json({ error: 'Missing fields' });

  const tgUser = validateTelegramInitData(initData);
  if (!tgUser) return res.status(401).json({ error: 'Invalid initData' });

  const user = await prisma.user.update({
    where: { telegramId: String(tgUser.id) },
    data: { phone }
  });

  res.json({ user });
});

// Admin login
router.post('/admin', async (req, res) => {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ isAdmin: true, username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

module.exports = router;
