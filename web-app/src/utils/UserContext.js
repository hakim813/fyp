import React, { createContext, useState, useEffect } from 'react';
import { auth, database, storage } from '../firebase/firebase';  // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth';  // Firebase auth state listener


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);  // Set the authenticated user
      } else {
        setUser(null);  // Set user to null if no one is authenticated
      }
    });

    return unsubscribe;  // Cleanup the listener on unmount
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};
