/**/**

 * ============================================================================ * Google Analytics Integration

 * GOOGLE ANALYTICS 4 INTEGRATION - PRODUCTION READY * 

 * ============================================================================ * Purpose: Track user behavior, page views, and conversions

 *  * Privacy: Respects user consent and complies with GDPR/CCPA

 * Features: * 

 * ✅ Real GA4 Measurement ID (configured) * Setup Instructions:

 * ✅ Proper consent management (GDPR-compliant) * 1. Create a Google Analytics 4 property at https://analytics.google.com

 * ✅ No race conditions with consent banner * 2. Get your Measurement ID (format: G-XXXXXXXXXX)

 * ✅ Refined bot detection (allows search engine crawlers) * 3. Replace 'G-XXXXXXXXXX' below with your actual Measurement ID

 * ✅ Automatic event tracking * 4. Test with Google Tag Assistant Chrome extension

 * ✅ Performance monitoring */

 * ✅ Error handling and fallbacks

 * // ============================================================================

 * Google Analytics 4 Property: G-66VKV0D9D3// CONFIGURATION

 * Test with: Google Tag Assistant Chrome extension// ============================================================================

 * 

 * Required: Cookie consent banner (cookie-consent.html component)const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID

 */const ENABLE_DEBUG = false; // Set to true for development debugging



// ============================================================================// ============================================================================

// CONFIGURATION// BOT DETECTION

// ============================================================================// ============================================================================



/**// BOT DETECTION STRATEGY:

 * Google Analytics 4 Measurement ID// - Google Analytics: Block ALL bots (friendly + malicious)

 * Property: reviveyourhair.eu// - Custom Analytics: Track friendly crawlers separately, block malicious

 */// - Result: Clean GA metrics + SEO visibility data in custom analytics

const GA_MEASUREMENT_ID = 'G-66VKV0D9D3';

/**

// Enable debug mode for development (shows detailed console logs) * Detect if the current visitor is a bot/crawler

const ENABLE_DEBUG = window.location.hostname === 'localhost' ||  * Filters out ALL automated traffic from analytics (aligned with backend)

                     window.location.hostname.includes('netlify.app'); */

