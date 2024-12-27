import React, { createRef } from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import ColorPicker from "../../Services/ColorPicker";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import constantObjects from "../../Services/Constants";
import httpRequest from "../../Services/httpRequest";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import HelloShopUtil from '../EngageCardComponent/HelloShopUtil';
import GeneralUtilities from "../../Services/GeneralUtilities";

import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
const styles = InputThemes.singleInputStyle;
var localeObj = {};

class InputPinPageWithValidation extends React.Component {
    constructor(props) {
        super(props);
        this.codeOne = createRef();
        this.codeTwo = createRef();
        this.codeThree = createRef();
        this.codeFour = createRef();
        this.refArray = [this.codeOne,
        this.codeTwo,
        this.codeThree,
        this.codeFour]
        this.state = {
            otp: [undefined, undefined, undefined, undefined],
            clearPassword: true,
            snackBarOpen: false,
            time: {},
            seconds: 10,
            processing: false
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "INPUT PIN PAGE"
        }
        this.timer = 0;
        this.countDown = this.countDown.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        this.setInitialfocus();

        let hsTimeOutValue = HelloShopUtil.getTimeOutValue(JSON.stringify(this.props.requiredInfo));
        this.setState({
            seconds: hsTimeOutValue,
        });

        if (HelloShopUtil.isHelloShopDimopayQRPayment(JSON.stringify(this.props.requiredInfo))) {
            if (hsTimeOutValue > 0) {
                let timeLeftVar = GeneralUtilities.secondsToTime(hsTimeOutValue);
                this.setState({ time: timeLeftVar });
                this.startTimer();
            } else {
                let jsonObj = {};
                jsonObj["error"] = true;
                jsonObj["reason"] = HelloShopUtil.HS_TIMEOUT_ERROR_CODE;
                this.props.setTransactionInfo(jsonObj)
                this.stopCountDown();
            }
        }

        window.onBackPressed = () => {
            if (this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false });
            } else if (this.state.reset) {
                this.setState({ reset: false })
            } else {
                this.props.back();
            }
        }
    }

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        let secondsToTime = GeneralUtilities.secondsToTime(seconds);
        this.setState({
            time: secondsToTime,
            seconds: seconds,
        });
        // Check if we're at zero.
        if (seconds === 0) {
            let jsonObj = {};
            jsonObj["error"] = true;
            jsonObj["reason"] = HelloShopUtil.HS_TIMEOUT_ERROR_CODE;
            this.props.confirm(jsonObj)
            this.stopCountDown();
        }
    }

    stopCountDown() {
        clearInterval(this.timer);
        this.timer = 0;
    }

    async setInitialfocus() {
        await this.getReferenceByAsync(0);
        setTimeout(() => {
            this.refArray[0].current.blur();
            this.refArray[0].current.focus();
        }, 100);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.firstInputFocus && this.state.firstInputFocus) {
            this.refArray[0].current.focus();
            this.setState({ firstInputFocus: false });
        }
    }

    getReferenceByAsync = index => new Promise(resolve => {
        const getRef = () => {
            const ref = this.refArray[index];
            if (ref) {
                resolve(ref);
            }
        };
        getRef();
    });


    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        this.stopCountDown();
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
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

    sendField = () => {
        this.refArray.forEach((reference) => {
            reference.current.blur();
        });
        const value = this.refArray.map((reference) => reference.current.value);
        if (value.join("").toString().length < 4) {
            this.openSnackBar(localeObj.enter_complete_pin);
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            let pin = value.join("");
            this.showProgressDialog();
            arbiApiService.validatePin(pin, this.componentName).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processValidatePinResponse(response.result);
                    if (processorResponse.success) {
                        this.props.confirm(pin);
                    }
                } else {
                    this.resetField();
                    this.setInitialfocus();
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        this.openSnackBar(localeObj.tryAgainLater);
                    } else if ('' + response.result.code === "10007") {
                        this.setState({ bottomSheetOpen: true })
                    } else if ('' + response.result.code === "40096" || response.result.message === constantObjects.EXPIRY_ERROR) {
                        this.setState({ reset: true })
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                }
            });
        }
    }

    onPrimaryPin = () => {
        this.setState({
            bottomSheetOpen: false
        });
    }

    onSecondaryPin = () => {
        this.setState({ bottomSheetOpen: false })
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
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

    onOtpChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(Number(value)) && value !== "") {
            return
        }

        if (value !== "") {
            if (index === 3) {
                this.refArray[index].current.focus();
            } else if (index < this.refArray.toString().length - 1) {
                this.refArray[index + 1].current.focus();
            } else if (index === this.refArray.toString().length - 1) {
                this.refArray.forEach(ref => {
                    ref.current.blur();
                });
            }
        }
    }

    onKeyDown = (index, e) => {
        if (e.keyCode === 189 || e.keyCode === 190) {
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
        }
        if (e.keyCode === 8) {
            if (index > 0 && this.refArray[index].current.value.toString().length === 0) {
                this.refArray[index - 1].current.focus();
            }
        }
    }

    maxLengthCheck = (object) => {
        if (object.target.value.toString().length > object.target.maxLength) {
            object.target.value = object.target.value.slice(0, object.target.maxLength)
        }
    }

    resetField = () => {
        this.refArray.forEach((reference) => {
            if (reference && reference.current) {
                reference.current.value = "";
            }
            this.setState({ firstInputFocus: true });
        });
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
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle
        if (this.props.clearPassword && this.state.clearPassword) {
            this.setState({
                clearPassword: false
            })
            this.resetField();
            this.setInitialfocus();
        }
        return (
            <div>
                <div style={{ overflowX: "hidden", display: !this.state.processing ? 'block' : 'none' }}>
                    <FlexView column style={InputThemes.initialMarginStyle}>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {this.props.header ? this.props.header : this.props.fgts ? this.props.fgts : localeObj.four_digit_auth}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                            {this.props.header ? localeObj.pin_description : ""}
                        </div>
                    </FlexView>
                    <div id="otpBox" style={{ width: "100%", alignSelf: "center", marginTop: "2.5rem", justifySelf: "center", marginLeft: "auto", marginRight: "auto" }}>
                        <form id="otpForm" style={{ display: "flex", justifyContent: "flex-start", margin: "1.5rem", flexDirection: 'row', flexWrap: "wrap" }}>
                            {this.refArray.map((compInputRef, index) => (
                                <input autoComplete='off'
                                    className="otp"
                                    ref={compInputRef}
                                    style={{
                                        width: "2.25rem", height: "2.25rem", padding: "0.5rem", textAlign: "center",
                                        borderRadius: "1rem", border: "none", fontSize: "2rem", backgroundColor: ColorPicker.newProgressBar,
                                        fontWeight: "400", marginRight: "0.5rem", color: ColorPicker.darkHighEmphasis
                                    }}
                                    onChange={((e) => this.onOtpChange(index, e))}
                                    type="password" pattern="[0-9]*" inputMode="numeric"
                                    maxLength="1"
                                    onInput={this.maxLengthCheck}
                                    autoFocus={index >= 0 ? true : false}
                                    key={index}
                                    onKeyDown={((e) => this.onKeyDown(index, e))}
                                >
                                </input>
                            ))}
                        </form>
                    </div>
                    {this.state.seconds > 0 && <div style={{ align: "center", marginLeft: "1.5rem", marginRight: "1.5rem", position: "fixed", bottom: "6.875rem", padding: "1rem", backgroundColor: ColorPicker.disableBlack, borderRadius: ".75rem" }}>
                        <FlexView>
                            <span style={{ marginRight: "1rem", paddingTop: ".5rem", paddingBottom: "0.5rem" }} className="headline7 accent"> {this.state.time.h > 0 ? (this.state.time.h + ":" + this.state.time.m + ":" + this.state.time.s) : (this.state.time.m + ":" + this.state.time.s)}</span>
                            <span style={{ marginRight: "1.375rem" }} className="tableLeftStyle highEmphasis">{localeObj.hs_timeout_message}</span>
                        </FlexView>
                    </div>
                    }
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                        <Drawer classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.bottomSheetOpen}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                    <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.wrong_passcode}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                        {localeObj.wrong_passcode_header}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.try} onCheck={this.onPrimaryPin} />
                                <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondaryPin} />
                                <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.forgot_passcode}>
                                    {localeObj.forgot_passcode}
                                </div>
                            </div>
                        </Drawer>
                    </div>
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                        <Drawer classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.reset}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                    <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.reset_password}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                        {localeObj.pin_expired}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                            </div>
                        </Drawer>
                    </div>
                    <div style={{ ...fieldOpen, textAlign: "center" }}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div>
        )
    }
}

InputPinPageWithValidation.propTypes = {
    componentName: PropTypes.string,
    clearPassword: PropTypes.bool,
    confirm: PropTypes.func,
    header: PropTypes.string,
    fgts: PropTypes.string,
    requiredInfo: PropTypes.object,
    setTransactionInfo: PropTypes.func,
    back: PropTypes.func,
    history: PropTypes.object,
    classes: PropTypes.object
};
export default withStyles(styles)(InputPinPageWithValidation);