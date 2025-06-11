import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  ImageBackground,
} from "react-native";
import {
  ref,
  set,
  push,
  getDatabase,
  get,
  child,
  onValue,
  serverTimestamp,
} from "firebase/database";
import { styles } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { database } from "../firebase";
import { UserContext } from "../UserContext";
import { Dropdown } from "react-native-element-dropdown";
// import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AddPlan() {
  const [data, setData] = useState([
    {
      label: "Self-Employment Social Security Scheme PERKESO",
      value: "perkeso",
      subOptions: [
        { label: "Perkeso Plan 1", value: "Plan 1" },
        { label: "Perkeso Plan 2", value: "Plan 2" },
        { label: "Perkeso Plan 3", value: "Plan 3" },
        { label: "Perkeso Plan 4", value: "Plan 4" },
      ],
    },
    {
      label: "i-Saraan KWSP",
      value: "kwsp",
      subOptions: [{ label: "i-Saraan Plan", value: "i-Saraan Plan" }],
    },
  ]);

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [valueOptions, setValueOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const navi = useNavigation();

  // const [selectedValue, setSelectedValue] = useState();
  const { user } = useContext(UserContext);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  // useEffect(() => {
  //   const db = getDatabase();
  //   // Any database setup logic if needed
  // }, []);

  useEffect(() => {
    if (selectedLabel) {
      const matchedItem = data.find((item) => item.label === selectedLabel);
      if (matchedItem && matchedItem.subOptions) {
        setValueOptions(matchedItem.subOptions); // Load sub-options dynamically
        setSelectedValue(null); // Reset previous sub selection
      } else {
        setValueOptions([]);
      }
    } else {
      setValueOptions([]);
    }
  }, [selectedLabel]);

  const writeData = async () => {
    console.log("Writing data...");
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database
    const snapshotSP = await get(child(dbRef, "socialplan")); // Fetch all social plans
    console.log("Fetching user data...");

    const users = snapshot.val();
    const existingUser = Object.values(users).find(
      (u) => u.email === user.email
    ); // Match email

    const usersRef = ref(database, "socialplan/"); // Parent path where data will be stored
    const newPostRef = push(usersRef);

    const sp = snapshotSP.val();
    const existingSP =
      sp && Object.keys(sp).length > 0
        ? Object.values(sp).find(
            (u) =>
              u.email === user.email &&
              (u.chosenPlan === selectedValue || u.scheme === selectedLabel)
          )
        : null;

    if (existingSP) {
      console.log("This plan already exists for the user.");
      Alert.alert(
        "SOCSO Plan Alert",
        "You cannot have more than one plan under SOCSO scheme."
      );
      // navi.navigate("SPHome");
      return;
    }

    set(newPostRef, {
      user: existingUser.username,
      email: user.email,
      scheme: selectedLabel,
      chosenPlan: selectedValue,
      totalContribution: 0,
      sent: false,
      rtime: 0,
      rdate: 0,
      notes: "",
    })
      .then(() => {
        navi.navigate("SPHome");
      })
      .catch((error) => console.error("Error writing data: ", error));
  };

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
          <Text style={styles.text}>Social Protection</Text>

          <View style={[styles.container2]}>
            <Text
              style={[
                styles.text,
                {
                  fontSize: 30,
                  textAlign: "center",
                  color: "#101010",
                  marginBottom: 70,
                  marginTop: 0,
                  marginLeft: 0,
                },
              ]}
            >
              Choose your plan
            </Text>
            <Text
              style={[
                {
                  fontFamily: "Nunito-Bold",
                  fontSize: 20,
                  color: "#101010",
                  margin: 5,
                },
              ]}
            >
              Social Protection Scheme
            </Text>
            <Dropdown
              style={[
                stylesDropdown.dropdown,
                { width: width - 50, marginBottom: 50 },
              ]}
              placeholderStyle={stylesDropdown.placeholderStyle}
              selectedTextStyle={stylesDropdown.selectedTextStyle}
              inputSearchStyle={stylesDropdown.inputSearchStyle}
              iconStyle={stylesDropdown.iconStyle}
              containerStyle={stylesDropdown.containerStyle}
              itemTextStyle={stylesDropdown.itemTextStyle}
              data={data}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select a language..."
              searchPlaceholder="Search..."
              value={selectedLabel}
              onChange={(item) => setSelectedLabel(item.label)}
              // defaultValue={selectedValue}
            />

            <Text
              style={[
                {
                  fontFamily: "Nunito-Bold",
                  fontSize: 20,
                  color: "#101010",
                  margin: 5,
                },
              ]}
            >
              Plans
            </Text>
            <Dropdown
              style={[stylesDropdown.dropdown, { width: width - 50 }]}
              placeholderStyle={stylesDropdown.placeholderStyle}
              selectedTextStyle={stylesDropdown.selectedTextStyle}
              inputSearchStyle={stylesDropdown.inputSearchStyle}
              iconStyle={stylesDropdown.iconStyle}
              containerStyle={stylesDropdown.containerStyle}
              itemTextStyle={stylesDropdown.itemTextStyle}
              data={valueOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select a language..."
              searchPlaceholder="Search..."
              value={selectedValue}
              onChange={(item) => setSelectedValue(item.value)}
              disabled={!selectedLabel}
              // defaultValue={selectedValue}
            />

            <TouchableOpacity
              onPress={() => {
                console.log("New plan has been added successfully!");
                if (selectedValue !== null && selectedLabel !== null) {
                  writeData();
                }
              }}
              style={[
                styles.button,
                {
                  marginRight: 15,
                  marginTop: 30,
                  paddingVertical: 15,
                  backgroundColor: "#20734f",
                  borderRadius: 25,
                },
              ]}
            >
              <Text style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}>
                Add New Plan
              </Text>
            </TouchableOpacity>
            <Text
              style={{ marginTop: 15, color: "#222", fontFamily: "Nunito" }}
            >
              *If you have any existing SOCSO plan which still not complete
              12-months contributions, new plan will not be added
            </Text>
          </View>

          {/* <BottomBar /> */}
        </ImageBackground>
      </View>
    </View>
  );
}

const stylesDropdown = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fdfdfd",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    height: 50,
    borderColor: "#121212",
    // borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fdfdfd",
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    borderColor: "red",
    // borderWidth: 1,
    borderRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: "#333",
  },
  containerStyle: {
    borderRadius: 15,
    backgroundColor: "#fff",
    // borderWidth: 1,
    borderColor: "green",
    padding: 5,
  },
  itemTextStyle: {
    fontSize: 16,
    color: "#333",
  },
});
