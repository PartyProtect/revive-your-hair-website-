/**
 * Build Validation Script
 * Validates the build output to ensure all pages are generated correctly
 * 
 * Usage: node tools/validate-build.js
 */

const fs = require('fs');
const path = require('path');

// Import centralized page configuration
const pagesConfig = require('../config/pages');

const distDir = './dist';
let errors = [];
let warnings = [];
let checks = 0;

console.log('🔍 Validating build output...\n');

/**
 * Check if a file exists
 */
function checkFileExists(filePath, description) {
  checks++;
  const fullPath = path.join(distDir, filePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`❌ Missing: ${filePath} (${description})`);
    return false;
  }
  return true;
}

/**
 * Check if a file has correct lang attribute
 */
function checkLangAttribute(filePath, expectedLang) {
  checks++;
  const fullPath = path.join(distDir, filePath);
  if (!fs.existsSync(fullPath)) return false;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const langMatch = content.match(/lang="([^"]+)"/);
  
  if (!langMatch) {
    errors.push(`❌ No lang attribute: ${filePath}`);
    return false;
  }
  
  if (langMatch[1] !== expectedLang) {
    errors.push(`❌ Wrong lang attribute: ${filePath} (expected "${expectedLang}", found "${langMatch[1]}")`);
    return false;
  }
  
  return true;
}

/**
 * Check if a file has canonical URL
 * Note: Current build replaces canonical with hreflang tags - this is a known issue
 */
function checkCanonicalUrl(filePath) {
  checks++;
  const fullPath = path.join(distDir, filePath);
  if (!fs.existsSync(fullPath)) return false;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  // Check for any canonical link (may have different domain or be replaced by hreflang)
  const hasCanonical = content.includes('rel="canonical"') || content.includes("rel='canonical'");
  const hasHreflangXDefault = content.includes('hreflang="x-default"');
  
  // If we have x-default hreflang, that serves similar purpose
  if (!hasCanonical && !hasHreflangXDefault) {
    warnings.push(`⚠️ No canonical URL or x-default hreflang: ${filePath}`);
    return false;
  }
  
  return true;
}

/**
 * Check if a file has hreflang tags
 */
function checkHreflangTags(filePath) {
  checks++;
  const fullPath = path.join(distDir, filePath);
  if (!fs.existsSync(fullPath)) return false;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasEnHreflang = content.includes('hreflang="en"');
  const hasNlHreflang = content.includes('hreflang="nl"');
  const hasDeHreflang = content.includes('hreflang="de"');
  const hasXDefault = content.includes('hreflang="x-default"');
  
  if (!hasEnHreflang || !hasNlHreflang || !hasDeHreflang || !hasXDefault) {
    warnings.push(`⚠️ Missing hreflang tags: ${filePath}`);
    return false;
  }
  
  return true;
}

// ===========================================
// 1. Check dist directory exists
// ===========================================
console.log('1️⃣ Checking dist directory...');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory does not exist! Run the build first.');
  process.exit(1);
}
console.log('   ✓ dist/ directory exists\n');

// ===========================================
// 2. Check main pages for all languages
// ===========================================
console.log('2️⃣ Checking main pages...');

const mainPages = pagesConfig.pages;
const languages = pagesConfig.languages;

for (const page of mainPages) {
  for (const lang of languages) {
    const slug = page.slugs[lang];
    let filePath;
    
    if (lang === 'en') {
      // English at root
      filePath = slug === '' ? 'index.html' : `${slug}/index.html`;
    } else {
      // Other languages in subdirectory
      filePath = slug === '' ? `${lang}/index.html` : `${lang}/${slug}/index.html`;
    }
    
    const description = `${page.template} page for ${lang}`;
    if (checkFileExists(filePath, description)) {
      checkLangAttribute(filePath, lang);
      checkCanonicalUrl(filePath);
      checkHreflangTags(filePath);
    }
  }
}
console.log(`   Checked ${mainPages.length * languages.length} main page variants\n`);

// ===========================================
// 3. Check blog pages
// ===========================================
console.log('3️⃣ Checking blog pages...');

const blogPages = pagesConfig.blogPages;
for (const blog of blogPages) {
  for (const lang of languages) {
    let filePath;
    
    if (lang === 'en') {
      filePath = `blog/${blog.template}.html`;
    } else {
      filePath = `${lang}/blog/${blog.template}.html`;
    }
    
    const description = `${blog.template} blog for ${lang}`;
    checkFileExists(filePath, description);
  }
}
console.log(`   Checked ${blogPages.length * languages.length} blog page variants\n`);

