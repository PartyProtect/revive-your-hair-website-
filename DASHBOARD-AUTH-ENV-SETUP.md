# Dashboard Authentication Environment Setup Guide

## Overview
The new secure dashboard authentication system requires **3 additional environment variables** beyond the existing `ADMIN_PASSWORD_HASH` and `ANALYTICS_API_KEY`.

## Required Environment Variables

### 1. PASSWORD_SALT (NEW)
**Purpose:** Random salt added to password before hashing  
**Security:** Must be 32+ characters, cryptographically random

**Generate:**
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Option 3: PowerShell
-join ((1..64) | ForEach-Object {'{0:x}' -f (Get-Random -Max 16)})
```

**Example output:** `7a8f9d3c2e1b4a5d6f8e9a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d`

**Add to Netlify:**
- Key: `PASSWORD_SALT`
- Value: `<your-generated-64-char-hex-string>`
- Scope: All (same as production)

---

### 2. SESSION_SECRET (NEW)
**Purpose:** Secret key for signing session tokens (HMAC)  
**Security:** Must be 32+ characters, cryptographically random, different from PASSWORD_SALT

**Generate:**
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Option 3: PowerShell
-join ((1..64) | ForEach-Object {'{0:x}' -f (Get-Random -Max 16)})
```

**Example output:** `3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4`

**Add to Netlify:**
- Key: `SESSION_SECRET`
- Value: `<your-generated-64-char-hex-string>`
- Scope: All (same as production)

---

### 3. ADMIN_PASSWORD_HASH (UPDATED)
**Purpose:** SHA-256 hash of your admin password + salt  
**Security:** Must be regenerated with the new PASSWORD_SALT

**⚠️ IMPORTANT:** The old `ADMIN_PASSWORD_HASH` used a hardcoded salt (`salt-key-2025`). You must regenerate it with your new `PASSWORD_SALT`.

**Generate:**

Create a file `generate-hash.js`:
```javascript
const crypto = require('crypto');

// Your admin password (⚠️ CHANGE THIS)
const password = 'ReviveHair2025!';

// Your PASSWORD_SALT from step 1 (⚠️ USE THE SAME VALUE)
const salt = '7a8f9d3c2e1b4a5d6f8e9a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d';

const hash = crypto
  .createHash('sha256')
  .update(password + salt)
  .digest('hex');

console.log('ADMIN_PASSWORD_HASH:', hash);
```

Run it:
```bash
node generate-hash.js
```

**Example output:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

**Update in Netlify:**
- Key: `ADMIN_PASSWORD_HASH` (already exists - update it)
- Value: `<your-new-hash-64-chars>`
- Scope: All (same as production)

---

### 4. ANALYTICS_API_KEY (EXISTING)
**Purpose:** API key for custom analytics endpoint  
**Status:** Already set from previous security fixes

**If not set yet:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to Netlify:**
- Key: `ANALYTICS_API_KEY`
- Value: `<your-generated-64-char-hex-string>`
- Scope: All (same as production)

---

## Complete Setup Checklist

### Step 1: Generate All Values
Run these commands and save outputs:
```bash
# Generate PASSWORD_SALT
node -e "console.log('PASSWORD_SALT:', require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log('SESSION_SECRET:', require('crypto').randomBytes(32).toString('hex'))"

# Generate ANALYTICS_API_KEY (if not already set)
node -e "console.log('ANALYTICS_API_KEY:', require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Generate Password Hash
Create `generate-hash.js`:
```javascript
const crypto = require('crypto');

const password = 'YOUR_ACTUAL_PASSWORD_HERE';  // ⚠️ CHANGE THIS
const salt = 'PASTE_PASSWORD_SALT_FROM_STEP_1';  // ⚠️ PASTE FROM STEP 1

const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
console.log('ADMIN_PASSWORD_HASH:', hash);
```

Run:
```bash
node generate-hash.js
```

### Step 3: Add to Netlify
1. Go to: https://app.netlify.com
2. Select your site: **revive-your-hair-website**
3. Navigate to: **Site configuration** → **Environment variables**
4. Click **Add a variable** (or **Edit** for ADMIN_PASSWORD_HASH)

Add these 4 variables:

| Key | Value | Notes |
|-----|-------|-------|
| `PASSWORD_SALT` | `<64-char hex from step 1>` | New - must be 32+ chars |
| `SESSION_SECRET` | `<64-char hex from step 1>` | New - different from salt |
| `ADMIN_PASSWORD_HASH` | `<64-char hex from step 2>` | Update existing value |
| `ANALYTICS_API_KEY` | `<64-char hex from step 1>` | May already exist |

### Step 4: Deploy
1. **Option A:** Trigger redeploy in Netlify dashboard  
   Site overview → Deploys → Trigger deploy → Deploy site

2. **Option B:** Push any change to GitHub (auto-deploys)
   ```bash
   git commit --allow-empty -m "trigger redeploy with new env vars"
   git push origin main
   ```

### Step 5: Test
1. Wait 2-3 minutes for deployment to complete
2. Visit: https://www.reviveyourhair.eu/admin
3. Try logging in with your password
4. Check browser console for errors
5. Verify rate limiting (try wrong password 6 times, should lock for 1 hour)

---

## Security Features Enabled

### ✅ Rate Limiting
- **Max attempts:** 5 per 15 minutes per IP
- **Lockout duration:** 1 hour after max attempts exceeded
- **Reset:** Automatic after successful login

### ✅ Session Management
- **Token generation:** Cryptographically secure 32-byte tokens
- **Token signing:** HMAC-SHA256 with SESSION_SECRET
- **Expiration:** 8 hours (configurable in code)
- **Validation:** Server-side signature verification
- **Storage:** Netlify Blobs (persistent across cold starts)

### ✅ CORS Protection
- **Allowed origins:** Only your domain + localhost for dev
- **Credentials:** Properly scoped, not global `*`
- **Preflight:** OPTIONS requests handled correctly

### ✅ Password Security
- **No hardcoding:** All secrets in environment variables
- **Salted hashing:** SHA-256 with random 32-byte salt
- **Timing-safe comparison:** Prevents timing attacks
- **Validation:** Checks hash format on startup

### ✅ Session Endpoints
```
POST /.netlify/functions/dashboard-auth
  → Login with password → Returns token + signature

