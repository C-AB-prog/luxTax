const axios = require('axios');

async function setupWebhook() {
  const url = process.env.WEBHOOK_URL;
  if (!url) {
    console.warn('WEBHOOK_URL not set, skipping webhook registration');
    return;
  }
  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`,
      {
        url: `${url}/webhook`,
        secret_token: process.env.WEBHOOK_SECRET
      }
    );
    console.log('Webhook set:', res.data);
  } catch (e) {
    console.error('Failed to set webhook:', e.message);
  }
}

module.exports = { setupWebhook };