// ===========================================
// 4. Check legal pages
// ===========================================
console.log('4️⃣ Checking legal pages...');

const legalPages = pagesConfig.legalPages;
for (const legal of legalPages) {
  for (const lang of languages) {
    let filePath;
    
    if (lang === 'en') {
      filePath = `legal/${legal.template}.html`;
    } else {
      filePath = `${lang}/legal/${legal.template}.html`;
    }
    
    const description = `${legal.template} legal page for ${lang}`;
    checkFileExists(filePath, description);
  }
}
console.log(`   Checked ${legalPages.length * languages.length} legal page variants\n`);

// ===========================================
// 5. Check essential files
// ===========================================
console.log('5️⃣ Checking essential files...');

const essentialFiles = [
  { path: 'sitemap_index.xml', desc: 'Sitemap' },
  { path: 'robots.txt', desc: 'Robots.txt' },
  { path: '404.html', desc: '404 error page' },
  { path: 'googlecff853c0df795311.html', desc: 'Google Search Console verification' },
];

for (const file of essentialFiles) {
  checkFileExists(file.path, file.desc);
}
console.log(`   Checked ${essentialFiles.length} essential files\n`);

// ===========================================
// 6. Check asset folders
// ===========================================
console.log('6️⃣ Checking asset folders...');

const assetFolders = ['scripts', 'styles', 'images', 'fonts'];
for (const folder of assetFolders) {
  checks++;
  const folderPath = path.join(distDir, folder);
  if (!fs.existsSync(folderPath)) {
    errors.push(`❌ Missing asset folder: ${folder}/`);
  }
}
console.log(`   Checked ${assetFolders.length} asset folders\n`);

// ===========================================
// 7. Check sitemap content
// ===========================================
console.log('7️⃣ Validating sitemap...');

const sitemapPath = path.join(distDir, 'sitemap_index.xml');
if (fs.existsSync(sitemapPath)) {
  checks++;
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  // Check for expected number of URLs
  const urlMatches = sitemapContent.match(/<url>/g);
  const expectedUrls = pagesConfig.getSitemapPages().length * 3; // 3 languages
  
  if (urlMatches && urlMatches.length !== expectedUrls) {
    warnings.push(`⚠️ Sitemap has ${urlMatches.length} URLs (expected ${expectedUrls})`);
  }
  
  // Check for domain
  if (!sitemapContent.includes(pagesConfig.domain)) {
    errors.push(`❌ Sitemap missing correct domain: ${pagesConfig.domain}`);
  }
  
  // Check for hreflang in sitemap
  if (!sitemapContent.includes('hreflang')) {
    errors.push('❌ Sitemap missing hreflang tags');
  }
  
  console.log(`   ✓ Sitemap validated with ${urlMatches?.length || 0} URLs\n`);
}

// ===========================================
// 8. Check components for each language
// ===========================================
console.log('8️⃣ Checking components...');

for (const lang of languages) {
  const componentPath = lang === 'en' 
    ? path.join(distDir, 'components')
    : path.join(distDir, lang, 'components');
  
  checks++;
  if (!fs.existsSync(componentPath)) {
    errors.push(`❌ Missing components folder for ${lang}`);
  }
}
console.log(`   Checked components for ${languages.length} languages\n`);

// ===========================================
// Summary
// ===========================================
console.log('═══════════════════════════════════════');
console.log('              SUMMARY');
console.log('═══════════════════════════════════════');
console.log(`📊 Total checks: ${checks}`);
console.log(`❌ Errors: ${errors.length}`);
console.log(`⚠️ Warnings: ${warnings.length}`);
console.log('═══════════════════════════════════════\n');

if (errors.length > 0) {
  console.log('ERRORS:\n');
  errors.forEach(err => console.log(`  ${err}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('WARNINGS:\n');
  warnings.forEach(warn => console.log(`  ${warn}`));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All validations passed!\n');
  process.exit(0);
} else if (errors.length > 0) {
  console.log('❌ Build validation failed!\n');
  process.exit(1);
} else {
  console.log('⚠️ Build completed with warnings.\n');
  process.exit(0);
}
