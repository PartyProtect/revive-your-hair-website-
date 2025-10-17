// Custom Analytics Tracking Script
// Privacy-friendly, GDPR-compliant visitor tracking with engagement metrics

class CustomAnalytics {
  constructor() {
    this.apiEndpoint = '/.netlify/functions/tracking';
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStart = Date.now();
    this.pageViewCount = 0;
    this.currentPage = window.location.pathname;
    this.consentGiven = false;
    this.trackingStarted = false;
    this.scrollMilestones = new Set();
    this.utmData = {};
    this.language = 'unknown';
    this.timezone = 'Unknown';
    this.screenInfo = {
      width: window.screen?.width || 0,
      height: window.screen?.height || 0
    };

    window.addEventListener('storage', (event) => this.handleConsentChange(event));

    this.init();
  }

  init() {
    this.captureSessionDetails();
    this.setupScrollTracking();
    this.setupPerformanceTracking();
    this.trackClicks();

    window.addEventListener('beforeunload', () => this.endSession());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { duration: Date.now() - this.sessionStart });
      }
    });

    this.checkConsent();

    if (this.consentGiven) {
      this.startTracking();
    } else {
      console.log('[Analytics] Tracking paused - waiting for consent');
    }
  }

  startTracking() {
    if (this.trackingStarted || !this.consentGiven) {
      return;
    }

    this.trackingStarted = true;
    this.sessionStart = Date.now();
    this.trackPageView();
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 30000);
  }

  stopTracking() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.trackingStarted = false;
  }

  handleConsentChange(event) {
    if (event.key !== 'cookie-consent') {
      return;
    }

    const previousConsent = this.consentGiven;
    this.checkConsent();

    if (this.consentGiven && !previousConsent) {
      this.startTracking();
    }

    if (!this.consentGiven && previousConsent) {
      this.stopTracking();
    }
  }

  checkConsent() {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        const consentData = JSON.parse(consent);
        this.consentGiven = consentData.acceptedAll === true;
      } else {
        this.consentGiven = false;
      }
    } catch (error) {
      console.error('[Analytics] Error checking consent:', error);
      this.consentGiven = false;
    }
  }

  captureSessionDetails() {
    this.utmData = this.getStoredUtmData();
    this.language = navigator.language || navigator.userLanguage || 'unknown';
    try {
      this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
    } catch (error) {
      this.timezone = 'Unknown';
    }
  }

  getStoredUtmData() {
    const storageKey = 'analytics_utm';
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const found = {};

    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        found[key.replace('utm_', '')] = value;
      }
    });

    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(found));
      return found;
    }

    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  setupScrollTracking() {
    if (this.scrollListener) {
      return;
    }

    this.scrollListener = () => {
      if (!this.consentGiven) {
        return;
      }

      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const docHeight = doc.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        return;
      }

      const percent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      const milestones = [25, 50, 75, 90, 100];

      milestones.forEach((mark) => {
        if (percent >= mark && !this.scrollMilestones.has(mark)) {
          this.scrollMilestones.add(mark);
          this.trackEvent('scroll_depth', { percent: mark, page: this.currentPage });
        }
      });
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  setupPerformanceTracking() {
    const sendMetrics = () => this.sendPerformanceMetrics();
    window.addEventListener('load', sendMetrics);

    if (document.readyState === 'complete') {
      setTimeout(sendMetrics, 0);
    }
  }

  sendPerformanceMetrics() {
    if (!this.consentGiven) {
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
    } catch (error) {
      console.warn('[Analytics] Performance metrics unavailable', error);
    }
  }

  getOrCreateSessionId() {
    const sessionKey = 'analytics_session';
    let session = sessionStorage.getItem(sessionKey);

    if (!session) {
      session = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(sessionKey, session);
    }

    return session;
  }

  async trackPageView() {
    if (!this.consentGiven) {
      return;
    }

    this.pageViewCount++;

    const data = {
      type: 'pageview',
      page: this.currentPage,
      referrer: document.referrer || 'direct',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      utm: this.utmData,
      language: this.language,
      timezone: this.timezone,
      title: document.title,
      screen: this.screenInfo
    };

    await this.sendData(data);
    console.log('[Analytics] Page view tracked:', this.currentPage);
  }

  async endSession() {
    if (!this.consentGiven || this.pageViewCount === 0) {
      return;
    }

    const duration = Date.now() - this.sessionStart;

    const data = {
      type: 'session',
      sessionId: this.sessionId,
      duration,
      pages: this.pageViewCount,
      timestamp: new Date().toISOString()
    };

    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(this.apiEndpoint, blob);
      } catch (error) {
        await this.sendData(data);
      }
    } else {
      await this.sendData(data);
    }

    console.log('[Analytics] Session ended:', duration + 'ms');
  }

  async trackEvent(eventName, eventData = {}) {
    if (!this.consentGiven) {
      return;
    }

    const data = {
      type: 'event',
      eventName,
      eventData,
      sessionId: this.sessionId,
      page: this.currentPage,
      timestamp: new Date().toISOString(),
      language: this.language,
      timezone: this.timezone
    };

    await this.sendData(data);
  }

  trackClicks() {
    if (this.clickListenerAttached) {
      return;
    }

    this.clickListenerAttached = true;

    document.addEventListener('click', (event) => {
      const target = event.target.closest('a, button');
      if (!target) {
        return;
      }

      const isExternal = target.href && !target.href.includes(window.location.hostname);
      const isCTA = target.classList.contains('cta-button') ||
                    target.classList.contains('btn-primary') ||
                    target.closest('.cta-section');

      if (isExternal) {
        this.trackEvent('external_link_click', {
          url: target.href,
          text: target.textContent.trim().substring(0, 50)
        });
      } else if (isCTA) {
        this.trackEvent('cta_click', {
          text: target.textContent.trim().substring(0, 50),
          location: this.currentPage
        });
      }
    });

    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.trackEvent('form_submit', {
        formId: form.id || 'unknown',
        page: this.currentPage
      });
    });
  }

  heartbeat() {
    if (this.consentGiven && !document.hidden) {
      this.trackEvent('heartbeat', {
        activeTime: Date.now() - this.sessionStart
      });
    }
  }

  async sendData(data) {
    try {
      const response = await fetch(this.apiEndpoint, {
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
      console.error('[Analytics] Failed to send data:', error);
    }
  }

  // Public API for manual event tracking
  static trackCustomEvent(eventName, eventData) {
    if (window.customAnalytics) {
      window.customAnalytics.trackEvent(eventName, eventData);
    }
  }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.customAnalytics = new CustomAnalytics();
  });
} else {
  window.customAnalytics = new CustomAnalytics();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomAnalytics;
}
