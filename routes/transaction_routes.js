const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
    all_client_transactions,
    all_freelancer_transactions,
    transaction_new,
} = require('../controllers/transactioncontroller');

const {restrictToFreelancer} = require('../middleware/create_cookie_auth');
const {restrictToClient} = require('../middleware/create_cookie_auth');
const {restrictToBoth} = require('../middleware/create_cookie_auth');

router.get('/:id', restrictToBoth , (req, res) => {
    let user = req.params.id;
    res.render('initiate_transaction.ejs' , {user: user});
});
router.post('/:id', restrictToBoth , transaction_new);

// get all transactions of a client
router.get('/client/:id' , restrictToBoth ,  all_client_transactions);
// get all transactions of a freelancer
router.get('/freelancer/:id' , restrictToBoth , all_freelancer_transactions);

module.exports = router;