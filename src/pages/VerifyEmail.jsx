import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/VerifyEmailStyle.css';
import apiUrl from '../../apiUrl';
import Swal from 'sweetalert2';

const VerifyEmail = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [codeVerified, setCodeVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const response = await axios.post(`${apiUrl}/api/send-verification-code`, { email });
            setMessage(response.data.message);
            setError('');
            Swal.fire({
                icon: 'success',
                title: 'Verification Code Sent!',
                text: response.data.message,
            });
        } catch (error) {
            setMessage('');
            setError(error.response?.data?.error || 'An error occurred. Please try again later.');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.response?.data?.error || 'An error occurred. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const response = await axios.post(`${apiUrl}/api/verify-verification-code`, { email, code });
            if (response.status === 200) {
                setMessage('Email verification successful!');
                setError('');
                setCodeVerified(true);
                navigate('/register', { state: { emailVerified: true, email } });
                Swal.fire({
                    icon: 'success',
                    title: 'Email Verified!',
                    text: 'You can now proceed with registration.',
                });
            } else {
                setMessage('');
                setError('Email verification failed. Please try again.');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Email verification failed. Please try again.',
                });
            }
        } catch (error) {
            setMessage('');
            setError('An error occurred. Please try again later.');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-email-container">
            <h2 className="verify-email-heading">Verify Email</h2>
            <form className="verify-email-form" onSubmit={handleSubmit}>
                <div className="verify-email-form-group">
                    <label className="verify-email-label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={handleChange}
                        required
                        className="verify-email-input"
                    />
                </div>
                {message && <div className="verify-email-success">{message}</div>}
                {error && <div className="verify-email-error">{error}</div>}
                <button type="submit" className="verify-email-button">
                    {loading ? 'Sending the Verification Code...' : 'Send Verification Code'}
                </button>
            </form>

            {(!codeVerified && (message || error)) && (
                <form className="verify-email-form" onSubmit={handleCodeSubmit}>
                    <div className="verify-email-form-group">
                        <label className="verify-email-label">Code:</label>
                        <input
                            type="text"
                            value={code}
                            onChange={handleCodeChange}
                            required
                            className="verify-email-input"
                        />
                    </div>
                    <button type="submit" className="verify-email-button">
                        {loading ? 'Verifying the Code...' : 'Verify Code'}
                    </button>
                </form>
            )}

            <p className="verify-email-login-link">Already have an account? <Link to="/login" className="login-link">Login</Link></p>
        </div>
    );
};

export default VerifyEmail;
