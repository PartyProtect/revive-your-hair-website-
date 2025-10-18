# Netlify Environment Variables Setup

## Required Environment Variables

You need to add these environment variables in the Netlify dashboard to complete the security setup.

### How to Add Environment Variables

1. Go to **Netlify Dashboard** → https://app.netlify.com
2. Select your site: **revive-your-hair-website**
3. Navigate to: **Site Configuration** → **Environment Variables**
4. Click **Add a variable** for each one below

---

## Variables to Add

### 1. ADMIN_PASSWORD_HASH
**Purpose:** Secures the admin dashboard with server-side password validation

- **Key:** `ADMIN_PASSWORD_HASH`
- **Value:** `215e1a2171349b3875167351971b9ccf293a9fbac9fca7de802602e77d2d1ae4`
- **Scopes:** All (production, deploy previews, branch deploys)

**Notes:**
- This is the SHA-256 hash of your password: `ReviveHair2025!`
- Password validation now happens on the server (not in client-side JavaScript)
- Attackers cannot bypass the password by editing browser code

---

### 2. ANALYTICS_API_KEY
**Purpose:** Protects analytics data from unauthorized access

- **Key:** `ANALYTICS_API_KEY`
- **Value:** Generate a strong random key (see options below)

**Option 1 - Auto-generate (Recommended):**
Run this in PowerShell to generate a secure random key:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option 2 - Manual:**
Create a random 32-character string using letters and numbers, like:
```
A9k2Lm5Nx7Pq3Rs8Tv6Wx4Yz1Bc0De2Fh
```

**Scopes:** All (production, deploy previews, branch deploys)

**Notes:**
- Without this key, the analytics endpoint returns 401 Unauthorized
- The dashboard automatically receives this key after successful login
- Public tracking (visitor pageviews, etc.) still works without authentication
- Only the **stats retrieval** endpoint requires the API key

---

## After Adding Variables

1. **Save** each variable in Netlify
2. **Trigger a redeploy** (Site Configuration → Build & deploy → Trigger deploy → Deploy site)
3. Wait 2-3 minutes for deployment to complete
4. **Test the admin dashboard:**
   - Visit: https://www.reviveyourhair.eu/admin
   - Enter password: `ReviveHair2025!`
   - Should see dashboard load successfully
   - Analytics stats should display (previously would show 401 error)

---

## Security Improvements Summary

### Before (Client-Side Only):
- ❌ Password hash visible in source code
- ❌ Attackers could bypass password check with browser DevTools
- ❌ Analytics data publicly accessible to anyone
- ❌ No session expiry or token validation

### After (Server-Side + API Keys):
- ✅ Password validated on server (hash never exposed to client)
- ✅ Session tokens expire after 8 hours
- ✅ Analytics API requires authentication (X-API-Key header)
- ✅ Rate limiting: 3 failed attempts = 5-minute lockout
- ✅ Login attempts tracked in server logs
- ✅ Separate auth function for scalability

---

## Troubleshooting

### Dashboard shows "Invalid password" but password is correct
- Check that `ADMIN_PASSWORD_HASH` is set correctly in Netlify
- Ensure you redeployed after adding the variable
- Check Netlify function logs for errors

### Analytics shows "Unauthorized" error
- Check that `ANALYTICS_API_KEY` is set in Netlify
- Ensure you redeployed after adding the variable
- Clear browser cache and re-login to the dashboard
- The session token doubles as the analytics API key

### Function errors
- Go to Netlify Dashboard → Functions → tracking
- Check recent invocations for error messages
- Common issue: Environment variables not set

---

## Password Change Guide

If you want to change the admin password in the future:

1. Generate new hash in browser console:
   ```javascript
   const password = 'YourNewPassword123';
   const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'salt-key-2025'));
   const hashArray = Array.from(new Uint8Array(hash));
   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
   console.log(hashHex);
   ```

2. Copy the output hash
3. Update `ADMIN_PASSWORD_HASH` in Netlify environment variables
4. Redeploy the site
5. Login with your new password

---

## Security Checklist

- [ ] Added `ADMIN_PASSWORD_HASH` environment variable
- [ ] Added `ANALYTICS_API_KEY` environment variable
- [ ] Redeployed site after adding variables
- [ ] Tested admin login at /admin
- [ ] Verified analytics dashboard loads data
- [ ] Checked Netlify function logs for errors
- [ ] Saved API key in password manager (if needed for direct API access)

---

## Next Steps

With these security fixes deployed:

1. ✅ Admin dashboard is server-side protected
2. ✅ Analytics data requires authentication
3. ✅ Rate limiting prevents brute force attacks
4. ✅ Session tokens auto-expire
5. ✅ GDPR-compliant (90-day data retention)

**Optional future enhancements:**
- Add 2FA (two-factor authentication)
- Add IP whitelist for admin access
- Add email notifications for failed login attempts
- Add admin user management (multiple users)
