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
    console.log("Writing data...");
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, "socialplan")); // Fetch all users from the database
    console.log("Fetching user data...");

    const sp = snapshot.val();
    const existingUser = Object.values(sp).find(
      (u) => u.email === user.email && u.chosenPlan === chosenPlan
    );

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
                  <Text style={styles.labelInput}>Months Covered</Text>
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
                style={styles.button}
                onPress={() => writeData()}
              >
                <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
