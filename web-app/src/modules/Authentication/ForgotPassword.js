import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <button
            type="button"
            className="back-button"
            style={{
              marginBottom: 18,
              background: "#f5f5f5",
              border: "none",
              borderRadius: 6,
              padding: "7px 18px",
              color: "#1976d2",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1em"
            }}
            onClick={() => navigate(-1)}
          >
            &larr; Back
          </button>
          <h2>Forgot Password</h2>
          <form onSubmit={handleReset}>
            <div className="input-field">
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Reset Password
            </button>
          </form>
          {message && <div style={{ color: "green", marginTop: 10 }}>{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;