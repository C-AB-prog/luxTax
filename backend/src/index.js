const express = require('express');
const cors = require('cors');
const { setupWebhook } = require('./bot/webhook');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const botRoutes = require('./routes/bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Raw body for webhook verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhook', botRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await setupWebhook();
});
