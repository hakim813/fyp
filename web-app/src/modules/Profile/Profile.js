import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import './profile.css';
import Navbar from '../../components/Navbar';

const fieldLabels = {
  fullName: "Full Name",
  dob: "Date of Birth",
  email: "Email",
  phone: "Phone Number",
  address: "Address",
  nricId: "NRIC",
  icPhotos: "IC Card Upload",
  taxId: "Tax ID",
  workPermit: "Work Permit",
  workStatus: "Work Status",
  workCategory: "Work Category",
  experience: "Years of Experience",
  languages: "Languages",
  bank: "Bank",
  bankAccountNumber: "Bank Account Number",
  insuranceCoverage: "Insurance Coverage",
  socialSecurity: "Social Security",
  licenses: "Licenses",
};

const sections = [
  {
    name: "Personal",
    fields: ["fullName", "dob", "email", "phone", "address"]
  },
  {
    name: "Identification",
    fields: ["nricId", "icPhotos", "taxId", "workPermit"]
  },
  {
    name: "Professional",
    fields: ["workStatus", "workCategory", "experience", "languages"]
  },
  {
    name: "Finance",
    fields: ["bank", "bankAccountNumber"]
  },
  {
    name: "Compliance",
    fields: ["insuranceCoverage", "socialSecurity", "licenses"]
  }
];

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [activeSection, setActiveSection] = useState(sections[0].name);

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

  // Profile completion calculation
  const allFields = sections.flatMap(s => s.fields);
  const filledCount = allFields.filter(f => {
    const v = userData[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && v !== "";
  }).length;
  const percent = Math.round((filledCount / allFields.length) * 100);

  const renderField = (field) => {
    const value = userData[field];
    if (field === "profilePhoto") {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong>
          <br />
          <img
            src={value || "/default-profile.png"}
            alt="Profile"
            className="profile-avatar"
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      );
    }
    if (field === "icPhotos" && Array.isArray(value) && value.length > 0) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong>
          <div className="ic-photo-list">
            {value.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`IC Photo ${idx + 1}`}
                className="ic-photo"
                style={{ width: 80, height: 50, objectFit: "cover", marginRight: 8, borderRadius: 4 }}
              />
            ))}
          </div>
        </div>
      );
    }
    if (field === "languages" && Array.isArray(value)) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong> {value.length > 0 ? value.join(", ") : "Not provided"}
        </div>
      );
    }
    return (
      <div className="detail-row" key={field}>
        <strong>{fieldLabels[field]}:</strong> {value || "Not provided"}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-wrapper">
          <div className="profile-header">
            <img
              src={userData.profilePhoto || "/default-profile.png"}
              alt="Profile"
              className="profile-avatar"
            />
            <h2>{userData.fullName || "Unnamed User"}</h2>
            <p>{userData.email}</p>
            <Link to="/edit-profile">
              <button className="edit-btn">Edit Profile</button>
            </Link>
          </div>
          <div className="profile-body">
            <div className="profile-sidebar">
              {sections.map((section) => (
                <button
                  key={section.name}
                  className={`tab-btn ${activeSection === section.name ? "active" : ""}`}
                  onClick={() => setActiveSection(section.name)}
                >
                  {section.name}
                </button>
              ))}
              <div className="completion-wrapper">
            <div className="completion-bar">
              <div className="completion-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="completion-label">{percent}% Profile Completion</div>
          </div>
            </div>
            <div className="profile-content">
              <h3>{activeSection} Information</h3>
              {sections
                .find((section) => section.name === activeSection)
                .fields.map(renderField)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;