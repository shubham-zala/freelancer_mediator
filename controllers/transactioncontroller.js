const asyncHandler = require('express-async-handler');
const pool = require('../database/db');

const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const all_client_transactions = handleAsync(asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid ID' });
          }
        let contract = await pool.query('SELECT contract_id FROM contract WHERE client_id = $1', [parseInt(id)]);
        
        if(!contract) return res.status(404).json({ error: 'Contract not found' });

        const contract_id = contract.rows.map((row) => row.contract_id);

        const transactions = await pool.query('SELECT * FROM t_transaction WHERE contract_id = ANY($1)', [contract_id]);
        
        if(!transactions) return res.status(404).json({ error: 'Transactions not found' });
        
        let user = id;

        res.render('cmy_Transactions.ejs' , {transactions : transactions.rows , user: user});
    }
    catch (error) {
        res.status(500).send('Internal Server Error');
        // console.error(error);
    }
}));

const all_freelancer_transactions = handleAsync(asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid ID' });
          }
        let contract = await pool.query('SELECT contract_id FROM contract WHERE freelancer_id = $1', [parseInt(id)]);

        if(!contract) return res.status(404).json({ error: 'Contract not found' });

        const contract_id = contract.rows.map((row) => row.contract_id);

        const transactions = await pool.query('SELECT * FROM t_transaction WHERE contract_id = ANY($1)', [contract_id]);

        if(!transactions) return res.status(404).json({ error: 'Transactions not found' });

        let user = id;
        
        res.render('myTransactions.ejs' , {transactions : transactions.rows , user: user});
    }
    catch (error) {
        res.status(500).send('Internal Server Error');
        // console.error(error);
    }
}));

const transaction_new = asyncHandler(async (req, res) => {
    try {
        var contract_id = req.body.contractId;
        var amount = req.body.amount;
        var payment_method = req.body.paymentMethod;
        // console.log(parseInt(contract_id) , parseInt(amount) , payment_method);

        if (isNaN(parseInt(contract_id)) || isNaN(parseInt(amount))) {
            return res.status(400).json({ error: 'Invalid contract ID or amount' });
        }

        var project_id = await pool.query('SELECT project_id FROM contract WHERE contract_id = $1', [parseInt(contract_id)]);
        project_id = project_id.rows[0].project_id;
        await pool.query('UPDATE project SET status = $1 WHERE project_id = $2', ['Completed' , parseInt(project_id)]);

        // Convert the amount to an integer
        const parsedAmount = parseInt(amount);

        // Get the current date and time
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const formattedTime = currentDate.toTimeString().split(' ')[0];

        // Insert the transaction into the database
        const transaction = await pool.query(
            'INSERT INTO t_transaction (contract_id, amount, t_date, t_time, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [parseInt(contract_id), parsedAmount, formattedDate, formattedTime, payment_method]
        );

        // Check if the transaction was inserted successfully
        if (!transaction.rows[0]) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Respond with success and the inserted transaction
        res.status(200).json({ message: 'Transaction initiated successfully', transaction: transaction.rows[0] });
    } catch (error) {
        // console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = { all_client_transactions , all_freelancer_transactions , transaction_new};