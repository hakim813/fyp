import React, { useState, useContext, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Switch,
  Alert,
  Text,
  FlatList,
  Image,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ImageBackground,
} from "react-native";
import { styles, stylesHome } from "../styles";
import { database } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import { Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  ref,
  set,
  remove,
  push,
  getDatabase,
  get,
  onValue,
  child,
} from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState("");
  const { user, setUser } = useContext(UserContext);
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAll, setIsAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [detail, setDetail] = useState(null);
  const [imageLoad, setImageLoad] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("None");

  //to write data into database
  const writeData = async (item) => {
    if (!comment) {
      //if got no comment
      Alert.alert("Please fill in the comment.");
      return;
    }

    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

    const users = snapshot.val();
    const existingUser = Object.values(users).find(
      (u) => u.email === user.email
    ); // Match email

    const commentRef = ref(database, "comment/");
    const newCommentRef = push(commentRef);

    set(newCommentRef, {
      user: existingUser.username,
      email: user.email,
      comment: comment,
      post: item.id,
    })
      .then(() => {
        setComment("");
        console.log("Comment added to the database successfully!");

        const postRef = ref(database, `posts/${item.id}`); //Reference to the specific post

        get(postRef)
          .then((snapshot) => {
            const postData = snapshot.val();
            const currentCommentIds = postData?.commentId || []; //Get existing commentId array (if exists)

            // Add the new commentId to the array
            const updatedCommentIds = [...currentCommentIds, newCommentRef.key]; //Append the new commentId

            set(postRef, {
              ...postData,
              commentId: updatedCommentIds, //Update the commentId array with the new commentId
            })
              .then(() => {
                console.log("Post updated with new commentId!");
              })
              .catch((error) => {
                console.error("Error updating post with commentId:", error);
              });
          })
          .catch((error) => {
            console.error("Error fetching post data:", error);
          });
      })
      .catch((error) => {
        console.error("Error writing comment data:", error);
      });
  };

  //deletePost
  const deleteData = (id) => {
    const postRef = ref(database, `posts/${id}`);

    remove(postRef)
      .then(() => {
        console.log("Data deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting data: ", error);
      });
  };

  //like post function
  const thumbsUp = (item) => {
    const postRef = ref(database, `posts/${item.id}`); // Reference to the specific post

    get(postRef)
      .then((snapshot) => {
        const postData = snapshot.val();
        const currentUpvoterId = postData?.upvoter || []; // Get existing commentId array (if exists)

        let updatedUpvoterId;

        if (currentUpvoterId.includes(user.uid)) {
          console.log(currentUpvoterId);
          updatedUpvoterId = currentUpvoterId.filter((id) => id !== user.uid);
          console.log(`${updatedUpvoterId} has upvoted post ${item.id}`);
        } else {
          // Add the new commentId to the array
          updatedUpvoterId = [...currentUpvoterId, user.uid]; // Append the new commentId
        }

        set(postRef, {
          ...postData,
          upvoter: updatedUpvoterId, // Update the commentId array with the new commentId
        })
          .then(() => {
            console.log("Post updated with new upvoter!");
          })
          .catch((error) => {
            console.error("Error updating post with commentId:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching post data:", error);
      });
  };

  const navi = useNavigation();
  //to update post with real-time database

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "posts");

    // Listen to data changes in the "posts" node
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Convert the object to an array of posts
        const fetchedPosts = Object.keys(data).map((key) => ({
          id: key,
          user: data[key].user,
          email: data[key].email,
          title: data[key].title,
          content: data[key].content,
          date: data[key].date,
          profilePhoto:
            data[key].profilePhoto ||
            "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png",
          category: data[key].category,
          comment: data[key].commentId,
          upvoter: data[key].upvoter || [],
          imageURL: data[key].imageURL || [],
        }));

        if (isEnabled) {
          fetchedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
          fetchedPosts.sort((a, b) => b.upvoter?.length - a.upvoter?.length);
        }

        setPosts(fetchedPosts);
      } else {
        setPosts([]); // No data found
      }
    });

    const commentsRef = ref(db, "comment");
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedComments = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setComments(fetchedComments);
      } else {
        setComments([]);
      }
    });
  }, [isEnabled]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    let results = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercasedQuery) ||
        post.content.toLowerCase().includes(lowercasedQuery)
    );
    if (selectedCategory !== "None") {
      results = results.filter((post) => post.category === selectedCategory);
    }
    setFilteredPosts(results);
  }, [searchQuery, posts, selectedCategory]);

  return (
    <View style={[stylesHome.bg, { paddingRight: 0 }]}>
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
        <View style={{ flex: 1 }}>
          <Text
            style={[
              stylesHome.welcomeText,
              { color: "#fafafa", marginHorizontal: 15 },
            ]}
          >
            Community Forum
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "#fdfdfd",
                borderRadius: 20,
                marginHorizontal: 10,
                marginTop: 10,
              },
            ]}
            placeholder="Search any content. . ."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {/* <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: "#fdfdfd",
                borderRadius: 20,
                marginHorizontal: 5,
              },
            ]}
          ></TouchableOpacity> */}
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 15,
              marginBottom: 15,
            }}
          >
            <TouchableOpacity
              onPress={() => setIsAll(true)}
              style={[
                {
                  marginRight: 10,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  minWidth: 90,
                  fontWeight: "bold",
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                },
                isAll
                  ? { backgroundColor: "#fdfdfd" }
                  : { backgroundColor: "grey" },
              ]}
            >
              <Text
                style={[
                  { fontFamily: "Nunito-Bold", fontSize: 15 },
                  isAll ? { color: "#06a561" } : { color: "#020202" },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAll(false)}
              style={[
                {
                  marginRight: 25,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  minWidth: 90,
                  fontWeight: "bold",
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                },
                isAll
                  ? { backgroundColor: "grey" }
                  : { backgroundColor: "#fdfdfd" },
              ]}
            >
              <Text
                style={[
                  { fontFamily: "Nunito-Bold", fontSize: 15 },
                  isAll ? { color: "#020202" } : { color: "#06a561" },
                ]}
              >
                Your Post
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                marginLeft: "auto",
                alignSelf: "center",
                color: "#fdfdfd",
                fontWeight: "bold",
              }}
            >
              Top
            </Text>
            <Switch
              style={{
                marginLeft: "auto",
                color: "#fdfdfd",
                fontWeight: "bold",
              }}
              trackColor={{ false: "#fdfdfd", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#1b434d" : "#81b0ff"}
              ios_backgroundColor="#3e3e3e"
              value={isEnabled}
              onValueChange={(value) => setIsEnabled(value)}
            />
            <Text
              style={{
                marginLeft: "auto",
                marginRight: 10,
                alignSelf: "center",
                color: "#fdfdfd",
                fontWeight: "bold",
              }}
            >
              Latest
            </Text>
          </View>

          {filteredPosts.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontWeight: "bold", fontSize: 25, color: "white" }}
              >
                No content available
              </Text>
            </View>
          ) : (
            <>
              <View>
                <TouchableOpacity
                  onPress={() => setFilterModalVisible(true)}
                  style={[
                    {
                      // marginRight: 25,
                      width: "100%",
                      backgroundColor: "#bbb",
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      minWidth: 90,
                      fontWeight: "bold",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={[{ fontFamily: "Nunito-Bold", fontSize: 15 }]}>
                    Filter
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList //d6ffa7
                style={{ paddingVertical: 10, backgroundColor: "#dedede" }}
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  //for all posts
                  if (isAll) {
                    return (
                      <View
                        style={[
                          stylesHome.context,
                          {
                            paddingVertical: 10,
                            backgroundColor: "#fafafa", // Shadow for iOS
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.25,
                            shadowRadius: 1,
                            borderWidth: 0,
                            // Shadow for Android
                            elevation: 2,
                            marginHorizontal: 10,
                          },
                        ]}
                      >
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              // backgroundColor: "red",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={{
                                uri:
                                  item.profilePhoto ||
                                  "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png",
                              }}
                              style={{
                                width: 35,
                                height: 35,
                                borderRadius: 50,
                                backgroundColor: "blue", // fallback color if image fails to load
                              }}
                            />
                            <Text
                              style={{
                                marginLeft: 5,
                                fontFamily: "Nunito-Regular",
                                fontSize: 16,
                              }}
                            >
                              {/* <Text style={{ fontFamily: "Nunito-ExtraBold" }}>
                                Written by:{" "}
                              </Text> */}
                              {item.user}
                            </Text>
                            <Text
                              style={{
                                marginLeft: 5,
                                fontFamily: "Nunito-Bold",
                                color: "grey",
                                marginLeft: "auto",
                                marginRight: 10,
                                fontSize: 16,
                              }}
                            >
                              {/* <Text style={{ fontFamily: "Nunito-ExtraBold" }}>
                                Written by:{" "}
                              </Text> */}
                              {item.category}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              // backgroundColor: "blue",
                              justifyContent: "flex-start",
                            }}
                          >
                            <Text
                              style={{
                                marginTop: 5,
                                fontFamily: "Nunito-Bold",
                                fontSize: 20,
                              }}
                            >
                              {item.title}
                            </Text>
                          </View>
                        </View>
                        <View style={{ marginBottom: 0 }}>
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 20,
                              fontFamily: "Nunito",
                            }}
                          >
                            {item.content}
                          </Text>
                          {/* Display multiple images */}
                          {/* {item.imageUris && Array.isArray(item.imageUris) ? ( */}
                          {item.imageURL &&
                          Array.isArray(item.imageURL) &&
                          item.imageURL.length > 0 ? (
                            <FlatList
                              data={item.imageURL}
                              keyExtractor={(uri, index) =>
                                `${item.id}-image-${index}`
                              }
                              horizontal
                              style={{}}
                              renderItem={({ item: uri }) => (
                                <View
                                  style={{
                                    width: 200,
                                    height: 200,
                                    marginLeft: 0,
                                    margin: 10,
                                    // borderRadius: 5,
                                    // borderWidth: 1,
                                    // borderColor: "#ccc",
                                  }}
                                >
                                  {/* {imageLoad && (
                                  <ActivityIndicator
                                    size="large"
                                    color="#0000ff"
                                  />
                                )} */}
                                  <Image
                                    source={{ uri }} // Ensure it's a URL from Firebase Storage
                                    style={{
                                      width: 200,
                                      height: 200,
                                      // margin: 10,
                                      borderRadius: 5,
                                      borderWidth: 1,
                                      borderColor: "#ccc",
                                    }}
                                    onLoad={() => setImageLoad(false)}
                                    resizeMode="cover"
                                  />
                                  {imageLoad && (
                                    <View
                                      style={{
                                        ...StyleSheet.absoluteFillObject, // fills the parent
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor:
                                          "rgba(235, 235, 235, 0.8)", // optional semi-transparent overlay
                                      }}
                                    >
                                      <ActivityIndicator
                                        size="large"
                                        color="#00ee00"
                                      />
                                      <Text>Loading image...</Text>
                                    </View>
                                  )}
                                </View>
                              )}
                            />
                          ) : (
                            <Text style={{ marginTop: 10, color: "gray" }}>
                              No images attached
                            </Text>
                          )}
                        </View>

                        <View style={{ marginTop: 0 }}>
                          <TextInput
                            style={[
                              styles.input,
                              {
                                marginTop: 10,
                                marginBottom: 5,
                                borderRadius: 20,
                                width: "100%",
                                left: 0,
                                bottom: 5,
                              },
                            ]}
                            placeholder="Comment"
                            onPress={() => {
                              setSelectedPost(item), setIsVisible(true);
                            }}
                          />
                        </View>

                        {item.email == user.email ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => thumbsUp(item)}
                              style={{ marginHorizontal: 10 }}
                            >
                              <Icon
                                name="thumbs-up"
                                size={24}
                                color={
                                  item.upvoter?.includes(user.uid)
                                    ? "green"
                                    : "gray"
                                } // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>
                              {item.upvoter?.length || 0}
                            </Text>

                            <TouchableOpacity
                              onPress={() =>
                                Alert.alert(
                                  "Delete Post",
                                  "Are you sure you want to delete this post?",
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel", // Adds the "Cancel" style (button is usually grayed out)
                                    },
                                    {
                                      text: "Delete",
                                      style: "destructive", // Adds the "Delete" style (usually red)
                                      onPress: () => deleteData(item.id),
                                    },
                                  ]
                                )
                              }
                              style={{
                                backgroundColor: "#fdfdfd",
                                marginLeft: "auto",
                                borderColor: "red",
                                borderWidth: 1,
                                borderRadius: 50,
                                paddingHorizontal: 25,
                                paddingVertical: 5,
                              }}
                            >
                              <Icon
                                name="trash"
                                size={20}
                                color={"red"} // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => thumbsUp(item)}
                              style={{ marginHorizontal: 10 }}
                            >
                              <Icon
                                name="thumbs-up"
                                size={24}
                                color={
                                  item.upvoter?.includes(user.uid)
                                    ? "green"
                                    : "gray"
                                } // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>
                              {item.upvoter?.length || 0}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  }
                  //for post by the acc owner
                  else if (item.email == user.email) {
                    return (
                      <View
                        style={[
                          stylesHome.context,
                          {
                            paddingVertical: 10,
                            backgroundColor: "#fafafa",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.25,
                            shadowRadius: 1,
                            borderWidth: 0,
                            // Shadow for Android
                            elevation: 2,
                          },
                        ]}
                      >
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              // backgroundColor: "red",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={{
                                uri:
                                  item.profilePhoto ||
                                  "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png",
                              }}
                              style={{
                                width: 35,
                                height: 35,
                                borderRadius: 50,
                                backgroundColor: "blue", // fallback color if image fails to load
                              }}
                            />
                            <Text
                              style={{
                                marginLeft: 5,
                                fontFamily: "Nunito-Regular",
                                fontSize: 16,
                              }}
                            >
                              {/* <Text style={{ fontFamily: "Nunito-ExtraBold" }}>
                                Written by:{" "}
                              </Text> */}
                              {item.user}
                            </Text>
                            <Text
                              style={{
                                marginLeft: 5,
                                fontFamily: "Nunito-Bold",
                                color: "grey",
                                marginLeft: "auto",
                                marginRight: 10,
                                fontSize: 16,
                              }}
                            >
                              {/* <Text style={{ fontFamily: "Nunito-ExtraBold" }}>
                                Written by:{" "}
                              </Text> */}
                              {item.category}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              // backgroundColor: "blue",
                              justifyContent: "flex-start",
                            }}
                          >
                            <Text
                              style={{
                                marginTop: 5,
                                fontFamily: "Nunito-Bold",
                                fontSize: 20,
                              }}
                            >
                              {item.title}
                            </Text>
                          </View>
                        </View>
                        <View style={{ marginBottom: 0 }}>
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 20,
                              fontFamily: "Nunito",
                            }}
                          >
                            {item.content}
                          </Text>
                          {/* Display multiple images */}
                          {item.imageURL && Array.isArray(item.imageURL) ? (
                            <FlatList
                              data={item.imageURL}
                              keyExtractor={(uri, index) =>
                                `${item.id}-image-${index}`
                              }
                              horizontal
                              style={{}}
                              renderItem={({ item: uri }) => (
                                <View
                                  style={{
                                    width: 200,
                                    height: 200,
                                    marginLeft: 0,
                                    margin: 10,
                                    borderRadius: 5,
                                    // borderWidth: 1,
                                    borderColor: "#ccc",
                                  }}
                                >
                                  {/* {imageLoad && (
                                  <ActivityIndicator
                                    size="large"
                                    color="#0000ff"
                                  />
                                )} */}
                                  <Image
                                    source={{ uri }}
                                    style={{
                                      width: 200,
                                      height: 200,
                                      // margin: 10,
                                      marginLeft: 0,
                                      resizeMode: "cover",
                                      borderRadius: 5,
                                      borderWidth: 1,
                                      borderColor: "#ccc",
                                    }}
                                    onLoad={() => setImageLoad(false)}
                                  />
                                  {imageLoad && (
                                    <View
                                      style={{
                                        ...StyleSheet.absoluteFillObject, // fills the parent
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor:
                                          "rgba(235, 235, 235, 0.8)", // optional semi-transparent overlay
                                      }}
                                    >
                                      <ActivityIndicator
                                        size="small"
                                        color="#00dd00"
                                      />
                                      <Text>Loading image...</Text>
                                    </View>
                                  )}
                                </View>
                              )}
                            />
                          ) : (
                            <Text style={{ marginTop: 10, color: "gray" }}>
                              No images attached
                            </Text>
                          )}
                        </View>
                        {/* comment */}

                        <View style={{ marginTop: 0 }}>
                          <TextInput
                            style={[
                              styles.input,
                              {
                                marginTop: 10,
                                marginBottom: 5,
                                borderRadius: 20,
                                width: "100%",
                                left: 0,
                                bottom: 5,
                              },
                            ]}
                            placeholder="Comment"
                            onPress={() => {
                              setSelectedPost(item), setIsVisible(true);
                            }}
                          />
                        </View>

                        {item.email == user.email ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => thumbsUp(item)}
                              style={{ marginHorizontal: 10 }}
                            >
                              <Icon
                                name="thumbs-up"
                                size={24}
                                color={
                                  item.upvoter?.includes(user.uid)
                                    ? "green"
                                    : "gray"
                                } // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>
                              {item.upvoter?.length || 0}
                            </Text>

                            <TouchableOpacity
                              onPress={() =>
                                Alert.alert(
                                  "Delete Post",
                                  "Are you sure you want to delete this post?",
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel", // Adds the "Cancel" style (button is usually grayed out)
                                    },
                                    {
                                      text: "Delete",
                                      style: "destructive", // Adds the "Delete" style (usually red)
                                      onPress: () => deleteData(item.id),
                                    },
                                  ]
                                )
                              }
                              style={{
                                backgroundColor: "#fdfdfd",
                                marginLeft: "auto",
                                borderColor: "red",
                                borderWidth: 1,
                                borderRadius: 50,
                                paddingHorizontal: 25,
                                paddingVertical: 5,
                              }}
                            >
                              <Icon
                                name="trash"
                                size={20}
                                color={"red"} // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => thumbsUp(item)}
                              style={{ marginHorizontal: 10 }}
                            >
                              <Icon
                                name="thumbs-up"
                                size={24}
                                color={
                                  item.upvoter?.includes(user.uid)
                                    ? "green"
                                    : "gray"
                                } // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>
                              {item.upvoter?.length || 0}
                            </Text>

                            <TouchableOpacity
                              onPress={() =>
                                Alert.alert(
                                  "Delete Post",
                                  "Are you sure you want to delete this post?",
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel", // Adds the "Cancel" style (button is usually grayed out)
                                    },
                                    {
                                      text: "Delete",
                                      style: "destructive", // Adds the "Delete" style (usually red)
                                      onPress: () => deleteData(item.id),
                                    },
                                  ]
                                )
                              }
                              style={{
                                backgroundColor: "#fdfdfd",
                                marginLeft: "auto",
                                borderColor: "red",
                                borderWidth: 1,
                                borderRadius: 50,
                                paddingHorizontal: 25,
                                paddingVertical: 5,
                              }}
                            >
                              <Icon
                                name="trash"
                                size={20}
                                color={"red"} // Change color based on isUpvoted
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  }
                }}
                ListFooterComponent={
                  <View
                    style={{
                      height: 90,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  ></View>
                }
              />
            </>
          )}
        </View>
      </ImageBackground>

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
                fontFamily: "Nunito-Bold",
                fontSize: 20,
                marginBottom: 10,
              }}
            >
              Select Category
            </Text>
            <Picker
              selectedValue={selectedCategory}
              style={{ width: "100%" }}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="None" value="None" color="black" />
              <Picker.Item label="General" value="General" color="black" />
              <Picker.Item
                label="Announcement"
                value="Announcement"
                color="black"
              />
              <Picker.Item label="Accident" value="Accident" color="black" />
              <Picker.Item label="Event" value="Event" color="black" />
              {/* Add more categories as needed */}
            </Picker>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: "green",
                borderRadius: 20,
                paddingHorizontal: 30,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: "#fff", fontFamily: "Nunito-Bold" }}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => navi.navigate("CreatePost")}
        style={[
          {
            position: "absolute",
            bottom: 20,
            right: "40%",
            alignSelf: "center",
            paddingHorizontal: 25,
            marginTop: 10,
            paddingVertical: 15,
            backgroundColor: "#1b434d",
            borderRadius: 100,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 3,
          },
        ]}
      >
        <Text style={{ color: "#fdfdfd", fontWeight: "800", fontSize: 30 }}>
          +
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        onPress={() => setFilterModalVisible(true)}
        style={[
          {
            position: "absolute",
            bottom: 120,
            right: "5%",
            paddingHorizontal: 25,
            marginTop: 10,
            paddingVertical: 15,
            backgroundColor: "#03633a",
            borderRadius: 120,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 3,
          },
        ]}
      >
        <Text style={{ color: "#fdfdfd", fontWeight: "20", fontSize: 30 }}>
          Filter
        </Text>
      </TouchableOpacity> */}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "flex-end",
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={80} // adjust as needed for your header/nav
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "80%",
              paddingBottom: 300,
              paddingTop: 20,
              paddingHorizontal: 10,
              flex: 1,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 22, flex: 1 }}>
                Comments
              </Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Icon name="close" size={24} />
              </TouchableOpacity>
            </View>
            {/* Comments List */}
            <FlatList
              data={comments.filter((c) => c.post === selectedPost?.id)}
              keyExtractor={(item) => item.id}
              style={{ marginBottom: 60 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 15,
                  }}
                >
                  <Image
                    source={{
                      uri: "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png",
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: "#eee",
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: "#f1f1f1",
                      borderRadius: 15,
                      padding: 10,
                      flex: 1,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
                      {item.user}
                    </Text>
                    <Text style={{ color: "#333" }}>{item.comment}</Text>
                    {/* Optional: Add timestamp if available */}
                    {/* <Text style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{item.date}</Text> */}
                  </View>
                </View>
              )}
            />
            {/* Input Area */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // paddingVertical: 10,
                  borderTopWidth: 1,
                  borderColor: "#eee",
                  // backgroundColor: "red",
                  position: "absolute",
                  bottom: 30,
                  left: 0,
                  right: 0,
                  paddingHorizontal: 10,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: "#f1f1f1",
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    fontSize: 16,
                    marginRight: 10,
                  }}
                  placeholder="Write a comment..."
                  value={comment}
                  onChangeText={setComment}
                />
                <TouchableOpacity
                  onPress={() => writeData(selectedPost)}
                  style={{
                    backgroundColor: "#1b434d",
                    borderRadius: 20,
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <BottomBar></BottomBar>

      <TouchableOpacity
        style={{
          backgroundColor: "green",
          position: "absolute",
          right: 20,
          bottom: 115,
          width: 70, // set width
          height: 70, // set height
          borderRadius: 35, // half of width/height for a circle
          alignItems: "center",
          justifyContent: "center",
          elevation: 4, // optional: shadow on Android
          shadowColor: "#000", // optional: shadow on iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}
        onPress={() => navi.navigate("CreatePost")}
      >
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
