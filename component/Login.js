import { StatusBar } from 'expo-status-bar';
import React, {useState, useContext, useEffect} from 'react';
import { Alert, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import styles from '../styles';
import { auth } from '../firebase';
import { signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';

export default function Login(){

    useEffect(() => { //verify only console log once when loggeed in
        console.log('Login page');
      }, []);

    const [email, setEmail] = useState('test@gmail.com');
    const [pw, setPw] = useState('test123');
    const navi = useNavigation();
    const { setUser } = useContext(UserContext);

    const handleSubmit = async () => {
        try {
            //verify no missing 
            if(email == '' || pw == ''){
                Alert.alert(`Please fill in the field.`);
            }
            else{ //if okay, user can login
                const userCredential = await signInWithEmailAndPassword(auth, email, pw);
                const user = userCredential.user;
                setUser(user);

                console.log('Logged in');
                navi.navigate('LoginSuccessful')
            }
          } catch (error) {
            console.error("Error during login:", error.message);
            Alert.alert("Error", error.message=="Firebase: Error (auth/invalid-credential)."? "Invalid credential" : error.message);
          }        
    };

    // const [inputValue, setInputValue] = useState('');

    return (
        <View 
            style={styles.container3}
            >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.text}>
                    Welcome{"\n"}to WeGig!
                </Text>
                <StatusBar style="auto" />
                <View style={styles.container2}>
                    <Text style={styles.labelInput}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Example : user123@mail.com"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.labelInput}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        secureTextEntry={true}
                        value={pw}
                        onChangeText={setPw}
                    />
                    {/* <Button title="Click Me"></Button> */}
                    <TouchableOpacity style={styles.button} onPress={()=>{handleSubmit()}}>
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Log in</Text>
                    </TouchableOpacity>
                    <Text style={styles.texttosignin}>No account?  
                        <Text style={{fontWeight: 'bold'}} onPress={()=>navi.navigate('Register')}> Sign up now!</Text>
                    </Text>
                    <Text style={styles.texttosignin} onPress={()=>{navi.navigate('ForgotPassword')}}>
                        Forgot Password?
                    </Text>
                </View>
            </View>
            </TouchableWithoutFeedback>
        </View>
    );
}