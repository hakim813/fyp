import { Text, View, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../../styles";
import React, { useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

export default function SignupSuccessful() {
  const navi = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navi.navigate("Login");
    }, 2500);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navi]);

  return (
    <ImageBackground
      source={require("../../assets/bg-hibiscus.png")} // Your image path
      style={[
        styles.background,
        {
          alignItems: "center",
          justifyContent: "center",
          // paddingHorizontal: 25,
          height: "100%",
          width: "100%",
          backgroundColor: "#1b434d",
        },
      ]}
      resizeMode="cover"
    >
      <Icon
        name="check-circle-o"
        size={130}
        color={"#fafafa"} // Change color based on isUpvoted
      />
      <Text
        style={{ color: "white", fontSize: 30, fontWeight: "700", margin: 10 }}
      >
        Done signing you up!
      </Text>
      <Text style={{ color: "white", fontSize: 20 }}>
        Now redirecting you to Login page.
      </Text>
    </ImageBackground>
  );
}
