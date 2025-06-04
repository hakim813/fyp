import { Text, View, TouchableOpacity } from "react-native";
import { UserContext } from "../../UserContext";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import { stylesHome, styles } from "../../styles";
import React, { useContext, useState, useEffect } from "react";
import { ref, getDatabase, get, child } from "firebase/database";
import BottomBar from "../BottomBar";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [detail, setDetail] = useState(null);
  const navi = useNavigation();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const db = getDatabase(); // Initialize Firebase Realtime Database
        const dbRef = ref(db); // Reference to the database
        const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

        if (snapshot.exists()) {
          const users = snapshot.val();
          const existingUser = Object.values(users).find(
            (u) => u.email === user.email
          ); // Match email
          setDetail(existingUser);
        } else {
          console.log("No users found in the database.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    if (user) {
      fetchUserName();
    }
  }, [user]);

  const handleLogout = () => {
    auth.signOut(); // Sign out from Firebase
    setUser(null); // Clear user data from context
    setDetail(null);
  };

  return (
    <View
      style={[
        stylesHome.bg,
        { paddingTop: 0, backgroundColor: "white", alignItems: "center" },
      ]}
    >
      <View
        style={{
          width: "150%",
          height: 300,
          backgroundColor: "#1b434d",
          paddingVertical: 0,
          borderBottomLeftRadius: 250,
          borderBottomRightRadius: 250,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            marginTop: 30,
            height: 100,
            width: 100,
            backgroundColor: "red",
            borderRadius: 100,
          }}
        >
          <></>
        </View>
        {detail ? (
          <>
            <Text style={[styles.text]}>
              {detail.username}'s {"\n"}Profile
            </Text>
          </>
        ) : (
          <Text>Profile</Text>
        )}
      </View>

      <View
        style={{
          width: "100%",
          height: 200,
          paddingLeft: 10,
          marginHorizontal: 30,
          alignItems: "center",
        }}
      >
        {detail ? (
          <>
            <Text style={{ marginTop: 50, marginBottom: 15 }}>
              Username: {detail.username}
            </Text>
            <Text style={{ marginBottom: 15 }}>Email: {detail.email}</Text>
          </>
        ) : (
          <Text>Loading user details...</Text>
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red" }]}
          onPress={() => {
            navi.navigate("SignoutSuccessful"); // Correct navigation after logout
            handleLogout();
          }}
        >
          <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <BottomBar></BottomBar>
    </View>
  );
}
