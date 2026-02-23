const router = require('express').Router();
const prisma = require('../prisma');
const { adminMiddleware } = require('../middleware/auth');

router.use(adminMiddleware);

router.get('/orders', async (req, res) => {
  const { status } = req.query;
  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

router.get('/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: true }
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });
  res.json(order);
});

module.exports = router;
