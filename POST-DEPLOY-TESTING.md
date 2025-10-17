# Post-Deploy Testing Checklist

**Date:** October 17, 2025  
**Changes:** Clean URLs + Enhanced Security Headers

---

## 🧪 Testing Steps After Deploy

### 1. Clean URL Navigation ✅

**Test Homepage:**
```
Visit: https://www.reviveyourhair.eu/
Expected: ✅ Loads correctly
```

**Test Blog Index:**
```
Visit: https://www.reviveyourhair.eu/blog
Expected: ✅ Blog index page loads
URL stays: /blog (no /pages/ visible)
```

**Test Blog Post:**
```
Visit: https://www.reviveyourhair.eu/blog/hair-loss-guide
Expected: ✅ Hair loss guide loads
URL stays: /blog/hair-loss-guide
```

**Test Legal Pages:**
```
Visit: https://www.reviveyourhair.eu/legal/privacy-policy
Expected: ✅ Privacy policy loads
URL stays: /legal/privacy-policy
```

---

### 2. Old URL Redirects ✅

**Test Old Blog URL:**
```
Visit: https://www.reviveyourhair.eu/pages/blog/hair-loss-guide.html
Expected: ✅ 301 redirect to /blog/hair-loss-guide
Check: DevTools → Network → See "301 Moved Permanently"
```

**Test Old Legal URL:**
```
Visit: https://www.reviveyourhair.eu/pages/legal/privacy-policy.html
Expected: ✅ 301 redirect to /legal/privacy-policy
```

---

### 3. Internal Links Work ✅

**Test Header Navigation:**
1. Click "Blog" in header
   - Expected: Navigates to `/blog`
2. Click "About" in header
   - Expected: Navigates to `/about`
3. Click "Contact" in header
   - Expected: Navigates to `/contact`

**Test Footer Links:**
1. Scroll to footer
2. Click "Hair Loss Guide" in Resources
   - Expected: Navigates to `/blog/hair-loss-guide`
3. Click "Privacy Policy" in Legal
   - Expected: Navigates to `/legal/privacy-policy`

**Test CTA Buttons:**
1. On homepage, find "Read the Full Guide →" button
   - Expected: Links to `/blog/hair-loss-guide`
2. On store page, find "Read Our Treatment Guide" button
   - Expected: Links to `/blog/hair-loss-guide`

---

### 4. Security Headers ✅

**Check Headers in Browser:**

1. **Open DevTools** (F12)
2. Go to **Network** tab
3. Visit: `https://www.reviveyourhair.eu/`
4. Click on the document request (first row)
5. Go to **Headers** tab → **Response Headers**

**Verify These Headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()...
```

**Screenshot What You Should See:**
```
Response Headers
├── X-Frame-Options: DENY ✅
├── X-Content-Type-Options: nosniff ✅
├── X-XSS-Protection: 1; mode=block ✅
├── Referrer-Policy: strict-origin-when-cross-origin ✅
└── Permissions-Policy: geolocation=(), microphone=(), camera=()... ✅
```

---

### 5. Clickjacking Protection ✅

**Test X-Frame-Options: DENY**

**Method 1: Browser Console**
1. Open DevTools console
2. Paste this code:
```javascript
let iframe = document.createElement('iframe');
iframe.src = 'https://www.reviveyourhair.eu/';
document.body.appendChild(iframe);
```
3. **Expected:** Console error: "Refused to display ... in a frame because it set 'X-Frame-Options' to 'deny'."

**Method 2: External Test**
1. Create test HTML file:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Testing Clickjacking Protection</h1>
  <iframe src="https://www.reviveyourhair.eu/" width="800" height="600"></iframe>
</body>
</html>
```
2. Open in browser
3. **Expected:** Iframe is blank, console shows error

**Result:** ✅ Your site cannot be embedded = Protected against clickjacking

---

### 6. SEO Verification ✅

**Check Canonical URLs:**
```
1. Visit: https://www.reviveyourhair.eu/blog/hair-loss-guide
2. View page source (Ctrl+U)
3. Search for: rel="canonical"
4. Expected: <link rel="canonical" href="https://www.reviveyourhair.eu/blog/hair-loss-guide.html">
```

**Check Breadcrumb Schema:**
```
1. View page source on hair-loss-guide
2. Search for: BreadcrumbList
3. Expected: URLs like "https://www.reviveyourhair.eu/blog/"
```

**Check Sitemap:**
```
Visit: https://www.reviveyourhair.eu/sitemap.xml
Expected: All URLs use clean format (/blog/, /legal/, etc.)
```

---

### 7. Google Search Console ✅

**Submit New URLs (Optional but Recommended):**

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (www.reviveyourhair.eu)
3. Click **URL Inspection** (top search bar)
4. Enter: `https://www.reviveyourhair.eu/blog/hair-loss-guide`
5. Click **Request Indexing**

**What This Does:**
- Tells Google about your clean URLs
- 301 redirects will automatically transfer rankings
- But requesting indexing speeds up the process

