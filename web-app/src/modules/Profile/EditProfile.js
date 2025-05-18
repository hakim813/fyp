import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import '../../styles/editProfile.css';
import Navbar from '../../components/Navbar';

const EditProfile = () => {
    const [userData, setUserData] = useState({
        fullName: "",
        nric: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        profilePhoto: "",
        verificationDocument: ""
    });

    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();
    const storage = getStorage();

    useEffect(() => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setUserData({ ...data, email: user.email });
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });
        }
    }, [user, db]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = () => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            update(userRef, userData)
                .then(() => {
                    alert("Profile updated successfully!");
                    navigate("/profile");
                })
                .catch((error) => {
                    console.error("Error updating profile:", error);
                });
        }
    };

    const handleCancel = () => {
        navigate("/profile");
    };

    return (
        <>
            <Navbar />
            <div className="edit-profile-page edit-profile-container">
                <div className="form-section">
                    <h3>Personal Information</h3>
                    <div className="form-group">
                        <label>Full Name:</label>
                        <input type="text" name="fullName" value={userData.fullName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>NRIC:</label>
                        <input type="text" name="nric" value={userData.nric} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" value={userData.email} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Phone:</label>
                        <input type="text" name="phone" value={userData.phone} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-group">
                        <label>Gender:</label>
                        <select name="gender" value={userData.gender} onChange={handleInputChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date of Birth:</label>
                        <input type="date" name="dob" value={userData.dob} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="upload-section">
                    <label>Profile Photo:</label>
                    <input type="file" name="profilePhoto" onChange={(e) => handleInputChange(e, 'profilePhoto')} />

                    <label>Verification Document:</label>
                    <input type="file" name="verificationDocument" onChange={(e) => handleInputChange(e, 'verificationDocument')} />
                </div>

                <div className="button-group">
                    <button className="edit-btn" onClick={handleSubmit}>Update Profile</button>
                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </>
    );
};

export default EditProfile;
