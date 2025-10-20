// Simple i18n (internationalization) configuration
// This file manages language detection and switching
// NOTE: Currently being restructured for multi-language template system

const i18n = {
  // Default language
  defaultLang: 'en',
  
  // Supported languages (will be expanded with template system)
  languages: {
    en: {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
      dir: '' // Root directory for English
    }
    // Additional languages will be added via template system
  },

  // Get current language from URL
  getCurrentLang() {
    const path = window.location.pathname;
    // Future: Detect language from URL path (e.g., /nl/, /de/, /fr/)
    // For now, default to English
    return 'en';
  },

  // Get language from localStorage or browser
  getPreferredLang() {
    // Check localStorage first
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.languages[savedLang]) {
      return savedLang;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.languages[browserLang]) {
      return browserLang;
    }

    return this.defaultLang;
  },

  // Save language preference
  setPreferredLang(lang) {
    localStorage.setItem('preferredLanguage', lang);
  },

  // Switch to a different language
  // TODO: Implement once template system is in place
  switchLanguage(targetLang) {
    if (!this.languages[targetLang]) {
      console.error('Language not supported:', targetLang);
      return;
    }

    const currentLang = this.getCurrentLang();
    if (currentLang === targetLang) {
      return; // Already on this language
    }

    // Save preference
    this.setPreferredLang(targetLang);
    
    // TODO: Implement URL switching logic when template system is ready
    console.log('Language switching will be implemented with template system');
  },

  // Get alternate language URL for SEO
  // TODO: Implement when template system is ready
  getAlternateUrl(lang) {
    // For now, only English is supported
    return window.location.pathname;
  }
};

// Auto-inject hreflang tags for SEO
// TODO: Re-enable when multiple languages are implemented
function injectHreflangTags() {
  // Temporarily disabled - will be handled by template system
  // Only add English hreflang for now
  const head = document.head;
  const link = document.createElement('link');
  link.rel = 'alternate';
  link.hreflang = 'en';
  link.href = window.location.origin + window.location.pathname;
  head.appendChild(link);

  // Add x-default
  const xDefault = document.createElement('link');
  xDefault.rel = 'alternate';
  xDefault.hreflang = 'x-default';
  xDefault.href = window.location.origin + window.location.pathname;
  head.appendChild(xDefault);
}

// Initialize on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    injectHreflangTags();
  });
}
