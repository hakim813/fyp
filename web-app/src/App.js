import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // Import Router components
import { UserProvider } from './utils/UserContext';  // Corrected path for UserContext
import './styles/App.css';  // Corrected path for App.css
import "tailwindcss/tailwind.css"

import Navbar from './components/Navbar';  // Import Navbar component
import Sidebar from './components/Sidebar';

import Login from './modules/Authentication/Login';
import Signup from './modules/Authentication/Signup';
import Home from './modules/Home/Home';
import Profile from './modules/Profile/Profile';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Conditionally render Navbar */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<><Login /></>} />  {/* Only show login page */}
          <Route path="/signup" element={<><Signup /></>} />  {/* Only show signup page */}
          <Route path="/home" element={<><Navbar /><Home /></>} />  {/* Show navbar only in Home page */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
