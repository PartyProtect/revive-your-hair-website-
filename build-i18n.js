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
  defaultLanguage: 'en',
  
  // Map template names to localized URLs
  urlMappings: {
    'index': {
      en: '',  // Root path for English (no /en/)
      nl: ''   // Root path for Dutch (/nl/)
    },
    'about': {
      en: 'about',      // /about/
      nl: 'over-ons'    // /nl/over-ons/
    },
    'contact': {
      en: 'contact',    // /contact/
      nl: 'contact'     // /nl/contact/
    },
    'store': {
      en: 'store',      // /store/
      nl: 'winkel'      // /nl/winkel/
    },
    'quiz': {
      en: 'quiz',       // /quiz/
      nl: 'quiz'        // /nl/quiz/
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
 * Triple braces {{{...}}} are for HTML content (not escaped)
 */
function replaceTranslations(html, translations) {
  // First replace triple braces (HTML content) 
  html = html.replace(/\{\{\{t\.([a-zA-Z0-9_.]+)\}\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], translations);
    return value !== undefined ? value : match; // Return original if translation not found
  });
  
  // Then replace double braces (escaped content)
  html = html.replace(/\{\{t\.([a-zA-Z0-9_.]+)\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], translations);
    return value !== undefined ? value : match; // Return original if translation not found
  });
  
  return html;
}

/**
 * Replace metadata tags (title, description, canonical, hreflang)
 */
