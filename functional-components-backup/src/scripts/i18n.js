// Simple i18n (internationalization) configuration
// This file manages language detection and switching

const i18n = {
  // Default language
  defaultLang: 'en',
  
  // Supported languages
  languages: {
    en: {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
      dir: '' // Root directory for English
    },
    nl: {
      code: 'nl',
      name: 'Nederlands',
      flag: '🇳🇱',
      dir: 'nl/' // Dutch pages directory
    }
  },

  // Get current language from URL
  getCurrentLang() {
    const path = window.location.pathname;
    if (path.includes('/nl/')) {
      return 'nl';
    }
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

    // Build new URL
    let newPath = window.location.pathname;
    
    if (currentLang === 'en' && targetLang === 'nl') {
      // English to Dutch: add /nl/ to path
      newPath = newPath.replace('/src/', '/src/nl/');
    } else if (currentLang === 'nl' && targetLang === 'en') {
      // Dutch to English: remove /nl/
      newPath = newPath.replace('/nl/', '/');
    }

    // Navigate to new URL
    window.location.href = newPath;
  },

  // Get alternate language URL for SEO
  getAlternateUrl(lang) {
    const currentLang = this.getCurrentLang();
    let path = window.location.pathname;

    if (lang === 'en') {
      // Remove /nl/ from path
      return path.replace('/nl/', '/');
    } else if (lang === 'nl') {
      // Add /nl/ to path
      return path.replace('/', '/nl/');
    }

    return path;
  }
};

// Auto-inject hreflang tags for SEO
function injectHreflangTags() {
  const head = document.head;
  const currentUrl = window.location.origin + window.location.pathname;

  // Add hreflang for each language
  Object.keys(i18n.languages).forEach(lang => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = window.location.origin + i18n.getAlternateUrl(lang);
    head.appendChild(link);
  });

  // Add x-default for international users
  const xDefault = document.createElement('link');
  xDefault.rel = 'alternate';
  xDefault.hreflang = 'x-default';
  xDefault.href = window.location.origin + i18n.getAlternateUrl('en');
  head.appendChild(xDefault);
}

// Initialize on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    injectHreflangTags();
  });
}
