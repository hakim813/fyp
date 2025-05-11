import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/firebase';  // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth';  // Firebase auth state listener

// Create context for user
export const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);  // This will allow components to access the user object
};

// UserProvider component to wrap your app and provide user state
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
