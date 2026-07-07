# Mail.tm Automation Guide

## ✅ Fully Automated Flow Restored

### 1. **Automated mail.tm Integration**
- Bot now automatically creates a real request to `https://api.mail.tm`.
- No human intervention required.
- **Robust Polling**: Instead of giving up quickly, the bot will now wait **up to 10 minutes** for the OTP to arrive in the inbox. It checks every 5 seconds.

### 2. **Process Flow**
1. **Email Gen**: Bot calls `mail.tm/accounts` to create a new temp email.
2. **Fill Form**: Bot fills DOB, Email, Password.
3. **Send Code**: Bot clicks "Send Code".
4. **Wait/Poll**: Bot holds operation and constantly checks `mail.tm/messages`.
5. **Receive**: Once OTP arrives, bot extracts it.
6. **Submit**: Bot enters code and clicks Next.

## 🚀 How to Run:
```bash
cd bot
npm run dev
```
Just sit back and watch. The terminal will show:
`⏳ Waiting for verification code...`
`📨 Found 1 message(s) in inbox`
`✅ Verification code extracted: XXXXXX`
