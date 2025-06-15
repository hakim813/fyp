import React from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-green-bg">
      <div className="landing-box">
        <h1 className="landing-title">
          Welcome to <span className="brand"><span className="we">We</span><span className="gig">Gig</span></span>
        </h1>
        <p className="landing-subtitle">Connecting gig workers with opportunities.</p>
        <div className="landing-actions">
          <button className="btn primary" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="btn outline" onClick={() => navigate("/login")}>Log In</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;