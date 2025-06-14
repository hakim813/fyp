import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  StatusBar,
  Image,
  Linking,
} from "react-native";
import { UserContext } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import { stylesHome, styles } from "../styles";
import React, { useContext, useState, useEffect } from "react";
import { ref, getDatabase, get, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomBar from "./BottomBar";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const { user, setUser } = useContext(UserContext);
  const [detail, setDetail] = useState(null);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const navi = useNavigation();

  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("default", { month: "long" }); // "Aug"
  const formattedDate = `${day} ${month}`;

  useEffect(() => {
    const fetchUserName = async () => {
      //for home greeting
      try {
        const db = getDatabase();
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, "users")); // Fetch all users from the database

        if (snapshot.exists()) {
          const users = snapshot.val();
          const existingUser = Object.values(users).find(
            (u) => u.email === user.email
          ); // Match email
          console.log("Homepage user: ", existingUser.email);
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

    const fetchFinancial = async () => {
      const db = getDatabase();
      const dbRef = ref(db, "financeRecords");

      try {
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const allTransactions = snapshot.val();
          let income = 0;
          let expense = 0;

          Object.values(allTransactions).forEach((transaction) => {
            if (
              transaction.email === user.email &&
              new Date(transaction.date).toDateString() ==
                new Date().toDateString()
            ) {
              const amount = Number(transaction.value);

              if (transaction.type === "Income") {
                income += parseFloat(amount);
              } else if (transaction.type === "Expense") {
                expense += parseFloat(amount);
              }
            }
          });

          console.log("User Income:", income);
          console.log("User Expense:", expense);

          // Set to state if needed
          setIncome(parseFloat(income).toFixed(2));
          setExpense(parseFloat(expense).toFixed(2));
        }
      } catch (error) {
        console.error("Error fetching financial records:", error);
      }
    };

    if (user) {
      fetchUserName();
      fetchFinancial();
    }
  }, [user]); // Run the effect only when the `user` changes

  //flexible greeting according to time
  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {
      //from midnight to afternoon
      return "Good Morning";
    } else if (currentHour > 12 && currentHour < 15) {
      //from noon to 3pm
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  return (
    <ScrollView>
      <View
        style={[
          stylesHome.bg,
          { paddingTop: 0, backgroundColor: "white", alignItems: "center" },
        ]}
      >
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: 350,
            backgroundColor: "#50c878",
            padding: 0,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            overflow: "hidden", // <-- important for clipping children!
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageBackground
            source={require("../assets/bg-hibiscus.png")}
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
              <>
                <Image
                  source={
                    detail.profilePhoto
                      ? { uri: detail.profilePhoto }
                      : require("../assets/bg-hibiscus.png") // fallback image
                  }
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 1000,
                    marginTop:
                      Platform.OS === "ios"
                        ? (StatusBar.currentHeight || 20) + 30
                        : (StatusBar.currentHeight || 0) + 50,
                    backgroundColor: "grey",
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={[
                    styles.text,
                    {
                      textAlign: "center",
                      marginLeft: 0,
                      marginTop: 10,
                    },
                  ]}
                >
                  {getGreeting()}, {"\n"}
                  {detail.username}!
                </Text>
              </>
            ) : (
              <Text>Home</Text>
            )}
          </ImageBackground>
        </View>
        <TouchableOpacity
          activeOpacity={0.99}
          onPress={() => navi.navigate("FinanceManager")}
          style={{
            // flexDirection: "row",
            position: "absolute",
            top: 270,
            borderRadius: 20,
            backgroundColor: "#fdfdfd",
            width: "90%",
            minHeight: 125,
            margin: 10,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 1.84,
            elevation: 3,
          }}
        >
          <View //for date
            style={{
              // backgroundColor: "red",
              marginTop: 10,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: Platform.OS === "ios" ? 25 : 22,
                fontFamily: "Nunito-Bold",
              }}
            >
              Today's financial summary{"\n"}
              <Text
                style={{
                  fontFamily: "Nunito-Regular",
                }}
              >
                {formattedDate}
              </Text>
            </Text>
          </View>
          <View //for gained
            style={{
              flexDirection: "row",
              // backgroundColor: "yellow",
              // margin: 5,
              width: "100%",
              height: 100,
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: Platform.OS === "ios" ? 25 : 22,
                fontFamily: "Nunito-Bold",
              }}
            >
              Gained:{"\n"}
              <Text style={{ color: "#3eb489", fontFamily: "Nunito-Regular" }}>
                RM {income}
              </Text>
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: Platform.OS === "ios" ? 25 : 22,
                fontFamily: "Nunito-Bold",
              }}
            >
              Spent:{"\n"}
              <Text style={{ color: "#ec2d01", fontFamily: "Nunito-Regular" }}>
                RM {expense}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        <View
          style={{
            width: "100%",
            height: 280,
            marginTop: 460,
            // paddingLeft: 10,
            marginHorizontal: 40,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: 25,
              // marginTop: 15,
              marginHorizontal: 15,
            }}
          >
            Features
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              alignItems: "center",
            }}
            style={{
              width: "100%",
              flex: 0,
              // backgroundColor: "#f8f8f8",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {/* One "page" of 6 features in 2 rows x 3 columns */}
              <View
                style={{ flexDirection: "column", justifyContent: "center" }}
              >
                {/* First row */}
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  <TouchableOpacity
                    style={[
                      stylesHome.featureSlider,
                      {
                        flexDirection: "row", // <-- side by side
                        alignItems: "center",
                        marginRight: 12,
                        borderRadius: 20,
                        // backgroundColor: "#d3d3d3",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1.84,
                        elevation: 3,
                        padding: 20,
                      },
                    ]}
                    onPress={() => navi.navigate("Forum")}
                  >
                    <Image
                      source={require("../assets/real-forum.png")}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#050505",
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 18 : 16,
                      }}
                    >
                      WeGig{"\n"}Forum
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      stylesHome.featureSlider,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 12,
                        borderRadius: 20,
                        // backgroundColor: "#d3d3d3",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1.84,
                        elevation: 3,
                        padding: 20,
                      },
                    ]}
                    onPress={() => navi.navigate("FinanceManager")}
                  >
                    <Image
                      source={require("../assets/forum.png")}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#050505",
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 18 : 16,
                      }}
                    >
                      Finance
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      stylesHome.featureSlider,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        borderRadius: 20,
                        // backgroundColor: "#d3d3d3",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1.84,
                        elevation: 3,
                        padding: 20,
                      },
                    ]}
                    onPress={() => navi.navigate("Profile")}
                  >
                    <Image
                      source={require("../assets/profile.png")}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#050505",
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 18 : 16,
                      }}
                    >
                      Manage{"\n"}Profile
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Second row */}
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={[
                      stylesHome.featureSlider,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 12,
                        borderRadius: 20,
                        // backgroundColor: "#d3d3d3",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1.84,
                        elevation: 3,
                        padding: 20,
                      },
                    ]}
                    onPress={() => navi.navigate("SPHome")}
                  >
                    <Image
                      source={require("../assets/social-protection.png")}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#050505",
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 18 : 16,
                      }}
                    >
                      Social{"\n"}Security
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      stylesHome.featureSlider,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 12,
                        borderRadius: 20,
                        // backgroundColor: "#d3d3d3",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1.84,
                        elevation: 3,
                        padding: 20,
                      },
                    ]}
                    onPress={() => navi.navigate("HelpdeskHome")}
                  >
                    <Image
                      source={require("../assets/helpdesk.png")}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#050505",
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 18 : 16,
                      }}
                    >
                      Complaint{"\n"}Helpdesk
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      stylesHome.featureSlider,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        borderRadius: 20,
                        // backgroundColor: "#d3d3d3",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 1.84,
                        elevation: 3,
                        padding: 20,
                      },
                    ]}
                    onPress={() => navi.navigate("PetrolStationsMap")}
                  >
                    <Image
                      source={require("../assets/redeem.png")}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#050505",
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 18 : 16,
                      }}
                    >
                      Reward{"\n"}Redemption
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            marginHorizontal: 40,
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: 25,
              marginHorizontal: 15,
            }}
          >
            Information
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  stylesHome.imageSlider,
                  { width: 300, marginRight: 16 },
                ]}
                onPress={() =>
                  Linking.openURL(
                    "https://help.grab.com/driver/en-my/115002266187-Driver-Benefits-and-Services"
                  )
                }
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#fdfdfd",
                      fontWeight: "bold",
                      fontSize: 25,
                    }}
                  >
                    Image 1
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[stylesHome.imageSlider, { width: 300 }]}
                onPress={() => Linking.openURL("https://instagram.com")}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#fdfdfd",
                      fontWeight: "bold",
                      fontSize: 25,
                    }}
                  >
                    Image 2
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 50 }}></View>
      </View>
    </ScrollView>
  );
}
