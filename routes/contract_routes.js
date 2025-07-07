const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const asyncHandler = require('express-async-handler');

const {restrictToFreelancer} = require('../middleware/create_cookie_auth');
const {restrictToClient} = require('../middleware/create_cookie_auth');
const {restrictToBoth} = require('../middleware/create_cookie_auth');

router.get('/', restrictToBoth , (req, res) => {
    res.render('contract_form.ejs');
});

// contract page viewing for client
router.get('/client/all/:id', restrictToBoth , asyncHandler(async (req, res) => {
    let contracts = await pool.query('SELECT * FROM contract WHERE client_id = $1', [req.params.id]);
    let user = req.params.id;
    contracts = contracts.rows;
    // console.log(contracts);
    res.render('cmyContracts.ejs', {contracts : contracts , user : user  });
}));

// contract page viewing for freelancer
router.get('/freelancer/all/:id', restrictToBoth , asyncHandler(async (req, res) => {
    let contracts = await pool.query('SELECT * FROM contract WHERE freelancer_id = $1', [req.params.id]);
    let user = req.params.id;
    contracts = contracts.rows;
    // console.log(contracts);
    res.render('myContracts.ejs', {contract : contracts , user : user });
}));

router.post('/post', restrictToBoth, async (req, res) => {
    try {
        const { freelancerId, projectId } = req.body;

        const cIdQuery = 'SELECT client_id FROM project WHERE project_id = $1';
        const cIdResult = await pool.query(cIdQuery, [projectId]);

        // Check if any rows are returned
        if (cIdResult.rows.length === 0) {
            return res.status(404).send('Project not found');
        }

        const clientId = cIdResult.rows[0].client_id;

        // Prepare data for insertion
        const data = {
            freelancer_id: freelancerId,
            client_id: clientId,
            project_id: projectId,
            c_date: new Date(),
            c_time: new Date().toISOString().slice(11, 19) // Extracting HH:MM:SS from ISO string
        };

        // Insert data into your database
        // Adjust this query based on your database schema
        const insertQuery = 'INSERT INTO contract (freelancer_id, client_id, project_id, c_date, c_time) VALUES ($1, $2, $3, $4, $5)';
        await pool.query(insertQuery, [
            data.freelancer_id,
            data.client_id,
            data.project_id,
            data.c_date,
            data.c_time
        ]);

        // Send a success response
        res.send('Contract created successfully');
    } catch (error) {
        // console.error('Error creating contract:', error);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;