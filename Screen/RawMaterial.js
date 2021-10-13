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

class RawMaterial extends React.Component {
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
        this.getAllRawMaterial();
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

    getAllRawMaterial(){
        this.setState({spinner:true});
        let that = this;
        let arrayMaterial = [];
        let customArrayMaterial = [];
        let totalAvailableQuantity = 0;
        let totalExpQuantity = 0;
        let totalSpentQuantity = 0;
        database()
        .ref('/material')
        .once('value')
        .then(snapshot => {
            
            _.forEach(snapshot.val(), function (value, key) {
               
                if (value != null) {
                    
                    arrayMaterial.push({
                        id: value.id,
                        date: value.date,
                        name: value.name,
                        quantity: value.quantity,
                        unitPrice: value.unitPrice
                    });
                }
            });

            database()
            .ref('/issue_material')
            .once('value')
            .then(snapshot => {

                database()
                .ref('/expired_material')
                .once('value')
                .then(snapshotExp => {
                
                    _.forEach(arrayMaterial, function (value, key) {
                        totalSpentQuantity = 0;
                        totalExpQuantity = 0;
                        _.forEach(snapshot.val(), function (valueSub, keySub) {
                            if (value != null) {
                                if (valueSub != null) {
                                    if (value.id == valueSub.matId) {
                                    totalSpentQuantity += parseInt(valueSub.quantity);
                                    }
                                }
                            }
                        });

                        _.forEach(snapshotExp.val(), function (valueExpSub, keyExpSub) {
                            if (value != null) {
                                if (valueExpSub != null) {
                                    if (value.id == valueExpSub.matId) {
                                    totalExpQuantity += parseInt(valueExpSub.quantity);
                                    }
                                }
                            }
                        });

                        if (value != null) {
                                    customArrayMaterial.push({
                                        id: value.id,
                                        date: value.date,
                                        name: value.name,
                                        quantity: value.quantity,
                                        availableQuantity: parseInt(value.quantity) - (totalSpentQuantity + totalExpQuantity),
                                        spentQuantity: totalSpentQuantity,
                                        expiredQuantity: totalExpQuantity,
                                        unitPrice: value.unitPrice
                                    });
                        }
                       
                    });
                    that.setState({rawMaterials: customArrayMaterial});
                    that.setState({masterRawMaterials: customArrayMaterial});
                    that.setState({spinner: false});
                });
            });

        });
    }

    onIconPress(){
        this.setState({ secureTextEntry: !secureTextEntry });
    }

