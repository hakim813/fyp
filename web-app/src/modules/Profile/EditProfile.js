import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getDatabase, ref as dbRef, get, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import "./editProfile.css";

const BANKS = [
  "AEON Bank", "Affin Bank", "Al-Rajhi Banking & Investment Corp", "Alliance Bank Malaysia", "AmBank Berhad", "Bank Islam Malaysia", "Bank Kerjasama Rakyat Malaysia", "Bank Muamalat", "Bank of America", "Bank of China", "Bank Pertanian Malaysia (AGROBANK)", "Bank Simpanan Nasional", "BNP Paribas Malaysia", "Bangkok Bank", "BigPay Malaysia", "Boost Bank", "Boost eWallet", "China Construction Bank", "CIMB Bank", "Citibank Berhad", "Co-opbank Pertama", "Deutsche Bank", "Finexus Cards", "GXBank", "Hong Leong", "HSBC Bank", "Industrial & Commercial Bank of China", "JP Morgan Chase Bank", "KAF Digital Bank", "Kuwait Finance House", "MBSB Bank", "Mizuho Bank", "MUFG Bank", "Merchantrade", "OCBC Bank", "Public Bank", "RHB Bank", "Ryt Bank", "Standard Chartered Bank", "Sumitomo Mitsui Banking", "United Overseas Bank"
];

const LANGUAGES = ["English", "Malay", "Chinese", "Indian", "others"];

const sections = [
  "Personal",
  "Identification",
  "Professional",
  "Finance",
  "Compliance",
];

const initialForm = {
  // Personal
  fullName: "",
  dob: "",
  email: "",
  phone: "",
  address: "",
  profilePhoto: "",
  // Identification
  nricId: "",
  icPhotos: [],
  taxId: "",
  workPermit: "",
  // Professional
  workStatus: "",
  workCategory: "",
  experience: "",
  languages: [],
  // Finance
  bank: "",
  bankAccountNumber: "",
  // Compliance
  insuranceCoverage: "",
  socialSecurity: "",
  licenses: "",
};

const fieldLabels = {
  fullName: "Full Name",
  dob: "Date of Birth",
  email: "Email",
  phone: "Phone Number",
  address: "Address",
  profilePhoto: "Profile Photo",
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
};

function isFieldFilled(field, data) {
  const v = data[field];
  if (field === "nricId") return /^[A-Za-z0-9]{12}$/.test(v);
  if (field === "icPhotos") return Array.isArray(v) && v.length > 0;
  if (field === "profilePhoto") return !!v;
  if (field === "email") return !!v && /\S+@\S+\.\S+/.test(v);
  if (field === "bankAccountNumber" || field === "taxId" || field === "workPermit") return /^\d+$/.test(v);
  if (field === "languages") return Array.isArray(v) && v.length > 0;
  return v !== undefined && v !== null && v !== "";
}