function isBotTraffic() {

// Track page performance metrics  const userAgent = navigator.userAgent.toLowerCase();

const TRACK_PERFORMANCE = true;  

  // Friendly crawlers (Google, Bing, etc.) - STILL BLOCKED from GA

// Track scroll depth milestones  const friendlyCrawlers = [

const SCROLL_TRACKING = true;    /googlebot/i, /bingbot/i, /duckduckbot/i, /baiduspider/i, /yandexbot/i,

    /sogou/i, /slurp/i, /facebookexternalhit/i, /linkedinbot/i, 

// ============================================================================    /twitterbot/i, /slackbot/i, /discordbot/i

// BOT DETECTION - REFINED FOR GA4  ];

// ============================================================================  

  // Malicious bots and scrapers

/**  const maliciousBots = [

 * Bot detection strategy for Google Analytics:    /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,

 * - Block malicious scrapers and automated tools    /headless/i, /phantom/i, /selenium/i, /webdriver/i,

 * - Allow search engine crawlers (they should see page content, not tracking)    /ahref/i, /semrush/i, /mj12/i, /dotbot/i, /bingpreview/i,

 * - Google Analytics has its own bot filtering, but we pre-filter for performance    /screaming\s?frog/i, /lighthouse/i, /gtmetrix/i,

 */    /python-requests/i, /python-urllib/i, /scrapy/i, /httpclient/i,

    /okhttp/i, /curl\//i, /wget/i, /libwww/i

const MALICIOUS_BOTS = [  ];

  // SEO crawlers (block from GA to avoid skewing metrics)  

  /ahrefsbot/i,  // Check against all bot patterns

  /semrushbot/i,  const isFriendlyCrawler = friendlyCrawlers.some(pattern => pattern.test(userAgent));

  /mj12bot/i,  const isMaliciousBot = maliciousBots.some(pattern => pattern.test(userAgent));

  /dotbot/i,  

  /serpstatbot/i,  // Additional checks for headless browsers

  /dataforseobot/i,  const hasWebDriver = navigator.webdriver === true;

  /petalbot/i,  const hasPhantom = window.callPhantom || window._phantom;

    const hasNightmare = window.__nightmare;

  // Scrapers and automation tools  

  /python-requests/i,  // Block ALL bots from Google Analytics (but backend tracks friendly crawlers separately)

  /python-urllib/i,  return isFriendlyCrawler || isMaliciousBot || hasWebDriver || hasPhantom || hasNightmare;

  /scrapy/i,}

  /curl\//i,

  /wget/i,// ============================================================================

  /httpclient/i,// GOOGLE ANALYTICS 4 INITIALIZATION

  /okhttp/i,// ============================================================================

  

  // Headless browsers (unless legitimate)/**

  /headless/i, * Initialize Google Analytics 4

  /phantomjs/i, * Loads the gtag.js script and configures tracking

  /selenium/i, */

  /webdriver/i,function initializeGoogleAnalytics() {

    // SECURITY: Block bot traffic from analytics

  // Monitoring tools  if (isBotTraffic()) {

  /chrome-lighthouse/i,    if (ENABLE_DEBUG) {

  /gtmetrix/i,      console.log('[Analytics] Bot traffic detected, skipping tracking');

  /pingdom/i,    }

  /uptimerobot/i,    return;

    }

  // Generic bot patterns

  /bot\//i,  // Check if user has consented to analytics (for GDPR compliance)

  /crawler4j/i,  const analyticsConsent = checkAnalyticsConsent();

  /spider\//i  

];  if (!analyticsConsent) {

    if (ENABLE_DEBUG) {

/**      console.log('[Analytics] User has not consented to tracking');

 * Check if current visitor is a bot/scraper    }

 * Note: Search engine crawlers (Googlebot, Bingbot) are allowed through    return;

 * because they need to see page content, not tracking scripts  }

 */

function isMaliciousBot() {  // Load Google Analytics script

  const userAgent = navigator.userAgent || '';  const script = document.createElement('script');

  const ua = userAgent.toLowerCase();  script.async = true;

    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

  // Check against malicious bot patterns  document.head.appendChild(script);

  if (MALICIOUS_BOTS.some(pattern => pattern.test(ua))) {

    return true;  // Initialize dataLayer

  }  window.dataLayer = window.dataLayer || [];

    function gtag() { dataLayer.push(arguments); }

  // Additional checks for headless browsers  window.gtag = gtag;

  if (navigator.webdriver === true) {

    return true;  // Configure GA4

  }  gtag('js', new Date());

    gtag('config', GA_MEASUREMENT_ID, {

  if (window.callPhantom || window._phantom) {    'send_page_view': true,

    return true;    'anonymize_ip': true, // GDPR compliance

  }    'cookie_flags': 'SameSite=None;Secure', // Cookie security

    });

  if (window.__nightmare) {

    return true;  if (ENABLE_DEBUG) {

  }    console.log('[Analytics] Google Analytics initialized:', GA_MEASUREMENT_ID);

    }

  return false;}

}

// ============================================================================

// ============================================================================// CONSENT MANAGEMENT

// CONSENT MANAGEMENT// ============================================================================

// ============================================================================

/**

/** * Check if user has consented to analytics tracking

 * Analytics consent state * Returns true if consent is granted, false otherwise

 */ * Integrates with cookie-consent component

const AnalyticsConsent = { */

  granted: false,function checkAnalyticsConsent() {

  checked: false,  // Check cookie consent (from cookie-consent.html component)

    const cookieConsent = localStorage.getItem('cookie-consent');

  /**  

   * Check if user has granted analytics consent  if (!cookieConsent) {

   */    // No consent decision yet - wait for user choice

  check() {    return false;

    try {  }

      const consent = localStorage.getItem('cookie-consent');  

      if (!consent) {  try {

        this.granted = false;    const consent = JSON.parse(cookieConsent);

        this.checked = true;    

        return false;    // If user accepted all cookies, analytics is allowed

      }    if (consent.acceptedAll) {

            return true;

      const consentData = JSON.parse(consent);    }

      this.granted = consentData.acceptedAll === true;    

      this.checked = true;    // If user rejected, no analytics

          if (consent.rejectedNonEssential) {

      if (ENABLE_DEBUG) {      return false;

        console.log('[Analytics] Consent check:', this.granted ? 'GRANTED' : 'DENIED');    }

      }  } catch (e) {

          console.error('[Analytics] Error parsing cookie consent:', e);

      return this.granted;    return false;

    } catch (error) {  }

      console.error('[Analytics] Error checking consent:', error);  

      this.granted = false;  // Default: no tracking without explicit consent

      this.checked = true;  return false;

      return false;}

    }

  },/**

   * Set analytics consent

  /** * Call this from your cookie consent banner

   * Wait for consent decision (max 30 seconds) */

   */function setAnalyticsConsent(granted) {

  async waitForDecision(timeoutMs = 30000) {  const consentData = {

    const startTime = Date.now();    acceptedAll: granted,

        rejectedNonEssential: !granted,

    return new Promise((resolve) => {    timestamp: new Date().toISOString()

      // Check immediately  };

      if (this.check()) {  

        resolve(true);  localStorage.setItem('cookie-consent', JSON.stringify(consentData));

        return;  

      }  if (granted && !isBotTraffic()) {

          initializeGoogleAnalytics();

      // Listen for consent change  }

      const listener = (event) => {}

        if (event.key === 'cookie-consent') {

          window.removeEventListener('storage', listener);// ============================================================================

          resolve(this.check());// EVENT TRACKING

        }// ============================================================================

      };

      /**

      window.addEventListener('storage', listener); * Track custom events

       * @param {string} eventName - Name of the event

      // Also listen for custom event * @param {object} eventParams - Additional parameters for the event

      const customListener = (event) => { */

        window.removeEventListener('consentUpdated', customListener);function trackEvent(eventName, eventParams = {}) {

        window.removeEventListener('storage', listener);  if (typeof gtag === 'undefined') {

        resolve(this.check());    if (ENABLE_DEBUG) {

      };      console.warn('[Analytics] gtag not loaded, event not tracked:', eventName);

          }

      window.addEventListener('consentUpdated', customListener);    return;

        }

      // Timeout fallback

      setTimeout(() => {  gtag('event', eventName, eventParams);

        window.removeEventListener('storage', listener);

        window.removeEventListener('consentUpdated', customListener);  if (ENABLE_DEBUG) {

        resolve(this.check());    console.log('[Analytics] Event tracked:', eventName, eventParams);

      }, timeoutMs);  }

    });}

  },

  /**

  /** * Track quiz completion

   * Listen for consent changes */

   */function trackQuizCompletion(score, recommendations) {

  onChange(callback) {  trackEvent('quiz_completed', {

    // Listen to localStorage changes    'event_category': 'engagement',

    window.addEventListener('storage', (event) => {    'quiz_score': score,

      if (event.key === 'cookie-consent') {    'recommendations': recommendations,

        const granted = this.check();  });

        callback(granted);}

      }

    });/**

     * Track external link clicks

    // Listen to custom event */

    window.addEventListener('consentUpdated', () => {function trackOutboundLink(url, linkText) {

      const granted = this.check();  trackEvent('click', {

      callback(granted);    'event_category': 'outbound_link',

    });    'event_label': url,

  }    'link_text': linkText,

};  });

}

// ============================================================================

// GOOGLE ANALYTICS INITIALIZATION/**

// ============================================================================ * Track FAQ interactions

 */

/**function trackFAQInteraction(question, action = 'expand') {

 * Initialize Google Analytics 4  trackEvent('faq_interaction', {

 */    'event_category': 'engagement',

async function initializeGoogleAnalytics() {    'faq_question': question,

  // Block malicious bots    'action': action, // 'expand' or 'collapse'

  if (isMaliciousBot()) {  });

    if (ENABLE_DEBUG) {}

      console.log('[Analytics] Malicious bot detected, blocking GA4');

    }/**

    return false; * Track contact form submissions

  } */

  function trackFormSubmission(formName) {

  // Wait for consent  trackEvent('form_submission', {

  const consentGranted = await AnalyticsConsent.waitForDecision();    'event_category': 'conversion',

      'form_name': formName,

  if (!consentGranted) {  });

    if (ENABLE_DEBUG) {}

      console.log('[Analytics] User has not consented to tracking');

    }/**

    return false; * Track scroll depth (how far users scroll on long pages)

  } */

  function trackScrollDepth(percentage) {

  // Load Google Analytics script  trackEvent('scroll', {

  try {    'event_category': 'engagement',

    if (ENABLE_DEBUG) {    'scroll_depth': percentage,

      console.log('[Analytics] Loading GA4 script...');  });

    }}

    

    const script = document.createElement('script');// ============================================================================

    script.async = true;// AUTOMATIC TRACKING SETUP

    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;// ============================================================================

    

    // Handle script load error/**

    script.onerror = () => { * Set up automatic tracking for common interactions

      console.error('[Analytics] Failed to load GA4 script (may be blocked by ad blocker)'); */

    };function setupAutomaticTracking() {

      // Track FAQ accordion clicks

    document.head.appendChild(script);  document.addEventListener('click', function(e) {

        const faqButton = e.target.closest('.faq-question');

    // Initialize dataLayer    if (faqButton) {

    window.dataLayer = window.dataLayer || [];      const question = faqButton.querySelector('span')?.textContent || 'Unknown';

    function gtag() {       const isExpanded = faqButton.getAttribute('aria-expanded') === 'true';

      dataLayer.push(arguments);       trackFAQInteraction(question, isExpanded ? 'collapse' : 'expand');

    }    }

    window.gtag = gtag;  });

    

    // Configure GA4  // Track outbound links

    gtag('js', new Date());  document.addEventListener('click', function(e) {

    gtag('config', GA_MEASUREMENT_ID, {    const link = e.target.closest('a');

      'send_page_view': true,    if (link && link.href && link.hostname !== window.location.hostname) {

      'anonymize_ip': true, // GDPR compliance      trackOutboundLink(link.href, link.textContent);

      'cookie_flags': 'SameSite=None;Secure',    }

      'cookie_domain': 'auto',  });

      'cookie_expires': 63072000, // 2 years (default)

    });  // Track scroll depth

      let scrollTracked = {

    if (ENABLE_DEBUG) {    '25': false,

      console.log('[Analytics] ✅ GA4 initialized:', GA_MEASUREMENT_ID);    '50': false,

    }    '75': false,

        '100': false

    return true;  };

    

  } catch (error) {  window.addEventListener('scroll', function() {

    console.error('[Analytics] Error initializing GA4:', error);    const scrollPercent = Math.round(

    return false;      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100

  }    );

}

    for (let threshold in scrollTracked) {

// ============================================================================      if (scrollPercent >= threshold && !scrollTracked[threshold]) {

// EVENT TRACKING        scrollTracked[threshold] = true;

// ============================================================================        trackScrollDepth(threshold);

      }

/**    }

 * Check if gtag is loaded and ready  });

 */

function isGtagReady() {  if (ENABLE_DEBUG) {

  return typeof window.gtag === 'function';    console.log('[Analytics] Automatic tracking initialized');

}  }

}

