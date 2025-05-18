import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './utils/UserContext';
import './styles/App.css';
import "tailwindcss/tailwind.css";

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './modules/Authentication/Login';
import Signup from './modules/Authentication/Signup';
import Home from './modules/Home/Home';
import Profile from './modules/Profile/Profile';
import EditProfile from "./modules/Profile/EditProfile";
import Helpdesk from './modules/Helpdesk/Helpdesk';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/home" element={<><Navbar /><Home /></>} />

          {/* Add Navbar wrapper for Profile, EditProfile, Helpdesk */}
          <Route path="/profile" element={<><Navbar /><Profile /></>} />
          <Route path="/edit-profile" element={<><Navbar /><EditProfile /></>} />
          <Route path="/helpdesk" element={<><Navbar /><Helpdesk /></>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
