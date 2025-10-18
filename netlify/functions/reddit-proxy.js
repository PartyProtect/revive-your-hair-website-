// Netlify Function to proxy Reddit API requests// Netlify Function to proxy Reddit API requests

// WITH RATE LIMITING to prevent abuse// This bypasses CORS restrictions by fetching server-side



// Rate limiting storage (in-memory, resets on function cold start)exports.handler = async function(event, context) {

const rateLimit = new Map();  // Only allow GET requests

const MAX_REQUESTS = 10; // per IP  if (event.httpMethod !== 'GET') {

const WINDOW_MS = 60000; // 1 minute    return {

      statusCode: 405,

// Cleanup old rate limit entries every 5 minutes      body: JSON.stringify({ error: 'Method not allowed' })

setInterval(() => {    };

  const now = Date.now();  }

  for (const [ip, data] of rateLimit.entries()) {

    if (now > data.resetTime) {  // Get parameters from query string

      rateLimit.delete(ip);  const subreddit = event.queryStringParameters?.subreddit || 'tressless';

    }  const timeframe = event.queryStringParameters?.timeframe || 'all';

  }  const limit = event.queryStringParameters?.limit || '15';

}, 5 * 60 * 1000);

  // Build Reddit API URL - using old.reddit.com which is more lenient

exports.handler = async function(event, context) {  const redditUrl = `https://old.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`;

  // Only allow GET requests

  if (event.httpMethod !== 'GET') {  console.log('[Reddit Proxy] Fetching:', redditUrl);

    return {

      statusCode: 405,  try {

      body: JSON.stringify({ error: 'Method not allowed' })    // Fetch from Reddit (server-side, no CORS restrictions)

    };    // Using browser-like headers to avoid being blocked

  }    const response = await fetch(redditUrl, {

      headers: {

  // Get client IP for rate limiting        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  const clientIP = event.headers['x-forwarded-for']?.split(',')[0].trim() ||         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',

                   event.headers['client-ip'] ||         'Accept-Language': 'en-US,en;q=0.5',

                   'unknown';        'Accept-Encoding': 'gzip, deflate, br',

        'DNT': '1',

  // Rate limiting check        'Connection': 'keep-alive',

  const now = Date.now();        'Upgrade-Insecure-Requests': '1'

        }

  if (!rateLimit.has(clientIP)) {    });

    rateLimit.set(clientIP, { count: 0, resetTime: now + WINDOW_MS });

  }    if (!response.ok) {

        console.error('[Reddit Proxy] Reddit API error:', response.status, response.statusText);

  const limiter = rateLimit.get(clientIP);      return {

          statusCode: response.status,

  if (now > limiter.resetTime) {        body: JSON.stringify({ 

    limiter.count = 0;          error: `Reddit API error: ${response.status} ${response.statusText}` 

    limiter.resetTime = now + WINDOW_MS;        })

  }      };

      }

  limiter.count++;

      const data = await response.json();

  if (limiter.count > MAX_REQUESTS) {    console.log('[Reddit Proxy] Successfully fetched', data.data?.children?.length || 0, 'posts');

    console.warn('[Reddit Proxy] Rate limit exceeded:', clientIP);

    return {    // Return successful response with CORS headers

      statusCode: 429,    return {

      headers: {      statusCode: 200,

        'Content-Type': 'application/json',      headers: {

        'Access-Control-Allow-Origin': '*',        'Content-Type': 'application/json',

        'Retry-After': Math.ceil((limiter.resetTime - now) / 1000).toString()        'Access-Control-Allow-Origin': '*', // Allow from any origin

      },        'Access-Control-Allow-Headers': 'Content-Type',

      body: JSON.stringify({         'Cache-Control': 'public, max-age=300' // Cache for 5 minutes

        error: 'Rate limit exceeded',      },

        message: `Maximum ${MAX_REQUESTS} requests per minute`,      body: JSON.stringify(data)

        retryAfter: Math.ceil((limiter.resetTime - now) / 1000)    };

      })

    };  } catch (error) {

  }    console.error('[Reddit Proxy] Fetch error:', error);

    return {

  // Get parameters from query string      statusCode: 500,

  const subreddit = event.queryStringParameters?.subreddit || 'tressless';      headers: {

  const timeframe = event.queryStringParameters?.timeframe || 'all';        'Content-Type': 'application/json',

  const limit = event.queryStringParameters?.limit || '15';        'Access-Control-Allow-Origin': '*'

      },

  // Validate subreddit name (prevent injection)      body: JSON.stringify({ 

  if (!/^[a-zA-Z0-9_]+$/.test(subreddit)) {        error: 'Failed to fetch from Reddit',

    return {        details: error.message 

      statusCode: 400,      })

      headers: {    };

        'Content-Type': 'application/json',  }

        'Access-Control-Allow-Origin': '*'};

      },
      body: JSON.stringify({ error: 'Invalid subreddit name' })
    };
  }

  // Build Reddit API URL
  const redditUrl = `https://old.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`;

  console.log('[Reddit Proxy] Fetching:', redditUrl, '| IP:', clientIP, '| Count:', limiter.count);

  try {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300',
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
