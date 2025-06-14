import React from "react";
import { NavLink, useLocation } from "react-router-dom"; // Import useLocation
import "./navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/" className="navbar-logo-link">
          <span className="navbar-logo-we">We</span>
          <span className="navbar-logo-gig">Gig</span>
        </NavLink>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/forum"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Forum
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/finance"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Finance
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/helpdesk"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Helpdesk
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/redeem"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Redeem
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile"
            // Check isActive OR location.pathname === '/edit-profile'
            className={({ isActive }) =>
              isActive || location.pathname === "/edit-profile" ? "active" : ""
            }
          >
            Profile
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
