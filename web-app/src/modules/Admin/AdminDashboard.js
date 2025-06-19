import React from "react";
import Navbar from "../../components/Navbar"; // optional if you want the same navbar
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Optional: block non-admins from accessing
  useEffect(() => {
    if (!user) return;
    if (!user.isAdmin) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin {user?.fullName}</p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/admin/helpdesk")}>📨 View Complaints</button>
        <button onClick={() => navigate("/admin/profile-verification")}>🧾 Verify Profiles</button>
      </div>
    </div>
  );
}
