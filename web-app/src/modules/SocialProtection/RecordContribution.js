import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, push, get, child, update } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./contribution.css";
import Navbar from "../../components/Navbar";

const socsoMonthlyValue = {
  "Plan 1": 13.1,
  "Plan 2": 19.4,
  "Plan 3": 36.9,
  "Plan 4": 49.4,
};

export default function RecordContribution() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { scheme = "", chosenPlan = "", id = "" } = location.state || {};

  const [month, setMonth] = useState("");
  const [total, setTotal] = useState("");
  const [reminder, setReminder] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTotalContribution, setCurrentTotalContribution] = useState(0);

  useEffect(() => {
    if (!id) return;
    const db = getDatabase();
    get(child(ref(db), `socialplan/${id}`)).then((snap) => {
      if (snap.exists()) {
        setCurrentTotalContribution(parseFloat(snap.val().totalContribution) || 0);
      }
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (reminder && new Date(reminder).getTime() <= Date.now()) {
      alert("You need to enter a future date/time.");
      return;
    }

    setLoading(true);
    const db = getDatabase();

    const newContribution =
      scheme === "i-Saraan KWSP"
        ? parseFloat(total)
        : parseInt(month) * socsoMonthlyValue[chosenPlan];

    const newTotalContribution = currentTotalContribution + parseFloat(newContribution);

    const newRef = push(ref(db, "SPcontribution"));
    const contributionData = {
      email: user.email,
      chosenPlan,
      scheme,
      createdAt: Date.now(),
      value: newContribution,
    };
    if (scheme !== "i-Saraan KWSP") {
      contributionData.monthsCovered = parseInt(month);
    }
    await set(newRef, contributionData);

    await update(ref(db, `socialplan/${id}`), {
      totalContribution: newTotalContribution,
    });

    if (reminder) {
      const reminderRef = push(ref(db, "SPreminder"));
      await set(reminderRef, {
        email: user.email,
        scheme,
        chosenPlan,
        reminderAt: new Date(reminder).getTime(),
        createdAt: Date.now(),
        message: `Reminder to contribute to ${scheme}`,
        type: "contribution",
      });
    }

    setLoading(false);
    navigate("/social/contributions");
  };

  return (
    <>
      <Navbar />
      <div className="contribution-form-container">
        <h2>Record Social Protection Contribution</h2>
        <form className="contribution-form" onSubmit={handleSubmit}>
          <label>
            Scheme
            <input type="text" value={scheme} readOnly />
          </label>
          <label>
            Chosen Plan
            <input type="text" value={chosenPlan} readOnly />
          </label>

          {scheme === "i-Saraan KWSP" ? (
            <label>
              Total (RM)
              <input
                type="number"
                value={total}
                onChange={e => setTotal(e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </label>
          ) : (
            <>
              <label>
                Months Covered
                <input
                  type="number"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  required
                  min="1"
                  step="1"
                />
              </label>
              <label>
                Overall Total (RM)
                <input
                  type="text"
                  value={
                    month && socsoMonthlyValue[chosenPlan]
                      ? (socsoMonthlyValue[chosenPlan] * parseInt(month)).toFixed(2)
                      : ""
                  }
                  readOnly
                />
              </label>
            </>
          )}

          <label>
            Set Reminder (Optional)
            <input
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            />
          </label>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate("/social")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
