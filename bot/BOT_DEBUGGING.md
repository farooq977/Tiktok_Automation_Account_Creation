# Bot Debugging Guide

## Issue: Bot stuck at "Filling date of birth"

### What I Added:

1. **Screenshots at Every Step:**
   - `step-1-initial-page-{accountId}.png` - First page load
   - `step-2-before-dob-{accountId}.png` - Before DOB filling
   - `step-2-no-month-selector-{accountId}.png` - If month selector not found
   - `step-3-after-dob-{accountId}.png` - After DOB filling
   - `page-html-{accountId}.html` - HTML dump for inspection

2. **Better Error Logging:**
   - Shows which selector failed
   - Logs total select elements found
   - Tries alternative input methods

3. **Improved Selectors:**
   - More selector variations
   - Timeout handling (5 seconds per selector)
   - Fallback to input fields if select not found

### How to Debug:

1. **Check Screenshots:**
```bash
cd bot/screenshots
open .  # Opens Finder
```

2. **Check Logs:**
```bash
cd bot
tail -50 logs/bot-2026-01-02.log
```

3. **Inspect HTML:**
```bash
# Open saved HTML in browser
open bot/screenshots/page-html-*.html
```

### Common Issues:

**Issue 1: TikTok Changed Page Structure**
- Check screenshot to see actual page
- Inspect HTML to find correct selectors
- Update selectors in tiktokSignup.js

**Issue 2: Bot Detected**
- TikTok shows "Suspicious activity" page
- Solution: Use different proxy, slower delays

**Issue 3: Wrong Signup Flow**
- TikTok has multiple signup pages (email/phone/social)
- Check if bot is on correct page
- May need to click "Use email" button first

### Next Steps:

1. Run bot with new changes
2. Check screenshots folder
3. Share screenshots if still stuck
4. Inspect HTML to find correct selectors

### Quick Test:

```bash
# Restart bot worker
cd bot
npm run dev

# Create 1 account batch from dashboard
# Check bot/screenshots/ folder for images
```
