// Netlify Function to proxy Reddit API requests
// This bypasses CORS restrictions by fetching server-side

exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get parameters from query string
  const subreddit = event.queryStringParameters?.subreddit || 'tressless';
  const timeframe = event.queryStringParameters?.timeframe || 'all';
  const limit = event.queryStringParameters?.limit || '15';

  // Build Reddit API URL - using old.reddit.com which is more lenient
  const redditUrl = `https://old.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`;

  console.log('[Reddit Proxy] Fetching:', redditUrl);

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
        body: JSON.stringify({ 
          error: `Reddit API error: ${response.status} ${response.statusText}` 
        })
      };
    }

    const data = await response.json();
    console.log('[Reddit Proxy] Successfully fetched', data.data?.children?.length || 0, 'posts');

    // Return successful response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow from any origin
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
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
