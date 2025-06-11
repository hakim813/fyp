import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Alert,
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
  Modal,
  Image,
  Touchable,
} from "react-native";
import { styles, stylesHome } from "../styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import { ref, getDatabase, onValue, update, set } from "firebase/database";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function HelpdeskHome() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const { user } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const flatListRef = useRef(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isOngoingPage, setIsOngoingPage] = useState(true);
  //   const { pDate, pTime } = route.params || {};

  const navi = useNavigation();

  // const { rDate, rTime } = route.params || {};

  useEffect(() => {
    const db = getDatabase();
    const complaintRef = ref(db, "complaints");

    onValue(complaintRef, (snapshot) => {
      const data = snapshot.val();

      let fetchedComplaints = [];
      let allComplaints = [];

      if (data) {
        // Convert the object to an array of posts
        fetchedComplaints = Object.keys(data)
          .map((key) => ({
            id: key,
            createdAt: data[key].createdAt,
            category: data[key].category,
            description: data[key].description,
            photoURL: data[key].photoURL,
            status: data[key].status,
            ticketNumber: data[key].ticketNumber,
            title: data[key].title,
            userId: data[key].userId,
          }))
          .filter(
            (item) => item.userId === user.uid && item.status === "ongoing"
          ); // Filter here;

        allComplaints = Object.keys(data)
          .map((key) => ({
            id: key,
            createdAt: data[key].createdAt,
            category: data[key].category,
            description: data[key].description,
            photoURL: data[key].photoURL,
            status: data[key].status,
            ticketNumber: data[key].ticketNumber,
            title: data[key].title,
            userId: data[key].userId,
          }))
          .filter((item) => item.userId === user.uid);
      } else {
        console.log("No data found in the database.");
      }
      setData(fetchedComplaints);
      setAllData(allComplaints);
    });
  }, []);

  const setResolved = (id) => {
    const db = getDatabase();
    const complaintRef = ref(db, `complaints/${id}`);

    // Correct usage of update:
    update(complaintRef, { status: "Resolved" })
      .then(() => {
        console.log("Complaint marked as resolved.");
      })
      .catch((error) => {
        console.error("Error updating complaint:", error);
      });
  };

  return (
    <View style={styles.container3}>
      <View style={styles.container}>
        {/* <LinearGradient
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
        > */}
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
          <Text style={[styles.text]}>Helpdesk</Text>
          {/* <View
            style={[
              styles.container2,
              {
                borderRadius: 0,
                padding: 0,
                paddingTop: 5,
                // paddingBottom: 100,
              },
            ]}
          > */}

          <View
            style={[
              styles.container2,
              {
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                paddingTop: 5,
                padding: 0,
              },
            ]}
          >
            {/* {data[currentIndex].email === user.email && ( */}

            {/* this should be the title of the social protection plan  */}
            {/* <Text style={[style.title, {fontFamily: 'Nunito'}]}>{data[currentIndex].title}</Text>  */}
            <Modal
              visible={mediaModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setMediaModalVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    height: "50%",
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    justifyContent: "center",
                    // alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setMediaModalVisible(false)} // Close the modal
                  >
                    <Text
                      style={{
                        marginRight: 15,
                        marginLeft: "auto",
                        color: "#fdfdfd",
                        fontSize: 30,
                      }}
                    >
                      x
                    </Text>
                  </TouchableOpacity>
                  <ScrollView horizontal>
                    {selectedMedia.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={{
                          width: 400,
                          height: 400,
                          margin: 10,
                          // borderRadius: 10
                          // borderWidth: 0.5,
                          // borderColor: "#fff",
                          backgroundColor: "rgba(0,0,0,0)",
                        }}
                        resizeMode="contain"
                      />
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <View>
              {isOngoingPage ? (
                <FlatList
                  // style={{ backgroundColor: "red" }}
                  data={data}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    return (
                      <View
                        style={[
                          stylesHome.context,
                          {
                            minHeight: 10,
                            paddingVertical: 10,
                            marginBottom: 8,
                            marginHorizontal: 8,
                            backgroundColor: "#fafafa",
                            borderRadius: 12,
                            borderWidth: 0.1,

                            // Shadow for iOS
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,

                            // Shadow for Android
                            elevation: 5,
                          },
                        ]}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-end",
                            // marginBottom: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Nunito-Bold",
                              fontSize: 20,
                            }}
                          >
                            {/* {item.title.length > 15
                    ? `${item.title.slice(0, 15)}...`
                    : item.title} */}
                            {item.ticketNumber}
                          </Text>

                          <Text
                            style={{
                              marginLeft: "auto",
                              color: "grey",
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            {item.category}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "Nunito",
                              marginBottom: 3,
                            }}
                          >
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </Text>

                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 18,
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            Description
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              fontFamily: "Nunito-Regular",
                            }}
                          >
                            {item.description}
                          </Text>
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 18,
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            Attached Media
                          </Text>
                          {item.photoURL && item.photoURL.length > 0 ? (
                            <TouchableOpacity
                              onPress={() => {
                                // If item.photoURL is a string, wrap it in an array
                                setSelectedMedia(
                                  Array.isArray(item.photoURL)
                                    ? item.photoURL
                                    : [item.photoURL]
                                );
                                setMediaModalVisible(true);
                              }}
                              style={{
                                backgroundColor: "#efefef",
                                borderWidth: 0.3,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                marginTop: 5,
                                borderRadius: 50,
                                marginRight: "auto",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontFamily: "Nunito-Regular",
                                }}
                              >
                                View Media
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text
                              style={{
                                fontSize: 18,
                                fontFamily: "Nunito-Regular",
                                color: "grey",
                              }}
                            >
                              None
                            </Text>
                          )}
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setResolved(item.id);
                              }}
                              style={{
                                borderColor: item.status === "grey",
                                borderWidth: 1,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                marginRight: 10,
                                marginTop: 5,
                                borderRadius: 50,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Nunito-Regular",
                                  color: "#050505",
                                }}
                              >
                                Set as Resolved
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {}}
                              style={{
                                borderColor: item.status === "grey",
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                // marginLeft: "auto",
                                marginTop: 5,
                                borderRadius: 50,
                                backgroundColor:
                                  item.status === "ongoing"
                                    ? "yellow"
                                    : "green",
                              }}
                            >
                              <Icon
                                name={
                                  item.status === "ongoing"
                                    ? "frown-o"
                                    : "smile-o"
                                }
                                size={18}
                                style={{ color: "grey" }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  ListHeaderComponent={
                    <>
                      {/* <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        color: "#050505",
                        margin: 5,
                        marginLeft: 10,
                        fontSize: Platform.OS === "ios" ? 30 : 20,
                      }}
                    >
                      Ongoing Complaints
                    </Text> */}

                      <View
                        style={{
                          // backgroundColor: "red",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          flexDirection="row"
                          style={{
                            borderColor: "grey",
                            // borderWidth: 1,
                            paddingHorizontal: 5,
                            // paddingVertical: 5,
                            backgroundColor: "#fdfdfd",
                            marginVertical: 10,
                            borderRadius: 50,
                            // Shadow for iOS
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,

                            // Shadow for Android
                            elevation: 5,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setIsOngoingPage(true);
                            }}
                            style={{
                              // borderColor: "grey",
                              // borderWidth: 1,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              marginHorizontal: 5,
                              backgroundColor:
                                isOngoingPage === true ? "green" : "#fdfdfd",
                              marginVertical: 10,
                              borderRadius: 50,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Nunito-Regular",
                                color:
                                  isOngoingPage === true ? "#fdfdfd" : "green",
                              }}
                            >
                              Ongoing
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setIsOngoingPage(false);
                            }}
                            style={{
                              // borderColor: "grey",
                              // borderWidth: 1,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              marginHorizontal: 5,
                              backgroundColor:
                                isOngoingPage === true ? "#fdfdfd" : "green",
                              marginVertical: 10,
                              borderRadius: 50,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Nunito-Regular",
                                color:
                                  isOngoingPage === true ? "green" : "#fdfdfd",
                              }}
                            >
                              History
                            </Text>
                          </TouchableOpacity>
                          {/* <Text
                          style={{
                            fontFamily: "Nunito-Regular",
                            color: "#050505",
                          }}
                        >
                          Set as resolved
                        </Text> */}
                        </View>
                      </View>
                    </>
                  }
                  ListFooterComponent={
                    <View style={{ height: 90 }} /> // Adjust height to match or exceed your button's height + margin
                  }
                />
              ) : (
                <FlatList
                  // style={{ backgroundColor: "red" }}
                  data={allData}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    return (
                      <View
                        style={[
                          stylesHome.context,
                          {
                            minHeight: 10,
                            paddingVertical: 10,
                            marginBottom: 8,
                            marginHorizontal: 8,
                            backgroundColor: "#fafafa",
                            borderRadius: 12,
                            borderWidth: 0.1,

                            // Shadow for iOS
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,

                            // Shadow for Android
                            elevation: 5,
                          },
                        ]}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-end",
                            // marginBottom: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Nunito-Bold",
                              fontSize: 20,
                            }}
                          >
                            {/* {item.title.length > 15
                    ? `${item.title.slice(0, 15)}...`
                    : item.title} */}
                            {item.ticketNumber}
                          </Text>

                          <Text
                            style={{
                              marginLeft: "auto",
                              color: "grey",
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            {item.category}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "Nunito",
                              marginBottom: 3,
                            }}
                          >
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </Text>

                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 18,
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            Description
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              fontFamily: "Nunito-Regular",
                            }}
                          >
                            {item.description}
                          </Text>
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 18,
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            Attached Media
                          </Text>
                          {item.photoURL && item.photoURL.length > 0 ? (
                            <TouchableOpacity
                              onPress={() => {
                                // If item.photoURL is a string, wrap it in an array
                                setSelectedMedia(
                                  Array.isArray(item.photoURL)
                                    ? item.photoURL
                                    : [item.photoURL]
                                );
                                setMediaModalVisible(true);
                              }}
                              style={{
                                backgroundColor: "#efefef",
                                borderWidth: 0.3,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                marginTop: 5,
                                borderRadius: 50,
                                marginRight: "auto",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontFamily: "Nunito-Regular",
                                }}
                              >
                                View Media
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text
                              style={{
                                fontSize: 18,
                                fontFamily: "Nunito-Regular",
                                color: "grey",
                              }}
                            >
                              None
                            </Text>
                          )}

                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setResolved(item.id);
                              }}
                              style={{
                                borderColor: item.status === "grey",
                                // borderWidth: 1,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                marginRight: 10,
                                marginTop: 5,
                                borderRadius: 50,
                                backgroundColor: "red",
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Nunito-Regular",
                                  color: "#fdfdfd",
                                }}
                              >
                                Delete
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                if (item.status === "ongoing") {
                                  Alert.alert(
                                    "Ticket In Progress", // Title
                                    "This means our team is still working on your helpdesk ticket. Thank you for your patience!", // Message
                                    [{ text: "OK", onPress: () => {} }]
                                  );
                                } else {
                                  Alert.alert(
                                    "Ticket Is Resolved", // Title
                                    "This means your helpdesk ticket is resolved. Thank you for using our service!", // ✅ Fixed message
                                    [{ text: "OK", onPress: () => {} }]
                                  );
                                }
                              }}
                              style={{
                                borderColor: item.status === "grey",
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                // marginLeft: "auto",
                                marginTop: 5,
                                borderRadius: 50,
                                backgroundColor:
                                  item.status === "ongoing"
                                    ? "yellow"
                                    : "green",
                              }}
                            >
                              <Icon
                                name={
                                  item.status === "ongoing"
                                    ? "frown-o"
                                    : "smile-o"
                                }
                                size={18}
                                style={{
                                  color:
                                    item.status === "ongoing"
                                      ? "grey"
                                      : "#fdfdfd",
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  ListHeaderComponent={
                    <>
                      {/* <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        color: "#050505",
                        margin: 5,
                        marginLeft: 10,
                        fontSize: Platform.OS === "ios" ? 30 : 20,
                      }}
                    >
                      Ongoing Complaints
                    </Text> */}

                      <View
                        style={{
                          // backgroundColor: "red",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          flexDirection="row"
                          style={{
                            borderColor: "grey",
                            // borderWidth: 1,
                            paddingHorizontal: 5,
                            // paddingVertical: 5,
                            backgroundColor: "#fdfdfd",
                            marginVertical: 10,
                            borderRadius: 50,
                            // Shadow for iOS
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,

                            // Shadow for Android
                            elevation: 5,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setIsOngoingPage(true);
                            }}
                            style={{
                              // borderColor: "grey",
                              // borderWidth: 1,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              marginHorizontal: 5,
                              backgroundColor:
                                isOngoingPage === true ? "green" : "#fdfdfd",
                              marginVertical: 10,
                              borderRadius: 50,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Nunito-Regular",
                                color:
                                  isOngoingPage === true ? "#333333" : "green",
                              }}
                            >
                              Ongoing
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setIsOngoingPage(false);
                            }}
                            style={{
                              // borderColor: "grey",
                              // borderWidth: 1,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              marginHorizontal: 5,
                              backgroundColor:
                                isOngoingPage === true ? "#fdfdfd" : "green",
                              marginVertical: 10,
                              borderRadius: 50,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Nunito-Regular",
                                color:
                                  isOngoingPage === true ? "green" : "#fdfdfd",
                              }}
                            >
                              History
                            </Text>
                          </TouchableOpacity>
                          {/* <Text
                          style={{
                            fontFamily: "Nunito-Regular",
                            color: "#050505",
                          }}
                        >
                          Set as resolved
                        </Text> */}
                        </View>
                      </View>
                    </>
                  }
                  ListFooterComponent={
                    <View style={{ height: 90 }} /> // Adjust height to match or exceed your button's height + margin
                  }
                />
              )}
            </View>

            {/* <View
              style={[
                stylesHome.context,
                { paddingVertical: 10, backgroundColor: "#fafafa" },
              ]}
            ></View> */}

            {/* <View
              style={[
                stylesHome.context,
                { paddingVertical: 10, backgroundColor: "#fafafa", margin: 10 },
              ]}
            ></View> */}

            {/* for adding space at bottom */}
          </View>

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
            onPress={() => navi.navigate("AddComplaint")}
          >
            <Text style={{ fontSize: 40, color: "#fdfdfd" }}>+</Text>
          </TouchableOpacity>

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
