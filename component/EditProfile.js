// import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect } from "react";
import Checkbox from "expo-checkbox";
import {
  StatusBar,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  FlatList,
  View,
  Platform,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ImageBackground,
} from "react-native";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import styles from "../styles";
import { auth, database } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import Icon from "react-native-vector-icons/FontAwesome";
import CheckBox from "@react-native-community/checkbox"; // or use a custom checkbox
import DateTimePicker from "@react-native-community/datetimepicker";

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
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

export default function EditProfile({ route }) {
  const { user } = useContext(UserContext);
  const { section } = route.params;
  const { detail } = route.params;
  const navi = useNavigation();
  const [date, setDate] = useState(new Date(detail.dob) || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fullName, setFullName] = useState(detail.fullName || "");
  const [dob, setDOB] = useState(new Date());
  // const [e, setFullName] = useState("")
  const [phone, setPhone] = useState(detail.phone || "");
  const [address, setAddress] = useState(detail.address || "");

  const [nricId, setNRICId] = useState(detail.nricId || "");
  const [icImages, setIcImages] = useState([]); // Array to hold up to 2 images
  const [taxId, setTaxID] = useState(detail.taxId || "");
  const [workPermit, setWorkPermit] = useState(detail.workPermit || "");

  const [experience, setExperience] = useState(detail.experience || 0);
  const [bankAccountNumber, setBankAccountNumber] = useState(
    detail.bankAccountNumber || ""
  );

  const [image, setImage] = useState([]);
  //   const [mediaModalVisible, setMediaModalVisible] = useState(false);

  //finance
  const [selectedBank, setSelectedBank] = useState(detail.bank || "");
  const [modalBankVisible, setModalBankVisible] = useState("");
  //compliance
  const [selectedInsurance, setSelectedInsurance] = useState(
    detail.insuranceCoverage || ""
  );
  const [selectedSSP, setSelectedSSP] = useState(detail.socialSecurity || "");
  const [selectedLicenses, setSelectedLicenses] = useState(
    detail.licenses || ""
  );
  const [modalHealthVisible, setModalHealthVisible] = useState(false);
  const [modalSSPVisible, setModalSSPVisible] = useState(false);
  const [modalLicensesVisible, setModalLicensesVisible] = useState(false);
  //professional
  const [selectedStatus, setSelectedStatus] = useState(detail.workStatus || "");
  const [selectedWorkCategory, setSelectedWorkCategory] = useState(
    detail.workCategory || ""
  );
  const [modalStatusVisible, setModalStatusVisible] = useState(false);
  const [modalWorkCategoryVisible, setModalWorkCategoryVisible] =
    useState(false);

  const pickImage = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    const selectedUris = results.assets.map((asset) => asset.uri);
    // console.log("SELECTEEDDD", selectedUris);
    setImage(selectedUris); // save array of URIs
    // console.log("Selected images: ", selectedUris);
  };

  const pickIcImage = async () => {
    if (icImages.length >= 2) {
      Alert.alert("You can only upload up to 2 images.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 1,
    });

    if (!result.canceled) {
      setIcImages([...icImages, result.assets[0].uri]);
    }
  };

  const INSURANCE = ["None", "Health", "Accident", "Vehicle"];
  const SSP = ["None", "PERKESO", "KWSP"];
  const LICENSE = ["None", "Heavy-weight Vehicle", "Motorcycle", "Car"];

  const WCat = [
    "None",
    "Food Delivery",
    "Parcel Delivery",
    "Ride-hailing",
    "Freelancing",
    "Others",
  ];
  const WStatus = ["Full-Time", "Part-Time"];

  const BANKS = [
    "AEON Bank",
    "Affin Bank",
    "Al-Rajhi Banking & Investment Corp",
    "Alliance Bank Malaysia",
    "AmBank Berhad",
    "Bank Islam Malaysia",
    "Bank Kerjasama Rakyat Malaysia",
    "Bank Muamalat",
    "Bank of America",
    "Bank of China",
    "Bank Pertanian Malaysia (AGROBANK)",
    "Bank Simpanan Nasional",
    "BNP Paribas Malaysia",
    "Bangkok Bank",
    "BigPay Malaysia",
    "Boost Bank",
    "Boost eWallet",
    "China Construction Bank",
    "CIMB Bank",
    "Citibank Berhad",
    "Co-opbank Pertama",
    "Deutsche Bank",
    "Finexus Cards",
    "GXBank",
    "Hong Leong",
    "HSBC Bank",
    "Industrial & Commercial Bank of China",
    "JP Morgan Chase Bank",
    "KAF Digital Bank",
    "Kuwait Finance House",
    "MBSB Bank",
    "Mizuho Bank",
    "MUFG Bank",
    "Merchantrade",
    "OCBC Bank",
    "Public Bank",
    "RHB Bank",
    "Ryt Bank",
    "Standard Chartered Bank",
    "Sumitomo Mitsui Banking",
    "United Overseas Bank",
  ];

  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };
  const LANGUAGES = ["English", "Malay", "Chinese", "Indian", "others"];

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios"); // Only stays open on iOS
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDateForDB = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const updateData = async (existingId) => {
    const recordRef = ref(database, `financeRecords/${existingId}`); // Parent path where data will be stored
    // const newRecordRef = push(recordRef);

    // Parse and validate value
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || value.trim() === "") {
      Alert.alert("Please enter a valid number.");
      return;
    } else if (numericValue <= 0) {
      Alert.alert("Invalid value. Please enter a positive number.");
      return;
    } else {
      update(recordRef, {
        email: user.email,
        value: value,
        // notes: notes,
      })
        .then(() => {
          type == "Expense"
            ? console.log(
                `Expense from ${user.email} with value RM ${numericValue} recorded.`
              )
            : console.log(
                `Income from ${user.email} with value RM ${numericValue} recorded.`
              );
        })
        .catch((error) => console.error("Error writing data: ", error));

      navi.navigate("FinanceManager");
    }
  };

  const handleSubmit = async () => {
    try {
      const dbRef = ref(database, `users/${user.uid}`);
      let updates = {};

      if (section === "Personal") {
        updates = {
          fullName,
          dob: formatDateForDB(date),
          phone,
          address,
        };
      }

      if (section === "Profile Pic") {
        if (image.length > 0) {
          const url = await uploadImageAsync(
            image[0],
            `profilePhotos/${user.uid}.jpg`
          );
          updates.profilePhoto = url;
        } else {
          Alert.alert("No image is selected. Please select an image.");
          return;
        }
      }

      if (section === "Identification") {
        // Upload up to 2 IC images and store URLs as array
        let icUrls = [];
        for (let i = 0; i < icImages.length; i++) {
          const url = await uploadImageAsync(
            icImages[i],
            `icPhotos/${user.uid}_${i}.jpg`
          );
          icUrls.push(url);
        }
        updates.nricId = nricId;
        updates.icPhotos = icUrls; // store array of URLs
        updates.taxId = taxId;
        updates.workPermit = workPermit;
      }

      if (section === "Professional") {
        if (selectedLanguages.length === 0) {
          Alert.alert("Please select at least one language.");
          return;
        }
        updates.workStatus = selectedStatus;
        updates.workCategory = selectedWorkCategory;
        updates.experience = experience;
        updates.languages = selectedLanguages;
      }

      if (section === "Finance") {
        updates.bank = selectedBank;
        updates.bankAccountNumber = bankAccountNumber;
      }

      if (section === "Compliance") {
        updates.insuranceCoverage = selectedInsurance;
        updates.socialSecurity = selectedSSP;
        updates.licenses = selectedLicenses;
      }

      await update(dbRef, updates);
      Alert.alert("Success", "Profile updated!");
      navi.navigate("Profile");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const uploadImageAsync = async (uri, path) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const imgRef = storageRef(storage, path);
    await uploadBytes(imgRef, blob);
    return await getDownloadURL(imgRef);
  };

  //   const writeData = async () => {
  //     const recordRef = ref(database, "financeRecords/"); // Parent path where data will be stored
  //     const newRecordRef = push(recordRef);

  //     // Parse and validate value
  //     const numericValue = parseFloat(value);

  //     if (isNaN(numericValue) || value.trim() === "") {
  //       Alert.alert("Please enter a valid number.");
  //       return;
  //     } else if (numericValue <= 0) {
  //       Alert.alert("Invalid value. Please enter a positive number.");
  //       return;
  //     } else {
  //       set(newRecordRef, {
  //         email: user.email,
  //         type: type,
  //         value: numericValue, // Use the parsed numeric value
  //         notes: notes,
  //         date: serverTimestamp(),
  //       })
  //         .then(() => {
  //           console.log(
  //             type === "Expense"
  //               ? `Expense from ${user.email} with value RM ${numericValue} recorded.`
  //               : `Income from ${user.email} with value RM ${numericValue} recorded.`
  //           );
  //         })
  //         .catch((error) => console.error("Error writing data: ", error));

  //       navi.navigate("FinanceManager");
  //     }
  //   };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust if you have a header
    >
      <TouchableWithoutFeedback>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ height: "100%" }}>
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
              <Text style={[styles.text]}>{section}</Text>

              <Modal
                visible={modalBankVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalBankVisible(false)}
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
                      Select Category
                    </Text>
                    <Picker
                      selectedValue={selectedBank}
                      style={{ width: "100%", color: "red" }}
                      onValueChange={(itemValue) => setSelectedBank(itemValue)}
                    >
                      <Picker.Item label="Select Bank" value="" />
                      {BANKS.map((bank) => (
                        <Picker.Item
                          key={bank}
                          label={bank}
                          value={bank}
                          color="black"
                        />
                      ))}
                      {/* Add more categories as needed */}
                    </Picker>
                    <TouchableOpacity
                      onPress={() => setModalBankVisible(false)}
                      style={{
                        marginTop: 20,
                        backgroundColor: "#1b434d",
                        borderRadius: 10,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Select
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <View
                style={[
                  styles.container2,
                  {
                    borderRadius: 50,
                    marginTop: 30,
                    margin: 15,
                    flex: 0,
                    paddingTop: 70,
                    // paddingBottom: 70,
                  },
                ]}
              >
                {section === "Personal" && (
                  <View
                    style={[
                      styles.containerAttachMedia,
                      { backgroundColor: "", marginTop: -15 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Full Name
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder={detail.fullName}
                      value={fullName}
                      onChangeText={setFullName}
                    />

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Date of Birth
                    </Text>
                    {/* <View style={{ alignItems: "center" }}> */}
                    <TouchableOpacity
                      onPress={showDatepicker}
                      // title={`Select Date: ${formatDate(date)}`}
                      style={[
                        styles.input,
                        {
                          backgroundColor: "#dddddd",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                      ]}
                    >
                      <Text
                        style={{ color: "#333333", fontFamily: "Nunito-Bold" }}
                      >
                        Select Date: {date ? formatDateForDB(date) : ""}
                      </Text>
                      {showDatePicker && (
                        <DateTimePicker
                          value={date}
                          mode="date"
                          is24Hour={true}
                          display="default"
                          onChange={onChangeDate}
                        />
                      )}
                    </TouchableOpacity>
                    {/* </View> */}

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Email
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      value={user.email}
                      // onChangeText={setNotes}
                    />
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Phone Number
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      placeholder="Enter phone number"
                      keyboardType="numeric"
                      value={phone}
                      onChangeText={setPhone}
                    />
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Address
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      value={address}
                      onChangeText={setAddress}
                    />
                  </View>
                )}

                {section === "Profile Pic" && (
                  <View
                    style={[
                      styles.containerAttachMedia,
                      { backgroundColor: "", marginTop: -30 },
                    ]}
                  >
                    {image.length > 0 ? (
                      <View
                        style={{
                          width: 200,
                          height: 200,
                          margin: 5,
                          borderRadius: 5,
                          borderWidth: 1,
                          borderColor: "#ccc",
                          overflow: "hidden", // optional, keeps image inside corners
                        }}
                      >
                        <Image
                          source={{ uri: image[0].uri || image[0] }} // if image is an object with uri or a string
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <Text>No media</Text>
                    )}

                    {image.length <= 0 ? (
                      <TouchableOpacity
                        onPress={() => pickImage()}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          minHeight: 200,
                          borderWidth: 1.5,
                          borderStyle: "dashed",
                          borderColor: "grey",
                          paddingHorizontal: 20,
                          paddingVertical: 5,
                          marginTop: 5,
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View style={{ alignItems: "center" }}>
                          <Icon
                            name="file-image-o"
                            size={40}
                            color={"#555555"}
                          />
                          <Text
                            style={{
                              fontFamily: "Nunito-Bold",
                              fontSize: 15,
                              color: "#555555",
                              textAlign: "center",
                              marginTop: 10,
                            }}
                          >
                            Attach Media{"\n"}(if any)
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => pickImage()}
                        style={{
                          backgroundColor: "#efefef",
                          borderWidth: 0.3,
                          paddingHorizontal: 20,
                          paddingVertical: 5,
                          marginTop: 5,
                          borderRadius: 50,
                          marginRight: "auto",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Nunito-Bold",
                            fontSize: 15,
                            color: "#101010",
                          }}
                        >
                          Attach media
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {section === "Identification" && (
                  <View
                    style={[
                      styles.containerAttachMedia,
                      { backgroundColor: "", marginTop: -30 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      NRIC ID
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder={detail.fullName}
                      value={nricId}
                      onChangeText={setNRICId}
                    />

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      IC Card (Upload back and front)
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      {icImages.map((uri, idx) => (
                        <Image
                          key={idx}
                          source={{ uri }}
                          style={{
                            width: 160,
                            height: 160,
                            borderRadius: 8,
                            marginRight: 10,
                          }}
                        />
                      ))}
                      {icImages.length < 2 && (
                        <TouchableOpacity
                          style={{
                            width: 160,
                            height: 160,
                            borderRadius: 8,
                            backgroundColor: "#eee",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "#ccc",
                          }}
                          onPress={pickIcImage}
                        >
                          <Text style={{ fontSize: 30, color: "#888" }}>+</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {icImages.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setIcImages([])}
                        style={{ marginBottom: 10 }}
                      >
                        <Text
                          style={{
                            color: "red",
                            fontFamily: "Nunito-Regular",
                            fontSize: 18,
                          }}
                        >
                          Remove All
                        </Text>
                      </TouchableOpacity>
                    )}

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Tax ID
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      value={taxId}
                      onChangeText={setTaxID}
                    />
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Work Permit
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      value={workPermit}
                      onChangeText={setWorkPermit}
                    />
                  </View>
                )}

                {section === "Professional" && (
                  <View
                    style={[
                      styles.containerAttachMedia,
                      { backgroundColor: "", marginTop: 15 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Work Status
                    </Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: "center" }]}
                      onPress={() => setModalStatusVisible(true)}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          color: setSelectedStatus ? "#000" : "#aaa",
                        }}
                      >
                        {selectedStatus ? selectedStatus : "Select Work Status"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Work Category
                    </Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: "center" }]}
                      onPress={() => setModalWorkCategoryVisible(true)}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          color: selectedWorkCategory ? "#000" : "#aaa",
                        }}
                      >
                        {selectedWorkCategory
                          ? selectedWorkCategory
                          : "Select Work Category"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Years of Experience
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      value={experience}
                      onChangeText={setExperience}
                    />
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Languages Spoken
                    </Text>
                    {LANGUAGES.map((lang) => (
                      <View
                        key={lang}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 5,
                          marginLeft: 10,
                        }}
                      >
                        <Checkbox
                          value={selectedLanguages.includes(lang)}
                          onValueChange={() => toggleLanguage(lang)}
                          color={
                            selectedLanguages.includes(lang)
                              ? "#296746"
                              : undefined
                          }
                        />
                        <Text
                          style={{
                            marginLeft: 8,
                            fontFamily: "Nunito-Regular",
                            fontSize: 16,
                          }}
                        >
                          {lang}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {section === "Finance" && (
                  <View
                    style={[
                      styles.containerAttachMedia,
                      { backgroundColor: "", marginTop: 15 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Bank
                    </Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: "center" }]}
                      onPress={() => setModalBankVisible(true)}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          color: selectedBank ? "#000" : "#aaa",
                        }}
                      >
                        {selectedBank ? selectedBank : "Select Bank"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Bank Account
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      value={bankAccountNumber}
                      onChangeText={setBankAccountNumber}
                    />

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Account Holder Name
                    </Text>
                    <TextInput
                      style={[styles.input]}
                      numberOfLines={10}
                      placeholder="Write out your content"
                      // value={notes}
                      // onChangeText={setNotes}
                    />
                  </View>
                )}

                <Modal
                  visible={modalHealthVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalHealthVisible(false)}
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
                        Select Category
                      </Text>
                      <Picker
                        selectedValue={selectedInsurance}
                        style={{ width: "100%", color: "red" }}
                        onValueChange={(itemValue) =>
                          setSelectedInsurance(itemValue)
                        }
                      >
                        <Picker.Item label="Select Insurance" value="" />
                        {INSURANCE.map((u) => (
                          <Picker.Item
                            key={u}
                            label={u}
                            value={u}
                            color="black"
                          />
                        ))}
                        {/* Add more categories as needed */}
                      </Picker>
                      <TouchableOpacity
                        onPress={() => setModalHealthVisible(false)}
                        style={{
                          marginTop: 20,
                          backgroundColor: "#1b434d",
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          Select
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={modalSSPVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalSSPVisible(false)}
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
                        Select Category
                      </Text>
                      <Picker
                        selectedValue={selectedSSP}
                        style={{ width: "100%", color: "red" }}
                        onValueChange={(itemValue) => setSelectedSSP(itemValue)}
                      >
                        <Picker.Item label="Select SSP" value="" />
                        {SSP.map((u) => (
                          <Picker.Item
                            key={u}
                            label={u}
                            value={u}
                            color="black"
                          />
                        ))}
                        {/* Add more categories as needed */}
                      </Picker>
                      <TouchableOpacity
                        onPress={() => setModalSSPVisible(false)}
                        style={{
                          marginTop: 20,
                          backgroundColor: "#1b434d",
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          Select
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={modalLicensesVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalLicensesVisible(false)}
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
                        Select Category
                      </Text>
                      <Picker
                        selectedValue={selectedLicenses}
                        style={{ width: "100%", color: "red" }}
                        onValueChange={(itemValue) =>
                          setSelectedLicenses(itemValue)
                        }
                      >
                        <Picker.Item label="Select Bank" value="" />
                        {LICENSE.map((license) => (
                          <Picker.Item
                            key={license}
                            label={license}
                            value={license}
                            color="black"
                          />
                        ))}
                        {/* Add more categories as needed */}
                      </Picker>
                      <TouchableOpacity
                        onPress={() => setModalLicensesVisible(false)}
                        style={{
                          marginTop: 20,
                          backgroundColor: "#1b434d",
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          Select
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={modalWorkCategoryVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalWorkCategoryVisible(false)}
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
                        Select Category
                      </Text>
                      <Picker
                        selectedValue={selectedSSP}
                        style={{ width: "100%", color: "red" }}
                        onValueChange={(itemValue) =>
                          setSelectedWorkCategory(itemValue)
                        }
                      >
                        <Picker.Item label="Select Work Category" value="" />
                        {WCat.map((u) => (
                          <Picker.Item
                            key={u}
                            label={u}
                            value={u}
                            color="black"
                          />
                        ))}
                        {/* Add more categories as needed */}
                      </Picker>
                      <TouchableOpacity
                        onPress={() => setModalWorkCategoryVisible(false)}
                        style={{
                          marginTop: 20,
                          backgroundColor: "#1b434d",
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          Select
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={modalStatusVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalWorkStatusVisible(false)}
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
                        Select Category
                      </Text>
                      <Picker
                        selectedValue={selectedStatus}
                        style={{ width: "100%", color: "red" }}
                        onValueChange={(itemValue) =>
                          setSelectedStatus(itemValue)
                        }
                      >
                        <Picker.Item label="Select Work Status" value="" />
                        {WStatus.map((u) => (
                          <Picker.Item
                            key={u}
                            label={u}
                            value={u}
                            color="black"
                          />
                        ))}
                        {/* Add more categories as needed */}
                      </Picker>
                      <TouchableOpacity
                        onPress={() => setModalStatusVisible(false)}
                        style={{
                          marginTop: 20,
                          backgroundColor: "#1b434d",
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          Select
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                {section === "Compliance" && (
                  <View
                    style={[
                      styles.containerAttachMedia,
                      { backgroundColor: "", marginTop: 15 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Insurance Coverage
                    </Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: "center" }]}
                      onPress={() => setModalHealthVisible(true)}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          color: selectedInsurance ? "#000" : "#aaa",
                        }}
                      >
                        {selectedInsurance
                          ? selectedInsurance
                          : "Select Insurance"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Socaial Security Protection Scheme
                    </Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: "center" }]}
                      onPress={() => setModalSSPVisible(true)}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          color: selectedSSP ? "#000" : "#aaa",
                        }}
                      >
                        {selectedSSP ? selectedSSP : "Select SSP"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.labelInput,
                        {
                          fontSize: 20,
                          fontFamily: "Nunito-Bold",
                          marginBottom: 5,
                        },
                      ]}
                    >
                      Licenses
                    </Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: "center" }]}
                      onPress={() => setModalLicensesVisible(true)}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Regular",
                          color: selectedLicenses ? "#000" : "#aaa",
                        }}
                      >
                        {selectedLicenses ? selectedLicenses : "Select License"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View
                  style={{
                    // flexDirection: "row",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      handleSubmit();
                    }}
                    style={[
                      styles.button,
                      {
                        // marginHorizontal: 15,
                        minWidth: 150,
                        paddingVertical: 15,
                        backgroundColor: "#296746",
                        borderRadius: 25,
                      },
                    ]}
                  >
                    <Text
                      style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}
                    >
                      Submit Changes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navi.navigate("Profile")}
                    style={[
                      styles.button,
                      {
                        // marginHorizontal: 15,
                        minWidth: 150,
                        paddingVertical: 15,
                        backgroundColor: "#296746",
                        borderRadius: 25,
                      },
                    ]}
                  >
                    <Text
                      style={{ color: "#fdfdfd", fontFamily: "Nunito-Bold" }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
