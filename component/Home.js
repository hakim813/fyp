import { SafeAreaView, Alert, StyleSheet, Text, View, Platform, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native';
import { UserContext } from '../UserContext';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import {stylesHome, styles} from '../styles';
import React, { useContext, useState, useEffect } from 'react';
import { ref, set, push, getDatabase, get, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomBar from './BottomBar';

export default function Home(){
    const { user, setUser } = useContext(UserContext);
    const [detail, setDetail] = useState(null);
    const navi = useNavigation();

    useEffect(() => {
        const fetchUserName = async () => { //for home greeting
          try {
            const db = getDatabase(); 
            const dbRef = ref(db); 
            const snapshot = await get(child(dbRef, 'users')); // Fetch all users from the database
    
            if (snapshot.exists()) {
              const users = snapshot.val();
              const existingUser = Object.values(users).find(u => u.email === user.email); // Match email
              console.log('User found!')
              setDetail(existingUser);
            } 
            else {
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

      if (currentHour >= 0 && currentHour < 12) { //from midnight to afternoon
        return "Good Morning";
      }
      else if (currentHour > 12 && currentHour < 15) { //from noon to 3pm
        return "Good Afternoon";
      }
      else {
        return "Good Evening";
      }
    };

    return (
        <View style={[stylesHome.bg,{paddingTop: 0, backgroundColor: 'white', alignItems: 'center'}]}>
          <View style={{width: '150%', height: 300, backgroundColor: '#1b434d', paddingVertical: 0, borderBottomLeftRadius: 250, borderBottomRightRadius: 250, alignItems: 'center', justifyContent: 'center',}}>
            {detail ? (
                <>
                <Text style={[styles.text]}>{getGreeting()}, {"\n"}{detail.username}!</Text>
                </>
            ) : (
                <Text>Home</Text>
            )}
          </View>
          <View style={{ width: '100%', height: 280, paddingLeft: 10, marginTop: 15, marginHorizontal: 30 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 25}}>Features</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[stylesHome.features, {backgroundColor: '#D3C2F8'}]} onPress={()=>navi.navigate('Forum')}>
                    <View style={{height: 60, width: 60, backgroundColor: '#fafafa', borderRadius: 15, alignItems:'center', justifyContent: 'center', marginBottom: 60}}>
                      <Icon
                        name="commenting"
                        size={40}
                        color={'#1b434d'}
                      />
                    </View>
                    <View style={{alignItems: 'center'}}><Text style={{color: '#1b434d', fontWeight: 'bold', fontSize: 25}}>Forum</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesHome.features, {backgroundColor: '#FAE2C8'}]} onPress={()=>navi.navigate('FinanceManager')}>
                  <View style={{height: 60, width: 60, backgroundColor: 'white', borderRadius: 15, alignItems:'center', justifyContent: 'center', marginBottom: 60}}>
                        <Icon
                          name="money"
                          size={40}
                          color={'#1b434d'}
                        />
                      </View>
                      <View style={{alignItems: 'center'}}><Text style={{color: '#1b434d', fontWeight: 'bold', fontSize: 25}}>Finance</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesHome.features, {backgroundColor: '#CDF464'}]}>
                  <View style={{height: 60, width: 60, backgroundColor: 'white', borderRadius: 15, alignItems:'center', justifyContent: 'center', marginBottom: 60}}>
                      <Icon
                        name="question-circle-o"
                        size={40}
                        color={'#1b434d'}
                      />
                    </View>
                    <View style={{alignItems: 'center'}}><Text style={{color: '#1b434d', fontWeight: 'bold', fontSize: 25}}>Helpdesk</Text></View>
                </TouchableOpacity>
              </ScrollView>
              
          </View>

          <View style={{ width: '100%', height: 200,  paddingLeft: 10, marginHorizontal: 30 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 25}}>Informations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[stylesHome.imageSlider]} onPress={()=>navi.navigate('Forum')}>
                    <View style={{alignItems: 'center'}}><Text style={{color: '#fdfdfd', fontWeight: 'bold', fontSize: 25}}>Image 1</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesHome.imageSlider]} onPress={()=>navi.navigate('FinanceManager')}>
                  
                      <View style={{alignItems: 'center'}}><Text style={{color: '#fdfdfd', fontWeight: 'bold', fontSize: 25}}>Image 2</Text></View>
                </TouchableOpacity>
              </ScrollView>
          </View>
          
          <BottomBar></BottomBar>
        </View>
    );
}