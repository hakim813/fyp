import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getDatabase, ref as dbRef, get, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import '../../styles/editProfile.css';

const sections = {
  Personal: ["fullName", "dob", "phone", "email", "address"],
  Identification: ["nricId", "icPhotos", "taxId", "workPermit"],
  Professional: ["workStatus", "workCategory", "experience", "languages"],
  Finance: ["bank", "bankAccountNumber"], 
  Compliance: ["insuranceCoverage", "socialSecurity", "licenses"],
  Emergency: ["emergencyContact"],
  Documents: ["profilePhoto", "verificationDocuments"]
};

const fieldLabels = {
  fullName: "Full Name",
  dob: "Date of Birth",
  phone: "Phone",
  email: "Email",
  address: "Address",
  nricId: "NRIC",
  icPhotos: "IC Card Upload (max 2)",
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
  emergencyContact: "Emergency Contact",
  profilePhoto: "Profile Photo",
  verificationDocuments: "Other Documents"
};

// helper to check if a field is complete
function isFieldFilled(field, data) {
  const v = data[field];
  if (field === "nricId") return /^[A-Za-z0-9]{12}$/.test(v);
  if (field === "icPhotos" || field === "verificationDocuments") return Array.isArray(v) && v.length > 0;
  if (field === "profilePhoto") return !!v;
  return v !== undefined && v !== null && v !== "";
}

export default function EditProfile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();

  const [formData, setFormData] = useState({});
  const [previews, setPreviews] = useState({ profilePhoto: null, icPhotos: [], verificationDocuments: [] });
  const [currentSection, setCurrentSection] = useState("Personal");

  // load existing data
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return navigate("/login");
    get(dbRef(db, `users/${u.uid}`))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.val();
          setFormData(data);
          setPreviews({
            profilePhoto: data.profilePhoto || null,
            icPhotos: data.icPhotos || [],
            verificationDocuments: data.verificationDocuments || []
          });
        }
      })
      .catch(console.error);
  }, [auth, db, navigate]);

  // compute overall completion
  const allFields = Object.values(sections).flat();
  const filledCount = allFields.filter(f => isFieldFilled(f, formData)).length;
  const completion = Math.round((filledCount / allFields.length) * 100);

  const handleChange = e => {
    const { name, files, value } = e.target;
    if (files) {
      if (e.target.multiple) {
        const arr = Array.from(files);
        setFormData(p => ({ ...p, [name]: arr }));
        setPreviews(pv => ({ ...pv, [name]: arr.map(f => URL.createObjectURL(f)) }));
      } else {
        setFormData(p => ({ ...p, [name]: files[0] }));
        if (name === "profilePhoto") setPreviews(pv => ({ ...pv, profilePhoto: URL.createObjectURL(files[0]) }));
      }
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const u = auth.currentUser;
    const updated = { ...formData };

    // upload single file
    if (formData.profilePhoto instanceof File) {
      const r = storageRef(storage, `profilePhotos/${u.uid}`);
      await uploadBytes(r, formData.profilePhoto);
      updated.profilePhoto = await getDownloadURL(r);
    }
    // upload arrays
    const uploadArray = async (field, path) => {
      const arr = formData[field];
      if (!Array.isArray(arr)) return;
      const urls = [];
      for (let f of arr) {
        if (f instanceof File) {
          const r2 = storageRef(storage, `${path}/${u.uid}_${f.name}`);
          await uploadBytes(r2, f);
          urls.push(await getDownloadURL(r2));
        } else {
          urls.push(f);
        }
      }
      updated[field] = urls;
    };
    await uploadArray("icPhotos", "icPhotos");
    await uploadArray("verificationDocuments", "documents");

    await update(dbRef(db, `users/${u.uid}`), updated);
    navigate("/profile");
  };

  return (
    <div className="edit-container">
      <div className="sidebar">
        <h2>WeGig</h2>
        {Object.keys(sections).map(sec => (
          <div
            key={sec}
            className={`sidebar-item ${currentSection === sec ? "active" : ""}`}
            onClick={() => setCurrentSection(sec)}
          >
            {sec}
            {sections[sec].every(f => isFieldFilled(f, formData)) && <span className="tick">✔</span>}
          </div>
        ))}
      </div>

      <div className="edit-form">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completion}%` }}>
            {completion}%
          </div>
        </div>

        <h2>{currentSection} Information</h2>
        <form onSubmit={handleSubmit}>
          {sections[currentSection].map(field => (
            <div key={field} className="input-group">
              <label>{fieldLabels[field]}</label>
              {field === "profilePhoto" ? ( //part nak specifykan input type
                <>
                  <input type="file" name="profilePhoto" onChange={handleChange} />
                  {previews.profilePhoto && <img className="preview-img" src={previews.profilePhoto} alt="" />}
                </>
              ) : field === "icPhotos" ? (
                <>
                  <input type="file" name="icPhotos" multiple accept="image/*" onChange={handleChange} />
                  <ul className="file-list">
                    {previews.icPhotos.map((src,i) => (
                      <li key={i} onClick={()=>window.open(src)}>IC Photo {i+1}</li>
                    ))}
                  </ul>
                </>
              ) : field === "verificationDocuments" ? (
                <>
                  <input type="file" name="verificationDocuments" multiple onChange={handleChange} />
                  <ul className="file-list">
                    {previews.verificationDocuments.map((src,i) => (
                      <li key={i} onClick={()=>window.open(src)}>Doc {i+1}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <input
                  type={field==="dob"?"date":"text"}
                  name={field}
                  value={formData[field]||""}
                  onChange={handleChange}
                />
              )}
              {field==="nricId" && formData.nricId && !/^[A-Za-z0-9]{12}$/.test(formData.nricId) && (
                <div className="error">NRIC must be 12 alphanumeric characters</div>
              )}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={()=>navigate('/profile')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
