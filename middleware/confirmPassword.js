const argon2 = require('argon2');
const userModel = require('../models/userModel');

module.exports = async function confirmPassword(req, res, next) {
    const { password } = req.body;
    if (!req.session?.user) return res.status(401).json({ error: 'Auth required' });
    const user = await userModel.findByEmail(req.session.user.email);
    if (!user) return res.status(401).json({ error: 'User missing' });
    const ok = await argon2.verify(user.password_hash, password);
    if (!ok) return res.status(403).json({ error: 'Wrong password' });
    next();
};
