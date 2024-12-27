import React, { createRef } from 'react';
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import Countdown from 'react-countdown';

import PageState from '../../../Services/PageState';
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import Log from '../../../Services/Log';
import constantObjects from '../../../Services/Constants';

const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
var localeObj = {};

export default class ProfileDetailsOtpComp extends React.Component {
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
            pin: "",
            resend: false,
            otpTimeout: Date.now() + 60000,
            snackBarOpen: false,
            message: ""
        }
        this.styles = {
            item: {
                width: "88%",
                marginLeft: "6%",
                marginRight: "6%",
                marginTop: "7%"
            },
            subItem: {
                width: "88%",
                marginLeft: "6%",
                marginRight: "6%",
                marginTop: "3%"
            },
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "ENTER OTP";
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        MetricServices.onPageTransitionStart(this.componentName);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        console.log(this.props);

        window.onOtpHandle = (message) => {
            let otpString = message.match(/token [0-9]{6}/);
            if (!!otpString) {
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

        if (this.props.type !== "email") {
            androidApiCalls.readOtp();
        }

        setTimeout(
            function () {
                this.setState({ resend: true });
            }
                .bind(this),
            60000);
    }

    visibilityChange = (e) => {
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

    populateOtp = (otpString) => {
        otpString.split('').map((item, index) => {
            this.refArray[index].current.value = item;
            this.refArray[index].current.blur();
            return index;
        })
        this.setState({ enableNext: true });
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }


    onResend = () => {
        this.props.resend();
    }

    onVerify = () => {
        this.refArray.forEach((reference) => {
            reference.current.blur();
        });
        const value = this.refArray.map((reference) => reference.current.value);
        if (value.join("").length < 6) {
            this.openSnackBar(localeObj.enter_complete_pin);
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.verify(value.join(""));
        }
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

    checkIfInputIsActive = (e) => {
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

    onHelp = () => {
        if (!!this.props.onHelp) {
            this.props.onHelp()
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            GeneralUtilities.openHelpSection();
        }
    }

    // Renderer callback with condition
    renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            return <span className="body2 errorRed">{localeObj.pin_invalid}</span>;
        } else {
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return <div className="body2 highEmphasis" style={{ width: "100%", marginTop: "1rem", textAlign: "center" }}>
                {GeneralUtilities.formattedString(localeObj.profile_time_limit, ["0" + minutes, seconds])}
            </div>
        }
    };

    render() {
        const screenWidth = window.screen.width;
        const finalHeight = window.screen.height;
        let remainingWidth = (screenWidth - 3 * 6 * 16) / 2;
        let usewidth = remainingWidth < 24 || GeneralUtilities.isScreenSetToMax ? false : true;

        return (
            <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 470}px` : `${finalHeight - 280}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div align="left">
                    <div style={this.styles.item}>
                        <span className="headline5 highEmphasis">
                            {this.props.header}
                        </span>
                    </div>
                    <div style={this.styles.subItem}>
                        <span className="body2 highEmphasis">
                            {this.props.desc}
                        </span>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <div id="otpBox" style={{ width: "100%", alignSelf: "center", marginTop: "2.5rem", justifySelf: "center", marginRight: "auto" }}>
                            <form id="otpForm" style={{
                                display: "flex", justifyContent: "flex-start", margin: usewidth ? "1.5rem" : "1.5rem 6%", flexDirection: 'row', flexWrap: "wrap"
                            }}>
                                {this.refArray.map((compInputRef, index) => (
                                    <input autoComplete='off'
                                        className="otp"
                                        ref={compInputRef}
                                        style={{
                                            width: "2.5rem", height: "2.5rem", padding: "0.5rem", textAlign: "center",
                                            borderRadius: "1rem", border: "none", fontSize: "2rem", backgroundColor: ColorPicker.newProgressBar,
                                            fontWeight: "400", marginRight: "0.25rem", color: ColorPicker.darkHighEmphasis
                                        }}
                                        onChange={((e) => this.onOtpChange(index, e))}
                                        type="number" pattern="[0-9]*" inputmode="numeric"
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
                        <div style={this.styles.subItem}>
                            <Countdown date={this.state.otpTimeout} autoStart={true} renderer={this.renderer} />
                        </div>
                        <div style={{ display: (this.state.resend ? "block" : "none") }}>
                            <div align="center" style={{ width: "88%", marginLeft: "6%", marginRight: "6%", marginTop: "5%" }}>
                                <span className="body2 highEmphasis">
                                    {localeObj.resend_code_message}
                                </span>
                            </div>
                            <div align="center" style={{ width: "88%", marginLeft: "6%", marginRight: "6%", marginTop: ".5%" }} onClick={() => this.onResend()}>
                                <span className="body2 highEmphasis" style={{ textDecorationLine: 'underline' }}>
                                    {localeObj.resend_new_code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div align="center" style={this.state.fieldOpen ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.profile_verify} onCheck={this.onVerify} disabled={!this.state.enableNext} />
                    </div>
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
