import React, { createRef } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Text,
    ScrollView,
    Image,
    Keyboard,
    TouchableOpacity,
    KeyboardAvoidingView,
} from 'react-native';

import axios from 'axios';

import AsyncStorage from '@react-native-community/async-storage';
// import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { SocialIcon } from 'react-native-elements';
import { ApplicationProvider, Layout, Input, Icon, Button, IconRegistry } from '@ui-kitten/components';
import { connect } from 'react-redux';

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
            <View style={this.styles.mainBody}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        flex: 1,
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}>
                    <View>
                        <KeyboardAvoidingView enabled>
                            <View style={{ alignItems: 'center' }}>
                            <Image
                            source={require('../Image/login-admin.jpg')}
                            style={{ width: '20%', height: '30%', alignSelf: "center", marginTop: 10 }} />
                            <Text style={{fontSize:20, color:'black', fontWeight:'bold'}}>Admin Login</Text>
                            <Text style={{fontSize:16, color:'black', alignSelf:'flex-start', marginLeft:30, marginTop:20}}>Enter Your Username</Text>
                            <Layout>
                            <Input
                                style={{...this.styles.primaryInputChanges, width:'80%', marginTop:20}}
                                status='primary'
                            />
                            </Layout>
                            <Text style={{fontSize:16, color:'black', alignSelf:'flex-start', marginLeft:30, marginTop:20}}>Enter Your Password</Text>
                            <Layout>
                            <Input
                                placeholder='********'
                                icon={renderIcon}
                                secureTextEntry={secureTextEntry}
                                onIconPress={() => { this.onIconPress(); }}
                                style={{...this.styles.primaryInputChanges, width:'80%', marginTop:20}}
                                />
                            <Button style={{marginTop:20}} status='primary' onPress={()=>this.props.navigation.navigate('HomeScreen')}>LOGIN</Button>
                            </Layout>
                            </View>

                            
                        </KeyboardAvoidingView>
                    </View>
                </ScrollView>
            </View>
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