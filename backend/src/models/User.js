import db from '../config/database.js';

// Create user
export const createUser = (username, email, passwordHash) => {
    const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
  `);

    const result = stmt.run(username, email, passwordHash);
    return result.lastInsertRowid;
};

// Find user by email
export const findUserByEmail = (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
};

// Find user by username
export const findUserByUsername = (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
};

// Find user by ID
export const findUserById = (id) => {
    const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
};

export default {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
};
