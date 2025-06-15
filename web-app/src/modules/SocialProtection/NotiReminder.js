import React, { useState, useEffect } from "react";
import { getDatabase, ref, update, get, child } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./contribution.css";
import Navbar from "../../components/Navbar";

export default function NotiReminder() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  // Get scheme, chosenPlan, id from route state
  const { scheme = "", chosenPlan = "", id = "" } = location.state || {};

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing reminder if any
  useEffect(() => {
    if (!id) return;
    const db = getDatabase();
    get(child(ref(db), `socialplan/${id}`)).then((snap) => {
      if (snap.exists()) {
        const data = snap.val();
        if (data.rdate) setDate(data.rdate);
        if (data.rtime) setTime(data.rtime);
        if (data.notes) setNotes(data.notes);
      }
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const db = getDatabase();
    await update(ref(db, `socialplan/${id}`), {
      rdate: date,
      rtime: time,
      notes,
      sent: false,
    });
    setLoading(false);
    navigate("/social");
  };

  return (
    <>
    <Navbar />
        <div className="contribution-form-container">
        <h2>Set Contribution Reminder</h2>
        <form className="contribution-form" onSubmit={handleSubmit}>
            <label>
            Scheme
            <input type="text" value={scheme} readOnly />
            </label>
            <label>
            Chosen Plan
            <input type="text" value={chosenPlan} readOnly />
            </label>
            <label>
            Reminder Notes
            <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Enter your notes..."
            />
            </label>
            <label>
            Reminder Date
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
            />
            </label>
            <label>
            Reminder Time
            <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
            />
            </label>
            <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Set Reminder"}
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