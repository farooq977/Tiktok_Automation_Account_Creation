# Manual Test Mode Guide

## ✅ Changes Implemented for Testing:

### 1. **Manual Inputs**
- **Email**: Bot will now **STOP and ASK** you to enter an email in the terminal.
- **OTP**: Bot will **STOP and ASK** you to enter the verification code in the terminal.

### 2. **Process Reordered (New Flow)**
1. Bot fills DOB.
2. Bot fills Email.
3. Bot fills Password.
4. **Bot Clicks "Send Code"** (Moved before Submit).
5. **Wait Phase**: Bot waits for you to check your email manually.
6. **Input Phase**: You enter the code in the terminal.
7. Bot performs final **"Next/Submit"** click.

## 🚀 How to Run:
```bash
cd bot
npm run dev
```
Watch the terminal carefully for prompted questions like:
- `👉 Please Enter Email for Signup:`
- `👉 Open your Email, Get the Code, and Enter it here:`
