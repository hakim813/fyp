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
      const loaded = Object.entries(data)
        .map(([key, complaint]) => ({ id: key, ...complaint }));
      setComplaints(loaded);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  // Show image modal
  const handlePhotoClick = (url) => {
    setModalImageUrl(url);
    setShowImageModal(true);
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
              </tr>
            </thead>
            <tbody>
              {!loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic' }}>
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
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => navigate('/helpdesk')}
              className="view-history-btn"
            >
              Back to Helpdesk
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(30,40,60,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 0,
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={e => e.stopPropagation()}
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
    </>
  );
}