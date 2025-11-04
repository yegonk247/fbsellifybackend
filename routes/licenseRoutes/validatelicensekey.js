// routes/licenseRoutes.js

const express = require('express');
const { getConnection } =require ("../../databaseconnection.js")
// const db=getConnection();


// routes/licenseRoutes/validatelicensekey.js (SUCCESS RESPONSE)
// NOTE: You'll need to install and import a library like 'jsonwebtoken' (npm install jsonwebtoken)
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'AKDJF093QUR092QIWEJF0VIQ3J4F84PQJ3IFEOCPQW98EFJI'; // USE A STRONG SECRET FROM .env


// This function receives the active DB connection object from app.js
module.exports = function (db) {
    const router = express.Router();

    // POST /api/license/validate
    // Body: { key: "XXXX-XXXX-XXXX-XXXX", device_id: "UniqueClientIdentifier" }
    router.post('/validate', async (req, res) => {
        const { key } = req.body;

        console.log("Trying to valide key", key);
        
        if (!key) {
            return res.status(400).json({ success: false, message: "License key is required." });
        }

        try {
            // 1. Find the Key and check basic status
            const [rows] = await db.execute(
                `SELECT * FROM license_keys WHERE license_key = ?`, 
                [key]
            );

            const license = rows[0];

            // 2. Initial Key Check
            if (!license) {
                return res.status(401).json({ success: false, message: "Invalid license key." });
            }
            if (!license.is_active) {
                return res.status(403).json({ success: false, message: "License key is suspended." });
            }
            if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
                 return res.status(403).json({ success: false, message: "License key has expired." });
            }

            // // 3. Activation Check (Simple version: just check if current < max)
            // if (license.current_activations >= license.max_activations) {
            //     return res.status(403).json({ success: false, message: "Activation limit exceeded." });
            // }

            // 4. Update and Return Success
            await db.execute(
                `UPDATE license_keys SET current_activations = current_activations + 1, last_validated = NOW() WHERE license_key = ?`,
                [key]
            );


            // Create a lightweight token payload
                const tokenPayload = {
                    license_id: license.license_id,
                    license_key: license.license_key
                };

                // Sign the token (e.g., set it to expire in 1 hour)
                const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });

                return res.json({ 
                    success: true, 
                    message: "License validated successfully.",
                    token: token // <-- RETURN THE SECURE TOKEN
                });

                // return res.json({ success: true, message: "License validated successfully." });

        } catch (error) {
            console.error("Database error during validation:", error);
            return res.status(500).json({ success: false, message: "Server validation error." });
        }
    });

    return router;
};  










