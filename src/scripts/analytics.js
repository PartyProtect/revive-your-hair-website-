/**
 * ============================================================================
 * CUSTOM ANALYTICS TRACKING - CLIENT-SIDE (PRODUCTION READY)
 * ============================================================================
 * 
 * Features:
 * ✅ Aligned bot detection with server-side
 * ✅ Proper consent integration (no race conditions)
 * ✅ Single initialization point
 * ✅ Session management with browser storage
 * ✅ Comprehensive event tracking
 * ✅ Performance metrics
 * ✅ Error recovery
 * ✅ GDPR compliant
 * 
 * Privacy:
 * - IP addresses are anonymized server-side
 * - No tracking without consent
 * - 90-day data retention
 * - User can opt out via cookie consent
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const TRACKING_CONFIG = {
  apiEndpoint: '/.netlify/functions/tracking',
  sessionDuration: 30 * 60 * 1000, // 30 minutes
  heartbeatInterval: 30 * 1000,     // 30 seconds
  scrollMilestones: [25, 50, 75, 90, 100],
  performanceTracking: true,
  scrollTracking: true,
  clickTracking: true,
  debug: window.location.hostname === 'localhost' || 
         window.location.hostname.includes('netlify.app')
};

// ============================================================================
// BOT DETECTION - MUST MATCH SERVER-SIDE
// ============================================================================

/**
 * Friendly search engine crawlers (tracked separately for SEO insights)
 */
const FRIENDLY_CRAWLERS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /slurp/i,              // Yahoo
  /facebookexternalhit/i,
  /linkedinbot/i,
  /twitterbot/i,
  /slackbot/i,
  /discordbot/i,
  /whatsapp/i,
  /telegrambot/i
];

/**
 * Malicious bots and scrapers (block from analytics)
 */
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
  /chrome-lighthouse/i,
  /gtmetrix/i,
  /screaming\s?frog/i,
  /bingpreview/i,
  /petalbot/i,
  /serpstatbot/i,
  /zoominfobot/i,
  /dataforseobot/i
];

/**
 * Classify user agent - MUST MATCH SERVER-SIDE EXACTLY
 */
function classifyAgent(userAgent = '') {
  const ua = userAgent.toLowerCase();
  
  if (!ua || ua === 'unknown') {
    return 'malicious';
  }
  
  // Check friendly crawlers first (SEO bots)
  if (FRIENDLY_CRAWLERS.some(pattern => pattern.test(ua))) {
    return 'crawler';
  }
  
  // Check malicious patterns
  if (MALICIOUS_BOTS.some(pattern => pattern.test(ua))) {
    return 'malicious';
  }
  
  // Heuristic checks for suspicious patterns
  const suspiciousPatterns = [
    /bot/i, /crawl/i, /spider/i, /scraper/i,
    /dataminr/i, /fetch/i, /monitor/i, /check/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(ua))) {
    return 'malicious';
  }
  
  return 'human';
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

class ConsentManager {
  constructor() {
    this.storageKey = 'cookie-consent';
    this.granted = false;
    this.checked = false;
    this.listeners = [];
  }
  
  /**
   * Check if consent is granted
   */
  check() {
    try {
      const consent = localStorage.getItem(this.storageKey);
      if (!consent) {
        this.granted = false;
        this.checked = true;
        return false;
      }
      
      const consentData = JSON.parse(consent);
      this.granted = consentData.acceptedAll === true;
      this.checked = true;
      
      return this.granted;
    } catch (error) {
      console.error('[Tracking] Error checking consent:', error);
      this.granted = false;
      this.checked = true;
      return false;
    }
  }
  
