import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import { getDatabase, ref, onValue } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./finance.css";

const COLORS = ["#00684a", "#ea5455"];

export default function FinanceManager() {
  const { user } = useUser();
  const [data, setData] = useState({});
  const [isMonthly, setIsMonthly] = useState(false);
  const [totals, setTotals] = useState({
    dailyIncome: 0,
    dailyExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const recordsRef = ref(db, "financeRecords");

    const unsubscribe = onValue(recordsRef, (snapshot) => {
      const records = snapshot.val() || {};
      setData(records);

      let dailyIncome = 0, dailyExpense = 0, monthlyIncome = 0, monthlyExpense = 0;
      const today = new Date();

      Object.values(records).forEach(({ email, type, date, value }) => {
        if (email !== user.email) return;
        const tDate = new Date(date);

        if (tDate.toDateString() === today.toDateString()) {
          type === "Income" ? dailyIncome += +value : dailyExpense += +value;
        }

        if (tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
          type === "Income" ? monthlyIncome += +value : monthlyExpense += +value;
        }
      });

      setTotals({ dailyIncome, dailyExpense, monthlyIncome, monthlyExpense });
    });

    return () => unsubscribe();
  }, [user]);

  // Chart data helpers
  const getLast7Days = () => [...Array(7)].map((_, i) => new Date(new Date().setDate(new Date().getDate() - (6 - i))));
  const getLast6Months = () => [...Array(6)].map((_, i) => new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1));

  const generateChartData = (rangeFunc, matchFn) => {
    const range = rangeFunc();
    return range.map((date) => {
      let income = 0, expense = 0;
      Object.values(data).forEach(({ email, type, date: tDate, value }) => {
        if (email !== user.email) return;
        const d = new Date(tDate);
        if (matchFn(d, date)) {
          type === "Income" ? income += +value : expense += +value;
        }
      });
      return {
        name: rangeFunc === getLast6Months
          ? date.toLocaleDateString("en-US", { month: "short" })
          : date.toLocaleDateString("en-US", { weekday: "short" }),
        Income: income,
        Expense: expense,
      };
    });
  };

  const lineData = isMonthly
    ? generateChartData(getLast6Months, (a, b) => a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
    : generateChartData(getLast7Days, (a, b) => a.toDateString() === b.toDateString());

  const pieData = isMonthly
    ? [
        { name: "Income", value: totals.monthlyIncome },
        { name: "Expense", value: totals.monthlyExpense },
      ]
    : [
        { name: "Income", value: totals.dailyIncome },
        { name: "Expense", value: totals.dailyExpense },
      ];

  const netProfit = isMonthly
    ? totals.monthlyIncome - totals.monthlyExpense
    : totals.dailyIncome - totals.dailyExpense;

  return (
    <div className="finance-page">
      <div className="finance-container">
        <h2>
          Expense Manager
        </h2>

        <div className="toggle-row">
          <span className={!isMonthly ? "toggle-label active" : "toggle-label"}>Daily</span>
          <label className="switch">
            <input type="checkbox" checked={isMonthly} onChange={() => setIsMonthly((v) => !v)} />
            <span className="slider"></span>
          </label>
          <span className={isMonthly ? "toggle-label active" : "toggle-label"}>Monthly</span>
        </div>

        <div className="dashboard-row">
          <div className="card">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="summary">
              <div className="summary-date">
                {isMonthly
                  ? new Date().toLocaleDateString("en-US", { month: "long" })
                  : new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" })}
              </div>
              <div className="summary-label">Net Profit</div>
              <div className={`summary-profit${netProfit < 0 ? " negative" : ""}`}>
                {netProfit >= 0 ? "RM " : "- RM "}
                {Math.abs(netProfit).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="chart-title">{isMonthly ? "Monthly" : "Weekly"} Income vs Expense</div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="#00684a" strokeWidth={3} />
                <Line type="monotone" dataKey="Expense" stroke="#ea5455" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <div className="gain-spent-row">
              <div className="gain">Gain: RM {isMonthly ? totals.monthlyIncome : totals.dailyIncome}</div>
              <div className="spent">Spent: RM {isMonthly ? totals.monthlyExpense : totals.dailyExpense}</div>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={() => navigate("/finance/create", { state: { type: "Income" } })}>
            Add Income
          </button>
          <button className="btn" onClick={() => navigate("/finance/create", { state: { type: "Expense" } })}>
            Add Expense
          </button>
          <button className="btn" onClick={() => navigate("/finance/records")}>
            See Records
          </button>
          <button className="btn" onClick={() => navigate("/finance/scan")}>
            Scan Gig History
          </button>
        </div>
      </div>
    </div>
  );
}