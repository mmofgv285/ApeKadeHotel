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

const passwordInputRef = createRef();

class Employee extends React.Component {
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

            employeeName:"",
            employeeAddress:"",
            employeeMobile:"",
            salaryPerDay:"",
            shiftTime:"",

            editEmployeeName:"",
            editEmployeeAddress:"",
            editEmployeeMobile:"",
            editSalaryPerDay:"",
            editShiftTime:"",

            attendanceName:"",
            attendanceEmpID:"",
            attendanceDate:"",

            employees:[],
            masterEmployee:[],
            editEmployee:{},
            date:"2021-12-05",

            absentCheck:false,
            presentCheck:false,

            empNameForSalary:"",
            empIdForSalary:"",
            salaryDate:"2021-12-05",
            employeeSalaryIs: 0,

            selectDeleteEmpId:"",
        };
    }

    // passwordInputRef = createRef();

    componentDidMount() {
        this.getAllEmployees();
    }

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

    onIconPress(){
        this.setState({ secureTextEntry: !secureTextEntry });
    }

    saveEmployeeDetails(name, address, mobile, salary, shift){
        let that = this;
        that.setState({spinner:true});
        let lastIndex = 0;
        database()
        .ref('/employee')
        .once('value')
        .then(snapshot => {
            if (snapshot.val() == null) {
                lastIndex = 1;
            }
            console.log('User data: ', snapshot.val());
            _.forEach(snapshot.val(), function (value, key) {
                console.log("user index", key);
                lastIndex = parseInt(key);
                
            });

            if (lastIndex > 0) {
                database()
                .ref('/employee/'+(lastIndex+1))
                .set({
                    id: lastIndex+1,
                    name: name,
                    address: address,
                    mobile: mobile,
                    salary: salary,
                    shift: shift
                })
                .then(() => this.finishInsertRecord());
            }
        });

    }

    editEmployeeDetails(employee, name, address, mobile, salary, shift){
        let that = this;
        that.setState({spinner:true});

        database()
        .ref('/employee/'+employee.id)
        .set({
            id: employee.id,
            name: name,
            address: address,
            mobile: mobile,
            salary: salary,
            shift: shift
        })
        .then(() => this.finishEditRecord());
    }

    finishInsertRecord(){
        this.setState({spinner:false});
        this.RBSheetAddNewEmployee.close();
        this.getAllEmployees();
    }

    finishEditRecord(){
        this.setState({spinner:false});
        this.RBSheetEditEmployee.close();
        this.getAllEmployees();
    }

    finishAddAttendanceRecord(){
        this.setState({spinner:false});
        this.RBSheetAttendanceEmployee.close();
        this.getAllEmployees();
    }

    newEmployeeName(name){
        this.setState({employeeName: name});
    }

    newEmployeeAddress(address){
        this.setState({employeeAddress: address});
    }

    newEmployeeMobile(mobile){
        this.setState({employeeMobile: mobile});
    }

    newEmployeeSalary(salary){
        this.setState({salaryPerDay: salary});
    }

    newEmployeeShift(shift){
        this.setState({shiftTime: shift});
    }

    // Edit Employee

    editEmployeeName(name){
        this.setState({editEmployeeName: name});
    }

    editEmployeeAddress(address){
        this.setState({editEmployeeAddress: address});
    }

    editEmployeeMobile(mobile){
        this.setState({editEmployeeMobile: mobile});
    }

    editEmployeeSalary(salary){
        this.setState({editSalaryPerDay: salary});
    }

    editEmployeeShift(shift){
        this.setState({editShiftTime: shift});
    }

    openRBSheetAddEmployee(){
        this.setState({employeeName: ""});
        this.setState({employeeAddress: ""});
        this.setState({employeeMobile: ""});
        this.setState({salaryPerDay: ""});
        this.setState({shiftTime: ""});

        this.RBSheetAddNewEmployee.open();
    }

    openEditEmployee(employeeDetails){
        this.setState({editEmployee: employeeDetails});
        this.setState({editEmployeeName: employeeDetails.name});
        this.setState({editEmployeeAddress: employeeDetails.address});
        this.setState({editEmployeeMobile: employeeDetails.mobile});
        this.setState({editSalaryPerDay: employeeDetails.salary});
        this.setState({editShiftTime: employeeDetails.shift});
        this.RBSheetEditEmployee.open();
    }

    openAttendanceEmployee(employeeDetails){
        this.setState({attendanceName: employeeDetails.name});
        this.setState({attendanceEmpID: employeeDetails.id});
        this.setState({presentCheck: false});
        this.setState({absentCheck: false});
        this.RBSheetAttendanceEmployee.open();
    }

    setChangeDate(date){
        console.log(date);
        this.setState({date:date});
    }

    checkPresentEmployee(flag){
        this.setState({presentCheck: !flag});
        this.setState({absentCheck: flag});
    }

    checkAbsentEmployee(flag){
        this.setState({absentCheck: !flag});
        this.setState({presentCheck: flag});
    }

    markAttendance(date, presentCheck, absentCheck, attendanceEmpID){
        let that = this;
        that.setState({spinner:true});
        let lastIndex = 0;
        database()
        .ref('/attendance')
        .once('value')
        .then(snapshot => {
            if (snapshot.val() == null) {
                lastIndex = 1;
            }
            console.log('User data: ', snapshot.val());
            _.forEach(snapshot.val(), function (value, key) {
                console.log("user index", key);
                lastIndex = parseInt(key);
                
            });

            if (lastIndex > 0) {
                database()
                .ref('/attendance/'+(lastIndex+1))
                .set({
                    id: lastIndex+1,
                    empId: attendanceEmpID,
                    date: date,
                    isPresent: presentCheck,
                    isAbsent: absentCheck,
                })
                .then(() => this.finishAddAttendanceRecord());
            }
        });
    }

    openMonthlySalaryEmployee(employeeDetails){
        this.setState({empIdForSalary: employeeDetails.id});
        this.setState({empNameForSalary: employeeDetails.name});
        this.setState({employeeSalaryIs: 0});
        this.RBSheetMonthlySalaryEmployee.open();
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

    openDeleteEmployee(employeeDetails){
        this.setState({selectDeleteEmpId: employeeDetails.id});
        this.RBSheetDeleteEmployee.open();
    }

    deleteEmployee(empId){
        let that = this;
        that.setState({spinner: true});
        database().ref('/employee/'+empId).remove().then(snapshot => {
            that.setState({spinner: false});
            that.RBSheetDeleteEmployee.close();
            that.getAllEmployees();
    });
    }

    changeSearchName(text) {
        console.log(text);
    }

    searchFilterFunction(searchEmpId) {
        console.log(searchEmpId);
        let that = this;
        that.setState({ employees: that.state.masterEmployee });
        
        var filterEmployee = _.filter(that.state.employees, { 'id': searchEmpId });

        return that.setState({ employees: filterEmployee });
    }

    viewAllEmployees(){
        this.getAllEmployees();
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
        const { employeeName,
            employeeAddress,
            employeeMobile,
            salaryPerDay,
            shiftTime,
            spinner, 
            employees,
            masterEmployee,
            editEmployee,
            editEmployeeName,
            editEmployeeAddress,
            editEmployeeMobile,
            editSalaryPerDay,
            editShiftTime,
            attendanceName,
            attendanceEmpID,
            attendanceDate,
            presentCheck,
            absentCheck,
            empIdForSalary,
            empNameForSalary,
            employeeSalaryIs,
            selectDeleteEmpId,
            salaryDate,
            secureTextEntry} = this.state;

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
                        items={masterEmployee}
                        placeholder="Search Employee"
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
                            employees.map((item, index) => (
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
                                        justifyContent:'space-between',
                                    }}>
                                <Text category='h6' style={{marginLeft:12}}>Name - {item.name}</Text>
                                <Button
                                            icon={
                                                <Icon
                                                    name="user-edit"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="Edit"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#47a847' }}
                                            onPress={()=>this.openEditEmployee(item)}
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
                                        Address
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.address}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Mobile
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.mobile}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Salary
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        Rs.{item.salary}
                                        </Text>
                                        
                                     </View>

                                     <View style={{
                                         flex:1,
                                         flexDirection:'row',
                                         alignContent:'center',
                                         justifyContent:'space-between',
                                     }}>
                                        <Text category='h6'>
                                        Shift
                                        </Text>
                                        <Text category='s2' style={{marginTop:5}}>
                                        {item.shift}
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
                                                    name="calendar-check"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="Attendance"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#c9ad1c' }}
                                            onPress={()=>this.openAttendanceEmployee(item)}
                                        />

                                        <Button
                                            icon={
                                                <Icon
                                                    name="calculator"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="Monthly Salary"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#871cc9' }}
                                            onPress={()=>this.openMonthlySalaryEmployee(item)}
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
                                            onPress={()=>this.openDeleteEmployee(item)}
                                        />
                                        
                                     </View>
                                
                            </Card>
                             ))
                    }

                                    <Button
                                            icon={
                                                <Icon
                                                    name="users"
                                                    size={15}
                                                    color="white"
                                                />
                                            }
                                            containerStyle={{ marginTop: 10, marginLeft:5, marginRight:5, }}
                                            title="View All Employees"
                                            titleStyle={{ marginLeft: 10, fontSize:12 }}
                                            buttonStyle={{ backgroundColor: '#871cc9' }}
                                            onPress={()=>this.viewAllEmployees()}
                                        />
                    {/* Add New Employee - START */}
                    <RBSheet
                                ref={ref => {
                                    this.RBSheetAddNewEmployee = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Add New Employee</Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Employee Name
                                </Text>
                                <Input
                                    placeholder='Name'
                                    onChangeText={name => this.newEmployeeName(name)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Employee Address
                                </Text>
                                <Input
                                    placeholder='Address'
                                    onChangeText={address => this.newEmployeeAddress(address)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Contact Number
                                </Text>
                                <Input
                                    placeholder='Contact Number'
                                    onChangeText={mobile => this.newEmployeeMobile(mobile)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Salary Per Day
                                </Text>
                                <Input
                                    placeholder='Salary Per Day'
                                    onChangeText={salary => this.newEmployeeSalary(salary)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Shift Time
                                </Text>
                                <Input
                                    placeholder='Shift'
                                    onChangeText={shift => this.newEmployeeShift(shift)}
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
                                    onPress={()=>this.saveEmployeeDetails(employeeName,employeeAddress,employeeMobile,salaryPerDay,shiftTime)}
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
                                    onPress={()=>this.RBSheetAddNewEmployee.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Add New Employee - END */}

                            {/* Edit Employee - START */}
                                <RBSheet
                                ref={ref => {
                                    this.RBSheetEditEmployee = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Edit Employee</Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Employee Name
                                </Text>
                                <Input
                                    value = {editEmployeeName}
                                    placeholder='Name'
                                    onChangeText={name => this.editEmployeeName(name)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Employee Address
                                </Text>
                                <Input
                                    value = {editEmployeeAddress}
                                    placeholder='Address'
                                    onChangeText={address => this.editEmployeeAddress(address)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Contact Number
                                </Text>
                                <Input
                                    value = {editEmployeeMobile}
                                    placeholder='Contact Number'
                                    onChangeText={mobile => this.editEmployeeMobile(mobile)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Salary Per Day
                                </Text>
                                <Input
                                    value = {editSalaryPerDay}
                                    placeholder='Salary Per Day'
                                    onChangeText={salary => this.editEmployeeSalary(salary)}
                                    style={{ width:'90%', borderColor: 'black', marginTop: 10, marginLeft: 10 }}
                                />

                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:5}}>
                                Shift Time
                                </Text>
                                <Input
                                    value = {editShiftTime}
                                    placeholder='Shift'
                                    onChangeText={shift => this.editEmployeeShift(shift)}
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
                                    onPress={()=>this.editEmployeeDetails(editEmployee, editEmployeeName,editEmployeeAddress,editEmployeeMobile,editSalaryPerDay,editShiftTime)}
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
                                    onPress={()=>this.RBSheetEditEmployee.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Edit Employee - END */}

                            {/* Attendance Employee - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetAttendanceEmployee = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Attendance Mark {attendanceName}</Text>
                                <Text style={{alignSelf:'flex-start', marginLeft:10}}>
                                Select Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10}}
                                    date={this.state.date}
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
                                
                                <CheckBox
                                    title='Absent'
                                    checked={absentCheck}
                                    onPress={()=>this.checkAbsentEmployee(absentCheck)}
                                    />

                                    <CheckBox
                                    title='Present'
                                    checked={presentCheck}
                                    onPress={()=>this.checkPresentEmployee(presentCheck)}
                                    
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
                                    onPress={()=>this.markAttendance(this.state.date, presentCheck,absentCheck, attendanceEmpID)}
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
                                    onPress={()=>this.RBSheetAttendanceEmployee.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Attendance Employee - END */}

                            {/* Monthly Salary Employee - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetMonthlySalaryEmployee = ref;
                                }}
                                height={480}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Monthly Salary of {empNameForSalary}</Text>
                                { employeeSalaryIs == 0 ?
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginRight:10, marginTop:10, color:'red'}}>
                                Please Choose a date and press cal salary button for view employee salary of month.
                                </Text>
                                : null
                                }
                                
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:10}}>
                                Choose a Date
                                </Text>
                                <DatePicker
                                    style={{width: '80%', marginLeft:10, }}
                                    date={this.state.salaryDate}
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
                                    onDateChange={date => this.setChangeSalaryDate(date)}
                                />
                                

                                <Text category='h6' style={{alignSelf:'flex-start', marginLeft:10, marginTop:10}}>
                                Employee Salary is Rs.{employeeSalaryIs}
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
                                            name="calculator"
                                            size={15}
                                            color="white"
                                        />
                                    }
                                    containerStyle={{ marginTop: 10, marginLeft:10, marginRight:10, width:"40%" }}
                                    title="Calculate Salary"
                                    titleStyle={{ marginLeft: 10 }}
                                    buttonStyle={{ backgroundColor: '#47a847' }}
                                    onPress={()=>this.calMonthlySalary(this.state.salaryDate, empIdForSalary)}
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
                                    onPress={()=>this.RBSheetMonthlySalaryEmployee.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Monthly Salary Employee - END */}

                            {/* Delete Employee - START */}
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetDeleteEmployee = ref;
                                }}
                                height={280}
                                openDuration={250}
                            >
                                <ScrollView>
                                <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 18, marginTop:15 }}>Delete Employee</Text>
                                
                                <Text style={{alignSelf:'flex-start', marginLeft:10, marginTop:30}}>
                                Are You Sure Do you want to delete this employee ?
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
                                    onPress={()=>this.deleteEmployee(selectDeleteEmpId)}
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
                                    onPress={()=>this.RBSheetDeleteEmployee.close()}
                                />
                                </View>
                                </ScrollView>
                            </RBSheet>
                            {/* Delete Salary Employee - END */}
                            
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
                            onPress={()=>this.openRBSheetAddEmployee()}
                        >
                            <Icon name="user-plus" size={25} color="white" />
                            
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

export default connect(mapStateToProps)(Employee);