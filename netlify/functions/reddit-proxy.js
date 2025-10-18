// ============================================================================
// REDDIT API PROXY - WITH USAGE TRACKING
// ============================================================================
// 
// Purpose: Proxy Reddit API requests to bypass CORS restrictions
// Security: Rate limiting to prevent abuse
// Tracking: Monitors function usage for Netlify cost management
//
// ============================================================================

const { getStore } = require('@netlify/blobs');

// Rate limiting storage (in-memory, resets on function cold start)
const rateLimit = new Map();
const MAX_REQUESTS = 10; // per IP
const WINDOW_MS = 60000; // 1 minute

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now > data.resetTime) {
      rateLimit.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Increment Reddit proxy usage counter
 * Tracks function invocations for cost monitoring in admin dashboard
 */
async function incrementProxyUsage() {
  try {
    const store = getStore('analytics');
    const data = await store.get('tracking-data', { type: 'json' }) || {};
    
    // Initialize function usage tracking if not exists
    if (!data.functionUsage) {
      data.functionUsage = {
        redditProxy: 0,
        lastReset: new Date().toISOString()
      };
    }
    
    // Increment counter
    data.functionUsage.redditProxy++;
    
    // Save back to storage
    await store.set('tracking-data', JSON.stringify(data));
    
    console.log('[Reddit Proxy] Usage count:', data.functionUsage.redditProxy);
  } catch (error) {
    // Don't fail the request if tracking fails
    console.error('[Reddit Proxy] Failed to track usage:', error);
  }
}

/**
 * Main handler
 */
exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get client IP for rate limiting
  const clientIP = event.headers['x-forwarded-for']?.split(',')[0].trim() ||
                   event.headers['client-ip'] ||
                   'unknown';

  // Rate limiting check
  const now = Date.now();

  if (!rateLimit.has(clientIP)) {
    rateLimit.set(clientIP, { count: 0, resetTime: now + WINDOW_MS });
  }

  const limiter = rateLimit.get(clientIP);

  if (now > limiter.resetTime) {
    limiter.count = 0;
    limiter.resetTime = now + WINDOW_MS;
  }

  limiter.count++;

  if (limiter.count > MAX_REQUESTS) {
    console.warn('[Reddit Proxy] Rate limit exceeded:', clientIP);
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Retry-After': Math.ceil((limiter.resetTime - now) / 1000).toString()
      },
      body: JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS} requests per minute`,
        retryAfter: Math.ceil((limiter.resetTime - now) / 1000)
      })
    };
  }

  // Get parameters from query string
  const subreddit = event.queryStringParameters?.subreddit || 'tressless';
  const timeframe = event.queryStringParameters?.timeframe || 'all';
  const limit = event.queryStringParameters?.limit || '15';

  // Validate subreddit name (prevent injection)
  if (!/^[a-zA-Z0-9_]+$/.test(subreddit)) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid subreddit name' })
    };
  }

  // Build Reddit API URL - using old.reddit.com which is more lenient
  const redditUrl = `https://old.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`;

  console.log('[Reddit Proxy] Fetching:', redditUrl, '| IP:', clientIP, '| Count:', limiter.count);

  try {
    // Fetch from Reddit (server-side, no CORS restrictions)
    // Using browser-like headers to avoid being blocked
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      console.error('[Reddit Proxy] Reddit API error:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: `Reddit API error: ${response.status} ${response.statusText}` 
        })
      };
    }

    const data = await response.json();
    console.log('[Reddit Proxy] Successfully fetched', data.data?.children?.length || 0, 'posts');

    // ✅ TRACK USAGE - Increment counter for monitoring
    await incrementProxyUsage();

    // Return successful response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow from any origin
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': (MAX_REQUESTS - limiter.count).toString(),
        'X-RateLimit-Reset': limiter.resetTime.toString()
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('[Reddit Proxy] Fetch error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch from Reddit',
        details: error.message 
      })
    };
  }
};
