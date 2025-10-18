// Custom Analytics Tracking API - SECURED VERSION
// Stores visitor data with authentication for stats retrieval

const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

// API key for stats access (set in Netlify environment variables)
const STATS_API_KEY = process.env.ANALYTICS_API_KEY || 'change-me-in-production';

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

function incrementCounter(counter, key, amount = 1) {
  if (!key) {
    key = 'unknown';
  }
  counter[key] = (counter[key] || 0) + amount;
}

function parseReferrer(referrer = '') {
  if (!referrer || referrer === 'direct') {
    return 'Direct';
  }

  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, '');
    return host;
  } catch (error) {
    return referrer.substring(0, 64) || 'Unknown';
  }
}

function getDeviceType(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|android|blackberry|phone|opera mini/.test(ua)) {
    return 'Mobile';
  }
  if (/tablet|ipad/.test(ua)) {
    return 'Tablet';
  }
  if (/smart-tv|hbbtv|appletv/.test(ua)) {
    return 'TV';
  }
  return 'Desktop';
}

function getUtmLabel(utm = {}) {
  if (!utm || typeof utm !== 'object') {
    return null;
  }

  const campaign = utm.campaign || utm.utm_campaign;
  const source = utm.source || utm.utm_source;
  const medium = utm.medium || utm.utm_medium;

  if (campaign || source || medium) {
    const parts = [];
    if (campaign) {
      parts.push(campaign);
    }
    if (source) {
      parts.push(`src:${source}`);
    }
    if (medium) {
      parts.push(`med:${medium}`);
    }
    return parts.join(' | ');
  }

  return null;
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
      events: ensureArray(day.events),
      newVisitors: day.newVisitors || 0,
      returningVisitors: day.returningVisitors || 0,
      pageViewsByPath: day.pageViewsByPath || {},
      referrers: day.referrers || {},
      devices: day.devices || {},
      utmCampaigns: day.utmCampaigns || {},
      languages: day.languages || {},
      timezones: day.timezones || {},
      conversions: {
        forms: day.conversions?.forms || 0,
        ctaClicks: day.conversions?.ctaClicks || 0
      },
      scrollDepth: {
        total: day.scrollDepth?.total || 0,
        count: day.scrollDepth?.count || 0,
        max: day.scrollDepth?.max || 0
      },
      loadTimes: {
        total: day.loadTimes?.total || 0,
        count: day.loadTimes?.count || 0
      },
      sessionDurations: {
        total: day.sessionDurations?.total || 0,
        count: day.sessionDurations?.count || 0
      }
  };

  data.dailyStats[dateKey] = normalized;
  return normalized;
}

function formatDailyStats(dateKey, day = {}) {
  const toSortedEntries = (counter = {}, limit = 10) => {
    return Object.entries(counter || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label, value]) => ({ label, value }));
  };

  const avgScroll = day.scrollDepth?.count
    ? Math.round(day.scrollDepth.total / day.scrollDepth.count)
    : 0;

  const avgLoad = day.loadTimes?.count
    ? Math.round(day.loadTimes.total / day.loadTimes.count)
    : 0;

  const avgSession = day.sessionDurations?.count
    ? Math.round(day.sessionDurations.total / day.sessionDurations.count)
    : 0;

  return {
    date: dateKey,
    pageViews: day.pageViews || 0,
    uniqueVisitors: Array.isArray(day.uniqueVisitors) ? day.uniqueVisitors.length : day.uniqueVisitors || 0,
    bots: day.bots || 0,
    crawlers: day.crawlers || 0,
    sessions: day.sessions || 0,
    bounces: day.bounces || 0,
    events: ensureArray(day.events),
    newVisitors: day.newVisitors || 0,
    returningVisitors: day.returningVisitors || 0,
    conversions: {
      forms: day.conversions?.forms || 0,
      ctaClicks: day.conversions?.ctaClicks || 0
    },
    pageBreakdown: toSortedEntries(day.pageViewsByPath, 8),
    referrers: toSortedEntries(day.referrers, 8),
    devices: toSortedEntries(day.devices, 5),
    utmCampaigns: toSortedEntries(day.utmCampaigns, 8),
    languages: toSortedEntries(day.languages, 8),
    timezones: toSortedEntries(day.timezones, 6),
    scrollDepth: {
      average: avgScroll,
      max: day.scrollDepth?.max || 0,
      count: day.scrollDepth?.count || 0
    },
    loadTimes: {
      average: avgLoad,
      count: day.loadTimes?.count || 0
    },
    sessionDuration: {
      average: avgSession,
      count: day.sessionDurations?.count || 0
    }
  };
}

