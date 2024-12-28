import { SafeAreaView, Alert, StyleSheet, Text, View, Platform, TextInput, Button, TouchableOpacity } from 'react-native';
import { UserContext } from '../UserContext';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import {stylesHome, styles} from '../styles';
import React, { useContext, useState, useEffect } from 'react';
import { ref, set, push, getDatabase, get, child } from "firebase/database";

export default function Home(){
    const { user, setUser } = useContext(UserContext);
    const [detail, setDetail] = useState(null);
    const navi = useNavigation();

    useEffect(() => {
        const fetchUserName = async () => {
          try {
            const db = getDatabase(); // Initialize Firebase Realtime Database
            const dbRef = ref(db); // Reference to the database
            const snapshot = await get(child(dbRef, 'users')); // Fetch all users from the database
    
            if (snapshot.exists()) {
              const users = snapshot.val();
              const existingUser = Object.values(users).find(u => u.email === user.email); // Match email
              console.log('USer found!')
              setDetail(existingUser);
    
            //   if (existingUser) {
            //     setName(existingUser.username); // Set username from the database
            //   }
            } else {
              console.log('No users found in the database.');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoading(false); // Stop loading once data is fetched
          }
        };
    
        if (user) {
          fetchUserName();
        }
      }, [user]); // Run the effect only when the `user` changes

    //flexible greeting according to time
      const getGreeting = () => { 
      const currentHour = new Date().getHours();

      if (currentHour >= 0 && currentHour < 12) {
        return "Good Morning";
      } else if (currentHour > 12 && currentHour < 15) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    };
    
      const handleLogout = () => {
        setUser(null); // Clear user data from context
        setDetail(null);
        auth.signOut(); // Sign out from Firebase
      };
    // const { user, setUser } = useContext(UserContext);

    // const[name,setName] = useState('');

    // const db = getDatabase(); // Initialize Firebase Realtime Database
    // const dbRef = ref(db); // Reference to the database
    // const snapshot = await get(child(dbRef, 'users'));

    // const users = snapshot.val(); // Get all users from the database
    // const existingUser = Object.values(users).find(user => user.email === email);
    // setName(existingUser.username);

    // const handleLogout = () => {
    //     setUser(null);  // Clear user data from context
    //     auth.signOut(); // Sign out from Firebase
    //   };

    return (
        <View style={[stylesHome.bg,{paddingTop: 0, backgroundColor: 'white', alignItems: 'center'}]}>
          <View style={{width: '150%', height: 220, backgroundColor: 'pink', paddingVertical: 0, borderBottomLeftRadius: 350, borderBottomRightRadius: 350, alignItems: 'center', justifyContent: 'center',}}>
            {detail ? (
                <>
                <Text style={[stylesHome.welcomeText, {color: 'white'}]}>{getGreeting()},{"\n"}{detail.username}</Text>
                </>
            ) : (
                <Text>Home</Text>
            )}
          </View>

          <View style={{flexDirection: 'row', backgroundColor: 'red', width: '100%', height: 180, marginTop: 15, marginHorizontal: 30 }}>
              <TouchableOpacity style={[stylesHome.button, {backgroundColor: 'pink'}]} onPress={()=>navi.navigate('Forum')}>
                  <Text style={{color: '#030303', fontWeight: 'bold'}}>Forum</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[stylesHome.button, {backgroundColor: 'pink'}]} onPress={()=>console.log("Social Tracker")}>
                  <Text style={{color: '#030303', fontWeight: 'bold'}}>SP</Text>
              </TouchableOpacity>
          </View>

          <View style={{backgroundColor: 'yellow', width: '100%', height: 300, marginTop: 15, marginHorizontal: 30 }}>
            <Text>Flatlist for image slider?</Text>
          </View>

          <View>
            {/* <TouchableOpacity style={stylesHome.button} onPress={()=>navi.navigate('Forum')}>
                <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Forum</Text>
            </TouchableOpacity> */}
          </View>

          <View style={{marginTop: 'auto', height: 80, width: '100%', backgroundColor: 'pink'}}>
            <Text>Bottom</Text>
          </View>
        </View>
    );
}