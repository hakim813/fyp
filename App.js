import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Buffer } from "buffer";
global.Buffer = Buffer;
import Register from "./component/Auth/Register";
import Login from "./component/Auth/Login";
import Home from "./component/Home";
import Forum from "./component/Forum";
import SPHome from "./component/SPHome";
import AddPlan from "./component/AddPlan";
import HelpdeskHome from "./component/HelpdeskHome";
import { UserProvider } from "./UserContext";
import CreatePost from "./component/CreatePost";
import ScanReceipt from "./component/ScanReceipt";
import FinanceManager from "./component/FinanceManager";
import CreateFinanceRecord from "./component/CreateFinanceRecord";
import FinancialRecord from "./component/FinancialRecord";
import LoginSuccessful from "./component/Auth/LoginSuccessful";
import SignupSuccessful from "./component/Auth/SignupSuccessful";
import NotiReminder from "./component/NotiReminder";
import AddComplaint from "./component/AddComplaint";
import ForgotPassword from "./component/Auth/ForgotPassword";
import Profile from "./component/Auth/Profile";
import SignoutSuccessful from "./component/Auth/SignoutSuccessful";
import { useFonts } from "expo-font";
import RecordContribution from "./component/RecordContribution";

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded] = useFonts({
    "Nunito-Regular": require("./assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Bold": require("./assets/fonts/Nunito-Bold.ttf"),
    // Nunito: require("./assets/fonts/Nunito-VariableFont_wght.ttf"),
    "Nunito-Semi-Bold": require("./assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-ExtraBold": require("./assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-Black": require("./assets/fonts/Nunito-Black.ttf"),
  });

  if (!fontsLoaded) {
    console.log("Problem here");
    return null; // or a loading indicator
  }

  console.log("Loading...");

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Register"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="NotiReminder" component={NotiReminder} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="SignupSuccessful" component={SignupSuccessful} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="LoginSuccessful" component={LoginSuccessful} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="AddComplaint" component={AddComplaint} />
          <Stack.Screen
            name="RecordContribution"
            component={RecordContribution}
          />
          <Stack.Screen name="ScanReceipt" component={ScanReceipt} />
          <Stack.Screen name="HelpdeskHome" component={HelpdeskHome} />
          <Stack.Screen name="AddPlan" component={AddPlan} />
          <Stack.Screen name="Forum" component={Forum} />
          <Stack.Screen name="CreatePost" component={CreatePost} />
          <Stack.Screen name="FinanceManager" component={FinanceManager} />
          <Stack.Screen
            name="CreateFinanceRecord"
            component={CreateFinanceRecord}
          />
          <Stack.Screen name="FinancialRecord" component={FinancialRecord} />
          <Stack.Screen name="SPHome" component={SPHome} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen
            name="SignoutSuccessful"
            component={SignoutSuccessful}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
