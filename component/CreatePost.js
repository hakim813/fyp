import { StatusBar } from 'expo-status-bar';
import React, {useState, useContext, useEffect} from 'react';
import { SafeAreaView, Alert, StyleSheet, Text,FlatList, View, Platform, TextInput, Button, TouchableOpacity,ActivityIndicator } from 'react-native';
import styles from '../styles';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set, push, getDatabase, get, child, onValue } from "firebase/database";

export default function CreatePost(){

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const writeData = (user, idNo, username) => {
        const usersRef = ref(database, 'posts/'); // Parent path where data will be stored
        const newPostRef = push(usersRef);

        set(newPostRef, {
          title: title,
          content: content
        })
          .then(() => console.log('Data written successfully!'))
          .catch(error => console.error('Error writing data: ', error));
      };

    // useEffect(() => {
    //     const db = getDatabase();
    //     const postsRef = ref(db, "posts");

    //     // Listen to data changes in the "posts" node
    //     const unsubscribe = onValue(postsRef, (snapshot) => {
    //     const data = snapshot.val();

    //     if (data) {
    //         // Convert the object to an array of posts
    //         const fetchedPosts = Object.keys(data).map((key) => ({
    //         id: key,
    //         title: data[key].title,
    //         content: data[key].content,
    //         }));

    //         setPosts(fetchedPosts);
    //     } else {
    //         setPosts([]); // No data found
    //     }

    //     setLoading(false);
    //     });

    //     // Cleanup listener on unmount
    //     return () => unsubscribe();
    // }, []);

    // const handleAddPost = async () => {
    //     if (!title.trim() || !content.trim()) {
    //       Alert.alert("Validation Error", "Both title and content are required.");
    //       return;
    //     }
    
    //     try {
    //       setLoading(true);
    
    //       const db = getDatabase();
    //       const postsRef = ref(db, "posts");
    //       const newPostRef = push(postsRef);
    
    //       await set(newPostRef, {
    //         title,
    //         content,
    //         createdAt: new Date().toISOString(),
    //       });
    
    //       Alert.alert("Success", "Your post has been added!");
    
    //       // Clear the form
    //       setTitle("");
    //       setContent("");
    //     } catch (error) {
    //       console.error("Error adding post:", error);
    //       Alert.alert("Error", "Failed to add post. Please try again.");
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    // if (loading) {
    //     return (
    //     <View style={styles.loadingContainer}>
    //         <ActivityIndicator size="large" color="#0000ff" />
    //         <Text>Loading posts...</Text>
    //     </View>
    //     );
    // }


    return(
        <View style={styles.container3}>
            <View style={styles.container}>
                <Text style={[styles.text]}>
                    Create Your Post
                </Text>
                <StatusBar style="auto" />
                <View style={styles.container2}>

                   
                    {/* <Button title="Click Me"></Button> */}
                    <View style={styles.containerAttachMedia}>
                        {/* <Text style={{color: '#ffffff'}}>Meow</Text> */}
                        <Text style={[styles.labelInput, {fontWeight: 'bold'}]}>
                            Title
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example : user123@mail.com"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={[styles.labelInput, {fontWeight: 'bold'}]}>
                            Content    
                        </Text>
                        <TextInput
                            style={[styles.input, { height: 200}]}
                            multiline={true}
                            numberOfLines={10}
                            placeholder="Write out your content"
                            value={content}
                            onChangeText={setContent}
                        />
                        <TouchableOpacity onPress={writeData} style={[styles.button, {marginRight: 250, paddingVertical: 8, backgroundColor: '#dfdfdf', marginHorizontal: 0,borderRadius: 25}]} >
                            <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Attach Media</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={[styles.button, {borderRadius: 25}]} >
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Submit Post</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
        </View>
    );
}