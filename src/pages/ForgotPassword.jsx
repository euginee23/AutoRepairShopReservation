import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/ForgotPasswordStyle.css';
import apiUrl from '../../apiUrl';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/send-code`, { email });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setMessage('');
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  }
  

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/verify-code`, { email, code });
      if (response.status === 200) {
        setMessage('Verification code is valid. Proceed with password reset.');
        setError('');
        setCodeVerified(true);
      } else {
        setMessage('');
        setError('Verification code is invalid. Please try again.');
      }
    } catch (error) {
      setMessage('');
      setError('An error occurred. Please try again later.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/change-password`, { email, code, newPassword });
      if (response.status === 200) {
        setMessage('Password reset successful!');
        setError('');
      } else {
        setMessage('');
        setError('An error occurred while resetting your password. Please try again.');
      }
    } catch (error) {
      setMessage('');
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-heading">Forgot Password</h2>
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <div className="forgot-password-form-group">
          <label className="forgot-password-label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleChange}
            required
            className="forgot-password-input"
          />
        </div>
        {message && <div className="forgot-password-success">{message}</div>}
        {error && <div className="forgot-password-error">{error}</div>}
        <button type="submit" className="forgot-password-button">Reset Password</button>
      </form>
      {message && !codeVerified && (
        <form className="forgot-password-form" onSubmit={handleCodeSubmit}>
          <div className="forgot-password-form-group">
            <label className="forgot-password-label">Code:</label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              required
              className="forgot-password-input"
            />
          </div>
          <button type="submit" className="forgot-password-button">Submit Code</button>
        </form>
      )}
      {codeVerified && (
        <form className="forgot-password-form" onSubmit={handleResetPassword}>
          <div className="forgot-password-form-group">
            <label className="forgot-password-label">New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              className="forgot-password-input"
            />
          </div>
          <button type="submit" className="forgot-password-button">Reset Password</button>
        </form>
      )}
      <p className="forgot-password-login-link">Remembered your password? <Link to="/login" className="login-link">Login</Link></p>
    </div>
  );
};

export default ForgotPassword;
