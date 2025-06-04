import { Platform, StyleSheet, StatusBar } from "react-native";

export const styles = StyleSheet.create({
  centeredView: {
    position: "absolute", // Position it absolutely on the screen
    height: "100%",
    bottom: "auto",
    // right: 120,
    width: "100%",
    // transform: [{ translateX: -100 }, { translateY: -50 }], // Adjust to center precisely
    backgroundColor: "#fafafa",
    borderRadius: 20,
    elevation: 5, // Adds shadow on Android
    shadowColor: "#000", // Shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    marginVertical: Platform.OS === "ios" ? 40 : 30,
  },
  centeredText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    backgroundColor: "#50c878",
    // paddingTop: StatusBar.currentHeight+50,
    // marginBottom: '100',
  },

  container2: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    borderRadius: 25,
    // borderTopLeftRadius: 25 ,
    marginTop: 25,
    padding: 20,
    paddingTop: 25,
  },

  container3: {
    flex: 1,
    backgroundColor: "#fdfdfd",
  },

  text: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fdfdfd",
    fontSize: Platform.OS === "ios" ? 40 : 30,
    marginTop: 20,
    marginLeft: 20,
  },

  labelInput: {
    fontFamily: "Nunito",
    fontWeight: "bold",
    color: "black",
  },

  font: {
    fontFamily: "Nunito",
    fontSize: 20,
  },

  input: {
    fontFamily: "Nunito",
    height: 50,
    borderWidth: 0.5,
    borderRadius: 15,
    borderColor: "grey",
    paddingHorizontal: 15,
    backgroundColor: "#fdfdfd",
    marginTop: 10,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#06a561", // Set your desired background color
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginVertical: 10,
    // marginHorizontal: 110,
    alignItems: "center",
    alignSelf: "center",
  },

  texttosignin: {
    color: "#020202",
    fontFamily: "Nunito",
    textAlign: "center",
    marginVertical: 15,
  },

  containerAttachMedia: {
    display: "flex",
    justifyContent: "flex-start",
    // backgroundColor: '#000000',
  },

  submitComment: {
    marginBottom: 32,
    backgroundColor: "#1b434d",
    position: "absolute",
    paddingHorizontal: 20,
    paddingVertical: 10,
    right: 15,
    bottom: 0,
    borderRadius: 50,
  },
});

export const stylesHome = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#50c878",
    // paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight+50 : StatusBar.currentHeight,
  },

  context: {
    minHeight: 200,
    borderRadius: 20,
    borderColor: "#222222",
    borderWidth: 0.5,
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 10,
  },

  welcomeText: {
    fontWeight: 600,
    color: "#00B32E",
    fontSize: Platform.OS === "ios" ? 40 : 30,
    fontFamily: "Nunito-ExtraBold",
    // marginLeft: 30
  },

  button: {
    backgroundColor: "#1b434d",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: "center",
    alignSelf: "center",
  },

  features: {
    // paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginHorizontal: 5,
    height: 190,
    width: 150,
    // borderWidth: 0.3,
    alignSelf: "center",
    fontFamily: "Nunito-Bold",
  },

  imageSlider: {
    backgroundColor: "#1b434d",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    margin: 5,
    height: 150,
    width: 230,
    opacity: 0.5,
    alignSelf: "center",
  },
});

export const home = StyleSheet.create({});

export default styles;
