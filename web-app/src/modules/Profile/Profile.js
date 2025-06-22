import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
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
  { name: "Personal", fields: ["fullName", "dob", "gender", "email", "phone", "address"] },
  { name: "Identification", fields: ["nricId", "icPhotos", "taxId", "workPermit"] },
  { name: "Professional", fields: ["workStatus", "workCategory", "experience", "languages", "platforms"] },
  { name: "Finance", fields: ["bank", "bankAccountNumber"] },
  { name: "Compliance", fields: ["insuranceCoverage", "socialSecurity", "licenses", "gdl", "gdlDocument"] }
];

export default function Profile() {
  const [userData, setUserData] = useState({});
  const [activeSection, setActiveSection] = useState(sections[0].name);
  const [modalImage, setModalImage] = useState(null);
  const [showGdlModal, setShowGdlModal] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData({ ...data, email: user.email, verified: data.verified || false });
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/landing"))
      .catch((err) => console.error("Logout error:", err));
  };

  const allFields = sections.flatMap(s => s.fields);
  if (userData.gdl === "Yes") allFields.push("gdlDocument");
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
    if (field === "icPhotos" && Array.isArray(value)) {
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
                style={{ width: 80, height: 50, objectFit: "cover", marginRight: 8, borderRadius: 4, cursor: "pointer" }}
                onClick={() => setModalImage(url)}
              />
            ))}
          </div>
        </div>
      );
    }
    if (field === "platforms" && Array.isArray(value)) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong>
          <ul>{value.map((p, idx) => <li key={idx}>{p.name} (ID: {p.id})</li>)}</ul>
        </div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong> {value.join(", ")}
        </div>
      );
    }
    if (field === "gdlDocument" && userData.gdl === "Yes" && value) {
      const isPdf = value.toLowerCase().includes(".pdf");
      return (
        <div className="detail-row" key={field}>
          <strong>{fieldLabels[field]}:</strong>{" "}
          {isPdf ? (
            <span
              style={{ color: "#0984e3", textDecoration: "underline", cursor: "pointer" }}
              onClick={() => window.open(value, "_blank")}
            >
              📄 Open GDL Document (PDF)
            </span>
          ) : (
            <img
              src={value}
              alt="GDL Document"
              style={{
                width: 100,
                cursor: "pointer",
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
              onClick={() => setModalImage(value)}
            />
          )}
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
              onClick={() => setModalImage(userData.profilePhoto || "/default-profile.png")}
            />
            <h2>
              {userData.fullName || "Unnamed User"}{" "}
              {userData.verified ? (
                <span style={{ color: "green", fontSize: "16px", marginLeft: "8px" }}>✅ Verified</span>
              ) : (
                <span style={{ color: "gray", fontSize: "14px", marginLeft: "8px" }}>⏳ Pending Verification</span>
              )}
            </h2>
            <p>{userData.email}</p>
            <Link to="/edit-profile"><button className="edit-btn">Edit Profile</button></Link>
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
                <div className="completion-bar"><div className="completion-fill" style={{ width: `${percent}%` }} /></div>
                <div className="completion-label">{percent}% Profile Completion</div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="profile-content">
              <h3>{activeSection} Information</h3>
              {sections.find((section) => section.name === activeSection).fields.map(renderField)}
            </div>
          </div>
        </div>
      </div>

      {modalImage && (
        <div className="profile-photo-modal-overlay" onClick={() => setModalImage(null)}>
          <div className="profile-photo-modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalImage} alt="Full Preview" className="profile-photo-full" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 10 }} />
            <button className="profile-photo-modal-close" onClick={() => setModalImage(null)}>&times;</button>
          </div>
        </div>
      )}

      {showGdlModal && userData.gdlDocument && (
        <div className="profile-photo-modal-overlay" onClick={() => setShowGdlModal(false)}>
          <div className="profile-photo-modal-content" onClick={e => e.stopPropagation()}>
            <iframe src={userData.gdlDocument} title="GDL Document" style={{ width: "70vw", height: "70vh", border: "none" }} />
            <button className="profile-photo-modal-close" onClick={() => setShowGdlModal(false)}>&times;</button>
          </div>
        </div>
      )}
    </>
  );
}
