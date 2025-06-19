import React, { useState, useContext, useEffect } from "react";
import {
  Alert,
  Text,
  Platform,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  StatusBar,
} from "react-native";
import {
  ref,
  set,
  push,
  getDatabase,
  get,
  child,
  update,
  onValue,
  serverTimestamp,
} from "firebase/database";
import { database } from "../firebase";
import styles from "../styles";
import { UserContext } from "../UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function RecordContribution({ route }) {
  // useEffect(() => {
  //   //verify only console log once when loggeed in
  //   console.log("Login page");
  // }, []);

  const { user, setUser } = useContext(UserContext);
  const navi = useNavigation();
  const { scheme, chosenPlan, id } = route.params; //get data from previous page
  const [month, setMonth] = useState(0);
  const [total, setTotal] = useState(0);
  const socsoMonthlyValue = {
    "Plan 1": 13.1,
    "Plan 2": 19.4,
    "Plan 3": 36.9,
    "Plan 4": 49.4,
  };

  const writeData = async () => {
    if (month <= 0 && scheme !== "i-Saraan KWSP") {
      Alert.alert(
        "Missing field data",
        "Please state hwo many months to cover for SOCSO plan."
      );
      return;
    }

    console.log("Writing data...");
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, "socialplan")); // Fetch all users from the database

    const socialContriRef = ref(database, "SPcontribution/"); // Parent path where data will be stored
    const newSocialContriRef = push(socialContriRef);
    console.log("Fetching user data...");

    const sp = snapshot.val();
    const existingUser = Object.values(sp).find(
      (u) => u.email === user.email && u.chosenPlan === chosenPlan
    );
    console.log("Bug before this...");
    console.log(existingUser);
    // Fetch current totalContribution of the user (if exists)
    const currentTotalContribution =
      parseFloat(existingUser.totalContribution) || 0.0;

    // New contribution value you want to add (could be from selectedValue or another source)
    const newContribution =
      scheme === "i-Saraan KWSP"
        ? total
        : month * socsoMonthlyValue[chosenPlan];
    // Modify based on your logic for the new contribution

    const newTotalContribution =
      currentTotalContribution + parseFloat(newContribution);

    const spRef = ref(database, `socialplan/${id}`); // Parent path where data will be stored
    // const updatedSPRef = push(spRef);

    console.log("Passed here...");
    try {
      if (scheme !== "i-Saraan KWSP") {
        await set(newSocialContriRef, {
          email: existingUser.email,
          chosenPlan: chosenPlan,
          scheme: scheme,
          createdAt: Date.now(),
          monthsCovered: month,
          value: newContribution,
        });
        console.log("Data written for SOCSO successfully!");
      } else {
        await set(newSocialContriRef, {
          email: existingUser.email,
          chosenPlan: chosenPlan,
          scheme: scheme,
          createdAt: Date.now(),
          value: newContribution,
        });
        console.log("Data written for KWSP successfully!");
      }

      navi.navigate("Home");
      console.log("Passed here too...");
    } catch (error) {
      console.error("Error writing data: ", error);
    }

    console.log("Passed here too...");

    update(spRef, {
      totalContribution: newTotalContribution,
    })
      .then(() => {
        console.log("Done.");
        navi.navigate("SPHome");
      })
      .catch((error) => console.error("Error writing data: ", error));
  };

  return (
    <View style={styles.container3}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Text style={styles.text}>
              Record Your Social{"\n"}Protection Contribution.
            </Text>
            <StatusBar style="auto" />
            <View
              style={[styles.container2, { marginHorizontal: 15, flex: 0 }]}
            >
              <Text style={styles.labelInput}>Scheme</Text>
              <TextInput
                style={[
                  styles.input,
                  { fontFamily: "Nunito-Bold", fontColor: "#303030" },
                ]}
                placeholder="Example : user123@mail.com"
                value={scheme}
              />

              <Text style={styles.labelInput}>Chosen Plan</Text>
              <TextInput
                style={[
                  styles.input,
                  { fontFamily: "Nunito-Bold", fontColor: "#303030" },
                ]}
                placeholder="Enter your password"
                value={chosenPlan}
              />

              {scheme === "i-Saraan KWSP" ? (
                <View>
                  <Text style={styles.labelInput}>Total</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Total"
                    value={total}
                    onChangeText={setTotal}
                  />
                </View>
              ) : (
                <View></View>
              )}

              {scheme === "i-Saraan KWSP" ? (
                <View></View>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={[styles.labelInput]}>Months covered</Text>
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontFamily: "Nunito-Regular",
                          fontSize: 15,
                          color: "grey",
                          marginRight: 10,
                        },
                      ]}
                    >
                      Required
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="How many months you have covered?"
                    value={month}
                    onChangeText={setMonth}
                  />

                  <Text style={styles.labelInput}>Overall Total</Text>
                  {/* <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={month == 0 ? 0 : month * total}
                  /> */}
                  <TextInput
                    style={[
                      styles.input,
                      { fontFamily: "Nunito-Bold", fontColor: "#303030" },
                    ]}
                    // placeholder="Enter your password"
                    value={(socsoMonthlyValue[chosenPlan] * month)
                      ?.toFixed(2)
                      .toString()}
                  />
                </>
              )}

              {/* <Button title="Click Me"></Button> */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#20734f" }]}
                onPress={() => writeData()}
              >
                <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
