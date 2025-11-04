// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_default_secret_key'; 

function protect(req, res, next) {
    // 1. Check for the token in the Authorization header (standard practice)
    const token = req.headers.authorization?.split(' ')[1]; 
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        // 2. Verify and decode the token
        const decoded = jwt.verify(token, SECRET_KEY);
        
        // 3. Attach the license data to the request object
        req.license = decoded; 
        
        next(); // Proceed to the route handler
    } catch (ex) {
        // 4. Token is invalid or expired
        res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
}

module.exports = protect;