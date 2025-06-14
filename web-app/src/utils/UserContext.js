import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/firebase'; // Adjust the path if needed
import { onAuthStateChanged } from 'firebase/auth';

// Create context for user
export const UserContext = createContext(null);

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

// UserProvider component to wrap your app and provide user state
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Optionally, show a loading spinner or null while checking auth state
    return null;
  }

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};