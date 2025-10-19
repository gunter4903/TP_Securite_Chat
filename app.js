require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const csurf = require('csurf');
const path = require('path');
const pool = require('./scripts/mysql');
const fs = require('fs');


const authRoutes = require('./routes/authRoute');
const listCatRoute = require('./routes/listCatRoute');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https://cdn-icons-png.flaticon.com", "https://cdn.pixabay.com"],
            objectSrc: ["'none'"],
        },
    })
);
const sessionStore = new MySQLStore({}, pool.promise ? pool.promise() : pool);

app.use(
    session({
        key: process.env.SESSION_COOKIE_NAME || 'sid',
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 2, // 2 heures
        },
    })
);

app.use(csurf({ cookie: false }));

const listCatModel = require('./models/listCatModel');

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
    next();
});

app.use('/auth', authRoutes);
app.use('/', listCatRoute);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/auth/login', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'login.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) return res.status(500).send('Erreur serveur');
        const token = req.csrfToken();
        const htmlWithToken = html.replace('{{csrfToken}}', token);
        res.send(htmlWithToken);
    });
});

app.get('/auth/register', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'register.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) return res.status(500).send('Erreur serveur');
        const token = req.csrfToken();
        const htmlWithToken = html.replace('{{csrfToken}}', token);
        res.send(htmlWithToken);
    });
});

app.get('/listingCatsPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'listingCats.html'));
})

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'CSRF token invalid' });
    }
    next(err);
});

app.use((req, res) => {
    res.status(404).send('<h1>404 - Page non trouvée</h1>');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('✅ Server started on http://localhost:3000');
});
