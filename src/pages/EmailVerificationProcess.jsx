import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailVerificationProcess = () => {
    const location = useLocation();
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerification = async (e) => {
        e.preventDefault();

        const { state } = location;

        try {
            setLoading(true);

            console.log('Submitting verification request with email:', state?.email, 'and code:', verificationCode);

            if (state && state.email) {
                // Make a request to verify the email with the entered code
                const response = await axios.put('http://localhost:3001/api/verify-email', {
                    email: state.email,
                    verificationCode: verificationCode,
                });

                console.log('Response:', response.data); // Log response data

                if (response.data.message === 'Email verification successful.') {
                    // Redirect to a success page or login page
                    console.log('Email verified successfully!');
                } else {
                    setError('Invalid verification code');
                }
            } else {
                setError('Invalid or missing email in the state object');
            }
        } catch (error) {
            console.error('Verification failed:', error);

            if (error.response) {
                console.error('Response data:', error.response.data);
            }

            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Email Verification</h2>
            <p>Please enter the verification code sent to your email.</p>
            <form onSubmit={handleVerification}>
                <label>Verification Code:</label>
                <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    );
};

export default EmailVerificationProcess;
