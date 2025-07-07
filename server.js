const express = require('express');
const app = express();
const port = 2104;

const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const passportlocal = require('./config/passpoprt-local-strategy');
const PgSession = require('connect-pg-simple')(session);
const crypto = require('crypto');
const pool = require('./database/db');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const { restrictToFreelancer } = require('./middleware/create_cookie_auth');
const { restrictToClient } = require('./middleware/create_cookie_auth');
const {restrictToBoth} = require('./middleware/create_cookie_auth');
const searchController = require('./controllers/searchcontroller');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static('public'));

const sessionStore = new PgSession({
  pool,
  tableName: 'session',
});


const secret = crypto.randomBytes(32).toString('hex');

// passportlocal(passport);
app.use(
  session({
    secret: secret,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 5 , // Adjust the session duration as needed
    },
    store: sessionStore,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Generate a session secret

// Use the routes
app.use('/', require('./routes/login_signup_routes'));
app.use('/profile', require('./routes/user_profile_route'));
app.use('/project', require('./routes/project_routes'));
app.use('/transaction', require('./routes/transaction_routes'));
app.use('/review', require('./routes/review_routes'));
app.use('/contract', require('./routes/contract_routes'));

app.get('/search', restrictToBoth, async (req, res) => {
  const searchTerm = req.query.search;

  try {
    const rows = await searchController.searchFreelancers(searchTerm);
    res.render('searchResult_project.ejs', { rows });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


// Start the server
app.listen(port, () => {
  // console.log(`Server is running on port ${port}`);
});
