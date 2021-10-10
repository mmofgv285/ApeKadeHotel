/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import Login from './Screen/Login';
import HomeScreen from './Screen/HomeScreen';

import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text, IconRegistry } from '@ui-kitten/components';
import { Avatar, Badge, withBadge } from 'react-native-elements';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

const initiate_state = {
  user:null,
  cartCount: 0,
  cartDetails: [],
  currentLocation: {},
  currentAddress: null,
  isCartEmpty: true,
  navigationProperty: null,
  fetchUserLoader: false,
  isOpenOtherAddress:0,
  isOpenCurrentAddress:0,
  hasGlobalNetworkConnection: true,
}

const reducer = (state = initiate_state, action) => {
  switch (action.type) {
    case 'USER_AUTHENTICATE':
      return  {...state,user:action.payload};
    case 'SET_CART_COUNT':
      return { ...state, cartCount: action.payload };
    case 'SET_CART_DETAILS':
      return { ...state, cartDetails: action.payload };
    case 'CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'CURRENT_ADDRESS':
      return { ...state, currentAddress: action.payload };
    case 'SET_IS_CART_EMPTY':
      return { ...state, isCartEmpty: action.payload };
    case 'SET_NAVIGATION_PROPERTY':
      return { ...state, navigationProperty: action.payload };
    case 'SET_USER_LOADER':
      return { ...state, fetchUserLoader: action.payload };
    case 'IS_OPEN_OTHER_ADDRESS':
      return { ...state, isOpenOtherAddress: action.payload };
    case 'IS_OPEN_CURRENT_ADDRESS':
      return { ...state, isOpenCurrentAddress: action.payload };
    case 'SET_GLOBAL_NETWORK_CONNECTION':
      return { ...state, hasGlobalNetworkConnection: action.payload };
    default: {
      return { ...state }
    }
  }
}

const store = createStore(reducer);



// export default () => {
  class App extends React.Component {
  
    componentDidMount(){
      SplashScreen.hide();
    }
  
    render() {
      return (
        // <>
        <Provider store={store}>
          <IconRegistry icons={EvaIconsPack} />
          <ApplicationProvider {...eva} theme={eva.light}>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                  name="Login"
                  component={Login}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="HomeScreen"
                  component={HomeScreen}
                  options={{ headerShown: true, title: 'අපේ කඩේ Hotel',
                  headerStyle: {backgroundColor: '#5dbf13'},
                  headerTitleStyle:{color:'#ffffff'}, }}
                />
                
              </Stack.Navigator>
            </NavigationContainer>
  
          </ApplicationProvider>
        </Provider>
        // </>
      )
    }
  };


export default App;