GET /.netlify/functions/dashboard-auth?action=validate
  → Validate session token → Returns expiration info

GET /.netlify/functions/dashboard-auth?action=logout
  → Invalidate session → Clears token from storage
```

---

## Troubleshooting

### Error: "Missing required environment variables"
**Cause:** One or more environment variables not set  
**Solution:** Check Netlify dashboard → Environment variables → Ensure all 4 are set

### Error: "PASSWORD_SALT must be at least 32 characters"
**Cause:** Generated salt is too short  
**Solution:** Regenerate with `randomBytes(32)` (produces 64 hex chars)

### Error: "ADMIN_PASSWORD_HASH must be a valid SHA-256 hash"
**Cause:** Hash is not 64 hex characters  
**Solution:** Ensure you're using SHA-256 and outputting hex format

### Login fails with correct password
**Cause:** Password hash doesn't match (likely wrong salt)  
**Solution:** Regenerate ADMIN_PASSWORD_HASH using the exact same PASSWORD_SALT from Netlify

### Rate limit not working
**Cause:** Netlify Blobs not configured  
**Solution:** Ensure `@netlify/blobs` package is in package.json (should already be installed)

### CORS errors in browser console
**Cause:** Origin not whitelisted  
**Solution:** Check `ALLOWED_ORIGINS` in dashboard-auth.js, add your domain if missing

---

## Maintenance

### Changing Admin Password
1. Generate new hash with existing `PASSWORD_SALT`
2. Update `ADMIN_PASSWORD_HASH` in Netlify
3. Redeploy site
4. All existing sessions remain valid (no logout required)

### Rotating Secrets (Recommended Annually)
1. Generate new `PASSWORD_SALT` and `SESSION_SECRET`
2. Regenerate `ADMIN_PASSWORD_HASH` with new salt
3. Update all 3 in Netlify
4. Redeploy site
5. **⚠️ All users will be logged out** (sessions invalidated)

### Monitoring
Check Netlify function logs for:
- `[Auth] ✅ Successful login from <IP>` - Successful logins
- `[Auth] Failed login attempt from <IP> (X/5)` - Failed attempts
- `[Auth] Rate limit exceeded for IP: <IP>` - Blocked attempts
- `[Auth] Environment validation failed` - Configuration errors

---

## Old vs New Comparison

### OLD (Insecure)
```javascript
// ❌ Hardcoded salt
const inputHash = crypto.createHash('sha256')
  .update(password + 'salt-key-2025')
  .digest('hex');

// ❌ Fallback to hardcoded hash
const correctHash = process.env.ADMIN_PASSWORD_HASH || 
  '215e1a2171349b3875167351971b9ccf293a9fbac9fca7de802602e77d2d1ae4';

// ❌ No rate limiting
// ❌ No session validation
// ❌ Wildcard CORS: '*'
// ❌ Simple equality check (timing attack vulnerable)
```

### NEW (Secure)
```javascript
// ✅ Salt from environment variable
const inputHash = crypto.createHash('sha256')
  .update(password + process.env.PASSWORD_SALT)
  .digest('hex');

// ✅ No fallback, fails if not set
const correctHash = process.env.ADMIN_PASSWORD_HASH;

// ✅ Timing-safe comparison
const passwordMatches = crypto.timingSafeEqual(
  Buffer.from(inputHash),
  Buffer.from(correctHash)
);

// ✅ Rate limiting: 5 attempts per 15 minutes
// ✅ Session tokens: HMAC-signed, 8-hour expiration
// ✅ CORS: Whitelisted origins only
// ✅ Persistent storage: Netlify Blobs
```

---

## Related Files

- **Authentication function:** `netlify/functions/dashboard-auth.js`
- **Dashboard page:** `src/admin/dashboard.html` (may need updates to use new session API)
- **Netlify config:** `netlify.toml` (function settings)
- **Documentation:** `NETLIFY-ENV-VARS-SETUP.md` (analytics setup)
- **Security summary:** `SECURITY-FIXES-SUMMARY.md` (all fixes overview)

---

## Need Help?

1. Check Netlify function logs: Site overview → Functions → dashboard-auth → Recent logs
2. Test locally: `netlify dev` (requires Netlify CLI + local env vars in `.env`)
3. Verify environment variables: Check they're exactly 64 hex characters (no spaces/quotes)
4. Review this guide: Ensure all steps completed in order

**Remember:** After adding/updating environment variables, always trigger a new deployment!
