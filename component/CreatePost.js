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
  Image,
  TouchableOpacity,
} from "react-native";
import styles from "../styles";
import { database } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import { firebase } from "../firebase";
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

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useContext(UserContext);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState([]);
  const navi = useNavigation();
  const storage = getStorage(); // Initialize Firebase Storage

  // const pickImage = async () => {
  //   try {
  //     let result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images
  //       allowsMultipleSelection: true,
  //       allowsEditing: true,
  //       quality: 1, // High quality
  //     });

  //     if (!result.canceled) {
  //       const selectedUris = result.assets.map((asset) => asset.uri); // Extract URIs
  //       console.log(selectedUris); // Log selected URIs
  //       setImageUris([...imageUris, ...selectedUris]);
  //     } else {
  //       console.log("Image picking canceled.");
  //     }
  //   } catch (error) {
  //     console.error("Error picking image: ", error);
  //   }
  // };

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

  // const uploadMedia = async () => {
  //   setLoading(true);
  //   console.log("Uploading media...");

  //   try {
  //     const { uri } = await FileSystem.getInfoAsync(image);
  //     const blob = await new Promise((resolve, reject) => {
  //       const xhr = new XMLHttpRequest();
  //       xhr.onload = function () {
  //         resolve(xhr.response);
  //       };
  //       xhr.onerror = function (e) {
  //         console.log(e);
  //         reject(new TypeError("Network request failed"));
  //       };
  //       xhr.responseType = "blob";
  //       xhr.open("GET", uri, true);
  //       xhr.send(null);
  //     });

  //     const filename = image.substring(image.lastIndexOf("/") + 1);
  //     const storageRef = ref(storage, filename);

  //     await uploadBytes(storageRef, blob); // Use uploadBytes!

  //     blob.close(); // Free up memory

  //     setLoading(false);
  //     Alert.alert("Image uploaded successfully!");
  //     setImage(null);
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     setLoading(false);
  //   }
  // };

  // const uploadMedia = async () => {

  // };

  const writeData = async (idNo, username) => {
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

    // uploadMedia();

    // if (image.length === 0) {
    //   return;
    // }

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
        title: title ? title : "No title attached",
        content: content,
        date: serverTimestamp(),
        upvoter: [],
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
              backgroundColor: "#ffffffb3",
            }}
            //   // position: "absolute",
            //   width: "100%",
            // height: Dimensions.get("window").height,
            //   backgroundColor: "blue",
            //   justifyContent: "center",
            //   alignItems: "center",
            // }}
          >
            <LinearGradient
              colors={["#03633a", "#95f6cc"]} // start to end gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.container,
                {
                  position: "absolute",
                  borderRadius: 30,
                  // left: 0,
                  // top: 0,
                  // right: 0,
                  // bottom: 0,
                  // flex: 0,
                  width: 300,
                  height: 200,
                  // paddingTop:
                  //   Platform.OS === "ios"
                  //     ? StatusBar.currentHeight + 50
                  //     : StatusBar.currentHeight,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
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
            </LinearGradient>
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
              paddingTop:
                Platform.OS === "ios"
                  ? StatusBar.currentHeight + 50
                  : StatusBar.currentHeight,
            },
          ]}
        >
          <Text style={[styles.text]}>Create Your Post</Text>
          <StatusBar style="auto" />
          <View style={[styles.container2, { flex: 0, height: "100%" }]}>
            <View style={[styles.containerAttachMedia]}>
              <Text
                style={[
                  styles.labelInput,
                  { fontSize: 25, fontWeight: "bold" },
                ]}
              >
                Title
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />

              <Text
                style={[
                  styles.labelInput,
                  { fontSize: 25, fontWeight: "bold" },
                ]}
              >
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
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.button,
                  {
                    marginRight: 15,
                    paddingVertical: 15,
                    backgroundColor: "#1b434d",
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
                    backgroundColor: "#1b434d",
                    borderRadius: 25,
                  },
                ]}
              >
                <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>
                  Submit Post
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ marginVertical: 10 }}>
              Media selected: {image?.length}
            </Text>

            <ScrollView horizontal>
              {/* {imageUris.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{
                    height: 200, // Fixed height
                    aspectRatio: 1, // Default fallback
                    // marginRight: 10,
                  }}
                  resizeMode="cover" // or "cover" depending on your need
                  onLoad={(e) => {
                    const { width, height } = e.nativeEvent.source;
                    // Optionally you can store aspect ratios if you want to optimize
                  }}
                />
              ))} */}
              {/* {image && (
                <Image
                  source={{ uri: image }}
                  style={{ width: 300, height: 300 }}
                />
              )}
               */}
              {image.length > 0 &&
                image.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{ width: 300, height: 300, marginBottom: 10 }}
                  />
                ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}
