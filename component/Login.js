import React, {useState, useContext} from 'react';
import { Alert, Text, Platform, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StatusBar } from 'react-native';
import styles from '../styles';
import { auth } from '../firebase';
import { signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login(){

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

                console.log('User have logged in successfully!');
                console.log('User : ', user);
                navi.navigate('LoginSuccessful')
            }
        } catch (error) {
            console.error("Error during login:", error.message);
            Alert.alert("Error", error.message=="Firebase: Error (auth/invalid-credential)."? "Invalid credential" : error.message);
        }        
    };

    return (
        <View style={styles.container3}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <LinearGradient
                        colors={['#03633a', '#95f6cc']} // start to end gradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.container, {paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight+50 : StatusBar.currentHeight}]}
                    >
                        <Text style={styles.text}>
                            Login to your{"\n"}WeGig account!
                        </Text>
                        <StatusBar style="auto" />
                        <View style={[styles.container2,{marginHorizontal: 15, flex: 0}]}>
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
                            <Text style={styles.texttosignin}>
                                No account?  
                                <Text style={{fontWeight: 'bold'}} onPress={()=>navi.navigate('Register')}> Sign up now!</Text>
                            </Text>
                            <Text style={styles.texttosignin} onPress={()=>{navi.navigate('ForgotPassword')}}>
                                Forgot Password?
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}