import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Platform, TouchableWithoutFeedback, Keyboard, StatusBar } from 'react-native';
import { auth } from '../firebase'; // Ensure this is correctly set up
import { sendPasswordResetEmail } from 'firebase/auth'; // Import the function
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navi = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email); // Use sendPasswordResetEmail correctly
      Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
    } catch (error) {
      // Improved error handling
      Alert.alert('Error', error.message || 'Something went wrong, please try again.');
    }
  };

//   return (
//     <View style={{ padding: 20 }}>
//       <Text style={{ fontSize: 24, marginBottom: 20 }}>Forgot Password</Text>
//       <TextInput
//         placeholder="Enter your email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         style={{
//           height: 40,
//           borderColor: 'gray',
//           borderWidth: 1,
//           marginBottom: 20,
//           paddingHorizontal: 10,
//         }}
//       />
//       <Button title="Reset Password" onPress={handleForgotPassword} />
//       <Button title="Back to Login" onPress={()=>navi.navigate('Login')} />
//     </View>
//   );

return (
        <View 
            style={styles.container3}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.text}>
                    Forgot{"\n"}
                    Password?
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

                    {/* <Text style={styles.labelInput}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        secureTextEntry={true}
                        value={pw}
                        onChangeText={setPw}
                    /> */}
                    {/* <Button title="Click Me"></Button> */}
                    <TouchableOpacity style={styles.button} onPress={()=>{handleForgotPassword()}}>
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Reset Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={()=>{navi.navigate('Login')}}>
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Back to Login?</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default ForgotPassword;

