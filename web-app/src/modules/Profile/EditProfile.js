import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getDatabase, ref as dbRef, get, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import '../../styles/editProfile.css';

const sections = {
  Personal: ["fullName", "dob", "phone", "email", "address"],
  Professional: ["workCategory", "industry", "skills", "experience", "availability", "languages"],
  Identification: ["nric", "taxId", "workPermit"],
  Platform: ["platforms", "platformType"],
  Banking: ["bank", "ewallet"],
  Compliance: ["insurance", "socialSecurity", "licenses"],
  Emergency: ["emergency"],
  Documents: ["profilePhoto", "verificationDocument"]
};

const fieldLabels = {
  fullName: "Full Name", dob: "Date of Birth", phone: "Phone", email: "Email", address: "Address",
  workCategory: "Work Category", industry: "Industry", skills: "Skills", experience: "Experience",
  availability: "Availability", languages: "Languages", nric: "NRIC", taxId: "Tax ID", workPermit: "Work Permit",
  platforms: "Gig Platforms Used", platformType: "Platform Type", bank: "Bank Account", ewallet: "E-Wallets",
  insurance: "Insurance Status", socialSecurity: "Social Security", licenses: "Licenses",
  emergency: "Emergency Contact", profilePhoto: "Profile Photo", verificationDocument: "Verification Document"
};

const EditProfile = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();

  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState('Personal');
  const [photoPreview, setPhotoPreview] = useState(null);

  // ✅ Load data from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = dbRef(db, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setFormData(userData);
        if (userData.profilePhoto) setPhotoPreview(userData.profilePhoto);
      }
    }).catch((error) => {
      console.error("Error loading profile data:", error);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (name === "profilePhoto" && files) {
      setPhotoPreview(URL.createObjectURL(files[0]));
    }
  };

  const getSectionCompletion = (section) => {
    return sections[section].every(field => formData[field] && formData[field] !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = dbRef(db, `users/${user.uid}`);
    const updatedData = { ...formData };

    // Upload profile photo
    if (formData.profilePhoto instanceof File) {
      const photoRef = storageRef(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(photoRef, formData.profilePhoto);
      const photoURL = await getDownloadURL(photoRef);
      updatedData.profilePhoto = photoURL;
    }

    // Upload verification document
    if (formData.verificationDocument instanceof File) {
      const docRef = storageRef(storage, `documents/${user.uid}`);
      await uploadBytes(docRef, formData.verificationDocument);
      const docURL = await getDownloadURL(docRef);
      updatedData.verificationDocument = docURL;
    }

    await update(userRef, updatedData);
    navigate('/profile');
  };

  return (
    <div className="edit-container">
      <div className="sidebar">
        <h2>WeGig</h2>
        {Object.keys(sections).map((sec) => (
          <div
            key={sec}
            className={`sidebar-item ${currentSection === sec ? 'active' : ''}`}
            onClick={() => setCurrentSection(sec)}
          >
            {sec}
            {getSectionCompletion(sec) && <span className="tick">✔</span>}
          </div>
        ))}
      </div>

      <div className="edit-form">
        <h2>{currentSection} Information</h2>
        <form onSubmit={handleSubmit}>
          {sections[currentSection].map((field) => (
            <div key={field} className="input-group">
              <label>{fieldLabels[field]}</label>
              {field === "profilePhoto" ? (
                <>
                  <input type="file" name={field} onChange={handleChange} />
                  {photoPreview && <img className="preview-img" src={photoPreview} alt="Preview" />}
                </>
              ) : field.includes("Document") ? (
                <input type="file" name={field} onChange={handleChange} />
              ) : (
                <input
                  type={field === "dob" ? "date" : "text"}
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/profile')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
