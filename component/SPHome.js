import React, { useState, useContext, useEffect, useRef } from "react";
import {
  StyleSheet,
  StatusBar,
  Text,
  FlatList,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { styles } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import { ref, getDatabase, onValue } from "firebase/database";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function SPHome({ route }) {
  const [data, setData] = useState([
    { scheme: "Scheme 1", chosenPlan: "Plan 1" },
  ]);

  const { user } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const flatListRef = useRef(null);
  const { pDate, pTime } = route.params || {};

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

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
          <Text style={[styles.text]}>Social Protection</Text>
          <ScrollView
            style={[
              styles.container2,
              {
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor: "#fdfdfd",
              },
            ]}
          >
            {/* {data[currentIndex].email === user.email && ( */}
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                color: "#050505",
                textAlign: "center",
                fontSize: Platform.OS === "ios" ? 40 : 20,
              }}
            >
              {data[currentIndex].scheme}
            </Text>

            {/* this should be the title of the social protection plan  */}
            {/* <Text style={[style.title, {fontFamily: 'Nunito'}]}>{data[currentIndex].title}</Text>  */}

            {/* for sliding page  */}
            <FlatList
              style={{ maxHeight: 250, marginBottom: 15 }}
              data={data}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              onMomentumScrollEnd={handleScrollEnd}
              renderItem={({ item, index }) => {
                if (item.isAddButton) {
                  return (
                    <TouchableOpacity
                      onPress={() => navi.navigate("AddPlan")}
                      style={[style.page, { backgroundColor: "#06a561" }]}
                    >
                      <Text
                        style={{
                          fontSize: 80,
                          color: "#95f6cc",
                          fontFamily: "Nunito-ExtraBold",
                        }}
                      >
                        +
                      </Text>
                      <Text
                        style={[
                          styles.font,
                          { color: "#fdfdfd", fontFamily: "Nunito-ExtraBold" },
                        ]}
                      >
                        Add New Plan
                      </Text>
                    </TouchableOpacity>
                  );
                }

                if (item.email === user.email) {
                  return (
                    <View style={[style.page]}>
                      <Text style={{ fontSize: 25 }}>{item.chosenPlan}</Text>
                      <Text style={{ fontSize: 50, marginVertical: 10 }}>
                        RM {data[index].totalContribution}
                      </Text>
                      {/* <Text>{item.chosenPlan}</Text> */}

                      <View
                        style={{
                          flexDirection: "row",
                          paddingTop: 15,
                          marginHorizontal: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => navi.navigate("RecordContribution")}
                          style={{
                            width: 120,
                            padding: 10,
                            margin: 5,
                            backgroundColor: "#06a561",
                            borderRadius: 50,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            onPress={() =>
                              navi.navigate("RecordContribution", {
                                scheme: data[index].scheme,
                                chosenPlan: data[index].chosenPlan,
                                id: data[index].id,
                              })
                            }
                            style={{
                              fontFamily: "Nunito-Semi-Bold",
                              color: "white",
                              fontSize: 15,
                              textAlign: "center",
                            }}
                          >
                            Record Contribution
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            navi.navigate("NotiReminder", {
                              scheme: data[index].scheme,
                              chosenPlan: data[index].chosenPlan,
                              id: data[index].id,
                            })
                          }
                          style={{
                            width: 150,
                            padding: 10,
                            margin: 5,
                            backgroundColor: "#06a561",
                            borderRadius: 50,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Nunito-Semi-Bold",
                              color: "white",
                              fontSize: 15,
                              textAlign: "center",
                            }}
                          >
                            Set Reminder
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {data[index].rdate !== 0 && (
                        <Text style={{ marginVertical: 10 }}>
                          Reminder at {data[index].rdate}, on{" "}
                          {data[index].rtime}
                        </Text>
                      )}
                    </View>
                  );
                }
              }}
              ref={flatListRef}
            />

            <View style={[{ backgroundColor: "red", height: 600 }]}>
              <View
                style={{
                  padding: 10,
                  width: 120,
                  flex: 0,
                  borderRadius: 15,
                  backgroundColor: "green",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    fontSize: 25,
                    textAlign: "center",
                  }}
                >
                  Benefits
                </Text>
              </View>
              {/* {data[currentIndex].email === user.email && ( */}
              <Text
                style={{
                  fontSize: 15,
                  marginVertical: 10,
                  textAlign: "justify",
                  fontFamily: "Nunito-Regular",
                }}
              >
                {data[currentIndex].scheme} - {data[currentIndex].chosenPlan}
                \naaLorem aaipsum dolor sit amet, consectetur adipiscing elit.
                Nam sollicitudin imperdiet quam, vel vestibulum justo vestibulum
                nec. In tincidunt magna felis, non gravida neque consectetur eu.
                Fusce gravida sem in pellentesque mattis. Duis finibus ex at
                lectus dignissim sollicitudin. Donec odio augue, sodales non
                magna ac, ultrices ultricies mauris. Nullam cursus, lectus eu
                pharetra suscipit, massa erat ultrices dolor, blandit facilisis
                velit orci ut est. Ut eu arcu ut nulla gravida tincidunt.
                Phasellus consectetur ultricies erat, et sollicitudin turpis
                commodo at. Vivamus ipsum orci, porttitor sit amet elementum
                volutpat, rutrum id elitaa
              </Text>
            </View>

            {/* for adding space at bottom */}
            <View style={{ height: 40 }}></View>
          </ScrollView>

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
