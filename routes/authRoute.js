const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many login attempts, please try later.' },
    keyGenerator: (req) => {
        return req.ip + (req.body.email || '');
    }
});

router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 10 }),
        body('passwordConfirm').exists()
    ],
    authController.register
);

router.post('/login', loginLimiter,
    [body('email').isEmail().normalizeEmail(), body('password').exists()],
    authController.login
);

router.post('/logout', authController.logout);

module.exports = router;
