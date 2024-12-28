import { StatusBar } from 'expo-status-bar';
import React, {useState, useContext, useEffect} from 'react';
// import CustomSwitch from 'react-native-custom-switch';
import { Switch, SafeAreaView, ScrollView, Alert, StyleSheet, Text,FlatList, Image, View, Platform, TextInput, Button, TouchableOpacity,ActivityIndicator } from 'react-native';
import {styles, stylesHome} from '../styles';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set,remove, push, getDatabase, get, child, onValue } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Forum(){
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const {user, setUser } = useContext(UserContext);
    const [isVisible, setIsVisible] = useState(false);
    const [comments, setComments] = useState([]);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isAll, setIsAll] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    // const toggleSwitch = () => {
    //     setIsEnabled(previousState => !previousState);
    //     console.log(isEnabled);
    // }

      //to write data into database
    const writeData = (item) => {
        if (!comment) {
          return;
        }
        
        const commentRef = ref(database, 'comment/');
        const newCommentRef = push(commentRef);
      
        set(newCommentRef, {
          user: user.email,
          comment: comment,
          post: item.id,
        })
          .then(() => {
            console.log('Comment added to the database successfully!');
            
            
            const postRef = ref(database, `posts/${item.id}`); // Reference to the specific post
      
            
            get(postRef)
              .then((snapshot) => {
                const postData = snapshot.val();
                const currentCommentIds = postData?.commentId || []; // Get existing commentId array (if exists)
                
                // Add the new commentId to the array
                const updatedCommentIds = [...currentCommentIds, newCommentRef.key]; // Append the new commentId
      
                set(postRef, {
                  ...postData,
                  commentId: updatedCommentIds, // Update the commentId array with the new commentId
                })
                  .then(() => {
                    console.log('Post updated with new commentId!');
                  })
                  .catch((error) => {
                    console.error('Error updating post with commentId:', error);
                  });
              })
              .catch((error) => {
                console.error('Error fetching post data:', error);
              });
          })
          .catch((error) => {
            console.error('Error writing comment data:', error);
          });
      };   

    //deletePost
      const deleteData = (id) => {
        
    const postRef = ref(database, `posts/${id}`);
      
    remove(postRef)
        .then(() => {
        console.log('Data deleted successfully!');
        })
        .catch(error => {
        console.error('Error deleting data: ', error);
        });
    };
    
      const thumbsUp = (item) => {
        const postRef = ref(database, `posts/${item.id}`); // Reference to the specific post
      
            get(postRef)
              .then((snapshot) => {
                const postData = snapshot.val();
                const currentUpvoterId = postData?.upvoter || []; // Get existing commentId array (if exists)

                let updatedUpvoterId;
                
                if (currentUpvoterId.includes(user.uid)) {
                    console.log(currentUpvoterId);
                    updatedUpvoterId = currentUpvoterId.filter((id) => id !== user.uid);
                    console.log(updatedUpvoterId);
                    console.log('User has already upvoted this post.'); // Do nothing if the user has already upvoted
                }
                else{
                    // Add the new commentId to the array
                updatedUpvoterId = [...currentUpvoterId, user.uid]; // Append the new commentId
                }
      
                set(postRef, {
                  ...postData,
                  upvoter: updatedUpvoterId, // Update the commentId array with the new commentId
                })
                  .then(() => {
                    console.log('Post updated with new upvoter!');
                  })
                  .catch((error) => {
                    console.error('Error updating post with commentId:', error);
                  });
              })
              .catch((error) => {
                console.error('Error fetching post data:', error);
              });
      }
      
  const navi = useNavigation();
  useEffect(() => {
          const db = getDatabase();
          const postsRef = ref(db, "posts");
  
          // Listen to data changes in the "posts" node
          const unsubscribePost = onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
  
          if (data) {
              // Convert the object to an array of posts
              const fetchedPosts = Object.keys(data).map((key) => ({
              id: key,
              user: data[key].user,
              title: data[key].title,
              content: data[key].content,
              date: data[key].date,
              comment: data[key].commentId,
              upvoter: data[key].upvoter || [],
              imageUris: data[key].imageUris || []
              }));

              if(isEnabled){
                fetchedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                // console.log(fetchedPosts);
              }
              else{
                fetchedPosts.sort((a, b) => b.upvoter?.length - a.upvoter?.length);
                // console.log(fetchedPosts);
              }
  
              setPosts(fetchedPosts);
          } else {
              setPosts([]); // No data found
          }
  
        //   fetchUserName();
          setLoading(false);
          });

        //   const db2 = getDatabase();


        //   const commentsRef = ref(db2, "comment");

        //   const unsubscribeComment = onValue(commentsRef, (snapshot) => {
        //     const data2 = snapshot.val();
  
        //   // Cleanup listener on unmount
        //   return () => unsubscribe();
        const commentsRef = ref(db, "comment");
        onValue(commentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const fetchedComments = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            }));
            setComments(fetchedComments);
        } else {
            setComments([]);
        }
        });  
    }, [isEnabled]);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = posts.filter((post) =>
          post.title.toLowerCase().includes(lowercasedQuery) ||
          post.content.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredPosts(results);
        // console.log(filteredPosts[0].imageUris)
      }, [searchQuery, posts]);

    return(
        <View style={stylesHome.bg}>
            <Text style={[stylesHome.welcomeText, {color: '#fafafa'}]}>Community Forum</Text>
            <View style={{flex:1, backgroundColor: stylesHome.bg.backgroundColor}}>
                <TextInput
                    style={[styles.input, {backgroundColor: '#fdfdfd', marginBottom: 60,borderRadius: 20, marginHorizontal:15}]}
                    placeholder="Search . . ."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    // onPress={()=>{}}
                />

            {filteredPosts.length === 0 ? (
            <View style={{flex: 1,  alignItems: 'center', height: '100%', justifyContent: 'center', marginTop: 20 }}>
                <Text style={{ fontSize: 25, color: 'gray' }}>No content available</Text>
            </View>
            ) : (
                <FlatList  //d6ffa7
                                
                style={{paddingTop: 10, backgroundColor: '#d6ffa7'}}
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    if(isAll){
                        return(
                    <View style={[stylesHome.context, {paddingVertical:10, backgroundColor: '#fafafa'}]}>
                        <View>
                            <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{potition: 'absolute', width: 30,
                                height: 30,
                                resizeMode: 'cover',
                                borderRadius: 75,
                                borderColor: 'black',
                                borderWidth: 1}} />
                            <Text style = {{position: 'absolute', top: 5   , left: 40, fontWeight:'bold', fontSize: 25, marginBottom:10}}>
                                {item.title.length > 15 ? `${item.title.slice(0, 15)}...` : item.title}
                            </Text>
                            <Text style = {{position: 'absolute', top: 15   , right: 5, marginBottom:10, color: 'grey'}}>{new Date(item.date).toDateString()}</Text>
                        </View>
                        <View  style={{marginBottom: 60}}>
                            
                            <Text style={{marginTop: 10}}>
                                <Text style={{fontWeight: 'bold'}}>
                                    Written by:{" "}
                                </Text>
                                {item.user}
                                </Text>
                            <Text style={{marginTop: 10, fontSize: 20}}>{item.content}</Text>
                            {/* Display multiple images */}
                        {item.imageUris && Array.isArray(item.imageUris) ? (
                            <FlatList
                            data={item.imageUris}
                            keyExtractor={(uri, index) => `${item.id}-image-${index}`}
                            horizontal
                            renderItem={({ item: uri }) => (
                                <Image
                                    source={{ uri }}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        marginBottom: 10,
                                        resizeMode: 'cover',
                                        borderRadius: 5,
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                    }}
                                />
                            )}
                        />
                    ) : (
                        <Text style={{ marginTop: 10, color: 'gray' }}>No images attached</Text>
                    )}
                            
                        </View>
                        <View style={{marginTop: 'auto'}}>
                            <TextInput
                                style={[styles.input, {position: 'absolute', marginBottom: 5, borderRadius: 20, width:'85%', left: 0 , bottom: 5}]}
                                placeholder="Comment"
                                onPress={()=>{setSelectedPost(item),setIsVisible(true)}}
                            />
                            <TouchableOpacity onPress={()=>thumbsUp(item)} style={{position: 'absolute', bottom: 20, right: 20}} >
                            <Icon
                            name="thumbs-up"
                            size={24}
                            color={item.upvoter?.includes(user.uid) ? "green" : "gray"} // Change color based on isUpvoted
                            />
                        </TouchableOpacity>
                        <Text style={{position: 'absolute', fontSize: 20, bottom: 20, right: 5}}>{item.upvoter?.length || 0}</Text>
                        </View>
                        
                        {
                            item.user == user.email ? 
                            (<Text style={{fontSize: 20}} onPress={()=>{deleteData(item.id)}}>Delete Post</Text>) : (<></>)
                        }
                    </View>
                        );
                }
                else if(item.user == user.email){
                    return(
                    <View style={[stylesHome.context, {paddingVertical:10, backgroundColor: '#fafafa'}]}>
                        <View>
                            <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{potition: 'absolute', width: 30,
                                height: 30,
                                resizeMode: 'cover',
                                borderRadius: 75,
                                borderColor: 'black',
                                borderWidth: 1}} />
                            <Text style = {{position: 'absolute', top: 5   , left: 40, fontWeight:'bold', fontSize: 25, marginBottom:10}}>
                                {item.title.length > 15 ? `${item.title.slice(0, 15)}...` : item.title}
                            </Text>
                            <Text style = {{position: 'absolute', top: 15   , right: 5, marginBottom:10, color: 'grey'}}>{new Date(item.date).toDateString()}</Text>
                        </View>
                        <View  style={{marginBottom: 60}}>
                            
                            <Text style={{marginTop: 10}}>
                                <Text style={{fontWeight: 'bold'}}>
                                    Written by:{" "}
                                </Text>
                                {item.user}
                                </Text>
                            <Text style={{marginTop: 10, fontSize: 20}}>{item.content}</Text>
                            {/* Display multiple images */}
                        {item.imageUris && Array.isArray(item.imageUris) ? (
                            <FlatList
                            data={item.imageUris}
                            keyExtractor={(uri, index) => `${item.id}-image-${index}`}
                            horizontal
                            renderItem={({ item: uri }) => (
                                <Image
                                    source={{ uri }}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        marginBottom: 10,
                                        resizeMode: 'cover',
                                        borderRadius: 5,
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                    }}
                                />
                            )}
                        />
                    ) : (
                        <Text style={{ marginTop: 10, color: 'gray' }}>No images attached</Text>
                    )}
                            
                        </View>
                        <View style={{marginTop: 'auto'}}>
                            <TextInput
                                style={[styles.input, {position: 'absolute', marginBottom: 5, borderRadius: 20, width:'85%', left: 0 , bottom: 5}]}
                                placeholder="Comment"
                                onPress={()=>{setSelectedPost(item),setIsVisible(true)}}
                            />
                            <TouchableOpacity onPress={()=>thumbsUp(item)} style={{position: 'absolute', bottom: 20, right: 20}} >
                            <Icon
                            name="thumbs-up"
                            size={24}
                            color={item.upvoter?.includes(user.uid) ? "green" : "gray"} // Change color based on isUpvoted
                            />
                        </TouchableOpacity>
                        <Text style={{position: 'absolute', fontSize: 20, bottom: 20, right: 5}}>{item.upvoter?.length || 0}</Text>
                        </View>
                        
                            {/* (<Text style={{fontSize: 50}} onPress={()=>{deleteData(item.id)}}>Button</Text>) : (<></>) */}
                        
                        
                        
                    </View>
                        );
                    
                }
            }}
                />
            )}

                
            </View>
            
            <TouchableOpacity onPress={()=>setIsAll(true)} style={[{padding: 8, position: 'absolute', left: 0,fontWeight: 'bold', top: 0, marginVertical:170, margin: 15, borderRadius: 15},(isAll? {backgroundColor: '#d6ffa7'} : {backgroundColor: 'grey'})]}>
                <Text style={[{fontWeight: '650', fontWeight: 'bold', fontSize:15},(!isAll? {color: '#fdfdfd'} : {color: 'black'})]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setIsAll(false)} style={[{padding: 8, backgroundColor: 'green', position: 'absolute', left: 50,fontWeight: 'bold', top: 0, marginVertical:170, margin: 10, borderRadius: 15},(isAll? {backgroundColor: 'grey'} : {backgroundColor: '#d6ffa7'})]}>
                <Text style={[{fontWeight: '650', fontWeight: 'bold', fontSize:15},(isAll? {color: '#fdfdfd'} : {color: 'black'})]}>Your Post</Text>
            </TouchableOpacity>
            
            <Text style={{color: '#fdfdfd', position: 'absolute', right: 0,fontWeight: 'bold', top: 8, marginVertical:170, margin: 15}}>Latest</Text>
            <Switch style={{position: 'absolute', right: 47, top: 5, margin: 15, marginVertical: 165}}
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    value={isEnabled}
                    onValueChange={(value) => setIsEnabled(value)}
                    />
            <Text style={{color: '#fdfdfd', position: 'absolute', right: 107, fontWeight: 'bold',top: 8,marginVertical:170, margin: 15}}>Top</Text>

