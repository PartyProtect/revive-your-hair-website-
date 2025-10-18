# Complete Environment Variables Setup - READY TO COPY

## All 5 Required Environment Variables - GENERATED

Copy these EXACT values to Netlify Dashboard → Site configuration → Environment variables:

---

### 1. PASSWORD_SALT
**Purpose:** Salt for dashboard password hashing  
**Key:** `PASSWORD_SALT`  
**Value:** 
```
95b03d440d63d993ccf9a9fb155a3542d400d2378d42c4a8e82547323f512fd4
```
**Scope:** All (production, deploy previews, branch deploys)

---

### 2. SESSION_SECRET
**Purpose:** Secret key for signing dashboard session tokens (HMAC)  
**Key:** `SESSION_SECRET`  
**Value:**
```
1a7ae26bd09185e8a8fa82d2ecaad519e6a4153dd964e95c25b2aff1a4011c57
```
**Scope:** All (production, deploy previews, branch deploys)

---

### 3. ADMIN_PASSWORD_HASH
**Purpose:** SHA-256 hash of admin password + salt  
**Key:** `ADMIN_PASSWORD_HASH`  
**Value:**
```
cceffce844f436017dc0c0a58479f3cfd044661a011a5698b5a97dc221fa3f7d
```
**Scope:** All (production, deploy previews, branch deploys)

**Notes:**
- This is the hash of password `ReviveHair2025!` + PASSWORD_SALT above
- If you change the password, regenerate this hash with `generate-hash.js`

---

### 4. ANALYTICS_API_KEY
**Purpose:** Protects custom analytics stats endpoint  
**Key:** `ANALYTICS_API_KEY`  
**Value:**
```
19c7c5a1655ed636e9e8d597b8c8e0bb583b081bf91cfec2e6dc1f583a988eb8
```
**Scope:** All (production, deploy previews, branch deploys)

---

### 5. IP_HASH_SALT
**Purpose:** Salt for anonymizing visitor IP addresses (GDPR compliance)  
**Key:** `IP_HASH_SALT`  
**Value:**
```
3f6a1d6cdd84a00628b521e2ee8c12dfcd3cea9284fe37544bb15a820edf509c
```
**Scope:** All (production, deploy previews, branch deploys)

**⚠️ CRITICAL:** Once set, **NEVER CHANGE THIS** - it will break visitor tracking continuity

---

## Quick Copy Format for Netlify Dashboard

When adding variables in Netlify, use this format:

| Key | Value |
|-----|-------|
| `PASSWORD_SALT` | `95b03d440d63d993ccf9a9fb155a3542d400d2378d42c4a8e82547323f512fd4` |
| `SESSION_SECRET` | `1a7ae26bd09185e8a8fa82d2ecaad519e6a4153dd964e95c25b2aff1a4011c57` |
| `ADMIN_PASSWORD_HASH` | `cceffce844f436017dc0c0a58479f3cfd044661a011a5698b5a97dc221fa3f7d` |
| `ANALYTICS_API_KEY` | `19c7c5a1655ed636e9e8d597b8c8e0bb583b081bf91cfec2e6dc1f583a988eb8` |
| `IP_HASH_SALT` | `3f6a1d6cdd84a00628b521e2ee8c12dfcd3cea9284fe37544bb15a820edf509c` |

---

## Step-by-Step Instructions

### Step 1: Go to Netlify Dashboard
1. Open https://app.netlify.com
2. Select site: **revive-your-hair-website**
3. Click **Site configuration** (left sidebar)
4. Click **Environment variables**

### Step 2: Add Each Variable
For each of the 5 variables above:

1. Click **Add a variable**
2. **Key:** Copy from table above (e.g., `PASSWORD_SALT`)
3. **Value:** Copy from table above (the 64-character hex string)
4. **Scopes:** Select **All** (or check all boxes)
5. Click **Create variable**

Repeat for all 5 variables.

### Step 3: Trigger Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait 2-3 minutes for build to complete

### Step 4: Test Everything
1. Visit https://www.reviveyourhair.eu/admin
2. Login with password: `ReviveHair2025!`
3. Should see dashboard with analytics
4. Visit any page on your site (tracking should work)
5. Check browser console for `[Analytics] ✅ GA4 initialized`

---

## What Each Variable Does

### Dashboard Authentication (`dashboard-auth.js`)
- **PASSWORD_SALT:** Adds randomness to password hashing (prevents rainbow tables)
- **SESSION_SECRET:** Signs session tokens to prevent forgery
- **ADMIN_PASSWORD_HASH:** Stores hashed password securely

**Security:** Admin dashboard is now protected with:
- Rate limiting (5 attempts per 15 min)
- IP-based lockout (1 hour after max attempts)
- Session management (8-hour expiration)
- HMAC-signed tokens (unforgeable)

