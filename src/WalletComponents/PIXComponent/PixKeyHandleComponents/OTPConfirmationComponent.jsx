import React, { createRef } from "react";
import FlexView from "react-flexview";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import PropTypes from "prop-types";
import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import { ERROR_IN_SERVER_RESPONSE } from "../../../Services/httpRequest"
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';

import logo from "../../../images/SpotIllustrations/Checkmark.png";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider} from "@material-ui/core/styles";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import constantObjects from "../../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
const pageName = PageNames.newKeyRequestOTP;
var localeObj = {};

export default class OTPConfirmationComponent extends React.Component {
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
            otp: [undefined, undefined, undefined, undefined, undefined, undefined],
            time: {},
            seconds: 150,

            key_type: this.props.location.state.key_type || "",
            value: this.props.location.state.value || "",
            type: this.props.location.state.type,
            claimType: this.props.location.state.claimType,
            payload: this.props.location.state.payload,

            pixTransactionState: "otp",
            resend: false,
            snackBarOpen: false,

            title: "",
            description: ""
        }
        this.timer = 0;
        this.countDown = this.countDown.bind(this);
        this.componentName = PageNames.newKeyRequestOTP;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName);
    }

    componentDidMount() {
        document.body.style.overflow = "hidden";
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        window.onBackPressed = () => {
            this.onBack();
        }
        window.onOtpHandle = (message) => {
            let otpString = message.match(/codigo [0-9]{6}/);
            if (otpString) {
                //matched
                otpString = otpString[0].replace("codigo ", "")
                this.populateOtp(otpString)
            } else if (message === "LISTENING") {
                //Log.sDebug("listening for otp");
            } else if (message === "failure") {
                //Log.sDebug("failed to start listening for otp", this.componentName, constantObjects.LOG_PROD);
            } else if (message === "TIMEOUT") {
                //Log.sDebug("timeout waiting for otp");
            } else {
                //Log.sDebug("Unknown otp message format");
            }
        }
        androidApiCalls.readOtp();
        let timeLeftVar = this.secondsToTime(this.state.seconds);
        this.setState({ time: timeLeftVar });
        this.startTimer();
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
        MetricServices.onTransitionStop();
        //Log.sDebug("exited at " + new Date(), "OTPConfirmationComponent");
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

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    populateOtp = (otpString) => {
        otpString.split('').map((item, index) => {
            this.refArray[index].current.value = item;
            this.refArray[index].current.blur();
        })
        this.setState({ enableNext: true });
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
            });
            this.stopCountDown();
        }
    }

    stopCountDown() {
        clearInterval(this.timer);
        this.timer = 0;
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
            //Log.sDebug("token entered at " + new Date(), "otpConfirmationComponent");
            this.onVerify(value.join(""));
        }
    }

    onResend = () => {
        //Log.sDebug("requested for new token", "otpConfirmationComponent");
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        this.showProgressDialog();
        ArbiApiService.sendTokenToPixKey(this.state.value, pageName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                this.openSnackBar(localeObj.resend_successful);
                this.setState({
                    seconds: 60,
                    showResend: false
                })

                this.refArray.forEach(inputRef => {
                    if (inputRef.current) {
                        inputRef.current.value = "";
                    }
                });
                
                let timeLeftVar = this.secondsToTime(this.state.seconds);
                this.setState({ time: timeLeftVar });
                this.startTimer();
            } else {
                let errorMessageToUser = localeObj.retry_later;
                if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                    if (response.result.message === this.VALIDATION_ERROR) {
                        errorMessageToUser = localeObj.validation_error;
                    } else {
                        errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    }
                }
                this.handleArbiResponse("failed", localeObj.key_registered_failure, errorMessageToUser);
            }
        });
    }

    onVerify = (pin) => {
        this.stopCountDown();
        switch (this.state.type) {
            case 1: //create pix key
                this.createPixKey(pin); break;

            case 2: //claim pix key
                //Log.sDebug("its pix port", "otpConfirmationComponent");
                this.sendRequestForPixClaim(pin); break;

            case 3: //conclude pix claim
                this.concludePixClaim(pin); break;

            case 4: //cancel pix claim
                this.cancelPixClaim(pin); break;
            default:
                break;
        }

    }

    concludePixClaim = (pin) => {
        this.showProgressDialog();
        let payload = {
            "claimId": this.state.payload.claimId,
            "type": this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? 2 : 3,
            "token": pin
        }
        ArbiApiService.concludePixClaim(payload, pageName).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                let success = ArbiResponseHandler.processConcludePixResponse(response.result);
                if (success) {
                    //Log.sDebug("pix key is yours now");
                    let description = this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.EMAIL ? localeObj.conclude_portability_success_email_desc : localeObj.conclude_portability_success_phone_desc;
                    this.handleArbiResponse("success", localeObj.conclude_portability_success_title, description);
                    return;
                }
            }
            //Log.sDebug("couldn't conclude pix claim " + this.state.payload.claimId);
            let details = localeObj.retry_later;
            details = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
            this.handleArbiResponse("failed", localeObj.key_registered_failure, details);
        });
    }

    cancelPixClaim = (pin) => {
        //Log.sDebug("calling cancelPortability");
        this.showProgressDialog();
        let payload = {
            "claimId": this.state.payload.claimId,
            "type": this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? 2 : 3,
            "token": pin
        }

        ArbiApiService.cancelPixClaim(payload, pageName).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                if (ArbiResponseHandler.processCancelPixResponse(response.result)) {
                    //Log.sDebug("cancelPortability success");
                    this.handleArbiResponse("success", localeObj.cancel_incoming_portability_success, localeObj.cancel_incoming_portability_description);
                    return;
                }
            }

            //Log.sDebug("couldn't cancel pix claim " + this.state.payload.claimId, "otpConfirmationComponent");
            let details = localeObj.retry_later;
            details = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
            this.handleArbiResponse("failed", localeObj.cancel_incoming_portability_failure, details);
        });
    }

    createPixKey = (pin) => {
        //Log.sDebug("selected type is " + this.state.key_type, "otpConfirmationComponent");
        if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.EMAIL) {
            this.showProgressDialog();
            ArbiApiService.createEmailPixKey(this.state.value, pin, pageName).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processCreateEmailPixKeyResponse(response.result);
                    if (processedResponse.success) {
                        this.handleArbiResponse("success", localeObj.key_registered_sucess, localeObj.type_key_registered_sucess_subtext);
                    } else {
                        let details = localeObj.retry_later;
                        if (processedResponse.details !== "") {
                            details = processedResponse.details;
                        }
                        this.handleArbiResponse("failed", localeObj.key_registered_failure, details);
                    }
                } else {
                    let errorMessageToUser = localeObj.retry_later;
                    if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                        if (response.result.message === this.INCOORRECT_TOKEN) {
                            errorMessageToUser = localeObj.incorrect_token;
                        } else {
                            errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                        }
                    }
                    this.handleArbiResponse("failed", localeObj.key_registered_failure, errorMessageToUser);
                }
            });
        } else {
            // phone number pix key
            this.showProgressDialog();
            ArbiApiService.createPhonePixKey(this.state.value, pin, pageName).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processCreatePhonePixKeyResponse(response.result);
                    if (processedResponse.success) {
                        this.handleArbiResponse("success", localeObj.key_registered_sucess,localeObj.type_key_registered_sucess_subtext);

                    } else {
                        let details = localeObj.retry_later;
                        if (processedResponse.details !== "") {
                            details = processedResponse.details;
                        }
                        this.handleArbiResponse("failed", localeObj.key_registered_failure, details);
                    }
                } else {
                    let errorMessageToUser = localeObj.retry_later;
                    if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                        if (response.result.message === this.INCOORRECT_TOKEN) {
                            errorMessageToUser = localeObj.incorrect_token;
                        } else {
                            errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                        }
                    }
                    this.handleArbiResponse("failed", localeObj.key_registered_failure, errorMessageToUser);
                }
            });
        }
    }

    handleArbiResponse = (status, title, text) => {
        if (status === "failed") {
            let jsonObj = {}
            jsonObj["title"] = localeObj.key_registered_failure;
            jsonObj["header"] = title;
            jsonObj["description"] = text;
            this.setState({
                pixTransactionState: "error",
                pixErrorJson: jsonObj
            })
        } else {
            this.setState({
                pixTransactionState: "success",
                title: title,
                description: text
            })
        }
    }

    sendRequestForPixClaim = (pin) => {
        //Log.sDebug("sendRequestForPixClaim");
        let payloadJson = {
            "pixKey": this.state.value,
            "claimType": this.state.claimType,
            "token": pin
        }

        let returnResponsePromise;
        this.showProgressDialog();
        if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.EMAIL) {
            returnResponsePromise = ArbiApiService.portEmailPixKey(payloadJson, pageName)
        } else {
            returnResponsePromise = ArbiApiService.portPhoneNumberPixKey(payloadJson, pageName)
        }

        returnResponsePromise.then((response) => {
            this.hideProgressDialog();
            let messageToUser = localeObj.retry_later;
            if (response.success) {
                let responseHandler = ArbiResponseHandler.processPixClaimResponse(response.result);
                if (responseHandler.success) {
                    messageToUser = this.state.claimType === 1 ? localeObj.ownership_request_successful : localeObj.portability_request_successful;
                }
            } else {
                messageToUser = ArbiErrorResponsehandler.processPixClaimErrors(response.result, localeObj);
            }
            //Log.sDebug(`sent a request for pix claim ${this.state.key_type} portability ${messageToUser}`, this.componentName);
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            ImportantDetails.fromRegisterPixKey = true;
            this.props.history.replace({ pathname: "/myPixKeysComponent", showSnackBar: true, snackBarDescription: messageToUser, snackBarTimeOut: 3000 });
        });
    }

    onBack = () => {
        ImportantDetails.fromRegisterPixKey = true;
        if (this.state.type === 3 || this.state.type === 4) {
            this.onMyKeys();
        } else {
            MetricServices.onPageTransitionStop(pageName, PageState.back);
            this.props.history.replace("/collectNewKeyDetailsComponent",
                {
                    "key_type": this.state.key_type,
                    "key_value": this.state.value
                })
        }
    }

    backHome = () => {
        ImportantDetails.fromRegisterPixKey = true;
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        this.props.history.replace("/pixLandingComponent")
    }

    onMyKeys = () => {
        ImportantDetails.fromRegisterPixKey = true;
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        this.props.history.replace("/myPixKeysComponent")
    }

    onOtpChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(Number(value)) && value !== "") {
            return;
        }
        const re = /^[0-9\b]+$/;
        if (!re.test(e.target.value)) {
            return;
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

    help = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        GeneralUtilities.openHelpSection();
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

    render() {
        const screenWidth = window.screen.width;
        const finalHeight = window.screen.height;
        const currentState = this.state.pixTransactionState;

        const selectType = () => {
            if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER) {
                return localeObj.forgot_phone_verification_text + " " + this.state.value;
            } else {
                return localeObj.email_verification_text + " " + this.state.value;
            }
        }
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: (currentState === "otp" ? 'block' : 'none') }}>
                    <ButtonAppBar onBack={this.onBack} action="none"
                        header={(this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? localeObj.phone_number_verify : localeObj.email_verify)} />

                    <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                        <div style={{ height: this.state.fieldOpen ? `${finalHeight - 470}px` : `${finalHeight - 280}px`, overflowY: "auto" }}>
                            <div style={InputThemes.initialMarginStyle}>
                                <FlexView column>
                                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                        {this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? localeObj.phone_number_verify : localeObj.email_verify}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.4rem" }}>
                                        {selectType()}
                                    </div>
                                </FlexView>
                            </div>
                            <div id="otpBox" style={{ width: "100%", alignSelf: "center", marginTop: "2.5rem", justifySelf: "center", marginRight: "auto" }}>
                                <form id="otpForm" style={{
                                    display: "flex", justifyContent: "flex-start", margin: "1.5rem 0 1.5rem 1.5rem", flexDirection: 'row', flexWrap: "wrap"
                                }}>
                                    {this.refArray.map((compInputRef, index) => (
                                        <input autoComplete='off'
                                            className="otp"
                                            ref={compInputRef}
                                            style={{
                                                width: "2.5rem", height: "2.5rem", padding: "6px", textAlign: "center",
                                                borderRadius: "6px", border: "none", fontSize: "2rem", backgroundColor: ColorPicker.surface3,
                                                fontWeight: "400", marginRight: "0.25rem", color: ColorPicker.darkHighEmphasis
                                            }}
                                            onChange={((e) => this.onOtpChange(index, e))}
                                            type="number" pattern="[0-9]*" inputMode="numeric"
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
                                <div className="body2 mediumEmphasis" style={{ width: "100%", textAlign: "center", display: (this.state.showResend ? 'none' : 'block') }}>
                                    {GeneralUtilities.formattedString(localeObj.time_limit, ["0" + this.state.time.m, this.state.time.s])}
                                </div>
                            </div>
                            <div style={{ margin: "1.5rem 2.5rem", display: (this.state.showResend ? 'block' : 'none') }}>
                                <FlexView column>
                                    <div className="body2 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.code_not_recieved}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "4px" }} onClick={() => this.onResend()}>
                                        <u>{localeObj.resend_code}</u>
                                    </div>
                                </FlexView>
                            </div>
                            <FlexView column hAlignContent="center" style={this.state.fieldOpen ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                                <PrimaryButtonComponent btn_text={localeObj.verify} onCheck={this.sendField} disabled={!this.state.enableNext} />
                                <div onClick={() => this.help()} style={{ textAlign: "center", color: ColorPicker.darkHighEmphasis, marginTop: GeneralUtilities.isScreenSetToMax ? "0.5rem" : "1.5rem" }}>
                                    {localeObj.help}
                                </div>
                            </FlexView>
                        </div>
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.backHome} />}
                </div>
                <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "success" &&
                        <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: finalHeight, overflowY: "hidden" }}>
                            <ImageInformationComponent type="FinalPage" header={this.state.title} icon={logo} appBar={false} close={this.backHome}
                                description={this.state.description} btnText={localeObj.my_keys} next={this.onMyKeys} secBtnText={localeObj.back_home} />
                        </div>
                    }
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

OTPConfirmationComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};
