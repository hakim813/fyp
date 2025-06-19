import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/firebase'; // Adjust if needed
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

// Create context for user
export const UserContext = createContext(null);

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

// Provider to wrap your app and supply user state
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const db = getDatabase();
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              ...firebaseUser,
              fullName: userData.fullName || "",
              isAdmin: userData.isAdmin || false,
              // add more custom fields if needed
            });
          } else {
            // fallback if user data not found in DB
            setUser({
              ...firebaseUser,
              isAdmin: false,
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser({
            ...firebaseUser,
            isAdmin: false,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};
