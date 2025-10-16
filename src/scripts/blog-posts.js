/**
 * Blog Posts Data
 * 
 * SIMPLIFIED VERSION - Just list the slugs!
 * All metadata is now extracted from the blog post HTML files themselves.
 * 
 * To add a new blog post:
 * 1. Create your blog post HTML file
 * 2. Add the blog:* meta tags in the <head> section (see hair-loss-guide.html as example)
 * 3. Add the slug to the array below
 * 
 * Required meta tags in each blog post:
 * - blog:title
 * - blog:excerpt
 * - blog:date (YYYY-MM-DD format)
 * - blog:readTime
 * - blog:category
 * - blog:intro (optional - the explanation text that appears at the top)
 */

const blogPostSlugs = [
  'hair-loss-guide'
  // Add more slugs here as you create posts
  // 'microneedling-guide',
  // 'finasteride-guide',
  // etc.
];

// Helper function to format dates
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper function to get category emoji
function getCategoryEmoji(category) {
  const emojiMap = {
    'Comprehensive Guide': '📚',
    'Treatment Guide': '💊',
    'Advanced Protocol': '🔬',
    'Research Update': '🧪',
    'Clinical Study': '📊',
    'Protocol Optimization': '⚡',
    'Side Effects': '⚠️',
    'FAQ': '❓'
  };
  return emojiMap[category] || '📄';
}

// Fetch metadata from a blog post HTML file
async function fetchPostMetadata(slug) {
  try {
    const response = await fetch(`${slug}.html`);
    const html = await response.text();
    
    // Parse HTML to extract meta tags and content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract metadata from custom meta tags
    const getMetaContent = (name) => {
      const meta = doc.querySelector(`meta[name="${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };
    
    // Extract read time from the actual blog post content
    let readTime = '5 min read'; // default
    const allSpans = doc.querySelectorAll('span');
    for (const span of allSpans) {
      if (span.textContent.includes('min read')) {
        readTime = span.textContent.replace('📚', '').trim();
        break;
      }
    }
    
    return {
      slug: slug,
      title: getMetaContent('blog:title') || 'Untitled Post',
      excerpt: null, // Don't use excerpt anymore
      date: getMetaContent('blog:date') || new Date().toISOString().split('T')[0],
      readTime: readTime,
      category: getMetaContent('blog:category') || 'General',
      intro: getMetaContent('blog:intro') || null,
      emoji: getCategoryEmoji(getMetaContent('blog:category'))
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${slug}:`, error);
    return null;
  }
}

// Load all blog posts metadata
async function loadAllPosts() {
  const posts = await Promise.all(
    blogPostSlugs.map(slug => fetchPostMetadata(slug))
  );
  
  // Filter out any failed loads and sort by date (newest first)
  return posts
    .filter(post => post !== null)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { blogPostSlugs, formatDate, getCategoryEmoji, fetchPostMetadata, loadAllPosts };
}
