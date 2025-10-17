// Script to fetch top posts from r/tressless and save to static JSON
// Run this locally: node fetch-reddit-posts.js
// Then commit and push the generated JSON file

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUBREDDIT = 'tressless';
const TIMEFRAME = 'all';
const LIMIT = 15;

console.log('🔍 Fetching top posts from r/' + SUBREDDIT + '...');

const url = `https://old.reddit.com/r/${SUBREDDIT}/top.json?t=${TIMEFRAME}&limit=${LIMIT}`;

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  }
};

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      
      if (!jsonData.data || !jsonData.data.children) {
        console.error('❌ Invalid response format');
        console.error(jsonData);
        process.exit(1);
      }

      const posts = jsonData.data.children.map(child => child.data);
      console.log(`✅ Successfully fetched ${posts.length} posts`);

      // Save to public directory so it's accessible on the website
      const outputPath = path.join(__dirname, 'public', 'reddit-tressless-top.json');
      
      // Create public directory if it doesn't exist
      const publicDir = path.join(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const output = {
        data: {
          children: jsonData.data.children
        },
        fetched_at: new Date().toISOString(),
        subreddit: SUBREDDIT,
        timeframe: TIMEFRAME
      };

      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
      console.log('💾 Saved to:', outputPath);
      console.log('');
      console.log('✨ Done! Now commit and push this file:');
      console.log('   git add public/reddit-tressless-top.json');
      console.log('   git commit -m "Update Reddit posts data"');
      console.log('   git push');

    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.error('Response data:', data);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ Error fetching from Reddit:', error);
  process.exit(1);
});
