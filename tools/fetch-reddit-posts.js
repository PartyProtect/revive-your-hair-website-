// Script to fetch top posts from r/tressless and save to static JSON
// Run this locally: node fetch-reddit-posts.js
// This uses the unofficial JSON endpoint with proper browser headers

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUBREDDIT = 'tressless';
const TIMEFRAME = 'all';
const LIMIT = 15;

console.log('🔍 Fetching top posts from r/' + SUBREDDIT + '...');
console.log('⚠️  Note: This may be blocked by Reddit. If it fails, see REDDIT-DATA-UPDATE-GUIDE.md for manual method.\n');

// Try multiple endpoints - sometimes one works when others don't
const endpoints = [
  `https://www.reddit.com/r/${SUBREDDIT}/top.json?t=${TIMEFRAME}&limit=${LIMIT}`,
  `https://old.reddit.com/r/${SUBREDDIT}/top.json?t=${TIMEFRAME}&limit=${LIMIT}`,
  `https://api.reddit.com/r/${SUBREDDIT}/top?t=${TIMEFRAME}&limit=${LIMIT}`
];

let currentEndpointIndex = 0;

function tryFetch() {
  const url = endpoints[currentEndpointIndex];
  console.log(`Trying endpoint ${currentEndpointIndex + 1}/${endpoints.length}: ${url}`);

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }
  };

  https.get(url, options, (res) => {
    let data = '';

    // Handle redirects
    if (res.statusCode === 301 || res.statusCode === 302) {
      console.log(`↻ Redirect to: ${res.headers.location}`);
      https.get(res.headers.location, options, handleResponse);
      return;
    }

    // Check for blocking
    if (res.statusCode === 403) {
      console.log(`❌ Endpoint ${currentEndpointIndex + 1} blocked (403)`);
      tryNextEndpoint();
      return;
    }

    if (res.statusCode !== 200) {
      console.log(`❌ Endpoint ${currentEndpointIndex + 1} returned status ${res.statusCode}`);
      tryNextEndpoint();
      return;
    }

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      processData(data);
    });

  }).on('error', (error) => {
    console.error(`❌ Endpoint ${currentEndpointIndex + 1} error:`, error.message);
    tryNextEndpoint();
  });
}

function tryNextEndpoint() {
  currentEndpointIndex++;
  if (currentEndpointIndex < endpoints.length) {
    console.log('');
    tryFetch();
  } else {
    console.error('\n❌ All endpoints failed!');
    console.error('\n💡 SOLUTION: Use manual method instead:');
    console.error('   1. Visit: https://old.reddit.com/r/tressless/top/.json?t=all&limit=15');
    console.error('   2. Copy the JSON data from your browser');
    console.error('   3. Paste into: src/reddit-tressless-top.json');
    console.error('   4. Commit and push\n');
    console.error('   See REDDIT-DATA-UPDATE-GUIDE.md for detailed instructions.\n');
    process.exit(1);
  }
}

function processData(data) {
  try {
    // Check if it's HTML (blocked page)
    if (data.trim().startsWith('<!doctype') || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
      console.log(`❌ Endpoint ${currentEndpointIndex + 1} returned HTML (blocked)`);
      tryNextEndpoint();
      return;
    }

    const jsonData = JSON.parse(data);
    
    if (!jsonData.data || !jsonData.data.children) {
      console.error('❌ Invalid response format');
      console.error('Response:', jsonData);
      tryNextEndpoint();
      return;
    }

    const posts = jsonData.data.children.map(child => child.data);
    console.log(`\n✅ Successfully fetched ${posts.length} posts from endpoint ${currentEndpointIndex + 1}!`);

    // Log some post titles to verify
    console.log('\n📋 First 3 posts:');
    posts.slice(0, 3).forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title} (${post.score} upvotes)`);
    });

    // Save to src directory (where Netlify deploys from)
    const outputPath = path.join(__dirname, 'src', 'reddit-tressless-top.json');

    const output = {
      data: {
        children: jsonData.data.children
      },
      fetched_at: new Date().toISOString(),
      subreddit: SUBREDDIT,
      timeframe: TIMEFRAME,
      source_endpoint: endpoints[currentEndpointIndex]
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log('\n💾 Saved to:', outputPath);
    console.log('\n✨ Done! Now commit and push this file:');
    console.log('   git add src/reddit-tressless-top.json');
    console.log('   git commit -m "Update Reddit posts data"');
    console.log('   git push\n');

  } catch (error) {
    console.error(`❌ Endpoint ${currentEndpointIndex + 1} - Error parsing response:`, error.message);
    tryNextEndpoint();
  }
}

// Start trying endpoints
tryFetch();

