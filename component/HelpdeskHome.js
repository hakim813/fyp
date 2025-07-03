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
  TextInput,
  Modal,
  Image,
  Touchable,
} from "react-native";
import { styles, stylesHome } from "../styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import {
  ref,
  getDatabase,
  get,
  onValue,
  update,
  set,
  remove,
  push,
} from "firebase/database";
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
  const [showHelp, setShowHelp] = useState(false);
  const [showStatus, setShowStatus] = useState(null);
  const [profilePercent, setProfilePercent] = useState(0);
  const [replyModalId, setReplyModalId] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  //   const { pDate, pTime } = route.params || {};

  const navi = useNavigation();

  const handleReply = async (complaintId) => {
    const message = replyInputs[complaintId]?.trim();
    if (!message) return;

    const db = getDatabase(); // <-- Add this line

    await push(ref(db, `complaints/${complaintId}/replies`), {
      senderId: user.uid,
      senderRole: "user",
      message,
      replyAt: Date.now(),
    });

    setReplyInputs((prev) => ({ ...prev, [complaintId]: "" }));
  };

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
            (item) => item.userId === user.uid && item.status === "Ongoing"
          ); // Filter here;

        allComplaints = Object.keys(data)
          .map((key) => ({
            id: key,
            createdAt: data[key].createdAt,
            category: data[key].category,
            description: data[key].description,
            photoURL: data[key].photoURL,
            status: data[key].status,
            replies: data[key].replies,
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

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setUserData(data);
        setProfilePercent(getProfileCompletion(data));
      }
    });
    get(ref(db, `voucher/${user.uid}`)).then((snap) => {
      if (snap.exists()) {
        setVoucher(snap.val());
      }
    });
  }, [user]);

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

  const deleteComplaint = (id) => {
    const db = getDatabase();
    const complaintRef = ref(db, `complaints/${id}`);

    remove(complaintRef)
      .then(() => {
        console.log("Data deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting data: ", error);
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
            {showHelp && isOngoingPage && (
              <View
                style={{
                  position: "absolute",
                  top: 60, // adjust as needed
                  right: 10,
                  backgroundColor: "#fff",
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 0.2,
                  borderColor: "green",
                  maxWidth: 200,
                  zIndex: 100,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <Text style={{ color: "#222", textAlign: "auto" }}>
                  The yellow face icon shows that your issue is not resolved.
                  {"\n\n"}If your issue had been resolved, kindly use the 'Set
                  as resolved' button to change the helpdesk ticket status.
                </Text>
              </View>
            )}

            {showHelp && !isOngoingPage && (
              <View
                style={{
                  position: "absolute",
                  top: 60, // adjust as needed
                  right: 10,
                  backgroundColor: "#fff",
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 0.2,
                  borderColor: "green",
                  maxWidth: 200,
                  zIndex: 100,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <Text style={{ color: "#222", textAlign: "auto" }}>
                  The yellow face icon shows that your issue is not resolved,
                  while the green one indicates that the issue had been solved.
                  {"\n\n"}If your issue had been resolved, kindly use the 'Set
                  as resolved' button to change the helpdesk ticket status.
                </Text>
              </View>
            )}
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
                            {item.title}
                          </Text>
                          {/* <Text
                            style={{
                              fontSize: 18,
                              fontFamily: "Nunito-Regular",
                            }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 18,
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            Description
                          </Text> */}
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
                                Alert.alert(
                                  "Mark as Resolved",
                                  "Mark this complaint as resolved?",
                                  [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                      text: "Yes",
                                      style: "default",
                                      onPress: () => setResolved(item.id),
                                    },
                                  ]
                                );
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
                              onPress={() => {
                                setShowStatus(
                                  showStatus === item.id ? null : item.id
                                );
                              }}
                              style={{
                                borderColor: item.status === "grey",
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                // marginLeft: "auto",
                                marginTop: 5,
                                borderRadius: 50,
                                backgroundColor:
                                  item.status === "Ongoing"
                                    ? "yellow"
                                    : "green",
                              }}
                            >
                              <Icon
                                name={
                                  item.status === "Ongoing"
                                    ? "frown-o"
                                    : "smile-o"
                                }
                                size={18}
                                style={{ color: "grey" }}
                              />
                            </TouchableOpacity>
                            {showStatus === item.id && (
                              <>
                                <View
                                  style={{
                                    position: "absolute",
                                    right: 5,
                                    top: -10,
                                    width: 0,
                                    height: 0,
                                    borderTopWidth: 10,
                                    borderTopColor: "#fff",
                                    borderLeftWidth: 10,
                                    borderLeftColor: "transparent",
                                    borderRightWidth: 0,
                                    borderRightColor: "transparent",
                                    zIndex: 100,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 5,
                                  }}
                                ></View>
                                <View
                                  style={{
                                    position: "absolute",
                                    top: -40, // adjust as needed
                                    right: 5,
                                    backgroundColor: "#fff",
                                    padding: 10,
                                    borderRadius: 10,
                                    borderWidth: 0.2,
                                    borderColor: "green",
                                    maxWidth: 200,
                                    zIndex: 100,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 5,
                                  }}
                                >
                                  <Text style={{ color: "#222" }}>
                                    Status : Ongoing
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                          <View
                            style={{
                              borderTopWidth: 1,
                              borderTopColor: "#e0e0e0",
                              marginTop: 15,
                              marginBottom: 5,
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => setReplyModalId(item.id)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              marginRight: 10,
                              marginTop: 5,
                              borderRadius: 50,
                              // backgroundColor: "#0984e3",
                              alignSelf: "flex-end",
                            }}
                          >
                            <Text
                              style={{
                                color: "#222",
                                fontFamily: "Nunito-Regular",
                              }}
                            >
                              Replies
                            </Text>
                          </TouchableOpacity>
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
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            height: 30,
                            width: 30,
                            // backgroundColor: "red",
                            borderRadius: 100,
                            marginLeft: 15,
                          }}
                        ></View>
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
                        <TouchableOpacity
                          style={{
                            height: 25,
                            width: 25,
                            borderColor: "green",
                            borderWidth: 1,
                            borderRadius: 100,
                            marginRight: 15,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => setShowHelp(!showHelp)}
                        >
                          <Icon
                            name={"info"}
                            size={16}
                            style={{
                              color: "green",
                            }}
                          />
                        </TouchableOpacity>
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
                            {item.title}
                          </Text>
                          {/* <Text
                            style={{
                              fontSize: 18,
                              fontFamily: "Nunito-Regular",
                            }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 18,
                              fontFamily: "Nunito-Bold",
                            }}
                          >
                            Description
                          </Text> */}
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
                                Alert.alert(
                                  "Delete Post",
                                  "Are you sure you want to delete this issue?",
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel", // Adds the "Cancel" style (button is usually grayed out)
                                    },
                                    {
                                      text: "Delete",
                                      style: "destructive", // Adds the "Delete" style (usually red)
                                      onPress: () => deleteComplaint(item.id),
                                    },
                                  ]
                                );
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
                                // if (item.status === "ongoing") {
                                //   Alert.alert(
                                //     "Ticket In Progress", // Title
                                //     "This means our team is still working on your helpdesk ticket. Thank you for your patience!", // Message
                                //     [{ text: "OK", onPress: () => {} }]
                                //   );
                                // } else {
                                //   Alert.alert(
                                //     "Ticket Is Resolved", // Title
                                //     "This means your helpdesk ticket is resolved. Thank you for using our service!", // ✅ Fixed message
                                //     [{ text: "OK", onPress: () => {} }]
                                //   );
                                // }

                                setShowStatus(
                                  showStatus === item.id ? null : item.id
                                );
                              }}
                              style={{
                                borderColor: item.status === "grey",
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                // marginLeft: "auto",
                                marginTop: 5,
                                borderRadius: 50,
                                backgroundColor:
                                  item.status === "Ongoing"
                                    ? "yellow"
                                    : "green",
                              }}
                            >
                              <Icon
                                name={
                                  item.status === "Ongoing"
                                    ? "frown-o"
                                    : "smile-o"
                                }
                                size={18}
                                style={{
                                  color:
                                    item.status === "Ongoing"
                                      ? "grey"
                                      : "#fdfdfd",
                                }}
                              />
                            </TouchableOpacity>
                            {showStatus === item.id && (
                              <>
                                <View
                                  style={{
                                    position: "absolute",
                                    right: 5,
                                    top: -10,
                                    width: 0,
                                    height: 0,
                                    borderTopWidth: 10,
                                    borderTopColor: "#fff",
                                    borderLeftWidth: 10,
                                    borderLeftColor: "transparent",
                                    borderRightWidth: 0,
                                    borderRightColor: "transparent",
                                    zIndex: 100,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 5,
                                  }}
                                ></View>
                                <View
                                  style={{
                                    position: "absolute",
                                    top: -40, // adjust as needed
                                    right: 5,
                                    backgroundColor: "#fff",
                                    padding: 10,
                                    borderRadius: 10,
                                    borderWidth: 0.2,
                                    borderColor: "green",
                                    maxWidth: 200,
                                    zIndex: 100,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 5,
                                  }}
                                >
                                  <Text style={{ color: "#222" }}>
                                    {item.status === "Ongoing"
                                      ? "Status : Ongoing"
                                      : "Status : Resolved"}
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                          <View
                            style={{
                              borderTopWidth: 1,
                              borderTopColor: "#e0e0e0",
                              marginTop: 15,
                              marginBottom: 5,
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => setReplyModalId(item.id)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              marginRight: 10,
                              marginTop: 5,
                              borderRadius: 50,
                              // backgroundColor: "#0984e3",
                              alignSelf: "flex-end",
                            }}
                          >
                            <Text
                              style={{
                                color: "#222",
                                fontFamily: "Nunito-Regular",
                              }}
                            >
                              Replies
                            </Text>
                          </TouchableOpacity>
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
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            height: 25,
                            width: 25,
                            // borderColor: "green",
                            // borderWidth: 1,
                            borderRadius: 100,
                            marginLeft: 15,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => setShowHelp(!showHelp)}
                        >
                          {/* <Icon
                            name={"info"}
                            size={16}
                            style={{
                              color: "green",
                            }}
                          /> */}
                        </TouchableOpacity>
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
                        <TouchableOpacity
                          style={{
                            height: 25,
                            width: 25,
                            borderColor: "green",
                            borderWidth: 1,
                            borderRadius: 100,
                            marginRight: 15,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => setShowHelp(!showHelp)}
                        >
                          <Icon
                            name={"info"}
                            size={16}
                            style={{
                              color: "green",
                            }}
                          />
                        </TouchableOpacity>
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

          <Modal
            visible={!!replyModalId}
            transparent
            animationType="fade"
            onRequestClose={() => setReplyModalId(null)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "rgba(30,40,60,0.6)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
              activeOpacity={1}
              onPress={() => setReplyModalId(null)}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 320,
                  maxHeight: "90%",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 18,
                  elevation: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    fontSize: 20,
                    marginBottom: 10,
                  }}
                >
                  Replies
                </Text>
                <View style={{ marginBottom: 12 }}>
                  {(() => {
                    // Find the complaint in allData or data
                    const found = (allData || data).find(
                      (c) => c.id === replyModalId
                    );
                    if (found && found.replies) {
                      return (
                        <ScrollView style={{ maxHeight: 180 }}>
                          {Object.values(found.replies).map((r, idx) => (
                            <View key={idx} style={{ marginBottom: 6 }}>
                              <Text style={{ fontFamily: "Nunito-Bold" }}>
                                {r.senderRole === "admin"
                                  ? "🛡️ Admin"
                                  : "👤 You"}
                                :
                                <Text style={{ fontFamily: "Nunito-Regular" }}>
                                  {" "}
                                  {r.message}
                                </Text>
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#777",
                                  fontFamily: "Nunito",
                                }}
                              >
                                {" "}
                                ({new Date(r.replyAt).toLocaleString()})
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      );
                    } else {
                      return (
                        <Text style={{ fontStyle: "italic", color: "#888" }}>
                          No replies yet.
                        </Text>
                      );
                    }
                  })()}
                </View>
                <TextInput
                  placeholder="Write a reply..."
                  value={replyInputs[replyModalId] || ""}
                  onChangeText={(text) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [replyModalId]: text,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    fontFamily: "Nunito",
                    marginBottom: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={() => handleReply(replyModalId)}
                  style={{
                    backgroundColor: "#0984e3",
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "Nunito-Bold" }}>
                    Send Reply
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

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
