# Fixed Email Test Plan

## ✅ Changes Made:

### 1. **Fixed Email Address**
- **Hardcoded Email**: `wixewi3757@icousd.com` (Your provided email)
- **API Switch**: Switched temp mail service to **1secmail** (because `icousd.com` is a 1secmail domain).
- **Blocking Fix**: Added random User-Agent headers to prevent 403 errors.

### 2. **Send Code Button**
- **Logic Confirmed**: The bot is programmed to click the **"Send code"** button immediately after submitting credentials.
- **Wait Time**: Added a small delay to ensure the request is processed before checking for the code.

## 🚀 How to Test:

1. **Start Bot**:
   ```bash
   cd bot
   npm run dev
   ```
2. **Watch Flow**:
   - Bot enters `wixewi3757@icousd.com`.
   - Bot clicks "Send code".
   - Bot polls 1secmail API for OTP.

**Note:** If you are checking the inbox manually in a browser, the bot should pick up the same code automatically.
