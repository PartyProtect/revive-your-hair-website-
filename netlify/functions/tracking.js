// ============================================================================// Custom Analytics Tracking API - SECURED VERSION

// SECURE CUSTOM ANALYTICS TRACKING API// Stores visitor data with authentication for stats retrieval

// ============================================================================

// const { getStore } = require('@netlify/blobs');

// Security Features:const crypto = require('crypto');

// ✅ No hardcoded API keys or salts

// ✅ API key authentication for stats retrieval// API key for stats access (set in Netlify environment variables)

// ✅ IP anonymization with environment-based saltconst STATS_API_KEY = process.env.ANALYTICS_API_KEY || 'change-me-in-production';

// ✅ Comprehensive bot detection (aligned with client-side)

// ✅ Data validation before storage// Friendly search engine bots we want to allow and track separately

// ✅ Automatic data cleanup (90-day GDPR retention)const FRIENDLY_CRAWLERS = [

// ✅ Rate limiting on stats endpoint  /googlebot/i,

// ✅ CORS protection  /bingbot/i,

//  /duckduckbot/i,

// Required Environment Variables:  /baiduspider/i,

// - ANALYTICS_API_KEY: Random 32+ character string for API authentication  /yandexbot/i,

// - IP_HASH_SALT: Random salt for IP hashing (32+ characters)  /sogou/i,

//  /slurp/i,

// How to generate these:  /facebookexternalhit/i,

// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  /linkedinbot/i,

// ============================================================================  /twitterbot/i,

  /slackbot/i,

const { getStore } = require('@netlify/blobs');  /discordbot/i

const crypto = require('crypto');];



// ============================================================================// Aggressive or known bad bots/spiders to block from analytics

// CONFIGURATIONconst MALICIOUS_BOTS = [

// ============================================================================  /ahrefsbot/i,

  /semrushbot/i,

const CONFIG = {  /mj12bot/i,

  // Data retention (GDPR compliance)  /dotbot/i,

  RETENTION_DAYS: 90,  /crawler4j/i,

  RETENTION_MS: 90 * 24 * 60 * 60 * 1000,  /python-requests/i,

    /python-urllib/i,

  // Storage limits (prevent unbounded growth)  /scrapy/i,

  MAX_LOG_LENGTHS: {  /httpclient/i,

    pageViews: 5000,  /okhttp/i,

    sessions: 1000,  /curl\//i,

    events: 2000,  /wget/i,

    crawlerLogs: 500,  /libwww/i,

    botHits: 500  /headless/i,

  },  /phantomjs/i,

    /selenium/i,

  // Rate limiting for stats endpoint  /webdriver/i,

  STATS_RATE_LIMIT: {  /chrome-lighthouse/i

    MAX_REQUESTS: 60,        // Max requests per window];

    WINDOW_MS: 60 * 1000     // 1 minute window

  },const MAX_LOG_LENGTHS = {

    pageViews: 5000,

  // CORS allowed origins  sessions: 1000,

  ALLOWED_ORIGINS: [  events: 2000,

    'https://www.reviveyourhair.eu',  crawlerLogs: 500,

    'https://reviveyourhair.eu',  botHits: 500

    'http://localhost:8000',};

    'http://localhost:8888'

  ]function ensureArray(value) {

};  return Array.isArray(value) ? value : [];

}

// ============================================================================

// BOT DETECTION - ALIGNED WITH CLIENT-SIDEfunction pushWithLimit(list, item, limit) {

// ============================================================================  list.push(item);

  if (list.length > limit) {

// Friendly search engine crawlers (track separately for SEO insights)    list.shift();

const FRIENDLY_CRAWLERS = [  }

  /googlebot/i,}

  /bingbot/i,

  /duckduckbot/i,function incrementCounter(counter, key, amount = 1) {

  /baiduspider/i,  if (!key) {

  /yandexbot/i,    key = 'unknown';

  /sogou/i,  }

  /slurp/i,              // Yahoo  counter[key] = (counter[key] || 0) + amount;

  /facebookexternalhit/i,}

  /linkedinbot/i,

  /twitterbot/i,function parseReferrer(referrer = '') {

  /slackbot/i,  if (!referrer || referrer === 'direct') {

  /discordbot/i,    return 'Direct';

  /whatsapp/i,  }

  /telegrambot/i

];  try {

    const url = new URL(referrer);

// Malicious bots and scrapers (block from analytics)    const host = url.hostname.replace(/^www\./, '');

const MALICIOUS_BOTS = [    return host;

  /ahrefsbot/i,  } catch (error) {

  /semrushbot/i,    return referrer.substring(0, 64) || 'Unknown';

  /mj12bot/i,  }

  /dotbot/i,}

  /crawler4j/i,

  /python-requests/i,function getDeviceType(userAgent = '') {

  /python-urllib/i,  const ua = userAgent.toLowerCase();

  /scrapy/i,  if (/mobile|iphone|android|blackberry|phone|opera mini/.test(ua)) {

  /httpclient/i,    return 'Mobile';

  /okhttp/i,  }

  /curl\//i,  if (/tablet|ipad/.test(ua)) {

  /wget/i,    return 'Tablet';

  /libwww/i,  }

  /headless/i,  if (/smart-tv|hbbtv|appletv/.test(ua)) {

  /phantomjs/i,    return 'TV';

  /selenium/i,  }

  /webdriver/i,  return 'Desktop';

  /chrome-lighthouse/i,}

  /gtmetrix/i,

  /screaming\s?frog/i,function getUtmLabel(utm = {}) {

  /bingpreview/i,  if (!utm || typeof utm !== 'object') {

  /petalbot/i,    return null;

  /serpstatbot/i,  }

  /zoominfobot/i,

  /dataforseobot/i  const campaign = utm.campaign || utm.utm_campaign;

];  const source = utm.source || utm.utm_source;

  const medium = utm.medium || utm.utm_medium;