---

### 8. Mobile Testing ✅

**Test on Mobile Device:**
```
1. Visit: https://www.reviveyourhair.eu/blog
2. Verify: Page loads correctly
3. Click: Header navigation links
4. Verify: All links work with clean URLs
```

**Or Use Chrome DevTools:**
```
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Select: iPhone 12 Pro or similar
3. Test: Navigation works
```

---

### 9. Performance Check ✅

**Check Page Load Speed:**

**Method 1: Browser DevTools**
```
1. F12 → Network tab
2. Reload page
3. Check: Total load time at bottom
4. Expected: < 3 seconds
```

**Method 2: PageSpeed Insights**
```
1. Visit: https://pagespeed.web.dev/
2. Enter: https://www.reviveyourhair.eu/blog/hair-loss-guide
3. Expected: Score 90+ (unchanged from before)
```

**Redirects Should Not Slow Down Site:**
- Rewrites (200): No extra request
- Direct navigation to clean URLs: Zero redirects

---

### 10. 404 Error Handling ✅

**Test 404 Page:**
```
Visit: https://www.reviveyourhair.eu/this-page-does-not-exist
Expected: Custom 404 page loads
Check: /pages/404.html is displayed
```

---

## 🚨 What to Watch For

### Potential Issues:

**Issue 1: Redirect Loop**
- **Symptom:** Page keeps refreshing, never loads
- **Cause:** Conflicting redirect rules
- **Solution:** Check `_redirects` and `netlify.toml` for duplicates

**Issue 2: 404 on Clean URLs**
- **Symptom:** `/blog` shows 404 error
- **Cause:** `_redirects` file not deployed
- **Solution:** Verify `public/_redirects` is in the deploy

**Issue 3: Headers Not Showing**
- **Symptom:** X-Frame-Options still shows SAMEORIGIN
- **Cause:** Browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R) or test in incognito

**Issue 4: Old URLs Still Visible**
- **Symptom:** Internal links still point to `/pages/blog/`
- **Cause:** Build didn't include updated files
- **Solution:** Check git commit includes all changed files

---

## ✅ Success Criteria

**All tests pass if:**

1. ✅ Clean URLs load correctly (`/blog`, `/legal/privacy-policy`)
2. ✅ Old URLs redirect with 301 status
3. ✅ Internal links use clean URLs
4. ✅ Security headers present in response
5. ✅ Clickjacking protection works (iframe blocked)
6. ✅ SEO metadata correct (canonical, schemas, sitemap)
7. ✅ Mobile navigation works
8. ✅ No performance regression
9. ✅ 404 page works for invalid URLs
10. ✅ No console errors

---

## 🔍 Tools for Testing

### Browser Tools
- **Chrome DevTools** (F12) - Network, Console, Elements
- **Firefox DevTools** (F12) - Similar to Chrome
- **Safari Web Inspector** - For iOS testing

### Online Tools
- **Google Search Console** - URL inspection, indexing
- **PageSpeed Insights** - Performance verification
- **SecurityHeaders.com** - Header analysis
- **Redirect Checker** - https://httpstatus.io/ - Check 301s

### Command Line
```powershell
# Check headers
curl -I https://www.reviveyourhair.eu/

# Check redirect
curl -I https://www.reviveyourhair.eu/pages/blog/hair-loss-guide.html

# Follow redirects
curl -L -I https://www.reviveyourhair.eu/pages/blog/hair-loss-guide.html
```

---

## 📊 Expected Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Clean URLs load | ✅ 200 OK | |
| Old URLs redirect | ✅ 301 to clean URL | |
| Internal links | ✅ Point to clean URLs | |
| Security headers | ✅ All present | |
| Clickjacking | ✅ Blocked | |
| SEO metadata | ✅ Clean URLs | |
| Mobile | ✅ Works correctly | |
| Performance | ✅ No slowdown | |
| 404 handling | ✅ Custom page | |
| No errors | ✅ Console clean | |

---

## 🎉 Deployment Checklist

**Before deploying:**
- [x] All files committed to git
- [x] Commit message descriptive
- [x] No local-only changes

**After deploying:**
- [ ] Run through all 10 test sections above
- [ ] Check at least 3 pages (homepage, blog, legal)
- [ ] Test on mobile device or emulator
- [ ] Verify security headers
- [ ] Monitor for any console errors

**If all tests pass:**
- [ ] Update Google Search Console (optional)
- [ ] Monitor analytics for broken links (if enabled)
- [ ] Mark this checklist as complete!

---

## 💡 Pro Tips

1. **Use Incognito Mode** - Avoids cache issues during testing
2. **Test Multiple Browsers** - Chrome, Firefox, Safari
3. **Check on Real Mobile** - Emulators don't catch everything
4. **Monitor for 24 Hours** - Watch for any user reports
5. **Keep This Checklist** - Reference for future updates

---

**Happy Testing! 🚀**

All changes are backward-compatible and SEO-safe. The only visible difference to users is cleaner URLs in their address bar!
