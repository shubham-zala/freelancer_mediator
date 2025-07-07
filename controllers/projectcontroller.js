const asyncHandler = require('express-async-handler');
const pool = require('../database/db');

const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Giving project data to website 
const project_data = handleAsync(asyncHandler (async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid ID' });
          }

        let project = await pool.query('SELECT * FROM project WHERE project_id = $1', [parseInt(id)]);
        project = project.rows[0];
        
        if(!project) return res.status(404).json({ error: 'Project not found' });
        
        res.render('project.ejs' , {project});
    }
    catch (error) {
        res.status(500).send('Internal Server Error');
        // console.error(error);
    }
})); 

//entering new project in database 
const new_project = handleAsync(asyncHandler(async (req, res) => {
    try {
        const { project_name, amount, start_date, deadline, project_description } = req.body;
        
        const skills = req.body['skills[]'];
        // console.log(skills);

        let our_client = await pool.query('SELECT * FROM client');
        our_client = our_client.rows;

        const id = req.params.id;
        // console.log(id);
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO project (project_name, client_id, amount, start_date, deadline, status, project_description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [project_name, id, amount, start_date, deadline,'In Progress', project_description]
        );
        client.release();
        
        let project_id = await pool.query('SELECT project_id FROM project WHERE project_name = $1 and client_id = $2', [project_name , id]);
        project_id = project_id.rows[0].project_id;
        // console.log(project_id);

        if (Array.isArray(skills)) {
            for (const skill of skills) {
                // console.log(skill);
                await pool.query(
                    'INSERT INTO project_skills (project_id, skills) VALUES ($1, $2)',
                    [project_id, skill]
                );
            }
            // console.log('Skills inserted');
            res.json({ message: 'Skills inserted' });
        } else {
            res.json({ message: 'Skills must be an array' });
        }

        res.render('homepage_logged_client.ejs', { user: our_client });
    
    } catch (error) {
        res.status(500).send('Internal Server Error');
        // console.error(error);
    }
}));


const project_searching_page = handleAsync(asyncHandler(async (req, res) => {
    let skills = await pool.query('SELECT skill_name FROM skills');
    skills = skills.rows;

    const {id} = req.params;
    let client = await pool.query('SELECT * FROM client WHERE client_id = $1', [parseInt(id)]);
    client = client.rows[0];

    res.render('project_posting.ejs', { id: req.params.id, skills: skills , user: client});
}));

const project_submitting_page = handleAsync(asyncHandler(async (req, res) => {
    const user = req.params.id;
    res.render('submit_project.ejs' , {user : user} );
}));


const all_project_data_for_client = handleAsync(asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid ID' });
          }

        let project = await pool.query('SELECT * FROM project WHERE client_id = $1', [parseInt(id)]);
        if(!project) return res.status(404).json({ error: 'Project not found' });
        // console.log(project.rows);

        let user = id;

        res.render('cmyProjects.ejs' , { project: project.rows , user : user});
    }
    catch (error) {
        res.status(500).send('Internal Server Error');
        // console.error(error);
    }
}));

const all_project_data_for_freelancer = handleAsync(asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const contractResult = await pool.query('SELECT project_id FROM contract WHERE freelancer_id = $1', [parseInt(id)]);

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'No projects found for freelancer' });
        }

        const projectIds = contractResult.rows.map(row => row.project_id);

        const projectResult = await pool.query('SELECT * FROM project WHERE project_id = ANY($1)', [projectIds]);

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'No projects found' });
        }
        var freelancer_id = id;
        // console.log(projectResult.rows);
        res.render('myProjects.ejs', { project: projectResult.rows , user : freelancer_id});
    } catch (error) {
        res.status(500).send('Internal Server Error');
        // console.error(error);
    }
}));


module.exports = { project_data , new_project , project_searching_page ,
                   all_project_data_for_client , all_project_data_for_freelancer , project_submitting_page};