/**

 * Classify user agent as 'human', 'crawler', or 'malicious'  if (campaign || source || medium) {

 * MUST match client-side logic in src/scripts/tracking.js    const parts = [];

 */    if (campaign) {

function classifyAgent(userAgent = '') {      parts.push(campaign);

  const ua = userAgent.toLowerCase();    }

      if (source) {

  if (!ua || ua === 'unknown') {      parts.push(`src:${source}`);

    return 'malicious';    }

  }    if (medium) {

        parts.push(`med:${medium}`);

  // Check friendly crawlers first (SEO bots)    }

  if (FRIENDLY_CRAWLERS.some(pattern => pattern.test(ua))) {    return parts.join(' | ');

    return 'crawler';  }

  }

    return null;

  // Check malicious patterns}

  if (MALICIOUS_BOTS.some(pattern => pattern.test(ua))) {

    return 'malicious';function ensureDailyStats(data, dateKey) {

  }  const day = data.dailyStats[dateKey] || {};

  

  // Heuristic checks for suspicious patterns  const normalized = {

  const suspiciousPatterns = [    pageViews: day.pageViews || 0,

    /bot/i, /crawl/i, /spider/i, /scraper/i,    uniqueVisitors: ensureArray(day.uniqueVisitors),

    /dataminr/i, /fetch/i, /monitor/i, /check/i    bots: day.bots || 0,

  ];    crawlers: day.crawlers || 0,

      sessions: day.sessions || 0,

  if (suspiciousPatterns.some(pattern => pattern.test(ua))) {    bounces: day.bounces || 0,

    return 'malicious';      events: ensureArray(day.events),

  }      newVisitors: day.newVisitors || 0,

        returningVisitors: day.returningVisitors || 0,

  return 'human';      pageViewsByPath: day.pageViewsByPath || {},

}      referrers: day.referrers || {},

      devices: day.devices || {},

// ============================================================================      utmCampaigns: day.utmCampaigns || {},

// ENVIRONMENT VALIDATION      languages: day.languages || {},

// ============================================================================      timezones: day.timezones || {},

      conversions: {

function validateEnvironment() {        forms: day.conversions?.forms || 0,

  const required = ['ANALYTICS_API_KEY', 'IP_HASH_SALT'];        ctaClicks: day.conversions?.ctaClicks || 0

  const missing = required.filter(key => !process.env[key]);      },

        scrollDepth: {

  if (missing.length > 0) {        total: day.scrollDepth?.total || 0,

    throw new Error(        count: day.scrollDepth?.count || 0,

      `Missing required environment variables: ${missing.join(', ')}\n` +        max: day.scrollDepth?.max || 0

      `Please set these in your Netlify dashboard under Site settings > Environment variables`      },

    );      loadTimes: {

  }        total: day.loadTimes?.total || 0,

          count: day.loadTimes?.count || 0

  if (process.env.ANALYTICS_API_KEY.length < 32) {      },

    throw new Error('ANALYTICS_API_KEY must be at least 32 characters');      sessionDurations: {

  }        total: day.sessionDurations?.total || 0,

          count: day.sessionDurations?.count || 0

  if (process.env.IP_HASH_SALT.length < 32) {      }

    throw new Error('IP_HASH_SALT must be at least 32 characters');  };

  }

}  data.dailyStats[dateKey] = normalized;

  return normalized;

// ============================================================================}

// UTILITY FUNCTIONS

// ============================================================================function formatDailyStats(dateKey, day = {}) {

  const toSortedEntries = (counter = {}, limit = 10) => {

/**    return Object.entries(counter || {})

 * Ensure value is an array      .sort((a, b) => b[1] - a[1])

 */      .slice(0, limit)

function ensureArray(value) {      .map(([label, value]) => ({ label, value }));

  return Array.isArray(value) ? value : [];  };

}

  const avgScroll = day.scrollDepth?.count

/**    ? Math.round(day.scrollDepth.total / day.scrollDepth.count)

 * Push item to array with length limit    : 0;

 */

function pushWithLimit(list, item, limit) {  const avgLoad = day.loadTimes?.count

  list.push(item);    ? Math.round(day.loadTimes.total / day.loadTimes.count)

  if (list.length > limit) {    : 0;

    list.shift(); // Remove oldest

  }  const avgSession = day.sessionDurations?.count

}    ? Math.round(day.sessionDurations.total / day.sessionDurations.count)

    : 0;

/**

 * Increment counter safely  return {

 */    date: dateKey,

