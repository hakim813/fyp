import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDatabase,
  ref,
  get,
  push,
  remove,
  onValue,
} from "firebase/database";

export default function AdminVoucher() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incentive, setIncentive] = useState("");
  const [expiryType, setExpiryType] = useState("days");
  const [expiryValue, setExpiryValue] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [voucherList, setVoucherList] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const db = getDatabase();

  // Fetch users ONCE
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await get(ref(db, "users"));
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.entries(data).map(([uid, info]) => ({
          id: uid,
          name: info.fullName || "Unnamed",
          email: info.email || "",
        }));
        setUsers(list);
      }
    };

    fetchUsers();
  }, [db]);

  // Fetch vouchers when users are ready
  useEffect(() => {
    if (users.length === 0) return; // Prevent running before users are loaded

    const voucherRef = ref(db, "vouchers");
    const unsubscribe = onValue(voucherRef, (snapshot) => {
      const data = snapshot.val() || {};
      const allVouchers = [];

      Object.entries(data).forEach(([uid, voucherObj]) => {
        Object.entries(voucherObj).forEach(([voucherId, voucher]) => {
          const user = users.find((u) => u.id === uid);
          allVouchers.push({
            ...voucher,
            id: voucherId,
            userId: uid,
            userName: user?.name || "",
            userEmail: user?.email || "",
          });
        });
      });

      setVoucherList(allVouchers);
    });

    return () => unsubscribe();
  }, [db, users]);


  const handleGenerate = async () => {
    if (!amount || !expiryValue) return;

    const now = Date.now();
    const expiresAt =
      expiryType === "days"
        ? now + parseInt(expiryValue) * 86400000
        : new Date(expiryValue).getTime();

    const code = "PETRO-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    const voucher = {
      code,
      amount: parseFloat(amount),
      description,
      incentive,
      created: now,
      expiresAt,
      status: "Unused",
      adminGenerated: true,
    };

    if (selectedUser === "all") {
      for (const user of users) {
        await push(ref(db, `vouchers/${user.id}`), { ...voucher, user: user.id });
      }
    } else {
      await push(ref(db, `vouchers/${selectedUser}`), {
        ...voucher,
        user: selectedUser,
      });
    }

    setSuccessMsg("Voucher successfully created!");
    setAmount("");
    setDescription("");
    setIncentive("");
    setExpiryValue("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = async (userId, voucherId) => {
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      await remove(ref(db, `vouchers/${userId}/${voucherId}`));
    }
  };

    const formatDate = (ts) => {
        const d = new Date(ts);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `${dd}/${mm}/${yyyy} ${time}`;
    };


  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <button
        onClick={() => navigate("/admin")}
        style={{
          marginBottom: 20,
          background: "#f0f0f0",
          border: "1px solid #ccc",
          padding: "6px 12px",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={{ marginBottom: 20 }}>Generate Voucher for User</h2>

      <div style={{ marginBottom: 14 }}>
        <label>User:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        >
          <option value="">-- Select user --</option>
          <option value="all">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Amount (RM):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Incentive:</label>
        <input
          type="text"
          value={incentive}
          onChange={(e) => setIncentive(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Description:</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Expiry Type:</label>
        <div style={{ marginTop: 4 }}>
          <label style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="expiry"
              value="days"
              checked={expiryType === "days"}
              onChange={() => setExpiryType("days")}
            />
            {" "}Expire in N days
          </label>
          <label>
            <input
              type="radio"
              name="expiry"
              value="date"
              checked={expiryType === "date"}
              onChange={() => setExpiryType("date")}
            />
            {" "}Expire on specific date
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {expiryType === "days" ? (
          <input
            type="number"
            placeholder="Number of days"
            value={expiryValue}
            onChange={(e) => setExpiryValue(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        ) : (
          <input
            type="date"
            value={expiryValue}
            onChange={(e) => setExpiryValue(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        )}
      </div>

      <button
        onClick={handleGenerate}
        style={{
          background: "#1976d2",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        Generate Voucher
      </button>

      {successMsg && (
        <div style={{ marginTop: 16, color: "green", fontWeight: "bold" }}>
          {successMsg}
        </div>
      )}

      <h3 style={{ marginTop: 40 }}>All Vouchers</h3>
      <input
        type="text"
        placeholder="Filter by user ID, name, email or code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 12, padding: 8 }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
            <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>User</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Code</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Amount</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Incentive</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Description</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Status</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Expiry</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Action</th>
            </tr>
        </thead>
        <tbody>
            {voucherList
            .filter((v) => {
                const expiryString = formatDate(v.expiresAt).toLowerCase();
                return (
                v.userId.includes(search) ||
                v.code.toLowerCase().includes(search.toLowerCase()) ||
                v.userName.toLowerCase().includes(search.toLowerCase()) ||
                v.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                (v.amount?.toString().includes(search)) ||
                v.status.toLowerCase().includes(search.toLowerCase()) ||
                expiryString.includes(search.toLowerCase()) ||
                (v.incentive?.toLowerCase().includes(search.toLowerCase())) ||
                (v.description?.toLowerCase().includes(search.toLowerCase()))
                );
            })
            .map((v) => (
                <tr key={v.id}>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>
                    {v.userName} <br />
                    <span style={{ color: "#888", fontSize: "0.9em" }}>{v.userEmail}</span>
                </td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>{v.code}</td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>RM{v.amount}</td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>{v.incentive || "-"}</td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>{v.description || "-"}</td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>{v.status}</td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>{formatDate(v.expiresAt)}</td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>
                    <button
                    onClick={() => handleDelete(v.userId, v.id)}
                    style={{
                        background: "crimson",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                    }}
                    >
                    Delete
                    </button>
                </td>
                </tr>
            ))}
        </tbody>
    </table>

    </div>
  );
}
