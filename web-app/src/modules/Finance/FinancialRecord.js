import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import "./finance.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function FinancialRecord() {
  const { user } = useUser();
  const [records, setRecords] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  const [detailedMonth, setDetailedMonth] = useState(null);

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
            <div key={m.month} style={{
              background: "#e6f9f1",
              borderRadius: 8,
              marginBottom: 18,
              padding: 16,
              boxShadow: "0 2px 8px rgba(0,177,106,0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                onClick={() => setDetailedMonth(detailedMonth === m.month ? null : m.month)}
              >
                <div style={{ fontWeight: "bold", fontSize: 22, flex: 1 }}>{m.month}</div>
                <div style={{ marginRight: 18 }}>
                  <span style={{ color: "#EA5455", fontWeight: 600 }}>Expense: RM {m.expense.toFixed(2)}</span>
                  <span style={{ marginLeft: 18, color: "#28C76F", fontWeight: 600 }}>Income: RM {m.income.toFixed(2)}</span>
                </div>
                <span style={{ color: "#888", fontSize: 15 }}>
                  {detailedMonth === m.month ? "▲" : "▼"}
                </span>
              </div>
              {detailedMonth === m.month && (
                <div style={{ marginTop: 12 }}>
                  {m.items.length === 0 ? (
                    <div style={{ fontStyle: "italic", color: "#888" }}>No data available yet.</div>
                  ) : (
                    <table style={{ width: "100%", marginTop: 8 }}>
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
                              <button className="finance-btn" onClick={() => handleDelete(rec.id)}>
                                Delete
                              </button>
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
            <div key={d.date} style={{
              background: "#fff",
              borderRadius: 8,
              marginBottom: 18,
              padding: 16,
              boxShadow: "0 2px 8px rgba(0,177,106,0.04)"
            }}>
              <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}>
                {d.date}
              </div>
              <table style={{ width: "100%" }}>
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
                        <button className="finance-btn" onClick={() => handleDelete(rec.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}