function incrementCounter(counter, key, amount = 1) {    pageViews: day.pageViews || 0,

  if (!key) {    uniqueVisitors: Array.isArray(day.uniqueVisitors) ? day.uniqueVisitors.length : day.uniqueVisitors || 0,

    key = 'unknown';    bots: day.bots || 0,

  }    crawlers: day.crawlers || 0,

  counter[key] = (counter[key] || 0) + amount;    sessions: day.sessions || 0,

}    bounces: day.bounces || 0,

    events: ensureArray(day.events),

/**    newVisitors: day.newVisitors || 0,

 * Parse referrer URL into readable source    returningVisitors: day.returningVisitors || 0,

 */    conversions: {

function parseReferrer(referrer = '') {      forms: day.conversions?.forms || 0,

  if (!referrer || referrer === 'direct') {      ctaClicks: day.conversions?.ctaClicks || 0

    return 'Direct';    },

  }    pageBreakdown: toSortedEntries(day.pageViewsByPath, 8),

      referrers: toSortedEntries(day.referrers, 8),

  try {    devices: toSortedEntries(day.devices, 5),

    const url = new URL(referrer);    utmCampaigns: toSortedEntries(day.utmCampaigns, 8),

    const host = url.hostname.replace(/^www\./, '');    languages: toSortedEntries(day.languages, 8),

    return host;    timezones: toSortedEntries(day.timezones, 6),

  } catch (error) {    scrollDepth: {

    return referrer.substring(0, 64) || 'Unknown';      average: avgScroll,

  }      max: day.scrollDepth?.max || 0,

}      count: day.scrollDepth?.count || 0

    },

/**    loadTimes: {

 * Get device type from user agent      average: avgLoad,

 */      count: day.loadTimes?.count || 0

function getDeviceType(userAgent = '') {    },

  const ua = userAgent.toLowerCase();    sessionDuration: {

  if (/mobile|iphone|android|blackberry|phone|opera mini/.test(ua)) {      average: avgSession,

    return 'Mobile';      count: day.sessionDurations?.count || 0

  }    }

  if (/tablet|ipad/.test(ua)) {  };

    return 'Tablet';}

  }

  if (/smart-tv|hbbtv|appletv/.test(ua)) {// Initialize data structure

    return 'TV';async function initData() {

  }  try {

  return 'Desktop';    const store = getStore('analytics');

}    const data = await store.get('tracking-data', { type: 'json' });

    

/**    if (data) {

 * Get UTM campaign label      data.pageViews = ensureArray(data.pageViews);

 */      data.sessions = ensureArray(data.sessions);

function getUtmLabel(utm = {}) {      data.events = ensureArray(data.events);

  if (!utm || typeof utm !== 'object') {      data.crawlerLogs = ensureArray(data.crawlerLogs);

    return null;      data.botHits = ensureArray(data.botHits);

  }      data.visitors = data.visitors || {};

        data.dailyStats = data.dailyStats || {};

  const campaign = utm.campaign || utm.utm_campaign;

  const source = utm.source || utm.utm_source;      Object.keys(data.dailyStats).forEach(dateKey => {

  const medium = utm.medium || utm.utm_medium;        ensureDailyStats(data, dateKey);

        });

  if (campaign || source || medium) {

    const parts = [];      return data;

    if (campaign) parts.push(campaign);    }

    if (source) parts.push(`src:${source}`);  } catch (error) {

    if (medium) parts.push(`med:${medium}`);    console.log('[Analytics] Initializing new data store');

    return parts.join(' | ');  }

  }  

    return {

  return null;    pageViews: [],

}    sessions: [],

    events: [],

/**    crawlerLogs: [],

 * Get client IP address    botHits: [],

 */    visitors: {},

function getClientIP(event) {    dailyStats: {}

  return event.headers['x-forwarded-for']?.split(',')[0].trim() ||  };

         event.headers['client-ip'] ||}

         'unknown';

}// Save data

