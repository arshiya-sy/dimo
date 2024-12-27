import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../Themes/inputThemes";

import moment from "moment";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import LongList from "../CommonUxComponents/LongListComponent";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import GeneralUtilities from "../../Services/GeneralUtilities";
import CalenderPicker from "../CommonUxComponents/CalenderPicker";
import ColorPicker from "../../Services/ColorPicker";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const snackBar = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

const screenHeight = window.innerHeight;
const MINIMUM_NAME_LENGTH = 2;
const MAXIMUM_NAME_LENGTH = 50;
const MINIMUM_RG_NUMBER_LENGTH = 5;
const MAXIMUM_RG_NUMBER_LENGTH = 13;

const issuingOrganizations = ["DETRAN", "SESP", "SSP", "Outros", "RCPN", "DPF", "ABNC", "DUREX", "CGPI", "CGPMAF",
    "CNIG", "CNT", "COREN", "CORECON", "CRA", "CRAS", "CRB", "CRC", "CRE", "CREA",
    "CRECI", "CREFIT", "CRESS", "CRF", "CRM", "CRN", "CRO", "CRP", "CRPRE", "CRQ",
    "RRC", "CRMV", "CSC", "CTPS", "DIC", "DIREX", "DPMAF", "DPT", "DST", "FGTS",
    "FIPE", "FLS", "GOVGO", "ICLA", "IFP", "IGP", "IICCECFRO", "IIMG", "IML",
    "IPC", "IPF", "MAE", "MEX", "MMA", "OAB", "OMB", "PCMG", "PMMG", "POF", "POM",
    "SDS", "SNJ", "SECC", "SEJUSP", "SES", "EST", "SJS", "SJTC", "SJTS", "SPTC"]

const states = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS",
    "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE",
    "SP", "TO"];

function extractDetails(response, isItRg) {
    const regexDate = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/;
    let returnableValues = {};

    let issueDateFilter = "";
    if (isItRg) {
        issueDateFilter = "rgIssueDate";
    } else {
        issueDateFilter = "cnhIssueDate";
    }

    let extractedIssueDate = response[issueDateFilter];
    if (regexDate.test(extractedIssueDate)) {
        let issueDateArray = extractedIssueDate.split("/");
        let issueDate = issueDateArray.reverse().join("-");
        Log.verbose("IssueDate is " + issueDate);
        returnableValues["issueDate"] = issueDate;
    }

    let extractedDob = response["birthDate"];
    if (regexDate.test(extractedDob)) {
        let dobArray = extractedDob.split("/");
        let dob = dobArray.reverse().join("-");
        Log.verbose("dob is " + dob);
        returnableValues["dob"] = dob;
    }

    let issuingOrg = response["rgIssuingAuthority"];
    if (issuingOrg) {
        if (issuingOrganizations.indexOf(issuingOrg) !== -1) {
            returnableValues["issueBody"] = issuingOrg;
        }
    }

    let issueState = response["rgIssueState"];
    if (issueState) {
        if (states.indexOf(issueState) !== -1) {
            returnableValues["issueState"] = issueState;
        }
    }

    let extractedName = response["name"];
    const regexName = /^[a-zA-Z\u00C0-\u00FF ]+$/;

    if (extractedName && regexName.test(extractedName) && extractedName.length > MINIMUM_NAME_LENGTH && extractedName.length < MAXIMUM_NAME_LENGTH) {
        returnableValues["name"] = extractedName;
    }

    let extractedMothersName = response["motherName"];
    if (extractedMothersName && regexName.test(extractedMothersName) && extractedMothersName.length > MINIMUM_NAME_LENGTH && extractedMothersName.length < MAXIMUM_NAME_LENGTH) {
        returnableValues["motherName"] = extractedMothersName;
    }

    let extractedFathersName = response["fatherName"];
    if (extractedFathersName && regexName.test(extractedFathersName) && extractedFathersName.length > MINIMUM_NAME_LENGTH && extractedFathersName.length < MAXIMUM_NAME_LENGTH) {
        returnableValues["fatherName"] = extractedFathersName;
    }

    let extractedRgNumber = response["rg"] ? response["rg"].replace(/\.|-/g, "") : "";
    const regexRgNumber = /^[0-9A-Z]+$/;
    if (extractedRgNumber && regexRgNumber.test(extractedRgNumber) && extractedRgNumber.length > MINIMUM_RG_NUMBER_LENGTH && extractedRgNumber.length < MAXIMUM_RG_NUMBER_LENGTH) {
        returnableValues["rgNumber"] = extractedRgNumber;
    }

    return returnableValues;

}

