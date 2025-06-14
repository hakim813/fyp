import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getDatabase, ref, push, set, get, child } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./finance.css";

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
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [planOptions, setPlanOptions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Update plan options when scheme changes
  useEffect(() => {
    if (selectedScheme) {
      const found = PLAN_OPTIONS.find((opt) => opt.value === selectedScheme.value);
      setPlanOptions(found ? found.subOptions : []);
      setSelectedPlan(null);
    } else {
      setPlanOptions([]);
      setSelectedPlan(null);
    }
  }, [selectedScheme]);

  // Handle Add Plan
  const handleAddPlan = async () => {
    if (!user || !selectedScheme || !selectedPlan) return;
    setLoading(true);
    try {
      const db = getDatabase();
      const dbRef = ref(db);
      // Check for existing plan for this user and scheme/plan
      const snapshot = await get(child(dbRef, "socialplan"));
      const plans = snapshot.exists() ? Object.values(snapshot.val()) : [];
      const exists = plans.some(
        (p) =>
          p.email === user.email &&
          (p.chosenPlan === selectedPlan.value || p.scheme === selectedScheme.label)
      );
      if (exists) {
        alert("You cannot have more than one plan under this scheme.");
        setLoading(false);
        return;
      }
      // Save new plan
      const newRef = push(ref(db, "socialplan"));
      await set(newRef, {
        user: user.displayName || user.email,
        email: user.email,
        scheme: selectedScheme.label,
        chosenPlan: selectedPlan.value,
        totalContribution: 0,
        sent: false,
        rtime: 0,
        rdate: 0,
        notes: "",
      });
      alert("Plan added!");
      navigate("/finance");
    } catch (err) {
      alert("Failed to add plan.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="finance-add-plan">
      <h2>Add Social Protection Plan</h2>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 500, color: "#009457" }}>Social Protection Scheme</label>
        <Select
          options={PLAN_OPTIONS}
          value={selectedScheme}
          onChange={setSelectedScheme}
          placeholder="Select a scheme..."
          isSearchable
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 500, color: "#009457" }}>Plan</label>
        <Select
          options={planOptions}
          value={selectedPlan}
          onChange={setSelectedPlan}
          placeholder="Select a plan..."
          isDisabled={!selectedScheme}
        />
      </div>
      <button
        className="finance-btn"
        onClick={handleAddPlan}
        disabled={!selectedScheme || !selectedPlan || loading}
      >
        {loading ? "Adding..." : "Add New Plan"}
      </button>
      <div style={{ marginTop: 18, color: "#222" }}>
        <small>
          *If you have any existing SOCSO plan which still not complete 12-months contributions, new plan will not be added.
        </small>
      </div>
    </div>
  );
}