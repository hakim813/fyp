import React, { useState, useContext, useEffect } from "react";
import {
  Text,
  Platform,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Button,
} from "react-native";
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
import styles from "../styles";
import { database } from "../firebase";
import { UserContext } from "../UserContext";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

export default function NotiReminder({ route }) {
  const { user, setUser } = useContext(UserContext);
  const { scheme, chosenPlan, id } = route.params;

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState("");

  const navi = useNavigation();

  // useEffect(() => {
  //   console.log("Login page");
  // }, []);

  const setReminder = async (existingId) => {
    try {
      console.log("Setting reminder for ID:", existingId);

      const recordRef = ref(database, `socialplan/${existingId}`);
      const data = {
        rdate: formatDate(date),
        rtime: formatTime(time),
      };

      // Use set() instead of update() if you want to create/update no matter what
      update(recordRef, data);

      console.log("Data saved successfully!");

      navi.navigate("SPHome", {
        pDate: formatDate(date),
        pTime: formatTime(time),
        notes: notes,
      });
    } catch (error) {
      console.error("Error saving reminder:", error.message, error);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios"); // Only stays open on iOS
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios"); // Only stays open on iOS
    setTime(currentTime);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container3}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#03633a", "#95f6cc"]}
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
            <Text style={styles.text}>Set Your{"\n"}Contribution Reminder</Text>
            <StatusBar style="auto" />
            <View
              style={[styles.container2, { marginHorizontal: 15, flex: 0 }]}
            >
              <Text style={styles.labelInput}>Scheme</Text>
              <TextInput
                style={[
                  styles.input,
                  { fontFamily: "Nunito-Bold", color: "#303030" },
                ]}
                value={scheme}
                editable={false}
              />

              <Text style={styles.labelInput}>Chosen Plan</Text>
              <TextInput
                style={[
                  styles.input,
                  { fontFamily: "Nunito-Bold", color: "#303030" },
                ]}
                value={chosenPlan}
                editable={false}
              />

              <Text style={styles.labelInput}>Reminder Notes</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your notes..."
                value={notes}
                onChangeText={setNotes}
              />

              {/* Date Picker */}
              <Text style={[styles.labelInput, { textAlign: "center" }]}>
                Reminder Date
              </Text>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  onPress={showDatepicker}
                  // title={`Select Date: ${formatDate(date)}`}
                  style={[styles.button, { backgroundColor: "#dddddd" }]}
                >
                  <Text style={{ color: "#333333", fontFamily: "Nunito-Bold" }}>
                    Select Date: {formatDate(date)}
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
              </View>

              {/* Time Picker */}
              <Text
                style={[
                  styles.labelInput,
                  { textAlign: "center", marginTop: 10 },
                ]}
              >
                Reminder Time
              </Text>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  onPress={showTimepicker}
                  // title={`Select Date: ${formatDate(date)}`}
                  style={[styles.button, { backgroundColor: "#dddddd" }]}
                >
                  <Text style={{ color: "#333333", fontFamily: "Nunito-Bold" }}>
                    Select Date: {formatTime(time)}
                  </Text>
                  {showTimePicker && (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={onChangeTime}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => {
                  setReminder(id);
                }}
              >
                <Text style={{ color: "#fdfdfd", fontWeight: "bold" }}>
                  {id}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

// import React, { useState, useEffect } from 'react';
// import { View, Button, Platform, Text } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import DateTimePicker from '@react-native-community/datetimepicker';

// if (Platform.OS === 'android') {
//   Notifications.setNotificationChannelAsync('default', {
//     name: 'default',
//     importance: Notifications.AndroidImportance.HIGH,
//   });
// }

// export default function ReminderScreen() {
//   const [date, setDate] = useState(new Date());
//   const [showPicker, setShowPicker] = useState(false);

//   const requestPermissions = async () => {
//     const { status } = await Notifications.requestPermissionsAsync();
//     if (status !== 'granted') {
//       alert('Permission not granted for notifications!');
//     }
//   };

//   useEffect(() => {
//     requestPermissions();

//     // Debug listener
//     const sub = Notifications.addNotificationReceivedListener(notification => {
//       console.log("NOTIFICATION RECEIVED:", notification);
//     });

//     return () => sub.remove();
//   }, []);

//   const scheduleNotification = async () => {
//     const scheduledDate = new Date(date);
//     if (scheduledDate <= new Date()) {
//       alert("Please pick a future time!");
//       return;
//     }

//     await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "🔔 Reminder",
//           body: "Your scheduled reminder!",
//         },
//         trigger: {
//           type: 'date',
//           timestamp: date.getTime(), // UNIX timestamp in ms
//         },
//       });

//     alert(`Reminder set for ${scheduledDate.toLocaleString()}`);
//   };

//   return (
//     <View style={{ marginTop: 100, padding: 20 }}>
//       <View style={{ marginVertical: 20 }}>
//         <Button title="Pick Date & Time" onPress={() => setShowPicker(true)} />
//         <Text style={{ marginTop: 10, fontSize: 16 }}>
//           Selected: {date.toLocaleString()}
//         </Text>
//       </View>

//       {showPicker && (
//         <DateTimePicker
//           value={date}
//           mode="datetime"
//           display="default"
//           onChange={(event, selectedDate) => {
//             setShowPicker(false);
//             if (selectedDate) setDate(selectedDate);
//           }}
//         />
//       )}

//       <Button title="Set Reminders" onPress={scheduleNotification} />
//     </View>
//   );
// }
