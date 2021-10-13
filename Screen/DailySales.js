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
    FlatList,
} from 'react-native';

import axios from 'axios';

import AsyncStorage from '@react-native-community/async-storage';
// import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { SocialIcon, Badge, Button, CheckBox  } from 'react-native-elements';
import { ApplicationProvider, Layout, Input, Card,Text, IconRegistry } from '@ui-kitten/components';
import { connect } from 'react-redux';
import { Title } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RBSheet from "react-native-raw-bottom-sheet";
import database from '@react-native-firebase/database';
import Spinner from 'react-native-loading-spinner-overlay';
import DatePicker from 'react-native-datepicker';
import SearchableDropdown from 'react-native-searchable-dropdown';
import _ from 'lodash';
import { color } from 'react-native-elements/dist/helpers';

const passwordInputRef = createRef();

class DailySales extends React.Component {
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
            spinner:false,

            // Add Raw material
            materialDate:"2021-12-05",
            materialName:"",
            materialQuantity:"",
            materialUnitPrice:"",

            // Add salse
            salesDate:"",
            salesName:"",
            salesAmount:"",

            masterSales:[],
            sales:[],

            editSalesAmount:"",
            editSalesName:"",
            editSalesDate:"",
            editSalesID:"",

            selectDeleteSalesId:"",


            // Edit Raw Material
            editMaterialID:"",
            editMaterialUnitPrice:"",
            editMaterialName:"",
            editMaterialQuantity:"",
            editMaterialDate:"",

            attendanceName:"",
            attendanceEmpID:"",
            attendanceDate:"",

            // issue MAterial
            selectMatIdForIssue:"",
            selectMatAvailableQuantity:0,
            overQuantityIssue:false,
            issueDate:"",
            issueQuantity:"",

            employees:[],
            masterEmployee:[],

            // Raw Material Array
            rawMaterials:[],
            masterRawMaterials:[],

            // expiry material
            expMatQuantity:"",
            expMatId:"",

            editEmployee:{},
            date:"2021-12-05",

            empNameForSalary:"",
            empIdForSalary:"",
            salaryDate:"2021-12-05",
            employeeSalaryIs: 0,

