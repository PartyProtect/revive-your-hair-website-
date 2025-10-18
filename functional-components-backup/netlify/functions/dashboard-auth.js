// Dashboard Authentication Function
// Provides secure server-side password validation

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { password } = JSON.parse(event.body || '{}');
    
    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password required' })
      };
    }

    // Hash the provided password
    const inputHash = crypto
      .createHash('sha256')
      .update(password + 'salt-key-2025')
      .digest('hex');

    // Get stored hash from environment variable (set in Netlify)
    const correctHash = process.env.ADMIN_PASSWORD_HASH || '215e1a2171349b3875167351971b9ccf293a9fbac9fca7de802602e77d2d1ae4';

    if (inputHash === correctHash) {
      // Generate session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + (8 * 60 * 60 * 1000); // 8 hours

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: sessionToken,
          expiresAt
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
