const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        
        req.user = user;
        next();
    });
};

exports.verifyRole = (allowedRoles) => (req, res, next) => {
  try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const hasRole = decoded.roles.some(role => allowedRoles.includes(role));
      
      if (hasRole) {
          req.user = decoded;
          next();
      } else {
          return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }
  } catch (error) {
      return res.status(401).json({ message: "Authentication failed: invalid token" });
  }
};
  
