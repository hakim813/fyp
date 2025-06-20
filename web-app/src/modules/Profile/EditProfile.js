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
const INSURANCE_OPTIONS = ["Health", "Accident", "Vehicle"];
const LICENSES_OPTIONS = ["Car", "Motorcycle", "Heavy-weight Vehicle"];

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
  gender: "", // NEW FIELD
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
  platforms: [],
  // Finance
  bank: "",
  bankAccountNumber: "",
  // Compliance
  insuranceCoverage: [],
  socialSecurity: "",
  licenses: [],
  gdl: "", // NEW FIELD
  gdlDocument: null, // NEW FIELD
};

const fieldLabels = {
  fullName: "Full Name",
  dob: "Date of Birth",
  gender: "Gender",
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
  languages: "Spoken Language(s)",
  platforms: "Platform(s) Worked For",
  bank: "Bank",
  bankAccountNumber: "Bank Account Number",
  insuranceCoverage: "Insurance Coverage",
  socialSecurity: "Social Security",
  licenses: "Licenses",
  gdl: "Goods Driving License (GDL)",
  gdlDocument: "Upload GDL Document",
};

function isFieldFilled(field, data) {
  const v = data[field];
  if (field === "nricId") return /^[A-Za-z0-9]{12}$/.test(v);
  if (field === "icPhotos") return Array.isArray(v) && v.length > 0;
  if (field === "profilePhoto") return !!v;
  if (field === "email") return !!v && /\S+@\S+\.\S+/.test(v);
  if (field === "bankAccountNumber" || field === "taxId" || field === "workPermit") return /^\d+$/.test(v);
  if (field === "languages") return Array.isArray(v) && v.length > 0;
  if (field === "platforms") return Array.isArray(v) && v.length > 0 && v.every(p => p.name && p.id);
  if (field === "insuranceCoverage") return Array.isArray(v) && v.length > 0;
  if (field === "licenses") return Array.isArray(v) && v.length > 0;
  if (field === "gdl") {
    if (v === "Yes") return !!data.gdlDocument;
    return v === "No";
  }
  return v !== undefined && v !== null && v !== "";
}

const calculateCompletion = (data) => {
  const fields = [
    "fullName", "dob", "gender", "phone", "email", "address", "profilePhoto",
    "nricId", "icPhotos", "taxId", "workPermit", "workStatus", "workCategory",
    "experience", "languages", "platforms", "bank", "bankAccountNumber",
    "insuranceCoverage", "socialSecurity", "licenses", "gdl", "gdlDocument"
  ];

  const isFilled = (key, val) => {
    if (["languages", "insuranceCoverage", "licenses", "icPhotos"].includes(key))
      return Array.isArray(val) && val.length > 0;
    if (key === "platforms")
      return Array.isArray(val) && val.every(p => p.name && p.id);
    if (key === "gdl")
      return val === "Yes" || val === "No";
    if (key === "gdlDocument" && data.gdl === "Yes")
      return !!val;
    if (key === "email")
      return !!val && /\S+@\S+\.\S+/.test(val);
    return val !== undefined && val !== null && val !== "";
  };

  const filtered = fields.filter(f => !(f === "gdlDocument" && data.gdl !== "Yes"));
  const filled = filtered.filter(f => isFilled(f, data[f]));
  return Math.round((filled.length / filtered.length) * 100);
};


