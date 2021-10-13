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

class ProfitCalculate extends React.Component {
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

            profitDate:"",
            profitMonth:"",
            totalSalesAmount:"",
            totalSalaryAmount:"",
            otherCosts:"",
            totalProfitAmount:0,

            allDetails:[],

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
        this.getAllDetails();
    }

    getAllDetails(){
        this.setState({spinner:true});
        this.setState({profitDate:""});
        this.setState({profitMonth:""});
        this.setState({totalSalesAmount:""});
        this.setState({totalSalaryAmount:""});
        this.setState({otherCosts:""});
        global.allDetails = [];
        let that = this;
        database()
        .ref('/')
        .once('value')
        .then(snapshot => {
            that.setState({allDetails: snapshot.val()});
            global.allDetails = snapshot.val();
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
        this.setState({spinner:true});
        this.setState({profitDate:date});
        let allSalesAmount = 0;
        let allAttendancePresentEmployee = [];
        let allSalaryAmount = 0;
        let getSelectMonth = new Date(date).getMonth()+1;
        _.forEach(global.allDetails.sales, function (value, key) {
            if (value != null) {
                if ((new Date(value.date).getMonth()+1) == getSelectMonth) {
                    allSalesAmount += parseInt(value.amount);
                }
            }
        });

        _.forEach(global.allDetails.attendance, function (value, key) {
            if (value != null) {
                if ((new Date(value.date).getMonth()+1) == getSelectMonth) {
                    if (value.isPresent == true) {
                        allAttendancePresentEmployee.push({empId:value.empId});
                    }
                }
            }
        });

        _.forEach(allAttendancePresentEmployee, function (value, key) {
            _.forEach(global.allDetails.employee, function (valueSub, keySub) {
                if (valueSub != null) {
                    if (value.empId == valueSub.id) {
                        allSalaryAmount += parseInt(valueSub.salary);
                    }
                }
            });
        });

        console.log(allAttendancePresentEmployee);
        this.setState({totalSalesAmount: allSalesAmount});
        this.setState({totalSalaryAmount: allSalaryAmount});
        this.setState({profitMonth: this.getMonthName(getSelectMonth)});
        this.setState({spinner:false});
    }

    getMonthName(date){
        let monthName = "";
        switch (date) {
            case 1:
                monthName = "January";
                break;

            case 2:
                monthName = "February";
                break;

            case 3:
                monthName = "March";
                break;

            case 4:
                monthName = "April";
                break;

            case 5:
                monthName = "May";
                break;

            case 6:
                monthName = "June";
                break;

            case 7:
                monthName = "July";
                break;

            case 8:
                monthName = "August";
                break;

            case 9:
                monthName = "September";
                break;

            case 10:
                monthName = "October";
                break;

            case 11:
                monthName = "November";
                break;

            case 12:
                monthName = "December";
                break;
            default:
                break;
        }

        return monthName;
    }

    setOtherCosts(costs){
        this.setState({otherCosts: costs});
    }

    calculateProfitDetails(totalSalesAmount,totalSalaryAmount,otherCosts){
        this.setState({spinner:true});
        let totalProfit = 0;
        totalProfit = parseInt(totalSalesAmount) - (parseInt(totalSalaryAmount) + parseInt(otherCosts));
        this.setState({totalProfitAmount: totalProfit});
        this.setState({spinner:false});
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
            profitDate,
            profitMonth,
            totalSalesAmount,
            totalSalaryAmount,
            otherCosts,
            totalProfitAmount,
        } = this.state;

        return (
            <SafeAreaView>
                <ScrollView style={{height:'100%'}}>
                    <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                    textStyle={{color:'#ffffff'}}
                    overlayColor="rgba(0, 0, 0, 0.80)"
                    />
                    <View>
                    <Text style={{alignSelf:'flex-start', marginLeft:15, marginTop:20}}>
                                Select Date for Get a Month
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10, marginTop:10}}
                                    date={profitDate}
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

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:20}}>
                                Sales Amount ~ <Text style={{fontWeight:'bold'}}> Rs.{totalSalesAmount} </Text>
                                </Text>

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:20}}>
                                Salary Amount ~ <Text style={{fontWeight:'bold'}}> Rs.{totalSalaryAmount} </Text>
                                </Text>

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:20}}>
                                Other Costs
                                </Text>
                                <Input
                                    keyboardType='number-pad'
                                    placeholder='Other Cost'
                                    onChangeText={costs => this.setOtherCosts(costs)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                
                                { totalProfitAmount >= 0 ?
                                    <View>
                                    <Text style={{alignSelf:'center', marginLeft:10, marginTop:20, fontSize:20, color:'green'}}>
                                    {profitMonth} Month Total Profit 
                                    </Text>
                                    <Text style={{alignSelf:'center', marginLeft:10, marginTop:5, color:'green', fontSize:30, fontWeight:'bold'}}>
                                    Rs.{totalProfitAmount}
                                    </Text>
                                    </View>
                                    :
                                    <View>
                                    <Text style={{alignSelf:'center', marginLeft:10, marginTop:20, fontSize:20, color:'red'}}>
                                    {profitMonth} Month Loss 
                                    </Text>
                                    <Text style={{alignSelf:'center', marginLeft:10, marginTop:10, fontSize:15, color:'red'}}>
                                    Sorry! Still couldn't archive profit this month
                                    </Text>
                                    <Text style={{alignSelf:'center', marginLeft:10, marginTop:10, color:'red', fontSize:30, fontWeight:'bold'}}>
                                    Rs.{totalProfitAmount}
                                    </Text>
                                    </View>
                                }
                                

                                <Button
                                    icon={
                                        <Icon
                                            name="calculator"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{alignSelf:'center', marginTop: 10, marginLeft:10, marginRight:10, width:"50%" }}
                                    title="Calculate"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: '#47a847', marginTop: 20, }}
                                    onPress={()=>this.calculateProfitDetails(totalSalesAmount,totalSalaryAmount,otherCosts)}
                                />
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

export default connect(mapStateToProps)(ProfitCalculate);