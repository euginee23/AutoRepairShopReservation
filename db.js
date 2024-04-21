const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'b9sxbycirx4uxfa6hy8i-mysql.services.clever-cloud.com',
    user: 'unskwri0pshtw6x6',
    password: '0GczO34KcOpMvIiOI57Q',
    database: 'b9sxbycirx4uxfa6hy8i',
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
