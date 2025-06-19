import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";

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
  profilePhoto: "Profile Photo",
};

const sectionFields = {
  Personal: ["profilePhoto", "fullName", "dob", "gender", "email", "phone", "address"],
  Identification: ["nricId", "icPhotos", "taxId", "workPermit"],
  Professional: ["workStatus", "workCategory", "experience", "languages", "platforms"],
  Finance: ["bank", "bankAccountNumber"],
  Compliance: ["insuranceCoverage", "socialSecurity", "licenses", "gdl", "gdlDocument"],
};

export default function AdminProfileVerification() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [completedUsers, setCompletedUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modalImage, setModalImage] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/home");
      return;
    }

    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const eligibleUsers = Object.entries(data)
        .filter(([_, u]) => u.completion === 100)
        .map(([uid, u]) => ({ uid, ...u }));

      setCompletedUsers(eligibleUsers);
    });
  }, [user, navigate]);

  const toggleVerification = (uid, isCurrentlyVerified) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    update(userRef, { verified: !isCurrentlyVerified });
    alert(`User has been ${!isCurrentlyVerified ? "verified" : "unverified"}.`);
  };

  const filteredUsers = completedUsers.filter((u) => {
    if (filter === "verified") return u.verified === true;
    if (filter === "unverified") return u.verified !== true;
    return true;
  });

  const renderField = (field, value, gdl) => {
    if (!value || (field === "gdlDocument" && gdl !== "Yes")) return null;

    if (Array.isArray(value)) {
      if (field === "platforms") {
        return <ul>{value.map((p, i) => <li key={i}>{p.name} (ID: {p.id})</li>)}</ul>;
      } else if (field === "icPhotos") {
        return (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {value.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`IC ${i + 1}`}
                width="100"
                height="70"
                style={{ borderRadius: 4, objectFit: "cover", border: "1px solid #ccc", cursor: "pointer" }}
                onClick={() => setModalImage(src)}
              />
            ))}
          </div>
        );
      } else {
        return value.join(", ");
      }
    }

    if (field === "gdlDocument") {
      return value.endsWith(".pdf") ? (
        <iframe src={value} title="GDL Document" width="100%" height="300" style={{ border: "1px solid #ccc", borderRadius: 4 }} />
      ) : (
        <img
          src={value}
          alt="GDL Document"
          style={{ width: "150px", borderRadius: 4, objectFit: "cover", border: "1px solid #ccc", cursor: "pointer" }}
          onClick={() => setModalImage(value)}
        />
      );
    }

    if (field === "profilePhoto") {
      return (
        <img
          src={value}
          alt="Profile"
          width="100"
          height="100"
          style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #ccc", cursor: "pointer" }}
          onClick={() => setModalImage(value)}
        />
      );
    }

    return value;
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <button
        onClick={() => navigate("/admin")}
        style={{ marginBottom: 15, padding: "8px 16px", backgroundColor: "#ccc", border: "none", borderRadius: 5 }}
      >
        ← Back to Dashboard
      </button>

      <h2>100% Completed Profiles</h2>

      <div style={{ marginBottom: "20px" }}>
        <label><strong>Filter:</strong> </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Show All</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users found for selected filter.</p>
      ) : (
        <ul style={{ paddingLeft: 0 }}>
          {filteredUsers.map((u) => {
            const expanded = expandedUserId === u.uid;
            return (
              <li key={u.uid} style={{ listStyle: "none", border: "1px solid #ccc", padding: 15, marginBottom: 20, borderRadius: 8 }}>
                <h3
                  style={{ cursor: "pointer", color: "#0984e3" }}
                  onClick={() => setExpandedUserId(expanded ? null : u.uid)}
                >
                  {expanded ? "➖" : "➕"} {u.fullName}
                </h3>
                <p><strong>Email:</strong> {u.email}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  {u.verified ? <span style={{ color: "green", fontWeight: "bold" }}>✅ Verified</span> : <span style={{ color: "red", fontWeight: "bold" }}>❌ Not Verified</span>}
                </p>

                {expanded && (
                  <>
                    {Object.entries(sectionFields).map(([section, fields]) => (
                      <div key={section} style={{ marginTop: 12 }}>
                        <h4>{section}</h4>
                        {fields.map((field) => (
                          <div key={field}>
                            <strong>{fieldLabels[field]}:</strong>{" "}
                            {renderField(field, u[field], u.gdl) || (
                              <em style={{ color: "#aaa" }}>Not provided</em>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <button
                      style={{ marginTop: 15 }}
                      onClick={() => toggleVerification(u.uid, u.verified === true)}
                    >
                      {u.verified ? "Unverify" : "Verify"}
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999
          }}
        >
          <img
            src={modalImage}
            alt="Full Preview"
            style={{
              maxWidth: "90%", maxHeight: "90%",
              borderRadius: 10, boxShadow: "0 0 10px rgba(255,255,255,0.3)"
            }}
          />
        </div>
      )}
    </div>
  );
}