<TouchableOpacity onPress={()=>navi.navigate('CreatePost')} style={[ {position: 'absolute', bottom:20, left:15, alignSelf: 'center',paddingHorizontal: 25,marginTop: 10, marginLeft: 'auto', paddingVertical: 15, backgroundColor: 'green', borderRadius: 100, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 3}]} >
                  <Text style={{color: '#fdfdfd', fontWeight: '800', fontSize:30}}>+</Text>
              </TouchableOpacity>
            
            {isVisible && (
                    <View style={styles.centeredView}>
                        <Text style={{position: 'absolute', left: 15, fontWeight: 'bold', fontSize: 30, marginLeft: 15, marginTop: 15}}>Comment</Text>
                        <Text onPress={()=>setIsVisible(false)} style={{position: 'absolute', right: 20, fontWeight: 'bold', fontSize: 30, marginLeft: 15, marginTop: 15, fontSize: 30}}>X</Text>
                        <FlatList style={{paddingTop: 0, marginTop: 60}}
                            data={comments}
                            keyExtractor={(item) => item.id}

                            renderItem={({ item }) => {
                                if(item.post == selectedPost.id){
                                    return (
                                        <View style={[stylesHome.context, { minHeight:10}]}>
                                            <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{potition: 'absolute', width: 30,
                                                height: 30, // Adjust to your desired size
                                                resizeMode: 'cover',
                                                borderRadius:75,
                                                borderWidth: 1}} />
                                            <Text style={{marginTop:5}}>{item.comment}</Text>
                                        </View>
                                    );
                                }
                                
                               }}
                    />
                    <TextInput
                        style={[styles.input, {borderRadius: 50, position: 'absolute', width:'72%', left: 15 , bottom: 20, margin:10, marginTop: 'auto'}]}
                        placeholder="Comment"
                        value={comment}
                        onChangeText={setComment}
                    />

                    <TouchableOpacity onPress={()=>{writeData(selectedPost), setComment("")}} style={[styles.submitComment]}>
                        <Text style={{color: '#fdfdfd', fontWeight: '800', fontSize:30}}>+</Text>
                    </TouchableOpacity>
                    </View>
            )} 

            
        </View>
    );
}
