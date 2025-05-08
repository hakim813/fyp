import React, { useState } from 'react';
import { auth } from './firebase';  // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';  // Import Firebase Auth function
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirection

function Login() {
  const [email, setEmail] = useState('');  // State to hold the email input
  const [password, setPassword] = useState('');  // State to hold the password input
  const [error, setError] = useState('');  // State to hold any error messages

  const navigate = useNavigate();  // Initialize useNavigate for redirecting after login

  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent the page from refreshing on form submit

    try {
      // Attempt to sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");

      // Redirect to the Home page after successful login
      navigate('/home');
    } catch (error) {
      // If an error occurs, display the error message
      setError(error.message);
      console.error("Error logging in:", error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Log In</button>
      </form>

      {/* Display error message if login fails */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
