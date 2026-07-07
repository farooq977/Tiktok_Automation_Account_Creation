import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table - Dashboard users who login to create batches
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Batches table - Track batch requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      batch_size INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
      total_success INTEGER DEFAULT 0,
      total_failed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Accounts table - Created TikTok accounts
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      email TEXT,
      password TEXT,
      username TEXT,
      date_of_birth TEXT,
      tiktok_user_id TEXT,
      status TEXT DEFAULT 'pending', -- pending, success, failed
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
    CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
    CREATE INDEX IF NOT EXISTS idx_accounts_batch_id ON accounts(batch_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
  `);

  console.log('✅ Database tables created successfully');
};

// Initialize database
createTables();

export default db;
