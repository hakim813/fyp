import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // Import Router components
import { UserProvider } from './UserContext';  // Import UserProvider to manage user state
import './App.css';  // Import styles

import Login from './Login';  // Import Login component
import Home from './Home';  // Import Home component

function App() {
  return (
    <UserProvider>  {/* Wrap everything inside UserProvider */}
      <Router>  {/* Use Router to handle navigation */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect from root to login */}
          <Route path="/login" element={<Login />} />  {/* Route to Login page */}
          <Route path="/home" element={<Home />} />   {/* Route to Home page */}
        </Routes>
      </Router>
      <div className="App">
        <header className="App-header">
          <p>Welcome to the Web App!</p>
        </header>
      </div>
    </UserProvider>
  );
}

export default App;
