/**
 * Language Detection and Redirect Script
 * 
 * This script runs immediately in <head> to redirect users to their preferred language.
 * It only redirects on first visit - once a user has visited, their choice is saved.
 * 
 * Logic:
 * 1. If user has a saved language preference, respect it (no redirect)
 * 2. If user is already on a language-specific path (/nl/, /de/), save that as preference
 * 3. If first visit to root, check browser language and redirect if we support it
 */
(function() {
  'use strict';
  
  const STORAGE_KEY = 'lang_preference';
  const SUPPORTED_LANGS = ['en', 'nl', 'de'];
  const DEFAULT_LANG = 'en';
  
  // Get current path language
  function getCurrentPathLang() {
    const path = window.location.pathname;
    if (path.startsWith('/nl/') || path === '/nl') return 'nl';
    if (path.startsWith('/de/') || path === '/de') return 'de';
    return 'en';
  }
  
  // Get browser's preferred language
  function getBrowserLang() {
    const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
    return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
  }
  
  // Get saved preference
  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }
  
  // Save preference
  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // localStorage not available
    }
  }
  
  // Convert current URL to target language
  function getRedirectUrl(targetLang) {
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    // Remove current language prefix if any
    let cleanPath = path;
    if (path.startsWith('/nl/')) cleanPath = path.slice(3);
    else if (path.startsWith('/de/')) cleanPath = path.slice(3);
    else if (path === '/nl' || path === '/de') cleanPath = '/';
    
    // Add target language prefix
    let newPath;
    if (targetLang === 'en') {
      newPath = cleanPath || '/';
    } else {
      newPath = '/' + targetLang + (cleanPath === '/' ? '/' : cleanPath);
    }
    
    return newPath + search + hash;
  }
  
  // Main logic
  function init() {
    const currentLang = getCurrentPathLang();
    const savedLang = getSavedLang();
    
    // If user is on a non-English path, save that as their preference
    if (currentLang !== 'en') {
      saveLang(currentLang);
      return; // Already on their language, don't redirect
    }
    
    // If user has a saved preference, check if we need to redirect
    if (savedLang) {
      if (savedLang !== 'en' && currentLang === 'en') {
        // User prefers non-English but is on English site - redirect
        window.location.replace(getRedirectUrl(savedLang));
      }
      return;
    }
    
    // First visit - check browser language
    const browserLang = getBrowserLang();
    
    // Save English preference even if that's what browser says
    // This prevents future checks
    saveLang(browserLang);
    
    // Redirect if browser prefers non-English
    if (browserLang !== 'en') {
      window.location.replace(getRedirectUrl(browserLang));
    }
  }
  
  init();
})();
