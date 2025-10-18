# Security, Tracking, Redirects & Bot Behavior Files

This folder contains all files related to security, tracking, bot blocking, and redirects from the Revive Your Hair website.

## Files Included:

### 1. **netlify.toml** 
**Purpose:** Master configuration file for Netlify hosting
- All URL redirects (clean URLs, blog routes, 404 handling)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Content-Type headers for sitemap.xml and robots.txt
- Build commands

**Key Sections:**
- Lines 8-102: Redirect rules
- Lines 104-139: HTTP headers

---

### 2. **robots.txt**
**Purpose:** Instructions for search engine crawlers
- Allows Googlebot and Bingbot
- Blocks bad bots (AhrefsBot, SemrushBot, MJ12bot, DotBot)
- Declares sitemap location
- Blocks /admin/ and /legal/ from indexing

**Bot Permissions:**
- ✅ Googlebot: Full access
- ✅ Bingbot: Full access
- ❌ AhrefsBot, SemrushBot, etc.: Blocked

---

### 3. **analytics.js**
**Purpose:** Google Analytics 4 integration + bot detection
- `isBotTraffic()` function - detects automated traffic
- Bot patterns: `/bot/i, /crawl/i, /spider/i` etc.
- Blocks analytics for detected bots (doesn't block page access)
- GDPR consent checking

**Bot Detection Patterns (Lines 33-37):**
```javascript
/bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
/headless/i, /phantom/i, /selenium/i, /webdriver/i,
/ahref/i, /semrush/i, /mj12/i, /dotbot/i, /bingpreview/i,
/screaming\s?frog/i, /lighthouse/i, /gtmetrix/i
```

---

### 4. **tracking.js** (Client-side)
**Purpose:** Custom privacy-friendly analytics tracking
- Session tracking
- Scroll tracking
- Click tracking
- Performance metrics
- GDPR compliance
- Consent management

**Features:**
- No third-party dependencies
- localStorage for session data
- Sends data to Netlify function

---

### 5. **tracking-function.js** (Server-side)
**Purpose:** Backend Netlify Function for analytics data collection
- Receives tracking data from client
- Server-side data validation
- Rate limiting (prevents spam)
- Stores analytics data

**Security:**
- CORS configured
- Input validation
- Rate limiting per IP

---

### 6. **reddit-proxy.js**
**Purpose:** Proxy server for Reddit API requests
- Bypasses CORS restrictions
- Fetches Reddit posts server-side
- Caches responses

**Why needed:**
- Reddit API blocks client-side requests from browsers
- Proxy adds proper CORS headers

---

### 7. **cookie-consent.html**
**Purpose:** GDPR-compliant cookie consent banner
- Cookie consent UI component
- Manages user tracking preferences
- localStorage for consent state
- Enables/disables analytics based on consent

**Compliance:**
- GDPR compliant
- User can accept/reject tracking
- Preference saved across sessions

---

### 8. **dashboard.html**
**Purpose:** Admin dashboard (password protected)
- Analytics viewing interface
- Password: `ReviveHair2025!`
- SHA-256 password hashing
- Rate limiting on login attempts

**Security Features:**
- `<meta name="robots" content="noindex, nofollow">` - hidden from search engines
- robots.txt blocks `/admin/` path
- Client-side password hashing
- Session authentication

---

## Security Overview:

### What Gets Blocked:
- ❌ Bad bots from analytics tracking (AhrefsBot, SemrushBot, etc.)
- ❌ Headless browsers from analytics (Selenium, PhantomJS, etc.)
- ❌ /admin/ path from search engine indexing
- ❌ /legal/ pages from search results (but still accessible)

### What Stays Open:
- ✅ Googlebot - full site access + analytics tracking allowed
- ✅ Bingbot - full site access + analytics tracking allowed  
- ✅ All HTML pages publicly accessible
- ✅ sitemap.xml - clean headers, no CSP interference
- ✅ robots.txt - proper text/plain content-type

### Redirect Strategy:
- Clean URLs: `/blog/hair-loss-guide` → `/blog/hair-loss-guide.html`
- Trailing slashes: `/blog/hair-loss-guide/` → 301 redirect
- 404 handling: All unknown URLs → `/404.html`

---

## Recent Fixes (Oct 18, 2025):

1. ✅ Security headers now only apply to `/*.html` files (not sitemap/robots)
2. ✅ Sitemap.xml gets clean XML headers without CSP interference
3. ✅ robots.txt gets proper text/plain content-type
4. ✅ All `/pages/` references removed from redirects
5. ✅ Bot detection only affects analytics, not page access

---

## File Locations in Project:

```
revive-your-hair-website/
├── netlify.toml                    # Main config
├── src/
│   ├── robots.txt                  # Crawler rules
│   ├── scripts/
│   │   ├── analytics.js            # Bot detection + GA4
│   │   └── tracking.js             # Custom tracking
│   ├── components/
│   │   └── cookie-consent.html     # GDPR consent
│   └── admin/
│       └── dashboard.html          # Admin panel
└── netlify/
    └── functions/
        ├── tracking.js             # Backend analytics
        └── reddit-proxy.js         # Reddit API proxy
```

---

## Contact:
For questions about these configurations, check the main README or commit history.

Last Updated: October 18, 2025
