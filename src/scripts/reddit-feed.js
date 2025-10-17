// ============================================
// REDDIT FEED WIDGET
// ============================================
// Fetches and displays top posts from r/tressless

class RedditFeed {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.subreddit = options.subreddit || 'tressless';
    this.limit = options.limit || 15;
    this.timeframe = options.timeframe || 'all'; // all, year, month, week, day
    this.loading = false;
    
    if (this.container) {
      this.init();
    }
  }

  async init() {
    this.showLoading();
    try {
      const posts = await this.fetchTopPosts();
      this.renderPosts(posts);
    } catch (error) {
      console.error('Error loading Reddit posts:', error);
      this.showError();
    }
  }

  async fetchTopPosts() {
    // Reddit's JSON API - no authentication needed for public data
    const url = `https://www.reddit.com/r/${this.subreddit}/top.json?t=${this.timeframe}&limit=${this.limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.children.map(child => child.data);
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="reddit-loading">
        <div class="loading-spinner"></div>
        <p>Loading success stories from r/${this.subreddit}...</p>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="reddit-error">
        <p>Unable to load posts at the moment.</p>
        <p><a href="https://www.reddit.com/r/${this.subreddit}/top/?t=${this.timeframe}" target="_blank" rel="noopener noreferrer">View on Reddit →</a></p>
      </div>
    `;
  }

  renderPosts(posts) {
    // Filter for posts that are likely before/after or progress posts
    const relevantPosts = posts.filter(post => {
      const title = post.title.toLowerCase();
      const hasImages = post.post_hint === 'image' || post.url?.includes('imgur') || post.url?.includes('i.redd.it');
      const isProgress = title.includes('month') || title.includes('year') || 
                        title.includes('progress') || title.includes('result') ||
                        title.includes('before') || title.includes('after') ||
                        title.includes('update') || title.includes('transformation');
      return hasImages && isProgress;
    });

    // If we don't have enough relevant posts, include all posts
    const postsToShow = relevantPosts.length >= 10 ? relevantPosts : posts;

    this.container.innerHTML = `
      <div class="reddit-feed">
        <div class="reddit-header">
          <div class="reddit-logo">
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="10" fill="#FF4500"/>
              <path d="M16.67 10A1.46 1.46 0 0015.2 8.54a2.87 2.87 0 00-2.89-2.12 2.87 2.87 0 00-2.12.89L8 9.3a4.26 4.26 0 00-1.88-.42h-.77a1.46 1.46 0 100 2.92h.77a1.35 1.35 0 011.35 1.35v.77a1.46 1.46 0 102.92 0v-.77a4.26 4.26 0 00-.42-1.88l2-2.12a4.26 4.26 0 011.88.42v.77a1.46 1.46 0 002.92 0v-.77a1.35 1.35 0 011.35-1.35h.77a1.46 1.46 0 000-2.92z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <h4>Top Posts from r/${this.subreddit}</h4>
            <p>Real transformations from real people</p>
          </div>
        </div>
        <div class="reddit-posts">
          ${postsToShow.map(post => this.renderPost(post)).join('')}
        </div>
        <div class="reddit-footer">
          <a href="https://www.reddit.com/r/${this.subreddit}/top/?t=${this.timeframe}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="reddit-view-more">
            View More on Reddit →
          </a>
        </div>
      </div>
    `;
  }

  renderPost(post) {
    const thumbnail = this.getThumbnail(post);
    const timeAgo = this.getTimeAgo(post.created_utc);
    const score = this.formatScore(post.score);
    const comments = this.formatNumber(post.num_comments);
    
    return `
      <article class="reddit-post">
        <a href="https://reddit.com${post.permalink}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="reddit-post-link">
          ${thumbnail ? `
            <div class="reddit-post-thumbnail">
              <img src="${thumbnail}" alt="${this.escapeHtml(post.title)}" loading="lazy">
            </div>
          ` : ''}
          <div class="reddit-post-content">
            <h5 class="reddit-post-title">${this.escapeHtml(post.title)}</h5>
            <div class="reddit-post-meta">
              <span class="reddit-meta-item">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                ${score}
              </span>
              <span class="reddit-meta-item">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                </svg>
                ${comments}
              </span>
              <span class="reddit-meta-item">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                ${timeAgo}
              </span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  getThumbnail(post) {
    // Try to get a valid thumbnail
    if (post.preview && post.preview.images && post.preview.images[0]) {
      const preview = post.preview.images[0];
      if (preview.resolutions && preview.resolutions.length > 0) {
        // Get medium resolution (index 2 if available, otherwise last one)
        const resolutions = preview.resolutions;
        const mediumRes = resolutions[Math.min(2, resolutions.length - 1)];
        return this.decodeHtml(mediumRes.url);
      }
      if (preview.source) {
        return this.decodeHtml(preview.source.url);
      }
    }
    
    // Fallback to thumbnail if available and not default
    if (post.thumbnail && 
        post.thumbnail !== 'self' && 
        post.thumbnail !== 'default' && 
        post.thumbnail !== 'nsfw' &&
        post.thumbnail.startsWith('http')) {
      return post.thumbnail;
    }
    
    return null;
  }

  getTimeAgo(timestamp) {
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
    
    const minutes = Math.floor(diff / 60);
    if (minutes > 0) return `${minutes}m ago`;
    
    return 'just now';
  }

  formatScore(score) {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  }

  formatNumber(num) {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('reddit-tressless-feed');
  if (container) {
    new RedditFeed('reddit-tressless-feed', {
      subreddit: 'tressless',
      limit: 15,
      timeframe: 'all'
    });
  }
});
