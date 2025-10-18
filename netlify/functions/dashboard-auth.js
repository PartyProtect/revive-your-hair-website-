// ============================================================================
// SECURE DASHBOARD AUTHENTICATION FUNCTION
// ============================================================================
// 
// Security Features:
// ✅ No hardcoded passwords or salts
// ✅ Rate limiting (5 attempts per 15 minutes per IP)
// ✅ IP-based lockout after repeated failures
// ✅ Session token validation and expiration
// ✅ Persistent storage using Netlify Blobs
// ✅ Secure token generation
// ✅ CORS protection
//
// Required Environment Variables:
// - ADMIN_PASSWORD_HASH: SHA-256 hash of your password (see below for generation)
// - PASSWORD_SALT: Random salt string (32+ characters)
// - SESSION_SECRET: Random secret for token signing (32+ characters)
//
// How to generate password hash (run in Node.js):
// const crypto = require('crypto');
// const password = 'your-secure-password';
// const salt = 'your-random-salt-32-chars-minimum';
// const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
// console.log('ADMIN_PASSWORD_HASH:', hash);
// ============================================================================

const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Rate limiting
  MAX_ATTEMPTS: 5,                    // Max login attempts
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  LOCKOUT_DURATION: 60 * 60 * 1000,  // 1 hour lockout after max attempts
  
  // Session management
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
  TOKEN_LENGTH: 32,                      // Session token length (bytes)
  
  // Security
  ALLOWED_ORIGINS: [
    'https://www.reviveyourhair.eu',
    'https://reviveyourhair.eu',
    'http://localhost:8000',          // Local development
    'http://localhost:8888',          // Netlify dev
  ]
};

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

