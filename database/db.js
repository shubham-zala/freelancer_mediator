const { Pool } = require('pg');
//Freelancing_Mediator
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'one',
  password: 'pmv2104@',
  port: 5432, 
});

module.exports = pool;
