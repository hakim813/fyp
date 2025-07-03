import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Platform,
  StatusBar,
  Modal,
} from "react-native";
import { UserContext } from "../../UserContext";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import { stylesHome, styles } from "../../styles";
import React, { useContext, useState, useEffect } from "react";
import { ref, getDatabase, get, child } from "firebase/database";
import BottomBar from "../BottomBar";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [detail, setDetail] = useState(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const navi = useNavigation();

  const sections = [
    { fields: ["fullName", "email", "phone", "dob", "address", "gender"] },
    { fields: ["nricId", "icPhotos", "profilePhoto"] },
    {
      fields: [
        "bank",
        "bankAccountNumber",
        "taxId",
        "socialSecurity",
        "insuranceCoverage",
      ],
    },
    { fields: ["workStatus", "workPermit", "workCategory", "experience"] },
    { fields: ["languages", "licenses", "gdl", "platforms"] },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const db = getDatabase(); // Initialize Firebase Realtime Database
        const dbRef = ref(db); // Reference to the database
        const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

        console.log("Hereeee");
        if (snapshot.exists()) {
          const users = snapshot.val();
          const existingUser = user
            ? Object.values(users).find((u) => u.email === user.email)
            : null; // Match email
          if (!existingUser) return;
          console.log("Existing user: ", existingUser);
          setDetail(existingUser);
        } else {
          console.log("No users found in the database.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    if (user) {
      fetchUser();
    } else {
      setDetail(null); // Clear detail if user is null
    }
  }, [user]);

  // const allFields = sections.flatMap((s) => s.fields);

  // const filledCount = detail
  //   ? allFields.filter((f) => {
  //       const v = detail[f];
  //       if (Array.isArray(v)) return v.length > 0;
  //       return v !== undefined && v !== null && v !== "";
  //     }).length
  //   : 0;

  // const percent = detail
  //   ? Math.round((filledCount / allFields.length) * 100)
  //   : 0;

  let allFields = sections.flatMap((s) => s.fields);

  if (detail && detail.gdl === "Yes") {
    allFields.push("gdlDocument");
  }

  const filledCount = detail
    ? allFields.filter((f) => {
        const v = detail[f];
        if (f === "platforms")
          return (
            Array.isArray(v) && v.length > 0 && v.every((p) => p.name && p.id)
          );
        if (
          ["languages", "insuranceCoverage", "licenses", "icPhotos"].includes(f)
        )
          return Array.isArray(v) && v.length > 0;
        if (f === "gdl") return v === "Yes" || v === "No";
        if (f === "gdlDocument") return !!v;
        return v !== undefined && v !== null && v !== "";
      }).length
    : 0;

  const percent = detail
    ? Math.round((filledCount / allFields.length) * 100)
    : 0;

  // const allFields = sections.flatMap((s) => s.fields);
  // if (detail?.hasGDL === "Yes") {
  //   allFields.push("gdlDocument");
  // }
  // const filledCount = allFields.filter((f) => {
  //   const v = detail[f];
  //   if (f === "platforms")
  //     return Array.isArray(v) && v.length > 0 && v.every((p) => p.name && p.id);
  //   if (["languages", "insuranceCoverage", "licenses", "icPhotos"].includes(f))
  //     return Array.isArray(v) && v.length > 0;
  //   if (f === "gdl") return v === "Yes" || v === "No";
  //   if (f === "gdlDocument") return !!v;
  //   return v !== undefined && v !== null && v !== "";
  // }).length;
  // const percent = Math.round((filledCount / allFields.length) * 100);

  const handleLogout = () => {
    navi.navigate("LandingPage");
    // auth.signOut(); // Sign out from Firebase
    // setUser(null); // Clear user data from context
    // setDetail(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[
          stylesHome.bg,
          { paddingTop: 0, backgroundColor: "rgba(222, 222, 222, 0.4)" },
        ]}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <View
          style={{
            position: "absolute",
            width: 600,
            height: 235,
            backgroundColor: "#50c878",
            padding: 0,
            borderBottomLeftRadius: 1000,
            borderBottomRightRadius: 1000,
            overflow: "hidden", // <-- important for clipping children!
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageBackground
            source={require("../../assets/bg-hibiscus.png")}
            style={{
              height: "100%",
              width: "100%",
              // borderBottomLeftRadius: 120,
              // borderBottomRightRadius: 120,
              backgroundColor: "#1b434d",
              alignItems: "center",
              // justifyContent: "center",
            }}
            resizeMode="cover"
          >
            {detail ? (
              <View alignItems={"center"}>
                <Text
                  style={[
                    styles.text,
                    {
                      textAlign: "center",
                      marginLeft: 0,
                      marginTop:
                        Platform.OS === "ios"
                          ? (StatusBar.currentHeight || 20) + 30
                          : (StatusBar.currentHeight || 0) + 50,
                    },
                  ]}
                >
                  {detail?.username}'s{"\n"}Profile
                </Text>
              </View>
            ) : (
              <Text>Home</Text>
            )}
          </ImageBackground>
        </View>
        <View
          style={{
            marginTop: 160,
            width: "100%",
            // height: 100,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={{ uri: detail?.profilePhoto }}
            style={{
              height: 120,
              width: 120,
              borderRadius: 1000,
              borderWidth: 3,
              marginBottom: 15,
              backgroundColor: "grey",
            }}
            resizeMode="cover"
          />
          <Text
            style={[
              // styles.text,
              {
                textAlign: "center",
                marginBottom: 15,
                fontSize: 18,
                fontFamily: "Nunito-Bold",
              },
            ]}
          >
            {detail?.verified === true
              ? "Verified User"
              : "Verifircation Pending"}
          </Text>
          <View
            flexDirection={"row"}
            justifyContent={"space-evenly"}
            width={"100%"}
          >
            <TouchableOpacity
              onPress={() =>
                navi.navigate("EditProfile", {
                  section: "Profile Pic",
                  detail: detail,
                })
              }
              style={{
                backgroundColor: "#ddd",
                minWidth: 120,
                borderRadius: 50,
                marginBottom: 15,
                padding: 10,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 1.84,

                // Shadow for Android
                elevation: 2,
              }}
            >
              <Text
                // fontFamily={"Nunito-ExtraBold"}
                style={{ color: "#222", fontFamily: "Nunito-Bold" }}
              >
                Edit Profile Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                minWidth: 130,
                borderRadius: 50,
                marginBottom: 15,
                padding: 10,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 1.84,

                // Shadow for Android
                elevation: 2,
              }}
              onPress={() => handleLogout()}
            >
              <Text
                // fontFamily={"Nunito-ExtraBold"}
                style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}
              >
                Log out
              </Text>
            </TouchableOpacity>
          </View>

          <View //progress completion
            style={{
              flexDirection: "row",
              backgroundColor: "#rgba(200,200,200,1)",
              height: 100,
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
                  backgroundColor: "#e0e0e0",
                  marginTop: 15,
                  height: 15,
                  width: "100%",
                  borderRadius: 15,
                  overflow: "hidden",
                }}
              >
                <View style={[styles.filler, { width: `${percent}%` }]} />
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

          <View
            style={{
              flexDirection: "row",
              marginVertical: 5,
              padding: 10,
              width: "95%",
              alignItems: "center",
              justifyContent: "flex-start",
              // backgroundColor: "rgba(25, 77, 6, 1)",
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
              Personal Information
            </Text>
            <TouchableOpacity
              onPress={() =>
                navi.navigate("EditProfile", {
                  section: "Personal",
                  detail: detail,
                })
              }
              style={{
                marginLeft: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Nunito-Bold",
                  marginLeft: "auto",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              stylesHome.context,
              {
                minHeight: 10,
                width: "95%",
                paddingVertical: 10,
                marginBottom: 8,
                marginHorizontal: 8,
                backgroundColor: "#fafafa",
                borderRadius: 12,
                borderWidth: 0.1,

                // Shadow for iOS
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,

                // Shadow for Android
                elevation: 3,
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
                Full Name
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.fullName ? detail.fullName : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Date of Birth (DOB)
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.dob ? detail.dob : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Gender
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.gender ? detail.gender : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Email
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.email ? detail.email : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Phone Number
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.phone ? detail.phone : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Home Address
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.address ? detail.address : "Not Provided"}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginVertical: 5,
              padding: 10,
              width: "95%",
              alignItems: "center",
              justifyContent: "flex-start",
              // backgroundColor: "rgba(25, 77, 6, 1)",
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
              Identification Information
            </Text>
            <TouchableOpacity
              onPress={() =>
                navi.navigate("EditProfile", {
                  section: "Identification",
                  detail: detail,
                })
              }
              style={{
                marginLeft: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Nunito-Bold",
                  marginLeft: "auto",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              stylesHome.context,
              {
                minHeight: 10,
                width: "95%",
                paddingVertical: 10,
                marginBottom: 8,
                marginHorizontal: 8,
                backgroundColor: "#fafafa",
                borderRadius: 12,
                borderWidth: 0.1,

                // Shadow for iOS
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,

                // Shadow for Android
                elevation: 3,
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
                NRIC ID
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.nricId ? detail.nricId : "Not Provided"}
              </Text>
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
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                IC Card Upload (Front and Back)
              </Text>
              {detail?.icPhotos && detail.icPhotos.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    // If item.photoURL is a string, wrap it in an array
                    setSelectedMedia(
                      Array.isArray(detail.icPhotos)
                        ? detail.icPhotos
                        : [detail.icPhotos]
                    );
                    console.log(selectedMedia);
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
                    View ICs
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

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Tax ID
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.taxId ? detail.taxId : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Work Permit
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.workPermit ? detail.workPermit : "Not Provided"}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginVertical: 5,
              padding: 10,
              width: "95%",
              alignItems: "center",
              justifyContent: "flex-start",
              // backgroundColor: "rgba(25, 77, 6, 1)",
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
              Professional Information
            </Text>
            <TouchableOpacity
              onPress={() =>
                navi.navigate("EditProfile", {
                  section: "Professional",
                  detail: detail,
                })
              }
              style={{
                marginLeft: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Nunito-Bold",
                  marginLeft: "auto",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              stylesHome.context,
              {
                minHeight: 10,
                width: "95%",
                paddingVertical: 10,
                marginBottom: 8,
                marginHorizontal: 8,
                backgroundColor: "#fafafa",
                borderRadius: 12,
                borderWidth: 0.1,

                // Shadow for iOS
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,

                // Shadow for Android
                elevation: 3,
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
                Work Status
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.workStatus ? detail.workStatus : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Work Category
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.workCategory ? detail.workCategory : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Years of Experience
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.experience ? detail.experience : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Languages
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.languages && detail.languages.length > 0 ? (
                  <Text>{detail.languages.join(", ")}</Text>
                ) : (
                  <Text>Not Provided</Text>
                )}
              </Text>
              {detail?.platforms &&
              Array.isArray(detail.platforms) &&
              detail.platforms.length > 0 ? (
                <View style={{ marginTop: 5 }}>
                  <Text style={{ fontSize: 18, fontFamily: "Nunito-Bold" }}>
                    Platforms
                  </Text>
                  {detail.platforms.map((p, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, fontFamily: "Nunito-Regular" }}
                      >
                        {p.name}
                        {p.id ? (
                          <Text style={{ color: "#888" }}> (ID: {p.id})</Text>
                        ) : null}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Nunito-Regular",
                    color: "grey",
                  }}
                >
                  Platforms: Not Provided
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginVertical: 5,
              padding: 10,
              width: "95%",
              alignItems: "center",
              justifyContent: "flex-start",
              // backgroundColor: "rgba(25, 77, 6, 1)",
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
              Finance
            </Text>
            <TouchableOpacity
              onPress={() =>
                navi.navigate("EditProfile", {
                  section: "Finance",
                  detail: detail,
                })
              }
              style={{
                marginLeft: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Nunito-Bold",
                  marginLeft: "auto",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              stylesHome.context,
              {
                minHeight: 10,
                width: "95%",
                paddingVertical: 10,
                marginBottom: 8,
                marginHorizontal: 8,
                backgroundColor: "#fafafa",
                borderRadius: 12,
                borderWidth: 0.1,

                // Shadow for iOS
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,

                // Shadow for Android
                elevation: 3,
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
                Bank Name
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.bank ? detail.bank : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Bank Account
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.bankAccountNumber
                  ? detail.bankAccountNumber
                  : "Not Provided"}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginVertical: 5,
              padding: 10,
              width: "95%",
              alignItems: "center",
              justifyContent: "flex-start",
              // backgroundColor: "rgba(25, 77, 6, 1)",
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
              Compliance
            </Text>
            <TouchableOpacity
              onPress={() =>
                navi.navigate("EditProfile", {
                  section: "Compliance",
                  detail: detail,
                })
              }
              style={{
                marginLeft: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Nunito-Bold",
                  marginLeft: "auto",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              stylesHome.context,
              {
                minHeight: 10,
                width: "95%",
                paddingVertical: 10,
                marginBottom: 8,
                marginHorizontal: 8,
                backgroundColor: "#fafafa",
                borderRadius: 12,
                borderWidth: 0.1,

                // Shadow for iOS
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,

                // Shadow for Android
                elevation: 3,
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
                Insurance Coverage
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.insuranceCoverage &&
                detail.insuranceCoverage.length > 0 ? (
                  <Text>{detail.insuranceCoverage.join(", ")}</Text>
                ) : (
                  <Text>Not Provided</Text>
                )}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Social Security
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {detail?.socialSecurity
                  ? detail.socialSecurity
                  : "Not Provided"}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                Licenses
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Nunito-Regular",
                  marginBottom: 3,
                }}
              >
                {/* {detail?.licenses ? detail.licenses : "Not Provided"} */}
                {detail?.licenses && detail.licenses.length > 0 ? (
                  <Text>{detail.licenses.join(", ")}</Text>
                ) : (
                  <Text>Not Provided</Text>
                )}
              </Text>
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
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  fontFamily: "Nunito-Bold",
                }}
              >
                GDL Document
              </Text>
              {detail?.gdl === "Yes" && detail.gdlDocument ? (
                <TouchableOpacity
                  onPress={() => {
                    // Ensure selectedMedia is always an array
                    setSelectedMedia(
                      Array.isArray(detail.gdlDocument)
                        ? detail.gdlDocument
                        : [detail.gdlDocument]
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
                    View Document
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
            </View>
          </View>
          {/* <View
          style={{
            marginVertical: 5,
            padding: 10,
            width: "95%",
            // backgroundColor: "rgba(25, 77, 6, 1)",
          }}
        >
          <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
            Regulatory Compliance
          </Text>
        </View>
        <View
          style={{
            marginVertical: 5,
            padding: 10,
            width: "95%",
            // backgroundColor: "rgba(25, 77, 6, 1)",
          }}
        >
          <Text style={{ fontSize: 20, fontFamily: "Nunito-Bold" }}>
            Emergency Contact
          </Text>
        </View> */}

          <View height="50"></View>
        </View>
      </ScrollView>
      <BottomBar></BottomBar>
    </View>
  );
}