function replaceMetadata(html, lang, pageName, translations) {
  const domain = 'https://revive-your-hair.com';
  const urlSlug = config.urlMappings[pageName]?.[lang] !== undefined 
    ? config.urlMappings[pageName][lang] 
    : pageName;
  
  // English at root, other languages in subdirectories
  const langPath = lang === config.defaultLanguage ? '' : `/${lang}`;
  
  // Build URL correctly
  let fullPath;
  if (urlSlug === '') {
    // Homepage
    fullPath = langPath || '/';
  } else {
    fullPath = `${langPath}/${urlSlug}`;
  }
  const canonicalUrl = `${domain}${fullPath}`.replace(/([^:]\/)\/+/g, '$1');
  
  // Replace lang attribute
  html = html.replace(/lang="[^"]*"/, `lang="${lang}"`);
  
  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${canonicalUrl}">`
  );
  
  // Replace og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonicalUrl}">`
  );
  
  // Generate hreflang tags with x-default
  let hreflangTags = '';
  
  // Add x-default (default to English)
  const defaultSlug = config.urlMappings[pageName]?.[config.defaultLanguage] !== undefined
    ? config.urlMappings[pageName][config.defaultLanguage]
    : pageName;
  let defaultPath = defaultSlug === '' ? '/' : `/${defaultSlug}`;
  const defaultUrl = `${domain}${defaultPath}`.replace(/([^:]\/)\/+/g, '$1');
  hreflangTags += `  <link rel="alternate" hreflang="x-default" href="${defaultUrl}">\n`;
  
  // Add all language versions
  config.languages.forEach(l => {
    const lSlug = config.urlMappings[pageName]?.[l] !== undefined
      ? config.urlMappings[pageName][l]
      : pageName;
    const lPath = l === config.defaultLanguage ? '' : `/${l}`;
    let lFullPath;
    if (lSlug === '') {
      lFullPath = lPath || '/';
    } else {
      lFullPath = `${lPath}/${lSlug}`;
    }
    const lUrl = `${domain}${lFullPath}`.replace(/([^:]\/)\/+/g, '$1');
    hreflangTags += `  <link rel="alternate" hreflang="${l}" href="${lUrl}">\n`;
  });
  
  // Replace hreflang section
  html = html.replace(
    /<!-- SEO -->[\s\S]*?<!-- Open Graph -->/,
    `<!-- SEO -->\n${hreflangTags}\n  <!-- Open Graph -->`
  );
  
  // Add Open Graph locale tags
  const ogLocale = lang === 'nl' ? 'nl_NL' : 'en_US';
  const alternateLocale = lang === 'nl' ? 'en_US' : 'nl_NL';
  
  // Add or update og:locale
  if (html.includes('og:locale')) {
    html = html.replace(
      /<meta property="og:locale" content="[^"]*">/,
      `<meta property="og:locale" content="${ogLocale}">`
    );
  } else {
    html = html.replace(
      /(<meta property="og:site_name"[^>]*>)/,
      `$1\n  <meta property="og:locale" content="${ogLocale}">`
    );
  }
  
  // Add og:locale:alternate
  if (!html.includes('og:locale:alternate')) {
    html = html.replace(
      /(<meta property="og:locale"[^>]*>)/,
      `$1\n  <meta property="og:locale:alternate" content="${alternateLocale}">`
    );
  }
  
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
  
  // Replace language-specific paths in content
  // For English (default): /en/ → /
  // For Dutch: /en/ → /nl/
  if (lang === config.defaultLanguage) {
    // English: Remove /en/ prefix, use root paths
    html = html.replace(/href="\/en\/"/g, 'href="/"');
    html = html.replace(/href="\/en\/blog\/"/g, 'href="/blog/"');
    html = html.replace(/href="\/en\/about\/"/g, 'href="/about/"');
    html = html.replace(/href="\/en\/contact\/"/g, 'href="/contact/"');
    html = html.replace(/href="\/en\/store\/"/g, 'href="/store/"');
    html = html.replace(/href="\/en\/quiz\/"/g, 'href="/quiz/"');
    html = html.replace(/href="\/en\/legal\//g, 'href="/legal/');
    html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/blog/hair-loss-guide.html"');
  } else if (lang === 'nl') {
    // Dutch: Replace /en/ with /nl/
    html = html.replace(/href="\/en\/"/g, 'href="/nl/"');
    html = html.replace(/href="\/en\/blog\/"/g, 'href="/nl/blog/"');
    html = html.replace(/href="\/en\/about\/"/g, 'href="/nl/over-ons/"');
    html = html.replace(/href="\/en\/contact\/"/g, 'href="/nl/contact/"');
    html = html.replace(/href="\/en\/store\/"/g, 'href="/nl/winkel/"');
    html = html.replace(/href="\/en\/quiz\/"/g, 'href="/nl/quiz/"');
    html = html.replace(/href="\/en\/legal\//g, 'href="/nl/legal/');
    html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/nl/blog/hair-loss-guide.html"');
  }
  
  // Replace metadata
  html = replaceMetadata(html, lang, templateName, translations);
  
  // Determine output path
  const urlSlug = config.urlMappings[templateName]?.[lang];
  let outputPath;
  
  if (lang === config.defaultLanguage) {
    // English at root level
    if (urlSlug === '') {
      // Root page (index)
      outputPath = path.join(config.outputDir, 'index.html');
    } else {
      // Other pages at root level
      outputPath = path.join(config.outputDir, urlSlug, 'index.html');
    }
  } else {
    // Other languages in subdirectories
    if (urlSlug === '') {
      // Root page (index)
      outputPath = path.join(config.outputDir, lang, 'index.html');
    } else {
      // Other pages
      outputPath = path.join(config.outputDir, lang, urlSlug, 'index.html');
    }
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
 * Process components for a specific language
 */
function processComponents(lang) {
  const componentsSrc = './src/components';
  const componentsDest = lang === config.defaultLanguage 
    ? path.join(config.outputDir, 'components')
    : path.join(config.outputDir, lang, 'components');
  
  if (!fs.existsSync(componentsSrc)) return;
  
  // Create destination directory
  if (!fs.existsSync(componentsDest)) {
    fs.mkdirSync(componentsDest, { recursive: true });
  }
  
  // Load translations for this language
  const translations = loadTranslations(lang);
  
  // Process each component file
  const processComponentDir = (srcDir, destDir) => {
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        processComponentDir(srcPath, destPath);
      } else if (entry.name.endsWith('.html')) {
        // Process HTML component files
        let html = fs.readFileSync(srcPath, 'utf8');
        
        // Replace translations
        html = replaceTranslations(html, translations);
        
        // Replace language-specific paths
        if (lang === config.defaultLanguage) {
          // English: Remove /en/ to make root-level paths
          html = html.replace(/href="\/en\/"/g, 'href="/"');
          html = html.replace(/href="\/en\/blog\/"/g, 'href="/blog/"');
          html = html.replace(/href="\/en\/about\/"/g, 'href="/about/"');
          html = html.replace(/href="\/en\/contact\/"/g, 'href="/contact/"');
          html = html.replace(/href="\/en\/store\/"/g, 'href="/store/"');
          html = html.replace(/href="\/en\/quiz\/"/g, 'href="/quiz/"');
          html = html.replace(/href="\/en\/legal\//g, 'href="/legal/');
          html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/blog/hair-loss-guide.html"');
        } else if (lang === 'nl') {
          // Dutch: Replace /en/ with /nl/ and adjust page paths
          html = html.replace(/href="\/en\/"/g, 'href="/nl/"');
          html = html.replace(/href="\/en\/blog\/"/g, 'href="/nl/blog/"');
          html = html.replace(/href="\/en\/about\/"/g, 'href="/nl/over-ons/"');
          html = html.replace(/href="\/en\/contact\/"/g, 'href="/nl/contact/"');
          html = html.replace(/href="\/en\/store\/"/g, 'href="/nl/winkel/"');
          html = html.replace(/href="\/en\/quiz\/"/g, 'href="/nl/quiz/"');
          html = html.replace(/href="\/en\/legal\//g, 'href="/nl/legal/');
          html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/nl/blog/hair-loss-guide.html"');
        }
        
        fs.writeFileSync(destPath, html, 'utf8');
      } else {
        // Copy other files as-is
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  processComponentDir(componentsSrc, componentsDest);
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
  
  // Copy and process components for each language
  console.log('\nProcessing components for each language...');
  config.languages.forEach(lang => {
    processComponents(lang);
    console.log(`✓ Processed components/ for ${lang}`);
  });
  
  // Copy shared assets
  console.log('\nCopying shared assets...');
  const assetFolders = ['scripts', 'styles', 'images', 'fonts'];
  
  assetFolders.forEach(folder => {
    const srcPath = path.join('./src', folder);
    const destPath = path.join(config.outputDir, folder);
    
    if (fs.existsSync(srcPath)) {
      copyDirectory(srcPath, destPath);
      console.log(`✓ Copied ${folder}/`);
    }
  });
  
  // Copy legal pages to each language
  console.log('\nCopying legal pages...');
  config.languages.forEach(lang => {
    const legalSrc = './src/legal';
    const legalDest = lang === config.defaultLanguage
      ? path.join(config.outputDir, 'legal')
      : path.join(config.outputDir, lang, 'legal');
    
    if (fs.existsSync(legalSrc)) {
      // Create legal destination directory
      if (!fs.existsSync(legalDest)) {
        fs.mkdirSync(legalDest, { recursive: true });
      }
      
      // Process each legal file
      const legalFiles = fs.readdirSync(legalSrc);
      
      for (const file of legalFiles) {
        // Skip language-specific files for other languages
        if (file.endsWith('-nl.html') && lang !== 'nl') continue;
        if (file.endsWith('-en.html') && lang !== 'en') continue;
        
        // For Dutch, use language-specific versions if they exist
        let srcFile = file;
        let destFile = file;
        if (lang === 'nl') {
          if (file === 'disclaimer.html' && fs.existsSync(path.join(legalSrc, 'disclaimer-nl.html'))) {
            srcFile = 'disclaimer-nl.html';
            destFile = 'disclaimer.html'; // Still output as disclaimer.html
          }
          if (file === 'affiliate-disclosure.html' && fs.existsSync(path.join(legalSrc, 'affiliate-disclosure-nl.html'))) {
            srcFile = 'affiliate-disclosure-nl.html';
            destFile = 'affiliate-disclosure.html'; // Still output as affiliate-disclosure.html
          }
          if (file === 'privacy-policy.html' && fs.existsSync(path.join(legalSrc, 'privacy-policy-nl.html'))) {
            srcFile = 'privacy-policy-nl.html';
            destFile = 'privacy-policy.html'; // Still output as privacy-policy.html
          }
          if (file === 'terms-of-service.html' && fs.existsSync(path.join(legalSrc, 'terms-of-service-nl.html'))) {
            srcFile = 'terms-of-service-nl.html';
            destFile = 'terms-of-service.html'; // Still output as terms-of-service.html
          }
        }
        
        // Skip -nl/-en suffix files from being copied as-is
        if (file.endsWith('-nl.html') || file.endsWith('-en.html')) continue;
        
        const srcPath = path.join(legalSrc, srcFile);
        const destPath = path.join(legalDest, destFile);
        
        if (srcFile.endsWith('.html')) {
          let html = fs.readFileSync(srcPath, 'utf8');
          
          // Replace language attribute
          html = html.replace(/lang="[^"]*"/, `lang="${lang}"`);
          
          // Replace paths based on language
          if (lang === config.defaultLanguage) {
            // English: Convert /en/ to root paths
            html = html.replace(/href="\/en\/legal\//g, 'href="/legal/');
            html = html.replace(/href="\/en\/blog\/"/g, 'href="/blog/"');
            html = html.replace(/href="\/en\/contact\/"/g, 'href="/contact/"');
            html = html.replace(/href="\/en\/about\/"/g, 'href="/about/"');
            html = html.replace(/href="\/en\/store\/"/g, 'href="/store/"');
            html = html.replace(/href="\/en\/quiz\/"/g, 'href="/quiz/"');
            html = html.replace(/href="\/en\/"/g, 'href="/"');
            html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/blog/hair-loss-guide.html"');
          } else if (lang === 'nl') {
            // Dutch: Convert /en/ to /nl/ paths
            html = html.replace(/href="\/en\/legal\//g, 'href="/nl/legal/');
            html = html.replace(/href="\/legal\//g, 'href="/nl/legal/');
            html = html.replace(/href="\/en\/blog\/"/g, 'href="/nl/blog/"');
            html = html.replace(/href="\/en\/contact\/"/g, 'href="/nl/contact/"');
            html = html.replace(/href="\/en\/about\/"/g, 'href="/nl/over-ons/"');
            html = html.replace(/href="\/en\/store\/"/g, 'href="/nl/winkel/"');
            html = html.replace(/href="\/en\/quiz\/"/g, 'href="/nl/quiz/"');
            html = html.replace(/href="\/en\/"/g, 'href="/nl/"');
            html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/nl/blog/hair-loss-guide.html"');
            
            // Update asset paths (go up one level since we're in /nl/legal/)
            html = html.replace(/href="\.\.\/\.\.\//g, 'href="../../');
            html = html.replace(/src="\.\.\/\.\.\//g, 'src="../../');
          }
          
          fs.writeFileSync(destPath, html);
        } else {
          // Copy non-HTML files as-is
          fs.copyFileSync(srcPath, destPath);
        }
      }
      
      console.log(`✓ Copied legal/ to ${lang === config.defaultLanguage ? 'legal/' : lang + '/legal/'}`);
    }
  });
  
  // Copy blog folder to each language
  console.log('\nCopying blog...');
  config.languages.forEach(lang => {
    const blogSrc = './src/blog';
    const blogDest = lang === config.defaultLanguage
      ? path.join(config.outputDir, 'blog')
      : path.join(config.outputDir, lang, 'blog');
    const translations = loadTranslations(lang);
    
    if (fs.existsSync(blogSrc)) {
      // Create blog destination directory
      if (!fs.existsSync(blogDest)) {
        fs.mkdirSync(blogDest, { recursive: true });
      }
      
      // Process each file in blog directory
      const blogFiles = fs.readdirSync(blogSrc);
      
      for (const file of blogFiles) {
        const srcPath = path.join(blogSrc, file);
        const destPath = path.join(blogDest, file);
        
        // If it's index.html, process translations
        if (file === 'index.html') {
          let html = fs.readFileSync(srcPath, 'utf8');
          
          // Replace translations
          html = replaceTranslations(html, translations);
          
          // Replace language attribute
          html = html.replace(/lang="[^"]*"/, `lang="${lang}"`);
          
          // Replace paths based on language
          if (lang === config.defaultLanguage) {
            // English: Convert /en/ to root paths
            html = html.replace(/href="\/en\/blog\/"/g, 'href="/blog/"');
            html = html.replace(/href="\/en\/contact\/"/g, 'href="/contact/"');
            html = html.replace(/href="\/en\/about\/"/g, 'href="/about/"');
            html = html.replace(/href="\/en\/store\/"/g, 'href="/store/"');
            html = html.replace(/href="\/en\/quiz\/"/g, 'href="/quiz/"');
            html = html.replace(/href="\/en\/"/g, 'href="/"');
            html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/blog/hair-loss-guide.html"');
          } else if (lang === 'nl') {
            // Dutch: Convert /en/ to /nl/ paths
            html = html.replace(/href="\/en\/blog\/"/g, 'href="/nl/blog/"');
            html = html.replace(/href="\/en\/contact\/"/g, 'href="/nl/contact/"');
            html = html.replace(/href="\/en\/about\/"/g, 'href="/nl/over-ons/"');
            html = html.replace(/href="\/en\/store\/"/g, 'href="/nl/winkel/"');
            html = html.replace(/href="\/en\/quiz\/"/g, 'href="/nl/quiz/"');
            html = html.replace(/href="\/en\/"/g, 'href="/nl/"');
            html = html.replace(/href="\/en\/blog\/hair-loss-guide\.html"/g, 'href="/nl/blog/hair-loss-guide.html"');
          }
          
          fs.writeFileSync(destPath, html);
        } else {
          // For other files (like hair-loss-guide.html), just copy as-is
          fs.copyFileSync(srcPath, destPath);
        }
      }
      
      console.log(`✓ Copied blog/ to ${lang === config.defaultLanguage ? 'blog/' : lang + '/blog/'}`);
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
