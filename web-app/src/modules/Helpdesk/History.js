import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import Navbar from '../../components/Navbar';
import './helpdesk.css';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [replyModalData, setReplyModalData] = useState(null); // NEW

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
      const loaded = Object.entries(data).map(([key, complaint]) => ({
        id: key,
        ...complaint,
      }));
      setComplaints(loaded);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handlePhotoClick = (url) => {
    setModalImageUrl(url);
    setShowImageModal(true);
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
          <h2>Complaint History</h2>

          {loading && <p>Loading complaints...</p>}

          <table className="complaints-table">
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Photo</th>
                <th>Replies</th>
              </tr>
            </thead>
            <tbody>
              {!loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id}>
                    <td>{c.ticketNumber}</td>
                    <td>{c.title}</td>
                    <td>{c.category || 'N/A'}</td>
                    <td>{c.status}</td>
                    <td>{c.createdAt ? formatDateTime(c.createdAt) : 'N/A'}</td>
                    <td>
                      {c.photoURL ? (
                        <img
                          src={c.photoURL}
                          alt="Complaint Attachment"
                          style={{
                            maxWidth: '80px',
                            maxHeight: '80px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handlePhotoClick(c.photoURL)}
                        />
                      ) : (
                        'No photo'
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setReplyModalData({ ticket: c.ticketNumber, replies: c.replies })}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <button onClick={() => navigate('/helpdesk')} className="view-history-btn">
              Back to Helpdesk
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowImageModal(false)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(30,40,60,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 0,
              borderRadius: 12,
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <img
              src={modalImageUrl}
              alt="Full view"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: 12,
                display: "block"
              }}
            />
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalData && (
        <div
          className="modal-overlay"
          onClick={() => setReplyModalData(null)}
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
            <h3>Replies for {replyModalData.ticket}</h3>
            <hr />
            {replyModalData.replies ? (
              <ul>
                {Object.values(replyModalData.replies).map((r, i) => (
                  <li key={i} style={{ marginBottom: 12 }}>
                    <strong>{r.senderRole === 'admin' ? '🛡️ Admin' : '👤 You'}:</strong> {r.message}<br />
                    <small style={{ color: '#666' }}>{formatDateTime(r.replyAt)}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontStyle: "italic" }}>No replies available for this complaint.</p>
            )}
            <button
              onClick={() => setReplyModalData(null)}
              style={{
                marginTop: 12,
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                background: "#ccc",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
