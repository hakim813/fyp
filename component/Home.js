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
                  { width: 300, marginRight: 16, overflow: "hidden" },
                ]}
                onPress={() =>
                  Linking.openURL(
                    "https://www.perkeso.gov.my/uncategorised/51-social-security-protection/818-self-employment-social-security-scheme.html"
                  )
                }
              >
                <ImageBackground
                  source={{
                    uri: "https://cdn4.premiumread.com/?url=https://malaymail.com/malaymail/uploads/images/2023/08/23/140804.jpg&w=1000&q=100&f=jpg&t=6",
                  }}
                  style={[
                    // stylesHome.imageSlider,
                    {
                      height: "100%",
                      width: "100%",
                      backgroundColor: "#1b434d00",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 30,
                      // opacity: 0.5,
                      // justifyContent: "center",
                    },
                  ]}
                  resizeMode="cover"
                >
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        color: "#fdfdfd",
                        fontFamily: "Nunito-Bold",
                        fontSize: 25,
                        // marginTop: 10,
                        textAlign: "center",
                        textShadowColor: "#222",
                        shadowOpacity: 0.5,
                        textShadowOffset: { width: 0.5, height: 0.5 },
                        textShadowRadius: 0.5,
                        // shadowColor, shadowOffset, shadowOpacity, shadowRadius are for iOS only
                      }}
                    >
                      SOCSO Social Security Scheme for Self-Working
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  stylesHome.imageSlider,
                  { width: 300, marginRight: 16, overflow: "hidden" },
                ]}
                onPress={() =>
                  Linking.openURL(
                    "https://help.grab.com/driver/en-my/115002266187-Driver-Benefits-and-Services"
                  )
                }
              >
                <ImageBackground
                  source={{
                    uri: "https://media2.malaymail.com/uploads/articles/2021/2021-04/20210417HR8_grab_bekal_food_delivery_riders.jpg",
                  }}
                  style={[
                    // stylesHome.imageSlider,
                    {
                      height: "100%",
                      width: "100%",
                      backgroundColor: "#1b434d00",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 30,
                      // opacity: 0.5,
                      // justifyContent: "center",
                    },
                  ]}
                  resizeMode="cover"
                >
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        color: "#fdfdfd",
                        fontFamily: "Nunito-Bold",
                        fontSize: 25,
                        // marginTop: 10,
                        textAlign: "center",
                        textShadowColor: "#222",
                        shadowOpacity: 0.5,
                        textShadowOffset: { width: 0.5, height: 0.5 },
                        textShadowRadius: 0.5,
                        // shadowColor, shadowOffset, shadowOpacity, shadowRadius are for iOS only
                      }}
                    >
                      Grab Drivers' Benefits and Services
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  stylesHome.imageSlider,
                  { width: 300, marginRight: 16, overflow: "hidden" },
                ]}
                onPress={() =>
                  Linking.openURL(
                    "https://www.kwsp.gov.my/en/member/savings/self-contribution"
                  )
                }
              >
                <ImageBackground
                  source={{
                    uri: "data:image/jpeg;base64,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",
                  }}
                  style={[
                    // stylesHome.imageSlider,
                    {
                      height: "100%",
                      width: "100%",
                      backgroundColor: "#1b434d00",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 30,
                      // opacity: 0.5,
                      // justifyContent: "center",
                    },
                  ]}
                  resizeMode="cover"
                >
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        color: "#fdfdfd",
                        fontFamily: "Nunito-Bold",
                        fontSize: 25,
                        // marginTop: 10,
                        textAlign: "center",
                        textShadowColor: "#222",
                        shadowOpacity: 0.5,
                        textShadowOffset: { width: 0.5, height: 0.5 },
                        textShadowRadius: 0.5,
                        // shadowColor, shadowOffset, shadowOpacity, shadowRadius are for iOS only
                      }}
                    >
                      KWSP : Secure Retirement With Self-Contribution
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 50 }}></View>
      </View>
    </ScrollView>
  );
}
