/**
 * ============================================================================
 * GOOGLE SITEMAP DIAGNOSTIC TOOL
 * ============================================================================
 * 
 * This script tests for all common reasons why Google can't find a sitemap:
 * 
 * 1. Sitemap URL accessibility (HTTP 200)
 * 2. Robots.txt accessibility and sitemap declaration
 * 3. XML syntax validation
 * 4. URL format validation
 * 5. HTTP headers (Content-Type, Cache-Control)
 * 6. URL accessibility (all URLs return 200)
 * 7. HTTPS/HTTP consistency
 * 8. Domain consistency (www vs non-www)
 * 9. File size limits (< 50MB, < 50,000 URLs)
 * 10. Character encoding (UTF-8)
 * 
 * Run this script to diagnose sitemap issues:
 * node sitemap-diagnostic.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'reviveyour.hair';
const SITEMAP_URL = `https://${DOMAIN}/sitemap_index.xml`;
const ROBOTS_URL = `https://${DOMAIN}/robots.txt`;
const LOCAL_SITEMAP = path.join(__dirname, 'src', 'sitemap_index.xml');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Fetch URL and return response data
 */
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

/**
 * Print test result
 */
function printResult(test, passed, message) {
  const symbol = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${symbol} ${test}${colors.reset}`);
  if (message) {
    console.log(`   ${message}`);
  }
  
  if (passed) {
    results.passed.push({ test, message });
  } else {
    results.failed.push({ test, message });
  }
}

/**
 * Print warning
 */
function printWarning(test, message) {
  console.log(`${colors.yellow}⚠️  ${test}${colors.reset}`);
  console.log(`   ${message}`);
  results.warnings.push({ test, message });
}

/**
 * TEST 1: Sitemap URL Accessibility
 */
async function testSitemapAccessibility() {
  console.log(`\n${colors.cyan}═══ TEST 1: Sitemap URL Accessibility ═══${colors.reset}`);
  
  try {
    const response = await fetchURL(SITEMAP_URL);
    
    if (response.statusCode === 200) {
      printResult('Sitemap returns HTTP 200', true, `✓ ${SITEMAP_URL} is accessible`);
    } else {
      printResult('Sitemap returns HTTP 200', false, 
        `✗ Got HTTP ${response.statusCode} instead of 200`);
    }
    
    return response;
  } catch (error) {
    printResult('Sitemap URL accessible', false, `✗ Error: ${error.message}`);
    return null;
  }
}

/**
 * TEST 2: Robots.txt Accessibility and Sitemap Declaration
 */
async function testRobotsTxt() {
  console.log(`\n${colors.cyan}═══ TEST 2: Robots.txt Configuration ═══${colors.reset}`);
  
  try {
    const response = await fetchURL(ROBOTS_URL);
    
    if (response.statusCode === 200) {
      printResult('Robots.txt accessible', true, `✓ ${ROBOTS_URL} returns HTTP 200`);
      
      // Check if sitemap is declared
      const hasSitemap = response.body.includes('Sitemap:');
      if (hasSitemap) {
        printResult('Sitemap declared in robots.txt', true, 
          `✓ Found: ${response.body.match(/Sitemap:.*/)?.[0]}`);
        
        // Check if URL matches
        const declaredURL = response.body.match(/Sitemap:\s*(.+)/)?.[1]?.trim();
        if (declaredURL === SITEMAP_URL) {
          printResult('Sitemap URL matches', true, '✓ URLs match exactly');
        } else {
          printResult('Sitemap URL matches', false, 
            `✗ Declared: ${declaredURL}\n   Expected: ${SITEMAP_URL}`);
        }
      } else {
        printResult('Sitemap declared in robots.txt', false, 
          '✗ No "Sitemap:" directive found');
      }
      
      // Check if admin is blocked
      const blocksAdmin = response.body.includes('Disallow: /admin');
      if (blocksAdmin) {
        printResult('Admin blocked from crawling', true, '✓ /admin/ is protected');
      } else {
        printWarning('Admin not blocked', 
          'Consider blocking /admin/ from search engines');
      }
    } else {
      printResult('Robots.txt accessible', false, 
        `✗ Got HTTP ${response.statusCode}`);
    }
  } catch (error) {
    printResult('Robots.txt accessible', false, `✗ Error: ${error.message}`);
  }
}

/**
 * TEST 3: XML Syntax Validation
 */
function testXMLSyntax(sitemapXML) {
  console.log(`\n${colors.cyan}═══ TEST 3: XML Syntax Validation ═══${colors.reset}`);
  
  // Check XML declaration
  const hasXMLDeclaration = sitemapXML.startsWith('<?xml');
  if (hasXMLDeclaration) {
    printResult('XML declaration present', true, '✓ <?xml version="1.0" encoding="UTF-8"?>');
  } else {
    printResult('XML declaration present', false, '✗ Missing <?xml...?> declaration');
  }
  
  // Check namespace
  const hasNamespace = sitemapXML.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  if (hasNamespace) {
    printResult('Correct namespace', true, '✓ Using sitemaps.org schema');
  } else {
    printResult('Correct namespace', false, '✗ Missing or incorrect xmlns');
  }
  
  // Check for unclosed tags
  const urlsetOpen = (sitemapXML.match(/<urlset/g) || []).length;
  const urlsetClose = (sitemapXML.match(/<\/urlset>/g) || []).length;
  if (urlsetOpen === urlsetClose) {
    printResult('All tags closed', true, '✓ <urlset> properly closed');
  } else {
    printResult('All tags closed', false, 
      `✗ <urlset> open: ${urlsetOpen}, close: ${urlsetClose}`);
  }
  
  // Check for special characters that need escaping
  const needsEscaping = sitemapXML.match(/<loc>[^<]*[&<>'""][^<]*<\/loc>/);
  if (needsEscaping) {
    printWarning('Special characters in URLs', 
      'Found unescaped &, <, >, \', or " in URLs - should be escaped');
  } else {
    printResult('URL encoding correct', true, '✓ No unescaped special characters');
  }
}

/**
 * TEST 4: HTTP Headers
 */
function testHTTPHeaders(response) {
  console.log(`\n${colors.cyan}═══ TEST 4: HTTP Headers ═══${colors.reset}`);
  
  const contentType = response.headers['content-type'];
  const expectedTypes = ['application/xml', 'text/xml'];
  
  if (expectedTypes.some(type => contentType?.includes(type))) {
    printResult('Content-Type header correct', true, `✓ ${contentType}`);
  } else {
    printResult('Content-Type header correct', false, 
      `✗ Got: ${contentType}\n   Expected: application/xml or text/xml`);
  }
  
  // Check character encoding
  if (contentType?.includes('utf-8') || contentType?.includes('UTF-8')) {
    printResult('UTF-8 encoding declared', true, '✓ Charset specified in header');
  } else {
    printWarning('UTF-8 encoding in header', 
      'Consider adding charset=utf-8 to Content-Type');
  }
  
  // Check cache headers
  const cacheControl = response.headers['cache-control'];
  if (cacheControl) {
    printResult('Cache-Control header present', true, `✓ ${cacheControl}`);
  } else {
    printWarning('Cache-Control header', 
      'Consider adding Cache-Control for better performance');
  }
}

/**
 * TEST 5: URL Validation
 */
function testURLValidation(sitemapXML) {
  console.log(`\n${colors.cyan}═══ TEST 5: URL Validation ═══${colors.reset}`);
  
  const urls = [...sitemapXML.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  
  console.log(`   Found ${urls.length} URLs in sitemap`);
  
  // Test 5a: All URLs use HTTPS
  const httpURLs = urls.filter(url => url.startsWith('http://'));
  if (httpURLs.length === 0) {
    printResult('All URLs use HTTPS', true, '✓ No insecure HTTP URLs');
  } else {
    printResult('All URLs use HTTPS', false, 
      `✗ Found ${httpURLs.length} HTTP URLs (should be HTTPS)`);
  }
  
  // Test 5b: Consistent domain
  const wrongDomain = urls.filter(url => !url.includes(DOMAIN));
  if (wrongDomain.length === 0) {
    printResult('Consistent domain', true, `✓ All URLs use ${DOMAIN}`);
  } else {
    printResult('Consistent domain', false, 
      `✗ Found ${wrongDomain.length} URLs with different domain`);
  }
  
  // Test 5c: URL count within limits
  if (urls.length <= 50000) {
    printResult('URL count within limit', true, `✓ ${urls.length}/50,000 URLs`);
  } else {
    printResult('URL count within limit', false, 
      `✗ ${urls.length} URLs exceeds 50,000 limit`);
  }
  
  // Test 5d: Check for trailing slashes consistency
  const withSlash = urls.filter(url => url.endsWith('/')).length;
  const withoutSlash = urls.filter(url => !url.endsWith('/') && !url.includes('.')).length;
  
  if (withSlash > 0 && withoutSlash > 0) {
    printWarning('Trailing slash consistency', 
      `Mixed: ${withSlash} with slash, ${withoutSlash} without - be consistent`);
  } else {
    printResult('Trailing slash consistency', true, '✓ URLs are consistent');
  }
  
  return urls;
}

/**
 * TEST 6: File Size
 */
function testFileSize(sitemapXML) {
  console.log(`\n${colors.cyan}═══ TEST 6: File Size ═══${colors.reset}`);
  
  const sizeBytes = Buffer.byteLength(sitemapXML, 'utf8');
  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
  const maxSizeMB = 50;
  
  if (sizeBytes < maxSizeMB * 1024 * 1024) {
    printResult('File size within limit', true, `✓ ${sizeMB} MB / 50 MB`);
  } else {
    printResult('File size within limit', false, 
      `✗ ${sizeMB} MB exceeds 50 MB limit`);
  }
}

/**
 * TEST 7: URL Accessibility (Sample Test)
 */
async function testURLAccessibility(urls) {
  console.log(`\n${colors.cyan}═══ TEST 7: URL Accessibility (Sample) ═══${colors.reset}`);
  console.log('   Testing 5 random URLs...\n');
  
  // Test 5 random URLs
  const sampled = urls.sort(() => 0.5 - Math.random()).slice(0, 5);
  let accessibleCount = 0;
  
  for (const url of sampled) {
    try {
      const response = await fetchURL(url);
      if (response.statusCode === 200) {
        console.log(`   ${colors.green}✓${colors.reset} ${url}`);
        accessibleCount++;
      } else {
        console.log(`   ${colors.red}✗${colors.reset} ${url} - HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ${colors.red}✗${colors.reset} ${url} - ${error.message}`);
    }
  }
  
  if (accessibleCount === sampled.length) {
    printResult('Sample URLs accessible', true, `✓ All ${accessibleCount}/${sampled.length} tested URLs returned 200`);
  } else {
    printResult('Sample URLs accessible', false, 
      `✗ Only ${accessibleCount}/${sampled.length} URLs are accessible`);
  }
}

/**
 * TEST 8: Google Search Console Recommendations
 */
function testGoogleRecommendations(sitemapXML) {
  console.log(`\n${colors.cyan}═══ TEST 8: Google Best Practices ═══${colors.reset}`);
  
  // Check for lastmod dates
  const hasLastmod = sitemapXML.includes('<lastmod>');
  if (hasLastmod) {
    printResult('Lastmod dates present', true, '✓ Using <lastmod> tags');
    
    // Check date format (YYYY-MM-DD)
    const dates = [...sitemapXML.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(m => m[1]);
    const validDates = dates.filter(d => /^\d{4}-\d{2}-\d{2}/.test(d));
    if (validDates.length === dates.length) {
      printResult('Date format correct', true, '✓ All dates in YYYY-MM-DD format');
    } else {
      printResult('Date format correct', false, 
        `✗ ${dates.length - validDates.length} dates have incorrect format`);
    }
  } else {
    printWarning('Lastmod dates', 
      'Consider adding <lastmod> to help Google prioritize crawling');
  }
  
  // Check for priority tags
  const hasPriority = sitemapXML.includes('<priority>');
  if (hasPriority) {
    printResult('Priority tags present', true, '✓ Using <priority> tags');
  } else {
    printWarning('Priority tags', 
      '<priority> is optional but helps Google understand page importance');
  }
  
  // Check for changefreq
  const hasChangefreq = sitemapXML.includes('<changefreq>');
  if (hasChangefreq) {
    printResult('Changefreq tags present', true, '✓ Using <changefreq> tags');
  } else {
    printWarning('Changefreq tags', 
      '<changefreq> is optional but provides crawl hints to Google');
  }
}

/**
 * Print Summary
 */
function printSummary() {
  console.log(`\n${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}                    DIAGNOSTIC SUMMARY                    ${colors.reset}`);
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings.length}${colors.reset}\n`);
  
  if (results.failed.length > 0) {
    console.log(`${colors.red}═══ CRITICAL ISSUES (Fix These First) ═══${colors.reset}\n`);
    results.failed.forEach(({ test, message }, i) => {
      console.log(`${i + 1}. ${colors.red}${test}${colors.reset}`);
      console.log(`   ${message}\n`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}═══ WARNINGS (Recommended Improvements) ═══${colors.reset}\n`);
    results.warnings.forEach(({ test, message }, i) => {
      console.log(`${i + 1}. ${colors.yellow}${test}${colors.reset}`);
      console.log(`   ${message}\n`);
    });
  }
  
  if (results.failed.length === 0) {
    console.log(`${colors.green}═══════════════════════════════════════════════════════`);
    console.log(`🎉 ALL CRITICAL TESTS PASSED!`);
    console.log(`Your sitemap should be discoverable by Google.`);
    console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`);
  }
  
  console.log(`${colors.cyan}Next Steps:${colors.reset}`);
  console.log(`1. Submit sitemap to Google Search Console: ${SITEMAP_URL}`);
  console.log(`2. Check Google Search Console for indexing status`);
  console.log(`3. Monitor for any crawl errors\n`);
}

/**
 * Main Diagnostic Function
 */
async function runDiagnostics() {
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}        GOOGLE SITEMAP DIAGNOSTIC TOOL v1.0             ${colors.reset}`);
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`\nDomain: ${colors.cyan}${DOMAIN}${colors.reset}`);
  console.log(`Sitemap: ${colors.cyan}${SITEMAP_URL}${colors.reset}\n`);
  
  // Run tests
  const sitemapResponse = await testSitemapAccessibility();
  
  if (sitemapResponse) {
    testHTTPHeaders(sitemapResponse);
    testXMLSyntax(sitemapResponse.body);
    const urls = testURLValidation(sitemapResponse.body);
    testFileSize(sitemapResponse.body);
    testGoogleRecommendations(sitemapResponse.body);
    await testURLAccessibility(urls);
  }
  
  await testRobotsTxt();
  
  // Print summary
  printSummary();
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
