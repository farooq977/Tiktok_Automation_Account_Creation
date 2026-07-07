# TikTok Account Creation Automation System

Automated TikTok account creation system with web dashboard for batch processing and real-time tracking.

## 🚀 Features

- **Web Dashboard**: User-friendly interface for account creation and tracking
- **Batch Processing**: Create 10, 20, 50, 100, or custom number of accounts
- **Real-time Progress**: Live updates during account creation
- **Smart Bot**: Human-like behavior with proxy rotation and CAPTCHA solving
- **Account Management**: Track all created accounts with detailed status
- **Export Data**: Download account details as CSV

## 📁 Project Structure

```
├── backend/          # Express.js API + SQLite database
├── bot/              # Playwright automation worker
├── frontend/         # React dashboard
└── shared/           # Shared utilities
```

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express.js + SQLite + Bull Queue
- **Bot**: Playwright (Node.js) + Stealth plugins
- **Queue**: Redis + Bull
- **APIs**: 1secmail (temp email), CapSolver (CAPTCHA)

## 📋 Prerequisites

- Node.js 18+ 
- Redis server
- CapSolver API key
- Residential proxy service (BrightData/Smartproxy)

## ⚙️ Installation

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Bot
cd ../bot
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in both `backend/` and `bot/` directories and fill in your API keys:

**bot/.env:**
```
CAPSOLVER_API_KEY=your-capsolver-api-key
PROXY_USERNAME=your-proxy-username
PROXY_PASSWORD=your-proxy-password
PROXY_SERVER=your-proxy-server.com
```

### 3. Install Playwright Browsers

```bash
cd bot
npx playwright install chromium
```

### 4. Start Redis Server

```bash
redis-server
```

## 🚀 Running the Application

Open 3 separate terminals:

### Terminal 1 - Backend API
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

### Terminal 2 - Bot Worker
```bash
cd bot
npm run dev
```

### Terminal 3 - Frontend Dashboard
```bash
cd frontend
npm run dev
```
Dashboard will open on `http://localhost:5173`

## 📖 Usage

1. Open dashboard at `http://localhost:5173`
2. Register a new user account
3. Login with your credentials
4. Select batch size (10, 20, 50, 100, or custom)
5. Click "Create Accounts" button
6. Watch real-time progress
7. View created accounts in the table
8. Export results to CSV

## ⚠️ Important Notes

- **Rate Limiting**: Bot creates accounts with 5-10 minute delays to avoid detection
- **Success Rate**: Depends on TikTok's anti-bot measures, proxies quality, and CAPTCHA solver
- **Legal Warning**: Automated account creation violates TikTok's Terms of Service

## 🔧 Configuration

Edit `bot/.env` to adjust:
- `MIN_DELAY_BETWEEN_ACCOUNTS`: Minimum delay (default: 5 min)
- `MAX_DELAY_BETWEEN_ACCOUNTS`: Maximum delay (default: 10 min)
- `MAX_RETRIES`: Retry attempts per account (default: 3)

## 📊 Database Schema

- **users**: Dashboard users
- **batches**: Batch requests with status
- **accounts**: Created TikTok accounts with details

## 🐛 Troubleshooting

**Redis Connection Error:**
```bash
# Make sure Redis is running
redis-server
```

**Playwright Browser Error:**
```bash
# Reinstall browsers
cd bot
npx playwright install --force
```

**CAPTCHA Not Solving:**
- Check CapSolver API balance
- Verify API key in `bot/.env`

**Proxy Errors:**
- Verify proxy credentials
- Test proxy connection manually

## 📝 License

MIT License - For educational purposes only

## ⚠️ Disclaimer

This tool is for educational and testing purposes only. Automated account creation violates TikTok's Terms of Service and may result in IP bans or legal consequences. Use at your own risk.
