import React, { createRef } from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker"

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import constantObjects from "../../Services/Constants";
import HelloShopUtil from '../EngageCardComponent/HelloShopUtil';
import GeneralUtilities from "../../Services/GeneralUtilities";

const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
var localeObj = {};

export default class SetPinComponent extends React.Component {
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

    sendField = () => {
        this.refArray.forEach((reference) => {
            reference.current.blur();
        });
        const value = this.refArray.map((reference) => reference.current.value);
        if (value.join("").toString().length < 4) {
            this.openSnackBar(localeObj.enter_complete_pin);
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.confirm(value.join(""));
            this.setInitialfocus();
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
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;

        if (this.props.clearPassword && this.state.clearPassword) {
            this.setState({
                clearPassword: false
            })
            this.resetField();
            this.setInitialfocus();
        }
        return (
            <div style={{ overflowX: "hidden" }}>
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
                <div style={{ ...fieldOpen, textAlign: "center" }}>
                    <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
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

SetPinComponent.propTypes = {
    componentName: PropTypes.string,
    clearPassword: PropTypes.bool,
    confirm: PropTypes.func,
    header: PropTypes.string,
    fgts: PropTypes.string,
    requiredInfo: PropTypes.object,
    setTransactionInfo: PropTypes.func,
};