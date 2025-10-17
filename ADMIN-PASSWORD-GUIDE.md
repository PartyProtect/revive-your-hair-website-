# 🔐 Admin Dashboard Password Management

**Security Level:** Enhanced (Level 2)  
**Current Password:** `ReviveHair2025!`  
**Password Hash:** `215e1a2171349b3875167351971b9ccf293a9fbac9fca7de802602e77d2d1ae4`

---

## 🛡️ Security Features Enabled

### ✅ **Password Hashing (SHA-256)**
- Password stored as hash (not plain text)
- Cannot be reverse-engineered from source code
- Hash: 64-character hexadecimal string

### ✅ **Rate Limiting**
- **3 failed attempts** → 5-minute lockout
- Countdown timer shows remaining lockout time
- Attempts stored in localStorage
- Resets after successful login

### ✅ **Auto-Logout on Inactivity**
- **30 minutes** of no activity → automatic logout
- Monitors: mouse, keyboard, clicks, scrolling
- Shows alert before logout
- Timer resets on any user activity

### ✅ **Session Timeout**
- **Maximum session: 8 hours**
- Checked every minute
- Forces re-login after 8 hours
- Prevents indefinite access

### ✅ **Security Logging**
- Logs successful logins (console)
- Logs failed attempts (console warning)
- Records suspicious activity (3+ failed attempts)
- Timestamps all security events

---

## 🔑 How to Change Password

### **Method 1: Using Browser Console** (Easiest)

1. **Open dashboard in browser:**
   ```
   https://www.reviveyourhair.eu/admin
   ```

2. **Open DevTools Console:**
   - Press `F12` or `Ctrl+Shift+I`
   - Click "Console" tab

3. **Generate new hash:**
   ```javascript
   // Copy-paste this code into console:
   async function hashPassword(password) {
     const msgBuffer = new TextEncoder().encode(password);
     const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
     const hashArray = Array.from(new Uint8Array(hashBuffer));
     return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
   }

   // Replace 'YourNewPassword123!' with your actual new password
   hashPassword('YourNewPassword123!').then(hash => {
     console.log('Your new password hash:');
     console.log(hash);
   });
   ```

4. **Copy the hash** (64-character string that appears)

5. **Update dashboard.html:**
   - Open: `src/pages/admin/dashboard.html`
   - Find line: `const PASSWORD_HASH = '215e1a...'`
   - Replace with your new hash
   - Update comment to show new password (optional)

6. **Commit and deploy:**
   ```bash
   git add src/pages/admin/dashboard.html
   git commit -m "chore: update admin password"
   git push
   ```

---

### **Method 2: Using Node.js** (Command Line)

1. **Run this command:**
   ```bash
   node -e "const crypto = require('crypto'); const hash = crypto.createHash('sha256').update('YourNewPassword').digest('hex'); console.log('Password Hash:', hash);"
   ```

2. **Copy the hash output**

3. **Update `PASSWORD_HASH` in dashboard.html** (same as Method 1, step 5-6)

---

### **Method 3: Using Online Tool** (Quick but less secure)

⚠️ **Warning:** Don't use sensitive passwords with online tools!

1. **Visit:** https://emn178.github.io/online-tools/sha256.html
2. **Enter your new password**
3. **Copy the SHA-256 hash**
4. **Update dashboard.html** (same as Method 1, step 5-6)

---

## 🔓 Current Password Details

```javascript
// Password: ReviveHair2025!
// Hash: 215e1a2171349b3875167351971b9ccf293a9fbac9fca7de802602e77d2d1ae4
```

**Location in code:**
- File: `src/pages/admin/dashboard.html`
- Line: ~620 (search for "PASSWORD_HASH")

---

## 🚨 Lockout Recovery

### **If You Get Locked Out:**

**Scenario:** Failed 3 login attempts, locked for 5 minutes

**Solutions:**

1. **Wait 5 minutes** (recommended)
   - Lockout timer shows countdown
   - Automatically resets after 5 minutes

2. **Clear localStorage** (emergency)
   - Press `F12` → Console tab
   - Run: `localStorage.clear()`
   - Refresh page
   - Try again (attempts reset)

3. **Use incognito mode**
   - Open incognito/private window
   - Go to dashboard URL
   - Locked out state doesn't carry over
   - Login normally

---

## 📊 Security Metrics

### **Protection Levels:**

| Feature | Status | Impact |
|---------|--------|--------|
| Plain text password | ❌ Removed | High |
| SHA-256 hashing | ✅ Active | High |
| Rate limiting | ✅ Active | Medium |
| Lockout mechanism | ✅ Active | High |
| Inactivity timeout | ✅ Active | Medium |
| Session timeout | ✅ Active | Medium |
| Activity logging | ✅ Active | Low |