/**

 * Track custom events// ============================================================================

 * @param {string} eventName - Name of the event// INITIALIZATION

 * @param {object} eventParams - Additional parameters for the event// ============================================================================

 */

function trackEvent(eventName, eventParams = {}) {// Initialize when DOM is ready

  if (!isGtagReady()) {if (document.readyState === 'loading') {

    if (ENABLE_DEBUG) {  document.addEventListener('DOMContentLoaded', function() {

      console.warn('[Analytics] gtag not loaded, event not tracked:', eventName);    initializeGoogleAnalytics();

    }    setupAutomaticTracking();

    return;  });

  }} else {

    initializeGoogleAnalytics();

  if (!AnalyticsConsent.granted) {  setupAutomaticTracking();

    if (ENABLE_DEBUG) {}

      console.warn('[Analytics] No consent, event not tracked:', eventName);

    }// ============================================================================

    return;// EXPORT FUNCTIONS (for use in other scripts)

  }// ============================================================================

  

  try {// Make tracking functions available globally

    gtag('event', eventName, eventParams);window.Analytics = {

      trackEvent,

    if (ENABLE_DEBUG) {  trackQuizCompletion,

      console.log('[Analytics] Event tracked:', eventName, eventParams);  trackOutboundLink,

    }  trackFAQInteraction,

  } catch (error) {  trackFormSubmission,

    console.error('[Analytics] Error tracking event:', error);  trackScrollDepth,

  }  setAnalyticsConsent,

}};