function validateEnvironment() {
  const required = ['ADMIN_PASSWORD_HASH', 'PASSWORD_SALT', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please set these in your Netlify dashboard under Site settings > Environment variables`
    );
  }
  
  // Validate salt and secret length
  if (process.env.PASSWORD_SALT.length < 32) {
    throw new Error('PASSWORD_SALT must be at least 32 characters');
  }
  
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }
  
  // Validate password hash format (should be 64 char hex string)
  if (!/^[a-f0-9]{64}$/i.test(process.env.ADMIN_PASSWORD_HASH)) {
    throw new Error('ADMIN_PASSWORD_HASH must be a valid SHA-256 hash (64 hex characters)');
  }
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

async function getAuthStore() {
  return getStore('auth');
}

async function getRateLimitData(ip) {
  const store = await getAuthStore();
  const data = await store.get(`ratelimit:${ip}`, { type: 'json' });
  return data || { attempts: 0, firstAttempt: Date.now(), lockedUntil: null };
}

async function saveRateLimitData(ip, data) {
  const store = await getAuthStore();
  await store.set(`ratelimit:${ip}`, JSON.stringify(data), {
    metadata: { expiresAt: Date.now() + CONFIG.RATE_LIMIT_WINDOW }
  });
}

async function getSessionData(token) {
  const store = await getAuthStore();
  const data = await store.get(`session:${token}`, { type: 'json' });
  return data;
}

async function saveSessionData(token, data) {
  const store = await getAuthStore();
  await store.set(`session:${token}`, JSON.stringify(data), {
    metadata: { expiresAt: data.expiresAt }
  });
}

async function deleteSession(token) {
  const store = await getAuthStore();
  await store.delete(`session:${token}`);
}

// ============================================================================
// SECURITY FUNCTIONS
// ============================================================================

/**
 * Get client IP address with support for proxies
 */
function getClientIP(event) {
  // Check various headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',  // Cloudflare
    'x-client-ip',
    'client-ip'
  ];
  
  for (const header of headers) {
    const value = event.headers[header];
    if (value) {
      // x-forwarded-for can be a comma-separated list
      return value.split(',')[0].trim();
    }
  }
  
  return 'unknown';
}

/**
 * Hash password with salt
 */
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + process.env.PASSWORD_SALT)
    .digest('hex');
}

/**
 * Generate cryptographically secure random token
 */
function generateSecureToken() {
  return crypto.randomBytes(CONFIG.TOKEN_LENGTH).toString('hex');
}

/**
 * Sign token with secret (HMAC)
 */
function signToken(token) {
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(token)
    .digest('hex');
}

/**
 * Verify token signature
 */
function verifyTokenSignature(token, signature) {
  const expectedSignature = signToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Check CORS origin
 */
function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.some(allowed => {
    if (allowed.endsWith('*')) {
      const prefix = allowed.slice(0, -1);
      return origin.startsWith(prefix);
    }
    return origin === allowed;
  });
}

// ============================================================================
// RATE LIMITING
// ============================================================================

async function checkRateLimit(ip) {
  const data = await getRateLimitData(ip);
  const now = Date.now();
  
  // Check if locked out
  if (data.lockedUntil && now < data.lockedUntil) {
    const remainingMinutes = Math.ceil((data.lockedUntil - now) / 60000);
    return {
      allowed: false,
      reason: 'locked',
      message: `Too many failed attempts. Account locked for ${remainingMinutes} more minute(s).`,
      retryAfter: Math.ceil((data.lockedUntil - now) / 1000)
    };
  }
  
  // Reset if window expired
  if (now - data.firstAttempt > CONFIG.RATE_LIMIT_WINDOW) {
    data.attempts = 0;
    data.firstAttempt = now;
    data.lockedUntil = null;
  }
  
  // Check if too many attempts
  if (data.attempts >= CONFIG.MAX_ATTEMPTS) {
    data.lockedUntil = now + CONFIG.LOCKOUT_DURATION;
    await saveRateLimitData(ip, data);
    
    const lockoutMinutes = Math.ceil(CONFIG.LOCKOUT_DURATION / 60000);
    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      message: `Maximum login attempts (${CONFIG.MAX_ATTEMPTS}) exceeded. Account locked for ${lockoutMinutes} minutes.`,
      retryAfter: Math.ceil(CONFIG.LOCKOUT_DURATION / 1000)
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: CONFIG.MAX_ATTEMPTS - data.attempts
  };
}

async function recordFailedAttempt(ip) {
  const data = await getRateLimitData(ip);
  const now = Date.now();
  
  // Reset if window expired
  if (now - data.firstAttempt > CONFIG.RATE_LIMIT_WINDOW) {
    data.attempts = 1;
    data.firstAttempt = now;
    data.lockedUntil = null;
  } else {
    data.attempts += 1;
  }
  
  await saveRateLimitData(ip, data);
  return data.attempts;
}

async function clearRateLimit(ip) {
  const data = {
    attempts: 0,
    firstAttempt: Date.now(),
    lockedUntil: null
  };
  await saveRateLimitData(ip, data);
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

async function createSession(ip, userAgent) {
  const token = generateSecureToken();
  const signature = signToken(token);
  const now = Date.now();
  const expiresAt = now + CONFIG.SESSION_DURATION;
  
  const sessionData = {
    token,
    signature,
    createdAt: now,
    expiresAt,
    ip,
    userAgent: userAgent || 'unknown',
    lastActivity: now
  };
  
  await saveSessionData(token, sessionData);
  
  return {
    token,
    signature,
    expiresAt
  };
}

async function validateSession(token, signature, ip) {
  if (!token || !signature) {
    return { valid: false, reason: 'missing_credentials' };
  }
  
  // Verify signature first (prevent timing attacks)
  try {
    if (!verifyTokenSignature(token, signature)) {
      return { valid: false, reason: 'invalid_signature' };
    }
  } catch (error) {
    return { valid: false, reason: 'invalid_signature' };
  }
  
  // Get session data
  const sessionData = await getSessionData(token);
  if (!sessionData) {
    return { valid: false, reason: 'session_not_found' };
  }
  
  // Check expiration
  if (Date.now() > sessionData.expiresAt) {
    await deleteSession(token);
    return { valid: false, reason: 'session_expired' };
  }
  
  // Optional: Check IP match (comment out if users have dynamic IPs)
  // if (sessionData.ip !== ip) {
  //   await deleteSession(token);
  //   return { valid: false, reason: 'ip_mismatch' };
  // }
  
  // Update last activity
  sessionData.lastActivity = Date.now();
  await saveSessionData(token, sessionData);
  
  return { valid: true, session: sessionData };
}

async function invalidateSession(token) {
  await deleteSession(token);
}

// ============================================================================
// HTTP RESPONSE HELPERS
// ============================================================================

function createResponse(statusCode, body, additionalHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': 'true',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      ...additionalHeaders
    },
    body: JSON.stringify(body)
  };
}

function corsHeaders(origin) {
  if (isValidOrigin(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    };
  }
  return {};
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

exports.handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers = corsHeaders(origin);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {}, headers);
  }
  
  // Validate environment variables
  try {
    validateEnvironment();
  } catch (error) {
    console.error('[Auth] Environment validation failed:', error.message);
    return createResponse(500, {
      error: 'Server configuration error',
      message: 'Authentication service is not properly configured'
    }, headers);
  }
  
  const clientIP = getClientIP(event);
  const userAgent = event.headers['user-agent'] || '';
  
  try {
    // ========================================================================
    // POST /dashboard-auth - LOGIN
    // ========================================================================
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { password } = body;
      
      // Validate input
      if (!password || typeof password !== 'string') {
        return createResponse(400, {
          error: 'Bad request',
          message: 'Password is required'
        }, headers);
      }
      
      // Check rate limit
      const rateCheck = await checkRateLimit(clientIP);
      if (!rateCheck.allowed) {
        console.warn(`[Auth] Rate limit exceeded for IP: ${clientIP}`);
        return createResponse(429, {
          error: rateCheck.reason,
          message: rateCheck.message,
          retryAfter: rateCheck.retryAfter
        }, {
          ...headers,
          'Retry-After': rateCheck.retryAfter.toString()
        });
      }
      
      // Hash provided password
      const inputHash = hashPassword(password);
      
      // Compare with stored hash (timing-safe)
      const correctHash = process.env.ADMIN_PASSWORD_HASH;
      const passwordMatches = crypto.timingSafeEqual(
        Buffer.from(inputHash),
        Buffer.from(correctHash)
      );
      
      if (!passwordMatches) {
        // Record failed attempt
        const attempts = await recordFailedAttempt(clientIP);
        const remaining = CONFIG.MAX_ATTEMPTS - attempts;
        
        console.warn(`[Auth] Failed login attempt from ${clientIP} (${attempts}/${CONFIG.MAX_ATTEMPTS})`);
        
        return createResponse(401, {
          error: 'Invalid credentials',
          message: 'Invalid password',
          remainingAttempts: Math.max(0, remaining)
        }, headers);
      }
      
      // Password correct - create session
      const session = await createSession(clientIP, userAgent);
      
      // Clear rate limit on successful login
      await clearRateLimit(clientIP);
      
      console.log(`[Auth] ✅ Successful login from ${clientIP}`);
      
      return createResponse(200, {
        success: true,
        token: session.token,
        signature: session.signature,
        expiresAt: session.expiresAt,
        expiresIn: CONFIG.SESSION_DURATION
      }, headers);
    }
    
    // ========================================================================
    // GET /dashboard-auth?action=validate - VALIDATE SESSION
    // ========================================================================
    if (event.httpMethod === 'GET') {
      const action = event.queryStringParameters?.action;
      
      if (action === 'validate') {
        const token = event.headers.authorization?.replace('Bearer ', '') || 
                     event.queryStringParameters?.token;
        const signature = event.headers['x-signature'] || 
                         event.queryStringParameters?.signature;
        
        const validation = await validateSession(token, signature, clientIP);
        
        if (!validation.valid) {
          return createResponse(401, {
            error: 'Invalid session',
            reason: validation.reason
          }, headers);
        }
        
        return createResponse(200, {
          valid: true,
          expiresAt: validation.session.expiresAt,
          expiresIn: validation.session.expiresAt - Date.now()
        }, headers);
      }
      
      if (action === 'logout') {
        const token = event.headers.authorization?.replace('Bearer ', '') || 
                     event.queryStringParameters?.token;
        
        if (token) {
          await invalidateSession(token);
          console.log(`[Auth] Session invalidated for IP: ${clientIP}`);
        }
        
        return createResponse(200, {
          success: true,
          message: 'Logged out successfully'
        }, headers);
      }
      
      return createResponse(400, {
        error: 'Bad request',
        message: 'Invalid action. Supported: validate, logout'
      }, headers);
    }
    
    // Unsupported method
    return createResponse(405, {
      error: 'Method not allowed',
      message: 'Only POST, GET, and OPTIONS methods are supported'
    }, headers);
    
  } catch (error) {
    console.error('[Auth] Handler error:', error);
    return createResponse(500, {
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, headers);
  }
};
