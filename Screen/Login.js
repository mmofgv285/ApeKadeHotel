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
import auth from '@react-native-firebase/auth';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';

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
            formValidation:true,
            spinner:false,
        };
    }

    // passwordInputRef = createRef();

    componentDidMount() {
        global.email = "";
        global.password = "";
        if (global.userLoginAuth) {
            this.setState({spinner:false});
            this.props.navigation.replace('HomeScreen');
        }
    }

    onIconPress(){
        this.setState({ secureTextEntry: !secureTextEntry });
        
    }

    storePassword(password){
        this.setState({ userPassword: password });
        global.password = password;
        if (global.password.length != 0 && global.email.length != 0) {
            this.setState({ formValidation: false });
        }else{
            this.setState({ formValidation: true });
        }
    }

    storeEmail(email){
        this.setState({ userEmail: email });
        global.email = email;
        if (global.password.length != 0 && global.email.length != 0) {
            this.setState({ formValidation: false });
        }else{
            this.setState({ formValidation: true });
        }
    }

    signin = (email, password) => {

        let that = this;
        that.setState({spinner:true});
        try {
            auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                global.userLoginAuth = true;
                that.setState({spinner:false});
              that.props.navigation.replace('HomeScreen');
            })
            .catch(error => {
              if (error.code === 'auth/email-already-in-use') {
                that.setState({spinner:false});
                Snackbar.show({
                    text: 'That email address is already in use!',
                    duration: Snackbar.LENGTH_LONG,
                  });
              }
          
              if (error.code === 'auth/invalid-email') {
                that.setState({spinner:false});
                console.log('That email address is invalid!');
                Snackbar.show({
                    text: 'That email address is invalid!',
                    duration: Snackbar.LENGTH_LONG,
                  });
              }

              if (error.code === 'auth/user-not-found') {
                that.setState({spinner:false});
                Snackbar.show({
                    text: 'User not found!',
                    duration: Snackbar.LENGTH_LONG,
                  });
              }
              if (error.code === 'auth/wrong-password') {
                that.setState({spinner:false});
                Snackbar.show({
                    text: 'The Password is wrong',
                    duration: Snackbar.LENGTH_LONG,
                  });
              }
          
              console.error(error);
            });
         
        } catch (error) {
          alert(error);
          console.log(error);
        }
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
        const { userPassword, userEmail, secureTextEntry, formValidation, spinner} = this.state;
        return (
            <View style={this.styles.mainBody}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        flex: 1,
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}>
                        <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                    textStyle={{color:'#ffffff'}}
                    overlayColor="rgba(0, 0, 0, 0.80)"
                    />
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
                                onChangeText={emailAddress => this.storeEmail(emailAddress)}
                            />
                            </Layout>
                            <Text style={{fontSize:16, color:'black', alignSelf:'flex-start', marginLeft:30, marginTop:20}}>Enter Your Password</Text>
                            <Layout>
                            <Input
                                placeholder='********'
                                icon={renderIcon}
                                secureTextEntry={secureTextEntry}
                                onIconPress={() => { this.onIconPress(); }}
                                onChangeText={password => this.storePassword(password)}
                                style={{...this.styles.primaryInputChanges, width:'80%', marginTop:20}}
                                />
                            <Button disabled={formValidation} style={{marginTop:20}} status='primary' onPress={()=>this.signin(userEmail, userPassword)}>LOGIN</Button>
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