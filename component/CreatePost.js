import { StatusBar } from 'expo-status-bar';
import React, {useState, useContext, useEffect} from 'react';
import { SafeAreaView, Alert, StyleSheet, TouchableWithoutFeedback, ScrollView, Keyboard, Text,FlatList, View, Platform, TextInput, Button, Image, TouchableOpacity,ActivityIndicator } from 'react-native';
import styles from '../styles';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set, push, getDatabase, get, child, onValue, serverTimestamp } from "firebase/database";
import * as ImagePicker from 'expo-image-picker';

export default function CreatePost(){

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [detail, setDetail] = useState(null);
    const { user, setUser } = useContext(UserContext);
    const [imageUris, setImageUris] = useState([]);
    const navi = useNavigation();

    //

    //
    // const fetchUser =  async () =>{
    //     try{
    //         const db = getDatabase(); // Initialize Firebase Realtime Database
    //         const dbRef = ref(db); // Reference to the database
    //         const snapshot = await get(child(dbRef, 'users')); // Fetch all users from the database
    
    //         if (snapshot.exists()) {
    //             const users = snapshot.val();
    //             const existingUser = Object.values(users).find(u => u.email === user.email); // Match email
    //             console.log('User found!')
    //             setDetail(existingUser);
    //         } else {
    //             console.log('No users found in the database.');
    //         }
    //         } catch (error) {
    //         console.error('Error fetching user data:', error);
    //         } finally {
    //         setLoading(false); // Stop loading once data is fetched
    //         }
    // }
    
    //
    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images
                allowsMultipleSelection: true,
                quality: 1, // High quality
            });

            if (!result.canceled) {
                const selectedUris = result.assets.map((asset) => asset.uri); // Extract URIs
                console.log(selectedUris); // Log selected URIs
                setImageUris([...imageUris, ...selectedUris]);
            } else {
                console.log("Image picking canceled.");
            }
        } catch (error) {
            console.error("Error picking image: ", error);
        }
    };

    const writeData = async(idNo, username) => {
        if(!content){
            Alert.alert("No content is written.");
            return;
        }

        
        const db = getDatabase(); // Initialize Firebase Realtime Database
        const dbRef = ref(db); // Reference to the database
        const snapshot = await get(child(dbRef, 'users')); // Fetch all users from the database

        const users = snapshot.val();
        const existingUser = Object.values(users).find(u => u.email === user.email); // Match email
        console.log('User found!');

        const usersRef = ref(database, 'posts/'); // Parent path where data will be stored
        const newPostRef = push(usersRef);

        set(newPostRef, {
          user: existingUser.username,
          email: user.email,
          title: (title ? title : '***'),
          content: content,
          date: serverTimestamp(),
          upvoter: [],
          imageUris: imageUris.length > 0 ? imageUris : null
        })
          .then(() => {console.log('Data written successfully!');
            navi.navigate('Forum');
          })
          .catch(error => console.error('Error writing data: ', error));
      };



    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container3}>
            <View style={styles.container}>
                <Text style={[styles.text]}>
                    Create Your Post
                </Text>
                <StatusBar style="auto" />
                <View style={[styles.container2]}>
                    <View style={[styles.containerAttachMedia]}>
                        <Text style={[styles.labelInput, {fontSize: 25, fontWeight: 'bold'}]}>
                            Title
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={[styles.labelInput, {fontSize: 25, fontWeight: 'bold'}]}>
                            Content    
                        </Text>
                        <TextInput
                            style={[styles.input, {paddingTop:10, height: 200}]}
                            multiline={true}
                            numberOfLines={10}
                            placeholder="Write out your content"
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>
                    
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={pickImage} style={[styles.button, {marginRight: 15, paddingVertical: 15, backgroundColor: '#1b434d', borderRadius: 25}]} >
                            <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Attach Media</Text>
                        </TouchableOpacity>
                        <TouchableOpacity  onPress={writeData} style={[styles.button, {marginRight: 15, paddingVertical: 15, backgroundColor: '#1b434d', borderRadius: 25}]} >
                            <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Submit Post</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={{marginVertical: 10}}>Media selected: {imageUris?.length}</Text>
                    <ScrollView horizontal>
                        {imageUris.map((uri, index) => (
                            <Image
                                key={index}
                                source={{ uri }}
                                style={{width: 200, height: 200, marginRight: 10 }}
                            />
                        ))}
                    </ScrollView>
                    
                    
                    {/* <TouchableOpacity  onPress={writeData} style={[styles.button, {borderRadius: 25}]} >
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Submit Post</Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>
        </TouchableWithoutFeedback>
    );
}