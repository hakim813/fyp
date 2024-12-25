import { StyleSheet,StatusBar } from 'react-native';

const styles = StyleSheet.create({

container: {
    flex: 1,
    backgroundColor: '#00B32E',
    paddingTop: StatusBar.currentHeight+50,
    // marginBottom: '100',
  },

  container2: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    marginTop: 45,
    padding: 15,
    paddingTop: 35,
    alignContent: 'flex-start'
  },


  container3: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },

  text: {
    fontWeight: 800,
    color: '#fdfdfd',
    fontSize: 50,
    marginTop: 20,
    marginLeft: 30
  },

  labelInput: {
    fontWeight: 'semibold',
    color: 'black'
  },

  input: {
    height: 50,
    borderWidth: 0.2,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: '#dedede',
    marginTop: 10,
    marginBottom: 18
  },

  button: {
    backgroundColor: '#00B32E', // Set your desired background color
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 110,
    alignItems: 'center'
  },

  texttosignin: {
    color: '#020202',
    textAlign: 'center',
    margin: 25
  },

  containerAttachMedia: {
    display: 'flex',
    justifyContent: 'flex-start',
    // backgroundColor: '#000000',
    marginBottom: 20
  }
});

export const stylesHome = StyleSheet.create({

  bg: {
    flex: 1,
    backgroundColor: '#d6ffa7',
    paddingTop: StatusBar.currentHeight+50,
    // marginBottom: '100',
  },

  context: {
    backgroundColor: 'white',
    marginHorizontal: 15
  },

  welcomeText: {
    fontWeight: 800,
    color: '#00B32E',
    fontSize: 40,
    // marginTop: 20,
    marginLeft: 30
  },

  button: {
    backgroundColor: '#00B32E',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    // marginHorizontal: 110,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  }
});

export default styles;