const fs = require('fs');

// Read the Reddit data
const data = JSON.parse(fs.readFileSync('reddit-all-time-top100.json', 'utf8'));
const posts = data.data.children.map(c => c.data);

console.log(`📊 Analyzing ${posts.length} posts from r/tressless top of all time...\n`);

// Filter for high-quality progress posts
const filtered = posts.filter(post => {
  const title = post.title.toLowerCase();
  const flair = (post.link_flair_text || '').toLowerCase();
  
  // EXCLUDE satire/memes
  if (flair.includes('satire') || flair.includes('meme')) {
    return false;
  }
  
  // EXCLUDE hair transplants
  if (title.includes('transplant') || title.includes('donor') || 
      title.includes('fue') || title.includes('overharvest')) {
    return false;
  }
  
  // EXCLUDE memes/jokes
  if (title.includes('homeless') || title.includes('crackhead') || 
      title.includes('hide your wives') || title.includes('leave me alone')) {
    return false;
  }
  
  // EXCLUDE non-image posts
  const hasImg = post.post_hint === 'image' || 
                 post.url?.includes('i.redd.it') || 
                 post.is_gallery || 
                 post.url?.includes('/gallery/');
  if (!hasImg) {
    return false;
  }
  
  // INCLUDE progress keywords
  const isProg = title.includes('month') || title.includes('year') || 
                 title.includes('progress') || title.includes('result') ||
                 title.includes('before') || title.includes('after') ||
                 title.includes('treatment') || title.includes('fin') ||
                 title.includes('minoxidil') || title.includes('regrowth') ||
                 title.includes('got') || title.includes('decision');
  
  return isProg;
});

console.log(`✅ Found ${filtered.length} high-quality progress posts!\n`);
console.log('Top quality posts:\n');

filtered.forEach((post, i) => {
  console.log(`${i + 1}. "${post.title}"`);
  console.log(`   👍 ${post.score.toLocaleString()} upvotes | 💬 ${post.num_comments} comments`);
  console.log(`   🔗 ${post.permalink}\n`);
});

// Save the filtered posts
const output = {
  data: {
    children: filtered.map(post => ({ kind: 't3', data: post }))
  },
  fetched_at: new Date().toISOString(),
  subreddit: 'tressless',
  timeframe: 'all',
  total_analyzed: posts.length,
  total_filtered: filtered.length
};

fs.writeFileSync('src/reddit-tressless-top.json', JSON.stringify(output, null, 2));
console.log(`\n💾 Saved ${filtered.length} posts to src/reddit-tressless-top.json`);
