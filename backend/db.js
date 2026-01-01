const oracledb = require('oracledb');
require('dotenv').config();

// Oracle connection pool configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 2,
    schema: 'SYSTEM'
};

// Initialize connection pool
async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Oracle connection pool created successfully');
    } catch (err) {
        console.error('Error creating connection pool:', err);
        process.exit(1);
    }
}

async function close() {
    try {
        await oracledb.getPool().close(0);
        console.log('Oracle connection pool closed');
    } catch (err) {
        console.error('Error closing connection pool:', err);
    }
}

// Execute query function
async function execute(sql, binds = [], options = {}) {
    let connection;
    options.outFormat = oracledb.OUT_FORMAT_OBJECT;
    options.autoCommit = true;

    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, binds, options);
        return result;
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

module.exports = { initialize, close, execute };