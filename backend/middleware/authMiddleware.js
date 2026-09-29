const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header exists and is in "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'ERROR', message: 'No token provided, access denied' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to the request for use in later controllers
    req.user = { id: decoded.userId };

    next();

  } catch (error) {
    return res.status(401).json({ status: 'ERROR', message: 'Invalid or expired token' });
  }
};

module.exports = protect;