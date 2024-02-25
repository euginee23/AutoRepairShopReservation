import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/LoginStyle.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:3001/api/login', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      alert('Login successful!');
      navigate('/main'); 
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrors({ general: 'Invalid username or password' });
        alert('Invalid username or password. Please try again.');
      } else {
        console.error('Login failed:', error.message);
        alert('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Cadiz Auto Repair Shop</h1>
      <h3 className="login-subtitle">Auto Repair Service Reservation</h3>
      <h2 className="login-heading">Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-group">
          <label className="login-label">Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="login-input"
          />
        </div>

        <div className="login-form-group">
          <label className="login-label">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />
        </div>

        {errors.general && <div className="login-error">{errors.general}</div>}

        <button type="submit" className="login-button">Login</button>
        <p className="login-register-link">Don't have an account? <Link to="/register" className="login-link">Register</Link></p>
      </form>
    </div>
  );
};

export default Login;
