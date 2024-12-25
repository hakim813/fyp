import { StatusBar } from 'expo-status-bar';
import React, {useState, useContext, useEffect} from 'react';
import { SafeAreaView, Alert, StyleSheet, Text,FlatList, View, Platform, TextInput, Button, TouchableOpacity,ActivityIndicator } from 'react-native';
import {styles, stylesHome} from '../styles';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set, push, getDatabase, get, child, onValue } from "firebase/database";

export default function Forum(){
  //   useEffect(() => {
  //   const threadsRef = database().ref('/threads');
  //   const listener = threadsRef.on('value', snapshot => {
  //     const data = snapshot.val();
  //     const loadedThreads = data ? Object.entries(data).map(([id, thread]) => ({ id, ...thread })) : [];
  //     setThreads(loadedThreads);
  //   });

  //   // Clean up listener
  //   return () => threadsRef.off('value', listener);
  // }, []);
  const [posts, setPosts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [title, setTitle] = useState("");
      const [content, setContent] = useState("");

  const navi = useNavigation();
  useEffect(() => {
          const db = getDatabase();
          const postsRef = ref(db, "posts");
  
          // Listen to data changes in the "posts" node
          const unsubscribe = onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
  
          if (data) {
              // Convert the object to an array of posts
              const fetchedPosts = Object.keys(data).map((key) => ({
              id: key,
              title: data[key].title,
              content: data[key].content,
              }));
  
              setPosts(fetchedPosts);
          } else {
              setPosts([]); // No data found
          }
  
          setLoading(false);
          });
  
          // Cleanup listener on unmount
          return () => unsubscribe();
      }, []);

    return(
        <View style={stylesHome.bg}>
            <Text style={stylesHome.welcomeText}>Forum</Text>
            <FlatList style={{backgroundColor: 'yellow'}}
                    data={posts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={stylesHome.context}>
                          <Text>{item.title}</Text>
                          <Text>{item.content}</Text>
                        </View>
                    )}
                    />
            <TouchableOpacity onPress={()=>navi.navigate('CreatePost')} style={[ {marginTop: 100, backgroundColor: 'pink',borderRadius: 25}]} >
                  <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Submit Post</Text>
              </TouchableOpacity>
        </View>
    );
}

// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
// import database from '@react-native-firebase/database';

// const ForumPage = () => {
//   const [threads, setThreads] = useState([]);

//   // Fetch threads from the database
//   useEffect(() => {
//     const threadsRef = database().ref('/threads');
//     const listener = threadsRef.on('value', snapshot => {
//       const data = snapshot.val();
//       const loadedThreads = data ? Object.entries(data).map(([id, thread]) => ({ id, ...thread })) : [];
//       setThreads(loadedThreads);
//     });

//     // Clean up listener
//     return () => threadsRef.off('value', listener);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Forum</Text>
//       <FlatList
//         data={threads}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.thread}>
//             <Text style={styles.title}>{item.title}</Text>
//             <Text>Author: {item.author}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   thread: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default ForumPage;
