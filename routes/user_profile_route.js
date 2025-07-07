const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
    requireRole,
} = require('../middleware/role');
// const authMiddleware = require('../middleware/authMiddleware');
const {
    profile_freelancer,
    profile_client
} = require('../controllers/profilecontroller');

const {restrictToFreelancer} = require('../middleware/create_cookie_auth');
const {restrictToClient} = require('../middleware/create_cookie_auth');
const {restrictToBoth} = require('../middleware/create_cookie_auth');


router.get('/freelancer/:id' , restrictToBoth ,  profile_freelancer);

router.get('/client/:id' , restrictToBoth , profile_client);


module.exports = router;