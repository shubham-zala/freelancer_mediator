const asyncHandler = require('express-async-handler');
const pool = require('../database/db');

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const newReview = handleAsync(asyncHandler(async (req, res) => {
  var contract_id = req.body.contractId;
  var rating = req.body.rating;
  var review = req.body.Review;
  // console.log(contract_id, rating, review);

  const contractId = 1;

  try {

    const insertQuery = 'INSERT INTO review (contract_id, rating, review) VALUES ($1, $2, $3) RETURNING *';
    const values = [contract_id, rating, review];


    // calculating avg_rating and updating it
    var f_id = await pool.query('SELECT freelancer_id FROM contract WHERE contract_id = $1', [contract_id]);
    f_id = f_id.rows[0];
    var all_contracts = await pool.query('SELECT contract_id FROM contract WHERE freelancer_id = $1', [f_id.freelancer_id]);
    all_contracts = all_contracts.rows;
    const contractIds = all_contracts.map(contract => contract.contract_id);
    var avg = await pool.query('SELECT AVG(rating) FROM review WHERE contract_id = ANY($1)', [contractIds]);
    avg = avg.rows[0];
    // console.log(avg);
    var updateQuery = 'UPDATE freelancer SET avg_rating = $1 WHERE freelancer_id = $2';
    var values2 = [avg.avg, f_id.freelancer_id];
    await pool.query(updateQuery, values2);
    


    const result = await pool.query(insertQuery, values);

    const newReviewId = result.rows[0].review_id;

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      newReviewId,
    });
  }
  catch (error) {
    // console.error('Error inserting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message,
    });
  }
}));

const all_review_data_for_client = handleAsync(asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    let contract = await pool.query('SELECT contract_id FROM contract WHERE client_id = $1', [parseInt(id)]);

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const contract_id = contract.rows.map((row) => row.contract_id);

    const reviews = await pool.query('SELECT * FROM review WHERE contract_id = ANY($1)', [contract_id]);

    if (!reviews) return res.status(404).json({ error: 'Reviews not found' });

    let user = id;

    res.render('cmy_Reviews.ejs', { reviews: reviews.rows , user: user });
  }
  catch (error) {
    res.status(500).send('Internal Server Error');
    // console.error(error);
  }
}));

const all_review_data_for_freelancer = handleAsync(asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    let contract = await pool.query('SELECT contract_id FROM contract WHERE freelancer_id = $1', [parseInt(id)]);

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const contract_id = contract.rows.map((row) => row.contract_id);

    const reviews = await pool.query('SELECT * FROM review WHERE contract_id = ANY($1)', [contract_id]);

    if (!reviews) return res.status(404).json({ error: 'Reviews not found' });

    let user = id;

    res.render('myReviews.ejs', { reviews: reviews.rows , user: user });
  }
  catch (error) {
    res.status(500).send('Internal Server Error');
    // console.error(error);
  }
}));

module.exports = { newReview, all_review_data_for_client, all_review_data_for_freelancer };