require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const csurf = require('csurf');
const path = require('path');
const pool = require('./scripts/mysql');

const authRoutes = require('./routes/authRoute');
const listCatRoute = require('./routes/listCatRoute');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'","data:"],
        objectSrc: ["'none'"]
    }
}));

const sessionStore = new MySQLStore({}, pool.promise ? pool.promise() : pool);

app.use(session({
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
        maxAge: 1000 * 60 * 60 * 2
    }
}));

app.use(csurf({ cookie: false }));

console.log("dbezjbfhzebfjezbf");
const listCatModel = require('./models/listCatModel');
console.log(listCatModel.getCats());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
    next();
});

app.use('/auth', authRoutes);
app.use('/listingCats', listCatRoute);

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'CSRF token invalid' });
    }
    next(err);
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started');
});
