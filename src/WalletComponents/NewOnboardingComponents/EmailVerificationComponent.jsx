import React, { createRef } from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes"
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ProgressBar from "../CommonUxComponents/ProgressBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ColorPicker from "../../Services/ColorPicker";
import GeneralUtilities from "../../Services/GeneralUtilities";
import Log from "../../Services/Log";
import ArbiErrorResponsehandler from '../../Services/ArbiErrorResponsehandler';
import Globals from "../../Services/Config/config";
import { arbiEnvironment } from "../../Services/Config/config";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants";
import ArbiApiService from "../../Services/ArbiApiService";
import NewUtilities from "../../Services/NewUtilities";
import DetailFormComponent from "../OnBoardingSupportComponents/DetailFormComponent";
import { CSSTransition } from 'react-transition-group';

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const environment = Globals.getDigitalAccountEvironment();
const screenHeight = window.innerHeight;
var localeObj = {};
var redactedMail = "";
const PageNameJSON = PageNames.userProfileDetails;

class EmailVerificationComponent extends React.Component {
    biometricAvailability = Object.freeze({ SUCCESS: "success", FAILURE: "failure", NEEDS_SETUP: "require" });
    bottomSheetTypes = Object.freeze({ ENABLE_FP_WARNING: "ENABLE_FP_WARNING", DISABLE_FP_WARNING: "DISABLE_FP_WARNING", FORGOT_PASSWORD: "FORGOT_PASSWORD", WRONG_PASSWORD: "WRONG_PASSWORD" });
    constructor(props) {
        super(props);
        this.codeOne = createRef();
        this.codeTwo = createRef();
        this.codeThree = createRef();
        this.codeFour = createRef();
        this.codeFive = createRef();
        this.codeSix = createRef();
        this.refArray = [this.codeOne,
        this.codeTwo,
        this.codeThree,
        this.codeFour,
        this.codeFive,
        this.codeSix]
        this.state = {
            time: {},
            seconds: 150,
            showResend: false,
            open: false,
            snackBarOpen: false,
            openFingerPrint: false,
            formattedEmail: this.props.location.formattedEmail || "",
            currentState: ""
        }
        this.styles = {
            span2: {
                margin: GeneralUtilities.isScreenSetToMax ? '0.25rem' : '1rem',
                textAlign: 'center',
                align: "center"
            }
        }
        this.timer = 0;
        this.countDown = this.countDown.bind(this);
        this.twofactorMsg = "Autenticação de dois fatores não informada";
        this.componentName = PageNames.agreement;
        this.onBack = this.onBack.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.next = this.next.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.addEventListener("resize", this.checkIfInputIsActive);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
        window.onOtpHandle = (message) => {
            let otpString = message.match(/token [0-9]{6}/);
            if (otpString) {
                otpString = otpString[0].replace("token ", "")
                this.populateOtp(otpString)
            } else if (message === "LISTENING") {
                Log.sDebug("listening for otp");
            } else if (message === "failure") {
                Log.sDebug("failed to start listening for otp", this.componentName, constantObjects.LOG_PROD);
            } else if (message === "TIMEOUT") {
                Log.sDebug("timeout waiting for otp");
            } else {
                Log.sDebug("Unknown otp message format");
            }
        }
        androidApiCalls.readOtp();
        let timeLeftVar = this.secondsToTime(this.state.seconds);
        this.setState({ time: timeLeftVar });
        this.startTimer();
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

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.firstInputFocus && this.state.firstInputFocus) {
            this.refArray[0].current.focus();
            this.setState({ firstInputFocus: false });
        }
    }

    populateOtp = (otpString) => {
        otpString.split('').map((item, index) => {
            this.refArray[index].current.value = item;
            this.refArray[index].current.blur();
        })
        this.setState({ enableNext: true });
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        });
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        });
        MetricServices.onPageTransitionStop(PageNames.progressPage, PageState.close);
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

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    countDown() {
        let seconds = this.state.seconds - 1;
        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds,
        });
        if (seconds === 0) {
            this.setState({
                showResend: true
            })
        }
    }

    secondsToTime(secs) {
        let divisor_for_minutes = secs % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);

        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        let obj = {
            "m": minutes,
            "s": seconds
        };
        return obj;
    }

    sendField = () => {
        this.refArray.forEach((reference) => {
            reference.current.blur();
        });
        const value = this.refArray.map((reference) => reference.current.value);
        const otpValue = value.join("");
        if (otpValue.length < 6) {
            this.openSnackBar(localeObj.enter_complete_pin);
        } else {
            this.props.history.replace({ pathname: "/setUpPin", emailOTP: otpValue, transition: "left", "fromComponent": "EmailVerificationComponent" });
        }
    }

    handleFingerPrint = () => {
        let isBiometricsEnabled = androidApiCalls.checkBiometricsEnabled();
        if (isBiometricsEnabled === this.biometricAvailability.SUCCESS) {
            this.showEnableFingerprintBottomSheet();
        } else if (isBiometricsEnabled === this.biometricAvailability.NEEDS_SETUP) {
            this.setVerificationDialogueStatus(true);
        } else {
            this.props.history.replace({ pathname: "/setUpPin", transition: "right", "fromComponent": "EmailVerificationComponent" });
        }
    }

    showEnableFingerprintBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.first_access_fp_header,
            bottomSheetDescription: localeObj.first_access_fp_footer,
            primary_btn_text: localeObj.verify,
            bottomSheetType: this.bottomSheetTypes.ENABLE_FP_WARNING,
            bottomSheetSubText: localeObj.skip,
            openFingerPrint: true
        });
    }

    setVerificationDialogueStatus = (status) => {
        this.setState({ dialogOpen: status });
    }

    resetField = () => {
        if (this.refArray) {
            this.refArray.forEach((reference) => {
                if (reference && reference.current) {
                    reference.current.value = "";
                }
                this.setState({ firstInputFocus: true });
            });
        }
    }

    onBack = () => {
        if (this.state.open) {
            this.setState({ open: false });
            return;
        }
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.back);
            return this.props.history.replace({
                pathname: "/accountAprove",
                transition: "right"
            });
        }
    }

    onCancel = () => {
        this.setState({
            open: true,
            bottomHeader: localeObj.cancel_message_header,
            bottomDescription: localeObj.initial_cancel_message,
            primaryBtn: localeObj.resume,
            secondaryBtn: localeObj.stop,
            sheetType: "cancel",
        });
    }

    onChangeEmail = () => {
        this.props.history.replace("/profileDetails", { "fromComponent": "emailVerification", "currentState": "update_email" });
    }

    onSecondary = () => {
        this.setState({ open: false });
        if (this.state.sheetType === "cancel") {
            this.props.history.replace({
                pathname: "/",
                state: { from: this.componentName },
                transition: "right",
            });
        }
    };

    onPrimary = () => {
        this.setState({ open: false })
    }

    onOtpChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(Number(value)) && value !== "") {
            return
        }
        if (value !== "") {
            if (index < this.refArray.length - 1) {
                this.refArray[index + 1].current.focus();
            } else if (index === this.refArray.length - 1) {
                this.refArray.forEach(ref => {
                    ref.current.blur();
                });
            }
        }

        var otp = "";
        this.refArray.forEach(ref => {
            otp = otp + ref.current.value;
        });
        if (otp.length === this.refArray.length) {
            this.setState({ enableNext: true });
        } else {
            this.setState({ enableNext: false });
        }
    }

    maxLengthCheck = (object) => {
        if (object.target.value.length > Number(object.target.maxLength)) {
            object.target.value = object.target.value.slice(0, Number(object.target.maxLength))
        }
    }

    resend = () => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        this.showProgressDialog();
        ArbiApiService.sendingOTPToken(this.state.phoneNum).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                this.setState({
                    seconds: 150,
                    showResend: false
                })
            } else {
                this.openSnackBar(localeObj.otp_validation_fail);
                return;
            }
        })
    }

    onKeyDown = (index, e) => {
        if (e.keyCode === 189 || e.keyCode === 190) {
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
        }
        if (e.keyCode === 8) {
            if (index > 0 && this.refArray[index].current.value.length === 0) {
                this.refArray[index - 1].current.focus();
            }
        }
    }

    next = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace("/");
    }

    render() {
        const screenWidth = window.screen.width;
        const finalHeight = window.screen.height;
        let remainingWidth = (screenWidth - 3 * 6 * 16) / 2;
        let usewidth = remainingWidth < 24 || GeneralUtilities.isScreenSetToMax() ? false : true;
        const { classes } = this.props;

        return (
            <div>
                <ButtonAppBar header={localeObj.email} onBack={this.onBack} action="none" />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 470}px` : `${finalHeight - 280}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.email_verification}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                    {localeObj.email_otp_description + " " + this.state.formattedEmail}
                                </div>
                            </FlexView>
                        </div>
                        <div id="otpBox" style={{ width: "100%", alignSelf: "center", marginTop: "2.5rem", justifySelf: "center", marginLeft: "auto", marginRight: "auto" }}>
                            <form id="otpForm" style={{
                                display: "flex", justifyContent: "flex-start", margin: usewidth ? "1.5rem" : "1.5rem 0 1.5rem 1.5rem", flexDirection: 'row', flexWrap: "wrap"
                            }}>
                                {this.refArray.map((compInputRef, index) => (
                                    <input autoComplete='off'
                                        className="otp"
                                        ref={compInputRef}
                                        style={{
                                            width: "2.25rem", height: "2.25rem", padding: "0.325rem", textAlign: "center",
                                            borderRadius: "1rem", border: "none", fontSize: "2rem", backgroundColor: ColorPicker.newProgressBar,
                                            fontWeight: "400", marginRight: "0.25rem", color: ColorPicker.darkHighEmphasis
                                        }}
                                        onChange={((e) => this.onOtpChange(index, e))}
                                        type="tel" pattern="[0-9]*" inputMode="numeric"
                                        maxLength="1"
                                        min="0"
                                        onInput={this.maxLengthCheck}
                                        autoFocus={index === 0 ? true : undefined}
                                        key={index}
                                        onKeyDown={((e) => this.onKeyDown(index, e))}
                                    >
                                    </input>
                                ))}
                            </form>
                        </div>
                        <div className="body2 highEmphasis" style={{ width: "80%", display: (this.state.showResend ? 'none' : 'block'), textAlign: "center", margin: "1rem" }}>
                            {GeneralUtilities.formattedString(localeObj.time_limit, ["0" + this.state.time.m, this.state.time.s])}
                        </div>
                        <div style={{ display: (this.state.showResend ? 'block' : 'none') }}>
                            <FlexView column>
                                <div className="label2 accent" style={{ textAlign: "center" }} onClick={() => this.resend()}>
                                    {localeObj.code_resend}
                                </div>
                            </FlexView>
                        </div>
                        <FlexView column hAlignContent="center" style={this.state.fieldOpen ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                            <PrimaryButtonComponent btn_text={localeObj.verify} onCheck={this.sendField} disabled={!this.state.enableNext} />
                            <SecondaryButtonComponent btn_text={localeObj.change_email} onCheck={this.onChangeEmail} />
                        </FlexView>
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer" >
                    <Drawer classes={{ paper: classes.paper }} anchor="bottom" open={this.state.open} >
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomDescription}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", }}>
                            <PrimaryButtonComponent btn_text={this.state.primaryBtn} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={this.state.secondaryBtn} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.openFingerPrint}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomSheetHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomSheetDescription}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.primary_btn_text} onCheck={this.onPrimary} />
                            {/* {this.state.secondary_btn_text && <SecondaryButtonComponent btn_text={this.state.secondary_btn_text} onCheck={this.onSecondary} />} */}
                            {this.state.bottomSheetSubText && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.skipRegisterFP}>
                                {this.state.bottomSheetSubText}
                            </div>}
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

EmailVerificationComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(EmailVerificationComponent);




