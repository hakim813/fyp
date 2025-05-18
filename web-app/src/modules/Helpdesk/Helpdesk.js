import React, { useState } from 'react';
import '../../styles/helpdesk.css'; // Import your CSS file for styling
import Navbar from '../../components/Navbar'; // Import Navbar
import Sidebar from '../../components/Sidebar'; // Import Sidebar
import { useNavigate } from 'react-router-dom';

const Helpdesk = () => {
  const [complaints, setComplaints] = useState([
    { id: '#12512B', date: 'May 5, 4:20 PM', title: 'Title 1', description: 'This is the description of the complaint...', status: 'Waiting for reply' },
    { id: '#12523C', date: 'May 5, 4:15 PM', title: 'Title 2', description: 'This is the description of the complaint...', status: 'Waiting for reply' },
    { id: '#51232A', date: 'May 5, 4:15 PM', title: 'Title 3', description: 'This is the description of the complaint...', status: 'Waiting for reply' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', file: null });
  const navigate = useNavigate();
  
  

  const sidebarButtons = [
    { path: '/helpdesk', label: 'Dashboard' },
    { path: '/helpdesk/history', label: 'History' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComplaint({ ...newComplaint, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewComplaint({ ...newComplaint, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Complaint Submitted:', newComplaint);
    setIsFormOpen(false);
  };

  return (
    <div className="helpdesk-page">
      <Navbar /> {/* Add Navbar */}
      <div className="helpdesk-container">
        <Sidebar buttons={sidebarButtons} /> {/* Pass buttons prop */}
        
        <div className="helpdesk-content">
          <h2>Dashboard</h2>
          {isFormOpen ? (
            <form className="complaint-form" onSubmit={handleSubmit}>
              <h3>New Complaint</h3>
              <label>
                Title
                <input
                  type="text"
                  name="title"
                  value={newComplaint.title}
                  onChange={handleInputChange}
                  placeholder="Title"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={newComplaint.description}
                  onChange={handleInputChange}
                  placeholder="Description of problem"
                  required
                />
              </label>
              <label>
                Attach Media
                <input type="file" onChange={handleFileChange} />
              </label>
              <div className="form-buttons">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setIsFormOpen(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="ongoing-complaints">
                <h3>Ongoing Complaints</h3>
                {complaints.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket No.</th>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>{complaint.id}</td>
                          <td>{complaint.date}</td>
                          <td>{complaint.title}</td>
                          <td>{complaint.description}</td>
                          <td>{complaint.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No ongoing complaints.</p>
                )}
              </div>
              <button className="new-complaint-btn" onClick={() => setIsFormOpen(true)}>
                + New Complaint
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;