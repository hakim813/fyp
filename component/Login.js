import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { SafeAreaView, Alert, StyleSheet, Text, View, Platform, TextInput, Button, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

export default function Login(){
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const navi = useNavigation();

    const handleSubmit = async () => {
        try {
            if(email == '' || pw == ''){
                Alert.alert(`Please fill in the field.`);
            }
    
            else{
                await signInWithEmailAndPassword(auth, email, pw);
                console.log('Logged in');
                navi.navigate('Home');
            }
          } catch (error) {
            console.error("Error during login:", error.message);
            Alert.alert("Error", error.message=="Firebase: Error (auth/invalid-credential)."? "Invalid credential" : error.message);
          }
        

        
    };

    // const [inputValue, setInputValue] = useState('');

    return (
        <View style={styles.container3}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>
                    Welcome{"\n"}
                    to Our Apps!
                </Text>
                <StatusBar style="auto" />
                <View style={styles.container2}>

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
                        Password    
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={pw}
                        onChangeText={setPw}
                    />
                    {/* <Button title="Click Me"></Button> */}
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Log in</Text>
                    </TouchableOpacity>
                    <Text style={styles.texttosignin}>Already have an account? 
                        <Text style={{fontWeight: 'bold'}} onPress={()=>navi.navigate('Register')}>Jump in to Sign in!</Text>
                    </Text>
                    <Text style={styles.texttosignin} onPress={() => navi.navigate('Home')}>
                        Forgot Password?
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}