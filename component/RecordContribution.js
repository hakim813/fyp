import React, {useState, useContext, useEffect} from 'react';
import { Alert, Text, Platform, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StatusBar } from 'react-native';
import styles from '../styles';
import { UserContext } from '../UserContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function RecordContribution({route}){

    useEffect(() => { //verify only console log once when loggeed in
        console.log('Login page');
      }, []);


    const { user, setUser } = useContext(UserContext);
    const {scheme, chosenPlan} = route.params; //get data from previous page

    return (
        <View style={styles.container3}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#03633a', '#95f6cc']} // start to end gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.container, {paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight+50 : StatusBar.currentHeight}]}
                >
                <Text style={styles.text}>
                    Record Your Social{"\n"}Protection Contribution.
                </Text>
                <StatusBar style="auto" />
                <View style={[styles.container2,{marginHorizontal: 15, flex: 0}]}>
                    <Text style={styles.labelInput}>Scheme</Text>
                    <TextInput
                        style={[styles.input, {fontFamily: 'Nunito-Bold', fontColor: '#303030'}]}
                        placeholder="Example : user123@mail.com"
                        value={scheme}
                    />

                    <Text style={styles.labelInput}>Chosen Plan</Text>
                    <TextInput
                        style={[styles.input, {fontFamily: 'Nunito-Bold', fontColor: '#303030'}]}
                        placeholder="Enter your password"
                        value={chosenPlan}
                    />
                    <Text style={styles.labelInput}>Total</Text>
                    
                    {scheme==='i-Saraan KWSP' ? <View
                        style={styles.input}
                        placeholder="Value">

                        </View>
                    :
                    <TextInput
                        style={styles.input}
                        placeholder="Value"
                    />}

                    {scheme==='i-Saraan KWSP' ?
                        <View></View>
                        :
                        <>
                            <Text style={styles.labelInput}>Months Covered</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="How many months you have covered?"
                            />

                            <Text style={styles.labelInput}>Total</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                            />
                        </>
                    }

                    
                    
                    {/* <Button title="Click Me"></Button> */}
                    <TouchableOpacity style={styles.button}>
                        <Text style={{color: '#fdfdfd', fontWeight: 'bold'}}>Submit</Text>
                    </TouchableOpacity>
                </View>
                </LinearGradient>
            </View>
            </TouchableWithoutFeedback>
        </View>
    );
}