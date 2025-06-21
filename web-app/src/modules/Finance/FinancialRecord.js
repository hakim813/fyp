import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./finance.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function FinancialRecord() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  const [detailedMonth, setDetailedMonth] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleEdit = async (id) => {
    if (!editValue) return alert("Value required");
    const db = getDatabase();
    await update(ref(db, `financeRecords/${id}`), {
      value: parseFloat(editValue),
      notes: editNotes,
    });
    setEditingId(null);
  };


  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const recordsRef = ref(db, "financeRecords");
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .map(([id, val]) => ({
          id,
          email: val.email,
          type: val.type,
          value: val.value,
          notes: val.notes,
          date: val.date,
        }))
        .filter((rec) => rec.email === user.email);

      // Daily grouping
      const groupedByDate = {};
      list.forEach((rec) => {
        const dateStr = new Date(rec.date).toDateString();
        if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
        groupedByDate[dateStr].push(rec);
      });
      const dailyArr = Object.entries(groupedByDate)
        .map(([date, items]) => ({
          date,
          items: items.sort((a, b) => b.date - a.date),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setDailyData(dailyArr);

      // Monthly grouping
      const groupedByMonth = {};
      list.forEach((rec) => {
        const d = new Date(rec.date);
        const month = MONTHS[d.getMonth()];
        if (!groupedByMonth[month]) groupedByMonth[month] = { income: 0, expense: 0, items: [] };
        if (rec.type === "Income") groupedByMonth[month].income += parseFloat(rec.value);
        if (rec.type === "Expense") groupedByMonth[month].expense += parseFloat(rec.value);
        groupedByMonth[month].items.push(rec);
      });
      const monthlyArr = MONTHS.map((m) => ({
        month: m,
        income: groupedByMonth[m]?.income || 0,
        expense: groupedByMonth[m]?.expense || 0,
        items: groupedByMonth[m]?.items || [],
      }));
      setMonthlyData(monthlyArr);

      setRecords(list);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this record?")) {
      const db = getDatabase();
      remove(ref(db, `financeRecords/${id}`));
    }
  };

  return (
    <div className="finance-records-container">
      <div className="finance-records">
        <h2>Financial Records</h2>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: "#009457", marginRight: 12 }}>
            <input
              type="checkbox"
              checked={isMonthlyView}
              onChange={() => {
                setIsMonthlyView((v) => !v);
                setDetailedMonth(null);
              }}
              style={{ marginRight: 8 }}
            />
            Monthly View
          </label>
        </div>

        {isMonthlyView ? (
          <div>
            {monthlyData.map((m) => (
              <div key={m.month} className="record-monthly-card">
                <div className="record-monthly-header"
                  onClick={() => setDetailedMonth(detailedMonth === m.month ? null : m.month)}
                >
                  <div className="record-monthly-title">{m.month}</div>
                  <div className="record-monthly-summary">
                    <span className="spent">Expense: RM {m.expense.toFixed(2)}</span>
                    <span className="gain">Income: RM {m.income.toFixed(2)}</span>
                  </div>
                  <span className="record-monthly-arrow">
                    {detailedMonth === m.month ? "▲" : "▼"}
                  </span>
                </div>
                {detailedMonth === m.month && (
                  <div style={{ marginTop: 12 }}>
                    {m.items.length === 0 ? (
                      <div className="record-empty">No data available yet.</div>
                    ) : (
                      <table className="record-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Notes</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.items
                            .sort((a, b) => b.date - a.date)
                            .map((rec) => (
                            <tr key={rec.id}>
                              <td>{new Date(rec.date).toLocaleDateString()}</td>
                              <td>{rec.type}</td>
                              <td style={{ color: rec.type === "Income" ? "#28C76F" : "#EA5455" }}>
                                RM {parseFloat(rec.value).toFixed(2)}
                              </td>
                              <td>{rec.notes}</td>
                              <td>
                                <button className="btn btn-delete" onClick={() => handleDelete(rec.id)}>
                                  Delete
                                </button>
                                <button
                                  className="btn btn-edit"
                                  onClick={() => {
                                    setEditingId(rec.id);
                                    setEditValue(rec.value);
                                    setEditNotes(rec.notes);
                                  }}
                                >
                                  Edit
                                </button>
                                {editingId === rec.id && (
                                  <div style={{ marginTop: 8 }}>
                                    <input
                                      type="number"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      placeholder="Value"
                                      style={{ width: 80, marginRight: 6 }}
                                    />
                                    <input
                                      type="text"
                                      value={editNotes}
                                      onChange={(e) => setEditNotes(e.target.value)}
                                      placeholder="Notes"
                                      style={{ width: 120, marginRight: 6 }}
                                    />
                                    <button className="btn btn-save" onClick={() => handleEdit(rec.id)}>
                                      Save
                                    </button>
                                    <button className="btn btn-cancel" onClick={() => setEditingId(null)}>
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {dailyData.map((d) => (
              <div key={d.date} className="record-daily-card">
                <div className="record-daily-title">
                  {d.date}
                </div>
                <table className="record-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.items.map((rec) => (
                      <tr key={rec.id}>
                        <td>{rec.type}</td>
                        <td style={{ color: rec.type === "Income" ? "#28C76F" : "#EA5455" }}>
                          RM {parseFloat(rec.value).toFixed(2)}
                        </td>
                        <td>{rec.notes}</td>
                        <td>
                          <button className="btn btn-delete" onClick={() => handleDelete(rec.id)}>
                            Delete
                          </button>
                          <button
                            className="btn btn-edit"
                            onClick={() => {
                              setEditingId(rec.id);
                              setEditValue(rec.value);
                              setEditNotes(rec.notes);
                            }}
                          >
                            Edit
                          </button>
                          {editingId === rec.id && (
                            <div style={{ marginTop: 8 }}>
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="Value"
                                style={{ width: 80, marginRight: 6 }}
                              />
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Notes"
                                style={{ width: 120, marginRight: 6 }}
                              />
                              <button className="btn btn-save" onClick={() => handleEdit(rec.id)}>
                                Save
                              </button>
                              <button className="btn btn-cancel" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          )}

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
        <div className="actions" style={{ marginTop: 24 }}>
          <button className="btn btn-back" onClick={() => navigate("/finance")}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}