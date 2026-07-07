# Send Code Button & 403 Error Fix

## ✅ Issue Resolved

### 1. **"Send Code" Button Missing**
- **Problem**: The bot was waiting for the code immediately after submitting the email, but TikTok requires clicking a "Send code" button first.
- **Fix**: Added a step to check for and click the "Send code" button (`button:has-text("Send code")`) before polling for the email.

### 2. **1secmail 403 Blocked**
- **Problem**: 1secmail API was consistently returning `403 Forbidden` errors, completely blocking testing.
- **Fix**: Reverted to **`mail.tm`** which uses bearer token authentication and is generally more reliable for automation than the public 1secmail API.
- **Note**: `mail.tm` requires creating an account per email (handled automatically by the script) which avoids the public rate limits of 1secmail.

## 🚀 Corrected Flow:

1. Fill Email **& Click Outside** (Dropdown fix)
2. Fill Password & Submit
3. **CLICK "Send code" Button** (New Step!)
4. Wait for code (using `mail.tm`)
5. Enter code & Finish

## 🧪 Try It:

```bash
cd bot
npm run dev
```
You should now see the bot click the "Send code" button and successfully retrieve the code from mail.tm!
