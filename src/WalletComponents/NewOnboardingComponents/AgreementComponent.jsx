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

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const environment = Globals.getDigitalAccountEvironment();
const screenHeight = window.innerHeight;
var localeObj = {};

class AgreementComponent extends React.Component {
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
            steps: 21,
            open: false,
            snackBarOpen: false,
            phoneNum: props.location.state,
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
                //matched
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
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds,
        });
        // Check if we're at zero.
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
        if (value.join("").length < 6) {
            this.openSnackBar(localeObj.enter_complete_pin);
        } else {
            this.onSubmit(value);
        }
    }

    resetField = () => {
        if(this.refArray){
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
        } else {
            if (this.state.processing) {
                return this.setState({
                    snackBarOpen: true,
                    message: localeObj.no_action
                })
            } else {
                MetricServices.onPageTransitionStop(this.componentName, PageState.back);
                return this.props.history.replace({ pathname: "/terms", transition: "right" });
            }
        }
    }

    onCancel = () => {
        this.setState({ open: true })
    }

    onSecondary = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
        this.props.history.replace({ pathname: "/", transition: "right" });
        this.setState({ open: false })
    }

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
        arbiApiService.twoFactorAuth()
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    this.openSnackBar(response.result.mensagem);
                    this.setState({
                        seconds: 150,
                        showResend: false
                    })
                } else {
                    if (response.result.message === this.twofactorMsg) {
                        this.openSnackBar(localeObj.try_in_20_sec);
                        return;
                    } else {
                        this.openSnackBar(localeObj.otp_validation_fail);
                        return;
                    }
                }
            })
    }

    help = () => {
        GeneralUtilities.openHelpSection();
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

    async acceptTos(tokenObj) {
        return new Promise((resolve, reject) => {
            arbiApiService.acceptTermsofService(tokenObj, this.componentName)
                .then(response => {
                    if (response.success === false) {
                        this.hideProgressDialog();
                        if (response.result.message === this.twofactorMsg) {
                            this.openSnackBar(localeObj.try_in_20_sec);
                            reject('none')
                        } else {
                            let errorMessageToUser = localeObj.retry_later;
                            errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                            this.openSnackBar(errorMessageToUser);
                            this.resetField();
                            reject('none')
                        }
                    } else if (response.success === true) {
                        let processorResponse = ArbiResponseHandler.processAcceptTermsResponse(response.result, 1);
                        if (processorResponse.success) {
                            resolve('signed')
                        }
                    }
                }).catch(err => {
                    this.hideProgressDialog();
                    Log.sError("Error from: ", err);
                    reject('none')
                });
        });

    }

    async acceptToa(tokenObj) {
        return new Promise((resolve, reject) => {
            arbiApiService.acceptTermsofAddress(tokenObj, this.componentName)
                .then(response => {
                    if (response.success === false) {
                        this.hideProgressDialog();
                        if (response.result.message === this.twofactorMsg) {
                            this.openSnackBar(localeObj.try_in_20_sec);
                            reject('none')
                        } else {
                            let errorMessageToUser = localeObj.retry_later;
                            errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                            this.openSnackBar(errorMessageToUser);
                            this.resetField();
                            reject('none')
                        }
                    } else if (response.success === true) {
                        let processorResponse = ArbiResponseHandler.processAcceptTermsResponse(response.result, 2);
                        if (processorResponse.success) {
                            resolve('signed')
                        }
                    }
                }).catch(err => {
                    this.hideProgressDialog();
                    Log.sError("Error is: ", err);
                    reject('none')
                });
        });

    }

    async onSubmit(value) {
        var jsonObject = { "token": value.join("") }
        this.showProgressDialog();
        await Promise.all([await this.acceptToa(jsonObject), await this.acceptTos(jsonObject)])
            .then(values => {
                Log.debug("promises.all " + JSON.stringify(values));
                arbiApiService.getAllClientData(this.componentName).then(response => {
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "onBoard");
                        if (processorResponse.success) {
                            if (processorResponse.emailConfirmed) {
                                this.hideProgressDialog();
                                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                                this.props.history.replace("/waitingApproval");
                            } else {
                                this.takeToEmailConfirmation();
                            }
                        } else {
                            this.takeToEmailConfirmation();
                        }
                    } else {
                        this.takeToEmailConfirmation();
                    }
                }).catch(err => {
                    Log.sError("Error is: ", err);
                    this.takeToEmailConfirmation();
                });
            }).catch(err => {
                Log.sError("Error is: ", err);
                this.openSnackBar(localeObj.dialog_error);
            });
    }

    takeToEmailConfirmation = () => {
        // Could not verify if email confirmed or not
        // Take to mail confirmation screen
        this.hideProgressDialog();
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace("/validateEmail");
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
        const steps = this.state.steps;
        const { classes } = this.props;

        const selectType = () => {
            if (environment === arbiEnvironment.PRODUCTION) {
                return localeObj.otp_description + " " + this.state.phoneNum;
            } else {
                return localeObj.email_verification_text + " " + this.state.phoneNum;
            }
        }

        return (
            <div>
                <ButtonAppBar header={localeObj.acc_verification} onBack={this.onBack} onCancel={this.onCancel} action="cancel" />
                <ProgressBar size={steps} />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 470}px` : `${finalHeight - 280}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.otp_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                    {selectType()}
                                </div>
                            </FlexView>
                        </div>
                        <div id="otpBox" style={{ width: "100%", alignSelf: "center", marginTop: "2.5rem", justifySelf: "center", marginLeft: "auto", marginRight: "auto" }}>
                            <form id="otpForm" style={{
                                display: "flex", justifyContent: "flex-start", margin: usewidth ? "1.5rem 0 0 1.5rem" : "1.5rem 0 1.5rem 1.5rem", flexDirection: 'row', flexWrap: "wrap"
                            }}>
                                {this.refArray.map((compInputRef, index) => (
                                    <input autoComplete='off'
                                        className="otp"
                                        ref={compInputRef}
                                        style={{
                                            width: "2.5rem", height: "2.5rem", padding: "0.325rem", textAlign: "center",
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
                        <div className="body2 highEmphasis" style={{ width: "100%", display: (this.state.showResend ? 'none' : 'block'), textAlign: "center", marginTop: "1rem" }}>
                            {GeneralUtilities.formattedString(localeObj.time_limit, ["0" + this.state.time.m, this.state.time.s])}
                        </div>
                        <div style={{ margin: "2.5rem 1.5rem", display: (this.state.showResend ? 'block' : 'none') }}>
                            <FlexView column>
                                <div className="body1 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.code_not_recieved}
                                </div>
                                <div className="body1 highEmphasis" style={{ textAlign: "center", marginTop: "0.25rem" }} onClick={() => this.resend()}>
                                    <u>{localeObj.resend_code}</u>
                                </div>
                            </FlexView>
                        </div>
                        <FlexView column hAlignContent="center" style={this.state.fieldOpen ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                            <PrimaryButtonComponent btn_text={localeObj.verify} onCheck={this.sendField} disabled={!this.state.enableNext} />
                            <div className="body2 highEmphasis" style={this.styles.span2} onClick={() => this.help()}>
                                {localeObj.help}
                            </div>
                        </FlexView>
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.cancel_message_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.cancel_message_description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
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

AgreementComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(AgreementComponent);
