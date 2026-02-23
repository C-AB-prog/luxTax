const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware } = require('../middleware/auth');
const { notifyOperator } = require('../services/bot');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.phone) return res.status(400).json({ error: 'Phone number required to create order' });

  const {
    serviceType, address, scheduledTime, durationHours,
    approxDuration, airport, flightNumber,
    valetAction, restaurant, extraServices, comment
  } = req.body;

  if (!serviceType || !address) {
    return res.status(400).json({ error: 'serviceType and address are required' });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      serviceType,
      address,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      durationHours: durationHours || null,
      approxDuration: approxDuration || null,
      airport: airport || null,
      flightNumber: flightNumber || null,
      valetAction: valetAction || null,
      restaurant: restaurant || null,
      extraServices: extraServices || null,
      comment: comment || null,
    }
  });

  try {
    await notifyOperator(order, user);
  } catch (e) {
    console.error('Failed to notify operator:', e.message);
  }

  res.status(201).json(order);
});

router.get('/me', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

module.exports = router;
