import { useState, useContext } from "react";
import {
  Alert,
  Text,
  Platform,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ImageBackground,
} from "react-native";
import styles from "../../styles";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../UserContext";
// import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navi = useNavigation();
  const { user, setUser } = useContext(UserContext);

  const adminEmail = "admin@wegig.com";

  const handleSubmit = async () => {
    try {
      // console.log(adminEmail);
      if (email == adminEmail) {
        Alert.alert(`Invalid credential`);
        return;
      }

      //verify no missing
      if (email == "" || pw == "") {
        Alert.alert(`Please fill in the field.`);
        return;
      } else {
        //if okay, user can login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          pw
        );
        const user = userCredential.user;
        setUser(user);

        console.log(
          `User with email ${user.email} have logged in successfully!`
        );
        navi.navigate("LoginSuccessful");
      }
    } catch (error) {
      // console.error("Error during login:", error.message);
      Alert.alert(
        "Error",
        "Firebase: Error (auth/invalid-credential)."
          ? "Invalid credential"
          : "Error during authentication"
      );
    }
  };

  return (
    <View style={styles.container3}>
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
            <Text style={styles.text}>Login to your{"\n"}WeGig account!</Text>
            <StatusBar style="auto" />
            <View
              style={[styles.container2, { marginHorizontal: 15, flex: 0 }]}
            >
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

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: "#20734f", paddingHorizontal: 40 },
                ]}
                onPress={() => {
                  handleSubmit();
                }}
              >
                <Text
                  style={{
                    color: "#fdfdfd",
                    fontFamily: "Nunito-Bold",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  Log in
                </Text>
              </TouchableOpacity>
              <Text style={[styles.texttosignin, { marginTop: 50 }]}>
                No account yet?
                <Text
                  style={{ fontWeight: "bold" }}
                  onPress={() => navi.navigate("Register")}
                >
                  {" "}
                  Sign up now!
                </Text>
              </Text>
              <Text
                style={[styles.texttosignin, { marginTop: 5 }]}
                onPress={() => {
                  navi.navigate("ForgotPassword");
                }}
              >
                Forgot Password?
              </Text>
              <View
                style={{
                  maxHeight: 200,
                  alignItems: "center",
                  marginTop: "auto",
                }}
              ></View>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
