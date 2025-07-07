const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login'); 
  };
  
  // Middleware to check if the user has the required role (e.g., 'freelancer' or 'client')
  const requireRole = (role) => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.session.user && req.session.user.role === role) {
        return next();
      }
      res.redirect('/login'); 
    };
  };

  module.exports = {
    ensureAuthenticated,
    requireRole,
  };