### Analytics Tracking (`tracking.js`)
- **ANALYTICS_API_KEY:** Protects stats endpoint from unauthorized access
- **IP_HASH_SALT:** Anonymizes visitor IPs (GDPR Article 32 compliance)

**Security:** Custom analytics is now protected with:
- API key authentication (stats endpoint only)
- Rate limiting (60 req/min on stats endpoint)
- IP anonymization (visitor privacy)
- Input validation (prevents malformed data)

### Google Analytics 4 (`analytics.js`)
- **GA4 Measurement ID:** `G-66VKV0D9D3` (hardcoded in JavaScript)
- No environment variables needed (public tracking ID)

**Features:**
- GDPR-compliant consent management
- Automatic event tracking (FAQs, outbound links, scroll depth)
- Performance monitoring
- Bot detection (blocks scrapers, allows search engines)

---

## Verification Checklist

After adding all variables and redeploying:

- [ ] Dashboard login works at `/admin` with `ReviveHair2025!`
- [ ] Analytics stats display in dashboard (no 401 errors)
- [ ] Google Analytics tracking visible in browser console (if debug enabled)
- [ ] Cookie consent banner appears on first visit
- [ ] Accepting consent loads Google Analytics
- [ ] Custom tracking endpoint works (check Network tab)
- [ ] No errors in Netlify function logs

**Check Netlify Function Logs:**
1. Go to Netlify Dashboard → Functions
2. Click `dashboard-auth` → Recent logs
3. Should see: `[Auth] Environment validation` (no errors)
4. Click `tracking` → Recent logs
5. Should see: `[Analytics] Data saved to Netlify Blobs`

---

## Security Notes

### Passwords
- **Current password:** `ReviveHair2025!`
- **To change:** Edit `generate-hash.js`, run `node generate-hash.js`, update `ADMIN_PASSWORD_HASH` in Netlify

### Salts (DO NOT CHANGE)
- **PASSWORD_SALT:** Changing this invalidates `ADMIN_PASSWORD_HASH` (requires regeneration)
- **IP_HASH_SALT:** ⚠️ **NEVER CHANGE** - breaks visitor tracking continuity

### Secrets (Can Rotate Annually)
- **SESSION_SECRET:** Regenerate annually, logs out all users
- **ANALYTICS_API_KEY:** Regenerate if compromised

### Backup
**Save these values securely:**
- Password manager (1Password, LastPass, Bitwarden)
- Encrypted file on secure storage
- **DO NOT** commit to repository (already in .gitignore)

---

## Troubleshooting

### Dashboard shows "Server configuration error"
**Cause:** Environment variables not set or incorrect  
**Fix:** Verify all 5 variables are added in Netlify, redeploy

### Dashboard login fails with correct password
**Cause:** `ADMIN_PASSWORD_HASH` doesn't match password + salt  
**Fix:** Regenerate hash with `node generate-hash.js`, update in Netlify

### Analytics shows 401 Unauthorized
**Cause:** `ANALYTICS_API_KEY` missing or incorrect  
**Fix:** Verify key is set in Netlify, redeploy

### Google Analytics not tracking
**Cause:** User hasn't accepted cookies, or GA4 ID incorrect  
**Fix:** Accept cookie consent banner, check browser console for errors

### "IP_HASH_SALT must be at least 32 characters"
**Cause:** Salt is too short or not set  
**Fix:** Use the 64-character hex value provided above

---

## Files That Use These Variables

### Server-Side (Netlify Functions)
- `netlify/functions/dashboard-auth.js` → Uses `PASSWORD_SALT`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`
- `netlify/functions/tracking.js` → Uses `ANALYTICS_API_KEY`, `IP_HASH_SALT`

### Client-Side (Browser JavaScript)
- `src/scripts/analytics.js` → Uses `G-66VKV0D9D3` (hardcoded, not from env var)
- No environment variables needed in browser (security best practice)

---

## Related Documentation

- **Dashboard Auth Setup:** `DASHBOARD-AUTH-ENV-SETUP.md`
- **Dashboard Auth Patch:** `DASHBOARD-AUTH-PATCH-SUMMARY.md`
- **Tracking Patch:** `TRACKING-PATCH-SUMMARY.md`
- **General Env Vars:** `NETLIFY-ENV-VARS-SETUP.md`
- **All Security Fixes:** `SECURITY-FIXES-SUMMARY.md`

---

## Status

✅ **All 5 environment variables generated**  
✅ **Google Analytics 4 ID configured:** `G-66VKV0D9D3`  
✅ **All security patches implemented**  
⏳ **Pending:** Add variables to Netlify dashboard  
⏳ **Pending:** Trigger redeploy and test

**Next Action:** Copy the 5 values above to Netlify Dashboard → Environment variables, then redeploy!
