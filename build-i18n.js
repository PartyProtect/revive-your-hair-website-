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
  outputDir: './dist',
  languages: ['en', 'nl'], // Add more: 'de', 'fr', 'es', etc.
  
  // Map template names to localized URLs
  urlMappings: {
    'index': {
      en: '',  // Root path for English
      nl: ''   // Root path for Dutch
    },
    'about': {
      en: 'about',
      nl: 'over-ons'
    },
    'contact': {
      en: 'contact',
      nl: 'contact'
    },
    'store': {
      en: 'store',
      nl: 'winkel'
    },
    'quiz': {
      en: 'quiz',
      nl: 'quiz'
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
  const urlSlug = config.urlMappings[templateName]?.[lang];
  let outputPath;
  
  if (urlSlug === '') {
    // Root page (index)
    outputPath = path.join(config.outputDir, lang, 'index.html');
  } else {
    // Other pages
    outputPath = path.join(config.outputDir, lang, urlSlug, 'index.html');
  }
  
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
  
  // Copy assets
  console.log('\nCopying assets...');
  const assetFolders = ['scripts', 'styles', 'components', 'images', 'fonts'];
  
  assetFolders.forEach(folder => {
    const srcPath = path.join('./src', folder);
    const destPath = path.join(config.outputDir, folder);
    
    if (fs.existsSync(srcPath)) {
      copyDirectory(srcPath, destPath);
      console.log(`✓ Copied ${folder}/`);
    }
  });
  
  // Copy legal folder
  console.log('\nCopying legal pages...');
  const legalSrc = './src/legal';
  const legalDest = path.join(config.outputDir, 'legal');
  
  if (fs.existsSync(legalSrc)) {
    copyDirectory(legalSrc, legalDest);
    console.log(`✓ Copied legal/`);
  }
  
  // Copy blog folder to each language
  console.log('\nCopying blog...');
  config.languages.forEach(lang => {
    const blogSrc = './src/blog';
    const blogDest = path.join(config.outputDir, lang, 'blog');
    
    if (fs.existsSync(blogSrc)) {
      copyDirectory(blogSrc, blogDest);
      console.log(`✓ Copied blog/ to ${lang}/blog/`);
    }
  });
  
  console.log('\n✅ Build complete!');
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run build
buildAll();
