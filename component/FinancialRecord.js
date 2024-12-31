import React, {useState, useContext, useEffect} from 'react';
import { StatusBar, Switch, Alert, Text, FlatList, Image, View, Dimensions,TextInput, Platform, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import {styles, stylesHome} from '../styles';
import { database } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set,remove, push, getDatabase, get, onValue, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import { PieChart } from 'react-native-gifted-charts';

export default function FinancialRecord(){
    const [record, setRecord] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comment, setComment] = useState("");
    const {user, setUser } = useContext(UserContext);
    const [isVisible, setIsVisible] = useState(false);
    const [comments, setComments] = useState([]);
    const [isMonthlyView, setIsMonthlyView] = useState(false);
    const [isAll, setIsAll] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [detail, setDetail] = useState(null);

    const [values,setValues] = useState([1]);
    const [sliceColor,setSliceColor]=useState(['#333333'])
    const [data, setData] = useState([]);
    const [dataMonth, setDataMonth] = useState([]);
    const [dataDate, setDataDate] = useState([]);
    const [sum, setSum] = useState([]);
    const [finalData, setFinalData] = useState([]);
    // const today = new Date().toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric' });
    const months = [
      { key: "1", month: "Jan" },
      { key: "2", month: "Feb" },
      { key: "3", month: "Mar" },
      { key: "4", month: "Apr" },
      { key: "5", month: "May" },
      { key: "6", month: "Jun" },
      { key: "7", month: "Jul" },
      { key: "8", month: "Aug" },
      { key: "9", month: "Sep" },
      { key: "10", month: "Oct" },
      { key: "11", month: "Nov" },
      { key: "12", month: "Dec" }
    ];
    const navi = useNavigation();

    useEffect(() => {
        // Reference to the "posts" node in your Firebase Realtime Database
        const postsRef = ref(database, 'financeRecords/');  // Change 'posts' to your actual data node name
    
        // Listen for changes in the data
        onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const dataList = Object.keys(data).map((key) => ({
              id: key,
              email: data[key].email,
              type: data[key].type,
              value: data[key].value,
              notes: data[key].notes,
              date: new Date(data[key].date).toDateString()
            }));

            const uniqueData = dataList.filter((value, index, self) =>
              index === self.findIndex((t) => t.date === value.date)
            );

            const groupByMonth = (items) => {
              // Group items by month using the logic provided
              const grouped = items.reduce((acc, item) => {
              const month = new Date(item.date).toLocaleString('default', { month: 'short' });
            
                if (!acc[month]) {
                  acc[month] = { income: 0, expense: 0 };
                }
            
                // Sum income or expense based on type
                  if (item.type === 'Income' && item.email === user.email) {
                    acc[month].income += parseFloat(item.value);
                  } else if (item.type === 'Expense' && item.email === user.email) {
                    acc[month].expense += parseFloat(item.value);
                  }

            
                return acc;
              }, {});
            
              return grouped;
            };

            const mergeWithMonths = (groupedData) => {
              return months.map((month) => {
                // If the month exists in groupedData, use its values; otherwise, default to 0
                return {
                  month: month.month,
                  email: groupedData[month.month]?.email,
                  income: groupedData[month.month]?.income || 0,
                  expense: groupedData[month.month]?.expense || 0,
                };
              });
            };

              // Apply the grouping and summing function
              const groupedData = groupByMonth(dataList);
              const result = mergeWithMonths(groupedData);

              // Convert grouped data to an array for rendering
              // const finalData = Object.keys(groupedData).map((month) => ({
              //   month,
              //   income: groupedData[month].income,
              //   expense: groupedData[month].expense,
              // }));
            
            setData(dataList);
            setDataMonth(result);
            setDataDate(uniqueData);
            console.log(user);
            // console.log("Unique data",uniqueData);

            // const filtj

            // console.log(dataDate);
            
          } else {
            setData([]);
            setDataMonth([]);
          }
        });
    
        return () => {
          setData([]);  // Cleanup on unmount
          setDataMonth([]);
        };
      }, []);

    return(
      <View style={styles.container3}>
          <View style={styles.container}>
              <Text style={[styles.text]}>Expense Record</Text>
              <StatusBar style="auto" />
              <View style={[styles.container2]}>
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{marginLeft: 'auto', fontWeight: 'bold'}}>Daily</Text>
                  <Switch style={{marginHorizontal: 10, color: '#fdfdfd',fontWeight: 'bold'}}
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isMonthlyView ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    value={isMonthlyView}
                    onValueChange={(value) => setIsMonthlyView(value)}
                  />
                  <Text style={{fontWeight: 'bold'}}>Monthly</Text>
                </View>
                <View>
                    {isMonthlyView ? 
                      <FlatList
                        data={dataMonth}
                        keyExtractor={(item) => item.month}
                        renderItem={({ item }) => {
                              return (
                                <View style={{ padding: 5 }}>
                                  <Text style={{ fontWeight: 'bold', fontSize: 25, marginBottom: 10 }}>
                                    {item.month}
                                  </Text>
                                  {
                                    (item.expense == 0 && item.income == 0) ? (
                                      <View style={{ justifyContent: 'center', height: 80, padding: 10, backgroundColor: '#ededed', borderRadius: 10}}>
                                        <Text style={{fontStyle: 'italic'}}>No data available yet.</Text>
                                      </View>
                                    ) : (
                                      <View style={{ justifyContent: 'center', minHeight: 80, padding: 10, backgroundColor: '#ededed', borderRadius: 10}}>
                                        <Text>Expense: {item.expense}</Text>
                                        <Text>Income: {item.income}</Text>
                                      </View>
                                    )
                                  }
                                </View>
                              );
                          }
                        }
                      /> 
                      : 
                      (<>
                        <Text>Daily View</Text>
                        <FlatList
                          data={dataDate}
                          keyExtractor={(item) => item.date}
                          renderItem={({ item }) => {
                                return (
                                  <View style={{ padding: 5, borderRadius: 10}}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 25, marginBottom: 10 }}>
                                      {item.date}
                                    </Text>
                                    
                                    <FlatList
                                      data={data}
                                      keyExtractor={(i) => i.id}
                                      renderItem={({ item: i }) => {
                                          if(i.date == item.date && i.email === user.email){
                                            return (
                                              <View style={{ paddingLeft: 10, marginVertical: 5, backgroundColor: i.type === "Income" ? 'blue' : 'red', borderRadius: 10}}>
                                                <View style={{ alignItems: 'center', flexDirection: 'row', padding: 10, backgroundColor: '#ededed', borderTopRightRadius: 10, borderBottomRightRadius: 10}}>
                                                  <View style={{height: 80}}>
                                                    <Text>Type: {i.type}</Text>
                                                    <Text>Value: {i.value}</Text>
                                                    <Text>Notes: {i.notes}</Text>
                                                    {/* <Text>{user.email}</Text> */}
                                                  </View>
                                                  <TouchableOpacity onPress={()=>console.log("Edit"+i.id)} style={{marginLeft: 'auto', marginRight: 20}} >
                                                      <Icon
                                                        name="pencil"
                                                        size={24}
                                                        color={item.upvoter?.includes(user.uid) ? "green" : "gray"} // Change color based on isUpvoted
                                                      />
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={()=>console.log("Delete"+i.id)} style={{marginHorizontal: 10}} >
                                                      <Icon
                                                        name="trash"
                                                        size={24}
                                                        color={item.upvoter?.includes(user.uid) ? "green" : "gray"} // Change color based on isUpvoted
                                                      />
                                                  </TouchableOpacity>
                                                </View>
                                              </View>
                                            );
                                          }
                                        }
                                      }
                                    />
                                  </View>
                                );
                            }
                          }
                        />
                      </>)
                    }
                </View>
              </View>
          </View>
      </View>
    );
}