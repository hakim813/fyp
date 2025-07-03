import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Alert,
  StyleSheet,
  StatusBar,
  Text,
  FlatList,
  TextInput,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
} from "react-native";
import { styles, stylesHome } from "../styles";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
// import { ref, getDatabase, onValue, set } from "firebase/database";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import { Modal } from "react-native";
import {
  ref,
  set,
  onValue,
  push,
  getDatabase,
  get,
  child,
  serverTimestamp,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { database } from "../firebase";
// import { useNavigation } from "@react-navigation/native";
// import { UserContext } from "../UserContext";
// import { firebase } from "../firebase";
// import { Picker } from "@react-native-picker/picker";

import * as FileSystem from "expo-file-system";

import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function AddComplaint() {
  const [data, setData] = useState([
    { scheme: "Scheme 1", chosenPlan: "Plan 1" },
  ]);

  const { user } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [category, setCategory] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const flatListRef = useRef(null);
  const storage = getStorage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [category, setCategory] = useState('Platform Issue'); // Default selected
  // const [photoFile, setPhotoFile] = useState(null);

  const generateTicketNumber = () =>
    "TICK-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const categoryList = [
    "Platform Issue",
    "Safety and Security",
    "Vendor Issue",
    "Incident",
    "Others",
  ];
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

  const pickImage = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    const selectedUris = results.assets.map((asset) => asset.uri);
    // console.log("SELECTEEDDD", selectedUris);
    setImage(selectedUris); // save array of URIs
    // console.log("Selected images: ", selectedUris);
  };

  const writeData = async () => {
    const ticketNumber = generateTicketNumber();
    console.log("Ticket number   ", ticketNumber);

    console.log("Writing data to Firebase...");

    // if (!title) {
    //   Alert.alert("No title is written.");
    //   return;
    // }

    if (!description) {
      Alert.alert("No dexription is written.");
      console.log("Des celre");
      return;
    }

    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

    console.log("User data: ", user);
    const users = snapshot.val();
    // const existingUser = Object.entries(users).find(
    //   ([key, userData]) => key === user.uid
    // );
    const existingUser = Object.keys(users).find((key) => key === user.uid);
    console.log("Existing User: ", existingUser);

    const complaintRef = ref(database, "complaints/"); // Parent path where data will be stored
    const newComplaintRef = push(complaintRef);

    const imgUrl = [];

    if (image.length > 0) {
      setLoading(true);
      for (const imageUri of image) {
        const { uri } = await FileSystem.getInfoAsync(imageUri);

        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });

        const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
        const storageReference = storageRef(
          storage,
          `complaints/${ticketNumber}/${filename} `
        );

        await uploadBytes(storageReference, blob); // upload to Firebase Storage
        const downloadURL = await getDownloadURL(storageReference); // get download URL

        // imgUrl.push(downloadURL);
        console.log(imgUrl);
        // console.log("Uploaded and available at:", downloadURL);
        imgUrl.push(downloadURL);

        blob.close(); // free memory
      }

      // console.log(imgUrl);
      alert("All images uploaded successfully!");
      // console.log("All URLs: ", url);
      // setUrl(imgUrl);

      setLoading(false);
    }
    //  catch (error) {
    //   console.error("Error uploading images:", error);
    //   setLoading(false);
    // }

    console.log("URL to store: ", imgUrl.length);
    if (!loading) {
      //userId: user.uid,
      // ticketNumber,
      // title,
      // description,
      // category,
      // photoURL,
      // status: 'ongoing',
      // createdAt: Date.now(),
      console.log("Loading to Firebase...");
      // console.log(existingUser.userId);

      console.log(title);
      console.log(description);
      console.log(category);
      console.log(imgUrl.length);
      console.log(existingUser.uid);
      set(newComplaintRef, {
        userId: existingUser,
        ticketNumber: ticketNumber,
        title: title ? title : "",
        description: description,
        category: category,
        createdAt: Date.now(),
        status: "Ongoing",
        photoURL: imgUrl.length > 0 ? imgUrl : [],
      })
        .then(() => {
          console.log("Data written successfully!");
          // setUrl([]);
          navi.navigate("HelpdeskHome");
        })
        .catch((error) => console.error("Error writing data: ", error));
    }
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
          <Text style={[styles.text]}>Add New Ticket</Text>
          <ScrollView
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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={[
                  styles.labelInput,
                  { fontSize: Platform.OS === "ios" ? 20 : 17 },
                ]}
              >
                Complaint Category
              </Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                style={{
                  backgroundColor: "#efefef",
                  borderWidth: 0.3,
                  minWidth: 145,
                  paddingHorizontal: Platform.OS === "ios" ? 20 : 10,
                  paddingVertical: 5,
                  marginTop: 5,
                  borderRadius: 50,
                  marginLeft: "auto",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    fontSize: Platform.OS === "ios" ? 15 : 13,
                    color: "#101010",
                  }}
                >
                  {category === "" ? "Choose Category" : category}
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              visible={filterModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setFilterModalVisible(false)}
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
                      fontWeight: "bold",
                      fontSize: 20,
                      marginBottom: 10,
                    }}
                  >
                    Select Category
                  </Text>
                  <Picker
                    selectedValue={category}
                    style={{ width: "100%" }}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                  >
                    <Picker.Item
                      label="Platform Issue"
                      value={categoryList[0]}
                      color="black"
                    />
                    <Picker.Item
                      label="Safety and Security"
                      value={categoryList[1]}
                      color="black"
                    />
                    <Picker.Item
                      label="Vendor Issue"
                      value={categoryList[2]}
                      color="black"
                    />
                    <Picker.Item
                      label="Incident"
                      value={categoryList[3]}
                      color="black"
                    />
                    <Picker.Item
                      label="Others"
                      value={categoryList[4]}
                      color="black"
                    />
                    {/* Add more categories as needed */}
                  </Picker>
                  <TouchableOpacity
                    onPress={() => setFilterModalVisible(false)}
                    style={{
                      marginTop: 20,
                      backgroundColor: "#1b434d",
                      borderRadius: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* <Text style={[styles.labelInput, { fontSize: 20, marginTop: 20 }]}>
              Title
            </Text> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Text
                style={[styles.labelInput, { fontSize: 20, marginTop: 30 }]}
              >
                Title
              </Text>
              {/* <Text
                style={[
                  styles.labelInput,
                  {
                    fontFamily: "Nunito-Regular",
                    fontSize: 15,
                    color: "grey",
                    marginRight: 10,
                    marginTop: 40,
                  },
                ]}
              >
                Required
              </Text> */}
            </View>
            <TextInput
              style={[styles.input, { fontFamily: "Nunito", color: "#303030" }]}
              placeholder="What is your issue briefly about?"
              value={title}
              onChangeText={setTitle}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Text style={[styles.labelInput, { fontSize: 20 }]}>
                Description
              </Text>
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
              style={[
                styles.input,
                {
                  fontFamily: "Nunito",
                  color: "#303030",
                  minHeight: 250,
                  // alignContent: "flex-start",
                },
              ]}
              placeholder="Describe your issue"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              textAlignVertical="top" // Ensures text starts at the top
              paddingTop={10} // Adds padding to the top for better visibility
              //   value={chosenPlan}
            />

            <View
            // style={{
            //   flexDirection: "row",
            //   alignItems: "center",
            //   justifyContent: "space-between",
            // }}
            >
              <Text style={[styles.labelInput, { fontSize: 20 }]}>
                Attachment
              </Text>
              {image && Array.isArray(image) && image.length > 0 ? (
                <FlatList
                  data={image}
                  keyExtractor={(item, index) => `image-${index}`}
                  horizontal
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: 200,
                        height: 200,
                        margin: 5,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: "#ccc",
                      }}
                    >
                      <Image
                        source={{ uri: item }} // `item` is the URI string
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 5,
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                />
              ) : (
                <Text style={{ marginTop: 10, color: "gray" }}>
                  No images attached
                </Text>
              )}

              {image.length <= 0 ? (
                <TouchableOpacity
                  onPress={() => pickImage()}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    minHeight: 200,
                    borderWidth: 1.5,
                    borderStyle: "dashed",
                    borderColor: "grey",
                    paddingHorizontal: 20,
                    paddingVertical: 5,
                    marginTop: 5,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Icon
                      name="file-image-o"
                      size={40}
                      color={"#555555"} // Change color based on isUpvoted
                    />
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 15,
                        color: "#555555",
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      Attach Media{"\n"}(if any)
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => pickImage()}
                  style={{
                    backgroundColor: "#efefef",
                    borderWidth: 0.3,
                    // minWidth: 165,
                    paddingHorizontal: 20,
                    paddingVertical: 5,
                    marginTop: 5,
                    borderRadius: 50,
                    marginRight: "auto",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Nunito-Bold",
                      fontSize: 15,
                      color: "#101010",
                    }}
                  >
                    Attach media
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundColor: "transparent", // remove red background
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => writeData()}
                style={[
                  styles.button,
                  {
                    // maxWidth: 100,
                    backgroundColor: "green",
                    paddingVertical: 5,
                    paddingHorizontal: 20,
                    borderRadius: 50,
                    // marginTop: 20,
                    // marginLeft: "auto",
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: "Nunito",
                    fontSize: 20,
                    color: "#fdfdfd",
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navi.navigate("HelpdeskHome")}
                style={[
                  styles.button,
                  {
                    // maxWidth: 100,
                    backgroundColor: "red",
                    paddingVertical: 5,
                    paddingHorizontal: 20,
                    borderRadius: 50,
                    // marginTop: 20,
                    marginLeft: "10",
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: "Nunito",
                    fontSize: 20,
                    color: "#fdfdfd",
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>

            {/* for adding space at bottom */}
            <View style={{ height: Platform.OS === "ios" ? 210 : 230 }}></View>
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
