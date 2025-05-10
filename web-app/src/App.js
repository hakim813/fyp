import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // Import Router components
import { UserProvider } from './utils/UserContext';  // UserContext to manage user state
import './styles/App.css';  // Global styles


// Import components
import Login from './modules/Authentication/Login';  // Login page component
import Signup from './modules/Authentication/Signup';  // Signup page component (if needed)
import Home from './modules/Home/Home';  // Home page component

function App() {
  return (
    <UserProvider>  {/* Wrap everything inside UserProvider */}
      <Router>  {/* Use Router to handle navigation */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
          <Route path="/login" element={<Login />} />  {/* Route to Login page */}
          <Route path="/signup" element={<Signup />} /> {/* Route to Sign Up page */}
          <Route path="/home" element={<Home />} />   {/* Route to Home page */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
