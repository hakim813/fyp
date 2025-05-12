import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../../utils/UserContext";
import "../../styles/profile.css";
import Navbar from '../../components/Navbar';


const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John",
    nric: "123456-12-1234",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    gender: "Male",
    birthDate: "01/01/1990",
    photo: null,  // Added photo state
  });
  const [isProfileVerified, setIsProfileVerified] = useState(false);
  const [progress, setProgress] = useState(50); // Placeholder for progress bar
  const navigate = useNavigate();

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    setIsProfileVerified(true); // For now, we will mark it as verified after save.
    setProgress(100); // Set progress to 100% when profile is verified
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  // Handle Profile Photo Upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, photo: URL.createObjectURL(file) }); // Preview the uploaded photo
    }
  };

  return (
    <div className="profile-container">
      {/* Navbar Component */}
      <Navbar />

      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={() => navigate("/profile")} className="sidebar-button">View Profile</button>
        <button onClick={() => navigate("/profile/upload")} className="sidebar-button">Upload Documents</button>
        <button onClick={() => navigate("/profile/verify")} className="sidebar-button">Verify Details</button>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="profile-main">
        <div className="profile-header">
          <h2>Personal Information</h2>
        </div>

        {/* Profile Form */}
        <form>
          <div className="profile-photo">
            {/* Profile Photo Section */}
            <label htmlFor="profilePhoto">
              <img 
                src={profileData.photo || "/path/to/default-photo.png"} 
                alt="Profile"
                className="profile-photo-circle"
              />
              <input 
                type="file" 
                id="profilePhoto" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                style={{ display: "none" }} 
                disabled={!editMode} 
              />
            </label>
          </div>

          <div className="profile-field">
            <label>Name:</label>
            <input 
              type="text" 
              value={profileData.name} 
              disabled={!editMode} 
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
            />
          </div>

          <div className="profile-field">
            <label>NRIC:</label>
            <input 
              type="text" 
              value={profileData.nric} 
              disabled={!editMode} 
              onChange={(e) => setProfileData({ ...profileData, nric: e.target.value })} 
            />
          </div>

          <div className="profile-field">
            <label>Email:</label>
            <input 
              type="email" 
              value={profileData.email} 
              disabled={!editMode} 
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
            />
          </div>

          <div className="profile-field">
            <label>Phone Number:</label>
            <input 
              type="text" 
              value={profileData.phone} 
              disabled={!editMode} 
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
            />
          </div>

          <div className="profile-field">
            <label>Gender:</label>
            <select 
              value={profileData.gender} 
              disabled={!editMode} 
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="profile-field">
            <label>Date of Birth:</label>
            <input 
              type="text" 
              value={profileData.birthDate} 
              disabled={!editMode} 
              onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })} 
            />
          </div>

          {/* Edit / Save / Cancel Buttons */}
          {editMode ? (
            <>
              <button type="button" onClick={handleSaveProfile} className="save-button">Save</button>
              <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
            </>
          ) : (
            <button type="button" onClick={handleEditProfile} className="edit-button">Edit Profile</button>
          )}
        </form>

        {/* Profile Status */}
        <div className="profile-status">
          <h3>{isProfileVerified ? "Profile Verified" : "Profile Not Verified"}</h3>
        </div>
      </div>
    </div>
  );
};

export default Profile;