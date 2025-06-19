import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { ref, getDatabase, get, child } from "firebase/database";

export default function LandingPage() {
  const [detail, setDetail] = useState(null);
  const navi = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/landing-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          marginTop: 310,
        }}
      >
        <View style={{ margin: 40 }}>
          <Text
            style={{
              fontFamily: "Nunito-ExtraBold",
              fontSize: 32,
              color: "#fff",
              marginBottom: 10,
            }}
          >
            Welcome to WeGig.
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: 17,
              color: "#fff",
            }}
          >
            If you are new here,
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navi.navigate("Register")}
          >
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                fontSize: 22,
                color: "#fff",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: 17,
              color: "#fff",
            }}
          >
            Already have an account?
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ededed" }]}
            onPress={() => navi.navigate("Login")}
          >
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                fontSize: 22,
                color: "#4CAF50",
              }}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

//styling
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 35,
    marginTop: 10,
    marginBottom: 15,
    minWidth: "50%",
    alignItems: "center",
  },
});
