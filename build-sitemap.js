const fs = require('fs');
const path = require('path');

const domain = 'https://reviveyour.hair';

// Define all pages with their language-specific slugs
const pages = [
  {
    en: '/',
    nl: '/nl/',
    de: '/de/',
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    en: '/about/',
    nl: '/nl/over-ons/',
    de: '/de/uber-uns/',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    en: '/store/',
    nl: '/nl/winkel/',
    de: '/de/shop/',
    priority: '0.9',
    changefreq: 'weekly'
  },
  {
    en: '/contact/',
    nl: '/nl/contact/',
    de: '/de/kontakt/',
    priority: '0.7',
    changefreq: 'monthly'
  },
  {
    en: '/quiz/',
    nl: '/nl/quiz/',
    de: '/de/quiz/',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    en: '/blog/',
    nl: '/nl/blog/',
    de: '/de/blog/',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    en: '/blog/hair-loss-guide.html',
    nl: '/nl/blog/hair-loss-guide.html',
    de: '/de/blog/hair-loss-guide.html',
    priority: '0.7',
    changefreq: 'monthly'
  }
];

// Legal pages (same content for now)
const legalPages = [
  'privacy-policy.html',
  'terms-of-service.html',
  'cookie-policy.html',
  'disclaimer.html',
  'affiliate-disclosure.html'
];

legalPages.forEach(page => {
  pages.push({
    en: `/legal/${page}`,
    nl: `/nl/legal/${page}`,
    de: `/de/legal/${page}`,
    priority: '0.3',
    changefreq: 'yearly'
  });
});

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
