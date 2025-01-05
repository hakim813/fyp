import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './component/Register';
import Login from './component/Login';
import Home from './component/Home';
import Forum from './component/Forum';
import { UserProvider } from './UserContext';
import CreatePost from './component/CreatePost';
import FinanceManager from './component/FinanceManager';
import CreateFinanceRecord from './component/CreateFinanceRecord';
import FinancialRecord from './component/FinancialRecord';
import LoginSuccessful from './component/LoginSuccessful';
import SignupSuccessful from './component/SignupSuccessful';
import ForgotPassword from './component/ForgotPassword';
import Profile from './component/Profile';

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="SignupSuccessful" component={SignupSuccessful} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="LoginSuccessful" component={LoginSuccessful} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Forum" component={Forum} />
          <Stack.Screen name="CreatePost" component={CreatePost} />
          <Stack.Screen name="FinanceManager" component={FinanceManager} />
          <Stack.Screen name="CreateFinanceRecord" component={CreateFinanceRecord} />
          <Stack.Screen name="FinancialRecord" component={FinancialRecord} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
    
  );
}

export default App;
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { initializeApp } from '@firebase/app';
// import { getDatabase, ref, set, onValue } from '@firebase/database';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, initializeAuth, getReactNativePersistence} from '@firebase/auth';


// const firebaseConfig = {
//   apiKey: "AIzaSyBMbv-NbsAI2W21nahCQaA1W4QAxz5ufGA",
//   projectId: "we-gig",
//   storageBucket: "we-gig.firebasestorage.app",
//   messagingSenderId: "272697260068",
//   appId: "1:272697260068:ios:e23bdd15766c0d601400b1",
//   databaseURL: "https://we-gig-default-rtdb.asia-southeast1.firebasedatabase.app"
//   // measurementId: "YOUR - measurementId"
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// const writeData = () => {
//   const dbRef = ref(database, 'users'); // Path in the database
//   set(dbRef, {
//     username: 'lalalala',
//     email: 'hakim@meow.com'
//   })
//     .then(() => console.log('Data written successfully!'))
//     .catch(error => console.error('Error writing data: ', error));
// };

// const readData = () => {
//   const dbRef = ref(database, 'users/123'); // Path in the database
//   onValue(dbRef, snapshot => {
//     const data = snapshot.val();
//     console.log('User data: ', data);
//   });
// };


// const AuthScreen = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication }) => {
//   return (
//     <View style={styles.authContainer}>
//        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>

//        <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         placeholder="Password"
//         secureTextEntry
//       />
//       <View style={styles.buttonContainer}>
//         <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} color="#3498db" />
//       </View>

//       <View style={styles.bottomContainer}>
//         <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
//           {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
//         </Text>
//       </View>
//     </View>
//   );
// }


// const AuthenticatedScreen = ({ user, handleAuthentication }) => {
//   return (
//     <View style={styles.authContainer}>
//       <Text style={styles.title}>Welcome</Text>
//       <Text style={styles.emailText}>{user.email}</Text>
//       <Button title="Logout" onPress={handleAuthentication} color="#e74c3c" />
//     </View>
//   );
// };
// export default App = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [user, setUser] = useState(null); // Track user authentication state
//   const [isLogin, setIsLogin] = useState(true);

//   const auth = getAuth(app);
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//     });

//     return () => unsubscribe();
//   }, [auth]);

  
//   const handleAuthentication = async () => {
//     try {
//       if (user) {
//         // If user is already authenticated, log out
//         console.log('User logged out successfully!');
//         await signOut(auth);
//       } else {
//         // Sign in or sign up
//         if (isLogin) {
//           // Sign in
//           await signInWithEmailAndPassword(auth, email, password);
//           console.log('User signed in successfully!');
//         } else {
//           // Sign up
//           await createUserWithEmailAndPassword(auth, email, password);
//           console.log('User created successfully!');
//           writeData();
//         }

//       }
//     } catch (error) {
//       console.error('Authentication error:', error.message);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {user ? (
//         // Show user's email if user is authenticated
//         <AuthenticatedScreen user={user} handleAuthentication={handleAuthentication} />
//       ) : (
//         // Show sign-in or sign-up form if user is not authenticated
//         <AuthScreen
//           email={email}
//           setEmail={setEmail}
//           password={password}
//           setPassword={setPassword}
//           isLogin={isLogin}
//           setIsLogin={setIsLogin}
//           handleAuthentication={handleAuthentication}
//         />
//       )}
//     </ScrollView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#f0f0f0',
//   },
//   authContainer: {
//     width: '80%',
//     maxWidth: 400,
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   input: {
//     height: 40,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     marginBottom: 16,
//     padding: 8,
//     borderRadius: 4,
//   },
//   buttonContainer: {
//     marginBottom: 16,
//   },
//   toggleText: {
//     color: '#3498db',
//     textAlign: 'center',
//   },
//   bottomContainer: {
//     marginTop: 20,
//   },
//   emailText: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });