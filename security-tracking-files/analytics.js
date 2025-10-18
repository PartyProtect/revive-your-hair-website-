/**
 * Google Analytics Integration
 * 
 * Purpose: Track user behavior, page views, and conversions
 * Privacy: Respects user consent and complies with GDPR/CCPA
 * 
 * Setup Instructions:
 * 1. Create a Google Analytics 4 property at https://analytics.google.com
 * 2. Get your Measurement ID (format: G-XXXXXXXXXX)
 * 3. Replace 'G-XXXXXXXXXX' below with your actual Measurement ID
 * 4. Test with Google Tag Assistant Chrome extension
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID
const ENABLE_DEBUG = false; // Set to true for development debugging

// ============================================================================
// BOT DETECTION
// ============================================================================

/**
 * Detect if the current visitor is a bot/crawler
 * Filters out automated traffic from analytics
 */
function isBotTraffic() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Common bot patterns
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
    /headless/i, /phantom/i, /selenium/i, /webdriver/i,
    /ahref/i, /semrush/i, /mj12/i, /dotbot/i, /bingpreview/i,
    /screaming\s?frog/i, /lighthouse/i, /gtmetrix/i
  ];
  
  // Check user agent against bot patterns
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  // Additional checks for headless browsers
  const hasWebDriver = navigator.webdriver === true;
  const hasPhantom = window.callPhantom || window._phantom;
  const hasNightmare = window.__nightmare;
  
  return isBot || hasWebDriver || hasPhantom || hasNightmare;
}

// ============================================================================
// GOOGLE ANALYTICS 4 INITIALIZATION
// ============================================================================

/**
 * Initialize Google Analytics 4
 * Loads the gtag.js script and configures tracking
 */
function initializeGoogleAnalytics() {
  // SECURITY: Block bot traffic from analytics
  if (isBotTraffic()) {
    if (ENABLE_DEBUG) {
      console.log('[Analytics] Bot traffic detected, skipping tracking');
    }
    return;
  }

  // Check if user has consented to analytics (for GDPR compliance)
  const analyticsConsent = checkAnalyticsConsent();
  
  if (!analyticsConsent) {
    if (ENABLE_DEBUG) {
      console.log('[Analytics] User has not consented to tracking');
    }
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // Configure GA4
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'send_page_view': true,
    'anonymize_ip': true, // GDPR compliance
    'cookie_flags': 'SameSite=None;Secure', // Cookie security
  });

  if (ENABLE_DEBUG) {
    console.log('[Analytics] Google Analytics initialized:', GA_MEASUREMENT_ID);
  }
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Check if user has consented to analytics tracking
 * Returns true if consent is granted, false otherwise
 * Integrates with cookie-consent component
 */
function checkAnalyticsConsent() {
  // Check cookie consent (from cookie-consent.html component)
  const cookieConsent = localStorage.getItem('cookie-consent');
  
  if (!cookieConsent) {
    // No consent decision yet - wait for user choice
    return false;
  }
  
  try {
    const consent = JSON.parse(cookieConsent);
    
    // If user accepted all cookies, analytics is allowed
    if (consent.acceptedAll) {
      return true;
    }
    
    // If user rejected, no analytics
    if (consent.rejectedNonEssential) {
      return false;
    }
  } catch (e) {
    console.error('[Analytics] Error parsing cookie consent:', e);
    return false;
  }
  
  // Default: no tracking without explicit consent
  return false;
}

/**
 * Set analytics consent
 * Call this from your cookie consent banner
 */
function setAnalyticsConsent(granted) {
  const consentData = {
    acceptedAll: granted,
    rejectedNonEssential: !granted,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('cookie-consent', JSON.stringify(consentData));
  
  if (granted && !isBotTraffic()) {
    initializeGoogleAnalytics();
  }
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track custom events
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Additional parameters for the event
 */
function trackEvent(eventName, eventParams = {}) {
  if (typeof gtag === 'undefined') {
    if (ENABLE_DEBUG) {
      console.warn('[Analytics] gtag not loaded, event not tracked:', eventName);
    }
    return;
  }

  gtag('event', eventName, eventParams);

  if (ENABLE_DEBUG) {
    console.log('[Analytics] Event tracked:', eventName, eventParams);
  }
}

/**
 * Track quiz completion
 */
function trackQuizCompletion(score, recommendations) {
  trackEvent('quiz_completed', {
    'event_category': 'engagement',
    'quiz_score': score,
    'recommendations': recommendations,
  });
}

/**
 * Track external link clicks
 */
function trackOutboundLink(url, linkText) {
  trackEvent('click', {
    'event_category': 'outbound_link',
    'event_label': url,
    'link_text': linkText,
  });
}

/**
 * Track FAQ interactions
 */
function trackFAQInteraction(question, action = 'expand') {
  trackEvent('faq_interaction', {
    'event_category': 'engagement',
    'faq_question': question,
    'action': action, // 'expand' or 'collapse'
  });
}

/**
 * Track contact form submissions
 */
function trackFormSubmission(formName) {
  trackEvent('form_submission', {
    'event_category': 'conversion',
    'form_name': formName,
  });
}

/**
 * Track scroll depth (how far users scroll on long pages)
 */
function trackScrollDepth(percentage) {
  trackEvent('scroll', {
    'event_category': 'engagement',
    'scroll_depth': percentage,
  });
}

// ============================================================================
// AUTOMATIC TRACKING SETUP
// ============================================================================

/**
 * Set up automatic tracking for common interactions
 */
function setupAutomaticTracking() {
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
    if (link && link.href && link.hostname !== window.location.hostname) {
      trackOutboundLink(link.href, link.textContent);
    }
  });

  // Track scroll depth
  let scrollTracked = {
    '25': false,
    '50': false,
    '75': false,
    '100': false
  };

  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    for (let threshold in scrollTracked) {
      if (scrollPercent >= threshold && !scrollTracked[threshold]) {
        scrollTracked[threshold] = true;
        trackScrollDepth(threshold);
      }
    }
  });

  if (ENABLE_DEBUG) {
    console.log('[Analytics] Automatic tracking initialized');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initializeGoogleAnalytics();
    setupAutomaticTracking();
  });
} else {
  initializeGoogleAnalytics();
  setupAutomaticTracking();
}

// ============================================================================
// EXPORT FUNCTIONS (for use in other scripts)
// ============================================================================

// Make tracking functions available globally
window.Analytics = {
  trackEvent,
  trackQuizCompletion,
  trackOutboundLink,
  trackFAQInteraction,
  trackFormSubmission,
  trackScrollDepth,
  setAnalyticsConsent,
};
