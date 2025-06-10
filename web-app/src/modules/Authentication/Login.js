import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "../../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/home"))
      .catch(() => {
        setErrorMessage("Your email address and password don’t match. Try again.");
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="app-title">
          We<span className="app-title-highlight">Gig</span>
        </h1>
        <h2 className="login-subtitle">Login to Account</h2>
        <p className="login-desc">Please enter your email and password to continue</p>

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
            <a href="/forgot-password" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="checkbox-field">
            <input
              type="checkbox"
              checked={rememberPassword}
              onChange={() => setRememberPassword(!rememberPassword)}
            />
            <label>Remember Password</label>
          </div>

          <button type="submit" className="login-button">
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