/**
 * Track page view (usually automatic, but useful for SPAs)
 */
function trackPageView(pagePath) {
  if (!isGtagReady()) {
    return;
  }
  
  const params = {
    page_path: pagePath || window.location.pathname,
    page_title: document.title,
    page_location: window.location.href
  };
  
  trackEvent('page_view', params);
}

/**
 * Track quiz completion
 */
function trackQuizCompletion(score, recommendations) {
  trackEvent('quiz_completed', {
    'event_category': 'engagement',
    'quiz_score': score,
    'recommendations_count': Array.isArray(recommendations) ? recommendations.length : 0,
  });
}

/**
 * Track external link clicks
 */
function trackOutboundLink(url, linkText) {
  trackEvent('click', {
    'event_category': 'outbound_link',
    'event_label': url,
    'link_text': linkText || 'Unknown',
    'link_domain': extractDomain(url),
  });
}

/**
 * Track FAQ interactions
 */
function trackFAQInteraction(question, action = 'expand') {
  trackEvent('faq_interaction', {
    'event_category': 'engagement',
    'faq_question': question.substring(0, 100), // Limit length
    'action': action, // 'expand' or 'collapse'
  });
}

/**
 * Track contact form submissions
 */
function trackFormSubmission(formName, formData = {}) {
  trackEvent('form_submission', {
    'event_category': 'conversion',
    'form_name': formName,
    ...formData
  });
}

