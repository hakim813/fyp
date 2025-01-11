import React, {useState, useContext, useEffect} from 'react';
import { StatusBar, Switch, Alert, Text, FlatList, Image, View, Dimensions,TextInput, Platform, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import {styles, stylesHome} from '../styles';
import { database } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { ref, set,remove, push, getDatabase, get, onValue, child } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import { PieChart } from 'react-native-gifted-charts';
import BottomBar from './BottomBar';

export default function FinanceManager(){
    // const [record, setRecord] = useState([]);
    // const [selectedPost, setSelectedPost] = useState(null);
    // const [comment, setComment] = useState("");
    const {user} = useContext(UserContext);
    // const [isVisible, setIsVisible] = useState(false);
    // const [comments, setComments] = useState([]);
    const [isMonthly, setIsMonthly] = useState(false);
    // const [isAll, setIsAll] = useState(true);
    // const [searchQuery, setSearchQuery] = useState('');
    // const [filteredPosts, setFilteredPosts] = useState([]);
    const [data, setData] = useState(null);

    // const [values,setValues] = useState([1]);
    // const [sliceColor,setSliceColor]=useState(['#333333'])
    // const [data, setData] = useState([{value:0},{value:0}]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalIncomeMonthly, setTotalIncomeMonthly] = useState(0);
    const [totalExpenseMonthly, setTotalExpenseMonthly] = useState(0);

    const navi = useNavigation();

    useEffect(() => { 
              const db = getDatabase();
              const postsRef = ref(db, "financeRecords");
      
            //   // Listen to data changes in the "posts" node
            //   const unsubscribePost = onValue(postsRef, (snapshot) => {
            //   const data = snapshot.val();
      
              onValue(postsRef, (snapshot) => {
                let income = 0;
                let expense = 0;
                let incomeM = 0;
                let expenseM = 0;
          
                const data = snapshot.val();
                if (data) {
                  Object.values(data).forEach((transaction) => {
                    if (transaction.type === 'Income' && transaction.email == user.email && new Date(transaction.date).toDateString() == new Date().toDateString()) {
                      income += parseFloat(transaction.value); // Assuming 'amount' is a number field
                    } else if (transaction.type === 'Expense' && transaction.email == user.email && new Date(transaction.date).toDateString() == new Date().toDateString()) {
                      expense += parseFloat(transaction.value);
                    }
                  });

                  Object.values(data).forEach((transaction) => {
                    if (transaction.type === 'Income' && transaction.email == user.email && new Date(transaction.date).getMonth == new Date().getMonth) {
                      incomeM += parseFloat(transaction.value); // Assuming 'amount' is a number field
                    } else if (transaction.type === 'Expense' && transaction.email == user.email && new Date(transaction.date).getMonth == new Date().getMonth) {
                      expenseM += parseFloat(transaction.value);
                    }
                  });
                }
          
                setData(data);
                setTotalExpense(expense);
                setTotalIncome(income);
                setTotalExpenseMonthly(expenseM);
                setTotalIncomeMonthly(incomeM);
              });


            //   const dataGraph = (items) => {
            //     // Group items by month using the logic provided
            //     const grouped = items.reduce((acc, item) => {
            //     const month = new Date(item.date).toLocaleString('default', { month: 'short' });
              
            //       if (!acc[month]) {
            //         acc[month] = { income: 0, expense: 0 };
            //       }
              
            //       // Sum income or expense based on type
            //         if (item.type === 'Income' && item.email === user.email) {
            //           acc[month].income += parseFloat(item.value);
            //         } else if (item.type === 'Expense' && item.email === user.email) {
            //           acc[month].expense += parseFloat(item.value);
            //         }
  
              
            //       return acc;
            //     }, {});
              
            //     return grouped;
            //   };
  
        }, []);

        const pieChartDataDaily = [
            {
              value: totalIncome,
              color: '#3282F6'
            },
            {
              value: totalExpense,
              color: '#F44F4F'
            }
          ];

        const pieChartDataMonthly = [
          {
            value: totalIncomeMonthly,
            color: '#3282F6'
          },
          {
            value: totalExpenseMonthly,
            color: '#F44F4F'
          }
        ];

    return(
      <View style={styles.container3}>
        <View style={styles.container}>
          <Text style={[styles.text]}>
              Expense Manager
          </Text>

          <StatusBar style="auto" />

          <View style={[styles.container2]}>
            <View style={{paddingHorizontal: 10, marginBottom:5, flexDirection: 'row'}}>
                <Text style={{marginLeft: 'auto',  marginRight: 15, alignSelf: 'center', color: '#030303',fontWeight: 'bold'}}>Daily</Text>
                  <Switch 
                    style={{marginRight: 15, color: '#fdfdfd',fontWeight: 'bold'}}
                          trackColor={{false: '#1b434d', true: '#81b0ff'}}
                          thumbColor={isMonthly ? '#1b434d' : '#81b0ff'}
                          ios_backgroundColor="#3e3e3e"
                          value={isMonthly}
                          onValueChange={(value) => setIsMonthly(value)}
                  />
                <Text style={{alignSelf: 'center', color: '#030303',fontWeight: 'bold'}}>Monthly</Text>
            </View>

              {!isMonthly ? 
                  
              <>
                  {totalExpense > 0 || totalIncome > 0 ? 
                  <View style={{height: 380, width: 360, justifyContent: 'center', alignItems: 'center'}}>

                  <PieChart 
                  data = {pieChartDataDaily} 
                  donut
                  showText
                  textSize={16}
                  innerRadius={130}
                  radius={170}
                  isAnimated={true}
                    animationDuration={2000} 
                  />
                  <View style={{height: 100, position: 'absolute', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontWeight: 'bold', fontSize: 25}}>Daily net profit</Text>
                    <Text style={{fontWeight: 'bold', fontSize: 25}}>{new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}</Text>
                    {(totalIncome - totalExpense >= 0 ? 
                      <>
                        <Text style={{fontSize: 35, color: 'green'}}>RM {totalIncome-totalExpense}</Text>
                      </>: 
                    <>
                        <Text style={{fontSize: 35, color: '#F44F4F'}}>- RM {totalExpense-totalIncome}</Text>  
                    </>
                  )}
                  </View>
              </View>
              :
              <View style={{height: 380, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                  <Text>No  data available</Text>
              </View>    
              
              }
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 10,alignItems: 'center'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderColor: '#f44f4f', borderWidth: 3 ,backgroundColor: '#000f44f4f', padding: 10}}>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Gain: </Text>
                <Text style={{fontSize: 20}}>RM {totalIncome}</Text>
              </View>
              
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderColor: '#3282F6', borderWidth: 3 ,backgroundColor: '#0003282F6', padding: 10}}>
                  <Text style={{fontWeight: 'bold', fontSize: 20}}>Spent: </Text>
                  <Text style={{fontSize: 20}}>RM {totalExpense}</Text>
              </View>
              </View>
              </>
              :
              <>
                {totalExpenseMonthly > 0 || totalIncomeMonthly > 0 ? 
                <View style={{height: 380, width: 360, justifyContent: 'center', alignItems: 'center'}}>

                    <PieChart 
                    data = {pieChartDataMonthly} 
                    donut
                    showText
                    textSize={16}
                    innerRadius={130}
                    isAnimated
                    animationDuration={2000} 
                    radius={170}
                    />
                    <View style={{height: 100, position: 'absolute', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontWeight: 'bold', fontSize: 25}}>Daily net profit</Text>
                    <Text style={{fontWeight: 'bold', fontSize: 25}}>{new Date().toLocaleDateString('en-US', {month: 'short'})}</Text>
                    {(totalIncomeMonthly - totalExpenseMonthly >= 0 ? 
                      <>
                        <Text style={{fontSize: 35, color: 'green'}}>RM {totalIncomeMonthly - totalExpenseMonthly}</Text>
                      </>: 
                    <>
                        <Text style={{fontSize: 35, color: '#F44F4F'}}>- RM {totalExpenseMonthly-totalIncomeMonthly}</Text>  
                    </>
                  )}
                  </View>
                </View>
                :
                <View style={{height: 380, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <Text>No data available</Text>
                </View>    

                }
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 10,alignItems: 'center'}}>
              
              
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderColor: '#f44f4f', borderWidth: 3 ,backgroundColor: '#000f44f4f', padding: 10}}>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Gain: </Text>
                <Text style={{fontSize: 20}}>RM {totalIncomeMonthly}</Text>
              </View>
              
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderColor: '#3282F6', borderWidth: 3 ,backgroundColor: '#0003282F6', padding: 10}}>
                  <Text style={{fontWeight: 'bold', fontSize: 20}}>Spent: </Text>
                  <Text style={{fontSize: 20}}>RM {totalExpenseMonthly}</Text>
              </View>
              </View>
              </>

              }

            <View style={{flexDirection: 'row', height: 150, width: '100%', justifyContent: 'space-evenly', alignItems: 'center'}}>
                <View>
                  <TouchableOpacity onPress={()=>navi.navigate("CreateFinanceRecord", {type: "Income"})} style={[styles.button, {marginBottom: 10}]}>
                      <Text style={{color: '#fdfdfd'}}>Add Income</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>navi.navigate("CreateFinanceRecord", {type: "Expense"})} style={[styles.button, {marginBottom: 10}]}>
                    <Text style={{color: '#fdfdfd'}}>Add Expense</Text>
                  </TouchableOpacity>
                </View>
                <View>
                <TouchableOpacity onPress={()=>{console.log('This is the data : ',data),navi.navigate("FinancialRecord")}} style={[styles.button]}>
                  <Text style={{color: '#fdfdfd'}}>See Records</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, {marginBottom: 10}]}>
                    <Text style={{color: '#fdfdfd'}}>  Go to SP  </Text>
                  </TouchableOpacity>
                </View>
            </View>
          </View>

          <BottomBar></BottomBar>
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
