import { SafeAreaView, Alert, StyleSheet, Text, View, Platform, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native';
// import { UserContext } from '../UserContext';
// import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
// import {stylesHome, styles} from '../styles';
// import React, { useContext, useState, useEffect } from 'react';
// import { ref, set, push, getDatabase, get, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";

export default function BottomBar(){
    const navi = useNavigation();

    return (
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 25, marginTop: 'auto', height: 100, width: '100%', backgroundColor: '#1b434d'}}>
                <TouchableOpacity onPress={()=>navi.navigate('Home')} style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Icon
                    name="home"
                    size={40}
                    color={'#fafafa'} // Change color based on isUpvoted
                    />
                    <Text style={{color: 'white'}}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>navi.navigate('Profile')} style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Icon
                    name="user"
                    size={40}
                    color={'#fafafa'} // Change color based on isUpvoted
                    />
                    <Text style={{color: 'white'}}>Profile</Text>
                </TouchableOpacity>
            </View>
    );
}