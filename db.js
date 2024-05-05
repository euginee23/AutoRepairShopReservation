const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 15,
    host: 'bwnqthzv2o6xaim43ak5-mysql.services.clever-cloud.com',
    user: 'uizbrucd6hqnoq24',
    password: 'IqG7YurypTxLS9Z3T2Z',
    database: 'bwnqthzv2o6xaim43ak5',
    port: '20995',
});

/* const pool = mysql.createPool({
    connectionLimit: 15,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auto_reservation_db',
}); */

pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection error:', err.message);
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

module.exports = pool;
