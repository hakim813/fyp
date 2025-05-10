import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase'; // Firebase auth
import { useNavigate } from 'react-router-dom'; // For navigation
import '../../styles/login.css';  // Correct path to login.css


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password); // Firebase authentication
      navigate('/home'); // Redirect to home page after successful login
    } catch (error) {
      setError(error.message); // Display error if login fails
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1>We<span className="highlight">Gig</span></h1>
        <h2>Login to Account</h2>
        <p>Please enter your email and password to continue</p>

        <form onSubmit={handleLogin}>
          <div className="input-field">
            <label htmlFor="email">Email address:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
          </div>

          <div className="input-field password-container">
            <label htmlFor="password">Password:</label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <div className="remember-container">
            <input
              type="checkbox"
              id="remember"
              checked={rememberPassword}
              onChange={() => setRememberPassword(!rememberPassword)}
            />
            <label htmlFor="remember">Remember Password</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn">Sign In</button>
        </form>

        <div className="signup-text">
          <p>Don't have an account? <a href="/signup">Create Account</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
