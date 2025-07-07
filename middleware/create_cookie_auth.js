const {getUser} = require('./auth');

async function restrictToFreelancer (req, res, next) {
  
  const f_Uid = req.cookies.freelancer_cookie;
  if(!f_Uid) return res.redirect('/login/freelancer');

  const freelancer = await getUser(f_Uid);
  if(!freelancer) return res.redirect('/login/freelancer');
  req.freelancer = freelancer;
  next();
}

async function restrictToClient (req, res, next) {
    
    const c_Uid = req.cookies.client_cookie;
    if(!c_Uid) return res.redirect('/login/client');
  
    const client = await getUser(c_Uid);
    if(!client) return res.redirect('/login/client');
    req.client = client;
    next();
  }

async function restrictToBoth (req, res, next) {
    
    const c_Uid = req.cookies.client_cookie;
    const f_Uid = req.cookies.freelancer_cookie;
    if(!c_Uid && !f_Uid) return res.redirect('/login');
  
    const client = await getUser(c_Uid);
    const freelancer = await getUser(f_Uid);
    if(!client && !freelancer) return res.redirect('/login');
    req.client = client;
    req.freelancer = freelancer;
    next();
  }

module.exports = {restrictToFreelancer , restrictToClient , restrictToBoth};