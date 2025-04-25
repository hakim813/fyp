// import React, {useState, useContext, useEffect, useRef} from 'react';
// import {StyleSheet, StatusBar, Switch, Alert, Text, FlatList, Image, View, Dimensions,TextInput, Platform, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
// import {styles, stylesHome} from '../styles';
// // import { database } from '../firebase';
// import { useNavigation } from '@react-navigation/native';
// import { UserContext } from '../UserContext';
// import { ref, set,remove, push, getDatabase, get, onValue, child } from "firebase/database";
// // import Icon from "react-native-vector-icons/FontAwesome";
// import { PieChart } from 'react-native-gifted-charts';
// import { Picker } from '@react-native-picker/picker';
// import { Dropdown } from 'react-native-element-dropdown'; 
// import BottomBar from './BottomBar';

// const { width } = Dimensions.get('window');



// export default function AddPlan(){
    // const [data, setData] = useState([
    //   { title: 'First View', content: 'Page 1 content' },
    //   { title: 'Second View', content: 'Page 2 content' },
    //   { title: 'Third View', content: 'Page 3 content' }
    // ]);
//     const [selectedValue, setSelectedValue] = useState();

//     const {user} = useContext(UserContext);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const flatListRef = useRef(null);

//     const handleScrollEnd = (event) => {
//       const offsetX = event.nativeEvent.contentOffset.x;
//       const index = Math.round(offsetX / width);
//       setCurrentIndex(index);
//     };

//   const addNewItem = () => {
//     const newIndex = data.length + 1;
//     const newItem = {
//       title: `View ${newIndex}`,
//       content: `Page ${newIndex} content`,
//     };
//     setData([...data, newItem]);
//   };


//     const navi = useNavigation();

//     useEffect(() => { 
//               const db = getDatabase();
  
//         }, []);

        

//     return(
//         <View style={styles.container3}>
//             <View style={styles.container}>
//                 <Text style={[styles.text]}>
//                     Social Protection
//                 </Text>
//                 <View style={[styles.container2, {backgroundColor: '#fdfdfd', justifyContent: 'center', alignItems: 'center'}]}>
//                 {/* <Picker
//                 selectedValue={selectedValue}
//                 onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
//                 style={{  height: 50, width: 200 }}
//       >
//         <Picker.Item label="Java" value="java" />
//         <Picker.Item label="JavaScript" value="js" />
//         <Picker.Item label="Python" value="python" />
//       </Picker> */}
//                 <Dropdown
//                   style={[mek.dropdown, { width: width - 50 }]}
//                   placeholderStyle={mek.placeholderStyle}
//                   selectedTextStyle={mek.selectedTextStyle}
//                   inputSearchStyle={mek.inputSearchStyle}
//                   iconStyle={mek.iconStyle}
//                   containerStyle={mek.containerStyle} // Optional: style the dropdown container
//                   itemTextStyle={mek.itemTextStyle}   // Optional: style the dropdown items
//                   data={data}
//                   search
//                   maxHeight={300}
//                   labelField="label"
//                   valueField="value"
//                   placeholder="Select a language..."
//                   searchPlaceholder="Search..."
//                   value={selectedValue}
//                   onChange={item => {
//                     setSelectedValue(item.value);
//                     // You can also handle additional logic here if needed
//                   }}
//                   defaultValue={selectedValue}
//               />
//                 </View>
                
//                 <BottomBar></BottomBar>
//             </View>
//         </View>
//     );
// }


// const style = StyleSheet.create({
//     container: {
//       flex: 1,
//       paddingTop: 80,
//     },
//     title: {
//       fontSize: 24,
//       textAlign: 'center',
//       marginBottom: 20,
//     },
//     page: {
//       width: width-50,
//       borderColor: '#06a561',
//       borderWidth: 1.5 ,
//       margin: 5,
//       padding:10,
//       height:230,
//       borderRadius:50,
//       backgroundColor: '#ededed',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//   });

//   const mek = StyleSheet.create({
//     placeholderStyle: {
//       fontSize: 16,
//       color: '#888', // light gray placeholder text
//     },
//     selectedTextStyle: {
//       fontSize: 16,
//       color: '#000', // black text when selected
//       fontWeight: '500',
//     },
//     inputSearchStyle: {
//       height: 40,
//       fontSize: 16,
//       paddingHorizontal: 10,
//       borderColor: '#ccc',
//       borderWidth: 1,
//       borderRadius: 8,
//       backgroundColor: '#f9f9f9',
//     },
//     iconStyle: {
//       width: 24,
//       height: 24,
//       tintColor: '#333', // dark gray icon color
//     },
//   });

