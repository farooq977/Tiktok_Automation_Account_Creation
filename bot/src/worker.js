import 'dotenv/config';
import Queue from 'bull';
import Database from 'better-sqlite3';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';
import createTikTokAccount from './automation/tiktokSignup.js';
import * as logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const MIN_DELAY = parseInt(process.env.MIN_DELAY_BETWEEN_ACCOUNTS) || 30000; // 30 seconds
const MAX_DELAY = parseInt(process.env.MAX_DELAY_BETWEEN_ACCOUNTS) || 60000; // 60 seconds

// Database connection
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../backend/database.sqlite');
const db = new Database(dbPath);

// Redis client for pub/sub
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

// Connect Redis
await redisClient.connect();
console.log('✅ Redis client connected');

// -----------------------------------------------------------------------
// DB SCHEMA INITIALIZATION (For Heroku/Fresh Start)
// -----------------------------------------------------------------------
const initDB = () => {
    // Users table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Batches table
    db.exec(`
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      batch_size INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      total_success INTEGER DEFAULT 0,
      total_failed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Accounts table
    db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      email TEXT,
      password TEXT,
      username TEXT,
      date_of_birth TEXT,
      tiktok_user_id TEXT,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      ip_address TEXT,
      ip_location TEXT,  
      profile_url TEXT,
      activity_duration_mins INTEGER,
      session_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
    )
  `);
    console.log('✅ Database tables verified/created');
};

initDB();

// Create Bull queue
const accountQueue = new Queue('account-creation', REDIS_URL);

console.log('🤖 Bot worker started - listening for jobs...');

// -----------------------------------------------------------------------
// [DEV FIX] AUTO-INJECT JOB ON STARTUP
// -----------------------------------------------------------------------
(async () => {
    try {
        // AUTO-INJECT JOB ON STARTUP (For Heroku Testing)
        if (process.env.AUTO_START_JOBS === 'true' || true) { // Forced TRUE for now as per user request
            logger.info('🚀 Auto-starting job injection (Testing Mode)...');

            // CLEANUP: Force wipe the queue to ensure fresh start
            try {
                await accountQueue.pause();
                await accountQueue.obliterate({ force: true });
                await accountQueue.resume();
                logger.info('✅ Queue obliterated.');
            } catch (e) {
                logger.warning(`⚠️ Obliterate failed (might be empty): ${e.message}`);
            }

            // ALWAYS inject new batch since we just wiped it
            logger.info('🔧 [DEV] Injecting Fresh Test Job...');

            // 1. Get/Create User
            let user = db.prepare('SELECT id FROM users LIMIT 1').get();
            if (!user) {
                db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run('dev_user', 'dev@example.com', 'hash123');
                user = db.prepare('SELECT id FROM users LIMIT 1').get();
            }

            // 2. Create Batch
            const batchSize = 100; // Create 100 accounts for continuous loop
            const batchRes = db.prepare('INSERT INTO batches (user_id, batch_size, status) VALUES (?, ?, ?)').run(user.id, batchSize, 'processing');
            const batchId = batchRes.lastInsertRowid;

            // 3. Create Accounts & Add to Queue
            for (let i = 0; i < batchSize; i++) {
                const accRes = db.prepare('INSERT INTO accounts (batch_id, status) VALUES (?, ?)').run(batchId, 'pending');
                const accountId = accRes.lastInsertRowid;
                await accountQueue.add({ accountId, batchId });
            }
            logger.success(`✅ [DEV] Injected New Batch ${batchId} with ${batchSize} jobs.`);
        } // End of Auto-Start IF
    } catch (err) {
        logger.error('❌ [DEV] Job Injection Failed: ' + err.message);
    }
})();

// Process jobs from the queue
accountQueue.process(async (job) => {
    const { accountId, batchId } = job.data;

    logger.info('Processing new job', { accountId, batchId, jobId: job.id });

    try {
        // Create TikTok account
        const result = await createTikTokAccount(accountId);

        // Update batch statistics
        db.prepare(`
      UPDATE batches
      SET 
        total_success = (SELECT COUNT(*) FROM accounts WHERE batch_id = ? AND status = 'success'),
        total_failed = (SELECT COUNT(*) FROM accounts WHERE batch_id = ? AND status = 'failed')
      WHERE id = ?
    `).run(batchId, batchId, batchId);

        // Check if batch is complete
        const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);
        const totalProcessed = batch.total_success + batch.total_failed;

        if (totalProcessed >= batch.batch_size) {
            // Mark batch as completed
            db.prepare(`
        UPDATE batches
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(batchId);

            logger.success(`Batch ${batchId} completed!`, {
                totalSuccess: batch.total_success,
                totalFailed: batch.total_failed,
            });
        }

        // Publish update to Redis for real-time progress
        await redisClient.publish(`batch:${batchId}:update`, JSON.stringify({
            batchId,
            accountId,
            status: result.success ? 'success' : 'failed',
            timestamp: new Date().toISOString(),
        }));

        // Random delay before next account
        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
        const delayMinutes = (delay / 60000).toFixed(2);

        logger.info(`Waiting ${delayMinutes} minutes before next account creation...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        return result;

    } catch (error) {
        logger.error('Job processing error', {
            accountId,
            batchId,
            error: error.message,
            stack: error.stack,
        });

        throw error;
    }
});

// Queue event listeners
accountQueue.on('completed', (job, result) => {
    logger.success(`Job ${job.id} completed`, { result });
});

accountQueue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed`, { error: err.message });
});

accountQueue.on('error', (error) => {
    logger.error('Queue error', { error: error.message });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: gracefully shutting down');
    await accountQueue.close();
    await redisClient.quit();
    db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: gracefully shutting down');
    await accountQueue.close();
    await redisClient.quit();
    db.close();
    process.exit(0);
});
