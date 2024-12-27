import React from 'react';
import FlexView from "react-flexview";
import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import PropTypes from "prop-types";
import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import utilities from "../../../Services/NewUtilities";

import { ERROR_IN_SERVER_RESPONSE } from "../../../Services/httpRequest"
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import errorCodeList from '../../../Services/ErrorCodeList';
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';
import GeneralUtilities from '../../../Services/GeneralUtilities';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import constantObjects from '../../../Services/Constants';
import androidApiCallsService from '../../../Services/androidApiCallsService';
import { Drawer } from '@material-ui/core';

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.SingleInputTheme;
const styles = InputThemes.singleInputStyle;
const pageName = PageNames.collectNewKeyDetails;

const ARBI_INSTITUTION_CODE = "54403563";
const screenHeight = window.innerHeight;
var localeObj = {};

class CollectNewKeyDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key_type: this.props.location.state.key_type || "",
            key_index: this.props.location.state.key_index || "",
            value: this.props.location.state.key_value || "",
            ddd: this.props.location.state.key_value.replace(/[^0-9]/g, '').substr(0, 2) || "",
            mobNum: this.props.location.state.key_value.replace(/[^0-9]/g, '').substr(2, 11) || "",
            bottom: false,
            pixPortabilityDetails: {},
            snackBarOpen: false
        }
        this.styles = {
            title: {
                color: "#000000",
                fontSize: "1.5rem",
                fontWeight: "400",
                fontFamily: "Roboto"
            },
            item: {
                width: "95%",
                marginLeft: "5%",
                marginTop: "7%"
            },
        }
        this.componentName = PageNames.collectNewKeyDetails;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName);
    }

    componentDidMount() {
        document.body.style.overflow = 'hidden';
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        window.onBackPressed = () => {
            this.onBack();
        }
        androidApiCallsService.enableCopyPaste();
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
        androidApiCallsService.disableCopyPaste();
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    onNext = () => {
        if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.EMAIL) {
            //Log.sDebug(localeObj.enter_valid_email, "CollectNewKeyDetailsComponent");
            if (this.state.value.replace(/ /g, "") === "") {
                this.openSnackBar(localeObj.enter_valid_email);
                return;
            }
            if (!utilities.validateParameters("E-mail", this.state.value)) {
                this.openSnackBar(localeObj.enter_valid_email)
                return;
            }
        } else { //phone number
            //Log.sDebug(localeObj.enter_valid_phoneNumber, "CollectNewKeyDetailsComponent");
            if (this.state.value === "") {
                this.openSnackBar(localeObj.enter_valid_phoneNumber);
                return;
            } else if (!utilities.validateParameters("ddd", this.state.ddd)) {
                this.openSnackBar(localeObj.enter_valid_phoneNumber);
                return;
            } else if (this.state.mobNum.length != 9 || this.state.mobNum[0] != 9) {
                this.openSnackBar(localeObj.enter_valid_phoneNumber);
                return;
            }
        }


        // check if a pix key already exists, if it does then show portability bottom sheet
        this.showProgressDialog();
        ArbiApiService.getPixKeyDetails(this.state.value, pageName).then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let repsonseHandler = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, this.state.value, localeObj);

                if (repsonseHandler.success) {
                    let claimType = this.isItTheSameOwner(repsonseHandler.pixKeyDetails.accountNum, repsonseHandler.pixKeyDetails.bankCode, repsonseHandler.pixKeyDetails.sameUser);
                    //Log.sDebug("portability type is " + claimType, "CollectNewKeyDetailsComponent");
                    if (claimType !== 0) {
                        this.setState({
                            "pixPortabilityDetails": {
                                "pixKeyType": repsonseHandler.pixKeyDetails.pixKeyType,
                                "pixKey": repsonseHandler.pixKeyDetails.pixKey,
                                "institution": repsonseHandler.pixKeyDetails.institute,
                                "claimType": claimType
                            },
                            "bottom": true
                        });
                    } else {
                        let errorMessageToUser = localeObj.user_owns_key;
                        this.openSnackBar(errorMessageToUser);
                    }
                } else {
                    let errorMessageToUser = localeObj.retry_later;
                    this.openSnackBar(errorMessageToUser);
                }
            } else {
                if (response.result.code === errorCodeList.PIX_KEY_NOT_FOUND
                    || response.result.code === errorCodeList.NO_KEY_FOUND_FOR_PARAMS) {
                    //Log.sDebug("sendingOTP", "CollectNewKeyDetailsComponent");
                    this.sendOtp();
                } else {
                    this.hideProgressDialog();
                    let errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.openSnackBar(errorMessageToUser);
                }
            }
        });
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

    isItTheSameOwner = (accountNumber, bankCode, isItTheSameOwner) => {
        let userAccNumber = ImportantDetails.accountNumber.replace('-', '')
        if ((userAccNumber === accountNumber) && (bankCode === ARBI_INSTITUTION_CODE)) {
            //Log.sDebug("Key is not portable used by same Account", "CollectNewKeyDetailsComponent");
            return 0; //user owns key 
        } else if (isItTheSameOwner) {
            //Log.sDebug("Key is portable - institution", "CollectNewKeyDetailsComponent");
            return 2; // portability
        } else {
            //Log.sDebug("Key is portable - ownership", "CollectNewKeyDetailsComponent");
            return 1;//ownership
        }
    }


    sendOtp = () => {
        //Log.sDebug("token sent at " + new Date(), "CollectNewKeyDetailsComponent");
        ArbiApiService.sendTokenToPixKey(this.state.value, pageName).then(response => {
            this.hideProgressDialog();
            if (response.success) {

                let payloadToBesent = {
                    "key_type": this.state.key_type,
                    "value": this.state.value,
                    "type": 1
                }

                this.props.history.replace("/otpConfirmationComponent", payloadToBesent);
            } else {
                let errorMessageToUser = localeObj.retry_later;
                if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                    if (response.result.message === this.VALIDATION_ERROR) {
                        errorMessageToUser = localeObj.validation_error;
                    } else if (response.result.code.toString() === "46001") {
                        errorMessageToUser = response.result.message + "." + response.result.details;
                    }
                }
                this.openSnackBar(errorMessageToUser);
            }
        });
    }

    resetField = () => {
        this.setState({
            value: ""
        })
    }

    handleChange = event => {
        if (event.target.value.length !== 0) {
            if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER) {
                let phoneNumObj = {};
                const re = /^[0-9/(/)/ /-]+$/;
                if (re.test(event.target.value)) {
                    phoneNumObj = utilities.parsePhoneNum(event.target.value);
                    if (phoneNumObj.phoneNumber.length != 0) {
                        this.setState({
                            ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                            mobNum: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                            value: phoneNumObj.phoneNumber
                        })
                    } else {
                        this.resetField();
                    }
                }
            } else {
                let emailValue = event.target.value;
                this.setState({
                    value: emailValue.replace(/^\s+|\s+$/gm,' ').trim()
                })
            }
        } else {
            this.resetField();
        }
    }

    sleep(time){
        return new Promise(
            (resolve)=>setTimeout(resolve,time)
        )
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        if(this.state.bottom !== null && this.state.bottom){
            this.handleClose();
        } else {
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            this.props.history.replace({ pathname: "/registerNewKeyComponent", transition: "right", keyType: this.state.key_index })   
        }
    }

    startPortability = () => {
        let payloadToBesent = {
            "key_type": this.state.key_type,
            "value": this.state.value,
            "claimType": this.state.pixPortabilityDetails["claimType"]
        }
        //Log.sDebug("show Portability Instructions screen for " + JSON.stringify(payloadToBesent), this.componentName);
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.history.replace("/portabilityConfirmationComponent", payloadToBesent);
    }

    handleClose = () => {
        this.setState({ bottom: false });
    }

    selectKeyType = (type) => {
        if(type === "EVP"){
            return localeObj.evp_key;
        } else if (type === "PHONE") {
            return localeObj.phone_number;
        } else if (type === "EMAIL") {
            return localeObj.email;
        } else if (type === "CPF") {
            return localeObj.cpf;
        } else {
            return type;
        }
    }

    render() {
        const { classes } = this.props;
        let fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle
        return (
            <div style={{ overflow: "hidden" }}>
                <ButtonAppBar onBack={this.onBack} action="none"
                    header={(this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? localeObj.phone_number : localeObj.email)} />
                
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {(this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? localeObj.insert_phone_number : localeObj.insert_email_id)}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <TextField
                            label={this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? localeObj.phone_number : localeObj.email}
                            type={this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? "tel" : "email"}
                            placeholder={this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? "(00) 00000-0000" : ""}
                            value={this.state.value || ""} autoComplete='off'
                            onChange={this.handleChange}
                            InputProps={{ 
                                classes: { underline: classes.underline },
                                className: this.state.field === "" ? classes.input : classes.finalInput }}
                            InputLabelProps={this.state.value === "" ?
                                { className: classes.input } : { className: classes.finalStyle }}
                            FormHelperTextProps={{ className: classes.helpertextstyle }}
                            helperText={(this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.EMAIL || utilities.validateParameters("ddd", this.state.ddd)) ? "" : localeObj.incorrect_ddd}
                            error={(this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.EMAIL || utilities.validateParameters("ddd", this.state.ddd)) ? false : true} />
                    </MuiThemeProvider>
                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.onNext} />
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <Drawer
                    anchor="bottom"
                    open={this.state.bottom}
                    onClose={this.handleClose}
                    classes={{ paper: classes.paper }}>
                    <div onKeyDown={this.handleClose} style={{ margin: "1.5rem" }} >
                        <div style={{ marginTop: "0.5rem", textAlign: "center" }} >
                            <span className="headline6 highEmphasis">
                                {this.state.pixPortabilityDetails.claimType === 1 ? localeObj.ownership_key_title : localeObj.portability_key_title}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: "center" }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.pixPortabilityDetails.claimType === 1 ? localeObj.ownership_key_description : localeObj.portability_key_description}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                            <span className="subtitle2 highEmphasis">
                                {this.selectKeyType(this.state.pixPortabilityDetails.pixKeyType)}
                            </span>
                        </div>
                        <div style={{textAlign: "center" }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.pixPortabilityDetails.pixKey}
                            </span>
                        </div>

                        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.Institution}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: "center" }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.pixPortabilityDetails.institution}
                            </span>
                        </div>
                        <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.start_portability} onCheck={this.startPortability} />
                            <SecondaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel} onCheck={this.handleClose} />
                        </div>
                    </div>
                </Drawer>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
CollectNewKeyDetailsComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};
export default withStyles(styles)(CollectNewKeyDetailsComponent);