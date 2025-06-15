import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, set, update, get, child } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./finance.css";

export default function CreateFinanceRecord() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Get type and id from route state (for update)
  const { type = "Expense", id = null } = location.state || {};

  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // If editing, fetch existing record
  useEffect(() => {
    if (id) {
      const db = getDatabase();
      get(child(ref(db), `financeRecords/${id}`)).then((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setValue(data.value?.toString() || "");
          setNotes(data.notes || "");
        }
      });
    }
  }, [id]);

  // Handle create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || value === "") {
      alert("Please enter a valid number.");
      return;
    }
    if (numericValue <= 0) {
      alert("Invalid value. Please enter a positive number.");
      return;
    }
    setLoading(true);
    const db = getDatabase();
    if (id) {
      // Update existing
      await update(ref(db, `financeRecords/${id}`), {
        email: user.email,
        type,
        value: numericValue,
        notes,
      });
    } else {
      // Create new
      const newRef = push(ref(db, "financeRecords"));
      await set(newRef, {
        email: user.email,
        type,
        value: numericValue,
        notes,
        date: Date.now(),
      });
    }
    setLoading(false);
    navigate("/finance");
  };

  return (
    <div className="finance-create-container">
      <div className="finance-create">
        <h2>{id ? "Edit" : "Add"} {type} Record</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Type:
            <input
              type="text"
              value={type}
              readOnly
              style={{ fontWeight: "bold", background: "#e6f9f1", color: "#009457" }}
            />
          </label>
          <label>
            Value (RM):
            <input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Example: 2.50"
              min="0"
              required
            />
          </label>
          <label>
            Notes:
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes"
            />
          </label>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : id ? "Update Transaction" : "Record Transaction"}
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "#009457" }}
              onClick={() => navigate("/finance/scan")}
            >
              Scan Gig History
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate("/finance")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}