import React, { createRef } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    ScrollView,
    Image,
    Keyboard,
    TouchableOpacity,
    KeyboardAvoidingView,
    SafeAreaView,
} from 'react-native';

import axios from 'axios';

import AsyncStorage from '@react-native-community/async-storage';
// import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { SocialIcon } from 'react-native-elements';
import { ApplicationProvider, Layout, Input, Icon, Card,Text, Button, IconRegistry } from '@ui-kitten/components';
import { connect } from 'react-redux';
import { Title } from 'native-base';

const passwordInputRef = createRef();
const renderIcon = (style) => (
    <Icon name={secureTextEntry ? 'eye-off' : 'eye'}/>
  );

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            userEmail: '',
            userPassword: '',
            loadingModal: false,
            errortext: '',
            isSigninInProgress: false,
            googleLoginLoading: false,
            facebookLoginLoading: false,
            secureTextEntry:true,
        };
    }

    // passwordInputRef = createRef();

    componentDidMount() {

    }

    onIconPress(){
        this.setState({ secureTextEntry: !secureTextEntry });
    }

    styles = StyleSheet.create({
        mainBody: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            alignContent: 'center',
        },
        SectionStyle: {
            flexDirection: 'row',
            height: 40,
            marginTop: 20,
            marginLeft: 35,
            marginRight: 35,
            margin: 10,
        },
        buttonStyle: {
            backgroundColor: '#47a847',
            borderWidth: 0,
            color: '#FFFFFF',
            borderColor: '#47a847',
            height: 40,
            alignItems: 'center',
            borderRadius: 30,
            marginLeft: 35,
            marginRight: 35,
            marginTop: 20,
            marginBottom: 25,
        },
        buttonTextStyle: {
            color: '#FFFFFF',
            paddingVertical: 10,
            fontSize: 16,
        },
        inputStyle: {
            flex: 1,
            color: '#000000',
            paddingLeft: 15,
            paddingRight: 15,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: '#000000',
        },
        registerTextStyle: {
            color: '#000000',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 14,
            alignSelf: 'center',
            padding: 10,
            marginTop: 20
        },
        errorTextStyle: {
            color: 'red',
            textAlign: 'center',
            fontSize: 14,
            marginBottom: 20
        },
        controlContainer: {
            borderRadius: 4,
            margin: 8,
            backgroundColor: '#3366FF',
          },
    })
    

    render() {
        const { userPassword, userEmail, secureTextEntry} = this.state;

        return (
            <SafeAreaView>
                <ScrollView>
                    <View>
                            <Card style={{
                                borderRadius:20, 
                                backgroundColor:'#33ccff',
                                 marginTop:10, 
                                 marginLeft:10,
                                 marginRight:10,
                                 marginBottom:5}}
                                
                                 >
                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-around',
                                     }}>
                                        <Text category='h5' style={{margin:30, padding:20}}>
                                        Employee Management
                                        </Text>
                                        <Image
                            source={require('../Image/employee-management.png')}
                            style={{ width: '60%', height: '80%', alignSelf: "center", marginLeft:30, marginRight:15, padding:20 }} />
                                     </View>
                                
                            </Card>

                            <Card style={{
                                borderRadius:20, 
                                backgroundColor:'#66d9ff',
                                 marginTop:5, 
                                 marginLeft:10,
                                 marginRight:10,
                                 marginBottom:5}}
                                
                                 >
                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-around',
                                     }}>
                                        <Text category='h5' style={{margin:30, padding:20}}>
                                        Raw Material Stock Management
                                        </Text>
                                        <Image
                            source={require('../Image/raw-material.png')}
                            style={{ width: '60%', height: '80%', alignSelf: "center",  padding:20, marginLeft:30, marginRight:15 }} />
                                     </View>
                                
                            </Card>

                            <Card style={{
                                borderRadius:20, 
                                backgroundColor:'#99e6ff',
                                 marginTop:5, 
                                 marginLeft:10,
                                 marginRight:10,
                                 marginBottom:5}}
                                
                                 >
                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-around',
                                     }}>
                                        <Text category='h5' style={{margin:30, padding:20}}>
                                        Profit Report
                                        </Text>
                                        <Image
                            source={require('../Image/profit-report.png')}
                            style={{ width: '50%', height: '80%', alignSelf: "center",  padding:20, marginLeft:30, marginRight:15 }} />
                                     </View>
                                
                            </Card>
                            
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

}

//*********************************Mutation Function***********************************************
function mapStateToProps(state) {
    // console.log('--------------Returning state Login App-------------');
    // console.log(state);
    return {
        fetchUserLoader: state.fetchUserLoader
    }
}

export default connect(mapStateToProps)(Login);