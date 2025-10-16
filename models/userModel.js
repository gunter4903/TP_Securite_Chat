const pool = require('../scripts/mysql');

const findByEmail = async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async (email, passwordHash) => {
    const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash]
    );
    return result.insertId;
};

const incrementFailedLogin = async (userId) => {
    await pool.execute('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [userId]);
};

const resetFailedLogin = async (userId) => {
    await pool.execute('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [userId]);
};

const setLockUntil = async (userId, untilDate) => {
    await pool.execute('UPDATE users SET locked_until = ? WHERE id = ?', [untilDate, userId]);
};

module.exports = {
    findByEmail,
    createUser,
    incrementFailedLogin,
    resetFailedLogin,
    setLockUntil
};
