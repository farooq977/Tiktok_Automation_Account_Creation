import db from '../config/database.js';

// Create new batch
export const createBatch = (userId, batchSize) => {
    const stmt = db.prepare(`
    INSERT INTO batches (user_id, batch_size, status)
    VALUES (?, ?, 'pending')
  `);

    const result = stmt.run(userId, batchSize);
    return result.lastInsertRowid;
};

// Get all batches for a user
export const getBatchesByUserId = (userId) => {
    const stmt = db.prepare(`
    SELECT 
      id,
      batch_size,
      status,
      total_success,
      total_failed,
      created_at,
      completed_at
    FROM batches
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

    return stmt.all(userId);
};

// Get single batch by ID
export const getBatchById = (batchId) => {
    const stmt = db.prepare('SELECT * FROM batches WHERE id = ?');
    return stmt.get(batchId);
};

// Update batch status
export const updateBatchStatus = (batchId, status, completedAt = null) => {
    const stmt = db.prepare(`
    UPDATE batches
    SET status = ?, completed_at = ?
    WHERE id = ?
  `);

    stmt.run(status, completedAt, batchId);
};

// Update batch statistics
export const updateBatchStats = (batchId) => {
    const stmt = db.prepare(`
    UPDATE batches
    SET 
      total_success = (SELECT COUNT(*) FROM accounts WHERE batch_id = ? AND status = 'success'),
      total_failed = (SELECT COUNT(*) FROM accounts WHERE batch_id = ? AND status = 'failed')
    WHERE id = ?
  `);

    stmt.run(batchId, batchId, batchId);
};

// Get batch with accounts
export const getBatchWithAccounts = (batchId) => {
    const batch = getBatchById(batchId);

    if (!batch) return null;

    const accountsStmt = db.prepare(`
    SELECT * FROM accounts WHERE batch_id = ? ORDER BY created_at DESC
  `);

    batch.accounts = accountsStmt.all(batchId);
    return batch;
};

export default {
    createBatch,
    getBatchesByUserId,
    getBatchById,
    updateBatchStatus,
    updateBatchStats,
    getBatchWithAccounts,
};
