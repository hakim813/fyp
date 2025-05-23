import React, { createContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Create the context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // const user = { email: "test@gmail.com", nricId: "12345", username: "Hakim" };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set user data if logged in
      } else {
        setUser(null); // Set null if not logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, []);

  // setUser({ email: "test@gmail.com", nricId: "12345", username: "Hakim" });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
