import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { getDatabase, ref, onValue } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./finance.css";

const COLORS = ["#20734f", "#ec2d01"];

export default function FinanceManager() {
  const { user } = useUser();
  const [data, setData] = useState({});
  const [isMonthly, setIsMonthly] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncomeMonthly, setTotalIncomeMonthly] = useState(0);
  const [totalExpenseMonthly, setTotalExpenseMonthly] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const recordsRef = ref(db, "financeRecords");
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setData(data);

      let income = 0, expense = 0, incomeM = 0, expenseM = 0;
      Object.values(data).forEach((transaction) => {
        if (transaction.email === user.email) {
          const tDate = new Date(transaction.date);
          const now = new Date();
          // Daily
          if (tDate.toDateString() === now.toDateString()) {
            if (transaction.type === "Income") income += parseFloat(transaction.value);
            if (transaction.type === "Expense") expense += parseFloat(transaction.value);
          }
          // Monthly
          if (tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()) {
            if (transaction.type === "Income") incomeM += parseFloat(transaction.value);
            if (transaction.type === "Expense") expenseM += parseFloat(transaction.value);
          }
        }
      });
      setTotalIncome(income);
      setTotalExpense(expense);
      setTotalIncomeMonthly(incomeM);
      setTotalExpenseMonthly(expenseM);
    });
    return () => unsubscribe();
  }, [user]);

  // Weekly data for line chart
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };
  const getWeeklyData = () => {
    const days = getLast7Days();
    return days.map((date) => {
      let income = 0, expense = 0;
      if (data) {
        Object.values(data).forEach((transaction) => {
          const tDate = new Date(transaction.date);
          if (
            transaction.email === user.email &&
            tDate.toDateString() === date.toDateString()
          ) {
            if (transaction.type === "Income") income += parseFloat(transaction.value);
            if (transaction.type === "Expense") expense += parseFloat(transaction.value);
          }
        });
      }
      return {
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        Income: income,
        Expense: expense,
      };
    });
  };

  // 6-month data for line chart
  const getLast6Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(d);
    }
    return months;
  };
  const getMonthlyData = () => {
    const months = getLast6Months();
    return months.map((date) => {
      let income = 0, expense = 0;
      if (data) {
        Object.values(data).forEach((transaction) => {
          const tDate = new Date(transaction.date);
          if (
            transaction.email === user.email &&
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          ) {
            if (transaction.type === "Income") income += parseFloat(transaction.value);
            if (transaction.type === "Expense") expense += parseFloat(transaction.value);
          }
        });
      }
      return {
        name: date.toLocaleDateString("en-US", { month: "short" }),
        Income: income,
        Expense: expense,
      };
    });
  };

  // Pie chart data
  const pieChartDataDaily = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];
  const pieChartDataMonthly = [
    { name: "Income", value: totalIncomeMonthly },
    { name: "Expense", value: totalExpenseMonthly },
  ];

  // Net profit
  const netProfit = isMonthly
    ? totalIncomeMonthly - totalExpenseMonthly
    : totalIncome - totalExpense;

  return (
    <div className="finance-manager">
      <h2>Expense Manager</h2>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <span style={{ marginRight: 12, color: "#009457", fontWeight: 500 }}>Daily</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isMonthly}
            onChange={() => setIsMonthly((v) => !v)}
          />
          <span className="slider round"></span>
        </label>
        <span style={{ marginLeft: 12, color: "#009457", fontWeight: 500 }}>Monthly</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
        <div style={{ minWidth: 260, flex: 1 }}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={isMonthly ? pieChartDataMonthly : pieChartDataDaily}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={55}
                label
              >
                {pieChartDataDaily.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>
              {isMonthly
                ? new Date().toLocaleDateString("en-US", { month: "long" })
                : new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" })}
            </div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Net profit</div>
            <div style={{ fontSize: 28, color: netProfit >= 0 ? "#28C76F" : "#EA5455" }}>
              {netProfit >= 0 ? "RM " : "- RM "}
              {Math.abs(netProfit).toFixed(2)}
            </div>
          </div>
        </div>
        <div style={{ minWidth: 320, flex: 2 }}>
          <div style={{
            background: "#e6f9f1",
            borderRadius: 12,
            padding: 18,
            marginBottom: 18,
            boxShadow: "0 2px 8px rgba(0,177,106,0.04)"
          }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
              {isMonthly ? "Monthly" : "Weekly"} Income vs Expense
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={isMonthly ? getMonthlyData() : getWeeklyData()}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="#20734f" strokeWidth={3} />
                <Line type="monotone" dataKey="Expense" stroke="#ec2d01" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: 16,
            marginBottom: 18
          }}>
            <div style={{
              borderRadius: 20,
              border: "3px solid #20734f",
              background: "#f6fff9",
              padding: "10px 18px",
              fontWeight: 600,
              color: "#20734f"
            }}>
              Gain: RM {isMonthly ? totalIncomeMonthly : totalIncome}
            </div>
            <div style={{
              borderRadius: 20,
              border: "3px solid #ec2d01",
              background: "#f6fff9",
              padding: "10px 18px",
              fontWeight: 600,
              color: "#ec2d01"
            }}>
              Spent: RM {isMonthly ? totalExpenseMonthly : totalExpense}
            </div>
          </div>
        </div>
      </div>

      <div className="finance-actions" style={{ marginTop: 32 }}>
        <button className="finance-btn" onClick={() => navigate("/finance/create", { state: { type: "Income" } })}>
          Add Income
        </button>
        <button className="finance-btn" onClick={() => navigate("/finance/create", { state: { type: "Expense" } })}>
          Add Expense
        </button>
        <button className="finance-btn" onClick={() => navigate("/finance/records")}>
          See Records
        </button>
        <button className="finance-btn" onClick={() => navigate("/finance/scan")}>
          Scan Gig History
        </button>
        <button className="finance-btn" onClick={() => navigate("/finance/add-plan")}>
          Add Plan
        </button>
      </div>
    </div>
  );
}