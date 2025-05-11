import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/profile.css";
import Navbar from '../../components/Navbar';

function Profile() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("viewProfile");

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="profile-container">
        <Navbar />
      {/* Sidebar */}
      <div className="sidebar">
        <button 
          onClick={() => handlePageChange("viewProfile")} 
          className="sidebar-button">
          View Profile
        </button>
        <button 
          onClick={() => handlePageChange("uploadDocuments")} 
          className="sidebar-button">
          Upload Documents
        </button>
        <button 
          onClick={() => handlePageChange("verifyDetails")} 
          className="sidebar-button">
          Verify Details
        </button>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* View Profile Content */}
        {currentPage === "viewProfile" && (
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-form">
              <div className="profile-field">
                <label>Name</label>
                <input type="text" placeholder="Enter your first name" />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" />
              </div>
              <div className="profile-field">
                <label>Phone Number</label>
                <input type="text" placeholder="Enter your phone number" />
              </div>
              <div className="profile-field">
                <label>Gender</label>
                <select>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
            <button className="edit-profile-button">Edit Profile</button>
          </div>
        )}

        {/* Upload Documents Content */}
        {currentPage === "uploadDocuments" && (
          <div className="profile-section">
            <h2>Upload Documents</h2>
            <input type="file" className="file-upload-input" />
            <textarea 
              placeholder="Add notes about the given document"
              className="file-upload-textarea"
            ></textarea>
            <button className="file-upload-button">Confirm</button>
          </div>
        )}

        {/* Verify Details Content */}
        {currentPage === "verifyDetails" && (
          <div className="profile-section">
            <h2>Verify Profile Details</h2>
            <div>
              <p className="verification-message">Profile Not Verified</p>
              <button className="verify-profile-button">Verify Profile</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
