const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auto_reservation_db',
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection error:', err.message);
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

module.exports = pool;
