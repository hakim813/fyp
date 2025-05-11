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
    <div className="login-container flex justify-center items-center h-screen">
      <div className="login-box bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold text-black">
          We<span className="text-green-500">Gig</span>
        </h1>
        <h2 className="text-xl text-black mb-6">Login to Account</h2>
        <p className="text-gray-600 mb-4">Please enter your email and password to continue</p>

        <form onSubmit={handleLogin}>
          <div className="input-field mb-4">
            <label className="block text-gray-700">Email Address:</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="input-field mb-4">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <a href="/forgot-password" className="text-blue-500 text-sm mt-1 block text-right">
              Forgot Password?
            </a>
          </div>

          {errorMessage && (
            <div className="error-message text-red-500 text-sm mb-4">{errorMessage}</div>
          )}

          <div className="checkbox-field flex items-center mb-6">
            <input
              type="checkbox"
              checked={rememberPassword}
              onChange={() => setRememberPassword(!rememberPassword)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Remember Password</label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Sign In
          </button>
        </form>

        <div className="signup-text text-sm text-gray-600 mt-4">
          <p>
            Don’t have an account?{' '}
            <a href="/signup" className="text-blue-500 font-semibold">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>

  );
}

export default Login;
