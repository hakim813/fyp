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
  const [selectedCategory, setSelectedCategory] = useState("General");

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
    if (selectedCategory !== "All") {
      results = results.filter((post) => post.category === selectedCategory);
    }
    setFilteredPosts(results);
  }, [searchQuery, posts, selectedCategory]);

  // useEffect(() => {
  //   //for filtering posts based on query in search bar
  //   const lowercasedQuery = searchQuery.toLowerCase();
  //   const results = posts.filter(
  //     (post) =>
  //       post.title.toLowerCase().includes(lowercasedQuery) ||
  //       post.content.toLowerCase().includes(lowercasedQuery)
  //   );
  //   setFilteredPosts(results);
  // }, [searchQuery, posts]);

  return (
    <View style={[stylesHome.bg, { paddingRight: 0 }]}>
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
                marginHorizontal: 15,
              },
            ]}
            placeholder="Search any content. . ."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
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
                        { paddingVertical: 10, backgroundColor: "#fafafa" },
                      ]}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "flex-end" }}
                      >
                        <View>
                          <Text
                            style={{
                              fontFamily: "Nunito-ExtraBold",
                              fontSize: 25,
                            }}
                          >
                            {item.title.length > 15
                              ? `${item.title.slice(0, 15)}...`
                              : item.title}
                          </Text>

                          <Text>
                            <Text style={{ fontFamily: "Nunito-ExtraBold" }}>
                              Written by:{" "}
                            </Text>
                            {item.user}
                          </Text>
                        </View>

                        <View
                          style={{
                            marginLeft: "auto",
                          }}
                        >
                          <Text
                            style={{
                              marginLeft: "auto",
                              color: "grey",
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            {item.category}
                          </Text>
                          <Text
                            style={{
                              marginLeft: "auto",
                              color: "grey",
                              fontFamily: "Nunito",
                            }}
                          >
                            {new Date(item.date).toDateString()}
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
                          style={{ flexDirection: "row", alignItems: "center" }}
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
                              backgroundColor: "red",
                              marginLeft: "auto",
                              borderRadius: 50,
                              paddingHorizontal: 25,
                              paddingVertical: 5,
                            }}
                          >
                            <Icon
                              name="trash"
                              size={20}
                              color={"#fdfdfd"} // Change color based on isUpvoted
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
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
                        { paddingVertical: 10, backgroundColor: "#fafafa" },
                      ]}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "flex-end" }}
                      >
                        <View>
                          <Text
                            style={{
                              fontFamily: "Nunito-ExtraBold",
                              fontSize: 25,
                            }}
                          >
                            {item.title.length > 15
                              ? `${item.title.slice(0, 15)}...`
                              : item.title}
                          </Text>

                          <Text>
                            <Text style={{ fontFamily: "Nunito-ExtraBold" }}>
                              Written by:{" "}
                            </Text>
                            {item.user}
                          </Text>
                        </View>

                        <View
                          style={{
                            marginLeft: "auto",
                          }}
                        >
                          <Text
                            style={{
                              marginLeft: "auto",
                              color: "grey",
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            {item.category}
                          </Text>
                          <Text
                            style={{
                              marginLeft: "auto",
                              color: "grey",
                              fontFamily: "Nunito",
                            }}
                          >
                            {new Date(item.date).toDateString()}
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
                          style={{ flexDirection: "row", alignItems: "center" }}
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
                              backgroundColor: "red",
                              marginLeft: "auto",
                              borderRadius: 50,
                              paddingHorizontal: 25,
                              paddingVertical: 5,
                            }}
                          >
                            <Icon
                              name="trash"
                              size={20}
                              color={"#fdfdfd"} // Change color based on isUpvoted
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
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
                              backgroundColor: "red",
                              marginLeft: "auto",
                              borderRadius: 50,
                              paddingHorizontal: 25,
                              paddingVertical: 5,
                            }}
                          >
                            <Icon
                              name="trash"
                              size={20}
                              color={"#fdfdfd"} // Change color based on isUpvoted
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                }
              }}
            />
          )}
        </View>
      </LinearGradient>

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
              style={{ fontWeight: "bold", fontSize: 20, marginBottom: 10 }}
            >
              Select Category
            </Text>
            <Picker
              selectedValue={selectedCategory}
              style={{ width: "100%" }}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="All" value="All" color="black" />
              <Picker.Item label="General" value="General" color="black" />
              <Picker.Item
                label="Announcement"
                value="Announcement"
                color="black"
              />
              <Picker.Item label="Question" value="Question" color="black" />
              <Picker.Item label="Event" value="Event" color="black" />
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
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Apply</Text>
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

      <TouchableOpacity
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
      </TouchableOpacity>

      <BottomBar></BottomBar>

      <TouchableOpacity
        onPress={() => navi.navigate("CreatePost")}
        style={[
          {
            position: "absolute",
            bottom: 20,
            right: "42%",
            alignSelf: "center",
            paddingHorizontal: 25,
            marginTop: 10,
            paddingVertical: 15,
            backgroundColor: "#81b0ff",
            borderRadius: 100,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 3,
          },
        ]}
      >
        <Text style={{ color: "#1b434d", fontWeight: "800", fontSize: 30 }}>
          +
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={[styles.centeredView]}>
          <Text
            style={{
              // backgroundColor: "red",
              position: "absolute",
              left: 15,
              fontWeight: "bold",
              fontSize: 30,
              marginLeft: 15,
              marginTop: 15,
            }}
          >
            Comment
          </Text>
          <TouchableOpacity
            onPress={() => setIsVisible(false)}
            style={{
              position: "absolute",
              right: 20,
              fontWeight: "bold",
              fontSize: 30,
              marginLeft: 15,
              marginTop: 15,
              fontSize: 30,
            }}
          >
            <Icon name="close" size={24} />
          </TouchableOpacity>
          {/* <Text onPress={()=>setIsVisible(false)} style={{position: 'absolute', right: 20, fontWeight: 'bold', fontSize: 30, marginLeft: 15, marginTop: 15, fontSize: 30}}>X</Text> */}
          <FlatList
            style={{ paddingTop: 0, marginTop: 60 }}
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.post == selectedPost.id) {
                return (
                  <View
                    style={[
                      stylesHome.context,
                      {
                        flexDirection: "row",
                        minHeight: 10,
                        borderBottomWidth: 0.3,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri: "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png",
                      }}
                      style={{
                        potition: "absolute",
                        width: 30,
                        height: 40,
                        width: 40,
                        marginBottom: 10,
                        resizeMode: "cover",
                        borderRadius: 75,
                        borderWidth: 1,
                      }}
                    />
                    <View style={{ marginLeft: 10, border: "#111" }}>
                      <Text style={{ fontWeight: "bold" }}>{item.user}</Text>
                      <Text style={{ marginTop: 5 }}>{item.comment}</Text>
                    </View>
                  </View>
                );
              }
            }}
          />
          <TextInput
            style={[
              styles.input,
              {
                borderRadius: 50,
                position: "absolute",
                width: "72%",
                left: 15,
                bottom: 20,
                margin: 10,
                marginTop: "auto",
                marginBottom: 70,
              },
            ]}
            placeholder="Comment"
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            onPress={() => {
              writeData(selectedPost);
            }}
            style={[
              styles.submitComment,
              {
                marginBottom: 90,
              },
            ]}
          >
            <Text
              style={{
                color: "#fdfdfd",
                fontWeight: "800",
                fontSize: 30,
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
