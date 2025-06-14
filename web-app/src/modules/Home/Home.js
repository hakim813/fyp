import React from 'react';
import Navbar from '../../components/Navbar'; // Import Navbar component
import "./home.css"; // Import the CSS file for Home page

function Home() {
  return (
    <div className="home-container">
      <Navbar />  {/* Display Navbar */}
      <div className="main-content">
        {/* Features Section */}
        <section className="features">
          <h2>Features</h2>
          <div className="feature-boxes">
            <div className="feature-box forum">
              <h3>Forum</h3>
            </div>
            <div className="feature-box finance">
              <h3>Finance</h3>
            </div>
            <div className="feature-box helpdesk">
              <h3>Helpdesk</h3>
            </div>
            <div className="feature-box redeem">
              <h3>Redeem</h3>
            </div>
          </div>
        </section>

        {/* Learn Section */}
        <section className="learn">
          <h2>Learn</h2>
          <div className="cards">
            <div className="card">
              <img src="https://via.placeholder.com/300" alt="How to" />
              <h3>How to</h3>
              <p>This is just a sample text....</p>
              <a href="/">Read More</a>
            </div>
            <div className="card">
              <img src="https://via.placeholder.com/300" alt="How to" />
              <h3>How to</h3>
              <p>This is just a sample text....</p>
              <a href="/">Read More</a>
            </div>
            <div className="card">
              <img src="https://via.placeholder.com/300" alt="How to" />
              <h3>How to</h3>
              <p>This is just a sample text....</p>
              <a href="/">Read More</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
