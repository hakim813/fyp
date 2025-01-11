import { SafeAreaView, Alert, StyleSheet, Text, View, Platform, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import Icon from "react-native-vector-icons/FontAwesome";

export default function SignoutSuccessful(){
    const navi = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
          navi.navigate('Login');
        }, 2500);
    
        return () => clearTimeout(timer); // Cleanup timer
      }, [navi]);    

    return (
            <View style={{alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25, height: '100%', width: '100%', backgroundColor: 'red'}}>
                    <Icon
                    name="check-circle-o"
                    size={130}
                    color={'#fafafa'} // Change color based on isUpvoted
                    />
                    <Text style={{color: 'white',fontSize: 30, fontWeight: '700', margin: 10}}>Done signing you out!</Text>
                    <Text style={{color: 'white', fontSize: 20}}>Now redirecting you to Login page.</Text>
            </View>
    );
}