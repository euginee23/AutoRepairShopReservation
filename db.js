const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auto_reservation_db',
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err.message);
    } else {
        console.log('Connected to MySQL database');
    }
});

module.exports = db;