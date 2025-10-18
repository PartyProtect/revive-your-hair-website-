#!/usr/bin/env node

/**
 * SEO Content Pre-renderer
 * 
 * This script generates static HTML for dynamic content at build time
 * so search engine crawlers can see and index it.
 * 
 * Run this during your build process (before deployment)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Building SEO-friendly static content...\n');

// ============================================
// REDDIT FEED PRE-RENDERING
// ============================================

function generateRedditFeedHTML() {
  console.log('📱 Pre-rendering Reddit feed...');
  
  // Load the Reddit data
  const redditDataPath = path.join(__dirname, 'src', 'reddit-tressless-top.json');
  const redditData = JSON.parse(fs.readFileSync(redditDataPath, 'utf8'));
  const posts = redditData.data.children.map(c => c.data);
  
  console.log(`   Found ${posts.length} posts to render`);
  
  // Filter posts (same logic as reddit-feed.js)
  const filteredPosts = posts.filter(post => {
    const title = post.title.toLowerCase();
    const flair = (post.link_flair_text || '').toLowerCase();
    
    // Exclude satire/memes
    if (flair.includes('satire') || flair.includes('meme')) return false;
    
    // Exclude transplants
    if (title.includes('transplant') || title.includes('donor') || 
        title.includes('fue') || title.includes('overharvest')) return false;
    
    // Exclude memes/jokes
    if (title.includes('homeless') || title.includes('crackhead') || 
        title.includes('hide your wives') || title.includes('leave me alone')) return false;
    
    // Require images
    const hasImg = post.post_hint === 'image' || 
                   post.url?.includes('i.redd.it') || 
                   post.is_gallery || 
                   post.url?.includes('/gallery/');
    if (!hasImg) return false;
    
    // Require progress keywords
    const isProg = title.includes('month') || title.includes('year') || 
                   title.includes('progress') || title.includes('result') ||
                   title.includes('before') || title.includes('after') ||
                   title.includes('treatment') || title.includes('fin') ||
                   title.includes('minoxidil') || title.includes('regrowth') ||
                   title.includes('got') || title.includes('decision');
    
    return isProg;
  });
  
  console.log(`   Filtered to ${filteredPosts.length} quality posts`);
  
  // Generate HTML
  const html = `
<!-- SEO-friendly pre-rendered content (enhanced by JavaScript) -->
<div id="reddit-tressless-feed" class="reddit-feed" data-seo-rendered="true">
  <div class="reddit-header">
    <div class="reddit-logo">
      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#FF4500"/>
        <path d="M16.67 10A1.46 1.46 0 0015.2 8.54a2.87 2.87 0 00-2.89-2.12 2.87 2.87 0 00-2.12.89L8 9.3a4.26 4.26 0 00-1.88-.42h-.77a1.46 1.46 0 100 2.92h.77a1.35 1.35 0 011.35 1.35v.77a1.46 1.46 0 102.92 0v-.77a4.26 4.26 0 00-.42-1.88l2-2.12a4.26 4.26 0 011.88.42v.77a1.46 1.46 0 002.92 0v-.77a1.35 1.35 0 011.35-1.35h.77a1.46 1.46 0 000-2.92z" fill="#fff"/>
      </svg>
    </div>
    <div>
      <h4>Top Posts from r/tressless</h4>
      <p>Real transformations from real people</p>
    </div>
  </div>
  <div class="reddit-posts">
${filteredPosts.map(post => generatePostHTML(post)).join('\n')}
  </div>
  <div class="reddit-footer">
    <a href="https://www.reddit.com/r/tressless/top/?t=all" 
       target="_blank" 
       rel="noopener noreferrer" 
       class="reddit-view-more">
      View More on Reddit →
    </a>
  </div>
</div>
`;
  
  return html;
}

function generatePostHTML(post) {
  const thumbnail = getThumbnail(post);
  const timeAgo = getTimeAgo(post.created_utc);
  const score = formatScore(post.score);
  const comments = formatNumber(post.num_comments);
  const title = escapeHtml(post.title);
  const author = post.author || 'unknown';
  const datePublished = new Date(post.created_utc * 1000).toISOString();
  
  return `    <article class="reddit-post" itemscope itemtype="https://schema.org/SocialMediaPosting">
      <!-- Structured data for Google Search Console -->
      <meta itemprop="headline" content="${title}">
      <meta itemprop="datePublished" content="${datePublished}">
      <link itemprop="url" href="https://reddit.com${post.permalink}">
      ${thumbnail ? `<link itemprop="image" href="${thumbnail}">` : ''}
      
      <!-- Author as Person object (required by GSC) -->
      <span itemprop="author" itemscope itemtype="https://schema.org/Person">
        <meta itemprop="name" content="u/${escapeHtml(author)}">
        <link itemprop="url" href="https://reddit.com/user/${escapeHtml(author)}">
      </span>
      
      <!-- Interaction statistics -->
      <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
        <meta itemprop="interactionType" content="https://schema.org/LikeAction">
        <meta itemprop="userInteractionCount" content="${post.score}">
      </span>
      <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
        <meta itemprop="interactionType" content="https://schema.org/CommentAction">
        <meta itemprop="userInteractionCount" content="${post.num_comments}">
      </span>
      
      <a href="https://reddit.com${post.permalink}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="reddit-post-link">
        ${thumbnail ? `
        <div class="reddit-post-thumbnail">
          <img src="${thumbnail}" 
               alt="${title}" 
               loading="lazy">
        </div>
        ` : ''}
        <div class="reddit-post-content">
          <h5 class="reddit-post-title">${title}</h5>
          <div class="reddit-post-meta">
            <span class="reddit-meta-item">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              ${score}
            </span>
            <span class="reddit-meta-item">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
              </svg>
              ${comments}
            </span>
            <span class="reddit-meta-item">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <time datetime="${datePublished}">${timeAgo}</time>
            </span>
            <span class="reddit-meta-item">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              u/${escapeHtml(author)}
            </span>
          </div>
        </div>
      </a>
    </article>`;
}

function getThumbnail(post) {
  // Gallery posts
  if (post.is_gallery && post.media_metadata) {
    const firstImage = Object.values(post.media_metadata)[0];
    if (firstImage?.s?.u) {
      return firstImage.s.u.replace(/&amp;/g, '&');
    }
  }
  
  // Direct image URL
  if (post.url && (post.url.includes('i.redd.it') || post.url.includes('i.imgur.com'))) {
    return post.url;
  }
  
  // Thumbnail
  if (post.thumbnail && 
      post.thumbnail !== 'self' && 
      post.thumbnail !== 'default' && 
      post.thumbnail !== 'nsfw' &&
      post.thumbnail.startsWith('http')) {
    return post.thumbnail;
  }
  
  return null;
}

function getTimeAgo(timestamp) {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  const years = Math.floor(diff / (365 * 24 * 60 * 60));
  if (years > 0) return `${years}y ago`;
  
  const months = Math.floor(diff / (30 * 24 * 60 * 60));
  if (months > 0) return `${months}mo ago`;
  
  const days = Math.floor(diff / (24 * 60 * 60));
  if (days > 0) return `${days}d ago`;
  
  const hours = Math.floor(diff / (60 * 60));
  if (hours > 0) return `${hours}h ago`;
  
  return 'recently';
}

function formatScore(score) {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
}

function formatNumber(num) {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// UPDATE HTML FILES
// ============================================

function injectSEOContent() {
  const redditHTML = generateRedditFeedHTML();
  
  // Update hair-loss-guide.html (files now directly in src/blog/)
  const htmlPath = path.join(__dirname, 'src', 'blog', 'hair-loss-guide.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Replace the reddit feed container (empty or with existing content)
  // Match the opening div and everything until the closing div
  const containerRegex = /<div id="reddit-tressless-feed"[^>]*>[\s\S]*?<\/div>\s*<div class="reddit-footer"[\s\S]*?<\/div>\s*<\/div>/;
  const emptyContainerRegex = /<div id="reddit-tressless-feed"><\/div>/;
  
  const newContent = redditHTML;
  
  if (containerRegex.test(html)) {
    html = html.replace(containerRegex, newContent);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('   ✅ Updated hair-loss-guide.html with SEO content (replaced existing)');
  } else if (emptyContainerRegex.test(html)) {
    html = html.replace(emptyContainerRegex, newContent);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('   ✅ Updated hair-loss-guide.html with SEO content (replaced empty)');
  } else {
    console.log('   ⚠️  Could not find reddit container in hair-loss-guide.html');
    console.log('   💡 Looking for: <div id="reddit-tressless-feed">');
  }
  
  console.log('\n✅ SEO content build complete!\n');
}

// Run the build
try {
  injectSEOContent();
  console.log('🎉 All SEO content successfully pre-rendered!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error building SEO content:', error);
  process.exit(1);
}
