// db-connection.js

const mysql = require('mysql2/promise');

// Declare connection variable globally within this module
let connection; 

// --- DATABASE CONFIGURATION ---
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
 


async function initializeDatabase() {
    try {
        // 1. Establish database connection
        connection = await mysql.createConnection(dbConfig);
        console.log("Database connection established.");
        
        // 2. Run Database Migration/Setup
        await connection.execute(CREATE_LICENSES_TABLE_SQL);
        console.log("✅ 'license_keys' table checked/created successfully.");

        return connection; 

    } catch (error) {
        console.error("❌ Database Initialization FAILED:", error);
        // Exit process if DB is critical
        process.exit(1);
    }
}

/**
 * Helper function to get the active connection object.
 * Returns the connection only after initializeDatabase() has completed.
 */
function getConnection() {
    if (!connection) {
        throw new Error("Database connection not yet established or failed.");
    }
    return connection;
}

module.exports = {
    initializeDatabase,
    getConnection
};