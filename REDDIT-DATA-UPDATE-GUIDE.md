# How to Update Reddit Feed Data

## The Problem
Reddit blocks automated API requests, even from local scripts. They require authentication or manual browsing.

## The Solution
We use **static pre-fetched data** stored in `/public/reddit-tressless-top.json`. This approach:
- ✅ Always works (no API calls)
- ✅ Super fast (instant loading)
- ✅ No CORS or rate limiting issues
- ✅ No authentication needed
- ℹ️ Data updates manually (whenever you want)

## How to Update the Reddit Posts

### Option 1: Manual Browser Method (Easiest)

1. **Visit Reddit** in your browser:
   ```
   https://old.reddit.com/r/tressless/top/.json?t=all&limit=15
   ```

2. **Copy the JSON** (browser will show raw JSON data)

3. **Paste into file**: 
   - Open `/public/reddit-tressless-top.json`
   - Replace the content with the JSON you copied
   - Save the file

4. **Commit and push**:
   ```bash
   git add public/reddit-tressless-top.json
   git commit -m "Update Reddit posts"
   git push
   ```

### Option 2: Use Reddit API Tool (Advanced)

If you have a Reddit account, you can use their API:

1. Create a Reddit app at https://www.reddit.com/prefs/apps
2. Get OAuth credentials
3. Use a tool like Postman or curl with authentication
4. Save the response to the JSON file

### Option 3: Use Browser DevTools (Intermediate)

1. Visit https://old.reddit.com/r/tressless/top/?t=all
2. Open DevTools (F12) → Network tab
3. Look for the `.json` request
4. Copy the response
5. Clean it up and save to the JSON file

## File Structure

The JSON file should look like this:

```json
{
  "data": {
    "children": [
      {
        "data": {
          "title": "Post title here",
          "permalink": "/r/tressless/comments/xyz/",
          "score": 1234,
          "num_comments": 56,
          "created_utc": 1697500000,
          "thumbnail": "https://...",
          "url": "https://i.redd.it/..."
        }
      }
      // ... more posts
    ]
  },
  "fetched_at": "2025-10-17T00:00:00.000Z",
  "subreddit": "tressless",
  "timeframe": "all"
}
```

## How Often to Update?

- **Recommended**: Monthly or when launching new content
- **Why**: Top posts don't change frequently
- **Benefit**: Shows fresh, relevant content to visitors

## Current Data

The file currently contains **placeholder data** with generic post titles. You should update it with real Reddit data before going live, or leave as-is if you want example posts to show immediately.

## Testing

After updating the JSON file:
1. Commit and push to GitHub
2. Wait for Netlify to redeploy (~2 minutes)
3. Visit the blog post page
4. You should see the Reddit feed load instantly with your updated posts!
