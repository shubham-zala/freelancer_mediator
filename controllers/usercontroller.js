const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const pool = require('../database/db');
// const authMiddleware = require('../middleware/authMiddleware');
const session = require('express-session');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {setUser} = require('../middleware/auth')
// const generateJwtTokens = require('../utils/jwt_helpers');

// const { setUser } = require('../service/auth');

// homepage
const homepage = asyncHandler(async (req, res) => {
    res.render('homepage_nl.ejs');
});


// login
const loginPage = asyncHandler(async (req, res) => {
    res.render('loginPage.ejs');
});
const loginPage_client = asyncHandler(async(req , res)=>{
    res.render('client_login.ejs');
});
const loginPage_freelancer = asyncHandler(async (req, res) => {
    res.render('freelancer_login.ejs');
});


//checking login for both client and freelancer
const logincheck_freelancer = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email, password);

        let freelancer = await pool.query('SELECT * FROM freelancer WHERE email_id = $1', [email]);
        // console.log(freelancer.rows[0]);
        if (freelancer === undefined || freelancer.rows.length === 0) {
            return res.json({message: 'Email not registered'});
        }

        const storedPassword = freelancer.rows[0].f_password;

        const isPasswordValid = await bcrypt.compare(password, storedPassword);
        if (!isPasswordValid) {
           return res.json({message: 'Invalid password'});
        }
        freelancer = freelancer.rows[0];
        freelancer.role = 'freelancer';

        const token = setUser(freelancer);
        res.cookie('freelancer_cookie', token, {
            domain: 'localhost',
            httpOnly: true,
            maxAge: 60 * 1000,
        });

        res.redirect(`/home/freelancer/${freelancer.freelancer_id}`);
        // res.render('freelancer_profile.ejs', { freelancer });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const logincheck_client = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        let client = await pool.query('SELECT * FROM client WHERE email_id = $1', [email]);
        // console.log(client.rows[0]);
        if (client === undefined || client.rows.length === 0) {
            return res.json({ message: 'Email not registered' });
        }

        const storedPassword = client.rows[0].c_password;

        const isPasswordValid = await bcrypt.compare(password, storedPassword);
        if (!isPasswordValid) {
            return res.json({ message: 'Invalid password' });
        }

        client = client.rows[0];
        client.role = 'client';
        
        const token = setUser(client);
        res.cookie('client_cookie', token, {
            httpOnly: true,
            maxAge: 60 * 1000,
        });

        // const userRole = 'client';

        // // Create a session for the authenticated user
        // req.session.user = {
        //     role: userRole,
        //     userId: client.client_id, // Assuming the client_id is the appropriate user identifier
        // };
        res.redirect(`/home/client/${client.client_id}`);
        // res.render('client_profile.ejs', { client });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// signup
const signUp = asyncHandler(async (req, res) => {
    res.render('signUp.ejs');
});
const signUp_freelancer = asyncHandler(async(req , res)=>{
    let skills = await pool.query('SELECT skill_name FROM skills');
    skills = skills.rows;
    res.render('freelancer_signup.ejs' , {skills : skills} );
});
const signUp_client = asyncHandler(async(req , res)=>{
    res.render('client_signup.ejs');
});


// new signup
const new_signUp_freelancer = asyncHandler(async (req, res) => {
    const {
        first_name, last_name, dob, city, country, email, password
    } = req.body;
    const skills = req.body['skills[]'];
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email is already registered
    pool.query('SELECT * FROM freelancer WHERE email_id = $1', [email], async (err, results) => {
        if (err) {
            throw err;
        }

        if (results.rows.length > 0) {
            return res.json({ message: 'Email already registered' });
        }

        // If the email is not registered, insert the new user into the database
        pool.query(
            'INSERT INTO freelancer (first_name, last_name, date_of_birth, avg_rating, city, email_id, f_password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [first_name, last_name, dob, 0.0, city, email, hashedPassword],
            async (err, result) => {
                if (err) {
                    throw err;
                }

                let f_id = await pool.query('SELECT freelancer_id FROM freelancer WHERE email_id = $1', [email]);

                const freelancerId = f_id.rows[0].freelancer_id;

                // console.log(freelancerId);

                // Insert the selected skills for the freelancer into the freelancer_skills table
                if (Array.isArray(skills)) {
                    for (const skill of skills) {
                        // console.log(skill);
                        await pool.query(
                            'INSERT INTO freelancer_skills (freelancer_id, skills) VALUES ($1, $2)',
                            [freelancerId, skill]
                        );
                    }
                } else {
                    res.json({ message: 'Skills must be an array' });
                }

                // Handle the successful registration
                return res.json({ message: 'Email registered successfully' });
            }
        );
    });
});



const new_signUp_client = asyncHandler(async (req, res) => {
    const {
        first_name, last_name , organization_name, dob, city, country, email, password
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(first_name, last_name,organization_name, dob, city, country, email, hashedPassword);
    // Check if the email is already registered
    pool.query('SELECT * FROM client WHERE email_id = $1', [email], async (err, results) => {
        if (err) {
            throw err;
        }
        if (results.rows.length > 0) {
            return res.json({message: 'Email already registered'});
        }
        // If the email is not registered, insert the new client into the database
        pool.query(
            'INSERT INTO client (first_name, last_name, date_of_birth, organization_name, city, email_id, c_password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [first_name, last_name, dob, organization_name, city, email, hashedPassword],
            (err, result) => {
                if (err) {
                    throw err;
                }

                // Now you can handle the successful registration here
                res.json({message: 'Email registered successfully'});
            }
        );
    });
});

const logout = asyncHandler(async (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

// const createSession = (req, res, next) => {
//     passport.authenticate(['client-local', 'freelancer-local'], (err, user, info) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.redirect('/login'); // Redirect to a common login page
//         }
//         req.logIn(user, (err) => {
//             if (err) {
//                 return next(err);
//             }
//             if (user.role === 'client') {
//                 let client = pool.query('SELECT * FROM client WHERE email_id = $1', [email]);
//                 return res.redirect('client_profile.ejs', { client });
//             } else if (user.role === 'freelancer') {
//                 let freelancer = pool.query('SELECT * FROM freelancer WHERE email_id = $1', [email]);
//                 return res.redirect('freelancer_profile.ejs', { freelancer });
//             }
           
//         });
//     })(req, res, next);
// };

// homepage for particular client and freelancer
const homepage_logged_client = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
        return res.status(400).send('Invalid client ID');
    }

    try {
        let client = await pool.query("SELECT * FROM client WHERE client_id = $1", [clientId]);

        if (client.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        client = client.rows[0];
        res.render('homepage_logged_client.ejs', { user: client });
    } 
    catch (error) {
        // console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

const homepage_logged_freelancer = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const freelancerId = parseInt(id, 10);
    if (isNaN(freelancerId)) {
        return res.status(400).send('Invalid freelancer ID');
    }

    try {
        let freelancer = await pool.query("SELECT * FROM freelancer WHERE freelancer_id = $1", [freelancerId]);

        if (freelancer.rows.length === 0) {
            return res.status(404).send('Freelancer not found');
        }

        freelancer = freelancer.rows[0];
        res.render('homepage_logged_freelancer.ejs', { user: freelancer });
    } 
    catch (error) {
        // console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = {homepage , loginPage , signUp , loginPage_client ,
     loginPage_freelancer , signUp_client ,signUp_freelancer , new_signUp_freelancer , new_signUp_client,
     logincheck_freelancer, logincheck_client , homepage_logged_client , homepage_logged_freelancer , logout};