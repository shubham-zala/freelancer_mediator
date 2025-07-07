const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
    requireRole,
} = require('../middleware/role');

// const authMiddleware = require('../middleware/authMiddleware');

const {
    project_data ,
    new_project,
    project_searching_page,
    all_project_data_for_client,
    all_project_data_for_freelancer,
    project_submitting_page
} = require('../controllers/projectcontroller');

const {restrictToFreelancer} = require('../middleware/create_cookie_auth');
const {restrictToClient} = require('../middleware/create_cookie_auth');
const {restrictToBoth} = require('../middleware/create_cookie_auth');


// fetching project data route 
router.get('/:id' , restrictToBoth , project_data);

// fetching all projects data route for clients
router.get('/client/all/:id' , restrictToBoth , all_project_data_for_client);
// fetching all projects data route for freelancers
router.get('/freelancer/all/:id' , restrictToBoth , all_project_data_for_freelancer);

// inserting new project data route
router.get('/post/:id' , restrictToBoth , project_searching_page);
router.post('/post/:id' , restrictToBoth , new_project);
// freelancer submitting project 
router.get('/submit/:id' , restrictToBoth , project_submitting_page);

module.exports = router;