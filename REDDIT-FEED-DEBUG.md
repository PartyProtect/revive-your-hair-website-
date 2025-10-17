# Reddit Feed Troubleshooting Guide

## Current Status
The Reddit feed widget is showing "Unable to load posts at the moment" on the live site.

## What We've Done
✅ **Enhanced Debug Logging** - Added comprehensive console.log statements throughout reddit-feed.js
✅ **Updated CSP Headers** - Modified netlify.toml to allow connections to Reddit's API
✅ **Error Display** - Show detailed error messages in the UI
✅ **Removed Duplicate Headers** - Fixed netlify.toml duplicate header sections

## Most Likely Cause: CORS Policy 🚫

**Reddit's API blocks browser requests from external domains** due to Cross-Origin Resource Sharing (CORS) restrictions. This is the #1 most common issue when trying to fetch Reddit data directly from client-side JavaScript.

### Why This Happens:
- Reddit's API is designed for server-side access or OAuth-authenticated apps
- Browser security (CORS) prevents websites from making requests to Reddit's API
- Even though the endpoint is public, CORS headers from Reddit don't allow browser access

## How to Diagnose (Do This First!)

### Step 1: Check Browser Console
1. Open the blog post page (hair-loss-guide.html)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for messages starting with `[Reddit Feed]`
5. Take a screenshot or copy the error messages

### Expected Errors (if CORS is the issue):
```
Access to fetch at 'https://www.reddit.com/r/tressless/top.json' from origin 'https://reviveyourhair.eu' has been blocked by CORS policy
```

Or:
```
TypeError: Failed to fetch
```

## Solutions (In Order of Recommendation)

### ✅ Solution 1: Netlify Functions Proxy (Best)
Create a server-side function that fetches from Reddit (no CORS restrictions), then your frontend calls this function.

**Pros:**
- Secure and reliable
- No CORS issues (server-to-server)
- Can add caching to reduce API calls
- Full control over data

**Implementation:**
1. Create `netlify/functions/reddit-proxy.js`
2. Fetch Reddit data server-side
3. Update `reddit-feed.js` to call `/.netlify/functions/reddit-proxy`

### ✅ Solution 2: Pre-fetch at Build Time (Fastest)
Fetch top posts during Netlify build, save to static JSON file, load from file.

**Pros:**
- No API calls at runtime (fast!)
- No CORS issues
- No rate limiting concerns
- Always available

**Cons:**
- Data only updates when you rebuild/redeploy site
- Not "live" data

### ⚠️ Solution 3: Try old.reddit.com
Sometimes old Reddit has different CORS settings.

**Quick Test:**
Change line 31 in reddit-feed.js:
```javascript
// From:
const url = `https://www.reddit.com/r/${this.subreddit}/top.json?t=${this.timeframe}&limit=${this.limit}`;

// To:
const url = `https://old.reddit.com/r/${this.subreddit}/top.json?t=${this.timeframe}&limit=${this.limit}`;
```

### ❌ Solution 4: CORS Proxy Services (Not Recommended)
Third-party services like `cors-anywhere` or `allorigins.win` can proxy requests, but:
- Unreliable (services go down)
- Privacy concerns (data goes through third-party)
- Rate limits
- Not professional

## Next Steps

1. **Check console logs** (wait for Netlify to redeploy in ~2 minutes)
2. **Send me the error message** from browser console
3. **I'll implement the appropriate solution** based on the specific error

## Files Changed
- ✅ `src/scripts/reddit-feed.js` - Added debug logging
- ✅ `netlify.toml` - Updated CSP headers to allow Reddit
- ✅ Created TODO list with 8 diagnostic steps

## Testing After Netlify Redeploys

Once Netlify finishes deploying:
1. Visit: https://reviveyourhair.eu/pages/blog/hair-loss-guide.html
2. Scroll to "Real Results from Real People" section
3. Open browser console (F12)
4. Look for messages starting with `[Reddit Feed]`
5. Share the error message with me

The enhanced logging will tell us exactly what's failing!