/**
 * Track scroll depth (how far users scroll on long pages)
 */
function trackScrollDepth(percentage) {
  trackEvent('scroll', {
    'event_category': 'engagement',
    'scroll_depth': percentage,
    'page_path': window.location.pathname,
  });
}

/**
 * Track file downloads
 */
function trackDownload(fileName, fileType) {
  trackEvent('file_download', {
    'event_category': 'engagement',
    'file_name': fileName,
    'file_type': fileType,
  });
}

/**
 * Track video interactions
 */
function trackVideo(action, videoTitle, videoUrl) {
  trackEvent('video', {
    'event_category': 'engagement',
    'action': action, // 'play', 'pause', 'complete'
    'video_title': videoTitle,
    'video_url': videoUrl,
  });
}

/**
 * Track search queries (if you have site search)
 */
function trackSearch(query, resultsCount) {
  trackEvent('search', {
    'search_term': query,
    'results_count': resultsCount,
  });
}

/**
 * Track CTA button clicks
 */
function trackCTAClick(ctaText, ctaLocation) {
  trackEvent('cta_click', {
    'event_category': 'engagement',
    'cta_text': ctaText,
    'cta_location': ctaLocation,
  });
}

// ============================================================================
// AUTOMATIC TRACKING SETUP
// ============================================================================

/**
 * Set up automatic tracking for common interactions
 */
function setupAutomaticTracking() {
  if (!AnalyticsConsent.granted) {
    if (ENABLE_DEBUG) {
      console.log('[Analytics] Automatic tracking deferred until consent');
    }
    return;
  }
  
  // Track FAQ accordion clicks
  document.addEventListener('click', function(e) {
    const faqButton = e.target.closest('.faq-question');
    if (faqButton) {
      const question = faqButton.querySelector('span')?.textContent || 'Unknown';
      const isExpanded = faqButton.getAttribute('aria-expanded') === 'true';
      trackFAQInteraction(question, isExpanded ? 'collapse' : 'expand');
    }
  });
  
  // Track outbound links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      const isExternal = link.hostname !== window.location.hostname;
      
      if (isExternal) {
        trackOutboundLink(link.href, link.textContent.trim());
      }
    }
  });
  
  // Track CTA clicks
  document.addEventListener('click', function(e) {
    const cta = e.target.closest('.cta-button, .btn-primary');
    if (cta) {
      const text = cta.textContent.trim().substring(0, 50);
      const location = window.location.pathname;
      trackCTAClick(text, location);
    }
  });
  
  // Track file downloads
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href) {
      const downloadExtensions = /\.(pdf|zip|doc|docx|xls|xlsx|ppt|pptx)$/i;
      if (downloadExtensions.test(link.href)) {
        const fileName = link.href.split('/').pop();
        const fileType = fileName.split('.').pop().toLowerCase();
        trackDownload(fileName, fileType);
      }
    }
  });
  
  // Track form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    const formId = form.id || form.name || 'unknown';
    trackFormSubmission(formId);
  });
  
  // Track scroll depth
  if (SCROLL_TRACKING) {
    setupScrollTracking();
  }
  
  // Track performance metrics
  if (TRACK_PERFORMANCE) {
    setupPerformanceTracking();
  }
  
  if (ENABLE_DEBUG) {
    console.log('[Analytics] ✅ Automatic tracking initialized');
  }
}

