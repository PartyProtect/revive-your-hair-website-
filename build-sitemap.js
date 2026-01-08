const fs = require('fs');
const path = require('path');

// Import centralized page configuration
const pagesConfig = require('./config/pages');

const domain = pagesConfig.domain;

// Get all pages from centralized config
const pages = pagesConfig.getSitemapPages();

// Generate sitemap XML
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  pages.forEach(page => {
    // English version (with x-default)
    xml += '  <url>\n';
    xml += `    <loc>${domain}${page.en}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}${page.en}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="nl" href="${domain}${page.nl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${domain}${page.de}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}${page.en}"/>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += '  </url>\n';

    // Dutch version
    xml += '  <url>\n';
    xml += `    <loc>${domain}${page.nl}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}${page.en}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="nl" href="${domain}${page.nl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${domain}${page.de}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}${page.en}"/>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += '  </url>\n';

    // German version
    xml += '  <url>\n';
    xml += `    <loc>${domain}${page.de}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}${page.en}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="nl" href="${domain}${page.nl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${domain}${page.de}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}${page.en}"/>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Write sitemap to dist folder
const sitemap = generateSitemap();
const outputPath = path.join(__dirname, 'dist', 'sitemap_index.xml');

// Ensure dist folder exists
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
}

fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log('✅ Multilingual sitemap generated successfully!');
console.log(`📄 Location: ${outputPath}`);
console.log(`📊 Total URLs: ${pages.length * 3} (${pages.length} pages × 3 languages)`);
