// // utilities/licenseKeyAdmin.js

const crypto = require('crypto');

// The original generator logic (now a helper function)
function _generateSingleKey() {
    const charset = '23456789ABCDEFGHJKMNPQRSTUVWXY';
    const KEY_LENGTH = 16;
    const SEGMENT_SIZE = 4;
    
    let key = '';
    
    for (let i = 0; i < KEY_LENGTH; i++) {
        // Cryptographically secure random number
        const randomByte = crypto.randomBytes(1)[0];
        const randomIndex = randomByte % charset.length;
        key += charset[randomIndex];
    }
    
    // Insert dashes
    let formattedKey = '';
    for (let i = 0; i < KEY_LENGTH; i++) {
        formattedKey += key[i];
        if ((i + 1) % SEGMENT_SIZE === 0 && (i + 1) < KEY_LENGTH) {
            formattedKey += '-';
        }
    }

    return formattedKey;
}

/**
 * Generates a specified number of unique license keys and inserts them into the database.
 * @param {object} db - The active MySQL connection object.
 * @param {number} count - The number of keys to generate and insert (e.g., 20).
 * @returns {Promise<number>} The number of keys successfully inserted.
 */


// utilities/licenseKeyAdmin.js (Changes in the createLicenseKeys function)

async function createLicenseKeys(db, count = 1) {
    if (!db) {
        throw new Error("Database connection is required to create license keys.");
    }

    // NOTE: This assumes the creation_date column has DEFAULT CURRENT_TIMESTAMP
    const sql = `
        INSERT INTO license_keys (license_key, expiry_date) 
        VALUES ?
    `;
    
    // The values to be inserted will look like: [['KEY1', expiry_date_string], ['KEY2', expiry_date_string], ...]
    const keysWithExpiry = [];

    const keysToInsert = [];
    const createdKeys = [];
    const maxAttempts = count * 2; // Prevent infinite loop in case of collisions

    // Generate keys, checking for uniqueness in the process
    while (createdKeys.length < count && keysToInsert.length < maxAttempts) {
        const key = _generateSingleKey();
        
        // This is a simple uniqueness check. A batch insert with a DB constraint is better,
        // but this works for simple key generation.
        if (!createdKeys.includes(key)) {
            keysToInsert.push([key]);
            createdKeys.push(key);
        }
    }
    
    if (keysToInsert.length === 0) {
         console.warn("Could not generate unique keys. No keys inserted.");
         return 0;
    }


    
    for (const key of createdKeys) {
        // We calculate the expiry date in Node.js for the bulk insert structure
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 31);
        
        // Push the key and the calculated date (formatted for MySQL DATETIME)
        keysWithExpiry.push([
            key, 
            expiryDate.toISOString().slice(0, 19).replace('T', ' ')
        ]);
    }

    // Use the keysWithExpiry array in the bulk insert
    const [result] = await db.query(sql, [keysWithExpiry]);
    
    console.log(`Successfully created and inserted ${result.affectedRows} new license key(s).`);
    return result.affectedRows;
}

module.exports = {
    createLicenseKeys
};