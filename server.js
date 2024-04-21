const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomize = require('randomatic');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const SECRET_KEY = 'yourSecretKey';

// NoODEMAILER CONFIG
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'molaveengineering@gmail.com',
        pass: 'pser ukpk azel cafx', 
    },
});

// SENDING A 6-DIGIT CODE
app.post('/api/send-code', (req, res) => {
    const { email } = req.body;
    const code = randomize('0', 6);

    const emailCheckQuery = 'SELECT * FROM customer_info WHERE email = ?';
    db.query(emailCheckQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error checking email:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'There is no account registered with the entered Email. Please enter a valid Email.' });
        }

        const mailOptions = {
            from: 'MOLAVE ENGINEERING',
            to: email,
            subject: 'Password Reset Code',
            text: `Your verification code is: ${code}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Failed to send code. Please try again later.' });
            }

            console.log('Email sent:', info.response);

            try {
                const sql = 'UPDATE customer_info SET verification_code = ? WHERE email = ?';
                await db.query(sql, [code, email]);
                console.log('Verification code stored in the database:', code);
                res.status(200).json({ message: 'Code sent successfully.', code });
            } catch (updateError) {
                console.error('Error storing verification code:', updateError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    });
});


// VERIFYING THE CODE SENT
app.post('/api/verify-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required.' });
    }
    const sql = 'SELECT * FROM customer_info WHERE email = ? AND verification_code = ?';
    db.query(sql, [email, code], (err, results) => {
        if (err) {
            console.error('Error verifying code:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
        }

        res.status(200).json({ message: 'Verification code is valid.' });
    });
});

// CHANGING PASSWORD
app.post('/api/change-password', (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Email, code, and new password are required.' });
    }

    const validateCodeQuery = 'SELECT * FROM customer_info WHERE email = ? AND verification_code = ?';

    db.query(validateCodeQuery, [email, code], (err, results) => {
        if (err) {
            console.error('Error verifying code:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
        }

        const updatePasswordQuery = 'UPDATE customer_info SET password = ? WHERE email = ?';

        db.query(updatePasswordQuery, [newPassword, email], (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Error updating password:', updateErr.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

// TOKEN MIDDLEWARE DEFINITION
const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Error decoding token:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// CUSTOMER LOGIN
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    const sql = 'SELECT customer_id, username, email FROM customer_info WHERE (username = ? OR email = ?) AND password = ?';
    const values = [identifier, identifier, password];

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, values, (error, results) => {
            connection.release();

            if (error) {
                console.error('Login failed:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const user = results[0];

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({ userId: user.customer_id, username: user.username }, SECRET_KEY, {
                expiresIn: '1h',
            });

            res.status(200).json({ token });
        });
    });
});

// CUSTOMER REGISTRATION
app.post('/api/register', (req, res) => {
    const {
        firstName,
        middleName,
        lastName,
        email,
        contactNumber,
        username,
        password,
    } = req.body;

    const emailCheckQuery = 'SELECT COUNT(*) AS emailCount FROM customer_info WHERE email = ?';
    const usernameCheckQuery = 'SELECT COUNT(*) AS usernameCount FROM customer_info WHERE username = ?';

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(emailCheckQuery, [email], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].emailCount);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query(usernameCheckQuery, [username], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].usernameCount);
                }
            });
        })
    ])
    .then(([emailCount, usernameCount]) => {
        if (emailCount > 0) {
            return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
        } else if (usernameCount > 0) {
            return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
        } else {
            const sql = `
                INSERT INTO customer_info
                (firstName, middleName, lastName, email, contactNumber, username, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [firstName, middleName, lastName, email, contactNumber, username, password];

            db.getConnection((err, connection) => {
                if (err) {
                    console.error('Error getting connection:', err.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                connection.query(sql, values, (error, results) => {
                    connection.release();

                    if (error) {
                        console.error('Registration failed:', error.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    console.log('Registration successful:', results);
                    res.status(201).json({ message: 'Registration successful' });
                });
            });
        }
    })
    .catch((error) => {
        console.error('Error checking email or username existence:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    });
});


// RETRIEVE USER INFORMATION BASED ON THE PROVIDED TOKEN
app.get('/api/user', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { userId, username } = decoded;

        const sql = 'SELECT * FROM customer_info WHERE customer_id = ?';

        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            connection.query(sql, [userId], (error, results) => {
                connection.release();

                if (error || results.length === 0) {
                    console.error('Error fetching user information:', error ? error.message : 'User not found');
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const user = results[0];
                res.status(200).json({
                    userId,
                    username,
                    password: user.password,
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    address: user.address,
                    email: user.email,
                    contactNumber: user.contactNumber
                });
            });
        });
    } catch (error) {
        console.error('Error decoding token:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// EDITING / UPDATING USER PROFILE
app.put('/api/update-profile', verifyToken, (req, res) => {
    const { username, oldPassword, newPassword, ...profileData } = req.body;
    const userId = req.userId;

    const updateProfileQuery = `
      UPDATE customer_info
      SET
        firstName = ?,
        middleName = ?,
        lastName = ?,
        email = ?,
        contactNumber = ?,
        address = ?
      WHERE customer_id = ?;
    `;

    const updateProfileValues = [
        profileData.firstName,
        profileData.middleName,
        profileData.lastName,
        profileData.email,
        profileData.contactNumber,
        profileData.address,
        userId,
    ];

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(updateProfileQuery, updateProfileValues, (updateError, updateResult) => {
            connection.release();

            if (updateError) {
                console.error('Error updating profile:', updateError.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json({ message: 'Profile updated successfully' });
        });
    });
});


// EDITING / UPDATING USER LOGIN DETAILS
app.put('/api/change-login', verifyToken, (req, res) => {
    const { oldPassword, newUsername, newPassword } = req.body;
    const userId = req.userId;

    const validatePasswordQuery = `
        SELECT customer_id
        FROM customer_info
        WHERE customer_id = ? AND password = ?;
    `;

    db.query(validatePasswordQuery, [userId, oldPassword], (validateError, validateResult) => {
        if (validateError) {
            console.error('Error validating old password:', validateError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (validateResult.length === 0) {
            return res.status(400).json({ error: 'Invalid old password' });
        }

        // Check if the new username already exists
        if (newUsername) {
            const checkUsernameQuery = `
                SELECT customer_id
                FROM customer_info
                WHERE username = ? AND customer_id != ?;
            `;

            db.query(checkUsernameQuery, [newUsername, userId], (checkUsernameError, checkUsernameResult) => {
                if (checkUsernameError) {
                    console.error('Error checking username:', checkUsernameError.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                if (checkUsernameResult.length > 0) {
                    return res.status(409).json({ error: 'Username already exists' });
                }

                // Proceed with updating the username and/or password
                updateLoginDetails(newUsername, newPassword, userId, res);
            });
        } else {
            // Proceed with updating the password only
            updateLoginDetails(null, newPassword, userId, res);
        }
    });
});

function updateLoginDetails(newUsername, newPassword, userId, res) {
    const updates = [];
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (newUsername) {
            const updateUsernameQuery = `
                UPDATE customer_info
                SET username = ?
                WHERE customer_id = ?;
            `;
            updates.push(
                new Promise((resolve, reject) => {
                    connection.query(updateUsernameQuery, [newUsername, userId], (updateUsernameError, updateUsernameResult) => {
                        if (updateUsernameError) {
                            reject(updateUsernameError);
                        } else {
                            resolve(updateUsernameResult);
                        }
                    });
                })
            );
        }

        if (newPassword) {
            const updatePasswordQuery = `
                UPDATE customer_info
                SET password = ?
                WHERE customer_id = ?;
            `;
            updates.push(
                new Promise((resolve, reject) => {
                    connection.query(updatePasswordQuery, [newPassword, userId], (updatePasswordError, updatePasswordResult) => {
                        if (updatePasswordError) {
                            reject(updatePasswordError);
                        } else {
                            resolve(updatePasswordResult);
                        }
                    });
                })
            );
        }

        Promise.all(updates)
            .then(() => {
                connection.release();
                res.status(200).json({ message: 'Login details changed successfully' });
            })
            .catch((updateError) => {
                console.error('Error changing login details:', updateError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    });
}



// RETRIEVE CUSTOMERS
app.get('/api/customers', (req, res) => {
    const sql = 'SELECT * FROM customer_info';

    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Failed to retrieve customers_info:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Customers_info retrieved successfully:', results);
                res.status(200).json(results);
            }
        });
    });
});


// ADDING A VEHICLE
app.post('/api/add-vehicle', verifyToken, (req, res) => {
    const { userId } = req;
    const {
        make,
        model,
        year,
        mileage,
        fuelType,
        vehicleType,
        plateNumber,
    } = req.body;

    if (
        !make || !model || !year || !mileage || !fuelType || !vehicleType || !plateNumber ||
        make.trim() === '' || model.trim() === '' || year.trim() === '' || mileage.trim() === '' ||
        vehicleType.trim() === '' || plateNumber.trim() === ''
    ) {
        return res.status(400).json({ error: 'Please provide all required fields before adding a new vehicle.' });
    }

    const sql = `
        INSERT INTO customer_vehicles
        (customer_id, make, model, year, mileage, fuel_type, vehicle_type, plate_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, make, model, year, mileage, fuelType, vehicleType, plateNumber];

    // Acquire a connection from the pool
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, values, (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error adding a new vehicle:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(201).json({ message: 'New vehicle added successfully' });
            }
        });
    });
});


// REMOVING USER VEHICLE
app.delete('/api/remove-vehicle/:vehicleId', verifyToken, (req, res) => {
    const userId = req.userId;
    const vehicleId = req.params.vehicleId;

    const deleteVehicleQuery = `
        DELETE FROM customer_vehicles
        WHERE vehicle_id = ? AND customer_id = ?
    `;

    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(deleteVehicleQuery, [vehicleId, userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error removing vehicle:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json({ message: 'Vehicle removed successfully' });
            }
        });
    });
});


// RETRIEVING VEHICLES BASED ON USER
app.get('/api/user-vehicles', verifyToken, (req, res) => {
    const { userId } = req;

    const sql = 'SELECT * FROM customer_vehicles WHERE customer_id = ?';

    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, [userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching user vehicles:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('User vehicles retrieved successfully:', results);
                res.status(200).json(results);
            }
        });
    });
});


// RETRIEVE SERVICES
app.get('/api/services', (req, res) => {
    const sql = 'SELECT * FROM services';

    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching services:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json(results);
            }
        });
    });
});


// BOOKING A RESERVATION
app.post('/api/book-reservation', verifyToken, (req, res) => {
    try {
        const { date, time, selectedServiceId, problemDescription, selectedVehicleId } = req.body;
        const customerId = req.userId;
        const reservationQuery = `
            INSERT INTO reservations (customer_id, service_id, vehicle_id, problem_description, date, time)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        // Acquire a connection from the pool
        db.getConnection((getConnectionError, connection) => {
            if (getConnectionError) {
                console.error('Error getting connection:', getConnectionError.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            connection.query(
                reservationQuery,
                [customerId, selectedServiceId, selectedVehicleId, problemDescription, date, time],
                (queryError, results) => {
                    connection.release();

                    if (queryError) {
                        console.error('Error booking reservation:', queryError.message);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.status(200).json({ message: 'Reservation booked successfully' });
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error booking reservation:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// RETRIEVING USER RESERVATIONS
app.get('/api/user-reservations', verifyToken, (req, res) => {
    const { userId } = req;

    const sql = `
        SELECT reservations.reservation_id, reservations.date, reservations.time,
               services.serviceType,
               customer_vehicles.make as vehicle_make,
               customer_vehicles.model as vehicle_model,
               customer_vehicles.year as vehicle_year,
               reservations.problem_description,
               reservations.status
        FROM reservations
        INNER JOIN services ON reservations.service_id = services.service_id
        INNER JOIN customer_vehicles ON reservations.vehicle_id = customer_vehicles.vehicle_id
        WHERE reservations.customer_id = ?
        ORDER BY reservations.date DESC;
    `;

    // Acquire a connection from the pool
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, [userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching user reservations:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('User reservations retrieved successfully:', results);
                res.status(200).json(results);
            }
        });
    });
});


// RETRIEVING USER APPROVED RESERVATIONS
app.get('/api/user-approved-reservations', verifyToken, (req, res) => {
    const { userId } = req;

    const sql = `
        SELECT reservations.reservation_id, reservations.date, reservations.time,
               services.serviceType,
               customer_vehicles.make as vehicle_make,
               customer_vehicles.model as vehicle_model,
               customer_vehicles.year as vehicle_year,
               reservations.problem_description,
               reservations.status
        FROM reservations
        INNER JOIN services ON reservations.service_id = services.service_id
        INNER JOIN customer_vehicles ON reservations.vehicle_id = customer_vehicles.vehicle_id
        WHERE reservations.customer_id = ? AND reservations.status = 'Approved'
        ORDER BY reservations.date DESC;
    `;

    // Acquire a connection from the pool
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, [userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching user approved reservations:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('User approved reservations retrieved successfully:', results);
                res.status(200).json(results);
            }
        });
    });
});


// RETRIEVING VEHICLES BASED ON APPROVED RESERVATIONS
app.get('/api/vehicles-on-approved-reservations', verifyToken, (req, res) => {
    const { userId } = req;

    const sql = `
        SELECT customer_vehicles.*
        FROM customer_vehicles
        INNER JOIN reservations ON customer_vehicles.vehicle_id = reservations.vehicle_id
        WHERE reservations.customer_id = ? AND reservations.status = 'Approved'
    `;

    // Acquire a connection from the pool
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, [userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching vehicles on approved reservations:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Vehicles on approved reservations retrieved successfully:', results);
                res.status(200).json(results);
            }
        });
    });
});

// RETRIEVE PENDING BILLS
app.get('/api/pending-bills', verifyToken, (req, res) => {
    const userId = req.userId;

    const sql = `
        SELECT bq.billing_id, r.date, r.time, s.serviceType, v.make, v.model, v.year, bq.extraExpense_reason, bq.extraExpense_cost, bq.total_cost
        FROM billing_queue bq
        JOIN reservations r ON bq.reservation_id = r.reservation_id
        JOIN services s ON r.service_id = s.service_id
        JOIN customer_vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE r.customer_id = ? AND r.status = 'Done';
    `;

    // Acquire a connection from the pool
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, [userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching pending bills:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json(results);
            }
        });
    });
});


// RETRIEVE PAYMENT HISTORY
app.get('/api/payment-history', verifyToken, (req, res) => {
    const userId = req.userId;

    const sql = `
        SELECT bi.invoice_id, r.date, r.time, s.serviceType, v.make, v.model, v.year, 
               bi.customerName, bi.serviceDone, bi.extraCost_reason, bi.extraCost, bi.totalCost, bi.receipt_Image, bi.created_at
        FROM billing_invoice bi
        JOIN reservations r ON bi.reservation_id = r.reservation_id
        JOIN services s ON r.service_id = s.service_id
        JOIN customer_vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE r.customer_id = ? AND r.status = 'Completed';
    `;

    // Acquire a connection from the pool
    db.getConnection((getConnectionError, connection) => {
        if (getConnectionError) {
            console.error('Error getting connection:', getConnectionError.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(sql, [userId], (queryError, results) => {
            connection.release();

            if (queryError) {
                console.error('Error fetching payment history:', queryError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                const paymentHistoryWithBase64 = results.map((history) => {
                    return {
                        ...history,
                        receipt_Image: history.receipt_Image.toString('base64'),
                    };
                });

                res.status(200).json(paymentHistoryWithBase64);
            }
        });
    });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
