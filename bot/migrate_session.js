
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../backend/database.sqlite');

const db = new Database(dbPath, { verbose: console.log });

try {
    console.log('🔄 Checking for session_data column...');
    const tableInfo = db.prepare("PRAGMA table_info(accounts)").all();
    const hasSessionData = tableInfo.some(col => col.name === 'session_data');

    if (!hasSessionData) {
        console.log('➕ Adding session_data column to accounts table...');
        db.prepare("ALTER TABLE accounts ADD COLUMN session_data TEXT").run();
        console.log('✅ Column added successfully.');
    } else {
        console.log('ℹ️ Column already exists. Skipping.');
    }
} catch (error) {
    console.error('❌ Migration failed:', error);
} finally {
    db.close();
}
