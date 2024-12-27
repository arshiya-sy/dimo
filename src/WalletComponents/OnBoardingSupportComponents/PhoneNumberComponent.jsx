import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../Themes/inputThemes";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import utilities from "../../Services/NewUtilities";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
const feature_available = "HINT_PHONE_EMAIL"
var localeObj = {};

class PhoneNumberComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mobileNumber: props.displayNumber || "",
            ddd: props.ddd || "",
            mobNum: props.phoneNumber || "",
            snackBarOpen: false
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "PhoneNumber";
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);

        if (this.props.ddd && this.props.phoneNumber) {
            let phoneNumObj = utilities.parsePhoneNum(this.props.ddd + this.props.phoneNumber);
            this.setState({
                mobileNumber: phoneNumObj.phoneNumber
            })
        } else if (androidApiCalls.isFeatureEnabledInApk(feature_available) && constantObjects.featureEnabler.ENABLE_PHONE_AUTOPOPULATE && this.props.allowAutoPopulate) {
            androidApiCalls.getUserPhoneNumber();
        }

        window.onPhNumberRecieve = (userPhoneNumber) => {
            let finalPhoneNumber = "";
            if (userPhoneNumber && userPhoneNumber.length <= 11) {
                finalPhoneNumber = userPhoneNumber.replace(/[^0-9]/g, '').substr(0, 13);
            } else {
                finalPhoneNumber = userPhoneNumber.replace(/^\+/, '').replace(/[^0-9]/g, '').substr(0, 13);
            }

            let phoneNumObj = utilities.parsePhoneNum(finalPhoneNumber);
            if (phoneNumObj.phoneNumber.length !== 0) {
                this.setState({
                    ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                    mobNum: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                    mobileNumber: phoneNumObj.phoneNumber
                })
            }
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
        androidApiCalls.disableCopyPaste();
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    sendField = (status) => {
        if (this.state.mobileNumber === "") {
            this.openSnackBar(localeObj.enter_field + " " + this.props.field.toString().toLowerCase());
            return;
        } else if (!utilities.validateParameters("ddd", this.state.ddd)) {
            this.openSnackBar(localeObj.invalid_phone);
            return;
        } else if (this.state.mobNum.length !== 9 || this.state.mobNum[0] !== "9") {
            this.openSnackBar(localeObj.invalid_phone);
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            let jsonPhoneNum = {};
            jsonPhoneNum["phoneNumber"] = this.state.mobNum;
            jsonPhoneNum["ddd"] = this.state.ddd;
            jsonPhoneNum["optin"] = status ? status : "true";
            jsonPhoneNum["displayNumber"] = this.state.mobileNumber;
            this.props.recieveField(jsonPhoneNum);
            let json = {};
            json["field"] = this.state.ddd;
            json["optin"] = status ? status : "true";
        }
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

    resetField = () => {
        this.setState({
            ddd: "",
            mobNum: "",
            mobileNumber: ""
        })
    }

    handleChange(event) {
        if (event.target.value.length !== 0) {
            let phoneNumObj = {};
            const re = /^[0-9/(/)/ /-]+$/;
            if (re.test(event.target.value)) {
                phoneNumObj = utilities.parsePhoneNum(event.target.value);
                if (phoneNumObj.phoneNumber.length !== 0) {
                    this.setState({
                        ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                        mobNum: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                        mobileNumber: phoneNumObj.phoneNumber
                    })
                } else {
                    this.resetField();
                }
            }
        } else {
            this.resetField();
        }
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {this.props.header}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={InputThemes.SingleInputTheme}>
                        <TextField label={this.props.field} type={'tel'}
                            onChange={this.handleChange} value={this.state.mobileNumber || ""}
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: this.state.mobileNumber === "" ? classes.input : classes.finalInput
                            }} autoComplete='off'
                            InputLabelProps={this.state.mobileNumber === "" ?
                                { className: classes.input } : { className: classes.finalStyle }}
                            FormHelperTextProps={{ className: classes.helpertextstyle }}
                            placeholder="(00) 00000 0000"
                            helperText={utilities.validateParameters("ddd", this.state.ddd) ? "" : localeObj.incorrect_ddd}
                            error={utilities.validateParameters("ddd", this.state.ddd) ? false : true}
                        />
                    </MuiThemeProvider>
                </div>
                <div style={{...fieldOpen, textAlign: "center"}}>
                    <FlexView column style={{ display: this.state.fieldOpen ? "none" : "block" }}>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1.5rem", maxWidth: "89%" }}>
                            {localeObj.phone_footNote}
                        </div>
                    </FlexView>
                    <PrimaryButtonComponent btn_text={localeObj.acceptContBtn} onCheck={this.sendField} />
                    <SecondaryButtonComponent btn_text={localeObj.next} onCheck={() => this.sendField("undecided")} />
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

PhoneNumberComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    field: PropTypes.string,
    componentName: PropTypes.string,
    description: PropTypes.string,
    header: PropTypes.string,
    ddd: PropTypes.string,
    phoneNumber: PropTypes.string,
    recieveField: PropTypes.func,
    setDDD: PropTypes.func,
    allowAutoPopulate: PropTypes.bool
};

export default withStyles(styles)(PhoneNumberComponent);