class RgFormComponent extends React.Component {
    constructor(props) {
        super(props);

        this.componentName = "RgFormComponent";
        this.state = {
            name: "",
            docType: androidApiCalls.getFromPrefs("docType"),
            ufIssueOrg: "",
            issueState: "",
            rgNumber: "",
            rgNum: "",
            dob: "",
            gender: "",
            genderDisplay: "",
            areDetailsEmpty: false,
            motherName: "",
            fatherName: "",
            snackBarOpen: false,
            maxDay: moment().subtract(1, 'days'),
            fieldOpen: false,
            datePicker: false,
            genderPicker: false,
            showIssueDate: false,
            isButtonEnabled: false,
            ufIssueOrgScanned: false,
            issueDateScanned: false,
            motherScanned: false,
            fatherScanned: false,
            genderPicker: false

        }

        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.componentName = this.props.componentName;
        this.maxBirthday = new Date(moment().subtract(18, 'years').subtract(1, 'days'));
        this.minBirthDay = new Date(moment(new Date()).subtract(150, 'years').subtract(1, 'days'));
        this.minIssueDay = new Date(moment(new Date()).subtract(10, 'years').subtract(1, 'days'));
        this.today = new Date(moment(new Date()).subtract(1, 'days'));
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }


    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        let rgInfo = this.props.value;
        Log.verbose("rgInfo in RgFormComponent" + JSON.stringify(rgInfo));
        if (rgInfo && Object.keys(rgInfo).length !== 0) {
            let displayRg = rgInfo.rgNumber;
            this.setState({
                areDetailsEmpty: Object.values(rgInfo).every((item) => {
                    return GeneralUtilities.emptyValueCheck(item)
                })
            });
            this.setState({
                "rgNumber": displayRg,
                "name": rgInfo.name,
                "ufIssueOrg": rgInfo.issueBody,
                "issueState": rgInfo.issueState,
                "rgNum": rgInfo.rgNumber,
                "dob": rgInfo.dob,
                "motherName": rgInfo.motherName,
                "fatherName": rgInfo.fatherName || "",
                "issueDate": rgInfo.issueDate,
                "finalDob": new Date(rgInfo.dob),
                "finalIssueDate": new Date(rgInfo.issueDate)
            })
        } else {
            this.setState({
                "rgNumber": ImportantDetails.onboarding_data.rg.rgNumber,
                "name": ImportantDetails.onboarding_data.rg.name,
                "ufIssueOrg": ImportantDetails.onboarding_data.rg.issueBody,
                "issueState": ImportantDetails.onboarding_data.rg.issueState,
                "rgNum": ImportantDetails.onboarding_data.rg.rgNumber,
                "dob": ImportantDetails.onboarding_data.rg.dob,
                "motherName": ImportantDetails.onboarding_data.rg.motherName,
                "fatherName": ImportantDetails.onboarding_data.rg.fatherName || "",
                "issueDate": ImportantDetails.onboarding_data.rg.issueDate,
                "finalDob": new Date(ImportantDetails.onboarding_data.rg.dob),
                "finalIssueDate": new Date(ImportantDetails.onboarding_data.rg.issueDate),
                "genderDisplay": ImportantDetails.onboarding_data.rg.genderDisplay,
            })
        }
       
