// Custom Analytics Tracking API
// Stores visitor data in simple JSON format

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Path to store tracking data
const DATA_FILE = path.join('/tmp', 'tracking-data.json');

// Initialize data structure
async function initData() {
  try {
    await fs.access(DATA_FILE);
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      pageViews: [],
      sessions: [],
      events: [],
      visitors: {},
      dailyStats: {}
    };
  }
}

// Save data
async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Hash IP for privacy (GDPR-compliant)
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'salt-key-2025').digest('hex').substring(0, 16);
}

// Get client IP
function getClientIP(event) {
  return event.headers['x-forwarded-for']?.split(',')[0].trim() || 
         event.headers['client-ip'] || 
         'unknown';
}

// Get today's date key
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// Check if user agent is a bot
function isBot(userAgent) {
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /headless/i, /phantomjs/i,
    /selenium/i, /webdriver/i, /chrome-lighthouse/i, /googlebot/i,
    /bingbot/i, /ahref/i, /semrush/i, /mj12bot/i, /dotbot/i
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
}

// Main handler
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = await initData();
    const today = getTodayKey();
    const clientIP = getClientIP(event);
    const visitorId = hashIP(clientIP);
    const userAgent = event.headers['user-agent'] || '';
    const botDetected = isBot(userAgent);

    // Initialize daily stats if not exists
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = {
        pageViews: 0,
        uniqueVisitors: new Set(),
        bots: 0,
        sessions: 0,
        bounces: 0,
        events: []
      };
    }

    // GET: Retrieve analytics data
    if (event.httpMethod === 'GET') {
      const action = event.queryStringParameters?.action;

      if (action === 'stats') {
        // Calculate statistics for dashboard
        const last7Days = Object.keys(data.dailyStats)
          .sort()
          .slice(-7);

        const stats = {
          today: data.dailyStats[today] || {},
          last7Days: last7Days.map(date => ({
            date,
            ...data.dailyStats[date],
            uniqueVisitors: data.dailyStats[date].uniqueVisitors?.size || 0
          })),
          totalVisitors: Object.keys(data.visitors).length,
          recentPageViews: data.pageViews.slice(-100),
          recentEvents: data.events.slice(-50)
        };

        // Convert Sets to arrays for JSON
        if (stats.today.uniqueVisitors) {
          stats.today.uniqueVisitors = stats.today.uniqueVisitors.size;
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }

    // POST: Log tracking event
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { type, page, referrer, duration, sessionId } = body;

      // Skip if bot
      if (botDetected) {
        data.dailyStats[today].bots++;
        await saveData(data);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ tracked: false, reason: 'bot' })
        };
      }

      const timestamp = new Date().toISOString();

      // Track page view
      if (type === 'pageview') {
        data.pageViews.push({
          timestamp,
          visitorId,
          page,
          referrer,
          sessionId
        });

        data.dailyStats[today].pageViews++;
        
        // Track unique visitor
        if (!data.visitors[visitorId]) {
          data.visitors[visitorId] = {
            firstSeen: timestamp,
            lastSeen: timestamp,
            pageViews: 0
          };
        }
        data.visitors[visitorId].lastSeen = timestamp;
        data.visitors[visitorId].pageViews++;
        
        if (!data.dailyStats[today].uniqueVisitors) {
          data.dailyStats[today].uniqueVisitors = new Set();
        }
        data.dailyStats[today].uniqueVisitors.add(visitorId);
      }

      // Track session end
      if (type === 'session') {
        data.sessions.push({
          timestamp,
          visitorId,
          sessionId,
          duration,
          pages: body.pages || 1
        });

        data.dailyStats[today].sessions++;
        
        // Count as bounce if only 1 page and < 30 seconds
        if (body.pages === 1 && duration < 30000) {
          data.dailyStats[today].bounces++;
        }
      }

      // Track custom event
      if (type === 'event') {
        data.events.push({
          timestamp,
          visitorId,
          eventName: body.eventName,
          eventData: body.eventData
        });

        data.dailyStats[today].events.push({
          name: body.eventName,
          timestamp
        });
      }

      // Save data
      await saveData(data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ tracked: true, visitorId })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Tracking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