async function saveData(data) {

/**  Object.keys(data.dailyStats).forEach(dateKey => {

 * Hash IP for privacy (GDPR-compliant)    const day = data.dailyStats[dateKey];

 */    if (!Array.isArray(day.uniqueVisitors)) {

function hashIP(ip) {      day.uniqueVisitors = ensureArray(day.uniqueVisitors);

  return crypto    }

    .createHash('sha256')    if (!Array.isArray(day.events)) {

    .update(ip + process.env.IP_HASH_SALT)      day.events = ensureArray(day.events);

    .digest('hex')    }

    .substring(0, 16);    day.pageViewsByPath = day.pageViewsByPath || {};

}    day.referrers = day.referrers || {};

    day.devices = day.devices || {};

/**    day.utmCampaigns = day.utmCampaigns || {};

 * Get today's date key (YYYY-MM-DD)    day.languages = day.languages || {};

 */    day.timezones = day.timezones || {};

function getTodayKey() {    day.conversions = {

  return new Date().toISOString().split('T')[0];      forms: day.conversions?.forms || 0,

}      ctaClicks: day.conversions?.ctaClicks || 0

    };

/**    day.scrollDepth = {

 * Validate required fields in tracking data      total: day.scrollDepth?.total || 0,

 */      count: day.scrollDepth?.count || 0,

function validateTrackingData(body) {      max: day.scrollDepth?.max || 0

  const { type } = body;    };

      day.loadTimes = {

  if (!type || typeof type !== 'string') {      total: day.loadTimes?.total || 0,

    return { valid: false, error: 'Missing or invalid type field' };      count: day.loadTimes?.count || 0

  }    };

      day.sessionDurations = {

  if (type === 'pageview') {      total: day.sessionDurations?.total || 0,

    if (!body.page || typeof body.page !== 'string') {      count: day.sessionDurations?.count || 0

      return { valid: false, error: 'Missing or invalid page field' };    };

    }  });

  }

    const store = getStore('analytics');

  if (type === 'session') {  await store.set('tracking-data', JSON.stringify(data));

    if (typeof body.duration !== 'number' || body.duration < 0) {  console.log('[Analytics] Data saved to Netlify Blobs');

      return { valid: false, error: 'Missing or invalid duration field' };}

    }

  }// Hash IP for privacy (GDPR-compliant)

  function hashIP(ip) {

  if (type === 'event') {  return crypto.createHash('sha256').update(ip + 'salt-key-2025').digest('hex').substring(0, 16);

    if (!body.eventName || typeof body.eventName !== 'string') {}

      return { valid: false, error: 'Missing or invalid eventName field' };

    }// Get client IP

  }function getClientIP(event) {

    return event.headers['x-forwarded-for']?.split(',')[0].trim() || 

  return { valid: true };         event.headers['client-ip'] || 

}         'unknown';

}

// ============================================================================

// STORAGE FUNCTIONS// Get today's date key

// ============================================================================function getTodayKey() {

  return new Date().toISOString().split('T')[0];

