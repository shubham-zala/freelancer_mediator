const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../database/db');

// using authentication as middleware 
passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
      // If the user is authenticated, set res.locals.user
      res.locals.user = req.user;
  }
  next();
};

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.email);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(async function (email, done) {
  try {
      const rows = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
      const user = rows[0]; // Corrected line
      if(user){
          return done(null, user);
      } else {
          return done(null, false);
      }
  } catch (error) {
      // console.log('Error while deserializing the users:', error);
      return done(error);
  }
});

// verifying if the user is authentic
passport.checkAuthentication = function (req, res, next) {
  if (req.isAuthenticated()) {
      // if the user is authenticated then proceed him from the sign in page 
      return next();
  }
  // if the user is not authenticated then send him back to the sign in page
  return res.redirect('/login');
}

// Define a function to check if the user is a freelancer
passport.freelancerCheck = function (req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'freelancer') {
    // If the user is authenticated and is a freelancer, proceed
    return next();
  }
  // If not authenticated or not a freelancer, redirect to the sign-in page
  return res.redirect('/login/freelancer');
};

// Define a function to check if the user is a client
passport.clientCheck = function (req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'client') {
    // If the user is authenticated and is a client, proceed
    return next();
  }
  // If not authenticated or not a client, redirect to the sign-in page
  return res.redirect('/login/client');
};

module.exports = passport;