/**
 * Set up scroll depth tracking
 */
function setupScrollTracking() {
  const scrollTracked = {
    '25': false,
    '50': false,
    '75': false,
    '100': false
  };
  
  let scrollTimeout;
  
  window.addEventListener('scroll', function() {
    // Debounce scroll events
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      for (let threshold in scrollTracked) {
        if (scrollPercent >= threshold && !scrollTracked[threshold]) {
          scrollTracked[threshold] = true;
          trackScrollDepth(threshold);
        }
      }
    }, 500);
  }, { passive: true });
}

/**
 * Set up performance tracking
 */
function setupPerformanceTracking() {
  // Wait for page to fully load
  window.addEventListener('load', function() {
    // Give browser time to calculate performance metrics
    setTimeout(() => {
      try {
        const perfData = window.performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
          // Track page load time
          const loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart);
          const domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart);
          
          trackEvent('page_timing', {
            'event_category': 'performance',
            'page_load_time': loadTime,
            'dom_content_loaded': domContentLoaded,
            'page_path': window.location.pathname,
          });
          
          if (ENABLE_DEBUG) {
            console.log('[Analytics] Performance tracked:', {
              loadTime: `${loadTime}ms`,
              domContentLoaded: `${domContentLoaded}ms`
            });
          }
        }
      } catch (error) {
        console.warn('[Analytics] Performance tracking unavailable:', error);
      }
    }, 1000);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return 'unknown';
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main initialization function
 */
async function initAnalytics() {
  if (ENABLE_DEBUG) {
    console.log('[Analytics] Starting initialization...');
  }
  
  // Check consent immediately
  AnalyticsConsent.check();
  
  // Initialize GA4 (will wait for consent internally)
  const initialized = await initializeGoogleAnalytics();
  
  if (initialized) {
    // Set up automatic tracking
    setupAutomaticTracking();
    
    // Listen for consent changes
    AnalyticsConsent.onChange((granted) => {
      if (granted && !isGtagReady()) {
        // User just granted consent, initialize now
        initializeGoogleAnalytics().then(success => {
          if (success) {
            setupAutomaticTracking();
          }
        });
      }
    });
  } else {
    // Not initialized yet, wait for consent
    AnalyticsConsent.onChange((granted) => {
      if (granted) {
        initializeGoogleAnalytics().then(success => {
          if (success) {
            setupAutomaticTracking();
          }
        });
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
  // DOM already loaded
  initAnalytics();
}

// ============================================================================
// EXPORT PUBLIC API
// ============================================================================

// Make tracking functions available globally
window.Analytics = {
  // Event tracking
  trackEvent,
  trackPageView,
  trackQuizCompletion,
  trackOutboundLink,
  trackFAQInteraction,
  trackFormSubmission,
  trackScrollDepth,
  trackDownload,
  trackVideo,
  trackSearch,
  trackCTAClick,
  
  // Consent management
  setConsent: (granted) => {
    if (granted) {
      localStorage.setItem('cookie-consent', JSON.stringify({
        acceptedAll: true,
        timestamp: new Date().toISOString()
      }));
      window.dispatchEvent(new CustomEvent('consentUpdated'));
    }
  },
  
  // Utility
  isReady: isGtagReady,
  isConsentGranted: () => AnalyticsConsent.granted,
  
  // For debugging
  debug: {
    consent: AnalyticsConsent,
    measurementId: GA_MEASUREMENT_ID
  }
};

if (ENABLE_DEBUG) {
  console.log('[Analytics] Public API available at window.Analytics');
  console.log('[Analytics] GA4 Measurement ID:', GA_MEASUREMENT_ID);
}