/**}

 * Initialize or load tracking data

 */function classifyAgent(userAgent = '') {

async function loadTrackingData() {  const ua = userAgent.toLowerCase();

  try {

    const store = getStore('analytics');  if (!ua || ua === 'unknown') {

    const data = await store.get('tracking-data', { type: 'json' });    return 'malicious';

      }

    if (data) {

      // Ensure arrays  if (FRIENDLY_CRAWLERS.some(pattern => pattern.test(ua))) {

      data.pageViews = ensureArray(data.pageViews);    return 'crawler';

      data.sessions = ensureArray(data.sessions);  }

      data.events = ensureArray(data.events);

      data.crawlerLogs = ensureArray(data.crawlerLogs);  if (MALICIOUS_BOTS.some(pattern => pattern.test(ua))) {

      data.botHits = ensureArray(data.botHits);    return 'malicious';

      data.visitors = data.visitors || {};  }

      data.dailyStats = data.dailyStats || {};

        // Heuristics for suspicious agents

      // Ensure daily stats structure  if (/bot|crawler|spider|scraper|httpclient|python|java|node|fetch|dataminr/.test(ua)) {

      Object.keys(data.dailyStats).forEach(dateKey => {    return 'malicious';

        ensureDailyStats(data, dateKey);  }

      });

        return 'human';

      return data;}

    }

  } catch (error) {// Main handler

    console.log('[Analytics] Initializing new data store');exports.handler = async (event, context) => {

  }  // CORS headers

    const headers = {

  return {    'Access-Control-Allow-Origin': '*',

    pageViews: [],    'Access-Control-Allow-Headers': 'Content-Type',

    sessions: [],    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',

    events: [],    'Content-Type': 'application/json'

    crawlerLogs: [],  };

    botHits: [],

    visitors: {},  // Handle OPTIONS (preflight)

    dailyStats: {},  if (event.httpMethod === 'OPTIONS') {

    metadata: {    return { statusCode: 200, headers, body: '' };

      createdAt: new Date().toISOString(),  }

      version: '2.0'

    }  try {

  };    const data = await initData();

}    const today = getTodayKey();

    const todayStats = ensureDailyStats(data, today);

/**    const clientIP = getClientIP(event);

 * Save tracking data    const visitorId = hashIP(clientIP);

 */    const userAgent = event.headers['user-agent'] || '';

async function saveTrackingData(data) {    const agentType = classifyAgent(userAgent);

  // Final validation before save

  Object.keys(data.dailyStats).forEach(dateKey => {    // GET: Retrieve analytics data (REQUIRES AUTHENTICATION)

    const day = data.dailyStats[dateKey];    if (event.httpMethod === 'GET') {

          const action = event.queryStringParameters?.action;

    // Ensure all arrays are actually arrays      const apiKey = event.headers['x-api-key'] || event.queryStringParameters?.apiKey;

    if (!Array.isArray(day.uniqueVisitors)) {

      day.uniqueVisitors = ensureArray(day.uniqueVisitors);      // SECURITY: Require API key for stats access

    }      if (action === 'stats') {

    if (!Array.isArray(day.events)) {        if (!apiKey || apiKey !== STATS_API_KEY) {

      day.events = ensureArray(day.events);          return {

    }            statusCode: 401,

                headers,

    // Ensure all counters exist            body: JSON.stringify({ 

    day.pageViewsByPath = day.pageViewsByPath || {};              error: 'Unauthorized',

    day.referrers = day.referrers || {};              message: 'Valid API key required to access analytics data'

    day.devices = day.devices || {};            })

    day.utmCampaigns = day.utmCampaigns || {};          };

    day.languages = day.languages || {};        }

    day.timezones = day.timezones || {};

            // Calculate statistics for dashboard

    // Ensure conversion object        const last7Days = Object.keys(data.dailyStats)

    day.conversions = {          .sort()

      forms: day.conversions?.forms || 0,          .slice(-7);

      ctaClicks: day.conversions?.ctaClicks || 0

    };        const stats = {

              today: formatDailyStats(today, data.dailyStats[today]),

    // Ensure metric objects          last7Days: last7Days.map(date => formatDailyStats(date, data.dailyStats[date])),

    day.scrollDepth = {          totalVisitors: Object.keys(data.visitors).length,

      total: day.scrollDepth?.total || 0,          recentPageViews: data.pageViews.slice(-100),

      count: day.scrollDepth?.count || 0,          recentEvents: data.events.slice(-50),

      max: day.scrollDepth?.max || 0          recentSessions: data.sessions.slice(-100),

    };          recentCrawlers: data.crawlerLogs.slice(-100),

              recentBotHits: data.botHits.slice(-100)

    day.loadTimes = {        };

      total: day.loadTimes?.total || 0,

      count: day.loadTimes?.count || 0        return {

    };          statusCode: 200,

              headers,

    day.sessionDurations = {          body: JSON.stringify(stats)

      total: day.sessionDurations?.total || 0,        };

      count: day.sessionDurations?.count || 0      }

    };

  });      return {

          statusCode: 400,

  // Add metadata        headers,

  data.metadata = {        body: JSON.stringify({ error: 'Invalid action' })

    ...data.metadata,      };

    lastUpdated: new Date().toISOString(),    }

    version: '2.0'

  };    // POST: Log tracking event (NO AUTH REQUIRED - public endpoint)

      if (event.httpMethod === 'POST') {

  const store = getStore('analytics');      const body = JSON.parse(event.body || '{}');

  await store.set('tracking-data', JSON.stringify(data));      const { type, page, referrer, duration, sessionId, utm, language, timezone } = body;

  console.log('[Analytics] Data saved to Netlify Blobs');      const timestamp = new Date().toISOString();

}

      if (agentType === 'crawler') {

/**        todayStats.crawlers++;

 * Ensure daily stats object has correct structure        pushWithLimit(data.crawlerLogs, {

 */          timestamp,

function ensureDailyStats(data, dateKey) {          page,

  const day = data.dailyStats[dateKey] || {};          referrer,

            userAgent,

  const normalized = {          visitorId

    pageViews: day.pageViews || 0,        }, MAX_LOG_LENGTHS.crawlerLogs);

    uniqueVisitors: ensureArray(day.uniqueVisitors),

    bots: day.bots || 0,        await saveData(data);

    crawlers: day.crawlers || 0,        return {

    sessions: day.sessions || 0,          statusCode: 200,

    bounces: day.bounces || 0,          headers,

    events: ensureArray(day.events),          body: JSON.stringify({ tracked: false, reason: 'crawler' })

    newVisitors: day.newVisitors || 0,        };

    returningVisitors: day.returningVisitors || 0,      }

    pageViewsByPath: day.pageViewsByPath || {},

    referrers: day.referrers || {},      if (agentType === 'malicious') {

    devices: day.devices || {},        todayStats.bots++;

    utmCampaigns: day.utmCampaigns || {},        pushWithLimit(data.botHits, {

    languages: day.languages || {},          timestamp,

    timezones: day.timezones || {},          page,

    conversions: {          referrer,

      forms: day.conversions?.forms || 0,          userAgent,

      ctaClicks: day.conversions?.ctaClicks || 0          visitorId

    },        }, MAX_LOG_LENGTHS.botHits);

    scrollDepth: {

      total: day.scrollDepth?.total || 0,        await saveData(data);

      count: day.scrollDepth?.count || 0,        return {

      max: day.scrollDepth?.max || 0          statusCode: 200,

    },          headers,

    loadTimes: {          body: JSON.stringify({ tracked: false, reason: 'bot' })

      total: day.loadTimes?.total || 0,        };

      count: day.loadTimes?.count || 0      }

    },

    sessionDurations: {      // Track page view

      total: day.sessionDurations?.total || 0,      if (type === 'pageview') {

      count: day.sessionDurations?.count || 0        pushWithLimit(data.pageViews, {

    }          timestamp,

  };          visitorId,

            page,

  data.dailyStats[dateKey] = normalized;          referrer,

  return normalized;          sessionId

}        }, MAX_LOG_LENGTHS.pageViews);



/**        todayStats.pageViews++;

 * Clean up old data (GDPR 90-day retention)        

 */        // Track unique visitor

