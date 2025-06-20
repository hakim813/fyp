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
import { ref, getDatabase, onValue, update } from "firebase/database";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";
import { Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
  const [lastId, setLastId] = useState([]);
  const [SOCSOplan, setSOCSOplan] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Plan 1");
  const [changingSchemeId, setChangingSchemeId] = useState(null);

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

  const isLocked =
    SOCSOplan &&
    SOCSOplan[0] &&
    SOCSOplan[0].scheme !== "i-Saraan KWSP" &&
    (() => {
      const created = new Date(SOCSOplan[0].createdAt);
      const unlockDate = new Date(created);
      unlockDate.setMonth(
        unlockDate.getMonth() + (SOCSOplan[0].monthsCovered || 0)
      );
      const now = new Date();
      console.log(now <= unlockDate);
      return now <= unlockDate;
    })();

  const unlockDate =
    SOCSOplan && SOCSOplan[0]
      ? (() => {
          const createdAt = Number(SOCSOplan[0].createdAt); // Ensure it's a number
          const monthsToAdd = Number(SOCSOplan[0].monthsCovered) || 0;
          const created = new Date(createdAt);
          const d = new Date(created);
          d.setMonth(created.getMonth() + monthsToAdd); // Always use the original month
          // console.log("Created month: ", created.getMonth());
          // console.log("Created Year: ", created.getFullYear());
          // console.log("New month: ", d.getMonth());
          // console.log("New Year: ", d.getFullYear());
          return d;
        })()
      : null;

  const hasReset = useRef(false);

  useEffect(() => {
    // Find the first plan that matches the user and is not "i-Saraan KWSP"
    const planToReset = data.find(
      (plan) =>
        plan.email === user.email &&
        plan.scheme !== "i-Saraan KWSP" &&
        plan.totalContribution !== 0 // Only reset if not already 0
    );

    // Only reset if unlocked, plan exists, and not already reset
    if (!isLocked && planToReset && !hasReset.current) {
      const db = getDatabase();
      update(ref(db, `socialplan/${planToReset.id}`), {
        totalContribution: 0,
      });
      hasReset.current = true;
      console.log("totalContribution reset to 0 for plan:", planToReset.id);
    }
    // Reset the flag if it gets locked again (optional)
    if (isLocked) {
      hasReset.current = false;
    }
  }, [isLocked, data, user.email]);

  // useEffect(() => {
  //   // Find the first plan that matches the user and is not "i-Saraan KWSP"
  //   const planToReset = data.find(
  //     (plan) =>
  //       plan.email === user.email &&
  //       plan.scheme !== "i-Saraan KWSP"
  //   );

  //   // Only reset if unlocked, plan exists, and not already reset
  //   if (isLocked) {
  //     const db = getDatabase();
  //     update(ref(db, `socialplan/${planToReset.id}`), {
  //       rdate: ,
  //       rtime:
  //     });
  //   }

  // }, [isLocked]);

  useEffect(() => {
    if (isLocked && SOCSOplan && SOCSOplan[0]) {
      const contribution = SOCSOplan[0]; // The user's first valid contribution record
      const db = getDatabase();

      // Calculate reminder date based on createdAt + monthsCovered
      const createdAt = new Date(Number(contribution.createdAt));
      const monthsToAdd = Number(contribution.monthsCovered) || 0;
      const reminderDate = new Date(createdAt);
      reminderDate.setMonth(reminderDate.getMonth() + monthsToAdd);

      const formattedDate = reminderDate.toLocaleDateString("en-GB"); // dd/mm/yyyy
      const formattedTime = reminderDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }); // hh.mm AM/PM

      // Update the plan reminder fields in Firebase
      const updateReminder = data.find(
        (plan) => plan.email === user.email && plan.scheme !== "i-Saraan KWSP"
      );

      if (updateReminder) {
        update(ref(db, `socialplan/${updateReminder.id}`), {
          rdate: formattedDate,
          rtime: formattedTime,
        });
        console.log("Reminder set to:", formattedDate, formattedTime);
      }
    }
  }, [isLocked]);

  useEffect(() => {
    const db = getDatabase();
    // const postsRef = ref(db, "socialplan");
    const recordRef = ref(db, `SPcontribution`);

    onValue(recordRef, (snapshot) => {
      const data = snapshot.val();

      let fetchedRecord = [];

      if (data) {
        // Convert the object to an array of posts
        fetchedRecord = Object.keys(data)
          .map((key) => ({
            key: key,
            monthsCovered: data[key].monthsCovered,
            scheme: data[key].scheme,
            chosenPlan: data[key].chosenPlan,
            createdAt: data[key].createdAt,
            email: data[key].email, // Add this
            // lastContributionId: data[key].lastContributionId, // And this
          }))
          .filter(
            (item) =>
              item.email === user.email &&
              // item.key === lastId &&
              item.scheme !== "i-Saraan KWSP"
          ); // Filter here;
      } else {
        console.log("No data found in the database.");
      }

      setSOCSOplan(fetchedRecord);
      console.log("iaiaia: ", lastId);
      console.log("SPCSP Plan:", SOCSOplan);
    });
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "socialplan");
    const recordRef = ref(db, `SPcontribution`);

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
            lastContributionId: data[key].lastContributionId ?? null,
            rdate: data[key].rdate ?? null,
            rtime: data[key].rtime ?? null,
          }))
          .filter((item) => item.email === user.email); // Filter here;
      } else {
        console.log("No data found in the database.");
      }
      // Get lastContributionId from the last real plan (if any)
      const firstPlanWithId = fetchedPlans.find(
        (plan) => plan.lastContributionId
      );
      const lastId = firstPlanWithId
        ? firstPlanWithId.lastContributionId
        : null;

      // Always add the 'Add New Plan' dummy card at the end
      fetchedPlans.push({ isAddButton: true });

      // console.log(pDate);
      setLastId(lastId);
      setData(fetchedPlans);
      console.log("Last ID: ", lastId);
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
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 20,
                  width: "80%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  Select New Plan
                </Text>
                <Picker
                  selectedValue={selectedPlan}
                  style={{ width: "100%" }}
                  onValueChange={(itemValue) => setSelectedPlan(itemValue)}
                >
                  <Picker.Item label="Plan 1" value="Plan 1" color="black" />
                  <Picker.Item label="Plan 2" value="Plan 2" color="black" />
                  <Picker.Item label="Plan 3" value="Plan 3" color="black" />
                  <Picker.Item label="Plan 4" value="Plan 4" color="black" />
                </Picker>
                <View style={{ flexDirection: "row", marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      backgroundColor: "#ccc",
                      padding: 10,
                      borderRadius: 10,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: "#333" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      console.log("Changing scheme ID:", changingSchemeId);
                      console.log("Selected plan:", selectedPlan);
                      if (changingSchemeId) {
                        try {
                          const db = getDatabase();
                          await update(
                            ref(db, `socialplan/${changingSchemeId}`),
                            { chosenPlan: selectedPlan }
                          );
                          console.log("Plan updated successfully!");
                        } catch (error) {
                          console.error("Error updating plan:", error);
                          Alert.alert(
                            "Update failed",
                            "Could not update the plan. Please try again."
                          );
                        }
                      } else {
                        console.warn("No scheme ID selected!");
                      }
                      setModalVisible(false);
                    }}
                    style={{
                      backgroundColor: "#20734f",
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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

                      {/* {isLocked && unlockDate ? (
                        <Text
                          style={{
                            fontFamily: "Nunito-Regular",
                            color: "grey",
                          }}
                        >
                          Plan is locked unaatil{" "}
                          {unlockDate.toLocaleDateString("en-GB")}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontFamily: "Nunito-Regular",
                            color: "green",
                          }}
                        >
                          Plan is unlocked and available!
                        </Text>
                      )} */}

                      {item.scheme !== "i-Saraan KWSP" &&
                        (isLocked && unlockDate ? (
                          <Text
                            style={{
                              fontFamily: "Nunito-Regular",
                              color: "grey",
                            }}
                          >
                            Plan is locked until{" "}
                            {unlockDate.toLocaleDateString("en-GB")}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: "Nunito-Regular",
                              color: "green",
                            }}
                            onPress={() => {
                              setChangingSchemeId(item.id); // Save the scheme id to update
                              setSelectedPlan(item.chosenPlan || "Plan 1"); // Default to current plan
                              setModalVisible(true);
                            }}
                          >
                            Change Plan?
                          </Text>
                        ))}

                      <View
                        style={{
                          flexDirection: "row",
                          paddingTop: 15,
                          marginHorizontal: 10,
                        }}
                      >
                        <TouchableOpacity
                          disabled={item.scheme !== "i-Saraan KWSP" && isLocked} // or disabled={someCondition}
                          // style={{ opacity: 0.5 }} // Optional: visually indicate it's disabled
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
                            backgroundColor:
                              item.scheme !== "i-Saraan KWSP" && isLocked
                                ? "grey"
                                : "#20734f",
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
