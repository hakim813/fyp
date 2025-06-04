// import { initializeApp } from "firebase/app";
// import {
//   getAuth,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
// } from "firebase/auth";
// import { useState, useEffect } from "react";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAzeNtdKXWmeivvT9oIFqF61AishhnC9jA",
//   authDomain: "wegigmy.firebaseapp.com",
//   projectId: "wegigmy",
//   storageBucket: "wegigmy.firebasestorage.app",
//   messagingSenderId: "528556423057",
//   appId: "1:528556423057:web:3014184d1541d649870c30",
//   measurementId: "G-R09CFD6KPC",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const Test = () => {
//   const [user, setUser] = useState(null); // State to hold the authenticated user

//   useEffect(() => {
//     const auth = getAuth(app);

//     // Set up listener for auth state changes (user login/out)
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         console.log("User logged in:", user);
//         setUser(user); // Set user state if logged in
//       } else {
//         console.log("No user logged in");
//         setUser(null); // Set user state to null if logged out
//       }
//     });

//     // Clean up the listener on component unmount
//     return () => unsubscribe();
//   }, []);

//   const handleSignIn = () => {
//     const auth = getAuth(app);
//     const email = "user@example.com"; // Example email
//     const password = "yourPassword"; // Example password

//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;
//         console.log("User signed in:", user);
//         setUser(user); // Update state with logged-in user
//       })
//       .catch((error) => {
//         console.error("Error signing in:", error.message);
//       });
//   };

//   const handleSignOut = () => {
//     const auth = getAuth(app);
//     signOut(auth)
//       .then(() => {
//         console.log("User signed out");
//         setUser(null); // Clear user state
//       })
//       .catch((error) => {
//         console.error("Error signing out:", error.message);
//       });
//   };

//   return (
//     <div>
//       <h1>Firebase Authentication Example</h1>

//       {/* Display the current user */}
//       {user ? (
//         <div>
//           <p>Welcome, {user.email}!</p>
//           <button onClick={handleSignOut}>Sign Out</button>
//         </div>
//       ) : (
//         <div>
//           <button onClick={handleSignIn}>Sign In</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Test;
