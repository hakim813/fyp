// Import the necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";  // For Firebase Authentication
import { getDatabase } from "firebase/database";  // For Firebase Realtime Database
import { getStorage } from "firebase/storage";  // For Firebase Storage

// Firebase Web App configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBlH4sF2ZWiFdMcpiekB8guGUSNUOgLc80",
  authDomain: "we-gig.firebaseapp.com",
  databaseURL: "https://we-gig-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "we-gig",
  storageBucket: "we-gig.firebasestorage.app",
  messagingSenderId: "272697260068",
  appId: "1:272697260068:web:a2d6c3f5c3ffa53c1400b1",
  measurementId: "G-66L8KB8DF2" // Optional if you want Firebase Analytics
};

// Initialize Firebase with the provided config
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Set persistence to local storage (for web persistence)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Persistence has been set successfully
  })
  .catch((error) => {
    console.error("Error setting persistence:", error.message);
  });

// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export the services to use in other parts of the app
export { auth, database, storage };