export default function EditProfile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();

  const [formData, setFormData] = useState(initialForm);
  const [previews, setPreviews] = useState({
    profilePhoto: null,
    icPhotos: [],
    gdlDocument: null,
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
            platforms: data.platforms || [],
            insuranceCoverage: data.insuranceCoverage || [],
            licenses: data.licenses || [],
            gdl: data.gdl || "",
            gdlDocument: data.gdlDocument || null,
          }));
          setPreviews({
            profilePhoto: data.profilePhoto || null,
            icPhotos: data.icPhotos || [],
            gdlDocument: data.gdlDocument || null,
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
    Personal: ["fullName", "dob", "gender", "email", "phone", "address", "profilePhoto"],
    Identification: ["nricId", "icPhotos", "taxId", "workPermit"],
    Professional: ["workStatus", "workCategory", "experience", "languages", "platforms"],
    Finance: ["bank", "bankAccountNumber"],
    Compliance: ["insuranceCoverage", "socialSecurity", "licenses", "gdl"],
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
        let existing = formData.icPhotos || [];
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
      } else if (name === "gdlDocument") {
        const file = files[0];
        setFormData((p) => ({ ...p, gdlDocument: file }));
        setPreviews((pv) => ({ ...pv, gdlDocument: URL.createObjectURL(file) }));
      }
    } else {
      if (name === "phone") {
        const digits = value.replace(/\D/g, "").slice(0, 11); // changed to 11
        setFormData((p) => ({ ...p, phone: digits }));
      } else if (name === "gdl") {
        setFormData((p) => ({ ...p, gdl: value, gdlDocument: null }));
        setPreviews((pv) => ({ ...pv, gdlDocument: null }));
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

  // Insurance Coverage: multiple checkboxes
  const handleInsuranceChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let arr = prev.insuranceCoverage || [];
      if (checked) {
        arr = [...arr, value];
      } else {
        arr = arr.filter((v) => v !== value);
      }
      return { ...prev, insuranceCoverage: arr };
    });
    setErrors((err) => ({ ...err, insuranceCoverage: undefined }));
  };

  // Licenses: multiple checkboxes
  const handleLicensesChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let arr = prev.licenses || [];
      if (checked) {
        arr = [...arr, value];
      } else {
        arr = arr.filter((v) => v !== value);
      }
      return { ...prev, licenses: arr };
    });
    setErrors((err) => ({ ...err, licenses: undefined }));
  };

  // Platform(s) Worked For handlers
  const handlePlatformChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.platforms || [])];
      updated[idx][field] = value;
      return { ...prev, platforms: updated };
    });
  };

  const handleAddPlatform = () => {
    setFormData((prev) => ({
      ...prev,
      platforms: [...(prev.platforms || []), { name: "", id: "" }],
    }));
  };

  const handleRemovePlatform = (idx) => {
    setFormData((prev) => {
      const updated = [...(prev.platforms || [])];
      updated.splice(idx, 1);
      return { ...prev, platforms: updated };
    });
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
    if (!/^\d{1,11}$/.test(formData.phone)) err.phone = "Phone must be up to 11 digits";
    if (formData.platforms && formData.platforms.some(p => !p.name || !p.id)) {
      err.platforms = "Please fill in all Platform Name and Platform ID fields or remove empty rows.";
    }
    if (formData.gdl === "Yes" && !formData.gdlDocument) {
      err.gdlDocument = "GDL Document is required if you have GDL.";
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = auth.currentUser;
    let err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

  const updated = { ...formData };
  delete updated.verified; // Ensure old value doesn't carry over
  updated.verified = false; // Force unverified after edit

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

  // Upload GDL Document
  if (formData.gdl === "Yes" && formData.gdlDocument instanceof File) {
    const r3 = storageRef(storage, `gdlDocuments/${u.uid}_${formData.gdlDocument.name}`);
    await uploadBytes(r3, formData.gdlDocument);
    updated.gdlDocument = await getDownloadURL(r3);
  } else if (formData.gdl === "No") {
    updated.gdlDocument = null;
  }

  updated.completion = calculateCompletion(updated);
  updated.verified = false; // ✅ Reset verification
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
              <label>{fieldLabels.gender}</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
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
                maxLength={11} // changed from 10 to 11
                inputMode="numeric"
                pattern="\d*"
                placeholder="e.g. 01234567890"
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
            <div className="input-group">
              <label>{fieldLabels.platforms}</label>
              {(formData.platforms || []).map((platform, idx) => (
                <div className="platform-row" key={idx}>
                  <input
                    type="text"
                    placeholder="Platform Name (e.g. Grab, Lalamove)"
                    value={platform.name}
                    onChange={e => handlePlatformChange(idx, "name", e.target.value)}
                    className="platform-input"
                  />
                  <input
                    type="text"
                    placeholder="Platform ID / Account"
                    value={platform.id}
                    onChange={e => handlePlatformChange(idx, "id", e.target.value)}
                    className="platform-input"
                  />
                  <button
                    type="button"
                    className="remove-platform-btn"
                    onClick={() => handleRemovePlatform(idx)}
                    title="Remove this platform"
                    style={{ marginLeft: 8 }}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-platform-btn"
                onClick={handleAddPlatform}
              >
                + Add Platform
              </button>
              {errors.platforms && <div className="error">{errors.platforms}</div>}
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
              <div className="checkbox-group">
                {INSURANCE_OPTIONS.map((opt) => (
                  <label key={opt} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="insuranceCoverage"
                      value={opt}
                      checked={formData.insuranceCoverage.includes(opt)}
                      onChange={handleInsuranceChange}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {errors.insuranceCoverage && <div className="error">{errors.insuranceCoverage}</div>}
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
              <div className="checkbox-group">
                {LICENSES_OPTIONS.map((opt) => (
                  <label key={opt} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="licenses"
                      value={opt}
                      checked={formData.licenses.includes(opt)}
                      onChange={handleLicensesChange}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {errors.licenses && <div className="error">{errors.licenses}</div>}
            </div>
            <div className="input-group">
              <label>{fieldLabels.gdl}</label>
              <select name="gdl" value={formData.gdl} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {formData.gdl === "Yes" && (
              <div className="input-group">
                <label>{fieldLabels.gdlDocument}</label>
                <input
                  type="file"
                  name="gdlDocument"
                  accept="application/pdf,image/*"
                  onChange={handleChange}
                />
                {previews.gdlDocument && (
                  <span
                    className="gdl-doc-link"
                    onClick={() => handleFileClick(previews.gdlDocument)}
                  >
                    View Uploaded GDL Document
                  </span>
                )}
                {errors.gdlDocument && <div className="error">{errors.gdlDocument}</div>}
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="edit-page">
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
    </div>
  );
}