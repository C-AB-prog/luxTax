const crypto = require('crypto');

function validateTelegramInitData(initData) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return null;

  urlParams.delete('hash');
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN)
    .digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (expectedHash !== hash) return null;

  const user = urlParams.get('user');
  return user ? JSON.parse(user) : null;
}

module.exports = { validateTelegramInitData };
