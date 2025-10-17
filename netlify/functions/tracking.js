// Custom Analytics Tracking API
// Stores visitor data in simple JSON format

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Path to store tracking data
const DATA_FILE = path.join('/tmp', 'tracking-data.json');

// Friendly search engine bots we want to allow and track separately
const FRIENDLY_CRAWLERS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /slurp/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
  /twitterbot/i,
  /slackbot/i,
  /discordbot/i
];

// Aggressive or known bad bots/spiders to block from analytics
const MALICIOUS_BOTS = [
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /crawler4j/i,
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /httpclient/i,
  /okhttp/i,
  /curl\//i,
  /wget/i,
  /libwww/i,
  /headless/i,
  /phantomjs/i,
  /selenium/i,
  /webdriver/i,
  /chrome-lighthouse/i
];

const MAX_LOG_LENGTHS = {
  pageViews: 5000,
  sessions: 1000,
  events: 2000,
  crawlerLogs: 500,
  botHits: 500
};

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function pushWithLimit(list, item, limit) {
  list.push(item);
  if (list.length > limit) {
    list.shift();
  }
}

function ensureDailyStats(data, dateKey) {
  const day = data.dailyStats[dateKey] || {};

  const normalized = {
    pageViews: day.pageViews || 0,
    uniqueVisitors: ensureArray(day.uniqueVisitors),
    bots: day.bots || 0,
    crawlers: day.crawlers || 0,
    sessions: day.sessions || 0,
    bounces: day.bounces || 0,
    events: ensureArray(day.events)
  };

  data.dailyStats[dateKey] = normalized;
  return normalized;
}

function formatDailyStats(dateKey, day = {}) {
  return {
    date: dateKey,
    pageViews: day.pageViews || 0,
    uniqueVisitors: Array.isArray(day.uniqueVisitors) ? day.uniqueVisitors.length : day.uniqueVisitors || 0,
    bots: day.bots || 0,
    crawlers: day.crawlers || 0,
    sessions: day.sessions || 0,
    bounces: day.bounces || 0,
    events: ensureArray(day.events)
  };
}

// Initialize data structure
async function initData() {
  try {
    await fs.access(DATA_FILE);
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);

    parsed.pageViews = ensureArray(parsed.pageViews);
    parsed.sessions = ensureArray(parsed.sessions);
    parsed.events = ensureArray(parsed.events);
    parsed.crawlerLogs = ensureArray(parsed.crawlerLogs);
    parsed.botHits = ensureArray(parsed.botHits);
    parsed.visitors = parsed.visitors || {};
    parsed.dailyStats = parsed.dailyStats || {};

    Object.keys(parsed.dailyStats).forEach(dateKey => {
      ensureDailyStats(parsed, dateKey);
    });

    return parsed;
  } catch {
    return {
      pageViews: [],
      sessions: [],
      events: [],
      crawlerLogs: [],
      botHits: [],
      visitors: {},
      dailyStats: {}
    };
  }
}

// Save data
async function saveData(data) {
  Object.keys(data.dailyStats).forEach(dateKey => {
    const day = data.dailyStats[dateKey];
    if (!Array.isArray(day.uniqueVisitors)) {
      day.uniqueVisitors = ensureArray(day.uniqueVisitors);
    }
    if (!Array.isArray(day.events)) {
      day.events = ensureArray(day.events);
    }
  });

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

function classifyAgent(userAgent = '') {
  const ua = userAgent.toLowerCase();

  if (!ua || ua === 'unknown') {
    return 'malicious';
  }

  if (FRIENDLY_CRAWLERS.some(pattern => pattern.test(ua))) {
    return 'crawler';
  }

  if (MALICIOUS_BOTS.some(pattern => pattern.test(ua))) {
    return 'malicious';
  }

  // Heuristics for suspicious agents
  if (/bot|crawler|spider|scraper|httpclient|python|java|node|fetch|dataminr/.test(ua)) {
    return 'malicious';
  }

  return 'human';
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
    const todayStats = ensureDailyStats(data, today);
    const clientIP = getClientIP(event);
    const visitorId = hashIP(clientIP);
    const userAgent = event.headers['user-agent'] || '';
    const agentType = classifyAgent(userAgent);

    // GET: Retrieve analytics data
    if (event.httpMethod === 'GET') {
      const action = event.queryStringParameters?.action;

      if (action === 'stats') {
        // Calculate statistics for dashboard
        const last7Days = Object.keys(data.dailyStats)
          .sort()
          .slice(-7);

        const stats = {
          today: formatDailyStats(today, data.dailyStats[today]),
          last7Days: last7Days.map(date => formatDailyStats(date, data.dailyStats[date])),
          totalVisitors: Object.keys(data.visitors).length,
          recentPageViews: data.pageViews.slice(-100),
          recentEvents: data.events.slice(-50),
          recentSessions: data.sessions.slice(-100),
          recentCrawlers: data.crawlerLogs.slice(-100),
          recentBotHits: data.botHits.slice(-100)
        };

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
      const timestamp = new Date().toISOString();

      if (agentType === 'crawler') {
        todayStats.crawlers++;
        pushWithLimit(data.crawlerLogs, {
          timestamp,
          page,
          referrer,
          userAgent,
          visitorId
        }, MAX_LOG_LENGTHS.crawlerLogs);

        await saveData(data);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ tracked: false, reason: 'crawler' })
        };
      }

      if (agentType === 'malicious') {
        todayStats.bots++;
        pushWithLimit(data.botHits, {
          timestamp,
          page,
          referrer,
          userAgent,
          visitorId
        }, MAX_LOG_LENGTHS.botHits);

        await saveData(data);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ tracked: false, reason: 'bot' })
        };
      }

      // Track page view
      if (type === 'pageview') {
        pushWithLimit(data.pageViews, {
          timestamp,
          visitorId,
          page,
          referrer,
          sessionId
        }, MAX_LOG_LENGTHS.pageViews);

        todayStats.pageViews++;
        
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
        
        const uniqueSet = new Set(ensureArray(todayStats.uniqueVisitors));
        uniqueSet.add(visitorId);
        todayStats.uniqueVisitors = Array.from(uniqueSet);
      }

      // Track session end
      if (type === 'session') {
        pushWithLimit(data.sessions, {
          timestamp,
          visitorId,
          sessionId,
          duration,
          pages: body.pages || 1
        }, MAX_LOG_LENGTHS.sessions);

        todayStats.sessions++;
        
        // Count as bounce if only 1 page and < 30 seconds
        if (body.pages === 1 && duration < 30000) {
          todayStats.bounces++;
        }
      }

      // Track custom event
      if (type === 'event') {
        pushWithLimit(data.events, {
          timestamp,
          visitorId,
          eventName: body.eventName,
          eventData: body.eventData
        }, MAX_LOG_LENGTHS.events);

        pushWithLimit(todayStats.events, {
          name: body.eventName,
          timestamp
        }, MAX_LOG_LENGTHS.events);
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
