// Fully automated Reddit fetcher using Puppeteer (headless browser)
// This bypasses Reddit's bot detection by using a real Chrome browser
// Run: npm run update-reddit

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SUBREDDIT = 'tressless';
const TIMEFRAME = 'all';
const LIMIT = 15;

console.log('🚀 Starting automated Reddit fetcher...');
console.log('📦 Using Puppeteer (headless Chrome) to bypass bot detection\n');

(async () => {
  let browser;
  
  try {
    // Launch headless Chrome
    console.log('🌐 Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled', // Hide automation
      ]
    });

    const page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Hide webdriver property (anti-detection)
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Navigate to Reddit JSON endpoint
    const url = `https://old.reddit.com/r/${SUBREDDIT}/top/.json?t=${TIMEFRAME}&limit=${LIMIT}`;
    console.log('📡 Fetching:', url);
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Get the page content
    const content = await page.content();
    
    // Check if we got blocked
    if (content.includes('whoa there, pardner') || content.includes('blocked')) {
      throw new Error('Reddit blocked the request');
    }

    // Extract JSON from the page
    const jsonText = await page.evaluate(() => {
      // Try to get JSON from <pre> tag (how browsers display JSON)
      const pre = document.querySelector('pre');
      if (pre) return pre.textContent;
      
      // Fallback: try to get from body
      return document.body.textContent;
    });

    console.log('✅ Successfully retrieved data from Reddit!');
    
    // Parse the JSON
    const redditData = JSON.parse(jsonText);
    
    if (!redditData.data || !redditData.data.children) {
      throw new Error('Invalid Reddit response format');
    }

    const posts = redditData.data.children.map(child => child.data);
    console.log(`📊 Found ${posts.length} posts\n`);

    // Show first 3 posts as preview
    console.log('📋 Top 3 posts:');
    posts.slice(0, 3).forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title}`);
      console.log(`      👍 ${post.score.toLocaleString()} upvotes | 💬 ${post.num_comments} comments\n`);
    });

    // Format for our widget
    const output = {
      data: {
        children: redditData.data.children
      },
      fetched_at: new Date().toISOString(),
      subreddit: SUBREDDIT,
      timeframe: TIMEFRAME,
      fetch_method: 'puppeteer_automated'
    };

    // Save to src directory
    const outputPath = path.join(__dirname, 'src', 'reddit-tressless-top.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log('💾 Saved to:', outputPath);
    console.log('🎯 Fetched at:', output.fetched_at);
    console.log('\n✨ Success! Now deploy the changes:');
    console.log('   git add src/reddit-tressless-top.json');
    console.log('   git commit -m "Update Reddit posts - automated fetch"');
    console.log('   git push\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   • Make sure Puppeteer is installed: npm install');
    console.error('   • Check your internet connection');
    console.error('   • Reddit may be blocking automated access');
    console.error('   • Try the manual method in REDDIT-DATA-UPDATE-GUIDE.md\n');
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed\n');
    }
  }
})();
