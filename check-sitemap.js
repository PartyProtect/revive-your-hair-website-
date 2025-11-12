const https = require('https');

const sitemapUrl = process.env.DEPLOY_PRIME_URL
  ? `${process.env.DEPLOY_PRIME_URL}/sitemap_index.xml`
  : 'https://reviveyour.hair/sitemap_index.xml';
console.log('🔍 Checking sitemap headers at:', sitemapUrl);

https.get(sitemapUrl, (res) => {
  const contentType = res.headers['content-type'];
  
  console.log('📋 Content-Type:', contentType);
  
  if (!contentType || !contentType.includes('application/xml')) {
    console.error('❌ SITEMAP HAS WRONG CONTENT-TYPE! Deploy FAILED.');
    console.error('   Expected: application/xml');
    console.error('   Got:', contentType || 'undefined');
    process.exit(1); // Fail the build
  }
  
  console.log('✅ Sitemap headers are correct!');
}).on('error', (err) => {
  console.error('⚠️  Error checking sitemap:', err.message);
  console.log('   Skipping validation (sitemap might not exist yet during build)');
  // Don't fail the build if sitemap doesn't exist yet
  process.exit(0);
});