  /**
   * Wait for consent decision (max 30 seconds)
   */
  async waitForConsent(timeoutMs = 30000) {
    // Check immediately
    if (this.check()) {
      return true;
    }
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Listen for storage changes
      const storageListener = (event) => {
        if (event.key === this.storageKey) {
          cleanup();
          resolve(this.check());
        }
      };
      
      // Listen for custom event
      const customListener = () => {
        cleanup();
        resolve(this.check());
      };
      
      // Timeout
      const timeout = setTimeout(() => {
        cleanup();
        resolve(this.check());
      }, timeoutMs);
      
      // Cleanup function
      const cleanup = () => {
        window.removeEventListener('storage', storageListener);
        window.removeEventListener('consentUpdated', customListener);
        clearTimeout(timeout);
      };
      
      window.addEventListener('storage', storageListener);
      window.addEventListener('consentUpdated', customListener);
    });
  }
  
  /**
   * Listen for consent changes
   */
  onChange(callback) {
    this.listeners.push(callback);
    
    // Storage changes (from other tabs)
    const storageListener = (event) => {
      if (event.key === this.storageKey) {
        const granted = this.check();
        this.listeners.forEach(cb => cb(granted));
      }
    };
    
    // Custom event (same tab)
    const customListener = () => {
      const granted = this.check();
      this.listeners.forEach(cb => cb(granted));
    };
    
    window.addEventListener('storage', storageListener);
    window.addEventListener('consentUpdated', customListener);
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

class SessionManager {
  constructor() {
    this.storageKey = 'analytics_session';
    this.sessionId = this.getOrCreate();
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    this.pageViewCount = 0;
  }
  
  /**
   * Get existing session or create new one
   */
  getOrCreate() {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const session = JSON.parse(stored);
        // Check if session is still valid
        if (Date.now() - session.lastActivity < TRACKING_CONFIG.sessionDuration) {
          return session.id;
        }
      }
    } catch (error) {
      console.warn('[Tracking] Error reading session:', error);
    }
    
    // Create new session
    const newId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.save(newId);
    return newId;
  }
  
  /**
   * Save session to storage
   */
  save(id = this.sessionId) {
    try {
      const sessionData = {
        id: id || this.sessionId,
        startTime: this.startTime,
        lastActivity: Date.now(),
        pageViewCount: this.pageViewCount
      };
      sessionStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('[Tracking] Error saving session:', error);
    }
  }
  
  /**
   * Update activity timestamp
   */
  updateActivity() {
    this.lastActivity = Date.now();
    this.save();
  }
  
  /**
   * Increment page view count
   */
  incrementPageViews() {
    this.pageViewCount++;
    this.save();
  }
  
  /**
   * Get session duration
   */
  getDuration() {
    return Date.now() - this.startTime;
  }
  
  /**
   * Get session data for tracking
   */
  getData() {
    return {
      sessionId: this.sessionId,
      duration: this.getDuration(),
      pages: this.pageViewCount
    };
  }
}

// ============================================================================
// UTM PARAMETER CAPTURE
// ============================================================================

class UTMManager {
  constructor() {
    this.storageKey = 'analytics_utm';
    this.data = this.capture();
  }
  
  /**
   * Capture UTM parameters from URL
   */
  capture() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const found = {};
    
    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        found[key.replace('utm_', '')] = value;
      }
    });
    
    // Save if found
    if (Object.keys(found).length > 0) {
      try {
        sessionStorage.setItem(this.storageKey, JSON.stringify(found));
        return found;
      } catch (error) {
        console.warn('[Tracking] Error saving UTM data:', error);
      }
    }
    
    // Load stored
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }
  
  /**
   * Get UTM data
   */
  getData() {
    return this.data;
  }
}

// ============================================================================
// MAIN TRACKING CLASS
// ============================================================================

class CustomAnalytics {
  constructor() {
    this.consent = new ConsentManager();
    this.session = null;
    this.utm = null;
    this.trackingStarted = false;
    this.heartbeatInterval = null;
    this.scrollMilestones = new Set();
    this.scrollListener = null;
    this.clickListener = null;
    this.performanceTracked = false;
    
    // Detect bot
    this.agentType = classifyAgent(navigator.userAgent);
    
    // Session info
    this.language = navigator.language || navigator.userLanguage || 'unknown';
    this.timezone = 'Unknown';
    try {
      this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
    } catch (error) {
      // Timezone detection failed
    }
    
    this.screenInfo = {
      width: window.screen?.width || 0,
      height: window.screen?.height || 0
    };
    
    if (TRACKING_CONFIG.debug) {
      console.log('[Tracking] Initialized', {
        agentType: this.agentType,
        consent: this.consent.granted
      });
    }
  }
  
