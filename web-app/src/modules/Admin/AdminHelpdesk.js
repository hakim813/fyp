import React, { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  update,
  push,
} from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";

export default function AdminHelpdesk() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modalImage, setModalImage] = useState(null);
  const [replyModalId, setReplyModalId] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/home");
      return;
    }

    const db = getDatabase();
    const complaintsRef = ref(db, "complaints");
    const usersRef = ref(db, "users");

    onValue(complaintsRef, (complaintSnap) => {
      const complaintData = complaintSnap.val();
      if (!complaintData) return;

      onValue(usersRef, (userSnap) => {
        const userData = userSnap.val() || {};

        const all = Object.entries(complaintData).map(([id, comp]) => {
          const userObj = userData[comp.userId];
          const userLabel = userObj
            ? `${userObj.fullName || "Unnamed"} (${userObj.email || "No email"})`
            : comp.userId || "Unknown";
          return { id, ...comp, userLabel };
        });

        setComplaints(all);
      }, { onlyOnce: true });
    });
  }, [user, navigate]);

  const filtered = complaints.filter((c) => {
    if (filter === "ongoing") return c.status === "ongoing";
    if (filter === "resolved") return c.status === "Resolved";
    return true;
  });

  const updateStatus = (id, newStatus) => {
    const db = getDatabase();
    update(ref(db, `complaints/${id}`), { status: newStatus });
    alert(`Complaint marked as ${newStatus}.`);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const handleReply = async (complaintId) => {
    const message = replyInputs[complaintId]?.trim();
    if (!message) return;

    const db = getDatabase();
    await push(ref(db, `complaints/${complaintId}/replies`), {
      senderId: user.uid,
      senderRole: "admin",
      message,
      replyAt: Date.now()
    });

    setReplyInputs(prev => ({ ...prev, [complaintId]: "" }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => navigate("/admin")}
        style={{
          marginBottom: "15px",
          padding: "6px 14px",
          border: "none",
          background: "#ccc",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        ← Back to Dashboard
      </button>

      <h2>Helpdesk Complaints (Admin View)</h2>

      <div style={{ margin: "10px 0" }}>
        <label><strong>Filter by status:</strong>{" "}</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="ongoing">Ongoing</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p>No complaints to display.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={{ padding: 8 }}>Ticket</th>
              <th>Title</th>
              <th>Category</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              <th>Photo</th>
              <th>Replies</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{c.ticketNumber}</td>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.userLabel}</td>
                <td>{c.createdAt ? formatDateTime(c.createdAt) : 'N/A'}</td>
                <td>{c.status}</td>
                <td>
                  {c.photoURL ? (
                    <img
                      src={c.photoURL}
                      alt="attachment"
                      style={{ width: 80, height: 60, objectFit: "cover", cursor: "pointer", borderRadius: 6 }}
                      onClick={() => setModalImage(c.photoURL)}
                    />
                  ) : "No photo"}
                </td>
                <td>
                  <button
                    onClick={() => setReplyModalId(c.id)}
                    style={{
                      padding: "4px 10px",
                      fontSize: "14px",
                      background: "#0984e3",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    onClick={() =>
                      updateStatus(c.id, c.status === "resolved" ? "ongoing" : "resolved")
                    }
                    style={{
                      padding: "6px 12px",
                      background: c.status === "resolved" ? "#f39c12" : "#2ecc71",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Mark as {c.status === "resolved" ? "Ongoing" : "Resolved"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Image Preview */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <img
            src={modalImage}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(255,255,255,0.4)"
            }}
          />
        </div>
      )}

      {/* Replies Modal */}
      {replyModalId && (
        <div
          className="modal-overlay"
          onClick={() => setReplyModalId(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "20px"
            }}
          >
            <h3>Replies</h3>
            <hr />
            {complaints.find(c => c.id === replyModalId)?.replies ? (
              <ul>
                {Object.values(complaints.find(c => c.id === replyModalId).replies).map((r, i) => (
                  <li key={i} style={{ marginBottom: 12 }}>
                    <strong>{r.senderRole === 'admin' ? '🛡️ Admin' : '👤 User'}:</strong> {r.message}<br />
                    <small style={{ color: '#666' }}>{formatDateTime(r.replyAt)}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontStyle: "italic" }}>No replies yet.</p>
            )}
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyInputs[replyModalId] || ""}
              onChange={(e) =>
                setReplyInputs(prev => ({ ...prev, [replyModalId]: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            />
            <button
              onClick={() => handleReply(replyModalId)}
              style={{
                marginTop: "10px",
                padding: "6px 10px",
                background: "#0984e3",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
