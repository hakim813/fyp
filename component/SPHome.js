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
  ImageBackground,
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

  const benefitKWSP = [
    "Receive a special incentive of 20% (up to a maximum of RM500) of the total voluntary contribution in the current year",
    "Enjoy annual dividends on retirement savings",
    "Subject to EPF terms and conditions",
    "Subject to LHDN terms and conditions",
  ];

  const benefitSocso = {
    "Plan 1": [
      "RM 30 per day",
      "Lump Sum Payment : RM 32243.40",
      "Lump Sum Payment : RM32243.40\nPeriodical Pension : RM 756.00 per month",
      "RM 945 per month",
      "RM 3000",
      "RM 500 per month",
    ],
    "Plan 2": [
      "RM 41.33 per day",
      "Lump Sum Payment : RM 47957.40",
      "Lump Sum Payment : RM 47957.40 & Periodical Pension : RM 1116.00 per month",
      "RM 1395 per month",
      "RM 3000",
      "RM 500 per month",
    ],
    "Plan 3": [
      "RM 78.67 per day",
      "Lump Sum Payment : RM 90588.60",
      "Lump Sum Payment : RM 90588.60 & Periodical Pension : RM 2124.00 per month",
      "RM 2655 per month",
      "RM 3000",
      "RM 500 per month",
    ],
    "Plan 4": [
      "RM 105.33 per day",
      "Lump Sum Payment : RM 121296.60",
      "Lump Sum Payment : RM 121296.60\nPeriodical Pension : RM 2844.00 per month",
      "RM 3555 per month",
      "RM3000",
      "RM 500 per month",
    ],
  };

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
        <ImageBackground
          source={require("../assets/bg-hibiscus.png")} // Your image path
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
            <TouchableOpacity
              style={{
                backgroundColor: "#ededed",
                paddingVertical: 5,
                paddingHorizontal: 10,
                justifyContent: "center", // or "flex-end" if you want the text at the end
                borderRadius: 20,
                // Remove minWidth: 10,
                alignSelf: "flex-end", // ensures it only takes as much space as needed
              }}
              onPress={() => navi.navigate("ContributionRecord")}
            >
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: 15,
                  color: "#20734f",
                }}
              >
                Contribution History{"  >"}
              </Text>
            </TouchableOpacity>

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
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          fontSize: 25,
                          marginTop: 10,
                        }}
                      >
                        {item.chosenPlan}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          fontSize: 50,
                          marginTop: 10,
                        }}
                      >
                        RM {data[index].totalContribution.toFixed(2).toString()}
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
                          onPress={() =>
                            navi.navigate("RecordContribution", {
                              scheme: data[index].scheme,
                              chosenPlan: data[index].chosenPlan,
                              id: data[index].id,
                            })
                          }
                          style={{
                            minWidth: Platform.OS === "ios" ? 150 : 120,
                            padding: 15,
                            margin: 5,
                            backgroundColor: "#20734f",
                            borderRadius: 50,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            // onPress={() =>
                            //   navi.navigate("RecordContribution", {
                            //     scheme: data[index].scheme,
                            //     chosenPlan: data[index].chosenPlan,
                            //     id: data[index].id,
                            //   })
                            // }
                            style={{
                              fontFamily: "Nunito-Semi-Bold",
                              color: "white",
                              fontSize: Platform.OS === "ios" ? 15 : 13,
                              textAlign: "center",
                            }}
                          >
                            Record{"\n"}Contribution
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
                            backgroundColor: "#20734f",
                            borderRadius: 50,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Nunito-Semi-Bold",
                              color: "white",
                              fontSize: Platform.OS === "ios" ? 15 : 13,
                              textAlign: "center",
                            }}
                          >
                            Set{"\n"}Reminder
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {data[index].rdate !== 0 && (
                        <Text
                          style={{ fontFamily: "Nunito", marginVertical: 10 }}
                        >
                          Reminder is set at {data[index].rdate}, on{" "}
                          {data[index].rtime}
                        </Text>
                      )}
                    </View>
                  );
                }
              }}
              ref={flatListRef}
            />

            <View style={[{ minHeight: 300 }]}>
              {/* benefit for the chosen plan */}
              {currentIndex !== data.length - 1 &&
                (data[currentIndex].scheme === "i-Saraan KWSP" ? (
                  <>
                    <View
                      style={{
                        padding: 10,
                        width: 120,
                        flex: 0,
                        borderRadius: 15,
                        backgroundColor: "#20734f",
                        alignContent: "center",
                        justifyContent: "center",
                        marginBottom: "10",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          fontSize: 20,
                          textAlign: "center",
                          color: "#fdfdfd",
                        }}
                      >
                        Benefits
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Special Intencives
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 15,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitKWSP[0]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Annual Dividend
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 15,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitKWSP[1]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Death Beneficiaries
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 15,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitKWSP[2]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Tax Relief
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 15,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitKWSP[3]}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        padding: 10,
                        width: 120,
                        flex: 0,
                        borderRadius: 15,
                        backgroundColor: "#20734f",
                        alignContent: "center",
                        justifyContent: "center",
                        marginBottom: "10",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          fontSize: 20,
                          textAlign: "center",
                          color: "#fdfdfd",
                        }}
                      >
                        Benefits
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Temporary Disablement Benefit
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 10,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitSocso[data[currentIndex].chosenPlan][0]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Permanent Disablement Benefit
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 10,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitSocso[data[currentIndex].chosenPlan][1]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Permanent Disablement Benefit
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 10,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitSocso[data[currentIndex].chosenPlan][2]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Dependant Benefit
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 10,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitSocso[data[currentIndex].chosenPlan][3]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Funeral Benefit
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 10,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitSocso[data[currentIndex].chosenPlan][4]}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 20,
                        // textAlign: "center",
                      }}
                    >
                      Constant Attendance Allowance
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#eee",
                        paddingHorizontal: 15,
                        borderRadius: 20,
                        minHeight: 60,
                        alignContent: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 10,
                          textAlign: "justify",
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        {benefitSocso[data[currentIndex].chosenPlan][4]}
                      </Text>
                    </View>
                  </>
                ))}
            </View>

            {/* for adding space at bottom */}
            <View style={{ height: 40 }}></View>
          </ScrollView>

          <BottomBar></BottomBar>
        </ImageBackground>
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
    // borderWidth: 1.5,
    margin: 5,
    padding: 10,
    height: 245,
    borderRadius: 50,
    backgroundColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Shadow for Android
    elevation: 5,
  },
});
