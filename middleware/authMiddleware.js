exports.ensureAuth = (req, res, next) => {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'Authentication required' });
};

exports.ensureAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    return res.status(403).json({ error: 'Admin only' });
};
