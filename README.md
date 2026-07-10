# TikTok Account Creation Automation System

> **⚠️ Disclaimer**
>
> This repository is shared for **educational, research, and portfolio purposes only**. It demonstrates browser automation, queue management, and software engineering concepts. Any use of this project must comply with applicable laws, platform Terms of Service, and ethical guidelines. The author is not responsible for misuse of this code.

---

## 📖 Overview

The TikTok Account Creation Automation System is a full-stack automation platform designed to streamline large-scale account creation through an intuitive web dashboard. It combines browser automation, proxy rotation, CAPTCHA solving, queue management, and real-time monitoring into a single workflow.

---

## ✨ Features

- 🌐 Modern React dashboard
- 👤 User authentication
- 📦 Batch account creation
- 📊 Real-time progress tracking
- 🤖 Human-like browser automation
- 🔄 Automatic proxy rotation
- 🛡 CAPTCHA solving integration
- 📧 Temporary email verification
- 📄 CSV export
- 📈 Batch history and monitoring
- ⚡ Queue-based processing
- 🔁 Automatic retry mechanism

---

## 🛠 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js
- SQLite

### Automation

- Playwright
- Playwright Stealth

### Queue

- Redis
- Bull Queue

### Third-Party Services

- CapSolver
- 1SecMail

---

## 📂 Project Structure

```text
├── frontend/
│   ├── src/
│   └── public/
│
├── backend/
│   ├── routes/
│   ├── database/
│   └── services/
│
├── bot/
│   ├── workers/
│   ├── browser/
│   └── automation/
│
├── shared/
└── README.md
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/farooq977/TikTok-Account-Creation-Automation.git
```

Install dependencies

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

Install Playwright browsers

```bash
cd bot
npx playwright install chromium
```

---

## ▶️ Running the Application

### Backend

```bash
cd backend
npm run dev
```

### Bot Worker

```bash
cd bot
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## 🚀 Workflow

1. Login to the dashboard.
2. Create a new batch.
3. Select the number of accounts.
4. Start the automation process.
5. Browser automation launches.
6. CAPTCHA is solved automatically.
7. Temporary email verification is completed.
8. Account information is saved.
9. Export results as CSV.

---

## 📊 Dashboard Features

- User authentication
- Batch management
- Progress monitoring
- Queue management
- Account tracking
- CSV export
- Real-time updates

---

## 🔧 Configuration

Configure the following services using environment variables:

- Redis
- CapSolver API
- Residential Proxy Provider
- Temporary Email Provider

---

## 💼 Use Cases

- Browser automation research
- Queue management systems
- Playwright automation
- Workflow automation
- Dashboard development
- Educational demonstrations

---

## 🔮 Future Improvements

- Multi-browser support
- Docker deployment
- PostgreSQL support
- Multi-user roles
- Analytics dashboard
- REST API
- Email notifications

---

## 📄 License

This project is shared for **educational, research, and portfolio purposes only**. Unauthorized commercial redistribution or misuse is discouraged. Users are responsible for complying with applicable laws and the Terms of Service of any third-party platforms they interact with.
