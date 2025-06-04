import React, { useState, useContext, useEffect, useRef } from "react";
import {
  StyleSheet,
  StatusBar,
  Text,
  FlatList,
  TextInput,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { styles, stylesHome } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import { ref, getDatabase, onValue } from "firebase/database";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AddComplaint() {
  const [data, setData] = useState([
    { scheme: "Scheme 1", chosenPlan: "Plan 1" },
  ]);

  const { user } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const flatListRef = useRef(null);
  //   const { pDate, pTime } = route.params || {};

  const navi = useNavigation();

  // const { rDate, rTime } = route.params || {};

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "socialplan");

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();

      let fetchedPlans = [];

      if (data) {
        // Convert the object to an array of posts
        fetchedPlans = Object.keys(data)
          .map((key) => ({
            id: key,
            user: data[key].user,
            email: data[key].email,
            scheme: data[key].scheme,
            chosenPlan: data[key].chosenPlan,
            totalContribution: data[key].totalContribution,
            rdate: data[key].rdate ?? null,
            rtime: data[key].rtime ?? null,
          }))
          .filter((item) => item.email === user.email); // Filter here;
      } else {
        console.log("No data found in the database.");
      }

      // Always add the 'Add New Plan' dummy card at the end
      fetchedPlans.push({ isAddButton: true });

      // console.log(pDate);
      // console.log(pTime);
      setData(fetchedPlans);
    });
  }, []);

  return (
    <View style={styles.container3}>
      <View style={styles.container}>
        <LinearGradient
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
        >
          <Text style={[styles.text]}>Add Complaint</Text>
          <View
            style={[
              styles.container2,
              {
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                // padding: 0,
              },
            ]}
          >
            {/* this should be the title of the social protection plan  */}
            {/* <Text style={[style.title, {fontFamily: 'Nunito'}]}>{data[currentIndex].title}</Text>  */}

            <Text style={[styles.labelInput, { fontSize: 20, marginTop: 20 }]}>
              Title of your complaint
            </Text>
            <TextInput
              style={[
                styles.input,
                { fontFamily: "Nunito-Bold", fontColor: "#303030" },
              ]}
              placeholder="What is your issue briefly about?"
            />

            <Text style={[styles.labelInput, { fontSize: 20 }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  fontFamily: "Nunito-Bold",
                  fontColor: "#303030",
                  minHeight: 250,
                  //   alignItems: 'flex-start'
                },
              ]}
              placeholder="Describe your issue"
              //   value={chosenPlan}
            />

            <TouchableOpacity
              onPress={() => console.log("Complaint Submitted")}
              style={[
                styles.button,
                {
                  // maxWidth: 100,
                  backgroundColor: "green",
                  padding: 20,
                  borderRadius: 50,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: 20,
                  color: "#fdfdfd",
                }}
              >
                Add complaint
              </Text>
            </TouchableOpacity>

            {/* for adding space at bottom */}
            <View style={{ height: 75 }}></View>
          </View>

          <BottomBar></BottomBar>
        </LinearGradient>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    // marginBottom: 20,
  },
  page: {
    width: width - 50,
    borderColor: "#06a561",
    borderWidth: 1.5,
    margin: 5,
    padding: 10,
    height: 245,
    borderRadius: 50,
    backgroundColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
  },
});
