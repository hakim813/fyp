import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, remove } from 'firebase/database';
import Navbar from '../../components/Navbar';
import '../../styles/helpdesk.css';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const complaintsRef = ref(db, 'complaints');
    const userComplaintsQuery = query(complaintsRef, orderByChild('userId'), equalTo(user.uid));

    const unsubscribe = onValue(userComplaintsQuery, snapshot => {
      const data = snapshot.val() || {};
      const complaintList = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
      setComplaints(complaintList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      const complaintRef = ref(db, `complaints/${id}`);
      remove(complaintRef).catch(err => {
        alert('Failed to delete complaint.');
        console.error(err);
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="helpdesk-container">
        <h2>Complaint History</h2>

        <button 
          onClick={() => navigate('/helpdesk')} 
          className="back-btn"
        >
          &larr; Back
        </button>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && complaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                  No complaints submitted yet.
                </td>
              </tr>
            ) : (
              complaints.map(c => (
                <tr key={c.id}>
                  <td>{c.ticketNumber}</td>
                  <td>{c.title}</td>
                  <td>{c.category || 'N/A'}</td> {/* Display category */}
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
                    <button className="delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default History;
