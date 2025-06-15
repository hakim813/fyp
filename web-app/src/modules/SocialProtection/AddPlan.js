import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, set, get, child } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./contribution.css";

const PLAN_OPTIONS = [
  {
    label: "Self-Employment Social Security Scheme PERKESO",
    value: "perkeso",
    subOptions: [
      { label: "Perkeso Plan 1", value: "Plan 1" },
      { label: "Perkeso Plan 2", value: "Plan 2" },
      { label: "Perkeso Plan 3", value: "Plan 3" },
      { label: "Perkeso Plan 4", value: "Plan 4" },
    ],
  },
  {
    label: "i-Saraan KWSP",
    value: "kwsp",
    subOptions: [{ label: "i-Saraan Plan", value: "i-Saraan Plan" }],
  },
];

export default function AddPlan() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState("");
  const [planOptions, setPlanOptions] = useState([]);
  const [chosenPlan, setChosenPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // For duplicate check
  const [existingPlans, setExistingPlans] = useState([]);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    get(child(ref(db), "socialplan")).then((snap) => {
      const data = snap.val();
      if (data) {
        setExistingPlans(
          Object.values(data).filter((p) => p.email === user.email)
        );
      }
    });
  }, [user]);

  // Update plan options when scheme changes
  useEffect(() => {
    const found = PLAN_OPTIONS.find((opt) => opt.label === scheme);
    setPlanOptions(found ? found.subOptions : []);
    setChosenPlan("");
  }, [scheme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prevent duplicate plan under same scheme
    const duplicate = existingPlans.find(
      (p) =>
        (p.chosenPlan === chosenPlan || p.scheme === scheme) &&
        (scheme === "Self-Employment Social Security Scheme PERKESO"
          ? p.scheme === scheme
          : p.chosenPlan === chosenPlan)
    );
    if (duplicate) {
      alert(
        "You cannot have more than one plan under the same scheme (SOCSO restriction applies)."
      );
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const newRef = push(ref(db, "socialplan"));
    await set(newRef, {
      email: user.email,
      scheme,
      chosenPlan,
      totalContribution: 0,
      sent: false,
      rtime: 0,
      rdate: 0,
      notes: "",
    });
    setLoading(false);
    navigate("/social");
  };

  return (
    <div className="contribution-form-container">
      <h2>Add Social Protection Plan</h2>
      <form className="contribution-form" onSubmit={handleSubmit}>
        <label>
          Social Protection Scheme
          <select
            value={scheme}
            onChange={e => setScheme(e.target.value)}
            required
          >
            <option value="">Select Scheme</option>
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Plans
          <select
            value={chosenPlan}
            onChange={e => setChosenPlan(e.target.value)}
            required
            disabled={!scheme}
          >
            <option value="">Select Plan</option>
            {planOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add New Plan"}
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate("/social")}
          >
            Cancel
          </button>
        </div>
        <div style={{ marginTop: 15, color: "#222", fontSize: "0.97em" }}>
          *If you have any existing SOCSO plan which still not complete 12-months contributions, new plan will not be added
        </div>
      </form>
    </div>
  );
}