import React, { useState, useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ref, set, push, getDatabase, get, child, onValue, serverTimestamp } from "firebase/database";
import { styles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { database } from '../firebase';
import { UserContext } from '../UserContext';
import { Dropdown } from 'react-native-element-dropdown';
import BottomBar from './BottomBar';
import {LinearGradient} from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AddPlan() {
  // const [data, setData] = useState([
  //     { label: 'Self-Employment Social Security Scheme PERKESO', value: 'perkeso' },
  //     { label: 'i-Saraan KWSP', value: 'kwsp' }
  //   ]);

  //   const [subOptionsData, setSubOptionsData] = useState({
  //     perkeso: [
  //       { label: 'Option 1 (Perkeso Plan A)', value: 'planA' },
  //       { label: 'Option 2 (Perkeso Plan B)', value: 'planB' },
  //       { label: 'Option 3 (Perkeso Plan C)', value: 'planC' }
  //     ],
  //     kwsp: [
  //       { label: 'i-Saraan RM50/mth', value: 'isar50' },
  //       { label: 'i-Saraan RM100/mth', value: 'isar100' }
  //     ]
  //   });

  const [data, setData] = useState([
    {
      label: 'Self-Employment Social Security Scheme PERKESO',
      value: 'perkeso',
      subOptions: [
        { label: 'Perkeso Plan 1', value: 'Plan 1' },
        { label: 'Perkeso Plan 2', value: 'Plan 2' },
        { label: 'Perkeso Plan 3', value: 'Plan 3' },
        { label: 'Perkeso Plan 4', value: 'Plan 4' }
      ]
    },
    {
      label: 'i-Saraan KWSP',
      value: 'kwsp',
      subOptions: [
        { label: 'i-Saraan Plan', value: 'i-Saraan Plan' }
      ]
    }
  ]);

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [valueOptions, setValueOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const navi = useNavigation();

  // const [selectedValue, setSelectedValue] = useState();
  const { user } = useContext(UserContext);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  // useEffect(() => {
  //   const db = getDatabase();
  //   // Any database setup logic if needed
  // }, []);

  useEffect(() => {
    if (selectedLabel) {
      const matchedItem = data.find(item => item.label === selectedLabel);
      if (matchedItem && matchedItem.subOptions) {
        setValueOptions(matchedItem.subOptions); // Load sub-options dynamically
        setSelectedValue(null); // Reset previous sub selection
      } else {
        setValueOptions([]);
      }
    } else {
      setValueOptions([]);
    }
  }, [selectedLabel]);

  const writeData = async() => {  
    console.log('Writing data...');
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const dbRef = ref(db); // Reference to the database
    const snapshot = await get(child(dbRef, 'users')); // Fetch all users from the database
    console.log('Fetching user data...');

    const users = snapshot.val();
    const existingUser = Object.values(users).find(u => u.email === user.email); // Match email
    console.log('User found! for SP');

    const usersRef = ref(database, 'socialplan/'); // Parent path where data will be stored
    const newPostRef = push(usersRef);

    set(newPostRef, {
      user: existingUser.username,
      email: user.email,
      scheme: selectedLabel,
      chosenPlan: selectedValue,
      date: serverTimestamp()
    })
    .then(() => {console.log('Data written successfully!');
        navi.navigate('SPHome');
    })
    .catch(error => console.error('Error writing data: ', error));
  };
  

  return (
    <View style={styles.container3}>
      <View style={styles.container}>
        
      <LinearGradient
          colors={['#03633a', '#95f6cc']} // start to end gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, {paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight+50 : StatusBar.currentHeight}]}
        >
        <Text style={styles.text}>Social Protection</Text>

        <View style={[styles.container2]}>
          
          <Text style={[styles.text, {color: '#101010', marginBottom: 100}]}>Choose your plan</Text>
          <Text style={[{fontFamily: 'Nunito-Bold', fontSize: 20, color: '#101010', margin: 5}]}>Social Protection Scheme</Text>
          <Dropdown
            style={[stylesDropdown.dropdown, { width: width - 50, marginBottom: 50 }]}
            placeholderStyle={stylesDropdown.placeholderStyle}
            selectedTextStyle={stylesDropdown.selectedTextStyle}
            inputSearchStyle={stylesDropdown.inputSearchStyle}
            iconStyle={stylesDropdown.iconStyle}
            containerStyle={stylesDropdown.containerStyle}
            itemTextStyle={stylesDropdown.itemTextStyle}
            data={data}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select a language..."
            searchPlaceholder="Search..."
            value={selectedLabel}
            onChange={item => setSelectedLabel(item.label)}
            // defaultValue={selectedValue}
          />

          <Text style={[{fontFamily: 'Nunito-Bold', fontSize: 20, color: '#101010', margin: 5}]}>Plans</Text>
          <Dropdown
            style={[stylesDropdown.dropdown, { width: width - 50 }]}
            placeholderStyle={stylesDropdown.placeholderStyle}
            selectedTextStyle={stylesDropdown.selectedTextStyle}
            inputSearchStyle={stylesDropdown.inputSearchStyle}
            iconStyle={stylesDropdown.iconStyle}
            containerStyle={stylesDropdown.containerStyle}
            itemTextStyle={stylesDropdown.itemTextStyle}
            data={valueOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select a language..."
            searchPlaceholder="Search..."
            value={selectedValue}
            onChange={item => setSelectedValue(item.value)}
            disabled={!selectedLabel}
            // defaultValue={selectedValue}
          />

          <TouchableOpacity onPress={()=>[console.log({selectedValue}), writeData()]} style={[styles.button, {marginRight: 15, paddingVertical: 15, backgroundColor: '#1b434d', borderRadius: 25}]} >
              <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Submit Post</Text>
          </TouchableOpacity>

        </View>

        {/* <BottomBar /> */}
        </LinearGradient>
      </View>
    </View>
  );
}

const stylesDropdown = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fdfdfd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    height: 50,
    borderColor: '#121212',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    borderColor: 'red',
    // borderWidth: 1,
    borderRadius: 30,
    backgroundColor: '#f9f9f9',
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  containerStyle: {
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'green',
    padding: 5,
  },
  itemTextStyle: {
    fontSize: 16,
    color: '#333',
  },
});
