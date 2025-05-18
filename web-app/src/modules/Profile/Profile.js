import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import '../../styles/profile.css';
import Navbar from '../../components/Navbar';

const Profile = () => {
    const [userData, setUserData] = useState({});
    const [completionPercentage, setCompletionPercentage] = useState(0);

    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();

    const fetchData = () => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    
                    // Include the authenticated email in the userData object
                    setUserData({
                        ...data,
                        email: user.email // Fetch email directly from Firebase Auth
                    });

                    calculateCompletion({
                        ...data,
                        email: user.email
                    });
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]); // Re-fetch data whenever `user` changes

    const calculateCompletion = (data) => {
        const fields = [
            data.fullName, data.nric, data.email, data.phone, 
            data.gender, data.dob, data.profilePhoto, data.verificationDocument
        ];
        const filledFields = fields.filter(field => field && field !== "").length;
        const percentage = Math.round((filledFields / fields.length) * 100);
        setCompletionPercentage(percentage);
    };

    return (
        <>
            <Navbar />

            <div className="profile-container">
                <h2>Profile</h2>
                <div className="profile-content">
                    <img 
                        src={userData.profilePhoto || "/default-profile.png"} 
                        alt="Profile" 
                        className="profile-photo" 
                    />
                    <div className="profile-details">
                        <p><strong>Full Name:</strong> {userData.fullName || "Not provided"}</p>
                        <p><strong>NRIC:</strong> {userData.nric || "Not provided"}</p>
                        <p><strong>Email:</strong> {user.email || "Not provided"}</p>
                        <p><strong>Phone:</strong> {userData.phone || "Not provided"}</p>
                        <p><strong>Gender:</strong> {userData.gender || "Not provided"}</p>
                        <p><strong>Date of Birth:</strong> {userData.dob || "Not provided"}</p>
                        <p><strong>Verification Status:</strong> {userData.verified ? "Verified" : "Pending"}</p>
                    </div>
                    <div className="profile-completion">
                        <p>Profile Completion: {completionPercentage}%</p>
                        <div className="progress-bar">
                            <div 
                                className="progress" 
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <Link to="/edit-profile">
                        <button className="edit-btn">Edit Profile</button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Profile;
