import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import './profile.css';
import Navbar from '../../components/Navbar';

const fieldLabels = {
  fullName: "Full Name",
  dob: "Date of Birth",
  gender: "Gender",
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
  languages: "Spoken Language(s)",
  platforms: "Platform(s) Worked For",
  bank: "Bank",
  bankAccountNumber: "Bank Account Number",
  insuranceCoverage: "Insurance Coverage",
  socialSecurity: "Social Security",
  licenses: "Licenses",
  gdl: "Goods Driving License (GDL)",
  gdlDocument: "GDL Document",
};

const sections = [
  {
    name: "Personal",
    fields: ["fullName", "dob", "gender", "email", "phone", "address"]
  },
  {
    name: "Identification",
    fields: ["nricId", "icPhotos", "taxId", "workPermit"]
  },
  {
    name: "Professional",
    fields: ["workStatus", "workCategory", "experience", "languages", "platforms"]
  },
  {
    name: "Finance",
    fields: ["bank", "bankAccountNumber"]
  },
  {
    name: "Compliance",
    fields: ["insuranceCoverage", "socialSecurity", "licenses", "gdl"]
  }
];

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [activeSection, setActiveSection] = useState(sections[0].name);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showGdlModal, setShowGdlModal] = useState(false);

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
    if (userData.gdl === "Yes") {
    allFields.push("gdlDocument");
  }
  const filledCount = allFields.filter(f => {
    const v = userData[f];
    if (f === "platforms") return Array.isArray(v) && v.length > 0 && v.every(p => p.name && p.id);
    if (["languages", "insuranceCoverage", "licenses", "icPhotos"].includes(f)) return Array.isArray(v) && v.length > 0;
    if (f === "gdl") return v === "Yes" || v === "No";
    if (f === "gdlDocument") return !!v;
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
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%", cursor: "pointer" }}
            onClick={() => setShowPhotoModal(true)}
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
    if (field === "platforms" && Array.isArray(value) && value.length > 0) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
            {value.map((p, idx) => (
              <li key={idx}>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                {p.id ? <> (ID: {p.id})</> : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (field === "insuranceCoverage" && Array.isArray(value)) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong> {value.length > 0 ? value.join(", ") : "Not provided"}
        </div>
      );
    }
    if (field === "licenses" && Array.isArray(value)) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong> {value.length > 0 ? value.join(", ") : "Not provided"}
        </div>
      );
    }
    if (field === "gdl") {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong> {value || "Not provided"}
        </div>
      );
    }
    if (field === "gdlDocument" && userData.gdl === "Yes" && value) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong>{" "}
          <span
            className="gdl-doc-link"
            style={{ color: "#0984e3", textDecoration: "underline", cursor: "pointer" }}
            onClick={() => setShowGdlModal(true)}
          >
            View GDL Document
          </span>
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
              style={{ cursor: "pointer" }}
              onClick={() => setShowPhotoModal(true)}
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
              {/* Show GDL Document if GDL is Yes and document exists */}
              {activeSection === "Compliance" && userData.gdl === "Yes" && userData.gdlDocument && (
                <div className="detail-row">
                  <strong>{fieldLabels.gdlDocument}:</strong>{" "}
                  <span
                    className="gdl-doc-link"
                    style={{ color: "#0984e3", textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => setShowGdlModal(true)}
                  >
                    View GDL Document
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showPhotoModal && (
        <div className="profile-photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="profile-photo-modal-content" onClick={e => e.stopPropagation()}>
            <img
              src={userData.profilePhoto || "/default-profile.png"}
              alt="Profile Full"
              className="profile-photo-full"
            />
            <button className="profile-photo-modal-close" onClick={() => setShowPhotoModal(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
      {showGdlModal && userData.gdlDocument && (
        <div className="profile-photo-modal-overlay" onClick={() => setShowGdlModal(false)}>
          <div className="profile-photo-modal-content" onClick={e => e.stopPropagation()}>
            {
              userData.gdlDocument.endsWith(".pdf") ? (
                <iframe
                  src={userData.gdlDocument}
                  title="GDL Document"
                  style={{ width: "70vw", height: "70vh", border: "none" }}
                />
              ) : (
                <img
                  src={userData.gdlDocument}
                  alt="GDL Document"
                  className="profile-photo-full"
                />
              )
            }
            <button className="profile-photo-modal-close" onClick={() => setShowGdlModal(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;