async function cleanupOldData(data) {        if (!data.visitors[visitorId]) {

  const now = Date.now();          data.visitors[visitorId] = {

  const cutoffDate = new Date(now - CONFIG.RETENTION_MS).toISOString().split('T')[0];            firstSeen: timestamp,

              lastSeen: timestamp,

  // Clean daily stats            pageViews: 0,

  const statsKeys = Object.keys(data.dailyStats);            sessions: 0

  let removedDays = 0;          };

  statsKeys.forEach(dateKey => {        }

    if (dateKey < cutoffDate) {        const visitorRecord = data.visitors[visitorId];

      delete data.dailyStats[dateKey];        const wasFirstVisit = visitorRecord.pageViews === 0;

      removedDays++;        visitorRecord.lastSeen = timestamp;

    }        visitorRecord.pageViews++;

  });

          const uniqueSet = new Set(ensureArray(todayStats.uniqueVisitors));

  // Clean pageViews        const alreadyCountedToday = uniqueSet.has(visitorId);

  const originalPageViews = data.pageViews.length;        uniqueSet.add(visitorId);

  data.pageViews = data.pageViews.filter(pv => {        todayStats.uniqueVisitors = Array.from(uniqueSet);

    const pvDate = new Date(pv.timestamp).getTime();

    return (now - pvDate) < CONFIG.RETENTION_MS;        if (!alreadyCountedToday) {

  });          if (wasFirstVisit) {

              todayStats.newVisitors++;

  // Clean sessions          } else {

  const originalSessions = data.sessions.length;            todayStats.returningVisitors++;

  data.sessions = data.sessions.filter(s => {          }

    const sDate = new Date(s.timestamp).getTime();        }

    return (now - sDate) < CONFIG.RETENTION_MS;

  });        const pageKey = page || 'unknown';

          incrementCounter(todayStats.pageViewsByPath, pageKey);

  // Clean events

  const originalEvents = data.events.length;        const refLabel = parseReferrer(referrer);

  data.events = data.events.filter(e => {        incrementCounter(todayStats.referrers, refLabel);

    const eDate = new Date(e.timestamp).getTime();

    return (now - eDate) < CONFIG.RETENTION_MS;        const deviceType = getDeviceType(userAgent);

  });        incrementCounter(todayStats.devices, deviceType);

  

  // Clean crawler logs        const utmLabel = getUtmLabel(utm);

  data.crawlerLogs = data.crawlerLogs.filter(c => {        if (utmLabel) {

    const cDate = new Date(c.timestamp).getTime();          incrementCounter(todayStats.utmCampaigns, utmLabel);

    return (now - cDate) < CONFIG.RETENTION_MS;        }

  });

          const languageKey = typeof language === 'string' && language.length > 0

  // Clean bot hits          ? language.slice(0, 8).toLowerCase()

  data.botHits = data.botHits.filter(b => {          : 'unknown';

    const bDate = new Date(b.timestamp).getTime();        incrementCounter(todayStats.languages, languageKey);

    return (now - bDate) < CONFIG.RETENTION_MS;

  });        const timezoneKey = typeof timezone === 'string' && timezone.length > 0

            ? timezone.slice(0, 32)

  if (removedDays > 0 ||           : 'Unknown';

      data.pageViews.length < originalPageViews ||        incrementCounter(todayStats.timezones, timezoneKey);

      data.sessions.length < originalSessions ||      }

      data.events.length < originalEvents) {

    console.log(`[Analytics] Cleanup: Removed ${removedDays} old daily stats, ` +      // Track session end

                `${originalPageViews - data.pageViews.length} pageviews, ` +      if (type === 'session') {

                `${originalSessions - data.sessions.length} sessions, ` +        pushWithLimit(data.sessions, {

                `${originalEvents - data.events.length} events`);          timestamp,

    return true;          visitorId,

  }          sessionId,

            duration,

  return false;          pages: body.pages || 1

}        }, MAX_LOG_LENGTHS.sessions);



// ============================================================================        todayStats.sessions++;

// STATS FORMATTING