  /**
   * Initialize tracking
   */
  async init() {
    // Block bots from tracking
    if (this.agentType === 'malicious') {
      if (TRACKING_CONFIG.debug) {
        console.log('[Tracking] Malicious bot detected, tracking disabled');
      }
      return;
    }
    
    // Wait for consent
    const granted = await this.consent.waitForConsent();
    
    if (!granted) {
      if (TRACKING_CONFIG.debug) {
        console.log('[Tracking] No consent granted, tracking disabled');
      }
      // Listen for future consent
      this.consent.onChange((granted) => {
        if (granted && !this.trackingStarted) {
          this.startTracking();
        }
      });
      return;
    }
    
    // Start tracking
    this.startTracking();
    
    // Listen for consent revocation
    this.consent.onChange((granted) => {
      if (!granted && this.trackingStarted) {
        this.stopTracking();
      } else if (granted && !this.trackingStarted) {
        this.startTracking();
      }
    });
  }
  
  /**
   * Start tracking
   */
  startTracking() {
    if (this.trackingStarted) {
      return;
    }
    
    this.trackingStarted = true;
    this.session = new SessionManager();
    this.utm = new UTMManager();
    
    // Track initial page view
    this.trackPageView();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Track performance
    if (TRACKING_CONFIG.performanceTracking) {
      this.setupPerformanceTracking();
    }
    
    // Track session end on page unload
    window.addEventListener('beforeunload', () => this.endSession());
    
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.session.updateActivity();
      }
    });
    
    if (TRACKING_CONFIG.debug) {
      console.log('[Tracking] ✅ Tracking started');
    }
  }
  
  /**
   * Stop tracking
   */
  stopTracking() {
    if (!this.trackingStarted) {
      return;
    }
    
    this.trackingStarted = false;
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Remove event listeners
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
    
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
      this.clickListener = null;
    }
    
    if (TRACKING_CONFIG.debug) {
      console.log('[Tracking] Tracking stopped');
    }
  }
  
  /**
   * Track page view
   */
  async trackPageView() {
    if (!this.trackingStarted || !this.session) {
      return;
    }
    
    this.session.incrementPageViews();
    
    const data = {
      type: 'pageview',
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      sessionId: this.session.sessionId,
      timestamp: new Date().toISOString(),
      utm: this.utm.getData(),
      language: this.language,
      timezone: this.timezone,
      title: document.title,
      screen: this.screenInfo
    };
    
    await this.sendData(data);
    
    if (TRACKING_CONFIG.debug) {
      console.log('[Tracking] Page view tracked:', window.location.pathname);
    }
  }
  
  /**
   * End session
   */
  async endSession() {
    if (!this.trackingStarted || !this.session || this.session.pageViewCount === 0) {
      return;
    }
    
    const data = {
      type: 'session',
      ...this.session.getData(),
      timestamp: new Date().toISOString()
    };
    
    // Use sendBeacon if available (more reliable on page unload)
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(TRACKING_CONFIG.apiEndpoint, blob);
        
        if (TRACKING_CONFIG.debug) {
          console.log('[Tracking] Session ended (beacon):', data.duration + 'ms');
        }
        return;
      } catch (error) {
        // Fallback to regular fetch
      }
    }
    
    // Fallback to regular fetch
    await this.sendData(data);
    
    if (TRACKING_CONFIG.debug) {
      console.log('[Tracking] Session ended:', data.duration + 'ms');
    }
  }
  
  /**
   * Track custom event
   */
  async trackEvent(eventName, eventData = {}) {
    if (!this.trackingStarted || !this.session) {
      return;
    }
    
    const data = {
      type: 'event',
      eventName,
      eventData,
      sessionId: this.session.sessionId,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      language: this.language,
      timezone: this.timezone
    };
    
    await this.sendData(data);
    
    if (TRACKING_CONFIG.debug) {
      console.log('[Tracking] Event tracked:', eventName, eventData);
    }
  }
  
  /**
   * Send data to server
   */
  async sendData(data) {
    try {
      const response = await fetch(TRACKING_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (TRACKING_CONFIG.debug) {
        console.error('[Tracking] Failed to send data:', error);
      }
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Scroll tracking
    if (TRACKING_CONFIG.scrollTracking) {
      this.setupScrollTracking();
    }
    
    // Click tracking
    if (TRACKING_CONFIG.clickTracking) {
      this.setupClickTracking();
    }
    
    // Form submission tracking
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.trackEvent('form_submit', {
        formId: form.id || 'unknown',
        page: window.location.pathname
      });
    });
  }
  
  /**
   * Set up scroll tracking
   */
  setupScrollTracking() {
    if (this.scrollListener) {
      return; // Already set up
    }
    
    let scrollTimeout;
    
    this.scrollListener = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const docHeight = doc.scrollHeight - window.innerHeight;
        
        if (docHeight <= 0) {
          return;
        }
        
        const percent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
        
        TRACKING_CONFIG.scrollMilestones.forEach((mark) => {
          if (percent >= mark && !this.scrollMilestones.has(mark)) {
            this.scrollMilestones.add(mark);
            this.trackEvent('scroll_depth', {
              percent: mark,
              page: window.location.pathname
            });
          }
        });
      }, 500); // Debounce
    };
    
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }
  
  /**
   * Set up click tracking
   */
  setupClickTracking() {
    if (this.clickListener) {
      return; // Already set up
    }
    
    this.clickListener = (event) => {
      const target = event.target.closest('a, button');
      if (!target) {
        return;
      }
      
      // External links
      const isExternal = target.href && !target.href.includes(window.location.hostname);
      if (isExternal) {
        this.trackEvent('external_link_click', {
          url: target.href,
          text: target.textContent.trim().substring(0, 50)
        });
      }
      
      // CTA buttons
      const isCTA = target.classList.contains('cta-button') ||
                    target.classList.contains('btn-primary') ||
                    target.closest('.cta-section');
      if (isCTA) {
        this.trackEvent('cta_click', {
          text: target.textContent.trim().substring(0, 50),
          location: window.location.pathname
        });
      }
    };
    
    document.addEventListener('click', this.clickListener);
  }
  
  /**
   * Set up performance tracking
   */
  setupPerformanceTracking() {
    if (this.performanceTracked) {
      return;
    }
    
    const sendMetrics = () => {
      if (this.performanceTracked) {
        return;
      }
      
      try {
        const navEntries = performance.getEntriesByType('navigation');
        const navigation = navEntries && navEntries.length > 0 ? navEntries[0] : null;
        
        if (!navigation) {
          return;
        }
        
        const metrics = {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.startTime),
          fullLoad: Math.round(navigation.loadEventEnd - navigation.startTime)
        };
        
        this.trackEvent('page_load', metrics);
        this.performanceTracked = true;
        
        if (TRACKING_CONFIG.debug) {
          console.log('[Tracking] Performance metrics:', metrics);
        }
      } catch (error) {
        if (TRACKING_CONFIG.debug) {
          console.warn('[Tracking] Performance metrics unavailable', error);
        }
      }
    };
    
    // Track when page fully loads
    if (document.readyState === 'complete') {
      setTimeout(sendMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(sendMetrics, 1000);
      });
    }
  }
  
  /**
   * Start heartbeat (periodic activity tracking)
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      return;
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (!document.hidden && this.session) {
        this.session.updateActivity();
        this.trackEvent('heartbeat', {
          activeTime: this.session.getDuration()
        });
      }
    }, TRACKING_CONFIG.heartbeatInterval);
  }
  
  /**
   * Public API for manual event tracking
   */
  static trackCustomEvent(eventName, eventData) {
    if (window.customAnalytics && window.customAnalytics.trackingStarted) {
      window.customAnalytics.trackEvent(eventName, eventData);
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize analytics when DOM is ready
function initializeTracking() {
  const analytics = new CustomAnalytics();
  analytics.init();
  
  // Make available globally
  window.customAnalytics = analytics;
  
  // Export public API
  window.CustomAnalytics = {
    trackEvent: (eventName, eventData) => analytics.trackEvent(eventName, eventData),
    isTracking: () => analytics.trackingStarted,
    getSession: () => analytics.session?.getData() || null
  };
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTracking);
} else {
  initializeTracking();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomAnalytics;
}
