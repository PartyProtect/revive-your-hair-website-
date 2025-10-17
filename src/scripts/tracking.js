// Custom Analytics Tracking Script
// Privacy-friendly, GDPR-compliant visitor tracking

class CustomAnalytics {
  constructor() {
    this.apiEndpoint = '/.netlify/functions/tracking';
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStart = Date.now();
    this.pageViewCount = 0;
    this.currentPage = window.location.pathname;
    this.consentGiven = false;
    
    this.init();
  }

  init() {
    // Check for cookie consent
    this.checkConsent();
    
    // Only track if consent given
    if (!this.consentGiven) {
      console.log('[Analytics] Tracking disabled - no consent');
      return;
    }

    // Track initial page view
    this.trackPageView();

    // Track session end on page unload
    window.addEventListener('beforeunload', () => this.endSession());

    // Track page visibility changes (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { duration: Date.now() - this.sessionStart });
      }
    });

    // Track clicks on important elements
    this.trackClicks();

    // Update session every 30 seconds (heartbeat)
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 30000);
  }

  checkConsent() {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        const consentData = JSON.parse(consent);
        this.consentGiven = consentData.acceptedAll === true;
      }
    } catch (error) {
      console.error('[Analytics] Error checking consent:', error);
    }

    // Listen for consent changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'cookie-consent') {
        this.checkConsent();
        if (this.consentGiven && this.pageViewCount === 0) {
          this.trackPageView();
        }
      }
    });
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
    if (!this.consentGiven) return;

    this.pageViewCount++;
    
    const data = {
      type: 'pageview',
      page: this.currentPage,
      referrer: document.referrer || 'direct',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    await this.sendData(data);
    console.log('[Analytics] Page view tracked:', this.currentPage);
  }

  async endSession() {
    if (!this.consentGiven || this.pageViewCount === 0) return;

    const duration = Date.now() - this.sessionStart;
    
    const data = {
      type: 'session',
      sessionId: this.sessionId,
      duration,
      pages: this.pageViewCount,
      timestamp: new Date().toISOString()
    };

    // Use sendBeacon for reliable tracking on page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(this.apiEndpoint, blob);
    } else {
      await this.sendData(data);
    }

    console.log('[Analytics] Session ended:', duration + 'ms');
  }

  async trackEvent(eventName, eventData = {}) {
    if (!this.consentGiven) return;

    const data = {
      type: 'event',
      eventName,
      eventData,
      sessionId: this.sessionId,
      page: this.currentPage,
      timestamp: new Date().toISOString()
    };

    await this.sendData(data);
    console.log('[Analytics] Event tracked:', eventName, eventData);
  }

  trackClicks() {
    // Track CTA button clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

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

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      this.trackEvent('form_submit', {
        formId: form.id || 'unknown',
        page: this.currentPage
      });
    });
  }

  heartbeat() {
    // Keep session alive - useful for calculating active time
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

      const result = await response.json();
      return result;
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