// ============================================================================        if (!data.visitors[visitorId]) {

          data.visitors[visitorId] = {

/**            firstSeen: timestamp,

 * Format daily stats for API response            lastSeen: timestamp,

 */            pageViews: 0,

function formatDailyStats(dateKey, day = {}) {            sessions: 0

  const toSortedEntries = (counter = {}, limit = 10) => {          };

    return Object.entries(counter || {})        }

      .sort((a, b) => b[1] - a[1])

      .slice(0, limit)  data.visitors[visitorId].sessions = (data.visitors[visitorId].sessions || 0) + 1;

      .map(([label, value]) => ({ label, value }));  todayStats.sessionDurations.total += duration || 0;

  };  todayStats.sessionDurations.count += 1;

          

  const avgScroll = day.scrollDepth?.count        // Count as bounce if only 1 page and < 30 seconds

    ? Math.round(day.scrollDepth.total / day.scrollDepth.count)        if (body.pages === 1 && duration < 30000) {

    : 0;          todayStats.bounces++;

          }

  const avgLoad = day.loadTimes?.count      }

    ? Math.round(day.loadTimes.total / day.loadTimes.count)

    : 0;      // Track custom event

        if (type === 'event') {

  const avgSession = day.sessionDurations?.count        pushWithLimit(data.events, {

    ? Math.round(day.sessionDurations.total / day.sessionDurations.count)          timestamp,

    : 0;          visitorId,

            eventName: body.eventName,

  return {          eventData: body.eventData

    date: dateKey,        }, MAX_LOG_LENGTHS.events);

    pageViews: day.pageViews || 0,

    uniqueVisitors: Array.isArray(day.uniqueVisitors) ? day.uniqueVisitors.length : (day.uniqueVisitors || 0),        pushWithLimit(todayStats.events, {

    bots: day.bots || 0,          name: body.eventName,

    crawlers: day.crawlers || 0,          timestamp

    sessions: day.sessions || 0,        }, MAX_LOG_LENGTHS.events);

    bounces: day.bounces || 0,

    bounceRate: day.sessions > 0 ? Math.round((day.bounces / day.sessions) * 100) : 0,        if (body.eventName === 'form_submit') {

    events: ensureArray(day.events).length,          todayStats.conversions.forms += 1;

    newVisitors: day.newVisitors || 0,        }

    returningVisitors: day.returningVisitors || 0,

    conversions: {        if (body.eventName === 'cta_click') {

      forms: day.conversions?.forms || 0,          todayStats.conversions.ctaClicks += 1;

      ctaClicks: day.conversions?.ctaClicks || 0        }

    },

    pageBreakdown: toSortedEntries(day.pageViewsByPath, 8),        if (body.eventName === 'scroll_depth') {

    referrers: toSortedEntries(day.referrers, 8),          const percent = Number(body.eventData?.percent) || 0;

    devices: toSortedEntries(day.devices, 5),          todayStats.scrollDepth.total += percent;

    utmCampaigns: toSortedEntries(day.utmCampaigns, 8),          todayStats.scrollDepth.count += 1;

    languages: toSortedEntries(day.languages, 8),          if (percent > todayStats.scrollDepth.max) {

    timezones: toSortedEntries(day.timezones, 6),            todayStats.scrollDepth.max = percent;

    scrollDepth: {          }

      average: avgScroll,        }

      max: day.scrollDepth?.max || 0,

      count: day.scrollDepth?.count || 0        if (body.eventName === 'page_load') {

    },          const loadTime = Number(body.eventData?.fullLoad) || 0;

    loadTimes: {          if (loadTime > 0) {

      average: avgLoad,            todayStats.loadTimes.total += loadTime;

      count: day.loadTimes?.count || 0            todayStats.loadTimes.count += 1;

    },          }

    sessionDuration: {        }

      average: avgSession,      }

      count: day.sessionDurations?.count || 0

    }      // Save data

  };      await saveData(data);

}

      return {

// ============================================================================        statusCode: 200,

// RATE LIMITING FOR STATS ENDPOINT        headers,

// ============================================================================        body: JSON.stringify({ tracked: true, visitorId })

      };

const statsRateLimitCache = new Map();    }



