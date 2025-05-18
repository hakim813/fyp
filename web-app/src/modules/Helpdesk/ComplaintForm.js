import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../../styles/helpdesk.css';

const ComplaintForm = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Platform Issue'); // Default selected
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');

  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();
  const user = auth.currentUser;

  const generateTicketNumber = () => 'TICK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const uploadPhotoAndGetURL = async (file, ticketNumber) => {
    const photoRef = storageRef(storage, `complaints/${ticketNumber}/${file.name}`);
    await uploadBytes(photoRef, file);
    const url = await getDownloadURL(photoRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!user) {
      setError('User not authenticated.');
      return;
    }

    const ticketNumber = generateTicketNumber();
    const complaintRef = ref(db, 'complaints');
    const newComplaintRef = push(complaintRef);

    let photoURL = '';
    if (photoFile) {
      try {
        photoURL = await uploadPhotoAndGetURL(photoFile, ticketNumber);
      } catch (err) {
        console.error('Photo upload failed:', err);
        setError('Failed to upload photo.');
        return;
      }
    }

    const complaintData = {
      userId: user.uid,
      ticketNumber,
      title,
      description,
      category,
      photoURL,
      status: 'ongoing',
      createdAt: Date.now(),
    };

    set(newComplaintRef, complaintData)
      .then(() => {
        alert(`Complaint submitted! Your ticket number is ${ticketNumber}`);
        onClose();
      })
      .catch(err => {
        setError('Failed to submit complaint. Please try again.');
        console.error(err);
      });
  };

  return (
    <div className="complaint-form-overlay">
      <div className="complaint-form-container">
        <h3>Submit a Complaint</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Complaint Category:
            <select value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="Platform Issue">Platform Issue</option>
              <option value="Safety and Security">Safety and Security</option>
              <option value="Vendor Issue">Vendor Issue</option>
              <option value="Incidents">Incidents</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Title:
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </label>

          <label>
            Description:
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              rows={5}
            />
          </label>

          <label>
            Upload Photo (optional):
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>

          {error && <p className="error-msg">{error}</p>}

          <div className="form-buttons">
            <button type="submit" className="submit-btn">Submit</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
