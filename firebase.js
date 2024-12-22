import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from '@firebase/app';
import { getDatabase, ref, set, onValue } from '@firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, initializeAuth, getReactNativePersistence} from '@firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyBMbv-NbsAI2W21nahCQaA1W4QAxz5ufGA",
    projectId: "we-gig",
    storageBucket: "we-gig.firebasestorage.app",
    messagingSenderId: "272697260068",
    appId: "1:272697260068:ios:e23bdd15766c0d601400b1",
    databaseURL: "https://we-gig-default-rtdb.asia-southeast1.firebasedatabase.app"
    // measurementId: "YOUR - measurementId"
  };

  const app = initializeApp(firebaseConfig);
  export const database = getDatabase(app);
  export const auth = initializeAuth(app, {
                        persistence: getReactNativePersistence(AsyncStorage),
                    });