function checkStatsRateLimit(ip) {    return {

  const now = Date.now();      statusCode: 405,

  const record = statsRateLimitCache.get(ip) || { count: 0, resetTime: now + CONFIG.STATS_RATE_LIMIT.WINDOW_MS };      headers,

        body: JSON.stringify({ error: 'Method not allowed' })

  // Reset if window expired    };

  if (now > record.resetTime) {

    record.count = 0;  } catch (error) {

    record.resetTime = now + CONFIG.STATS_RATE_LIMIT.WINDOW_MS;    console.error('Tracking error:', error);

  }    return {

        statusCode: 500,

  record.count++;      headers,

  statsRateLimitCache.set(ip, record);      body: JSON.stringify({ error: 'Internal server error' })

      };

  if (record.count > CONFIG.STATS_RATE_LIMIT.MAX_REQUESTS) {  }

    return {};

      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }
  
  return { allowed: true };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of statsRateLimitCache.entries()) {
    if (now > record.resetTime) {
      statsRateLimitCache.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ============================================================================
// HTTP HELPERS
// ============================================================================

function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin) {
  if (isValidOrigin(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    };
  }
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
}

function createResponse(statusCode, body, additionalHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      ...additionalHeaders
    },
    body: JSON.stringify(body)
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

exports.handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers = corsHeaders(origin);
  
  // Handle OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {}, headers);
  }
  
  // Validate environment
  try {
    validateEnvironment();
  } catch (error) {
    console.error('[Analytics] Environment validation failed:', error.message);
    return createResponse(500, {
      error: 'Server configuration error',
      message: 'Analytics service is not properly configured'
    }, headers);
  }
  
  const clientIP = getClientIP(event);
  const userAgent = event.headers['user-agent'] || '';
  const agentType = classifyAgent(userAgent);
  
  try {
    const data = await loadTrackingData();
    const today = getTodayKey();
    const todayStats = ensureDailyStats(data, today);
    const visitorId = hashIP(clientIP);
    const timestamp = new Date().toISOString();
    
    // ========================================================================
    // GET: Retrieve analytics data (REQUIRES API KEY)
    // ========================================================================
    if (event.httpMethod === 'GET') {
      const action = event.queryStringParameters?.action;
      const apiKey = event.headers['x-api-key'] || event.queryStringParameters?.apiKey;
      
      if (action === 'stats') {
        // SECURITY: Require API key
        if (!apiKey || apiKey !== process.env.ANALYTICS_API_KEY) {
          console.warn(`[Analytics] Unauthorized stats access attempt from ${clientIP}`);
          return createResponse(401, {
            error: 'Unauthorized',
            message: 'Valid API key required to access analytics data'
          }, headers);
        }
        
        // Rate limiting for stats endpoint
        const rateCheck = checkStatsRateLimit(clientIP);
        if (!rateCheck.allowed) {
          return createResponse(429, {
            error: 'Rate limit exceeded',
            message: `Maximum ${CONFIG.STATS_RATE_LIMIT.MAX_REQUESTS} requests per minute`,
            retryAfter: rateCheck.retryAfter
          }, {
            ...headers,
            'Retry-After': rateCheck.retryAfter.toString()
          });
        }
        
        // Clean up old data if needed
        const cleaned = await cleanupOldData(data);
        if (cleaned) {
          await saveTrackingData(data);
        }
        
        // Calculate statistics
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
          recentBotHits: data.botHits.slice(-100),
          dataRetentionDays: CONFIG.RETENTION_DAYS
        };
        
        return createResponse(200, stats, headers);
      }
      
      return createResponse(400, {
        error: 'Invalid action',
        message: 'Supported actions: stats'
      }, headers);
    }
    
    // ========================================================================
    // POST: Log tracking event (PUBLIC - NO AUTH REQUIRED)
    // ========================================================================
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      // Validate data
      const validation = validateTrackingData(body);
      if (!validation.valid) {
        return createResponse(400, {
          error: 'Invalid data',
          message: validation.error
        }, headers);
      }
      
      const { type, page, referrer, duration, sessionId, utm, language, timezone } = body;
      
      // Handle crawler traffic
      if (agentType === 'crawler') {
        todayStats.crawlers++;
        pushWithLimit(data.crawlerLogs, {
          timestamp,
          page,
          referrer,
          userAgent,
          visitorId
        }, CONFIG.MAX_LOG_LENGTHS.crawlerLogs);
        
        await saveTrackingData(data);
        return createResponse(200, { tracked: false, reason: 'crawler' }, headers);
      }
      
      // Block malicious traffic
      if (agentType === 'malicious') {
        todayStats.bots++;
        pushWithLimit(data.botHits, {
          timestamp,
          page,
          referrer,
          userAgent,
          visitorId
        }, CONFIG.MAX_LOG_LENGTHS.botHits);
        
        await saveTrackingData(data);
        return createResponse(200, { tracked: false, reason: 'bot' }, headers);
      }
      
      // Track legitimate human traffic
      if (type === 'pageview') {
        pushWithLimit(data.pageViews, {
          timestamp,
          visitorId,
          page,
          referrer,
          sessionId
        }, CONFIG.MAX_LOG_LENGTHS.pageViews);
        
        todayStats.pageViews++;
        
        // Track visitor
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
        
        // Track unique visitor
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
        
        // Track metrics
        incrementCounter(todayStats.pageViewsByPath, page || 'unknown');
        incrementCounter(todayStats.referrers, parseReferrer(referrer));
        incrementCounter(todayStats.devices, getDeviceType(userAgent));
        
        const utmLabel = getUtmLabel(utm);
        if (utmLabel) {
          incrementCounter(todayStats.utmCampaigns, utmLabel);
        }
        
        const lang = typeof language === 'string' && language.length > 0
          ? language.slice(0, 8).toLowerCase()
          : 'unknown';
        incrementCounter(todayStats.languages, lang);
        
        const tz = typeof timezone === 'string' && timezone.length > 0
          ? timezone.slice(0, 32)
          : 'Unknown';
        incrementCounter(todayStats.timezones, tz);
      }
      
      // Track session end
      if (type === 'session') {
        pushWithLimit(data.sessions, {
          timestamp,
          visitorId,
          sessionId,
          duration,
          pages: body.pages || 1
        }, CONFIG.MAX_LOG_LENGTHS.sessions);
        
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
        }, CONFIG.MAX_LOG_LENGTHS.events);
        
        pushWithLimit(todayStats.events, {
          name: body.eventName,
          timestamp
        }, CONFIG.MAX_LOG_LENGTHS.events);
        
        // Track conversions
        if (body.eventName === 'form_submit') {
          todayStats.conversions.forms += 1;
        }
        
        if (body.eventName === 'cta_click') {
          todayStats.conversions.ctaClicks += 1;
        }
        
        // Track scroll depth
        if (body.eventName === 'scroll_depth') {
          const percent = Number(body.eventData?.percent) || 0;
          todayStats.scrollDepth.total += percent;
          todayStats.scrollDepth.count += 1;
          if (percent > todayStats.scrollDepth.max) {
            todayStats.scrollDepth.max = percent;
          }
        }
        
        // Track page load time
        if (body.eventName === 'page_load') {
          const loadTime = Number(body.eventData?.fullLoad) || 0;
          if (loadTime > 0) {
            todayStats.loadTimes.total += loadTime;
            todayStats.loadTimes.count += 1;
          }
        }
      }
      
      // Save data
      await saveTrackingData(data);
      
      return createResponse(200, { tracked: true, visitorId }, headers);
    }
    
    return createResponse(405, {
      error: 'Method not allowed',
      message: 'Only GET, POST, and OPTIONS methods are supported'
    }, headers);
    
  } catch (error) {
    console.error('[Analytics] Handler error:', error);
    return createResponse(500, {
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, headers);
  }
};