export default function EditProfile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();

  const [formData, setFormData] = useState(initialForm);
  const [previews, setPreviews] = useState({
    profilePhoto: null,
    icPhotos: [],
  });
  const [currentSection, setCurrentSection] = useState("Personal");
  const [errors, setErrors] = useState({});
  const [showImage, setShowImage] = useState(null);

  // Load existing data
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return navigate("/login");
    get(dbRef(db, `users/${u.uid}`))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setFormData((prev) => ({
            ...prev,
            ...data,
            icPhotos: data.icPhotos || [],
            languages: data.languages || [],
          }));
          setPreviews({
            profilePhoto: data.profilePhoto || null,
            icPhotos: data.icPhotos || [],
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            email: u.email || "",
            nricId: "",
          }));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line
  }, []);

  // Section fields for ticks
  const sectionFields = {
    Personal: ["fullName", "dob", "email", "phone", "address", "profilePhoto"],
    Identification: ["nricId", "icPhotos", "taxId", "workPermit"],
    Professional: ["workStatus", "workCategory", "experience", "languages"],
    Finance: ["bank", "bankAccountNumber"],
    Compliance: ["insuranceCoverage", "socialSecurity", "licenses"],
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "profilePhoto") {
        const file = files[0];
        setFormData((p) => ({ ...p, profilePhoto: file }));
        setPreviews((pv) => ({ ...pv, profilePhoto: URL.createObjectURL(file) }));
      } else if (name === "icPhotos") {
        // Merge new files with existing, max 2
        let existing = formData.icPhotos || [];
        // Remove any File objects from existing if user re-selects
        existing = existing.filter(f => typeof f === "string");
        let arr = Array.from(files);
        let merged = [...existing, ...arr].slice(0, 2);
        setFormData((p) => ({ ...p, icPhotos: merged }));
        setPreviews((pv) => ({
          ...pv,
          icPhotos: merged.map(f =>
            typeof f === "string" ? f : URL.createObjectURL(f)
          ),
        }));
      }
    } else {
      if (name === "phone") {
        // Only allow numbers, max 10 digits
        const digits = value.replace(/\D/g, "").slice(0, 10);
        setFormData((p) => ({ ...p, phone: digits }));
      } else {
        setFormData((p) => ({ ...p, [name]: value }));
      }
    }
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  // For Languages: use checkboxes
  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let langs = prev.languages || [];
      if (checked) {
        langs = [...langs, value];
      } else {
        langs = langs.filter((l) => l !== value);
      }
      return { ...prev, languages: langs };
    });
    setErrors((err) => ({ ...err, languages: undefined }));
  };

  // Only validate format if field is filled, not required
  const validate = () => {
    let err = {};
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) err.email = "Invalid email";
    if (formData.nricId && !/^[A-Za-z0-9]{12}$/.test(formData.nricId)) err.nricId = "NRIC must be 12 alphanumeric characters";
    if (formData.icPhotos && formData.icPhotos.length > 2) err.icPhotos = "Maximum 2 files";
    if (formData.bankAccountNumber && !/^\d+$/.test(formData.bankAccountNumber)) err.bankAccountNumber = "Digits only";
    if (formData.taxId && !/^\d+$/.test(formData.taxId)) err.taxId = "Digits only";
    if (formData.workPermit && !/^\d+$/.test(formData.workPermit)) err.workPermit = "Digits only";
    // Phone: must be exactly 10 digits
    if (!/^\d{10}$/.test(formData.phone)) err.phone = "Phone must be exactly 10 digits";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = auth.currentUser;
    let err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const updated = { ...formData };

    // Upload profile photo
    if (formData.profilePhoto instanceof File) {
      const r = storageRef(storage, `profilePhotos/${u.uid}`);
      await uploadBytes(r, formData.profilePhoto);
      updated.profilePhoto = await getDownloadURL(r);
    }

    // Upload IC Photos
    if (Array.isArray(formData.icPhotos)) {
      const urls = [];
      for (let f of formData.icPhotos) {
        if (f instanceof File) {
          const r2 = storageRef(storage, `icPhotos/${u.uid}_${f.name}`);
          await uploadBytes(r2, f);
          urls.push(await getDownloadURL(r2));
        } else {
          urls.push(f);
        }
      }
      updated.icPhotos = urls;
    }

    await update(dbRef(db, `users/${u.uid}`), updated);
    navigate("/profile");
  };

  // For file/image preview modal
  const handleFileClick = (src) => setShowImage(src);
  const closeModal = () => setShowImage(null);

  // Section renderers
  const renderSection = () => {
    switch (currentSection) {
      case "Personal":
        return (
          <>
            <div className="input-group">
              <label>{fieldLabels.fullName}</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
              {errors.fullName && <div className="error">{errors.fullName}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.dob}</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
              {errors.dob && <div className="error">{errors.dob}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.email}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled />
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.phone}</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                pattern="\d*"
                placeholder="e.g. 0123456789"
              />
              {errors.phone && <div className="error">{errors.phone}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.address}</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>{fieldLabels.profilePhoto}</label>
              <input type="file" name="profilePhoto" accept="image/*" onChange={handleChange} />
              {previews.profilePhoto && (
                <img className="preview-img" src={previews.profilePhoto} alt="Profile Preview" onClick={() => handleFileClick(previews.profilePhoto)} />
              )}
            </div>
          </>
        );
      case "Identification":
        return (
          <>
            <div className="input-group">
              <label>{fieldLabels.nricId}</label>
              <input type="text" name="nricId" value={formData.nricId} onChange={handleChange} maxLength={12} />
              {errors.nricId && <div className="error">{errors.nricId}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.icPhotos}</label>
              <input type="file" name="icPhotos" accept="image/*" multiple onChange={handleChange} />
              <ul className="file-list">
                {(previews.icPhotos || []).map((src, i) => (
                  <li key={i} onClick={() => handleFileClick(src)}>IC Photo {i + 1}</li>
                ))}
              </ul>
              {errors.icPhotos && <div className="error">{errors.icPhotos}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.taxId}</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} />
              {errors.taxId && <div className="error">{errors.taxId}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.workPermit}</label>
              <input type="text" name="workPermit" value={formData.workPermit} onChange={handleChange} />
              {errors.workPermit && <div className="error">{errors.workPermit}</div>}
            </div>
          </>
        );
      case "Professional":
        return (
          <>
            <div className="input-group">
              <label>{fieldLabels.workStatus}</label>
              <select name="workStatus" value={formData.workStatus} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
            <div className="input-group">
              <label>{fieldLabels.workCategory}</label>
              <select name="workCategory" value={formData.workCategory} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Food Delivery">Food Delivery</option>
                <option value="Parcel Delivery">Parcel Delivery</option>
                <option value="Ride-hailing">Ride-hailing</option>
                <option value="Freelancing">Freelancing</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="input-group">
              <label>{fieldLabels.experience}</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} min={0} />
            </div>
            <div className="input-group">
              <label>{fieldLabels.languages}</label>
              <div className="checkbox-group">
                {LANGUAGES.map((lang) => (
                  <label key={lang} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="languages"
                      value={lang}
                      checked={formData.languages.includes(lang)}
                      onChange={handleLanguageChange}
                    />
                    {lang}
                  </label>
                ))}
              </div>
              {errors.languages && <div className="error">{errors.languages}</div>}
            </div>
          </>
        );
      case "Finance":
        return (
          <>
            <div className="input-group">
              <label>{fieldLabels.bank}</label>
              <select name="bank" value={formData.bank} onChange={handleChange}>
                <option value="">Select</option>
                {BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>{fieldLabels.bankAccountNumber}</label>
              <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} />
              {errors.bankAccountNumber && <div className="error">{errors.bankAccountNumber}</div>}
            </div>
          </>
        );
      case "Compliance":
        return (
          <>
            <div className="input-group">
              <label>{fieldLabels.insuranceCoverage}</label>
              <select name="insuranceCoverage" value={formData.insuranceCoverage} onChange={handleChange}>
                <option value="">Select</option>
                <option value="None">None</option>
                <option value="Health">Health</option>
                <option value="Accident">Accident</option>
                <option value="Vehicle">Vehicle</option>
              </select>
            </div>
            <div className="input-group">
              <label>{fieldLabels.socialSecurity}</label>
              <select name="socialSecurity" value={formData.socialSecurity} onChange={handleChange}>
                <option value="">Select</option>
                <option value="None">None</option>
                <option value="KWSP">KWSP</option>
                <option value="PERKESO">PERKESO</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="input-group">
              <label>{fieldLabels.licenses}</label>
              <select name="licenses" value={formData.licenses} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Heavy-weight Vehicle">Heavy-weight Vehicle</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="edit-container">
      <div className="sidebar">
        <h2>WeGig</h2>
        {sections.map((sec) => (
          <div
            key={sec}
            className={`sidebar-item ${currentSection === sec ? "active" : ""}`}
            onClick={() => setCurrentSection(sec)}
          >
            {sec}
            {sectionFields[sec].every((f) => isFieldFilled(f, formData)) && (
              <span className="tick">✔</span>
            )}
          </div>
        ))}
      </div>
      <div className="edit-form">
        <h2>{currentSection} Information</h2>
        <form onSubmit={handleSubmit}>
          {renderSection()}
          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/profile")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {showImage && (
        <div className="modal" onClick={closeModal}>
          <img src={showImage} alt="Preview" className="modal-img" />
        </div>
      )}
    </div>
  );
}