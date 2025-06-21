import React, { useEffect } from "react";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!user.isAdmin) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <>
      <div className="container" style={{ padding: "20px" }}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin {user?.fullName}</p>

        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={() => navigate("/admin-helpdesk")}>📨 View Complaints</button>
          <button onClick={() => navigate("/admin/profile-verification")}>🧾 Verify Profiles</button>
          <button onClick={() => navigate("/admin/admin-voucher")}>🎁 Generate Voucher</button>

        </div>
      </div>
    </>
  );
}
