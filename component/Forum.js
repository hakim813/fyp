// import { StatusBar } from 'expo-status-bar';
// import CustomSwitch from 'react-native-custom-switch';
// import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import React, {useState, useContext, useEffect} from 'react';
import { StatusBar, Switch, Alert, Text, FlatList, Image, View, TextInput, Platform, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import {styles, stylesHome} from '../styles';
import { database } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set,remove, push, getDatabase, get, onValue, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomBar from './BottomBar';
import { LinearGradient } from 'expo-linear-gradient';

export default function Forum(){
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comment, setComment] = useState("");
    const {user, setUser } = useContext(UserContext);
    const [isVisible, setIsVisible] = useState(false);
    const [comments, setComments] = useState([]);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isAll, setIsAll] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [detail, setDetail] = useState(null);

    //to write data into database
    const writeData = async(item) => {
    
        if (!comment) {
          Alert.alert("Please fill in the comment.")
          return;
        }

        const db = getDatabase(); // Initialize Firebase Realtime Database
        const dbRef = ref(db); // Reference to the database
        const snapshot = await get(child(dbRef, 'users')); // Fetch all users from the database

        const users = snapshot.val();
        const existingUser = Object.values(users).find(u => u.email === user.email); // Match email
        console.log('User found!');

        const commentRef = ref(database, 'comment/');
        const newCommentRef = push(commentRef);
      
        set(newCommentRef, {
          user: existingUser.username,
          email: user.email,
          comment: comment,
          post: item.id,
        })
          .then(() => {
            setComment("");
            console.log('Comment added to the database successfully!');
            
            
            const postRef = ref(database, `posts/${item.id}`); //Reference to the specific post
      
            
            get(postRef)
              .then((snapshot) => {
                const postData = snapshot.val();
                const currentCommentIds = postData?.commentId || []; //Get existing commentId array (if exists)
                
                // Add the new commentId to the array
                const updatedCommentIds = [...currentCommentIds, newCommentRef.key]; //Append the new commentId
      
                set(postRef, {
                  ...postData,
                  commentId: updatedCommentIds, //Update the commentId array with the new commentId
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
    
    //like post function
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
    //to update post with real-time database
    useEffect(() => { 
          const db = getDatabase();
          const postsRef = ref(db, "posts");
  
          // Listen to data changes in the "posts" node
          onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
  
          if (data) {
              // Convert the object to an array of posts
              const fetchedPosts = Object.keys(data).map((key) => ({
              id: key,
              user: data[key].user,
              email: data[key].email,
              title: data[key].title,
              content: data[key].content,
              date: data[key].date,
              comment: data[key].commentId,
              upvoter: data[key].upvoter || [],
              imageUris: data[key].imageUris || []
              }));

              if(isEnabled){
                fetchedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
              }
              else{
                fetchedPosts.sort((a, b) => b.upvoter?.length - a.upvoter?.length);
              }
  
              setPosts(fetchedPosts);
          } else {
              setPosts([]); // No data found
          }
          });

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

    useEffect(() => { //for filtering posts based on query in search bar
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = posts.filter((post) =>
          post.title.toLowerCase().includes(lowercasedQuery) ||
          post.content.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredPosts(results);
    }, [searchQuery, posts]);

    return(
        <View style={[stylesHome.bg, {paddingRight:0}]} >
            <LinearGradient
                colors={['#03633a', '#95f6cc']} // start to end gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.container, {paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight+50 : StatusBar.currentHeight}]}
            >
            <View style={{flex:1}}>
                <Text style={[stylesHome.welcomeText, {color: '#fafafa', marginHorizontal: 15}]}>Community Forum</Text>
                <TextInput
                    style={[styles.input, {backgroundColor: '#fdfdfd', borderRadius: 20, marginHorizontal:15}]}
                    placeholder="Search any content. . ."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    // onPress={()=>{}}
                />
                <View style={{flexDirection: 'row', marginHorizontal: 15, marginBottom: 15}}>
                    <TouchableOpacity onPress={()=>setIsAll(true)} style={[{marginRight: 10, paddingVertical: 5, paddingHorizontal: 15, minWidth: 90, fontWeight: 'bold', borderRadius: 15, alignItems: 'center', justifyContent: 'center'},(isAll? {backgroundColor: '#fdfdfd'} : {backgroundColor: 'grey'})]}>
                        <Text style={[{fontFamily: 'Nunito-Bold', fontSize:15},(isAll? {color: '#06a561'} : {color: '#020202'})]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setIsAll(false)} style={[{marginRight: 25, paddingVertical: 5, paddingHorizontal: 15, minWidth: 90, fontWeight: 'bold', borderRadius: 15, alignItems: 'center', justifyContent: 'center'},(isAll? {backgroundColor: 'grey'} : {backgroundColor: '#fdfdfd'})]}>
                    <Text style={[{fontFamily: 'Nunito-Bold', fontSize:15},(isAll? {color: '#020202'} : {color: '#06a561'})]}>Your Post</Text>
                    </TouchableOpacity>
                    <Text style={{marginLeft: 'auto',  alignSelf: 'center', color: '#fdfdfd',fontWeight: 'bold'}}>Top</Text>
                    <Switch style={{marginLeft: 'auto', color: '#fdfdfd',fontWeight: 'bold'}}
                        trackColor={{false: '#fdfdfd', true: '#81b0ff'}}
                        thumbColor={isEnabled ? '#1b434d' : '#81b0ff'}
                        ios_backgroundColor="#3e3e3e"
                        value={isEnabled}
                        onValueChange={(value) => setIsEnabled(value)}
                    />
                    <Text style={{marginLeft: 'auto', marginRight: 10, alignSelf: 'center', color: '#fdfdfd',fontWeight: 'bold'}}>Latest</Text>
                </View>

            {filteredPosts.length === 0 ? (
                <View style={{flex: 1,  alignItems: 'center', height: '100%', justifyContent: 'center'}}>
                    <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'white' }}>No content available</Text>
                </View>
            ) : (
                <FlatList  //d6ffa7
                                
                style={{paddingVertical: 10, backgroundColor: '#dedede'}}
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    //for all posts
                    if(isAll){
                        return(
                    <View style={[stylesHome.context, {paddingVertical:10, backgroundColor: '#fafafa'}]}>
                        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                            {/* <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{ width: 30,
                                height: 30,
                                resizeMode: 'cover',
                                marginRight: 15,
                                borderRadius: 75,
                                borderColor: 'black',
                                borderWidth: 0}} /> */}
                            <Text style = {{ fontFamily: 'Nunito-ExtraBold', fontSize: 25}}>
                                {item.title.length > 15 ? `${item.title.slice(0, 15)}...` : item.title}
                            </Text>
                            <Text style = {{marginLeft: 'auto', color: 'grey', fontFamily: 'Nunito'}}>{new Date(item.date).toDateString()}</Text>
                        </View>
                        <View  style={{marginBottom: 0}}>
                            <Text>
                                <Text style={{fontFamily: 'Nunito-ExtraBold'}}>
                                    Written by:{" "}
                                </Text>
                                {item.user}
                                </Text>
                            <Text style={{marginTop: 5, fontSize: 20, fontFamily: 'Nunito'}}>{item.content}</Text>
                            {/* Display multiple images */}
                        {item.imageUris && Array.isArray(item.imageUris) ? (
                            <FlatList
                            data={item.imageUris}
                            keyExtractor={(uri, index) => `${item.id}-image-${index}`}
                            horizontal
                            style={{}}
                            renderItem={({ item: uri }) => (
                                <Image
                                    source={{ uri }}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        margin:10,
                                        marginLeft:0,
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
                        {/* comment */}
                        <View style={{marginTop: 0}}> 
                            <TextInput
                                style={[styles.input, {marginBottom: 5, borderRadius: 20, width: '100%' , left: 0 , bottom: 5}]}
                                placeholder="Comment"
                                onPress={()=>{setSelectedPost(item),setIsVisible(true)}}
                            />
                            {/* <TouchableOpacity onPress={()=>thumbsUp(item)} style={{position: 'absolute', bottom: 27, right: 25}} >
                                <Icon
                                name="thumbs-up"
                                size={24}
                                color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                />
                            </TouchableOpacity>
                            <Text style={{position: 'absolute', fontSize: 20, bottom: 25, right: 10}}>{item.upvoter?.length || 0}</Text> */}
                        </View>
                        {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity onPress={()=>thumbsUp(item)} style={{marginHorizontal: 10}} >
                                    <Icon
                                        name="thumbs-up"
                                        size={24}
                                        color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                    />
                                    </TouchableOpacity>
                                    <Text style={{fontSize: 20}}>{item.upvoter?.length || 11110}</Text> */}

                                    {/* <TouchableOpacity onPress={()=>Alert.alert('Delete Post',
                                            'Are you sure you want to delete this post?',
                                            [
                                                {
                                                text: 'Cancel',
                                                style: 'cancel', // Adds the "Cancel" style (button is usually grayed out)
                                                },
                                                {
                                                text: 'Delete',
                                                style: 'destructive', // Adds the "Delete" style (usually red)
                                                onPress: () => deleteData(item.id),
                                                },
                                            ])} 
                                            style={{backgroundColor: 'red', marginLeft: 'auto', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 5}} >
                                        <Icon
                                        name="trash"
                                        size={20}
                                        color={'#fdfdfd'} // Change color based on isUpvoted
                                        />
                                    </TouchableOpacity> */}
                                {/* </View> */}
                        
                        {
                            item.email == user.email ? 
                            (
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity onPress={()=>thumbsUp(item)} style={{marginHorizontal: 10}} >
                                    <Icon
                                        name="thumbs-up"
                                        size={24}
                                        color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                    />
                                    </TouchableOpacity>
                                    <Text style={{fontSize: 20}}>{item.upvoter?.length || 11110}</Text>

                                    <TouchableOpacity onPress={()=>Alert.alert('Delete Post',
                                            'Are you sure you want to delete this post?',
                                            [
                                                {
                                                text: 'Cancel',
                                                style: 'cancel', // Adds the "Cancel" style (button is usually grayed out)
                                                },
                                                {
                                                text: 'Delete',
                                                style: 'destructive', // Adds the "Delete" style (usually red)
                                                onPress: () => deleteData(item.id),
                                                },
                                            ])} 
                                            style={{backgroundColor: 'red', marginLeft: 'auto', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 5}} >
                                        <Icon
                                        name="trash"
                                        size={20}
                                        color={'#fdfdfd'} // Change color based on isUpvoted
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) 
                        : (<View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <TouchableOpacity onPress={()=>thumbsUp(item)} style={{marginHorizontal: 10}} >
                            <Icon
                                name="thumbs-up"
                                size={24}
                                color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                            />
                            </TouchableOpacity>
                            <Text style={{fontSize: 20}}>{item.upvoter?.length || 0}</Text>

                            {/* <TouchableOpacity onPress={()=>Alert.alert('Delete Post',
                                    'Are you sure you want to delete this post?',
                                    [
                                        {
                                        text: 'Cancel',
                                        style: 'cancel', // Adds the "Cancel" style (button is usually grayed out)
                                        },
                                        {
                                        text: 'Delete',
                                        style: 'destructive', // Adds the "Delete" style (usually red)
                                        onPress: () => deleteData(item.id),
                                        },
                                    ])} 
                                    style={{backgroundColor: 'red', marginLeft: 'auto', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 5}} >
                                <Icon
                                name="trash"
                                size={20}
                                color={'#fdfdfd'} // Change color based on isUpvoted
                                />
                            </TouchableOpacity> */}
                        </View>)
                        }
                    </View>
                        );
                }
                //for post by the acc owner
                else if(item.email == user.email){
                    return(
                        // <View style={[stylesHome.context, {paddingVertical:10, backgroundColor: '#fafafa'}]}>
                        //     <View>
                        //         <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{potition: 'absolute', width: 30,
                        //             height: 30,
                        //             resizeMode: 'cover',
                        //             marginRight: 15,
                        //             borderRadius: 75,
                        //             borderColor: 'black',
                        //             borderWidth: 1}} />
                        //         <Text style = {{position: 'absolute', top: 5   , left: 40, fontWeight:'bold', fontSize: 25, marginBottom:10}}>
                        //             {item.title.length > 15 ? `${item.title.slice(0, 15)}...` : item.title}
                        //         </Text>
                        //         <Text style = {{position: 'absolute', top: 15, right: 5, marginBottom:10, color: 'grey'}}>{new Date(item.date).toDateString()}</Text>
                        //     </View>
                        //     <View  style={{marginBottom: 60}}>
                                
                        //         <Text style={{marginTop: 10}}>
                        //             <Text style={{fontWeight: 'bold'}}>
                        //                 Written by:{" "}
                        //             </Text>
                        //             {item.user}
                        //             </Text>
                        //         <Text style={{marginVertical: 10, fontSize: 20}}>{item.content}</Text>
                        //         {/* Display multiple images */}
                        //     {item.imageUris && Array.isArray(item.imageUris) ? (
                        //         <FlatList
                        //         data={item.imageUris}
                        //         keyExtractor={(uri, index) => `${item.id}-image-${index}`}
                        //         horizontal
                        //         renderItem={({ item: uri }) => (
                        //             <Image
                        //                 source={{ uri }}
                        //                 style={{
                        //                     width: 200,
                        //                     height: 200,
                        //                     margin:10,
                        //                     marginLeft:0,
                        //                     resizeMode: 'cover',
                        //                     borderRadius: 5,
                        //                     borderWidth: 1,
                        //                     borderColor: '#ccc',
                        //                 }}
                        //             />
                        //         )}
                        //     />
                        // ) : (
                        //     <Text style={{ marginTop: 10, color: 'gray' }}>No images attached</Text>
                        // )}
                                
                        //     </View>
                        //     <View style={{marginTop: 'auto'}}>
                        //         <TextInput
                        //             style={[styles.input, {position: 'absolute', marginBottom: 5, borderRadius: 20, width:'100%', left: 0 , bottom: 5}]}
                        //             placeholder="Comment"
                        //             onPress={()=>{setSelectedPost(item),setIsVisible(true)}}
                        //         />
                        //         {/* <TouchableOpacity onPress={()=>thumbsUp(item)} style={{position: 'absolute', bottom: 20, right: 20}} >
                        //             <Icon
                        //             name="thumbs-up"
                        //             size={24}
                        //             color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                        //             />
                        //         </TouchableOpacity>
                        //         <Text style={{position: 'absolute', fontSize: 20, bottom: 20, right: 5}}>{item.upvoter?.length || 0}</Text> */}
                        //     </View>

                        <View style={[stylesHome.context, {paddingVertical:10, backgroundColor: '#fafafa'}]}>
                        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                            {/* <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{ width: 30,
                                height: 30,
                                resizeMode: 'cover',
                                marginRight: 15,
                                borderRadius: 75,
                                borderColor: 'black',
                                borderWidth: 0}} /> */}
                            <Text style = {{ fontFamily: 'Nunito-ExtraBold', fontSize: 25}}>
                                {item.title.length > 15 ? `${item.title.slice(0, 15)}...` : item.title}
                            </Text>
                            <Text style = {{marginLeft: 'auto', color: 'grey', fontFamily: 'Nunito'}}>{new Date(item.date).toDateString()}</Text>
                        </View>
                        <View  style={{marginBottom: 0}}>
                            <Text>
                                <Text style={{fontFamily: 'Nunito-ExtraBold'}}>
                                    Written by:{" "}
                                </Text>
                                {item.user}
                                </Text>
                            <Text style={{marginTop: 5, fontSize: 20, fontFamily: 'Nunito'}}>{item.content}</Text>
                            {/* Display multiple images */}
                        {item.imageUris && Array.isArray(item.imageUris) ? (
                            <FlatList
                            data={item.imageUris}
                            keyExtractor={(uri, index) => `${item.id}-image-${index}`}
                            horizontal
                            style={{}}
                            renderItem={({ item: uri }) => (
                                <Image
                                    source={{ uri }}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        margin:10,
                                        marginLeft:0,
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
                        {/* comment */}
                        <View style={{marginTop: 0}}> 
                            <TextInput
                                style={[styles.input, {marginBottom: 5, borderRadius: 20, width: '100%' , left: 0 , bottom: 5}]}
                                placeholder="Comment"
                                onPress={()=>{setSelectedPost(item),setIsVisible(true)}}
                            />
                            {/* <TouchableOpacity onPress={()=>thumbsUp(item)} style={{position: 'absolute', bottom: 27, right: 25}} >
                                <Icon
                                name="thumbs-up"
                                size={24}
                                color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                />
                            </TouchableOpacity>
                            <Text style={{position: 'absolute', fontSize: 20, bottom: 25, right: 10}}>{item.upvoter?.length || 0}</Text> */}
                        </View>
                        {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity onPress={()=>thumbsUp(item)} style={{marginHorizontal: 10}} >
                                    <Icon
                                        name="thumbs-up"
                                        size={24}
                                        color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                    />
                                    </TouchableOpacity>
                                    <Text style={{fontSize: 20}}>{item.upvoter?.length || 11110}</Text> */}

                                    {/* <TouchableOpacity onPress={()=>Alert.alert('Delete Post',
                                            'Are you sure you want to delete this post?',
                                            [
                                                {
                                                text: 'Cancel',
                                                style: 'cancel', // Adds the "Cancel" style (button is usually grayed out)
                                                },
                                                {
                                                text: 'Delete',
                                                style: 'destructive', // Adds the "Delete" style (usually red)
                                                onPress: () => deleteData(item.id),
                                                },
                                            ])} 
                                            style={{backgroundColor: 'red', marginLeft: 'auto', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 5}} >
                                        <Icon
                                        name="trash"
                                        size={20}
                                        color={'#fdfdfd'} // Change color based on isUpvoted
                                        />
                                    </TouchableOpacity> */}
                                {/* </View> */}
                        
                            
                            {
                                item.email == user.email ? 
                                (
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <TouchableOpacity onPress={()=>thumbsUp(item)} style={{marginHorizontal: 10}} >
                                        <Icon
                                            name="thumbs-up"
                                            size={24}
                                            color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                        />
                                        </TouchableOpacity>
                                        <Text style={{fontSize: 20}}>{item.upvoter?.length || 11110}</Text>

                                        <TouchableOpacity onPress={()=>Alert.alert('Delete Post',
                                                'Are you sure you want to delete this post?',
                                                [
                                                    {
                                                    text: 'Cancel',
                                                    style: 'cancel', // Adds the "Cancel" style (button is usually grayed out)
                                                    },
                                                    {
                                                    text: 'Delete',
                                                    style: 'destructive', // Adds the "Delete" style (usually red)
                                                    onPress: () => deleteData(item.id),
                                                    },
                                                ])} 
                                                style={{backgroundColor: 'red', marginLeft: 'auto', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 5}} >
                                            <Icon
                                            name="trash"
                                            size={20}
                                            color={'#fdfdfd'} // Change color based on isUpvoted
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ) 
                            : (<View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity onPress={()=>thumbsUp(item)} style={{marginHorizontal: 10}} >
                                <Icon
                                    name="thumbs-up"
                                    size={24}
                                    color={item.upvoter?.includes(user.uid) ? "#1b434d" : "gray"} // Change color based on isUpvoted
                                />
                                </TouchableOpacity>
                                <Text style={{fontSize: 20}}>{item.upvoter?.length || 11110}</Text>

                                <TouchableOpacity onPress={()=>Alert.alert('Delete Post',
                                        'Are you sure you want to delete this post?',
                                        [
                                            {
                                            text: 'Cancel',
                                            style: 'cancel', // Adds the "Cancel" style (button is usually grayed out)
                                            },
                                            {
                                            text: 'Delete',
                                            style: 'destructive', // Adds the "Delete" style (usually red)
                                            onPress: () => deleteData(item.id),
                                            },
                                        ])} 
                                        style={{backgroundColor: 'red', marginLeft: 'auto', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 5}} >
                                    <Icon
                                    name="trash"
                                    size={20}
                                    color={'#fdfdfd'} // Change color based on isUpvoted
                                    />
                                </TouchableOpacity>
                            </View>)
                            }
                        </View>
                            );
                }
            }}
                />
            )} 
            </View>
            </LinearGradient>
        
        <TouchableOpacity onPress={()=>navi.navigate('CreatePost')} style={[ {position: 'absolute', bottom:20, right: '40%', alignSelf: 'center',paddingHorizontal: 25,marginTop: 10, paddingVertical: 15, backgroundColor: '#1b434d', borderRadius: 100, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 3}]} >
                  <Text style={{color: '#fdfdfd', fontWeight: '800', fontSize:30}}>+</Text>
        </TouchableOpacity>
            
            <BottomBar></BottomBar>
            <TouchableOpacity onPress={()=>navi.navigate('CreatePost')} style={[ {position: 'absolute', bottom:20, right: '42%', alignSelf: 'center',paddingHorizontal: 25,marginTop: 10, paddingVertical: 15, backgroundColor: '#81b0ff', borderRadius: 100, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 3}]} >
                  <Text style={{color: '#1b434d', fontWeight: '800', fontSize:30}}>+</Text>
            </TouchableOpacity>
            {isVisible && (
                    <View style={[styles.centeredView]}>
                        <Text style={{position: 'absolute', left: 15, fontWeight: 'bold', fontSize: 30, marginLeft: 15, marginTop: 15}}>Comment</Text>
                        <TouchableOpacity onPress={()=>setIsVisible(false)} style={{position: 'absolute', right: 20, fontWeight: 'bold', fontSize: 30, marginLeft: 15, marginTop: 15, fontSize: 30}}>
                            <Icon
                                name="close"
                                size={24}
                            />
                        </TouchableOpacity>
                        {/* <Text onPress={()=>setIsVisible(false)} style={{position: 'absolute', right: 20, fontWeight: 'bold', fontSize: 30, marginLeft: 15, marginTop: 15, fontSize: 30}}>X</Text> */}
                        <FlatList style={{paddingTop: 0, marginTop: 60}}
                            data={comments}
                            keyExtractor={(item) => item.id}

                            renderItem={({ item }) => {
                                if(item.post == selectedPost.id){
                                    return (
                                        <View style={[stylesHome.context, {flexDirection: 'row', minHeight:10, borderBottomWidth: 0.3}]}>
                                            <Image source={{ uri: 'https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png' }} style={{potition: 'absolute', width: 30,
                                                height: 40,
                                                width: 40,
                                                marginBottom: 10,
                                                resizeMode: 'cover',
                                                borderRadius:75,
                                                borderWidth: 1}} />
                                                <View style={{marginLeft: 10, border: '#111'}}>
                                                    <Text style={{fontWeight:'bold'}}>{item.user}</Text>
                                                    <Text style={{marginTop:5}}>{item.comment}</Text>
                                                </View>
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

                        <TouchableOpacity onPress={()=>{writeData(selectedPost)}} style={[styles.submitComment]}>
                            <Text style={{color: '#fdfdfd', fontWeight: '800', fontSize:30}}>+</Text>
                        </TouchableOpacity>
                        </View>
            )} 
        </View>
    );
}