// Initialize data structure
async function initData() {
  try {
    const store = getStore('analytics');
    const data = await store.get('tracking-data', { type: 'json' });
    
    if (data) {
      data.pageViews = ensureArray(data.pageViews);
      data.sessions = ensureArray(data.sessions);
      data.events = ensureArray(data.events);
      data.crawlerLogs = ensureArray(data.crawlerLogs);
      data.botHits = ensureArray(data.botHits);
      data.visitors = data.visitors || {};
      data.dailyStats = data.dailyStats || {};

      Object.keys(data.dailyStats).forEach(dateKey => {
        ensureDailyStats(data, dateKey);
      });

      return data;
    }
  } catch (error) {
    console.log('[Analytics] Initializing new data store');
  }
  
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
    day.pageViewsByPath = day.pageViewsByPath || {};
    day.referrers = day.referrers || {};
    day.devices = day.devices || {};
    day.utmCampaigns = day.utmCampaigns || {};
    day.languages = day.languages || {};
    day.timezones = day.timezones || {};
    day.conversions = {
      forms: day.conversions?.forms || 0,
      ctaClicks: day.conversions?.ctaClicks || 0
    };
    day.scrollDepth = {
      total: day.scrollDepth?.total || 0,
      count: day.scrollDepth?.count || 0,
      max: day.scrollDepth?.max || 0
    };
    day.loadTimes = {
      total: day.loadTimes?.total || 0,
      count: day.loadTimes?.count || 0
    };
    day.sessionDurations = {
      total: day.sessionDurations?.total || 0,
      count: day.sessionDurations?.count || 0
    };
  });

  const store = getStore('analytics');
  await store.set('tracking-data', JSON.stringify(data));
  console.log('[Analytics] Data saved to Netlify Blobs');
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

    // GET: Retrieve analytics data (REQUIRES AUTHENTICATION)
    if (event.httpMethod === 'GET') {
      const action = event.queryStringParameters?.action;
      const apiKey = event.headers['x-api-key'] || event.queryStringParameters?.apiKey;

      // SECURITY: Require API key for stats access
      if (action === 'stats') {
        if (!apiKey || apiKey !== STATS_API_KEY) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              error: 'Unauthorized',
              message: 'Valid API key required to access analytics data'
            })
          };
        }

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

    // POST: Log tracking event (NO AUTH REQUIRED - public endpoint)
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { type, page, referrer, duration, sessionId, utm, language, timezone } = body;
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
            pageViews: 0,
            sessions: 0
          };
        }
        const visitorRecord = data.visitors[visitorId];
        const wasFirstVisit = visitorRecord.pageViews === 0;
        visitorRecord.lastSeen = timestamp;
        visitorRecord.pageViews++;

        const uniqueSet = new Set(ensureArray(todayStats.uniqueVisitors));
        const alreadyCountedToday = uniqueSet.has(visitorId);
        uniqueSet.add(visitorId);
        todayStats.uniqueVisitors = Array.from(uniqueSet);

        if (!alreadyCountedToday) {
          if (wasFirstVisit) {
            todayStats.newVisitors++;
          } else {
            todayStats.returningVisitors++;
          }
        }

        const pageKey = page || 'unknown';
        incrementCounter(todayStats.pageViewsByPath, pageKey);

        const refLabel = parseReferrer(referrer);
        incrementCounter(todayStats.referrers, refLabel);

        const deviceType = getDeviceType(userAgent);
        incrementCounter(todayStats.devices, deviceType);

        const utmLabel = getUtmLabel(utm);
        if (utmLabel) {
          incrementCounter(todayStats.utmCampaigns, utmLabel);
        }

        const languageKey = typeof language === 'string' && language.length > 0
          ? language.slice(0, 8).toLowerCase()
          : 'unknown';
        incrementCounter(todayStats.languages, languageKey);

        const timezoneKey = typeof timezone === 'string' && timezone.length > 0
          ? timezone.slice(0, 32)
          : 'Unknown';
        incrementCounter(todayStats.timezones, timezoneKey);
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

        if (!data.visitors[visitorId]) {
          data.visitors[visitorId] = {
            firstSeen: timestamp,
            lastSeen: timestamp,
            pageViews: 0,
            sessions: 0
          };
        }

  data.visitors[visitorId].sessions = (data.visitors[visitorId].sessions || 0) + 1;
  todayStats.sessionDurations.total += duration || 0;
  todayStats.sessionDurations.count += 1;
        
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

        if (body.eventName === 'form_submit') {
          todayStats.conversions.forms += 1;
        }

        if (body.eventName === 'cta_click') {
          todayStats.conversions.ctaClicks += 1;
        }

        if (body.eventName === 'scroll_depth') {
          const percent = Number(body.eventData?.percent) || 0;
          todayStats.scrollDepth.total += percent;
          todayStats.scrollDepth.count += 1;
          if (percent > todayStats.scrollDepth.max) {
            todayStats.scrollDepth.max = percent;
          }
        }

        if (body.eventName === 'page_load') {
          const loadTime = Number(body.eventData?.fullLoad) || 0;
          if (loadTime > 0) {
            todayStats.loadTimes.total += loadTime;
            todayStats.loadTimes.count += 1;
          }
        }
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
