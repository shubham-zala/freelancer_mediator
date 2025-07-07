const pool = require('../database/db');

async function searchFreelancers(searchTerm) {
  // console.log('Search Term:', searchTerm);

  try {
    // Split the searchTerm into an array of individual terms
    const searchTermsArray = searchTerm.split(' ');

    // Build the WHERE clause dynamically based on the number of search terms
    const whereClause = searchTermsArray.map((term, index) => {
      return `skills ILIKE $${index + 1}`;
    }).join(' OR ');

    
    // Query to find project_ids based on skills
    const skillsQuery = {
      text: `SELECT DISTINCT project_id
           FROM project_skills
           WHERE ${whereClause}`,
      
      values: searchTermsArray.map(term => `%${term}%`),
    };


    const skillsResult = await pool.query(skillsQuery);
    // console.log('Skills Result:', skillsResult.rows);

    // Extract project IDs from the result
    const projectIds = skillsResult.rows.map(row => row.project_id);

    // If no projects found, return an empty array
    if (projectIds.length === 0) {
      return [];
    }

    // Query to retrieve information from the projects table based on project IDs
    const projectsQuery = {
      text: 'SELECT * FROM project WHERE project_id = ANY($1)',
      values: [projectIds],
    };

    const projectsResult = await pool.query(projectsQuery);
    // console.log('Projects Result:', projectsResult.rows);

    return projectsResult.rows;
  } catch (error) {
    // console.error('Error executing query', error);
    throw new Error('Internal Server Error');
  }
}

module.exports = {
  searchFreelancers,
};