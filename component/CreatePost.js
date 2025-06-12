import React, { useState, useContext, useEffect } from "react";
import {
  Alert,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Keyboard,
  Text,
  View,
  Dimensions,
  Platform,
  TextInput,
  FlatList,
  ImageBackground,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import styles from "../styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { database } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import { firebase } from "../firebase";
import { Picker } from "@react-native-picker/picker";

import {
  ref,
  set,
  push,
  getDatabase,
  get,
  child,
  serverTimestamp,
} from "firebase/database";
// import { storage } from "../firebase"; // make sure you import storage
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";

import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import BottomBar from "./BottomBar";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useContext(UserContext);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [category, setCategory] = useState("");
  const [url, setUrl] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const categoryList = [
    "General",
    "Platform Issue",
    "Safety and Security",
    "Vendor Issue",
    "Incident",
    "Others",
  ];
  const [category, setCategory] = useState("General");
  const navi = useNavigation();
  const storage = getStorage(); // Initialize Firebase Storage

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
    console.log("Writing data to Firebase...");

    if (!content) {
      Alert.alert("No content is written.");
      return;
    }

    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

    const users = snapshot.val();
    const existingUser = Object.values(users).find(
      (u) => u.email === user.email
    ); // Match email

    const usersRef = ref(database, "posts/"); // Parent path where data will be stored
    const newPostRef = push(usersRef);

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
        const storageReference = storageRef(storage, filename);

        await uploadBytes(storageReference, blob); // upload to Firebase Storage
        const downloadURL = await getDownloadURL(storageReference); // get download URL

        // imgUrl.push(downloadURL);
        // console.log(imgUrl);
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
      set(newPostRef, {
        user: existingUser.username,
        email: user.email,
        title: title ? title : "No title",
        content: content,
        category: category,
        date: serverTimestamp(),
        upvoter: [],
        profilePhoto:
          existingUser.profilePhoto ||
          "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png",
        // imageUris: imageUris.length > 0 ? imageUris : null,
        imageURL: imgUrl.length > 0 ? imgUrl : [],
      })
        .then(() => {
          console.log("Data written successfully!");
          setUrl([]);
          navi.navigate("Forum");
        })
        .catch((error) => console.error("Error writing data: ", error));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { flex: 0 }]}>
        {loading && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              backgroundColor: "#fdfdfdb3",
            }}
            //   // position: "absolute",
            //   width: "100%",
            // height: Dimensions.get("window").height,
            //   backgroundColor: "blue",
            //   justifyContent: "center",
            //   alignItems: "center",
            // }}
          >
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={{ margin: 20 }}
            />
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                color: "white",
                fontSize: 20,
              }}
            >
              Loading image...
            </Text>
          </View>
        )}
        <LinearGradient
          colors={["#03633a", "#95f6cc"]} // start to end gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            {
              flex: 0,
              height: "100%",
              // paddingTop:
              //   Platform.OS === "ios"
              //     ? StatusBar.currentHeight + 50
              //     : StatusBar.currentHeight,
            },
          ]}
        >
          <ImageBackground
            source={require("../assets/bg-hibiscus.png")} // Your image path
            style={[
              styles.container,
              {
                paddingTop:
                  Platform.OS === "ios"
                    ? StatusBar.currentHeight + 50
                    : StatusBar.currentHeight,
              },
            ]}
            resizeMode="cover"
          >
            <Text style={[styles.text]}>Create Your Post</Text>
            <StatusBar style="auto" />
            <ScrollView
              style={[
                styles.container2,
                {
                  flex: 0,
                  height: "100%",
                  borderBottomRightRadius: 0,
                  borderBottomLeftRadius: 0,
                },
              ]}
            >
              <View style={[styles.containerAttachMedia]}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.labelInput, { fontSize: 20 }]}>
                    Select Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setFilterModalVisible(true)}
                    style={{
                      backgroundColor: "#efefef",
                      borderWidth: 0.3,
                      minWidth: 165,
                      paddingHorizontal: 20,
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
                        fontSize: 15,
                        color: "#101010",
                      }}
                    >
                      {category === "" ? "Choose Category" : category}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.labelInput, { fontSize: 20, marginTop: 20 }]}
                >
                  Title
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={[styles.labelInput, { fontSize: 20 }]}>
                  Content
                </Text>
                <TextInput
                  style={[styles.input, { paddingTop: 10, height: 200 }]}
                  multiline={true}
                  numberOfLines={10}
                  placeholder="Write out your content"
                  value={content}
                  onChangeText={setContent}
                />
              </View>

              {/* buttons submit post and attach media */}
              {/* <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={[
                    styles.button,
                    {
                      marginRight: 15,
                      paddingVertical: 15,
                      backgroundColor: "#03633a",
                      borderRadius: 25,
                    },
                  ]}
                >
                  <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>
                    Attach Media
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => writeData()}
                  style={[
                    styles.button,
                    {
                      marginRight: 15,
                      paddingVertical: 15,
                      backgroundColor: "#03633a",
                      borderRadius: 25,
                    },
                  ]}
                >
                  <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>
                    Submit Post
                  </Text>
                </TouchableOpacity>
              </View> */}

              {/* <Text style={{ marginVertical: 10 }}>
                Media selected: {image?.length}
              </Text> */}

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
                      fontFamily: "Nunito-Regular",
                      fontSize: 20,
                      color: "#fdfdfd",
                    }}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navi.navigate("Forum")}
                  style={[
                    styles.button,
                    {
                      // maxWidth: 100,
                      backgroundColor: "#ff6347",
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
                      fontFamily: "Nunito-Regular",
                      fontSize: 20,
                      color: "#fdfdfd",
                    }}
                  >
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 50 }} />
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
            </ScrollView>
            <BottomBar></BottomBar>
          </ImageBackground>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}
