const crypto = require('crypto');

// Your admin password
const password = 'ReviveHair2025!';

// The PASSWORD_SALT generated above
const salt = '95b03d440d63d993ccf9a9fb155a3542d400d2378d42c4a8e82547323f512fd4';

const hash = crypto
  .createHash('sha256')
  .update(password + salt)
  .digest('hex');

console.log('ADMIN_PASSWORD_HASH:', hash);
