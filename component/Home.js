import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { UserContext } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import { stylesHome, styles } from "../styles";
import React, { useContext, useState, useEffect } from "react";
import { ref, getDatabase, get, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const { user, setUser } = useContext(UserContext);
  const [detail, setDetail] = useState(null);
  const navi = useNavigation();

  useEffect(() => {
    const fetchUserName = async () => {
      //for home greeting
      try {
        const db = getDatabase();
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

        if (snapshot.exists()) {
          const users = snapshot.val();
          const existingUser = Object.values(users).find(
            (u) => u.email === user.email
          ); // Match email
          console.log("Homepage user: ", existingUser.email);
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
  }, [user]); // Run the effect only when the `user` changes

  //flexible greeting according to time
  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {
      //from midnight to afternoon
      return "Good Morning";
    } else if (currentHour > 12 && currentHour < 15) {
      //from noon to 3pm
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
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
          width: "100%",
          height: 200,
          backgroundColor: "#50c878",
          padding: 0,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LinearGradient
          colors={["#03633a", "#95f6cc80"]} // start to end gradient
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0 }}
          style={[
            styles.container,
            {
              width: "100%",
              paddingTop:
                Platform.OS === "ios"
                  ? StatusBar.currentHeight + 50
                  : StatusBar.currentHeight,
            },
          ]}
        >
          {detail ? (
            <>
              <Text style={[styles.text]}>
                {getGreeting()}, {"\n"}
                {detail.username}!
              </Text>
            </>
          ) : (
            <Text>Home</Text>
          )}
        </LinearGradient>
      </View>
      <View
        style={{
          width: "100%",
          height: 280,
          // paddingLeft: 10,
          marginHorizontal: 40,
        }}
      >
        <Text
          style={{
            fontFamily: "Nunito-ExtraBold",
            fontSize: 25,
            marginTop: 15,
            marginHorizontal: 15,
          }}
        >
          Features
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: 10 }}
        >
          <TouchableOpacity
            style={[stylesHome.features, { backgroundColor: "#D3C2F8" }]}
            onPress={() => navi.navigate("Forum")}
          >
            <LinearGradient
              colors={["#03633a", "#95f6cc"]} // start to end gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1.5 }}
              // style={[{width: '100%', height: '100%', paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight+50 : StatusBar.currentHeight, borderBottomLeftRadius: 50, borderBottomRightRadius: 50}]}
              style={[
                stylesHome.features,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Icon
                name="commenting"
                size={80}
                color={"#fefefe"}
                style={{ marginBottom: 25 }}
              />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    color: "#fefefe",
                    fontSize: 25,
                  }}
                >
                  Forum
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[stylesHome.features, { backgroundColor: "#FAE2C8" }]}
            onPress={() => navi.navigate("FinanceManager")}
          >
            <LinearGradient
              colors={["#03633a", "#95f6cc"]} // start to end gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1.5 }}
              style={[
                stylesHome.features,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Icon
                name="money"
                size={80}
                color={"#fefefe"}
                style={{ marginBottom: 25 }}
              />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    color: "#fefefe",
                    fontSize: 25,
                  }}
                >
                  Finance
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[stylesHome.features, { backgroundColor: "#FAE2C8" }]}
            onPress={() => navi.navigate("SPHome")}
          >
            <View
              style={{
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                height: 120,
              }}
            >
              <Icon name="users" size={80} color={"#fefefe"} />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  color: "#fefefe",
                  fontSize: 25,
                }}
              >
                Social Protection
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[stylesHome.features, { backgroundColor: "#CDF464" }]}
            onPress={() => console.log()}
          >
            <View
              style={{
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                height: 120,
              }}
            >
              <Icon name="question-circle-o" size={80} color={"#fefefe"} />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  color: "#fefefe",
                  fontSize: 25,
                }}
              >
                Helpdesk
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View
        style={{
          width: "100%",
          height: 200,
          paddingHorizontal: 10,
          marginHorizontal: 30,
        }}
      >
        <Text
          style={{
            fontFamily: "Nunito-ExtraBold",
            fontSize: 25,
            margin: 5,
            marginHorizontal: 15,
          }}
        >
          Information
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[stylesHome.imageSlider]}
            onPress={() => navi.navigate("Forum")}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ color: "#fdfdfd", fontWeight: "bold", fontSize: 25 }}
              >
                Image 1
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[stylesHome.imageSlider]}
            onPress={() => navi.navigate("FinanceManager")}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ color: "#fdfdfd", fontWeight: "bold", fontSize: 25 }}
              >
                Image 2
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <BottomBar></BottomBar>
    </View>
  );
}