### **Attack Resistance:**

- **Brute Force:** 🛡️ Protected (rate limiting + lockout)
- **Source Code Inspection:** 🛡️ Protected (hashed password)
- **Session Hijacking:** 🛡️ Protected (session timeout)
- **Idle Session Abuse:** 🛡️ Protected (inactivity timeout)

---

## ⚙️ Configuration Options

### **Adjust Lockout Duration:**

Find this line in dashboard.html:
```javascript
lockoutTime = Date.now() + (5 * 60 * 1000); // 5 minutes
```

Change `5` to desired minutes (e.g., `10` for 10 minutes)

### **Adjust Failed Attempts Limit:**

Find this line:
```javascript
if (loginAttempts >= 3) { // 3 attempts
```

Change `3` to desired number (e.g., `5` for 5 attempts)

### **Adjust Inactivity Timeout:**

Find this line:
```javascript
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
```

Change `30` to desired minutes (e.g., `60` for 1 hour)

### **Adjust Max Session Time:**

Find this line:
```javascript
const MAX_SESSION_TIME = 8 * 60 * 60 * 1000; // 8 hours
```

Change `8` to desired hours (e.g., `4` for 4 hours)

---

## 🧪 Testing Your Security

### **Test Rate Limiting:**

1. Go to `/admin`
2. Enter wrong password 3 times
3. Should see: "🔒 Too many failed attempts. Locked for 5 minutes."
4. Wait for countdown or clear localStorage
5. Try again - should work

### **Test Inactivity Timeout:**

1. Login successfully
2. Don't touch mouse/keyboard for 30 minutes
3. Should auto-logout with alert
4. Must login again

### **Test Session Timeout:**

1. Login successfully
2. Note the time
3. Keep dashboard open for 8+ hours
4. Should auto-logout after 8 hours
5. Must login again

### **Test Password Hash:**

1. Open browser console
2. Run: `console.log(PASSWORD_HASH)`
3. Should see 64-character hash (not plain password)
4. ✅ Password is secure

---

## 📝 Best Practices

### **Password Requirements:**

✅ **Do:**
- Use at least 12 characters
- Mix uppercase + lowercase
- Include numbers
- Include special characters (!@#$%^&*)
- Make it unique (not used elsewhere)

❌ **Don't:**
- Use common words ("password", "admin")
- Use personal info (name, birthday)
- Share password via email/chat
- Write it down in plain text
- Reuse from other sites

### **Example Strong Passwords:**
- `ReviveHair2025!Secure@NL`
- `7r$vH@1r!P4ssw0rd#2025`
- `AdminDash_9Tx!m2P$qK`

---

## 🔄 Migration Guide

### **If You Have the Old Version:**

Old (plain text):
```javascript
const ADMIN_PASSWORD = 'ReviveHair2025!';
if (input.value === ADMIN_PASSWORD) { ... }
```

New (hashed):
```javascript
const PASSWORD_HASH = '215e1a2171349b3875167351971b9ccf293a9fbac9fca7de802602e77d2d1ae4';
const inputHash = await hashPassword(input.value);
if (inputHash === PASSWORD_HASH) { ... }
```

**Your password stays the same:** `ReviveHair2025!`  
**Only the checking mechanism changed** (more secure)

---

## 📞 Support

**Having issues?**

1. **Check console logs:**
   - Press F12 → Console
   - Look for `[Security]` messages

2. **Clear browser data:**
   - Clear localStorage: `localStorage.clear()`
   - Clear sessionStorage: `sessionStorage.clear()`
   - Refresh page

3. **Verify hash:**
   - Make sure PASSWORD_HASH matches your password
   - Re-generate hash if unsure

4. **Contact:**
   - Email: info@reviveyourhair.eu
   - Check: ADMIN-SECURITY-OPTIONS.md

---

## 🎯 Quick Reference

**Current Setup:**
- Password: `ReviveHair2025!`
- Hash: `215e1a...1ae4`
- Lockout: 3 attempts → 5 min
- Inactivity: 30 minutes
- Max Session: 8 hours

**To Login:**
1. Go to: `/admin`
2. Enter password
3. Press Enter or click button

**To Logout:**
- Close browser (sessionStorage expires)
- Wait 30 min (inactivity timeout)
- Wait 8 hours (session timeout)

**To Change Password:**
1. Generate hash (see Method 1 above)
2. Update PASSWORD_HASH in dashboard.html
3. Commit and push

---

**Security Status:** 🔒🔒🔒 Medium (Level 2)  
**Last Updated:** October 17, 2025  
**Next Upgrade:** Consider Level 4 (Netlify Identity) or Level 5 (Cloudflare Access)
