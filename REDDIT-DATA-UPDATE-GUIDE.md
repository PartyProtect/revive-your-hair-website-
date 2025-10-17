# Reddit Data Update Guide

This guide explains how to update the Reddit posts data displayed on the website.

## Background

The website displays top posts from r/tressless in a feed widget. The data is stored in a static JSON file that needs to be updated periodically to show fresh content.

## Current Approach: Static JSON File

- **File Location**: `src/reddit-tressless-top.json`
- **Why Static?**: Reddit blocks automated requests, so we use pre-fetched data
- **Update Frequency**: Recommended once per month (top posts don't change often)

---

## 🎯 Quick Update Guide (5 Minutes)

### Step 1: Open Reddit JSON in Your Browser

Visit this URL in your browser (Chrome, Firefox, Edge, etc.):
```
https://old.reddit.com/r/tressless/top/.json?t=all&limit=15
```

You should see JSON data starting with something like:
```json
{"kind": "Listing", "data": {"children": [...]}}
```

### Step 2: Copy the JSON Data

**Method A - Using Browser DevTools (Easiest)**:
1. Right-click on the page → "Inspect" or press F12
2. Go to "Console" tab
3. Paste this code and press Enter:
   ```javascript
   copy(JSON.stringify({
     data: JSON.parse(document.body.innerText).data,
     fetched_at: new Date().toISOString(),
     subreddit: "tressless",
     timeframe: "all"
   }, null, 2))
   ```
4. The formatted JSON is now copied to your clipboard!

**Method B - Manual Copy**:
1. Select all text (Ctrl+A or Cmd+A)
2. Copy (Ctrl+C or Cmd+C)
3. You'll format it in the next step

### Step 3: Update the File

1. Open `src/reddit-tressless-top.json` in VS Code
2. Delete all existing content
3. Paste the copied JSON

**If you used Method B (manual copy)**, wrap the Reddit data:
```json
{
  "data": PASTE_REDDIT_DATA_HERE,
  "fetched_at": "2024-01-15T10:30:00Z",
  "subreddit": "tressless",
  "timeframe": "all"
}
```

### Step 4: Commit and Deploy

Run these commands in terminal:
```bash
git add src/reddit-tressless-top.json
git commit -m "Update Reddit posts - $(Get-Date -Format 'yyyy-MM-dd')"
git push
```

**Done!** Netlify will auto-deploy in ~1 minute. Check your site to see fresh posts.

---

## 🤖 Alternative: Automated Script (May Be Blocked)

You can try the automated script, but Reddit often blocks it:

```bash
node fetch-reddit-posts.js
```

If successful:
```bash
git add src/reddit-tressless-top.json
git commit -m "Update Reddit posts data"
git push
```

**If blocked** (403 error or JSON parse errors), use the manual browser method above.

---

## 📋 Complete JSON Format Reference

The file must have this exact structure:

```json
{
  "data": {
    "children": [
      {
        "kind": "t3",
        "data": {
          "title": "6 Month Progress - Finasteride + Minoxidil",
          "permalink": "/r/tressless/comments/abc123/...",
          "score": 2841,
          "num_comments": 156,
          "created_utc": 1697500000,
          "thumbnail": "https://...",
          "url": "https://...",
          "author": "username",
          "subreddit": "tressless"
        }
      }
    ]
  },
  "fetched_at": "2024-01-15T10:30:00.000Z",
  "subreddit": "tressless",
  "timeframe": "all"
}
```

**Key fields the widget uses**:
- `title` - Post title shown in feed
- `permalink` - Link to Reddit post (relative URL)
- `score` - Upvotes shown with 👍 icon
- `num_comments` - Comment count shown with 💬 icon
- `created_utc` - Unix timestamp for "2y ago" display
- `thumbnail` - Post image (if available)

---

## 🔧 Troubleshooting

### Reddit Returns 403 or Blocks Request
**Cause**: Reddit's anti-bot protection  
**Solution**: Use manual browser method (your real browser bypasses this)

### JSON File Returns 404 on Live Site
**Cause**: File in wrong directory  
**Solution**: 
- Ensure file is at `src/reddit-tressless-top.json` (NOT `public/`)
- Reason: Netlify only deploys `src/` folder (see netlify.toml line 5)

### Posts Show But Are Old/Outdated
**Cause**: File not updated or not deployed  
**Check**:
1. ✅ File is in `src/reddit-tressless-top.json`
2. ✅ Changes committed: `git status` should be clean
3. ✅ Changes pushed: Check GitHub repository
4. ✅ Netlify deployed: Check Netlify dashboard (should show recent deploy)
5. ✅ Browser cache: Hard refresh (Ctrl+Shift+R)

### JSON Parse Error in Browser
**Cause**: Invalid JSON syntax  
**Solution**:
- Use a JSON validator: https://jsonlint.com/
- Common issues: Missing commas, extra commas, unescaped quotes
- Copy from Reddit again and be careful with formatting

### Widget Shows "Error Loading Posts"
**Check browser console (F12)**:
- If 404: File path wrong or not deployed
- If JSON error: File has invalid syntax
- If blank: Check `fetched_at` field is present

---

## 🎯 Why Manual Method Works Best

Reddit blocks most automation:
- ❌ Direct API calls → CORS policy blocks browsers
- ❌ Netlify Functions → Reddit blocks datacenter IPs (403)
- ❌ Node.js scripts → Reddit detects automation patterns
- ❌ GitHub Actions → Reddit blocks cloud provider IPs

✅ **Manual browser method works because**:
- Uses your real browser with your home IP address
- Reddit sees you as a regular user browsing
- JSON endpoint is public (no authentication needed)
- Takes only 2-5 minutes per update
- 100% reliable - no API blocks

---

## 📅 Recommended Update Schedule

**Monthly updates** are sufficient because:
- Top posts of "all time" rarely change ranking
- Hair loss is a slow-progress topic (updates take months)
- Feed shows engagement (upvotes/comments), not freshness

**Check if update needed**:
1. Visit https://www.reddit.com/r/tressless/top/?t=all
2. Compare top 5 post titles with your widget
3. If significantly different → update the data
4. If similar → wait another month

**Set a reminder**: First Monday of each month at 9am

---

## 🚀 Quick Command Reference

```powershell
# Check current file
Get-Content src/reddit-tressless-top.json | Select-String "fetched_at"

# Update and deploy (PowerShell)
git add src/reddit-tressless-top.json
git commit -m "Update Reddit posts - $(Get-Date -Format 'yyyy-MM-dd')"
git push

# Check deployment status
# Visit: https://app.netlify.com/sites/YOUR-SITE/deploys
```

---

## 📝 Notes

- The `timeframe: "all"` means "top posts of all time"
- You could also use `"year"` or `"month"` for more frequent updates
- The widget shows the first 15 posts from the array
- Reddit's JSON includes ~25 posts, but we only use 15
- The `fetched_at` timestamp helps you track when data was last updated
