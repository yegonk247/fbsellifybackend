// create_keys_script.js

// require('dotenv').config();


// TO THIS (if you name the file .env.railway):
require('dotenv').config({ path: './.env.railway' });


const { initializeDatabase, getPool } = require('./databaseconnection.js');
const { createLicenseKeys } = require('./utilities/licenseKeyAdmin.js'); 

const NUMBER_OF_KEYS_TO_GENERATE = 7;

(async () => {
    try {
        // 1. Ensure DB is connected and tables exist
        await initializeDatabase(); 
        
        // 2. Get the connection object
        const db = getPool(); 
        
        // 3. Generate and insert the keys
        console.log(`Attempting to generate and insert ${NUMBER_OF_KEYS_TO_GENERATE} keys...`);
        const insertedCount = await createLicenseKeys(db, NUMBER_OF_KEYS_TO_GENERATE);
        
        console.log(`✅ Script complete. Total keys inserted: ${insertedCount}`);
        
    } catch (error) {
        console.error("❌ Key Generation Script Failed:", error.message);
    } finally {
        // Exit the process when done
        process.exit(); 
    }
})();