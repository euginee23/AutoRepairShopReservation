import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../css/LoginStyle.css';
import apiUrl from '../../apiUrl';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/login`, formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Login successful!',
        showConfirmButton: false,
        timer: 1500, 
      }).then(() => {
        navigate('/main');
      });
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 401) {
        setErrors({ general: 'Invalid username or password' });
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Invalid username or password. Please try again.',
        });
      } else {
        console.error('Login failed:', error.message);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An error occurred during login. Please try again.',
        });
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
          <label className="login-label">Username or Email:</label>
          <input
            type="text"
            name="identifier"
            value={formData.identifier}
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

        {isLoading ? (
          <button type="button" disabled className="login-button">
            Logging in...
          </button>
        ) : (
          <button type="submit" className="login-button">
            Login
          </button>
        )}

        <p className="login-register-link">
          Forgot your password?{' '}
          <Link to="/forgot-password" className="login-link">
            Reset it here
          </Link>
        </p>
        <p className="login-register-link">
          Don't have an account?{' '}
          <Link to="/verify-email" className="login-link">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
