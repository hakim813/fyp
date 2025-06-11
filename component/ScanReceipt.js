import React, { useState, useContext } from "react";
import { auth, database } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import {
  ref,
  set,
  push,
  getDatabase,
  get,
  child,
  onValue,
  serverTimestamp,
  update,
} from "firebase/database";
import { UserContext } from "../UserContext";
import {
  View,
  Button,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ImageBackground,
} from "react-native";
import { stylesHome, styles } from "../styles";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const ScanReceipt = () => {
  const [ocrLines, setOcrLines] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navi = useNavigation();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        sendToOCRSpace(asset.base64);
      } else {
        Alert.alert("No Image Selected", "Please select an image to proceed.");
      }
    } catch (error) {
      console.error("Image Picker Error:", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  const sendToOCRSpace = async (base64Image) => {
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("apikey", "K86870090988957");
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "true");
      formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);

      const response = await axios.post(
        "https://api.ocr.space/parse/image",
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // console.log("OCR API Response:", response.data);

      const parsedText = response.data?.ParsedResults?.[0]?.ParsedText;
      if (parsedText) {
        const rawLines = parsedText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");

        // const grouped = groupLines(rawLines);
        // const transactions = parseTransactions(parsedText);
        // console.log("Parsed Transactions:", transactions);
        console.log(`Array of the OCR scanned lines data => ${rawLines}`);
        formatText(rawLines);
        // formatText();
        // setOcrLines(rawLines);
      } else {
        setOcrLines([]);
        Alert.alert("OCR Failed", "No text found in the image.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert("Error", "Failed to process the image.");
    } finally {
      setLoading(false);
    }
  };

  // try

  function normalizeDate(inputString) {
    const currentYear = new Date().getFullYear();

    // Check if the input has a year (e.g., "18 Mar 2025")
    const hasYear = /\d{4}/.test(inputString);

    let day, month, year;

    if (hasYear) {
      // If the string already contains the year (e.g., "18 Mar 2025")
      const [dayString, monthString, yearString] = inputString.split(" ");
      day = dayString;
      month = monthString;
      year = yearString;
    } else {
      // If the string does not contain the year (e.g., "Fri, 18 Mar")
      const [dayOfWeek, dayString, monthString] = inputString.split(" ");
      day = dayString;
      month = monthString;
      year = currentYear; // Use current year
    }

    // Format the final date as "18 Mar 2025"
    const formattedDate = `${day} ${month.slice(0, 3)} ${year}`;
    return formattedDate;
  }

  const formatText = (lines) => {
    const dateRegex =
      /^(?:[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]+|\d{1,2} [A-Z][a-z]{3} \d{4})$/;
    const dateRegex2 = /^\d{1,2} [A-Z][a-z]{2} \d{4}$/;

    const timeRegex = /^\d{2}:\d{2}$/;
    // const moneyRegex = /^-?MYR \d+\.\d{2}$/;
    const moneyRegex = /^([+-]?\s?)?(MYR\s?)?\d+\.\d{2}$/i;
    const positiveRegex = /^(\+?\s?)?(MYR\s?)?\d+\.\d{2}$/i;
    const negativeRegex = /^(-\s?)?(MYR\s?)?\d+\.\d{2}$/i;

    const results = [];
    // const usedDates = new Set();
    let moneyIndex = 0;
    const moneyLines = lines.filter((l) => moneyRegex.test(l));

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (dateRegex.test(line) || dateRegex2.test(line)) {
        let date = normalizeDate(line); // Normalize the date here
        // console.log("Date: ", date);

        // Search forward for the next time value
        for (let j = i + 1; j < lines.length; j++) {
          if (dateRegex.test(lines[j]) || dateRegex2.test(lines[j])) break;
          if (lines[j] === "Total cash you have") {
            moneyIndex++;
            continue;
          }
          const potentialTime = lines[j].slice(0, 5); // cut off anything after time if needed
          if (timeRegex.test(potentialTime)) {
            const time = potentialTime;
            const money = moneyLines[moneyIndex++]; // Get next unassigned money
            if (money) {
              const [day, month, year] = date.split(" ");
              const monthMap = {
                Jan: "01",
                Feb: "02",
                Mar: "03",
                Apr: "04",
                May: "05",
                Jun: "06",
                Jul: "07",
                Aug: "08",
                Sep: "09",
                Oct: "10",
                Nov: "11",
                Dec: "12",
              };
              const formattedDate = `${year}-${monthMap[month]}-${day}`;

              if (positiveRegex.test(money)) {
                const cleaned = money.replace(/(MYR\s*|[+-]\s*)/gi, "");
                const dateObj = Date.parse(new Date(formattedDate));

                // console.log("Date:", dateObj, "| Type:", typeof dateObj);
                results.push({ dateObj, time, cleaned, status: "Gained" });
              } else {
                const cleaned = money.replace(/(MYR\s*|[+-]\s*)/gi, "");
                const dateObj = Date.parse(new Date(formattedDate));

                // console.log("Date:", dateObj, "| Type:", typeof dateObj);
                results.push({ dateObj, time, cleaned, status: "Spent" });
              }
            }
          }
        }
      }
    }

    setOcrLines(results);
  };

  const writeData = async (expenseArr) => {
    if (ocrLines.length < 1) {
      alert("No financial data fetched.");
      return;
    }
    const recordRef = ref(database, "financeRecords/"); // Parent path where data will be stored

    for (let i = 0; i < expenseArr.length; i++) {
      const newRecordRef = push(recordRef);

      set(newRecordRef, {
        email: user.email,
        type: expenseArr[i].status === "Gained" ? "Income" : "Expense",
        value: parseFloat(parseFloat(expenseArr[i].cleaned).toFixed(2)), // Use the parsed numeric value
        notes: "",
        date: expenseArr[i].dateObj,
      })
        .then(() => {
          console.log(
            `Index: ${i}\nAmount: ${parseFloat(
              parseFloat(expenseArr[i].cleaned).toFixed(2)
            )}\nDate: ${expenseArr[i].dateObj}\n\n`
          );
        })
        .catch((error) => console.error("Error writing data: ", error));
      // }
    }

    navi.navigate("FinanceManager");
  };

  if (loading) {
    return (
      <View style={{ width: "100%", height: "100%" }}>
        <ImageBackground
          source={require("../assets/landing-bg.png")} // Your image path
          style={[
            styles.background,
            {
              alignItems: "center",
              justifyContent: "center",
              paddingTop:
                Platform.OS === "ios"
                  ? StatusBar.currentHeight + 50
                  : StatusBar.currentHeight,
            },
          ]}
          resizeMode="cover"
        >
          {/* <ActivityIndicator
            size="large"
            color="#ffffff"
            style={{ marginTop: 60 }}
          /> */}
          <Text
            style={{
              fontFamily: "Nunito",
              fontSize: 20,
              color: "#fdfdfd",
              marginTop: 60,
            }}
          >
            Scanning receipt...
          </Text>
        </ImageBackground>
      </View>
    );
  }

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
          <Text style={[styles.text]}>Scan Receipt</Text>

          <StatusBar style="auto" />
          <View
            style={[
              styles.container2,
              {
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                // backgroundColor: "#fdfdfd",
                alignItems: "center",
                paddingBottom: 60,
              },
            ]}
          >
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 300,
                  minHeight: 300,
                  marginTop: 20,
                }}
                resizeMode="contain"
              />
            )}
            {!imageUri && (
              <View
                style={{
                  width: 300,
                  height: 300,
                  marginTop: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text>No receipt or data captured</Text>
              </View>
            )}
            {ocrLines.length > 0 ? (
              <ScrollView style={{ marginTop: 20, width: "70%" }}>
                <View style={{ alignItems: "center" }}>
                  {ocrLines.map((line, index) => {
                    const date = new Date(line.dateObj);
                    const formattedDate = `${date.getDate()} ${date.toLocaleString(
                      "default",
                      {
                        month: "short",
                      }
                    )} ${date.getFullYear()}`;

                    return (
                      <Text
                        key={index}
                        style={{
                          marginBottom: 5,
                          fontSize: 20,
                          fontFamily: "Nunito",
                        }}
                      >
                        {`Date  :     ${formattedDate}\nTime  :     ${line.time}\nAmount:   ${line.cleaned}\nStatus:      ${line.status}\n`}
                      </Text>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <View
                style={{
                  width: 300,
                  // height: 500,
                  marginVertical: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    marginBottom: 5,
                    fontSize: 20,
                    fontFamily: "Nunito",
                  }}
                >
                  No financial data found.
                </Text>
              </View>
            )}

            {/* {ocrLines.length > 0 && ( */}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => pickImage()}
                style={{
                  minWidth: 150,
                  padding: 10,
                  margin: 5,
                  backgroundColor: "#06a561",
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Semi-Bold",
                    color: "white",
                    fontSize: 15,
                    margin: 10,
                    textAlign: "center",
                  }}
                >
                  {!imageUri ? "Pick Receipt" : "Choose Other Receipt?"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => writeData(ocrLines)}
                disabled={!imageUri || ocrLines.length < 1}
                style={{
                  minWidth: 150,
                  padding: 10,
                  margin: 5,
                  backgroundColor:
                    imageUri && ocrLines.length > 0 ? "#06a561" : "#A9A9A9",
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Semi-Bold",
                    color: "white",
                    fontSize: 15,
                    margin: 10,
                    textAlign: "center",
                  }}
                >
                  {imageUri && ocrLines.length > 0
                    ? "Record Expense"
                    : "Upload Receipt First"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* )} */}
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

export default ScanReceipt;
