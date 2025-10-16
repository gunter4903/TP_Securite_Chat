const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const userModel = require('../models/userModel');
const uuidv4 = (...args) => import('uuid').then(({ v4 }) => v4(...args));
const sanitizeHtml = require('sanitize-html');

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = sanitizeHtml(req.body.email.trim());
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    if (password !== passwordConfirm)
        return res.status(400).json({ error: 'Passwords do not match' });

    try {
        const existing = await userModel.findByEmail(email);
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hash = await argon2.hash(password, { type: argon2.argon2id });
        const userId = await uuidv4();
        await userModel.createUser(userId, email, hash);

        // Connexion automatique après inscription
        req.session.regenerate(err => {
            if (err) return res.status(500).json({ error: 'Session error' });
            req.session.user = { id: userId, email, role: 'user' };
            res.status(201).json({ ok: true });
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = req.body.email.trim();
    const password = req.body.password;

    try {
        const user = await userModel.findByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(403).json({ error: 'Account locked. Try later.' });
        }

        const valid = await argon2.verify(user.password_hash, password);
        if (!valid) {
            await userModel.incrementFailedLogin(user.id);

            const updated = await userModel.findByEmail(email);
            if (updated.failed_login_attempts >= MAX_FAILED) {
                const until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
                await userModel.setLockUntil(user.id, until);
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        await userModel.resetFailedLogin(user.id);

        req.session.regenerate(err => {
            if (err) return res.status(500).json({ error: 'Session error' });
            req.session.user = { id: user.id, email: user.email, role: user.role };
            res.json({ ok: true });
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie(process.env.SESSION_COOKIE_NAME || 'sid');
        res.json({ ok: true });
    });
};
