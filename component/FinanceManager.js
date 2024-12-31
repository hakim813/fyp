import React, {useState, useContext, useEffect} from 'react';
import { StatusBar, Switch, Alert, Text, FlatList, Image, View, Dimensions,TextInput, Platform, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import {styles, stylesHome} from '../styles';
import { database } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set,remove, push, getDatabase, get, onValue, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import { PieChart } from 'react-native-gifted-charts';

export default function FinanceManager(){
    const [record, setRecord] = useState([]);
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

    const [values,setValues] = useState([1]);
    const [sliceColor,setSliceColor]=useState(['#333333'])
    const [data, setData] = useState([{value:1},{value:2}]);

    const navi = useNavigation();

    useEffect(() => { 
              const db = getDatabase();
              const postsRef = ref(db, "financeRecords");
      
              // Listen to data changes in the "posts" node
              const unsubscribePost = onValue(postsRef, (snapshot) => {
              const data = snapshot.val();
      
              if (data) {
                  // Convert the object to an array of posts
                  const fetchedRecords = Object.keys(data).map((key) => ({
                  id: key,
                  email: data[key].email,
                  date: data[key].date,
                  notes: data[key].notes,
                  type: data[key].type,
                  value: data[key].value
                  }));
                  setRecord(fetchedRecords);
              } else {
                    setRecord([]); // No data found
              }
              });


    
        }, []);

    return(
        <View style={styles.container3}>
            <View style={styles.container}>
                <Text style={[styles.text]}>
                    Expense Manager
                </Text>
                <StatusBar style="auto" />
                <View style={[styles.container2]}>
                    <View style={{paddingHorizontal: 10, marginVertical:5, flexDirection: 'row'}}>
                        <Text style={{marginLeft: 'auto',  marginRight: 15, alignSelf: 'center', color: '#030303',fontWeight: 'bold'}}>Daily</Text>
                        <Switch style={{marginRight: 15, color: '#fdfdfd',fontWeight: 'bold'}}
                                trackColor={{false: '#767577', true: '#81b0ff'}}
                                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                value={isEnabled}
                                onValueChange={(value) => setIsEnabled(value)}
                                />
                        <Text style={{alignSelf: 'center', color: '#030303',fontWeight: 'bold'}}>Monthly</Text>
                    </View>
                    <View style={{height: 400, width: '100%', justifyContent: 'center', alignItems: 'center'}}>

                        <PieChart 
                        data = {data} 
                        donut
                        innerRadius={80}
                        backgroundColor='#fdfdfd'/>
                    </View>
                    <View style={{marginVertical: 10, flexDirection: 'row', justifyContent: 'center', paddingVertical: 20,alignItems: 'center'}}>
                        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{alignItems: 'center', justifyContent: 'center'}}>Gain</Text>
                            <Text>RM -</Text>
                        </View>
                        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text>Spent</Text>
                            <Text>RM -</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'column', height: 150, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        
                        <TouchableOpacity onPress={()=>navi.navigate("CreateFinanceRecord", {type: "Income"})} style={[styles.button, {marginBottom: 10}]}>
                            <Text>Add Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>navi.navigate("CreateFinanceRecord", {type: "Expense"})} style={[styles.button]}>
                            <Text>Add Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>navi.navigate("FinancialRecord")} style={[styles.button]}>
                            <Text>See Records</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
                </View>
    );
}

// import React from 'react';
// import { View, Dimensions } from 'react-native';
// import { PieChart } from 'react-native-svg-charts';
// import { Text as SVGText } from 'react-native-svg';

// const FinanceManager = () => {
//   const screenWidth = Dimensions.get('window').width;

//   const data = [
//     { key: 1, value: 50, svg: { fill: '#f00' } },
//     { key: 2, value: 30, svg: { fill: '#0f0' } },
//     { key: 3, value: 20, svg: { fill: '#00f' } },
//   ];

//   const Labels = ({ slices }) =>
//     slices.map((slice, index) => {
//       const { pieCentroid, data } = slice;
//       return (
//         <SVGText
//           key={index}
//           x={pieCentroid[0]}
//           y={pieCentroid[1]}
//           fill="white"
//           textAnchor="middle"
//           alignmentBaseline="middle"
//           fontSize={14}
//           fontWeight="bold"
//         >
//           {data.value}%
//         </SVGText>
//       );
//     });

//   return (
//     <View style={{ justifyContent: 'center', alignItems: 'center' }}>
//       <PieChart
//         style={{ height: 200, width: screenWidth - 40 }}
//         data={data}
//         innerRadius={50}    // Set this as a number
//         outerRadius={100}   // Set this as a number
//         padAngle={0.02}
//       >
//         <Labels />
//       </PieChart>
//     </View>
//   );
// };

// export default FinanceManager;
