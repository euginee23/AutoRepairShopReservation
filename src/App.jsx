import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Registration from './pages/Registration';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import EmailVerificationProcess from './pages/EmailVerificationProcess';
import EmailVerificationSuccess from './pages/EmailVerificationSuccess';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
        <Route path="/email-verification-process" element={<EmailVerificationProcess />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;