import db from '../config/database.js';

// Create new account record
export const createAccount = (batchId) => {
    const stmt = db.prepare(`
    INSERT INTO accounts (batch_id, status)
    VALUES (?, 'pending')
  `);

    const result = stmt.run(batchId);
    return result.lastInsertRowid;
};

// Update account with TikTok details
export const updateAccount = (accountId, data) => {
    const { email, password, username, dateOfBirth, tiktokUserId, status, errorMessage } = data;

    const stmt = db.prepare(`
    UPDATE accounts
    SET 
      email = COALESCE(?, email),
      password = COALESCE(?, password),
      username = COALESCE(?, username),
      date_of_birth = COALESCE(?, date_of_birth),
      tiktok_user_id = COALESCE(?, tiktok_user_id),
      status = COALESCE(?, status),
      error_message = COALESCE(?, error_message)
    WHERE id = ?
  `);

    stmt.run(email, password, username, dateOfBirth, tiktokUserId, status, errorMessage, accountId);
};

// Get all accounts for a batch
export const getAccountsByBatchId = (batchId) => {
    const stmt = db.prepare(`
    SELECT * FROM accounts
    WHERE batch_id = ?
    ORDER BY created_at DESC
  `);

    return stmt.all(batchId);
};

// Get all accounts with pagination and filtering
export const getAllAccounts = (filters = {}) => {
    let query = 'SELECT * FROM accounts WHERE 1=1';
    const params = [];

    if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    if (filters.batchId) {
        query += ' AND batch_id = ?';
        params.push(filters.batchId);
    }

    if (filters.search) {
        query += ' AND (email LIKE ? OR username LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);

        if (filters.offset) {
            query += ' OFFSET ?';
            params.push(filters.offset);
        }
    }

    const stmt = db.prepare(query);
    return stmt.all(...params);
};

// Count total accounts
export const countAccounts = (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM accounts WHERE 1=1';
    const params = [];

    if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    if (filters.batchId) {
        query += ' AND batch_id = ?';
        params.push(filters.batchId);
    }

    if (filters.search) {
        query += ' AND (email LIKE ? OR username LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);
    return result.total;
};

// Get account statistics
export const getAccountStats = () => {
    const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
    FROM accounts
  `);

    return stmt.get();
};

export default {
    createAccount,
    updateAccount,
    getAccountsByBatchId,
    getAllAccounts,
    countAccounts,
    getAccountStats,
};
