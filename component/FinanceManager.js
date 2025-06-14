import React, { useState, useContext, useEffect } from "react";
import { Modal } from "react-native";
import {
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Text,
  FlatList,
  Image,
  View,
  Dimensions,
  TextInput,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { styles, stylesHome } from "../styles";
// import { database } from '../firebase';
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
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
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, LineChart } from "react-native-gifted-charts";
import BottomBar from "./BottomBar";

export default function FinanceManager() {
  // const [record, setRecord] = useState([]);
  // const [selectedPost, setSelectedPost] = useState(null);
  // const [comment, setComment] = useState("");
  // const [isVisible, setIsVisible] = useState(false);
  // const [comments, setComments] = useState([]);
  // const [isAll, setIsAll] = useState(true);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [filteredPosts, setFilteredPosts] = useState([]);
  // const [values,setValues] = useState([1]);
  // const [sliceColor,setSliceColor]=useState(['#333333'])
  // const [data, setData] = useState([{value:0},{value:0}]);
  const { user } = useContext(UserContext);
  const [showLineChart, setShowLineChart] = useState(false);
  const [isMonthly, setIsMonthly] = useState(false);
  const [data, setData] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncomeMonthly, setTotalIncomeMonthly] = useState(0);
  const [totalExpenseMonthly, setTotalExpenseMonthly] = useState(0);

  const { width } = Dimensions.get("window");

  const navi = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "financeRecords");

    //   // Listen to data changes in the "posts" node
    //   const unsubscribePost = onValue(postsRef, (snapshot) => {
    //   const data = snapshot.val();

    onValue(postsRef, (snapshot) => {
      let income = 0;
      let expense = 0;
      let incomeM = 0;
      let expenseM = 0;

      const data = snapshot.val();
      if (data) {
        Object.values(data).forEach((transaction) => {
          if (
            transaction.type === "Income" &&
            transaction.email == user.email &&
            new Date(transaction.date).toDateString() ==
              new Date().toDateString()
          ) {
            income += parseFloat(transaction.value); // Assuming 'amount' is a number field
          } else if (
            transaction.type === "Expense" &&
            transaction.email == user.email &&
            new Date(transaction.date).toDateString() ==
              new Date().toDateString()
          ) {
            expense += parseFloat(transaction.value);
          }
        });

        Object.values(data).forEach((transaction) => {
          if (
            transaction.type === "Income" &&
            transaction.email == user.email &&
            new Date(transaction.date).getMonth() == new Date().getMonth()
          ) {
            incomeM += parseFloat(transaction.value); // Assuming 'amount' is a number field
          } else if (
            transaction.type === "Expense" &&
            transaction.email == user.email &&
            new Date(transaction.date).getMonth() == new Date().getMonth()
          ) {
            expenseM += parseFloat(transaction.value);
          }
        });
      }

      setData(data);
      setTotalExpense(expense);
      setTotalIncome(income);
      setTotalExpenseMonthly(expenseM);
      setTotalIncomeMonthly(incomeM);
    });

    //   const dataGraph = (items) => {
    //     // Group items by month using the logic provided
    //     const grouped = items.reduce((acc, item) => {
    //     const month = new Date(item.date).toLocaleString('default', { month: 'short' });

    //       if (!acc[month]) {
    //         acc[month] = { income: 0, expense: 0 };
    //       }

    //       // Sum income or expense based on type
    //         if (item.type === 'Income' && item.email === user.email) {
    //           acc[month].income += parseFloat(item.value);
    //         } else if (item.type === 'Expense' && item.email === user.email) {
    //           acc[month].expense += parseFloat(item.value);
    //         }

    //       return acc;
    //     }, {});

    //     return grouped;
    //   };
  }, []);

  //to get data for weekly graph
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const getWeeklyData = () => {
    const days = getLast7Days();
    const incomeData = [];
    const expenseData = [];

    days.forEach((date) => {
      let income = 0;
      let expense = 0;
      if (data) {
        Object.values(data).forEach((transaction) => {
          const tDate = new Date(transaction.date);
          if (
            transaction.email === user.email &&
            tDate.toDateString() === date.toDateString()
          ) {
            if (transaction.type === "Income") {
              income += parseFloat(transaction.value);
            } else if (transaction.type === "Expense") {
              expense += parseFloat(transaction.value);
            }
          }
        });
      }
      // Use short day name for x-axis
      incomeData.push({
        value: income,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
      expenseData.push({
        value: expense,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    });

    return { incomeData, expenseData };
  };

  //to get graph data for 6-month graph
  const getLast6Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(d);
    }
    return months;
  };

  const getMonthlyData = () => {
    const months = getLast6Months();
    const incomeData = [];
    const expenseData = [];

    months.forEach((date) => {
      let income = 0;
      let expense = 0;
      if (data) {
        Object.values(data).forEach((transaction) => {
          const tDate = new Date(transaction.date);
          if (
            transaction.email === user.email &&
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          ) {
            if (transaction.type === "Income") {
              income += parseFloat(transaction.value);
            } else if (transaction.type === "Expense") {
              expense += parseFloat(transaction.value);
            }
          }
        });
      }
      // Use short month name for x-axis
      incomeData.push({
        value: income,
        label: date.toLocaleDateString("en-US", { month: "short" }),
      });
      expenseData.push({
        value: expense,
        label: date.toLocaleDateString("en-US", { month: "short" }),
      });
    });

    return { incomeData, expenseData };
  };

  const { incomeData, expenseData } = getWeeklyData();
  const { incomeData: monthlyIncomeData, expenseData: monthlyExpenseData } =
    getMonthlyData();

  const allValues = [
    ...incomeData.map((d) => d.value),
    ...expenseData.map((d) => d.value),
  ];
  const maxY = Math.max(10, ...allValues);

  const pieChartDataDaily = [
    {
      value: totalIncome,
      color: "#20734f",
    },
    {
      value: totalExpense,
      color: "#ec2d01",
    },
  ];

  const pieChartDataMonthly = [
    {
      value: totalIncomeMonthly,
      color: "#20734f",
    },
    {
      value: totalExpenseMonthly,
      color: "#ec2d01",
    },
  ];

  const nullChart = [
    {
      value: 1,
      color: "#ddd",
    },
  ];

  return (
    <View style={styles.container3}>
      <View style={styles.container}>
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
          <Text style={[styles.text]}>Expense Manager</Text>

          <StatusBar style="auto" />

          <ScrollView
            style={[
              styles.container2,
              {
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              },
            ]}
          >
            <View
              style={{
                paddingHorizontal: 10,
                marginBottom: 5,
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  marginLeft: "auto",
                  marginRight: 15,
                  alignSelf: "center",
                  color: "#030303",
                  fontFamily: "Nunito-Bold",
                }}
              >
                Daily
              </Text>
              <Switch
                style={{
                  marginRight: 15,
                  color: "#fdfdfd",
                  fontWeight: "bold",
                }}
                trackColor={{ false: "#1b434d", true: "#81b0ff" }}
                thumbColor={isMonthly ? "#1b434d" : "#81b0ff"}
                ios_backgroundColor="#3e3e3e"
                value={isMonthly}
                onValueChange={(value) => setIsMonthly(value)}
              />
              <Text
                style={{
                  alignSelf: "center",
                  color: "#030303",
                  fontFamily: "Nunito-Bold",
                }}
              >
                Monthly
              </Text>
            </View>

            {!isMonthly ? (
              <>
                {totalExpense > 0 || totalIncome > 0 ? (
                  <View
                    style={{
                      height: 350,
                      // backgroundColor: "red",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingTop: 10,
                    }}
                  >
                    <View
                      // backgroundColor="#00ff00"
                      style={{ justifyContent: "center", alignItems: "center" }}
                      height={350}
                    >
                      <PieChart
                        style={{ backgroundColor: "transparent" }} // not "styles"
                        data={pieChartDataDaily}
                        donut
                        textSize={16}
                        innerRadius={Platform.OS === "ios" ? 120 : 110}
                        radius={Platform.OS === "ios" ? 160 : 140}
                        isAnimated={true}
                        animationDuration={2000}
                        showText // <-- add this
                        showValuesAsPercentage // <-- add this
                        textColor="#000" // or any visible color
                      />

                      <View
                        style={{
                          height: 100,
                          position: "absolute",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{ fontFamily: "Nunito-Bold", fontSize: 25 }}
                        >
                          {new Date().toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                        <Text
                          style={{ fontFamily: "Nunito-Bold", fontSize: 25 }}
                        >
                          Net profit
                        </Text>
                        {totalIncome - totalExpense >= 0 ? (
                          <>
                            <Text
                              style={{
                                fontFamily: "Nunito-Bold",
                                fontSize: 35,
                                color: "green",
                              }}
                            >
                              RM{" "}
                              {(totalIncome - totalExpense).toFixed(2).length >
                              7
                                ? (totalIncome - totalExpense)
                                    .toFixed(2)
                                    .slice(0, 7) + "..."
                                : (totalIncome - totalExpense).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={{ fontSize: 35, color: "#F44F4F" }}>
                              - RM{" "}
                              {(totalExpense - totalIncome).toFixed(2).length >
                              7
                                ? (totalExpense - totalIncome)
                                    .toFixed(2)
                                    .slice(0, 7) + "..."
                                : (totalExpense - totalIncome).toFixed(2)}
                            </Text>
                          </>
                        )}
                      </View>

                      {/* <View
                        style={{
                          backgroundColor: "rgba(255,255,255,120)",
                          borderRadius: 30,
                          height: Platform.OS === "ios" ? 340 : 300,
                          width: width - 50,
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 10,
                          flex: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            marginBottom: 10,
                            color: "#03633a",
                            fontSize: 20,
                          }}
                        >
                          Weekly Income vs Expense
                        </Text>
                        <LineChart
                          data={incomeData}
                          data2={expenseData}
                          // backgroundColor={"yellow"}
                          height={220}
                          // width={Dimensions.get("window").width * 0.8}
                          spacing={40}
                          initialSpacing={30}
                          color1="#3282F6"
                          color2="#F44F4F"
                          textColor1="#222"
                          textColor2="#222"
                          thickness={2}
                          thickness2={2}
                          hideDataPoints={false}
                          dataPointsColor1="#3282F6"
                          dataPointsColor2="#F44F4F"
                          yAxisColor="#aaa"
                          xAxisColor="#aaa"
                          yAxisTextStyle={{
                            color: "#222",
                            paddingRight: 10,
                            marginHorizontal: 50,
                            width: 50,
                          }}
                          xAxisLabelTextStyle={{ color: "#222" }}
                          noOfSections={5}
                          yAxisLabelPrefix="RM "
                          showLegend={true}
                          legendLabel1="Income"
                          legendLabel2="Expense"
                          showXAxisIndices
                          showYAxisIndices
                          showDataPointText={true}
                          maxValue={maxY}
                        />
                      </View> */}
                    </View>
                  </View>
                ) : (
                  // <View style={{height: 325, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                  //     <Text>No  data available</Text>
                  // </View>

                  <View
                    style={{
                      height: 325,
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <PieChart
                      style={{ backgroundColor: "transparent" }} // not "styles"
                      data={nullChart}
                      donut
                      textSize={16}
                      innerRadius={Platform.OS === "ios" ? 120 : 110}
                      radius={Platform.OS === "ios" ? 160 : 140}
                      isAnimated={true}
                      animationDuration={2000}
                      showText // <-- add this
                      showValuesAsPercentage // <-- add this
                      textColor="#000" // or any visible color
                    />
                    <View
                      style={{
                        height: 100,
                        position: "absolute",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text>No data available</Text>
                    </View>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 20,
                      borderColor: "#20734f",
                      borderWidth: 3,
                      backgroundColor: "#000f44f4f",
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      Gain:{" "}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Nunito-Regular",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      RM {totalIncome}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 20,
                      borderColor: "#f44f4f",
                      borderWidth: 3,
                      backgroundColor: "#0003282F6",
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      Spent:{" "}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Nunito-Regular",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      RM {totalExpense}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                {totalExpenseMonthly > 0 || totalIncomeMonthly > 0 ? (
                  <View
                    style={{
                      height: 350,
                      // backgroundColor: "red",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingTop: 10,
                    }}
                  >
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                      // backgroundColor="#00ff00"
                      height={350}
                    >
                      {/* <View
                        style={{
                          backgroundColor: "transparent",
                          borderRadius: 30,
                          height: Platform.OS === "ios" ? 340 : 300,
                          width: width - 50,
                          justifyContent: "center",
                          alignItems: "center",
                          paddingVertical: 30,
                          marginRight: 50,
                          flex: 1,
                        }}
                      > */}
                      <PieChart
                        style={{ backgroundColor: "transparent" }} // not "styles"
                        data={pieChartDataMonthly}
                        donut
                        textSize={16}
                        innerRadius={Platform.OS === "ios" ? 120 : 110}
                        radius={Platform.OS === "ios" ? 160 : 140}
                        isAnimated={true}
                        animationDuration={2000}
                        showText // <-- add this
                        showValuesAsPercentage // <-- add this
                        textColor="#000" // or any visible color
                      />
                      <View
                        style={{
                          height: 100,
                          position: "absolute",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            fontSize: 25,
                          }}
                        >
                          {new Date().toLocaleDateString("en-US", {
                            month: "long",
                          })}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            fontSize: 25,
                          }}
                        >
                          Net profit
                        </Text>
                        {totalIncomeMonthly - totalExpenseMonthly >= 0 ? (
                          <>
                            <Text
                              style={{
                                fontFamily: "Nunito-Bold",
                                fontSize: 35,
                                color: "green",
                              }}
                            >
                              RM{" "}
                              {(
                                totalIncomeMonthly - totalExpenseMonthly
                              ).toFixed(2).length > 7
                                ? (totalIncomeMonthly - totalExpenseMonthly)
                                    .toFixed(2)
                                    .slice(0, 7) + "..."
                                : (
                                    totalIncomeMonthly - totalExpenseMonthly
                                  ).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={{ fontSize: 35, color: "#F44F4F" }}>
                              - RM{" "}
                              {(totalExpense - totalIncome).toFixed(2).length >
                              7
                                ? (totalExpense - totalIncome)
                                    .toFixed(2)
                                    .slice(0, 7) + "..."
                                : (totalExpense - totalIncome).toFixed(2)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      height: 325,
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <PieChart
                      style={{ backgroundColor: "transparent" }} // not "styles"
                      data={nullChart}
                      donut
                      textSize={16}
                      innerRadius={Platform.OS === "ios" ? 120 : 110}
                      radius={Platform.OS === "ios" ? 160 : 140}
                      isAnimated={true}
                      animationDuration={2000}
                      showText // <-- add this
                      showValuesAsPercentage // <-- add this
                      textColor="#000" // or any visible color
                    />
                    <View
                      style={{
                        height: 100,
                        position: "absolute",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text>No data available</Text>
                    </View>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 20,
                      borderColor: "#20734f",
                      borderWidth: 3,
                      backgroundColor: "#000f44f4f",
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      Gain:{" "}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Nunito-Regular",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      RM {totalIncomeMonthly}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 20,
                      borderColor: "#f44f4f",
                      borderWidth: 3,
                      backgroundColor: "#0003282F6",
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Nunito-Bold",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      Spent:{" "}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Nunito-Regular",
                        fontSize: Platform.OS === "ios" ? 20 : 18,
                      }}
                    >
                      RM {totalExpenseMonthly}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View
              style={{
                flexDirection: "row",
                height: 150,
                width: "100%",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <View>
                <TouchableOpacity
                  onPress={() =>
                    navi.navigate("CreateFinanceRecord", { type: "Income" })
                  }
                  style={[styles.button, { minWidth: 150, marginBottom: 10 }]}
                >
                  <Text style={{ fontFamily: "Nunito-Bold", color: "#fdfdfd" }}>
                    Add Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navi.navigate("CreateFinanceRecord", { type: "Expense" })
                  }
                  style={[styles.button, { minWidth: 150, marginBottom: 10 }]}
                >
                  <Text style={{ fontFamily: "Nunito-Bold", color: "#fdfdfd" }}>
                    Add Expense
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navi.navigate("FinancialRecord");
                  }}
                  style={[styles.button, { minWidth: 150, marginBottom: 10 }]}
                >
                  <Text style={{ fontFamily: "Nunito-Bold", color: "#fdfdfd" }}>
                    See Records
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navi.navigate("ScanReceipt")}
                  style={[styles.button, { minWidth: 150, marginBottom: 10 }]}
                >
                  <Text style={{ fontFamily: "Nunito-Bold", color: "#fdfdfd" }}>
                    Scan Gig History
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 20 }}></View>
          </ScrollView>
          <Modal
            visible={showLineChart}
            transparent
            animationType="slide"
            onRequestClose={() => setShowLineChart(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 20,
                  width: "90%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    marginBottom: 10,
                    color: "#03633a",
                  }}
                >
                  Weekly Income vs Expense
                </Text>
                <LineChart
                  data={incomeData}
                  data2={expenseData}
                  height={220}
                  // backgroundColor={'#0000ff'}
                  spacing={45}
                  initialSpacing={30}
                  color1="#3282F6"
                  color2="#F44F4F"
                  textColor1="#222"
                  textColor2="#222"
                  thickness={2}
                  thickness2={2}
                  hideDataPoints={false}
                  dataPointsColor1="#3282F6"
                  dataPointsColor2="#F44F4F"
                  yAxisColor="#aaa"
                  xAxisColor="#aaa"
                  yAxisTextStyle={{
                    color: "#222",
                    paddingRight: 10,
                    // marginHorizontal: 50,
                    // width: 50,
                  }}
                  xAxisLabelTextStyle={{ color: "#222" }}
                  noOfSections={5}
                  yAxisLabelPrefix="RM "
                  yAxisLabelWidth={50}
                  yAxisTextNumberOfLines={2}
                  showLegend={true}
                  legendLabel1="Income"
                  legendLabel2="Expense"
                  showXAxisIndices
                  showYAxisIndices
                  showDataPointText={true}
                  maxValue={Math.max(
                    10,
                    ...incomeData.map((d) => d.value),
                    ...expenseData.map((d) => d.value)
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowLineChart(false)}
                  style={{
                    marginTop: 20,
                    backgroundColor: "#03633a",
                    borderRadius: 10,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <BottomBar></BottomBar>
        </ImageBackground>
      </View>
    </View>
  );
}
