import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { SafeAreaView, Alert, StyleSheet, Text, View, Platform, TextInput, Button, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import styles from '../styles';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { ref, set, push, getDatabase, get, child } from "firebase/database";

const writeData = (user, idNo, username) => {
  const usersRef = ref(database, 'users/' + user.uid); // Parent path where data will be stored
  set(usersRef, {
    username: username,
    email: user.email,
    nricId: idNo
  })
    .then(() => console.log('Data written successfully!'))
    .catch(error => console.error('Error writing data: ', error));
};

export default function Register(){
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [user,setUser] = useState(null);
    const [idNo, setIdNo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navi = useNavigation();

    console.log('Signup page');

    const handleAuthentication = async () => {
        try {
            // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // const user = userCredential.user;
            
            if(!username || !email || !idNo || !password || !confirmPassword){
              Alert.alert("Fill in the field.");
              console.log("Email:     ", email? email:'missing');
              console.log("NRIC:      ", idNo?idNo:'missing');
              console.log("Pass:      ", password?password:'missing');
              console.log("ConfirmPW: ", confirmPassword?confirmPassword:'missing');
              return;
            }

            if(password!=confirmPassword){
              Alert.alert("Password and confirmed password doesnt match.");
              return;
            }

            const db = getDatabase(); // Initialize Firebase Realtime Database
            const dbRef = ref(db); // Reference to the database
            const snapshot = await get(child(dbRef, 'users'));

            if (snapshot.exists()) {
              const users = snapshot.val(); // Get all users from the database
              const existingUser = Object.values(users).find(user => user.nricId === idNo); // Check if any user has the same NRIC
          
              if (existingUser) {
                // If a user with the same NRIC exists
                Alert.alert("NRIC already exists. Please use a different one.");
                return;
              }
              else{
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                writeData(user, idNo, username);
                navi.navigate('Login');
              }
            }
            else{
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;
              writeData(user, idNo, username);
              navi.navigate('Login');
            }

            // await sendEmailVerification(user);
            // console.log('Verification email sent to:', user.email);
            // writeData(user, idNo);
        } catch (error) {
          console.error('Authentication error:', error.message);
        }
      };

    return (
        <KeyboardAvoidingView 
          style={styles.container3}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
        <View style={styles.container}>
            <Text style={styles.text}>Create Your
              Account
            </Text>
            <StatusBar style="auto"/>
            <View style={styles.container2}>

              <Text style={styles.labelInput}>
                  Username
              </Text>
              <TextInput
                  style={styles.input}
                  placeholder="Example : Ali bin Abu"
                  value={username}
                  onChangeText={setUsername}
              />

              <Text style={styles.labelInput}>
                  Email Address
              </Text>
              <TextInput
                  style={styles.input}
                  placeholder="Example : user123@mail.com"
                  value={email}
                  onChangeText={setEmail}
              />

              <Text style={styles.labelInput}>
                  NRIC ID
              </Text>
              <TextInput
                  style={styles.input}
                  placeholder="Example : 030108011234"
                  value={idNo}
                  onChangeText={setIdNo}
              /> 

              <Text style={styles.labelInput}>
                  Password    
              </Text>
              <TextInput
                  style={styles.input}
                  secureTextEntry={true} 
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
              /> 

              <Text style={styles.labelInput}>
                          Confirm Password
              </Text>
              <TextInput
                  style={styles.input}
                  secureTextEntry={true} 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.button} onPress={()=>{handleAuthentication(), navi.navigate('LoginSuccessful')}}>
                  <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Register</Text>
              </TouchableOpacity>
              <Text style={styles.texttosignin}>Already have an account?  
                  <Text style={{fontWeight: 'bold'}} onPress={()=>navi.navigate('Login')}> Jump to Sign In!</Text>
              </Text>
            </View>
        </View>
        </KeyboardAvoidingView>
    );
}