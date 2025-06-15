import React, { useState, useEffect } from "react";
import {
  Alert,
  Text,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  ImageBackground,
} from "react-native";
import styles from "../../styles";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, getDatabase, get, child } from "firebase/database";

// const auth = getAuth();

const writeData = (user, idNo, username) => {
  const usersRef = ref(database, "users/" + user.uid); // Parent path where data will be stored
  set(usersRef, {
    username: username,
    email: user.email,
    nricId: idNo,
  })
    .then(() =>
      console.log(`User with email ${user.email} registered successfully!`)
    )
    .catch((error) => console.error("Error writing data: ", error));
};

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [idNo, setIdNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordRule = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  // At least 8 characters, one uppercase letter, one number
  const navi = useNavigation();

  const handleAuthentication = async () => {
    try {
      //ensuring no missing field when submit
      if (!username || !email || !idNo || !password || !confirmPassword) {
        Alert.alert("Missing field", "Please fill in all fields.");

        return;
      }

      if (!isValidEmail(email)) {
        Alert.alert(
          "Invalid email format.",
          "Please enter a valid email address."
        );
        return;
      }

      if (!passwordRule.test(password)) {
        Alert.alert(
          "Password must be at least 8 characters, include an uppercase letter and a number."
        );
        return;
      }

      //verify the password and confirm password match
      if (password != confirmPassword) {
        Alert.alert("Password doesn't match.");
        return;
      }

      //firebase config
      const db = getDatabase();
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "users"));

      if (snapshot.exists()) {
        const users = snapshot.val(); // Get all users from the database
        const idExist = Object.values(users).find(
          (user) => user.nricId === idNo
        ); // Check if any user has the same NRIC
        const emailExist = Object.values(users).find(
          (user) => user.email === email
        ); // Check if any user has the same email

        if (emailExist) {
          // If a user with the same email exists
          Alert.alert("Email already taken. Please use a different one.");
          return;
        } else if (idExist) {
          // If a user with the same NRIC exists
          Alert.alert("NRIC already taken. Please use a different one.");
          return;
        } else {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          ); //use firebase func to auth user
          const user = userCredential.user;
          writeData(user, idNo, username);
          navi.navigate("SignupSuccessful");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
    }
  };

  return (
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
        {/* <LinearGradient
        colors={["#03633a", "#95f6cc"]} // start to end gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            paddingTop:
              Platform.OS === "ios"
                ? StatusBar.currentHeight + 50
                : StatusBar.currentHeight,
          },
        ]}
      > */}
        <Text style={styles.text}>Create Your Account</Text>
        <StatusBar style="auto" />
        <KeyboardAvoidingView
          style={[
            styles.container2,
            { marginHorizontal: 15, minHeight: 660, flex: 0 },
          ]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.labelInput}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Example : Ali bin Abu"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.labelInput}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Example : user123@mail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.labelInput}>NRIC ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Example : 030108011234"
              value={idNo}
              onChangeText={setIdNo}
            />

            <Text style={styles.labelInput}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={true}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.labelInput}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={true}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#20734f", paddingHorizontal: 40 },
              ]}
              onPress={() => handleAuthentication()}
            >
              <Text
                style={{
                  color: "#fdfdfd",
                  fontFamily: "Nunito-Bold",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                Register
              </Text>
            </TouchableOpacity>
            <Text style={styles.texttosignin}>
              Already have an account?{" "}
              <Text
                style={{ fontWeight: "bold" }}
                onPress={() => navi.navigate("Login")}
              >
                Jump to Sign In!
              </Text>
            </Text>
            <View
              style={{
                maxHeight: 80,
                alignItems: "center",
                marginTop: "auto",
                marginBottom: 20,
              }}
            >
              {/* <Image
                source={require("../../assets/WeGig.png")} // local image
                style={[styles.image]}
                resizeMode="center" // or 'cover', 'stretch', etc.
                maxHeight={80} // set a max height for the image
                maxWidth={300} // set a max width for the image
              /> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
