import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
  push,
} from 'firebase/database';
import Navbar from '../../components/Navbar';
import ComplaintForm from './ComplaintForm';
import './helpdesk.css';
import { useNavigate } from 'react-router-dom';

export default function Helpdesk() {
  const [ongoingComplaints, setOngoingComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [replyModalId, setReplyModalId] = useState(null);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const complaintsRef = ref(db, 'complaints');
    const userComplaintsQuery = query(
      complaintsRef,
      orderByChild('userId'),
      equalTo(user.uid)
    );

    const unsubscribe = onValue(userComplaintsQuery, snapshot => {
      const data = snapshot.val() || {};
      const filtered = Object.entries(data)
        .filter(([_, complaint]) => complaint.status === 'Ongoing')
        .map(([key, complaint]) => ({ id: key, ...complaint }));
      setOngoingComplaints(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  const handleResolve = (complaintId) => {
    if (!complaintId) return;
    if (!window.confirm('Mark this complaint as resolved?')) return;

    update(ref(db, `complaints/${complaintId}`), { status: 'Resolved' }).catch(err => {
      alert('Failed to update status.');
      console.error(err);
    });
  };

  const handlePhotoClick = (url) => {
    setModalImageUrl(url);
    setShowImageModal(true);
  };

  const handleReply = async (complaintId) => {
    const message = replyInputs[complaintId]?.trim();
    if (!message) return;

    await push(ref(db, `complaints/${complaintId}/replies`), {
      senderId: user.uid,
      senderRole: "user",
      message,
      replyAt: Date.now()
    });

    setReplyInputs(prev => ({ ...prev, [complaintId]: "" }));
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

  return (
    <>
      <Navbar />
      <div className="helpdesk-page">
        <div className="helpdesk-container">
          <h2>Ongoing Complaints</h2>

          {loading && <p>Loading complaints...</p>}

          <table className="complaints-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Photo</th>
                <th>Replies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && ongoingComplaints.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No ongoing complaints.
                  </td>
                </tr>
              ) : (
                ongoingComplaints.map(c => (
                  <tr key={c.id}>
                    <td>{c.ticketNumber}</td>
                    <td>{c.title}</td>
                    <td>{c.category || 'N/A'}</td>
                    <td>{c.status || 'N/A'}</td>
                    <td>{c.createdAt ? formatDateTime(c.createdAt) : 'N/A'}</td>
                    <td>
                      {c.photoURL ? (
                        <img
                          src={c.photoURL}
                          alt="Attachment"
                          style={{
                            maxWidth: '80px',
                            maxHeight: '80px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handlePhotoClick(c.photoURL)}
                        />
                      ) : 'No photo'}
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
                        👁 View
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleResolve(c.id)} className="resolve-btn">
                        Mark as Resolved
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <button onClick={openForm} className="submit-complaint-btn">Submit Complaint</button>
            <button onClick={() => navigate('/helpdesk/history')} className="view-history-btn">View History</button>
          </div>

          {showForm && <ComplaintForm onClose={closeForm} />}
        </div>
      </div>

      {/* Replies Modal */}
      {replyModalId && (
        <div className="modal-overlay" onClick={() => setReplyModalId(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <h3>Replies</h3>
            <div style={{ marginBottom: "12px" }}>
              {ongoingComplaints.find(c => c.id === replyModalId)?.replies ? (
                <ul>
                  {Object.values(ongoingComplaints.find(c => c.id === replyModalId).replies).map((r, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      <strong>{r.senderRole === 'admin' ? '🛡️ Admin' : '👤 You'}:</strong> {r.message}
                      <span style={{ fontSize: 12, color: "#777" }}> ({formatDateTime(r.replyAt)})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p><em>No replies yet.</em></p>
              )}
            </div>

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
                marginTop: "8px",
                padding: "6px 10px",
                background: "#0984e3",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Send Reply
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowImageModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(30,40,60,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalImageUrl} alt="Full view" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12 }} />
          </div>
        </div>
      )}
    </>
  );
}
