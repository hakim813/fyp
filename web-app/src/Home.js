import React from 'react';
import { signOut } from 'firebase/auth';  // Firebase sign-out function
import { auth } from './firebase';  // Import Firebase auth
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirection

function Home() {
  const navigate = useNavigate();  // Initialize useNavigate for redirecting after logout

  const handleLogout = async () => {
    try {
      await signOut(auth);  // Sign out the user from Firebase
      console.log("User logged out successfully");

      // Redirect to the Login page after logging out
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div>
      <h1>Welcome {auth.currentUser ? auth.currentUser.email : 'Guest'}</h1>
      <button onClick={handleLogout}>Log Out</button>
      <p>This is the Home page!</p>
    </div>
  );
}

export default Home;
