const asyncHandler = require('express-async-handler');
const pool = require('../database/db');

const profile_freelancer = async (req, res) => {
  try {

    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    // query
    let freelancer = await pool.query(`SELECT * FROM freelancer WHERE freelancer_id = $1`, [parseInt(id)]);
    freelancer = freelancer.rows[0];

    var city = freelancer.city;
    var country = await pool.query('SELECT country FROM city_country WHERE city = $1', [city]);
    country = country.rows[0].country;

    if(!freelancer) return res.status(404).json({ error: 'Profile not found' });

    let user = id;

    res.render('freelancer_profile.ejs', { freelancer  , country , user : user });
  } 
  catch (error) {
    res.status(500).send('Internal Server Error');
    // console.error(error);
  }
};

const profile_client = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    // query 
    let client = await pool.query('SELECT * FROM client WHERE client_id = $1', [parseInt(id)]);
    client = client.rows[0];
    // console.log(client);

    var city = client.city;
    var country = await pool.query('SELECT country FROM city_country WHERE city = $1', [city]);
    country = country.rows[0].country;
    
    if(!client) return res.status(404).json({error : 'Profile not found'});

    let user = id;

    res.render('client_profile.ejs', { client , country , user : user });
  } 
  catch (error) {
    res.status(500).send('Internal Server Error');
    // console.error(error);
  }
};

module.exports = { profile_freelancer , profile_client};