import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { auth } from "../../firebase"; // Ensure this is correctly set up
import { sendPasswordResetEmail } from "firebase/auth"; // Import the function
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../../styles";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navi = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email); // Use sendPasswordResetEmail correctly
      Alert.alert(
        "Success",
        "Password reset email sent! Please check your inbox."
      );
    } catch (error) {
      // Improved error handling
      Alert.alert(
        "Error",
        error.message || "Something went wrong, please try again."
      );
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ImageBackground
            source={require("../../assets/bg-hibiscus.png")} // Your image path
            style={[
              styles.background,
              {
                paddingTop:
                  Platform.OS === "ios"
                    ? StatusBar.currentHeight + 50
                    : StatusBar.currentHeight,
              },
            ]}
            resizeMode="cover"
          >
            <Text style={styles.text}>
              Forgot{"\n"}
              Password?
            </Text>
            <StatusBar style="auto" />
            <View
              style={[
                styles.container2,
                {
                  justifyContent: "center",
                  marginHorizontal: 15,
                  flex: 0,
                  paddingVertical: 100,
                  paddingTop: 100,
                },
              ]}
            >
              <Text style={[styles.labelInput]}>Email Address</Text>
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                }}
              >
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#20734f" }]}
                  onPress={() => {
                    handleForgotPassword();
                  }}
                >
                  <Text style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}>
                    Reset Password
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#20734f" }]}
                  onPress={() => {
                    navi.navigate("Login");
                  }}
                >
                  <Text style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}>
                    Back to Login?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ForgotPassword;
