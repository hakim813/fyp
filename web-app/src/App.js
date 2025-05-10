import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./utils/UserContext";
import Navbar from "./components/Navbar";  // Importing the Navbar component
import "./styles/App.css";  // Importing the main app styles

import Login from "./modules/Authentication/Login";
import Home from "./modules/Home/Home";
// import Forum from "./modules/Forum/Forum";
// import Finance from "./modules/Finance/Finance";
// import Helpdesk from "./modules/Helpdesk/Helpdesk";
// import Redeem from "./modules/Redeem/Redeem";
// import Profile from "./modules/Profile/Profile";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar /> {/* Navbar will be present on every page */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          {/* <Route path="/forum" element={<Forum />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