            selectDeleteMatId:"",
        };
    }

    // passwordInputRef = createRef();

    componentDidMount() {
        this.getAllEmployees();
        this.getAllSales();
    }

    // remove
    getAllEmployees(){
        this.setState({spinner:true});
        let that = this;
        let arrayEmployees = [];
        database()
        .ref('/employee')
        .once('value')
        .then(snapshot => {
            
            _.forEach(snapshot.val(), function (value, key) {
               
                if (value != null) {
                    
                    arrayEmployees.push({
                        id: value.id,
                        name: value.name,
                        address: value.address,
                        mobile: value.mobile,
                        salary: value.salary,
                        shift: value.shift
                    });
                }
            });
            that.setState({employees: arrayEmployees});
            that.setState({masterEmployee:arrayEmployees });
            that.setState({spinner: false});
        });
    }

    getAllSales(){
        this.setState({spinner:true});
        let that = this;
        let arraySales = [];
        database()
        .ref('/sales')
        .once('value')
        .then(snapshot => {
            
            _.forEach(snapshot.val(), function (value, key) {
               
                if (value != null) {
                    
                    arraySales.push({
                        id: value.id,
                        date: value.date,
                        name: value.name,
                        amount: value.amount
                    });
                }
            });
            that.setState({sales: arraySales});
            that.setState({masterSales:arraySales });
            that.setState({spinner: false});
        });
    }

    onIconPress(){
        this.setState({ secureTextEntry: !secureTextEntry });
    }

    saveSalesDetails(salesDate,salesName,salesAmount){
        let that = this;
        that.setState({spinner:true});
        let lastIndex = 0;
        database()
        .ref('/sales')
        .once('value')
        .then(snapshot => {
            if (snapshot.val() == null) {
                lastIndex = 1;
            }
            _.forEach(snapshot.val(), function (value, key) {
                console.log("user index", key);
                lastIndex = parseInt(key);
                
            });

            if (lastIndex > 0) {
                database()
                .ref('/sales/'+(lastIndex+1))
                .set({
                    id: lastIndex+1,
                    date: salesDate,
                    name: salesName,
                    amount: salesAmount
                })
                .then(() => this.finishInsertRecord());
            }
        });

    }

    editSalesDetails(editSalesID, editSalesName, editSalesDate,editSalesAmount){
        let that = this;
        that.setState({spinner:true});

        database()
        .ref('/sales/'+editSalesID)
        .set({
            id: editSalesID,
            date: editSalesDate,
            name: editSalesName,
            amount: editSalesAmount
        })
        .then(() => this.finishEditRecord());
    }

    finishInsertRecord(){
        this.setState({spinner:false});
        this.RBSheetAddSales.close();
        this.getAllSales();
    }

    finishEditRecord(){
        this.setState({spinner:false});
        this.RBSheetEditSales.close();
        this.getAllSales();
    }

    finishIssueMaterialRecord(){
        this.setState({spinner:false});
        this.RBSheetIssueMaterial.close();
        this.getAllSales();
    }

    finishExpiredMaterialRecord(){
        this.setState({spinner:false});
        this.RBSheetExpiredMaterial.close();
        this.getAllSales();
    }

    newSalesName(name){
        this.setState({salesName: name});
    }

    newSalesAmount(amount){
        this.setState({salesAmount: amount});
    }

    // Edit Employee

    editSalesName(name){
        this.setState({editSalesName: name});
    }

    editSalesAmount(amount){
        this.setState({editSalesAmount: amount});
    }

    editMaterialUnitPrice(unitPrice){
        this.setState({editMaterialUnitPrice: unitPrice});
    }

    openRBSheetAddSales(){
        this.setState({salesDate: ""});
        this.setState({salesName: ""});
        this.setState({salesAmount: ""});

        this.RBSheetAddSales.open();
    }

    openEditSales(salesDetails){
        this.setState({editSalesID: salesDetails.id});
        this.setState({editSalesDate: salesDetails.date});
        this.setState({editSalesName: salesDetails.name});
        this.setState({editSalesAmount: salesDetails.amount});
        this.RBSheetEditSales.open();
    }

    setChangeDate(date){
        this.setState({salesDate:date});
    }

    setEditChangeDate(date){
        this.setState({editSalesDate:date});
    }

    setIssueChangeDate(date){
        this.setState({issueDate: date});
    }

    checkPresentEmployee(flag){
        this.setState({presentCheck: !flag});
        this.setState({absentCheck: flag});
    }

    checkAbsentEmployee(flag){
        this.setState({absentCheck: !flag});
        this.setState({presentCheck: flag});
    }

    setChangeSalaryDate(date){
        this.setState({salaryDate:date});
    }

    openDeleteSales(salesDetails){
        this.setState({selectDeleteSalesId: salesDetails.id});
        this.RBSheetDeleteSales.open();
    }

    deleteSales(salesId){
        let that = this;
        that.setState({spinner: true});
        database().ref('/sales/'+salesId).remove().then(snapshot => {
            that.setState({spinner: false});
            that.RBSheetDeleteSales.close();
            that.getAllSales();
    });
    }

    changeSearchName(text) {
        console.log(text);
    }

    searchFilterFunction(searchSalesId) {
        let that = this;
        that.setState({ sales: that.state.masterSales });
        
        var filterSales = _.filter(that.state.sales, { 'id': searchSalesId });

        return that.setState({ sales: filterSales });
    }

    viewAllSales(){
        this.getAllSales();
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
        const { 
            spinner,
            
            salesAmount,
            salesName,
            salesDate,

            sales,
            masterSales,

            editSalesAmount,
            editSalesName,
            editSalesDate,
            editSalesID,

            selectDeleteSalesId,

        } = this.state;

        return (
            <SafeAreaView>
                <SearchableDropdown
                        onTextChange={text => this.changeSearchName(text)}
                        onItemSelect={item => this.searchFilterFunction(item.id)}
                        containerStyle={{ padding: 5 }}
                        textInputStyle={{
                            padding: 6,
                            borderWidth: 2,
                            borderColor: '#ccc',
                            borderRadius: 5,
                        }}
                        itemStyle={{
                            padding: 10,
                            marginTop: 2,
                            backgroundColor: '#ddd',
                            borderColor: '#bbb',
                            borderWidth: 1,
                            borderRadius: 5,
                        }}
                        itemTextStyle={{ color: '#222' }}
                        itemsContainerStyle={{ maxHeight: 180 }}
                        items={masterSales}
                        placeholder="Search Sales"
                        resetValue={false}
                        underlineColorAndroid="transparent"
                    />
                <ScrollView style={{height:'100%'}}>
                    <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                    textStyle={{color:'#ffffff'}}
                    overlayColor="rgba(0, 0, 0, 0.80)"
                    />
                    <View>
                    
                    {
                            sales.map((item, index) => (
                            <Card style={{
                                borderRadius:20, 
                                backgroundColor:'#33ccff',
                                 marginTop:10, 
                                 marginLeft:10,
                                 marginRight:10,
                                 marginBottom:5}}
                                header={()=>
                                    <View style={{
                                        flex:1,
                                        flexDirection:'row',
                                        alignContent:'center',
                                        justifyContent:'space-around',
                                    }}>
                                <Text category='h6' style={{marginLeft:30, marginRight:60}}>Sales Date - {item.date}</Text>
                                
                                </View>
                                }
                                 >

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Description
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.name}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                       Amount
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        Rs.{item.amount}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-evenly',
                                     }}>

                                        <Button
                                            icon={
                                                <Icon
                                                    name="user-edit"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5 }}
                                            title="Edit"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#47a847' }}
                                            onPress={()=>this.openEditSales(item)}
                                        />


                                        <Button
                                            icon={
                                                <Icon
                                                    name="trash-alt"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="Delete"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#cf0007' }}
                                            onPress={()=>this.openDeleteSales(item)}
                                        />
                                        
                                     </View>
                                
                            </Card>
                             ))
                    }

                                    <Button
                                            icon={
                                                <Icon
                                                    name="scroll"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="View All Sales"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#871cc9' }}
                                            onPress={()=>this.viewAllSales()}
                                        />
                    {/* Add New Sales - START */}
                    <RBSheet
                                ref={ref => {
                                    this.RBSheetAddSales = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Add New Sales</Text>
                                
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Select Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10}}
                                    date={salesDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="YYYY-MM-DD"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0
                                    },
                                    dateInput: {
                                        marginLeft: 36
                                    }
                                    // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={date => this.setChangeDate(date)}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Sales Name
                                </Text>
                                <Input
                                    placeholder='Sales Name'
                                    onChangeText={name => this.newSalesName(name)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Sales Amount (Rs)
                                </Text>
                                <Input
                                    placeholder='Sales Amount (Rs)'
                                    onChangeText={unitPrice => this.newSalesAmount(unitPrice)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 10,
                                }}>
                                <Button
                                    icon={
                                        <Icon
                                            name="save"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="Save"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: '#47a847' }}
                                    onPress={()=>this.saveSalesDetails(salesDate,salesName,salesAmount)}
                                />

                                <Button
                                    icon={
                                        <Icon
                                            name="window-close"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="Close"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: 'red' }}
                                    onPress={()=>this.RBSheetAddSales.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Add New Sales - END */}

                            {/* Edit Sales - START */}
                                <RBSheet
                                ref={ref => {
                                    this.RBSheetEditSales = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Edit Sales</Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10}}
                                    date={editSalesDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="YYYY-MM-DD"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0
                                    },
                                    dateInput: {
                                        marginLeft: 36
                                    }
                                    // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={date => this.setEditChangeDate(date)}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Sales Name
                                </Text>
                                <Input
                                    value = {editSalesName}
                                    placeholder='Sales Name'
                                    onChangeText={name => this.editSalesName(name)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Amount
                                </Text>
                                <Input
                                    value = {editSalesAmount}
                                    placeholder='Amount'
                                    onChangeText={amount => this.editSalesAmount(amount)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 10,
                                }}>
                                <Button
                                    icon={
                                        <Icon
                                            name="save"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="Save"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: '#47a847' }}
                                    onPress={()=>this.editSalesDetails(editSalesID, editSalesName, editSalesDate,editSalesAmount)}
                                />

                                <Button
                                    icon={
                                        <Icon
                                            name="window-close"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="Close"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: 'red' }}
                                    onPress={()=>this.RBSheetEditSales.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Edit Sales - END */}


                            {/* Delete Material - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetDeleteSales = ref;
                                }}
                                height={280}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Delete Sales</Text>
                                
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:30}}>
                                Are You Sure Do you want to delete this sales ?
                                </Text>
                                

                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 10,
                                }}>
                                <Button
                                    icon={
                                        <Icon
                                            name="check-double"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="Yes"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: '#47a847' }}
                                    onPress={()=>this.deleteSales(selectDeleteSalesId)}
                                />

                                <Button
                                    icon={
                                        <Icon
                                            name="window-close"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="No"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: 'red' }}
                                    onPress={()=>this.RBSheetDeleteSales.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Delete Material - END */}
                            
                    </View>
                </ScrollView>
                 <View style={{ flex: 1 }}>                    
                <View style={{ position: 'absolute', bottom: 60, alignSelf: 'flex-end' , padding: 10 }}>
                        <TouchableOpacity
                            style={{
                                borderWidth: 4,
                                borderColor: 'rgba(0,0,0,0.2)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 70,
                                position: 'absolute',
                                bottom: 10,
                                right: 10,
                                height: 70,
                                backgroundColor: '#1b5e20',
                                borderRadius: 100
                            }}
                            onPress={()=>this.openRBSheetAddSales()}
                        >
                            <Icon name="cash-register" size={25} color="white" />
                            
                        </TouchableOpacity>
                    {/* <Button
                        style={{ borderRadius: 50 }}
                        title="Cart"
                        color="#0b2e1a"
                        accessibilityLabel="Cart" /> */}
                </View>
                </View>
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

export default connect(mapStateToProps)(DailySales);