    saveMaterialDetails(materialDate,materialName,materialQuantity,materialUnitPrice){
        let that = this;
        that.setState({spinner:true});
        let lastIndex = 0;
        database()
        .ref('/material')
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
                .ref('/material/'+(lastIndex+1))
                .set({
                    id: lastIndex+1,
                    date: materialDate,
                    name: materialName,
                    quantity: materialQuantity,
                    unitPrice: materialUnitPrice
                })
                .then(() => this.finishInsertRecord());
            }
        });

    }

    editMaterialDetails(editMaterialID, editMaterialDate, editMaterialName,editMaterialQuantity,editMaterialUnitPrice){
        let that = this;
        that.setState({spinner:true});

        database()
        .ref('/material/'+editMaterialID)
        .set({
            id: editMaterialID,
            date: editMaterialDate,
            name: editMaterialName,
            quantity: editMaterialQuantity,
            unitPrice: editMaterialUnitPrice
        })
        .then(() => this.finishEditRecord());
    }

    finishInsertRecord(){
        this.setState({spinner:false});
        this.RBSheetAddMaterial.close();
        this.getAllRawMaterial();
    }

    finishEditRecord(){
        this.setState({spinner:false});
        this.RBSheetEditMaterial.close();
        this.getAllRawMaterial();
    }

    finishIssueMaterialRecord(){
        this.setState({spinner:false});
        this.RBSheetIssueMaterial.close();
        this.getAllRawMaterial();
    }

    finishExpiredMaterialRecord(){
        this.setState({spinner:false});
        this.RBSheetExpiredMaterial.close();
        this.getAllRawMaterial();
    }

    newMaterialName(name){
        this.setState({materialName: name});
    }

    newMaterialQuantity(quantity){
        this.setState({materialQuantity: quantity});
    }

    newUnitPrice(unitPrice){
        this.setState({materialUnitPrice: unitPrice});
    }

    // Edit Employee

    editMaterialName(name){
        this.setState({editMaterialName: name});
    }

    editMaterialQuantity(quantity){
        this.setState({editMaterialQuantity: quantity});
    }

    editMaterialUnitPrice(unitPrice){
        this.setState({editMaterialUnitPrice: unitPrice});
    }

    openRBSheetAddMaterial(){
        this.setState({materialQuantity: ""});
        this.setState({materialName: ""});
        this.setState({materialUnitPrice: ""});

        this.RBSheetAddMaterial.open();
    }

    openEditMaterial(materialDetails){
        this.setState({editMaterialID: materialDetails.id});
        this.setState({editMaterialDate: materialDetails.date});
        this.setState({editMaterialQuantity: materialDetails.quantity});
        this.setState({editMaterialName: materialDetails.name});
        this.setState({editMaterialUnitPrice: materialDetails.unitPrice});
        this.RBSheetEditMaterial.open();
    }

    openIssueMaterial(materialDetails){
        this.setState({overQuantityIssue: false});
        this.setState({selectMatIdForIssue: materialDetails.id});
        this.setState({selectMatAvailableQuantity: materialDetails.availableQuantity});
        this.setState({issueDate: ""});
        this.setState({issueQuantity: ""});
        this.RBSheetIssueMaterial.open();
    }

    setChangeDate(date){
        this.setState({materialDate:date});
    }

    setEditChangeDate(date){
        this.setState({editMaterialDate:date});
    }

    setIssueChangeDate(date){
        this.setState({issueDate: date});
    }

    issueMaterialQuantity(quantity, availableQuantity){
        if (availableQuantity >= quantity) {
            this.setState({overQuantityIssue: false});
        }else{
            this.setState({overQuantityIssue: true});
        }
        this.setState({issueQuantity: quantity});
    }

    expiredMaterialQuantity(quantity, availableQuantity){
        if (availableQuantity >= quantity) {
            this.setState({overQuantityIssue: false});
        }else{
            this.setState({overQuantityIssue: true});
        }
        this.setState({expMatQuantity: quantity});
    }

    checkPresentEmployee(flag){
        this.setState({presentCheck: !flag});
        this.setState({absentCheck: flag});
    }

    checkAbsentEmployee(flag){
        this.setState({absentCheck: !flag});
        this.setState({presentCheck: flag});
    }

    issueMaterials(selectMatIdForIssue, issueDate,issueQuantity){
        let that = this;
        that.setState({spinner:true});
        let lastIndex = 0;
        database()
        .ref('/issue_material')
        .once('value')
        .then(snapshot => {
            if (snapshot.val() == null) {
                lastIndex = 1;
            }
            console.log('User data: ', snapshot.val());
            _.forEach(snapshot.val(), function (value, key) {
                lastIndex = parseInt(key);
                
            });

            if (lastIndex > 0) {
                database()
                .ref('/issue_material/'+(lastIndex+1))
                .set({
                    id: lastIndex+1,
                    matId: selectMatIdForIssue,
                    issueDate: issueDate,
                    quantity: issueQuantity
                })
                .then(() => this.finishIssueMaterialRecord());
            }
        });
    }

    expiredMaterials(expMatId, expMatQuantity){
        let that = this;
        that.setState({spinner:true});
        let lastIndex = 0;
        database()
        .ref('/expired_material')
        .once('value')
        .then(snapshot => {
            if (snapshot.val() == null) {
                lastIndex = 1;
            }
            console.log('User data: ', snapshot.val());
            _.forEach(snapshot.val(), function (value, key) {
                lastIndex = parseInt(key);
                
            });

            if (lastIndex > 0) {
                database()
                .ref('/expired_material/'+(lastIndex+1))
                .set({
                    id: lastIndex+1,
                    matId: expMatId,
                    quantity: expMatQuantity
                })
                .then(() => this.finishExpiredMaterialRecord());
            }
        });
    }

    openExpiredStock(materialDetails){
        this.setState({overQuantityIssue: false});
        this.setState({expMatId: materialDetails.id});
        this.setState({expMatQuantity: ""});
        this.setState({selectMatAvailableQuantity: materialDetails.availableQuantity});
        this.RBSheetExpiredMaterial.open();
    }

    setChangeSalaryDate(date){
        this.setState({salaryDate:date});
    }

    calMonthlySalary(date, empId){
        let that = this;
        that.setState({spinner: true});
        let arrayAttendance = [];
        let totalSalary = 0;
        let selectEmployeeSalary = 0;
// Get a employee details
        database()
        .ref('/employee/'+empId)
        .once('value')
        .then(snapshot => {
                
                selectEmployeeSalary = parseInt(snapshot.val().salary);
                console.log("USERRRR",selectEmployeeSalary);
        });

// calculate the monthly salary of employee
        database()
        .ref('/attendance')
        .once('value')
        .then(snapshot => {
        let getSelectMonth = new Date(date).getMonth()+1;
            _.forEach(snapshot.val(), function (value, key) {
               
                if (value != null) {
                    let getDate = new Date(value.date);
                    arrayAttendance.push({
                        id: value.id,
                        empId: value.empId,
                        date: value.date,
                        month: getDate.getMonth() + 1,
                        isAbsent: value.isAbsent,
                        isPresent: value.isPresent
                    });
                }
            });

            _.forEach(arrayAttendance, function (valueAttendance, key) {
               
                if (valueAttendance.month == getSelectMonth && valueAttendance.empId == empId) {
                    if (valueAttendance.isPresent == true) {
                        totalSalary += selectEmployeeSalary;
                    }
                }
            });

            that.setState({employeeSalaryIs: totalSalary});
            that.setState({spinner: false});

        });

        
    }

    openDeleteMaterial(materialDetails){
        this.setState({selectDeleteMatId: materialDetails.id});
        this.RBSheetDeleteMaterial.open();
    }

    deleteMaterial(matId){
        let that = this;
        that.setState({spinner: true});
        database().ref('/material/'+matId).remove().then(snapshot => {
            that.setState({spinner: false});
            that.RBSheetDeleteMaterial.close();
            that.getAllRawMaterial();
    });
    }

    changeSearchName(text) {
        console.log(text);
    }

    searchFilterFunction(searchMaterialId) {
        let that = this;
        that.setState({ rawMaterials: that.state.masterRawMaterials });
        
        var filterMaterials = _.filter(that.state.rawMaterials, { 'id': searchMaterialId });

        return that.setState({ rawMaterials: filterMaterials });
    }

    viewAllMaterials(){
        this.getAllRawMaterial();
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
            
            selectDeleteMatId,
        
            materialDate,
            materialName,
            materialQuantity,
            materialUnitPrice,

            masterRawMaterials,
            rawMaterials,

            editMaterialID,
            editMaterialDate,
            editMaterialUnitPrice,
            editMaterialName,
            editMaterialQuantity,

            issueQuantity,
            issueDate,
            selectMatIdForIssue,
            selectMatAvailableQuantity,
            overQuantityIssue,

            expMatId,
            expMatQuantity,

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
                        items={masterRawMaterials}
                        placeholder="Search Raw Materials"
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
                            rawMaterials.map((item, index) => (
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
                                <Text category='h6' style={{marginLeft:30, marginRight:60}}>Material Name - {item.name}</Text>
                                <Button
                                            icon={
                                                <Icon
                                                    name="user-edit"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:25 }}
                                            title="Edit"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#47a847' }}
                                            onPress={()=>this.openEditMaterial(item)}
                                        />
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
                                        Date
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.date}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                       Before Quantity
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.quantity} Kg
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                       Available Quantity
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.availableQuantity} Kg
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Total Spent Quantity
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.spentQuantity} Kg
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6' style={{color:'red'}}>
                                        Total Expired Quantity
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.expiredQuantity} Kg
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Unit Price
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        Rs.{item.unitPrice}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Total Price
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        Rs.{parseFloat(item.unitPrice) * parseFloat(item.quantity)}
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
                                                    name="hand-holding-medical"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="Issue"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#c9ad1c' }}
                                            onPress={()=>this.openIssueMaterial(item)}
                                        />

                                        <Button
                                            icon={
                                                <Icon
                                                    name="calendar-minus"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="Expired Stock"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#871cc9' }}
                                            onPress={()=>this.openExpiredStock(item)}
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
                                            onPress={()=>this.openDeleteMaterial(item)}
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
                                            title="View All Materials"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#871cc9' }}
                                            onPress={()=>this.viewAllMaterials()}
                                        />
                    {/* Add New Raw Material - START */}
                    <RBSheet
                                ref={ref => {
                                    this.RBSheetAddMaterial = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Add New Raw Material</Text>
                                
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Select Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10}}
                                    date={materialDate}
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
                                Material Name
                                </Text>
                                <Input
                                    placeholder='Material Name'
                                    onChangeText={name => this.newMaterialName(name)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Quantity from (Kg)
                                </Text>
                                <Input
                                    placeholder='Stock'
                                    onChangeText={quantity => this.newMaterialQuantity(quantity)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Unit Price (Rs.)
                                </Text>
                                <Input
                                    placeholder='Unit Price'
                                    onChangeText={unitPrice => this.newUnitPrice(unitPrice)}
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
                                    onPress={()=>this.saveMaterialDetails(materialDate,materialName,materialQuantity,materialUnitPrice)}
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
                                    onPress={()=>this.RBSheetAddMaterial.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Add New Raw Material - END */}

                            {/* Edit Raw Material - START */}
                                <RBSheet
                                ref={ref => {
                                    this.RBSheetEditMaterial = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Edit Employee</Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10}}
                                    date={editMaterialDate}
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
                                Material Name
                                </Text>
                                <Input
                                    value = {editMaterialName}
                                    placeholder='Name'
                                    onChangeText={name => this.editMaterialName(name)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Quantity From (Kg)
                                </Text>
                                <Input
                                    value = {editMaterialQuantity}
                                    placeholder='Quantity'
                                    onChangeText={quantity => this.editMaterialQuantity(quantity)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Unit Price (Rs.)
                                </Text>
                                <Input
                                    value = {editMaterialUnitPrice}
                                    placeholder='Unit Price'
                                    onChangeText={unitPrice => this.editMaterialUnitPrice(unitPrice)}
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
                                    onPress={()=>this.editMaterialDetails(editMaterialID, editMaterialDate, editMaterialName,editMaterialQuantity,editMaterialUnitPrice)}
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
                                    onPress={()=>this.RBSheetEditMaterial.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Edit Raw Material - END */}

                            {/* Issue Material - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetIssueMaterial = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Issue Material</Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Select Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10}}
                                    date={issueDate}
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
                                    onDateChange={date => this.setIssueChangeDate(date)}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:10, color:'green', fontWeight:'bold'}}>
                                Available Quantity {selectMatAvailableQuantity} Kg
                                </Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Issue Quantity from (Kg)
                                </Text>
                                <Input
                                    placeholder='Issue Quantity'
                                    onChangeText={quantity => this.issueMaterialQuantity(quantity, selectMatAvailableQuantity)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />
                                {
                                    overQuantityIssue ?
                                    <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:10, color:'red', fontWeight:'bold'}}>
                                    Warning! You can't issue quantity over available quantity.
                                    </Text>
                                    : null
                                }

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
                                    onPress={()=>this.issueMaterials(selectMatIdForIssue, issueDate,issueQuantity)}
                                    disabled={overQuantityIssue}
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
                                    onPress={()=>this.RBSheetIssueMaterial.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Issue Material - END */}

                            {/* Expired Material - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetExpiredMaterial = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Expired Material</Text>
                                

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:10, color:'green', fontWeight:'bold'}}>
                                Available Quantity {selectMatAvailableQuantity} Kg
                                </Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Expired Quantity from (Kg)
                                </Text>
                                <Input
                                    placeholder='Expired Quantity'
                                    onChangeText={quantity => this.expiredMaterialQuantity(quantity, selectMatAvailableQuantity)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />
                                {
                                    overQuantityIssue ?
                                    <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:10, color:'red', fontWeight:'bold'}}>
                                    Warning! You enter quantity is over than available quantity.
                                    </Text>
                                    : null
                                }

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
                                    onPress={()=>this.expiredMaterials(expMatId, expMatQuantity)}
                                    disabled={overQuantityIssue}
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
                                    onPress={()=>this.RBSheetExpiredMaterial.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Expired Material - END */}


                            {/* Delete Material - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetDeleteMaterial = ref;
                                }}
                                height={280}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Delete Material</Text>
                                
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:30}}>
                                Are You Sure Do you want to delete this material ?
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
                                    onPress={()=>this.deleteMaterial(selectDeleteMatId)}
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
                                    onPress={()=>this.RBSheetDeleteMaterial.close()}
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
                            onPress={()=>this.openRBSheetAddMaterial()}
                        >
                            <Icon name="plus-circle" size={25} color="white" />
                            
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

export default connect(mapStateToProps)(RawMaterial);