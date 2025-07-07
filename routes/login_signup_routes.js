const express = require('express');
const router = express.Router();
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const {
    homepage,
    loginPage,
    signUp,
    loginPage_client,
    loginPage_freelancer,
    signUp_freelancer,
    signUp_client,
    new_signUp_freelancer,
    new_signUp_client,
    logincheck_freelancer,
    logincheck_client,
    homepage_logged_client,
    homepage_logged_freelancer,
} = require('../controllers/usercontroller');
const pool = require('../database/db');

const {restrictToFreelancer} = require('../middleware/create_cookie_auth');
const {restrictToClient} = require('../middleware/create_cookie_auth');
const {restrictToBoth} = require('../middleware/create_cookie_auth');

// Homepage
router.get('/',homepage);

router.get('/aboutus' , (req,res) => {
    res.render('aboutUs.ejs');
});

router.get('/contactus' , (req,res) => {
    res.render('contactUs.ejs');
});

// Login WebPages
router.get('/login',loginPage);
router.get('/login/client',loginPage_client);
router.get('/login/freelancer',loginPage_freelancer);

// Own home page for client and freelancer
router.get('/home/client/:id', restrictToBoth , homepage_logged_client);
router.get('/home/freelancer/:id', restrictToBoth , homepage_logged_freelancer);


// Logout for all users by the help of cookies 
router.post('/logout', restrictToBoth ,(req, res) => {
    res.clearCookie('client_cookie');
    res.clearCookie('freelancer_cookie');
    res.redirect('/');
});

// Existing Login For Both Client And Freelancer
router.post('/login/client', logincheck_client);
router.post('/login/freelancer', logincheck_freelancer);

// Signup Webpages
router.get('/signup',signUp);
router.get('/signup/client',signUp_client);
router.get('/signup/freelancer',signUp_freelancer);

// New Signup For Both Client And Freelancer
router.post('/signup/client',new_signUp_client);
router.post('/signup/freelancer',new_signUp_freelancer);

// use passport as a middleware to authenticate
// router.post('/create-session',createSession);



module.exports = router;