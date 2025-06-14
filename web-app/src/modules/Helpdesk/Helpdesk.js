import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, update } from 'firebase/database';
import Navbar from '../../components/Navbar';
import ComplaintForm from './ComplaintForm';
import '../../styles/helpdesk.css';
import { useNavigate } from 'react-router-dom';

const Helpdesk = () => {
  const [ongoingComplaints, setOngoingComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
        .filter(([key, complaint]) => complaint.status === 'ongoing')
        .map(([key, complaint]) => ({ id: key, ...complaint }));
      setOngoingComplaints(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  // Mark complaint as resolved
  const handleResolve = (complaintId) => {
    if (!complaintId) return;
    if (!window.confirm('Are you sure you want to mark this complaint as resolved?')) return;

    const complaintRef = ref(db, `complaints/${complaintId}`);
    update(complaintRef, { status: 'resolved' })
      .catch(err => {
        alert('Failed to update complaint status.');
        console.error(err);
      });
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
                <th>Ticket Number</th>
                <th>Title</th>
                <th>Category</th> {/* Added Category column */}
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Photo</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && ongoingComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No ongoing complaints.
                  </td>
                </tr>
              ) : (
                ongoingComplaints.map(c => (
                  <tr key={c.id}>
                    <td>{c.ticketNumber}</td>
                    <td>{c.title}</td>
                    <td>{c.category || 'N/A'}</td> {/* Show category */}
                    <td>{c.status}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      {c.photoURL ? (
                        <img
                          src={c.photoURL}
                          alt="Complaint Attachment"
                          style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px' }}
                        />
                      ) : (
                        'No photo'
                      )}
                    </td>
                    <td>
                      <button
                        className="resolve-btn"
                        onClick={() => handleResolve(c.id)}
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setShowForm(true)} className="submit-complaint-btn">
              Submit Complaint
            </button>{' '}
            <button
              onClick={() => navigate('/helpdesk/history')}
              className="view-history-btn"
            >
              View History
            </button>
          </div>

          {showForm && <ComplaintForm onClose={closeForm} />}
        </div>
      </div>
    </>
  );
};

export default Helpdesk;
