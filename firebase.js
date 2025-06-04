import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// import { getAuth } from "firebase/auth";
// import  from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMbv-NbsAI2W21nahCQaA1W4QAxz5ufGA",
  projectId: "we-gig",
  storageBucket: "we-gig.firebasestorage.app", // <- fix here
  messagingSenderId: "272697260068",
  appId: "1:272697260068:ios:e23bdd15766c0d601400b1",
  databaseURL:
    "https://we-gig-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// ✅ Only initialize if no apps already exist
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = getAuth();
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
export { auth };

// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });
