const express = require('express');
const router = express.Router();
const passport = require('passport');
const {restrictToFreelancer} = require('../middleware/create_cookie_auth');
const {restrictToClient} = require('../middleware/create_cookie_auth');
const {restrictToBoth} = require('../middleware/create_cookie_auth');

const {
    newReview,
    all_review_data_for_client,
    all_review_data_for_freelancer,
    
} = require('../controllers/reviewcontroller');

router.get ('/form/:id', restrictToBoth , (req,res) => {
    let user = req.params.id;
    res.render('review_form.ejs' , {user: user});
}); 

router.post('/form/:id', restrictToBoth , newReview);


// get review data for client
router.get('/client/all/:id' , restrictToBoth , all_review_data_for_client);
// get review data for freelancer
router.get('/freelancer/all/:id' , restrictToBoth , all_review_data_for_freelancer);


router.get('/profile', restrictToBoth , (req, res) => {
    res.render('review_profile.ejs');
});

module.exports = router;