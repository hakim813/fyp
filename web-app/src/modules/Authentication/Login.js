import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for routing
import { auth } from "../../firebase/firebase"; // Correct path for Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import "../../styles/login.css"; // Importing the CSS file

function Login() {
  const navigate = useNavigate(); // Hook to navigate to different pages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Firebase login authentication
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Redirect to home page after successful login
        navigate("/home");
      })
      .catch((error) => {
        setErrorMessage("Your email address and password don’t match. Try again.");
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>
          We<span>Gig</span>
        </h1>
        <h2>Login to Account</h2>
        <p>Please enter your email and password to continue</p>


        <form onSubmit={handleLogin}>
          <div className="input-field">
            <label>Email Address:</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <a href="/forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          {/* Display error message if login fails */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="checkbox-field">
            <input
              type="checkbox"
              checked={rememberPassword}
              onChange={() => setRememberPassword(!rememberPassword)}
            />
            <label>Remember Password</label>
          </div>

          <button type="submit" className="btn">
            Sign In
          </button>
        </form>

        <div className="signup-text">
          <p>
            Don’t have an account?{" "}
            <a href="/signup" className="signup-link">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
