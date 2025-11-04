// --- PACKAGE IMPORTS ---
// require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mysql = require('mysql2/promise'); // Use 'mysql2/promise' for async/await

// --- SERVER SETUP ---
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

const { initializeDatabase } = require('./databaseconnection.js'); 
const { getConnection } =require ("./databaseconnection.js")
// const {generateLicenseKey} =require("./generatelicensekeys.js");
const licenseRouter = require('./routes/licenseRoutes/validatelicensekey.js');
// const { createLicenseKeys } = require('./utilities/licenseKeyAdmin.js');




// --- MIDDLEWARE ---
// 1. CORS Configuration: Allows your frontend (running on a different port/domain) to talk to the backend.
const corsOptions = {
    // origin: process.env.ALLOWED_ORIGIN, // ONLY allow requests from your specific frontend URL
    origin: process.env.ALLOWED_ORIGIN, // ONLY allow requests from your specific frontend URL
    methods: 'POST',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 2. Body Parser: Allows Express to read incoming JSON requests
app.use(express.json());



(async ()=>{
    try{
        await initializeDatabase();
        const db=await getConnection();
        app.use('/api/licensekey', licenseRouter(db)); // <-- This defines the API endpoint!
        // await generateLicenseKey();
        // console.log(db);
        
    }
    catch(err){
        console.log(err);
    }
    
})()


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`✅ Server running on Host this port=:${PORT}`);
    console.log(`Allowed CORS origin: ${process.env.ALLOWED_ORIGIN}`);
});