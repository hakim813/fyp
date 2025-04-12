import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { Alert, Text, View, Platform, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import styles from '../styles';
import { general } from '../general';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, getDatabase, get, child } from "firebase/database";

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

    useEffect(() => {
      console.log('Signup page');
    }, []);

    const handleAuthentication = async () => {
        try {
            // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // const user = userCredential.user;
            
            //ensuring no missing field when submit
            if(!username || !email || !idNo || !password || !confirmPassword){ 
              Alert.alert("Fill in the field.");
              console.log("Email:     ", email? email:'missing');
              console.log("NRIC:      ", idNo?idNo:'missing');
              console.log("Pass:      ", password?password:'missing');
              console.log("ConfirmPW: ", confirmPassword?confirmPassword:'missing');
              return;
            }

             //verify the password and confirm password match
            if(password!=confirmPassword){
              Alert.alert("Password doesn't match.");
              return;
            }

            //firebase config
            const db = getDatabase();
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, 'users'));

            if (snapshot.exists()) {
              const users = snapshot.val(); // Get all users from the database
              const idExist = Object.values(users).find(user => user.nricId === idNo); // Check if any user has the same NRIC
              const emailExist = Object.values(users).find(user => user.email === email); // Check if any user has the same email
          
              // If a user with the same email exists
              if (emailExist){
                Alert.alert("Email already taken. Please use a different one.");
                return;
              }
              // If a user with the same NRIC exists
              else if (idExist) {
                Alert.alert("NRIC already taken. Please use a different one.");
                return;
              }
              else{
                const userCredential = await createUserWithEmailAndPassword(auth, email, password); //use firebase func to auth user
                const user = userCredential.user;
                writeData(user, idNo, username);
                navi.navigate('SignupSuccessful');
              }
            }
            // else{
            //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            //   const user = userCredential.user;
            //   writeData(user, idNo, username);
            //   navi.navigate('SignupSuccessful')
            // }

        } catch (error) {
          console.error('Authentication error:', error.message);
        }
      };

    return (
      <View style={styles.container}>
        <Text style={styles.text}>Create Your Account</Text>
        <StatusBar style="auto" />
        <KeyboardAvoidingView
          style={[styles.container2, { opacity: 0.5}]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <Text style={general.labelInput}>Username</Text>
            <TextInput
              style={general.input}
              placeholder="Example : Ali bin Abu"
              value={username}
              onChangeText={setUsername}
            />
    
            <Text style={general.labelInput}>Email Address</Text>
            <TextInput
              style={general.input}
              placeholder="Example : user123@mail.com"
              value={email}
              onChangeText={setEmail}
            />
    
            <Text style={general.labelInput}>NRIC ID</Text>
            <TextInput
              style={general.input}
              placeholder="Example : 030108011234"
              value={idNo}
              onChangeText={setIdNo}
            />
    
            <Text style={general.labelInput}>Password</Text>
            <TextInput
              style={general.input}
              secureTextEntry={true}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
            />
    
            <Text style={general.labelInput}>Confirm Password</Text>
            <TextInput
              style={general.input}
              secureTextEntry={true}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
    
            <TouchableOpacity style={styles.button} onPress={() => handleAuthentication()}>
              <Text style={{ color: '#fdfdfd', fontWeight: 'bold' }}>Register</Text>
            </TouchableOpacity>
            <Text style={styles.texttosignin}>
              Already have an account?{' '}
              <Text style={{ fontWeight: 'bold' }} onPress={() => navi.navigate('Login')}>
                Jump to Sign In!
              </Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );    
}