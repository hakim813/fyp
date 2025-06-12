// import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect } from "react";
import {
  StatusBar,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Text,
  FlatList,
  View,
  Platform,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import styles from "../styles";
import { auth, database } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import {
  ref,
  set,
  push,
  getDatabase,
  get,
  child,
  onValue,
  serverTimestamp,
  update,
} from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

export default function CreateFinanceRecord({ route }) {
  const { type } = route.params;
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState("-");
  const { user } = useContext(UserContext);
  const navi = useNavigation();
  const { id } = route.params || {};

  const updateData = async (existingId) => {
    const recordRef = ref(database, `financeRecords/${existingId}`); // Parent path where data will be stored
    // const newRecordRef = push(recordRef);

    // Parse and validate value
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || value.trim() === "") {
      Alert.alert("Please enter a valid number.");
      return;
    } else if (numericValue <= 0) {
      Alert.alert("Invalid value. Please enter a positive number.");
      return;
    } else {
      update(recordRef, {
        email: user.email,
        type: type,
        value: value,
        notes: notes,
      })
        .then(() => {
          type == "Expense"
            ? console.log(
                `Expense from ${user.email} with value RM ${numericValue} recorded.`
              )
            : console.log(
                `Income from ${user.email} with value RM ${numericValue} recorded.`
              );
        })
        .catch((error) => console.error("Error writing data: ", error));

      navi.navigate("FinanceManager");
    }
  };

  const writeData = async () => {
    const recordRef = ref(database, "financeRecords/"); // Parent path where data will be stored
    const newRecordRef = push(recordRef);

    // Parse and validate value
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || value.trim() === "") {
      Alert.alert("Please enter a valid number.");
      return;
    } else if (numericValue <= 0) {
      Alert.alert("Invalid value. Please enter a positive number.");
      return;
    } else {
      set(newRecordRef, {
        email: user.email,
        type: type,
        value: numericValue, // Use the parsed numeric value
        notes: notes,
        date: serverTimestamp(),
      })
        .then(() => {
          console.log(
            type === "Expense"
              ? `Expense from ${user.email} with value RM ${numericValue} recorded.`
              : `Income from ${user.email} with value RM ${numericValue} recorded.`
          );
        })
        .catch((error) => console.error("Error writing data: ", error));

      navi.navigate("FinanceManager");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container3}>
        <View style={[styles.container]}>
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
            <Text
              style={[styles.text, { backgroundColor: "", marginBottom: 30 }]}
            >
              Expense Form
            </Text>
            {/* <StatusBar style="auto" /> */}
            <View
              style={[
                styles.container2,
                {
                  borderRadius: 50,
                  marginTop: 30,
                  margin: 15,
                  flex: 0,
                  paddingTop: 70,
                  paddingBottom: 70,
                },
              ]}
            >
              <View
                style={[
                  styles.containerAttachMedia,
                  { backgroundColor: "", marginTop: 15 },
                ]}
              >
                <Text
                  style={[
                    styles.labelInput,
                    {
                      fontSize: 20,
                      fontFamily: "Nunito-Bold",
                      marginBottom: 5,
                    },
                  ]}
                >
                  Type
                </Text>
                <TextInput
                  style={[styles.input, { fontWeight: "bold" }]}
                  placeholder="Title"
                  value={type}
                />

                <Text
                  style={[
                    styles.labelInput,
                    {
                      fontSize: 20,
                      fontFamily: "Nunito-Bold",
                      marginBottom: 5,
                    },
                  ]}
                >
                  Value
                </Text>
                <TextInput
                  style={[styles.input]}
                  numberOfLines={10}
                  placeholder="Write out your content"
                  value={value}
                  onChangeText={setValue}
                />

                <Text
                  style={[
                    styles.labelInput,
                    {
                      fontSize: 20,
                      fontFamily: "Nunito-Bold",
                      marginBottom: 5,
                    },
                  ]}
                >
                  Notes
                </Text>
                <TextInput
                  style={[styles.input]}
                  numberOfLines={10}
                  placeholder="Write out your content"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <View
                style={{
                  // flexDirection: "row",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    id == null ? writeData() : updateData(id);
                  }}
                  style={[
                    styles.button,
                    {
                      // marginHorizontal: 15,
                      paddingVertical: 15,
                      backgroundColor: "#296746",
                      borderRadius: 25,
                    },
                  ]}
                >
                  <Text style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}>
                    Record Transaction
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navi.navigate("ScanReceipt")}
                  style={[
                    styles.button,
                    {
                      // marginHorizontal: 15,

                      paddingVertical: 15,
                      backgroundColor: "#296746",
                      borderRadius: 25,
                    },
                  ]}
                >
                  <Text style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}>
                    Scan Gig History
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
