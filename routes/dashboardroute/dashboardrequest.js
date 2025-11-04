// routes/dashboardRoutes.js (Example)

const express = require('express');
const protect = require('../middleware/authMiddleware'); 

module.exports = function (db) {
    const router = express.Router();

    // THIS ROUTE IS NOW PROTECTED
    router.get('/data', protect, async (req, res) => {
        // If the code reaches here, the token is valid!
        // req.license contains the ID and key from the token.
        console.log(`Access granted for license ID: ${req.license.license_id}`);
        
        // ... return actual dashboard data ...
        res.json({ dashboardData: { status: 'OK', user: req.license.license_key } });
    });
    
    return router;
};