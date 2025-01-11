import { StatusBar } from 'expo-status-bar';
import React, {useState, useContext, useEffect} from 'react';
import { SafeAreaView, Alert, StyleSheet, TouchableWithoutFeedback, ScrollView, Keyboard, Text,FlatList, View, Platform, TextInput, Button, Image, TouchableOpacity,ActivityIndicator } from 'react-native';
import styles from '../styles';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set, push, getDatabase, get, child, onValue, serverTimestamp, update } from "firebase/database";
import * as ImagePicker from 'expo-image-picker';

export default function CreateFinanceRecord({route}){


    const {type} = route.params;
    const [value, setValue] = useState(0);
    const [notes, setNotes] = useState("-");
    const { user} = useContext(UserContext);
    const navi = useNavigation();
    const {id} = route.params || {};

    const updateData = async(existingId) => {
        
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
                type: type,
                value: value,
                notes: notes,
                date: serverTimestamp()
            })
                .then(() => {
                    (type == "Expense" ? console.log("Expense recorded.") : console.log("Income recorded.") )
                })
                .catch(error => console.error('Error writing data: ', error));

            navi.navigate("FinanceManager")
        }
    };

    const writeData = async() => {
        const recordRef = ref(database, 'financeRecords/'); // Parent path where data will be stored
        const newRecordRef = push(recordRef);
        
        // Parse and validate value
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || value.trim() === "") {
        Alert.alert("Please enter a valid number.");
        return;
    } else if (numericValue <= 0) {
        Alert.alert("Invalid value. Please enter a positive number.");
        return;
    } else {
        set(newRecordRef, {
            email: user.email,
            type: type,
            value: numericValue, // Use the parsed numeric value
            notes: notes,
            date: serverTimestamp()
        })
            .then(() => {
                console.log(type === "Expense" ? "Expense recorded." : "Income recorded.");
            })
            .catch(error => console.error('Error writing data: ', error));

        navi.navigate("FinanceManager");
    }
    };

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container3}>
            <View style={styles.container}>
                <Text style={[styles.text]}>
                    Expense Form
                </Text>
                <StatusBar style="auto" />
                <View style={[styles.container2]}>
                    <View style={[styles.containerAttachMedia, {marginTop: 15}]}>
                        <Text style={[styles.labelInput, {fontSize: 25, fontWeight: 'bold'}]}>
                            Type
                        </Text>
                        <TextInput
                            style={[styles.input, {fontWeight: 'bold'}]}
                            placeholder="Title"
                            value={type}
                        />

                        <Text style={[styles.labelInput, {fontSize: 25, fontWeight: 'bold'}]}>
                            Value    
                        </Text>
                        <TextInput
                            style={[styles.input]}
                            numberOfLines={10}
                            placeholder="Write out your content"
                            value={value}
                            onChangeText={setValue}
                        />

                        <Text style={[styles.labelInput, {fontSize: 25, fontWeight: 'bold'}]}>
                            Notes
                        </Text>
                        <TextInput
                            style={[styles.input]}
                            numberOfLines={10}
                            placeholder="Write out your content"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                    
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={()=>{(id == null ? writeData() : updateData(id))}} style={[styles.button, {marginRight: 15, paddingVertical: 15, backgroundColor: '#296746', borderRadius: 25}]} >
                            <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Record Expense</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
        </TouchableWithoutFeedback>
    );
}