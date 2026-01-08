/**
 * Centralized Page Configuration
 * Single source of truth for all pages, URLs, and sitemap metadata
 * 
 * Used by:
 * - build-i18n.js (URL mappings, page generation, sitemap generation)
 * - build-sitemap.js (standalone sitemap generation - optional)
 */

const domain = 'https://reviveyour.hair';

// Supported languages
const languages = ['en', 'nl', 'de'];
const defaultLanguage = 'en';

/**
 * Main pages (built from templates in src/templates/)
 * 
 * template: filename without extension in src/templates/
 * slugs: URL path for each language (empty string = root/index)
 * priority: sitemap priority (0.0 - 1.0)
 * changefreq: how often the page changes
 */
const pages = [
  {
    template: 'index',
    slugs: { en: '', nl: '', de: '' },
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    template: 'about',
    slugs: { en: 'about', nl: 'over-ons', de: 'uber-uns' },
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    template: 'store',
    slugs: { en: 'store', nl: 'winkel', de: 'shop' },
    priority: '0.9',
    changefreq: 'weekly'
  },
  {
    template: 'contact',
    slugs: { en: 'contact', nl: 'contact', de: 'kontakt' },
    priority: '0.7',
    changefreq: 'monthly'
  },
  {
    template: 'quiz',
    slugs: { en: 'quiz', nl: 'quiz', de: 'quiz' },
    priority: '0.8',
    changefreq: 'weekly'
  }
];

/**
 * Blog pages
 * 
 * These are currently separate HTML files per language in src/blog/
 * The slugs define the URL path under /blog/ (or /nl/blog/, /de/blog/)
 */
const blogPages = [
  {
    // Blog index page
    template: 'index',
    slugs: { en: 'blog', nl: 'blog', de: 'blog' },
    isIndex: true,
    priority: '0.9',
    changefreq: 'weekly'
  },
  {
    // Hair loss guide - same filename for all languages
    template: 'hair-loss-guide',
    slugs: { en: 'hair-loss-guide.html', nl: 'hair-loss-guide.html', de: 'hair-loss-guide.html' },
    priority: '0.9',
    changefreq: 'monthly'
  },
  {
    // Creatine article - different source files per language
    template: 'creatine-hair-loss',
    slugs: { en: 'creatine-hair-loss.html', nl: 'creatine-hair-loss.html', de: 'creatine-hair-loss.html' },
    sourceFiles: {
      en: 'creatine-hair-loss.html',
      nl: 'creatine-hair-loss-nl.html',
      de: 'creatine-hair-loss-de.html'
    },
    priority: '0.7',
    changefreq: 'monthly'
  }
];

/**
 * Legal pages
 * 
 * These use language-specific source files (e.g., privacy-policy-nl.html)
 * but output to the same URL path per language
 */
const legalPages = [
  {
    template: 'privacy-policy',
    slugs: { en: 'privacy-policy.html', nl: 'privacy-policy.html', de: 'privacy-policy.html' },
    priority: '0.3',
    changefreq: 'yearly'
  },
  {
    template: 'terms-of-service',
    slugs: { en: 'terms-of-service.html', nl: 'terms-of-service.html', de: 'terms-of-service.html' },
    priority: '0.3',
    changefreq: 'yearly'
  },
  {
    template: 'cookie-policy',
    slugs: { en: 'cookie-policy.html', nl: 'cookie-policy.html', de: 'cookie-policy.html' },
    priority: '0.3',
    changefreq: 'yearly'
  },
  {
    template: 'disclaimer',
    slugs: { en: 'disclaimer.html', nl: 'disclaimer.html', de: 'disclaimer.html' },
    priority: '0.3',
    changefreq: 'yearly'
  },
  {
    template: 'affiliate-disclosure',
    slugs: { en: 'affiliate-disclosure.html', nl: 'affiliate-disclosure.html', de: 'affiliate-disclosure.html' },
    priority: '0.3',
    changefreq: 'yearly'
  }
];

/**
 * Helper: Get URL mapping for build-i18n.js
 * Returns object in the format expected by build-i18n.js config.urlMappings
 */
function getUrlMappings() {
  const mappings = {};
  
  pages.forEach(page => {
    mappings[page.template] = {
      en: page.slugs.en,
      nl: page.slugs.nl,
      de: page.slugs.de
    };
  });
  
  return mappings;
}

/**
 * Helper: Get all pages formatted for sitemap generation
 * Returns array of objects with en/nl/de URLs, priority, and changefreq
 */
function getSitemapPages() {
  const sitemapEntries = [];
  
  // Main pages
  pages.forEach(page => {
    sitemapEntries.push({
      en: page.slugs.en === '' ? '/' : `/${page.slugs.en}/`,
      nl: page.slugs.nl === '' ? '/nl/' : `/nl/${page.slugs.nl}/`,
      de: page.slugs.de === '' ? '/de/' : `/de/${page.slugs.de}/`,
      priority: page.priority,
      changefreq: page.changefreq
    });
  });
  
  // Blog pages
  blogPages.forEach(page => {
    if (page.isIndex) {
      sitemapEntries.push({
        en: '/blog/',
        nl: '/nl/blog/',
        de: '/de/blog/',
        priority: page.priority,
        changefreq: page.changefreq
      });
    } else {
      sitemapEntries.push({
        en: `/blog/${page.slugs.en}`,
        nl: `/nl/blog/${page.slugs.nl}`,
        de: `/de/blog/${page.slugs.de}`,
        priority: page.priority,
        changefreq: page.changefreq
      });
    }
  });
  
  // Legal pages
  legalPages.forEach(page => {
    sitemapEntries.push({
      en: `/legal/${page.slugs.en}`,
      nl: `/nl/legal/${page.slugs.nl}`,
      de: `/de/legal/${page.slugs.de}`,
      priority: page.priority,
      changefreq: page.changefreq
    });
  });
  
  return sitemapEntries;
}

module.exports = {
  domain,
  languages,
  defaultLanguage,
  pages,
  blogPages,
  legalPages,
  getUrlMappings,
  getSitemapPages
};
