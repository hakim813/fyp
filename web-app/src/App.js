import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './utils/UserContext';
import './styles/App.css';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './modules/Authentication/Login';

import Signup from './modules/Authentication/Signup';

import Home from './modules/Home/Home';

import Profile from './modules/Profile/Profile';
import EditProfile from "./modules/Profile/EditProfile";

import Helpdesk from './modules/Helpdesk/Helpdesk';
import History from './modules/Helpdesk/History';

import Redeem from './modules/Redeem/Redeem';

import Forum from './modules/Forum/Forum';
import CreatePost from './modules/Forum/CreatePost';

import FinanceManager from './modules/Finance/FinanceManager';
import FinancialRecord from './modules/Finance/FinancialRecord';
import CreateFinanceRecord from './modules/Finance/CreateFinanceRecord';
import ScanReceipt from './modules/Finance/ScanReceipt';
import AddPlan from './modules/Finance/AddPlan';

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
          <Route path="/helpdesk/history" element={<><Navbar /><History /></>} />

          <Route path="/redeem" element={<><Navbar /><Redeem /></>} />

          <Route path="/forum" element={<><Navbar /><Forum /></>} />
          <Route path="/forum/create" element={<><Navbar /><CreatePost /></>} />

          <Route path="/finance" element={<><Navbar /><FinanceManager /></>} />
          <Route path="/finance/records" element={<><Navbar /><FinancialRecord /></>} />
          <Route path="/finance/create" element={<><Navbar /><CreateFinanceRecord /></>} />
          <Route path="/finance/scan" element={<><Navbar /><ScanReceipt /></>} />
          <Route path="/finance/add-plan" element={<><Navbar /><AddPlan /></>} />


          {/* Sidebar for all routes except Login and Signup */}
          

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