        if(this.state.ufIssueOrg){
            this.setState({ ufIssueOrgScanned: true })
        }
        if(this.state.issueDate){
            this.setState({ issueDateScanned: true })
        }
        if(this.state.motherName){
            this.setState({ motherScanned: true })
        }
        if(this.state.fatherName){
            this.setState({ fatherScanned: true })
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.checkIfInputIsActive);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }

    parseDate = (dateString) => {
        const delimiters = ['/', '-', '.'];
        const delimiter = delimiters.find((d) => dateString.includes(d)) || '/';
        const parts = dateString.split(delimiter);
        
        if (parts.length !== 3) {
            return null;
        }

        let day, month, year;
        if (parts[0].length === 4) { 
            [year, month, day] = parts;
        } else if (parts[1].length === 4) {
            [month, year, day] = parts;
        } else {
            [day, month, year] = parts;
        }
    
        day = parseInt(day, 10);
        month = parseInt(month, 10);
        year = parseInt(year, 10);
    
        if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || month < 1 || month > 12 || year < 1) {
            return null;
        }
        return new Date(`${month}/${day}/${year}`);
    };

    sendField = () => {
        if ((this.state.rgNumber === "")
            || (this.state.issueState === "") || (this.state.dob === "") || (this.state.name.replace(/ /g, "") === "") || (this.state.ufIssueOrg === "")) {
            this.openSnackBar(localeObj.enter_all_details);
            return;
        }

        if (this.state.rgNum.length > MAXIMUM_RG_NUMBER_LENGTH || this.state.rgNum.length < MINIMUM_RG_NUMBER_LENGTH) {
            this.openSnackBar(localeObj.invalid_rg);
            return;
        }

        if (this.state.name.length > MAXIMUM_NAME_LENGTH || this.state.name.length < MINIMUM_NAME_LENGTH) {
            this.openSnackBar(localeObj.fullname + " " + localeObj.lengthError);
            return;
        }
        
        let myDate = this.state.dob;
        const dob = this.parseDate(myDate);
        if (isNaN(dob.getTime())) {
            this.openSnackBar(localeObj.date_validation_error);
            return;
        }
        let maxDate = new Date(this.maxBirthday);
        let minDate = new Date(this.minBirthDay);
        if (dob.getTime() > maxDate.getTime()) {
            this.openSnackBar(localeObj.birthDayError);
            return;
        } else if (dob.getTime() < minDate.getTime()) {
            this.openSnackBar(localeObj.underAgeError);
            return;
        }

        let issueNewDate = this.state.issueDate;
        let issueDate = this.parseDate(issueNewDate);
    
        if (!issueDate || isNaN(issueDate.getTime())) {
            this.openSnackBar(localeObj.date_validation_error);
            return;
        }
    
        let minIssueDate = new Date(this.minIssueDay)
    
        if (issueDate.getTime() < dob.getTime()) {
            let event = {
                eventType: constantObjects.issueDateError,
                page_name: this.componentName,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.openSnackBar(localeObj.issueError);
            return;
        }
    
        if (issueDate.getTime() < minIssueDate.getTime()) {
            this.openSnackBar(localeObj.issueDateError);
            return;
        }
        
        let rgOptions = {};
        rgOptions["issueBody"] = this.state.ufIssueOrg;
        rgOptions["rgNumber"] = this.state.rgNum;
        rgOptions["issueState"] = this.state.issueState;
        rgOptions["motherName"] = this.state.motherName;
        rgOptions["fatherName"] = this.state.fatherName;
        rgOptions["dob"] = new Date(this.state.finalDob).toISOString().split('T')[0];
        rgOptions["name"] = this.state.name;
        rgOptions["gender"] = this.state.gender;
        rgOptions["genderDisplay"] = this.state.genderDisplay;
        rgOptions["issueDate"] = this.state.issueDate;
        rgOptions["issueDatePass"] = this.state.issueDatePass;
        // rgOptions["isButtonEnabled"] = this.state.issueDatePass;

        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.recieveField(rgOptions);
    }

    handleOpen = () => {
        this.props.multipleSelection(true);
        this.setState({genderPicker : true})
    }
    handleChange = name => event => {
        if (name === "rgNumber" && event.target.value.length !== 0) {
            const re = /^[0-9A-Za-z\s]+$/;
            if (re.test(event.target.value)) {
                this.setState({
                    "rgNumber": event.target.value.toString().toUpperCase(),
                    "rgNum": event.target.value.toString().toUpperCase()
                }, () => { 
                    this.updateNextButtonState();
                })
            }
        } else if ((name === "name" || name === "fatherName" || name === "motherName")
            && event.target.value.length !== 0) {
            const re = /^[a-zA-Z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value }, () => { this.updateNextButtonState() });
            }
        } else if(name === "gender") {
            this.setState({ gender: event.target.value }, () => {this.updateNextButtonState()});
        } else if (name === "issueState" || name === "ufIssueOrg") {
            this.props.multipleSelection(true);
            let type = name === "issueState" ? "State" : "Body";
            let header = name === "issueState" ? localeObj.select_state : localeObj.select_body;
            this.setState({
                openList: true,
                type: type,
                header: header
            }, this.updateNextButtonState);
        } else if (name === "dob") {
            this.props.multipleSelection(true);
            this.setState({
                datePicker: true,
            }, this.updateNextButtonState);
        } else if (name === "issueDate") {
            this.props.multipleSelection(true);
            this.setState({
                issueDatePicker: true,
            });
        } else {
            this.setState({ [name]: event.target.value }, () => {this.updateNextButtonState()});
        }
    };

    updateNextButtonState = () => {
        const requiredFields = [
            "name",
            "dob",
            "rgNumber",
            "issueState",
            "issueDate",
            "gender",
            "ufIssueOrg",
            "motherName",
            "fatherName"
        ];
        const allFieldsFilled = requiredFields.every(field =>
            !GeneralUtilities.emptyValueCheck(this.state[field])
        );
        
        this.setState({ isButtonEnabled: allFieldsFilled });
    }

    keySelected = (name, key) => {
        this.props.multipleSelection(false);
        this.setState({
            gender : key,
            genderDisplay: name,
            genderPicker: false
        }, () => {
            this.updateNextButtonState();
        })
    }   

    confirm = (value) => {
        this.props.multipleSelection(false);
        this.setState({
            openList: false
        })
        if (this.state.type === "State") {
            this.setState({ issueState: value }, () => {this.updateNextButtonState()});
        } else {
            this.setState({ ufIssueOrg: value }, () => {this.updateNextButtonState()});
        }
    }

    confirmDate = (field) => {
        this.props.multipleSelection(false);
        this.setState({
            dob: moment(field).format('DD/MM/YYYY'),
            finalDob: field,
            datePicker: false
        }, () => {this.updateNextButtonState()})
    }

    confirmIssueDate = (field) => {
        this.props.multipleSelection(false);
        this.setState({
            issueDatePass: new Date(field).toISOString().split('.')[0],
            issueDate: moment(field).format('DD/MM/YYYY'),
            finalIssueDate: field,
            issueDatePicker: false,
            showIssueDate: true
        }, () => {this.updateNextButtonState()})
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    render() {
        const genderOptions = [
            { name: 'Male', value: 'M' },
            { name: 'Female', value: 'F' },
            { name: 'Others', value: 'O' }
        ];
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.identifyButtonStyle : InputThemes.bottomButtonStyle;
        if (!this.props.selection) {
            if (this.state.openList) {
                this.setState({
                    openList: false
                })
            } else if (this.state.datePicker) {
                this.setState({
                    datePicker: false
                })
            } else if (this.state.issueDatePicker) {
                this.setState({
                    issueDatePicker: false
                })
            } else if (this.state.genderPicker) {
                this.setState({
                    genderPicker: false
                })
            }
        }
        return (
            <div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div style={{ display: this.state.openList ? 'block' : 'none' }}>
                    {this.state.openList && <LongList type={this.state.type} header={this.state.header} confirm={this.confirm} />}
                </div>
                <div style={{ display: this.state.datePicker ? 'block' : 'none' }}>
                    {this.state.datePicker && <CalenderPicker value={this.state.dob === "" ? this.maxBirthday : this.state.finalDob} minDate={this.minBirthDay} maxDate={this.maxBirthday} confirm={this.confirmDate} />}
                </div>
                <div style={{ display: this.state.issueDatePicker ? 'block' : 'none' }}>
                    {this.state.issueDatePicker && <CalenderPicker value={this.state.issueDate === "" ? this.today : this.state.finalIssueDate} minDate={this.minIssueDay} maxDate={this.today} confirm={this.confirmIssueDate} disableToday={true}/>}
                </div>
                <div style={{ display: !this.state.processing && !this.state.openList && !this.state.datePicker && !this.state.issueDatePicker ? 'block' : 'none' }}>
                    <div style={{ overflowY: "auto", height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.rg_new_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ display: this.state.areDetailsEmpty ? 'none' : 'block', textAlign: "left", marginTop: "0.6rem" }}>
                                    {localeObj.rg_description}
                                </div>
                            </FlexView>
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.fullname}
                                onChange={this.handleChange("name")} value={this.state.name || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.name === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.name === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.dob}
                                onClick={this.handleChange("dob")}
                                InputLabelProps={this.state.dob === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.dob === "" ? classes.input : classes.finalInput
                                }}
                                value={this.state.dob === "undefined" || this.state.dob === "" ? "" : moment(this.state.dob, 'DD/MM/YYYY', true).isValid() ?
                                    this.state.dob : moment(this.state.dob, "YYYY-MM-DD").format("DD/MM/YYYY")} />
                            <TextField label={localeObj.reg_num}
                                onChange={this.handleChange("rgNumber")} value={this.state.rgNumber || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.rgNumber === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.rgNumber === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.reg_org}
                                onClick={this.handleChange("issueState")} value={this.state.issueState || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.issueState === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.issueState === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}>
                            </TextField>
                            <TextField label={localeObj.gender}
                                onClick={this.handleOpen} value={this.state.genderDisplay || ""}
                                InputProps={{
                                    readOnly: true,
                                    classes: { underline: classes.underline },
                                    className: this.state.gender === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.gender === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            {!this.state.ufIssueOrgScanned && <TextField label={localeObj.uf} autoComplete='off'
                                onClick={this.handleChange("ufIssueOrg")} value={this.state.ufIssueOrg || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.ufIssueOrg === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.ufIssueOrg === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}>
                            </TextField>}
                            {(!this.state.issueDateScanned || this.state.showIssueDate) && (<TextField label={localeObj.issueDate}
                                onClick={this.handleChange("issueDate")}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.issueDate === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.issueDate === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                value={this.state.issueDate === "undefined" || this.state.issueDate === "" ? "" : moment(this.state.issueDate, 'DD/MM/YYYY', true).isValid() ?
                                    this.state.issueDate : moment(this.state.issueDate, "YYYY-MM-DD").format("DD/MM/YYYY")} /> )}
                            {!this.state.motherScanned && (<TextField label={localeObj.reg_mother_name} autoComplete='off'
                                onChange={this.handleChange("motherName")} value={this.state.motherName || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.motherName === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.motherName === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />)}
                            {!this.state.fatherScanned && (<TextField label={localeObj.reg_father_name} autoComplete='off'
                                onChange={this.handleChange("fatherName")} value={this.state.fatherName || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.fatherName === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.fatherName === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            /> )}
                        </MuiThemeProvider>
                    </div>
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                        <MuiThemeProvider theme={InputThemes.OperatorMenuTheme}>
                            <Drawer classes={{ paper: classes.paper }}
                                anchor="bottom"
                                open={this.state.genderPicker}>
                                <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                                    <List>
                                        <div className="headline6 highEmphasis" style={{ margin: "1.5rem", textAlign: "center" }}>{localeObj.gender}</div>
                                        {genderOptions.map((keyVal) => (
                                            <ListItem button key={keyVal.name} onClick={() => this.keySelected(keyVal.name, keyVal.value)}>
                                                <ListItemText style={{marginLeft: "1.5rem"}} className="body2 highEmphasis" primary={keyVal.name} />
                                                <ArrowIcon style={{ fill: ColorPicker.accent, fontSize: "1rem", marginRight: "1.5rem" }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </MuiThemeProvider>
                            </Drawer>
                        </MuiThemeProvider>
                    </div>
                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} disabled={!this.state.isButtonEnabled} />
                    </div>
                </div>
                <MuiThemeProvider theme={snackBar}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

RgFormComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    value: PropTypes.object,
    recieveField: PropTypes.func,
    multipleSelection: PropTypes.func,
    selection: PropTypes.bool
};

export default withStyles(styles)(RgFormComponent);
export { extractDetails };
