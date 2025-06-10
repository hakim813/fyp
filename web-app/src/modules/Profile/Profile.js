import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import '../../styles/profile.css';
import Navbar from '../../components/Navbar';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [activeSection, setActiveSection] = useState("Personal Information");

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData({ ...data, email: user.email });
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [user]);

  const getProfileCompletion = () => {
    const requiredFields = [
      userData.fullName, userData.dob, userData.phone, userData.email, userData.address,
      userData.workCategory, userData.industry, userData.skills, userData.experience, userData.availability,
      userData.languages, userData.nric, userData.taxId, userData.workPermit, userData.platforms,
      userData.platformType, userData.bankAccount, userData.eWallets, userData.insurance,
      userData.socialSecurity, userData.licenses, userData.emergencyContact
    ];
    const filled = requiredFields.filter(val => val && val !== "").length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  const completion = getProfileCompletion();

  const sections = {
    "Personal Information": [
      ["Full Name", userData.fullName],
      ["Date of Birth", userData.dob],
      ["Phone Number", userData.phone],
      ["Email", userData.email],
      ["Address", userData.address],
    ],
    "Professional Details": [
      ["Work Category", userData.workCategory],
      ["Industry", userData.industry],
      ["Skills", userData.skills],
      ["Experience", userData.experience],
      ["Availability", userData.availability],
      ["Languages", userData.languages],
    ],
    "Identification": [
      ["National ID", userData.nric],
      ["Tax ID", userData.taxId],
      ["Work Permit", userData.workPermit],
    ],
    "Platform Details": [
      ["Gig Platforms Used", userData.platforms],
      ["Platform Type", userData.platformType],
    ],
    "Banking & Payments": [
      ["Bank Account Details", userData.bankAccount],
      ["E-Wallets", userData.eWallets],
    ],
    "Regulatory Compliance": [
      ["Insurance Status", userData.insurance],
      ["Social Security", userData.socialSecurity],
      ["Licenses", userData.licenses],
    ],
    "Emergency Contact": [
      ["Emergency Contact", userData.emergencyContact],
    ]
  };

  const renderField = (label, value) => (
    <div className="detail-row" key={label}>
      <strong>{label}:</strong> {value || "Not provided"}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="profile-wrapper">
        <div className="profile-header">
          <img
            src={userData.profilePhoto || "/default-profile.png"}
            alt="Profile"
            className="profile-avatar"
          />
          <h2>{userData.fullName || "Unnamed User"}</h2>
          <p>{userData.email}</p>

          <div className="completion-wrapper">
            <div className="completion-bar">
              <div className="completion-fill" style={{ width: `${completion}%` }}></div>
            </div>
            <p className="completion-label">{completion}% Profile Completed</p>
          </div>

          <Link to="/edit-profile">
            <button className="edit-btn">Edit Profile</button>
          </Link>
        </div>

        <div className="profile-body">
          <div className="profile-sidebar">
            {Object.keys(sections).map((section) => (
              <button
                key={section}
                className={`tab-btn ${activeSection === section ? "active" : ""}`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </div>

          <div className="profile-content">
            <h3>{activeSection}</h3>
            {sections[activeSection].map(([label, value]) =>
              renderField(label, value)
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
