/**
 * Simple i18n Build Script
 * Generates localized HTML pages from templates and translation files
 * 
 * Usage: node build-i18n.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  templatesDir: './src/templates',
  i18nDir: './src/i18n',
  outputDir: './src',
  languages: ['en', 'nl'], // Add more: 'de', 'fr', 'es', etc.
  
  // Map template names to localized URLs
  urlMappings: {
    'about': {
      en: 'about',
      nl: 'over-ons',
      de: 'uber-uns',     // Future
      fr: 'a-propos'      // Future
    }
  }
};

/**
 * Load translation file for a language
 */
function loadTranslations(lang) {
  const filePath = path.join(config.i18nDir, `${lang}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Replace translation keys in HTML with actual translations
 * Example: {{t.hero.title}} -> "Welcome to Our Site"
 */
function replaceTranslations(html, translations) {
  return html.replace(/\{\{t\.([a-zA-Z0-9_.]+)\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], translations);
    return value || match; // Return original if translation not found
  });
}

/**
 * Replace metadata tags (title, description, canonical, hreflang)
 */
function replaceMetadata(html, lang, pageName, translations) {
  const domain = 'https://www.reviveyourhair.eu';
  const urlSlug = config.urlMappings[pageName]?.[lang] || pageName;
  const langPath = lang === 'en' ? '' : `/${lang}`;
  const canonicalUrl = `${domain}${langPath}/${urlSlug}`;
  
  // Replace lang attribute
  html = html.replace(/lang="[^"]*"/, `lang="${lang}"`);
  
  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${canonicalUrl}">`
  );
  
  // Generate hreflang tags
  let hreflangTags = '';
  config.languages.forEach(l => {
    const lSlug = config.urlMappings[pageName]?.[l] || pageName;
    const lPath = l === 'en' ? '' : `/${l}`;
    hreflangTags += `  <link rel="alternate" hreflang="${l}" href="${domain}${lPath}/${lSlug}">\n`;
  });
  
  // Replace hreflang section
  html = html.replace(
    /<!-- SEO -->[\s\S]*?<!-- Open Graph -->/,
    `<!-- SEO -->\n${hreflangTags}\n  <!-- Open Graph -->`
  );
  
  return html;
}

/**
 * Build a single page for a specific language
 */
function buildPage(templateName, lang) {
  console.log(`Building ${templateName} for ${lang}...`);
  
  // Load template
  const templatePath = path.join(config.templatesDir, `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');
  
  // Load translations
  const translations = loadTranslations(lang);
  
  // Replace translation keys
  html = replaceTranslations(html, translations);
  
  // Replace metadata
  html = replaceMetadata(html, lang, templateName, translations);
  
  // Determine output path
  const urlSlug = config.urlMappings[templateName]?.[lang] || templateName;
  const outputPath = lang === 'en' 
    ? path.join(config.outputDir, `${urlSlug}.html`)
    : path.join(config.outputDir, lang, `${urlSlug}.html`);
  
  // Create directory if needed
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`✓ Generated: ${outputPath}`);
}

/**
 * Build all pages for all languages
 */
function buildAll() {
  console.log('🌍 Building multilingual site...\n');
  
  // Get all template files
  const templates = fs.readdirSync(config.templatesDir)
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace('.html', ''));
  
  // Build each template for each language
  templates.forEach(template => {
    config.languages.forEach(lang => {
      buildPage(template, lang);
    });
  });
  
  console.log('\n✅ Build complete!');
}

// Run build
buildAll();
