#!/bin/bash

echo "🚀 TikTok Automation - One-Click Installation"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed!"
    echo "📥 Installing Redis..."
    
    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
    # Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y redis-server
    fi
fi

echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing bot dependencies..."
cd bot && npm install
cd ..

echo "🌐 Installing Playwright browsers..."
cd bot && npx playwright install chromium
cd ..

echo "⚙️  Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - Please configure it with your API keys!"
fi

if [ ! -f bot/.env ]; then
    cp bot/.env.example bot/.env
    echo "✅ Created bot/.env file - Please configure it with your API keys!"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure .env files with your API keys"
echo "2. Start Redis: redis-server"
echo "3. Start backend: npm start"
echo "4. Start bot worker: cd bot && npm run start-worker"
echo ""
