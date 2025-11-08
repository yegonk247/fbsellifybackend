// db-connection.js

const mysql = require('mysql2/promise'); // Using promise API


let pool; // Declare a pool variable



// --- DATABASE CONFIGURATION ---
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, //

    waitForConnections: true,
    connectionLimit: 100, // Define max connections
    queueLimit: 0  
};


// SQL to create the license_keys table if it doesn't exist
const CREATE_LICENSES_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS \`license_keys\` (
        \`license_id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`license_key\` VARCHAR(64) NOT NULL UNIQUE,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`creation_date\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`expiry_date\` DATETIME NULL,
        \`user_id\` INT NULL,
        \`last_validated\` TIMESTAMP NULL,
        \`max_activations\` INT NOT NULL DEFAULT 1,
        \`current_activations\` INT NOT NULL DEFAULT 0,
        INDEX \`idx_license_key\` (\`license_key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

 // Establishes MySQL connection and runs initial schema setup.
//   @returns {Promise<object>} The active MySQL connection object.
 
    const initializeDatabase = async () => {
        try{
            // 1. Create the Pool object
            pool = mysql.createPool(dbConfig);
            console.log("✅ Database Pool Initialized");
            // You can test the connection here if you like, but it's optional for a Pool
            const connection = await pool.getConnection();
            // conn.release();
            await connection.execute(CREATE_LICENSES_TABLE_SQL);
            console.log("✅ 'license_keys' table checked/created successfully.");
            
            // 4. RELEASE THE CONNECTION BACK TO THE POOL
            connection.release(); 
            
            // 5. Return the Pool (the object that manages connections)
            return pool;

        }
        catch(err){
             console.error("❌ Database Initialization FAILED:", err);
            // Exit process if DB is critical
            process.exit(1);
        }
    };

    // 2. Export the getter for the Pool
    const getPool = () => {
        if (!pool) {
            console.error("❌ Database Initialization FAILED for create Pool connection:", error);
            throw new Error("Database Pool has not been initialized!");
            // process.exit(1);
        }
        return pool;
    };



module.exports = {
    initializeDatabase,
    getPool
};