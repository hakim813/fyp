import React, { useEffect, useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  ScrollView,
  Modal,
  Platform,
  Linking,
  Alert,
  FlatList,
  // Circle,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Callout, Circle } from "react-native-maps";
import { styles, stylesHome } from "../styles";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getDistance } from "geolib";
import {
  ref,
  get,
  getDatabase,
  onValue,
  update,
  set,
  remove,
} from "firebase/database";
import * as Location from "expo-location";
import BottomBar from "./BottomBar";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { UserContext } from "../UserContext";

const GOOGLE_PLACES_API_KEY = "AIzaSyA4CTWSmjIAeVPt6-D5p-pXley3v3so4RQ";
const { width } = Dimensions.get("window");

export default function PetrolStationsMap() {
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState({});
  const [allData, setAllData] = useState([]);
  const [radius, setRadius] = useState(0);
  const [voucher, setVoucher] = useState(null);
  const [isOngoingPage, setIsOngoingPage] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const [progress, setProgress] = useState(0);
  // const percentValue = percent.percent ?? percent;

  const { user } = useContext(UserContext);
  const navi = useNavigation();

  const requiredFields = [
    "fullName",
    "dob",
    "email",
    "phone",
    "address",
    "profilePhoto",
    "nricId",
    "icPhotos",
    "taxId",
    "gender",
    "workPermit",
    "workStatus",
    "workCategory",
    "experience",
    "languages",
    "bank",
    "bankAccountNumber",
    "insuranceCoverage",
    "socialSecurity",
    "licenses",
    "platforms",
    "gdl",
  ];
  const BRANDS = [
    {
      label: "All",
      keyword: "",
      icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    },
    {
      label: "Petronas",
      keyword: "Petronas",
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Petronas_logo.svg",
    },
    {
      label: "Shell",
      keyword: "Shell",
      icon: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Shell_logo.svg",
    },
    {
      label: "Petron",
      keyword: "Petron",
      icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Petron_Corporation_logo.svg",
    },
  ];

  const RANGES = [
    { label: "2 km", value: 2000 },
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "20 km", value: 20000 },
  ];

  // const getProfileCompletion = async (userData) => {
  //   const requiredFields = [
  //     /* your list of required fields here */
  //   ];

  //   const filled = requiredFields.filter((f) => {
  //     const v = userData[f];
  //     if (Array.isArray(v)) return v.length > 0;
  //     return v !== undefined && v !== null && v !== "";
  //   }).length;

  //   return Math.round((filled / requiredFields.length) * 100);
  // };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchNearbyStations(loc.coords.latitude, loc.coords.longitude, 3000);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setUserData(data);
        setPercent(getProfileCompletion(data));
        setProgress(getProfileCompletion(data));
        console.log("Progress");
        console.log("Percent", percent);
      }
    });
    get(ref(db, `vouchers/${user.uid}`)).then((snap) => {
      if (snap.exists()) {
        setVoucher(snap.val());
      }
    });
  }, [user]);

  // useEffect(() => {
  //   console.log("Hello");
  //   if (!user) {
  //     console.log("rar");
  //   }
  //   const db = getDatabase();
  //   get(ref(db, `users/${user.uid}`)).then((snap) => {
  //     if (snap.exists()) {
  //       const data = snap.val();
  //       setUserData(data);
  //       setProfilePercent(getProfileCompletion(data));
  //       console.log("User", user.uid);
  //     }
  //   });
  //   // Listen for all vouchers

  // }, [user]);

  const formatDateTime = (created) => {
    const date = new Date(created);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 to 12-hour format

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  const handleMarkUsed = async () => {
    if (!voucher) return;
    await set(ref(getDatabase(), `vouchers/${user.uid}/status`), "Used");
    setVoucher({ ...voucher, status: "Used" });
    setShowConfirm(false);
  };

  const handleGenerateVoucher = async () => {
    if (voucher) return;
    const code =
      "PETRO-" + Math.random().toString(36).substr(2, 8).toUpperCase();

    const newVoucher = {
      code,
      created: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
      status: "Unused",
      amount: 50,
      incentive: "Gig Worker Data Completion",
      description:
        "Reward for completing your government-requested profile information.",
    };
    await set(ref(getDatabase(), `vouchers/${user.uid}`), newVoucher);
    setVoucher(newVoucher);
  };

  const fetchNearbyStations = async (lat, lng, radius) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: `${radius}`,
            type: "gas_station",
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );
      setStations(response.data.results);
    } catch (error) {
      console.error("Error fetching petrol stations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletion = async (userData) => {
    // const requiredFields = [/* your list of required fields here */];

    const filled = requiredFields.filter((f) => {
      const v = userData[f];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    }).length;

    return Math.round((filled / requiredFields.length) * 100);
  };

  const openNavigationOptions = async (lat, lng, name) => {
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;

    Alert.alert(
      `Navigate to ${name}`,
      "Choose your navigation app:",
      [
        {
          text: "Waze",
          onPress: async () => {
            const supported = await Linking.canOpenURL(wazeUrl);
            if (supported) {
              Linking.openURL(wazeUrl);
            } else {
              Alert.alert(
                "Waze is not installed. Opening Google Maps instead."
              );
              Linking.openURL(
                Platform.OS === "ios" ? appleMapsUrl : googleMapsUrl
              );
            }
          },
        },
        {
          text: Platform.OS === "ios" ? "Apple Maps" : "Google Maps",
          onPress: () =>
            Linking.openURL(
              Platform.OS === "ios" ? appleMapsUrl : googleMapsUrl
            ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
        <Text>Loading map and stations...</Text>
      </View>
    );
  }

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
          <Text style={[styles.text]}>Rewards</Text>
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
            style={{
              flex: 1,
              // backgroundColor: "rgba(255,255,255,0.6)",
              // backgroundColor: "red",
              borderRadius: 25,
              // borderTopLeftRadius: 25 ,
              marginTop: 25,
              // padding: 20,
              // paddingTop: 25,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
              // paddingTop: 15,
              margin: 0,
              padding: 0,
              alignItems: "center",
            }}
          >
            <ScrollView
              style={[
                styles.container2,
                {
                  // backgroundColor: "pink",
                  borderBottomRightRadius: 0,
                  borderBottomLeftRadius: 0,
                  // paddingTop: 15,
                  marginTop: 0,
                  padding: 0,
                  width: "100%",
                  // backgroundColor: "transparent",
                },
              ]}
              contentContainerStyle={{ alignItems: "center" }}
            >
              <View //progress completion
                style={{
                  flexDirection: "row",
                  backgroundColor: "#rgba(230,230,230,0.95)",
                  height: 100,
                  width: "95%",
                  borderRadius: 15,
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,

                  // Shadow for iOS
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,

                  // Shadow for Android
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    // backgroundColor: "pink",
                    marginRight: 25,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Nunito-Bold",
                      fontSize: Platform.OS === "ios" ? 18 : 15,
                    }}
                  >
                    Profile Completion Progress
                  </Text>
                  <View
                    style={{
                      backgroundColor: "grey",
                      marginTop: 15,
                      height: 15,
                      width: "100%",
                      borderRadius: 15,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={[styles.filler, { width: `${percent.value}%` }]}
                    />
                  </View>
                </View>
                <View
                  style={{
                    align: "center",
                    justifyContent: "center",
                    // backgroundColor: "red",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Nunito-Bold",
                      fontSize: Platform.OS === "ios" ? 47 : 38,
                    }}
                  >
                    {percent}%
                  </Text>
                </View>
              </View>
              {/* <Text style={[styles.text, { alignSelf: "flex-start" }]}>
              Rewards
            </Text> */}
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
                  marginLeft: 15,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  alignSelf: "flex-start",

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
                      color: isOngoingPage === true ? "#fdfdfd" : "green",
                    }}
                  >
                    Voucher
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
                      color: isOngoingPage === true ? "green" : "#fdfdfd",
                    }}
                  >
                    Find Gas Station
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
              {isOngoingPage && (
                <View
                  style={{
                    // flexDirection: "row",
                    backgroundColor: "#rgba(220,220,220,0.7)",
                    minHeight: 430,
                    width: "95%",
                    borderRadius: 15,
                    padding: 10,
                    justifyContent:
                      percent < 100 || percent.value < 100 || !voucher
                        ? "center"
                        : "flex-start",

                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  {percent.value < 100 || percent < 100 ? (
                    <View alignItems={"center"}>
                      <Icon name="lock" size={40} color={"#000"} />
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          fontSize: 17,
                          textAlign: "center",
                          marginVertical: 5,
                        }}
                      >
                        You can unlock the voucher tab once you have completed
                        and verified your profile.
                      </Text>
                      <Text
                        onPress={() => navi.navigate("Profile")}
                        style={{
                          fontFamily: "Nunito-Bold",
                          fontSize: 17,
                          color: "green",
                          textAlign: "center",
                        }}
                      >
                        Go to Profile
                      </Text>
                    </View>
                  ) : !voucher ? (
                    <View alignItems={"center"}>
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          color: "#222",
                          fontSize: 22,
                          marginBottom: 10,
                        }}
                      >
                        Click the button to activate your voucher.
                      </Text>
                      <TouchableOpacity
                        onPress={handleGenerateVoucher}
                        style={{
                          backgroundColor: "#20734f",
                          paddingHorizontal: 15,
                          paddingVertical: 10,
                          borderRadius: 15,
                          // alignSelf: "flex-start", // ✅ Prevents full-width expansion
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            color: "#fdfdfd",
                          }}
                        >
                          Generate Voucher
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // If percent >= 100 and no voucher, show nothing or a button to generate voucher

                    // If percent >= 100 and voucher exists, show voucher details

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
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                          width: "100%",
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            fontSize: 20,
                          }}
                        >
                          {voucher.code}
                        </Text>
                        <Text
                          style={{
                            marginLeft: "auto",
                            color: "grey",
                            fontFamily: "Nunito-Bold",
                          }}
                        >
                          {/* {formatDateTime(voucher.created)} */}
                          {voucher.status}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          fontSize: 20,
                        }}
                      >
                        {/* {voucher.status} */}
                        RM{voucher.amount} Voucher
                      </Text>
                      <Text
                        style={{
                          marginTop: 15,
                          color: "grey",
                          fontFamily: "Nunito-Bold",
                        }}
                      >
                        {/* {formatDateTime(voucher.created)} */}
                        Generated: {formatDateTime(voucher.created)}
                        {"\n"}Expired : {formatDateTime(voucher.expiresAt)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          fontSize: 13,
                          marginTop: 10,
                        }}
                      >
                        {/* {voucher.status} */}
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            color: "green",
                            fontSize: 13,
                            marginTop: 10,
                          }}
                        >
                          Incentive: {voucher.incentive}
                          {"\n"}
                        </Text>
                        {voucher.description}
                        {"\n\n"}
                        <Text
                          style={{
                            fontFamily: "Nunito-Regular",
                            color: "green",
                            fontSize: 13,
                            marginTop: 10,
                          }}
                        >
                          Show this code at the petrol station counter to redeem
                          your voucher.{" "}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "Confirm Redemption",
                            "Are you sure you want to mark this voucher as used? This action cannot be undone.",
                            [
                              { text: "Cancel", style: "cancel" },
                              { text: "OK", onPress: handleMarkUsed },
                            ]
                          )
                        }
                        disabled={voucher.status === "Used"}
                        style={{
                          backgroundColor:
                            voucher.status === "Used" ? "#ccc" : "#20734f",
                          marginTop: 20,
                          paddingHorizontal: 15,
                          paddingVertical: 10,
                          borderRadius: 15,
                          alignSelf: "flex-end", // ✅ Prevents full-width expansion
                          alignItems: "flex-end",
                          opacity: voucher.status === "Used" ? 0.6 : 1, // Slight transparency
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            color: "#fdfdfd",
                          }}
                        >
                          Mark as Used
                        </Text>
                      </TouchableOpacity>
                    </View>
                    //                     <FlatList
                    //   data={vouchers}
                    //   keyExtractor={(item) => item.id}
                    //   renderItem={({ item }) => (
                    //     <View
                    //       style={[
                    //         stylesHome.context,
                    //         {
                    //           minHeight: 10,
                    //           paddingVertical: 10,
                    //           marginBottom: 8,
                    //           marginHorizontal: 8,
                    //           backgroundColor: "#fafafa",
                    //           borderRadius: 12,
                    //           borderWidth: 0.1,
                    //           shadowColor: "#000",
                    //           shadowOffset: { width: 0, height: 1 },
                    //           shadowOpacity: 0.25,
                    //           shadowRadius: 3.84,
                    //           elevation: 5,
                    //           width: "100%",
                    //         },
                    //       ]}
                    //     >
                    //       <View
                    //         style={{
                    //           flexDirection: "row",
                    //           alignItems: "flex-start",
                    //         }}
                    //       >
                    //         <Text
                    //           style={{
                    //             fontFamily: "Nunito-Bold",
                    //             fontSize: 20,
                    //           }}
                    //         >
                    //           {item.code}
                    //         </Text>
                    //         <Text
                    //           style={{
                    //             marginLeft: "auto",
                    //             color: "grey",
                    //             fontFamily: "Nunito-Bold",
                    //           }}
                    //         >
                    //           {item.created}
                    //         </Text>
                    //       </View>
                    //       <Text
                    //         style={{
                    //           fontFamily: "Nunito-Regular",
                    //           fontSize: 20,
                    //         }}
                    //       >
                    //         {item.status}
                    //       </Text>
                    //       <TouchableOpacity
                    //         onPress={() => handleMarkAsUsed(item.id)} // 🔁 Update this function
                    //         style={{
                    //           backgroundColor: "#20734f",
                    //           marginTop: 20,
                    //           paddingHorizontal: 15,
                    //           paddingVertical: 10,
                    //           borderRadius: 15,
                    //           alignSelf: "flex-start",
                    //           alignItems: "center",
                    //         }}
                    //       >
                    //         <Text
                    //           style={{
                    //             fontFamily: "Nunito-Bold",
                    //             color: "#fdfdfd",
                    //           }}
                    //         >
                    //           Mark as Used
                    //         </Text>
                    //       </TouchableOpacity>
                    //     </View>
                    //   )}
                    // />
                  )}
                </View>
              )}

              {!isOngoingPage && (
                <View //map tab
                  style={{
                    // flexDirection: "row",
                    backgroundColor: "#rgba(220,220,220,0.7)",
                    // height: 100,
                    width: "95%",
                    borderRadius: 15,
                    padding: 10,
                    justifyContent: "center",
                    alignItems: "center",

                    // Shadow for iOS
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    // borderBottomColor: "red",
                    // borderBottomWidth: 1,

                    // Shadow for Android
                    elevation: 5,
                  }}
                >
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
                          Select Range of Radius
                        </Text>
                        <Picker
                          selectedValue={radius}
                          style={{ width: "100%" }}
                          onValueChange={(itemValue) => setRadius(itemValue)}
                        >
                          <Picker.Item label=" " value={0} color="black" />
                          <Picker.Item
                            label="2 km"
                            value={RANGES[0].value}
                            color="black"
                          />
                          <Picker.Item
                            label="5 km"
                            value={RANGES[1].value}
                            color="black"
                          />
                          <Picker.Item
                            label="10 km"
                            value={RANGES[2].value}
                            color="black"
                          />
                          <Picker.Item
                            label="20 km"
                            value={RANGES[3].value}
                            color="black"
                          />
                          {/* Add more categories as needed */}
                        </Picker>
                        <TouchableOpacity
                          onPress={() => {
                            setFilterModalVisible(false); // 1. Close filter modal
                            fetchNearbyStations(
                              location.latitude,
                              location.longitude,
                              radius
                            ); // 2. Fetch stations near current location
                          }}
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
                  {/* <Text>Brand</Text> */}

                  <View
                    flexDirection={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    width={"70%"}
                  >
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 18,
                        marginBottom: 26,
                      }}
                    >
                      Radius :
                    </Text>
                    <TouchableOpacity
                      onPress={() => setFilterModalVisible(true)}
                      style={[
                        styles.input,
                        {
                          width: 200,
                          alignItems: "center",
                          justifyContent: "center",
                        },
                      ]}
                    >
                      <Text style={{ fontFamily: "Nunito-Regular" }}>
                        {radius <= 0 ? "Select radius" : `${radius / 1000} km`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Nunito-Bold",
                      fontSize: 16,
                      marginBottom: 8,
                    }}
                  >
                    {`Stations found in radius: ${stations.length}`}
                  </Text>
                  <MapView
                    style={{
                      flex: 1,
                      height: 400,
                      width: "100%",
                      borderRadius: 10,
                    }}
                    initialRegion={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    {/* 🔵 Radius circle around user location */}
                    <Circle
                      center={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                      radius={radius} // Radius in **meters**
                      strokeWidth={2}
                      strokeColor="rgba(30, 144, 255, 0.7)" // DodgerBlue outline
                      fillColor="rgba(30, 144, 255, 0.2)" // Light fill
                    />

                    {/* 📍 User marker */}
                    <Marker
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                      title="You are here"
                      pinColor="blue"
                    />

                    {/* ⛽ Petrol station markers */}
                    {stations.map((station, index) => (
                      <Marker
                        key={index}
                        coordinate={{
                          latitude: station.geometry.location.lat,
                          longitude: station.geometry.location.lng,
                        }}
                      >
                        <Callout
                          onPress={() =>
                            openNavigationOptions(
                              station.geometry.location.lat,
                              station.geometry.location.lng,
                              station.name
                            )
                          }
                        >
                          <View style={{ padding: 10, maxWidth: 200 }}>
                            <Text
                              style={{ fontWeight: "bold", marginBottom: 5 }}
                            >
                              {station.name}
                            </Text>
                            <Text style={{ marginBottom: 5 }}>
                              {station.vicinity}
                            </Text>
                            <Text style={{ color: "blue" }}>
                              Tap to navigate
                            </Text>
                          </View>
                        </Callout>
                      </Marker>
                    ))}
                  </MapView>
                  <View style={{ width: "100%", marginTop: 15 }}>
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: 18,
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      Nearby Petrol Stations
                    </Text>
                    {stations.length === 0 ? (
                      <Text style={{ textAlign: "center", color: "grey" }}>
                        No stations found in this radius.
                      </Text>
                    ) : (
                      stations.map((station, idx) => {
                        const distance =
                          location &&
                          getDistance(
                            {
                              latitude: location.latitude,
                              longitude: location.longitude,
                            },
                            {
                              latitude: station.geometry.location.lat,
                              longitude: station.geometry.location.lng,
                            }
                          );
                        const distanceKm = (distance / 1000).toFixed(2);

                        return (
                          <View
                            key={idx}
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: 10,
                              marginVertical: 6,
                              marginHorizontal: 10,
                              padding: 12,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.1,
                              shadowRadius: 2,
                              elevation: 2,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Nunito-Bold",
                                fontSize: 16,
                              }}
                            >
                              {station.name}
                            </Text>
                            <Text style={{ color: "#555" }}>
                              {station.vicinity}
                            </Text>
                            <Text style={{ color: "#20734f", marginBottom: 6 }}>
                              {distanceKm} km away
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                openNavigationOptions(
                                  station.geometry.location.lat,
                                  station.geometry.location.lng,
                                  station.name
                                )
                              }
                              style={{
                                backgroundColor: "#20734f",
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                alignSelf: "flex-start",
                              }}
                            >
                              <Text
                                style={{
                                  color: "#fff",
                                  fontFamily: "Nunito-Bold",
                                }}
                              >
                                Tap to Navigate
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {/* <TouchableOpacity //add button
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
          </TouchableOpacity> */}

          <BottomBar></BottomBar>
        </ImageBackground>
      </View>
    </View>
  );

  // return (
  //   <MapView
  //     style={styles.map}
  //     initialRegion={{
  //       latitude: location.latitude,
  //       longitude: location.longitude,
  //       latitudeDelta: 0.05,
  //       longitudeDelta: 0.05,
  //     }}
  //   >
  //     {/* User location marker */}
  //     <Marker
  //       coordinate={{
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //       }}
  //       title="You are here"
  //       pinColor="blue"
  //     />

  //     {/* Petrol station markers */}
  //     {stations.map((station, index) => (
  //       <Marker
  //         key={index}
  //         coordinate={{
  //           latitude: station.geometry.location.lat,
  //           longitude: station.geometry.location.lng,
  //         }}
  //       >
  //         <Callout
  //           onPress={() =>
  //             openNavigationOptions(
  //               station.geometry.location.lat,
  //               station.geometry.location.lng,
  //               station.name
  //             )
  //           }
  //         >
  //           <View style={{ padding: 10, maxWidth: 200 }}>
  //             <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
  //               {station.name}
  //             </Text>
  //             <Text style={{ marginBottom: 5 }}>{station.vicinity}</Text>
  //             <Text style={{ color: "blue" }}>Tap to navigate</Text>
  //           </View>
  //         </Callout>
  //       </Marker>
  //     ))}
  //   </MapView>
  // );
}

const style = StyleSheet.create({
  // map: {
  //   width: Dimensions.get("window").width - 40,
  //   height: Dimensions.get("window").height - 500,
  //   margin: 20,
  // },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
