import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import registrationValidationSchema from '../validation/registrationValidation';
import '../css/RegistrationStyle.css';
import apiUrl from '../../apiUrl';

const Registration = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));

        registrationValidationSchema
            .validateAt(name, formData)
            .then(() => setErrors({ ...errors, [name]: undefined }))
            .catch((error) => setErrors({ ...errors, [name]: error.message }));
    };

    const handleBlur = (e) => {
        registrationValidationSchema
            .validateAt(e.target.name, formData)
            .then(() => setErrors({ ...errors, [e.target.name]: undefined }))
            .catch((error) => setErrors({ ...errors, [e.target.name]: error.message }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await registrationValidationSchema.validate(formData, { abortEarly: false });

            const response = await axios.post(`${apiUrl}/api/register`, formData);
            console.log('Registration successful:', response.data);
            alert('Registration successful!');
            navigate('/');
        } catch (error) {
            if (error.name === 'ValidationError') {
                const newErrors = {};
                error.inner.forEach((e) => {
                    newErrors[e.path] = e.message;
                });
                setErrors(newErrors);
            } else {
                console.error('Registration failed:', error.response.data);
            }
        }
    };

    return (
        <div className="registration-container">
            <form className="registration-form" onSubmit={handleSubmit}>
                <h2 className="registration-heading">Fill up Registration Form!</h2>
                <h6 className="registration-subHeading">It's fast and easy.</h6>

                <div className={`registration-input-container ${formData.firstName ? 'active' : ''}`}>
                    <label className="registration-label">First Name:</label>
                    <input
                        className="registration-input"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>

                <div className={`registration-input-container ${formData.lastName ? 'active' : ''}`}>
                    <label className="registration-label">Last Name:</label>
                    <input
                        className="registration-input"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>

                <div className={`registration-input-container ${formData.email ? 'active' : ''}`}>
                    <label className="registration-label">Email:</label>
                    <input
                        className="registration-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>

                <div className={`registration-input-container ${formData.contactNumber ? 'active' : ''}`}>
                    <label className="registration-label">Contact Number:</label>
                    <input
                        className="registration-input"
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        pattern="[0-9]{11}"
                        onBlur={handleBlur}
                        required
                    />
                </div>

                <div className={`registration-input-container ${formData.username ? 'active' : ''}`}>
                    <label className="registration-label">Username:</label>
                    <input
                        className="registration-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>

                <div className={`registration-input-container ${formData.password ? 'active' : ''}`}>
                    <label className="registration-label">Password:</label>
                    <input
                        className="registration-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>

                <div className={`registration-input-container ${formData.confirmPassword ? 'active' : ''}`}>
                    <label className="registration-label">Confirm Password:</label>
                    <input
                        className="registration-input"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>

                {Object.keys(errors).map((key) => (
                    <div key={key} className="registration-error">
                        {errors[key]}
                    </div>
                ))}
                <button className="registration-button" type="submit">
                    Register
                </button>
                <p className="login-register-link">Already have an account? <Link to="/" className="login-link">Login</Link></p>
            </form>
        </div>
    );
};

export default Registration;
