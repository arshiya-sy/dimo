import React from "react";
import "../../../styles/main.css";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from "../../../Services/ArbiErrorResponsehandler";
import InputThemes from "../../../Themes/inputThemes";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import InputPinComponent from "../../CommonUxComponents/InputPinPage";
import ErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import SuccessComponent from "../PasswordandPinOperations/SuccessComponent";
import PhoneVerificationComponent from "../../DigitalCardComponents/CardArrivalComponents/TokenComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import PropTypes from "prop-types";

const theme1 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.forgotPinComponent;
var localeObj = {};

class ForgotPinComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pinState: "code",
            code: "",
            snackBarOpen: false,
            errors: {},
            message: "",
            direction: "",
            newpass: "",
            retype: "",
        };

        this.getCode = this.getCode.bind(this);
        this.getNewPin = this.getNewPin.bind(this);
        this.getRetypePin = this.getRetypePin.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(PageNames.ViewContaractDetails);
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);

        window.onBackPressed = () => {
            let securityJSON = {
                "from": "Password Page"
            }
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.pinState], PageState.back);
            if (this.props.location.state.from === "pinPage") {
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            } else {
                this.props.history.replace("/securityComp", { "passwordDetails": securityJSON });
            }
        }
    }

    getCode = (Vcode) => {
        Log.sDebug("Verification Code Entered", "ForgotPin");
        this.setState({
            code: Vcode,
            pinState: "new_pin",
            direction: "left"
        })
    }

    getNewPin = (new_pin) => {
        this.setState({
            newpass: new_pin,
            pinState: "retype_pin",
            direction: "left"
        })
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

    onSuccess = () => {
        if (this.props.location.state.from === "pinPage") {
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
        } else {
            let securityJSON = {
                "from": "Password Page"
            }
            this.props.history.replace("/securityComp", { "passwordDetails": securityJSON });
        }
    }

    onResend = () => {
        Log.sDebug("resend new token", "ForgotPin");
        this.showProgressDialog();
        arbiApiService.forgotAccountPin2fa(PageNameJSON.retype_pin)
            .then(response => {
                this.hideProgressDialog();
                Log.sDebug("Resend token sent", "ForgotPin");
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processforgotAccountPin2faResponse(response.result);
                    if (processorResponse.success) {
                        this.openSnackBar(localeObj.verfication_code_sent);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        Log.sDebug("Resend token failed", "ForgotPin");
                    }
                } else {
                    let errorMessage = ArbiErrorResponseHandler.processforgotAccountPin2faErrors(response.result, localeObj);
                    this.openSnackBar(errorMessage);
                    Log.sDebug("Resend token failed", "ForgotPin");
                    return;
                }
            })
    }

    getRetypePin = (retype_pin) => {

        if (this.state.newpass !== retype_pin) {
            Log.sDebug("New pin and retyped pin missmatched", "ForgotPin");
            this.setState({
                snackBarOpen: true,
                message: localeObj.password_dont_match
            })
            return;
        }
        this.setState({
            retype: retype_pin,
        })

        let pinChangeObj = {}
        pinChangeObj['token'] = this.state.code;
        pinChangeObj['newPin'] = this.state.newpass;

        this.showProgressDialog();
        arbiApiService.forgotAccountPin(pinChangeObj, PageNameJSON.retype_pin)
            .then(response => {
                this.hideProgressDialog();
                Log.sDebug("Pin changed successfully", "ForgotPin");
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processforgotAccountPinResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            message: localeObj.password_change_success,
                            pinState: "success",
                            direction: "left"
                        })
                    } else {
                        Log.sDebug("Forgot Pin Failed", "ForgotPin", constantObjects.LOG_PROD);
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorJSON = ArbiErrorResponseHandler.processforgotAccountPinErrors(response.result, localeObj);
                    Log.sDebug("Forgot Pin Failed", "ForgotPin", constantObjects.LOG_PROD);
                    this.setState({
                        errors: errorJSON,
                        pinState: "error",
                        direction: "left"
                    });
                    return;
                }
            })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const pinStatus = this.state.pinState;
        const successMessage = this.state.message;

        const onBack = () => {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.pinState], PageState.back);
            if (pinStatus === "retype_pin") {
                this.setState({
                    pinState: "new_pin"
                })
            } else {
                let securityJSON = {
                    "from": "Password Page"
                }
                this.props.history.replace("/securityComp", { "passwordDetails": securityJSON });
            }
        }
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: (pinStatus !== "error" && pinStatus !== "success"? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.account_password} onBack={onBack} action="none" />
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "code" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "code" ? 'block' : 'none') }}>
                        {pinStatus === "code" && <PhoneVerificationComponent messageSent={this.props.location.state.phoneNum} verify={this.getCode} resend={this.onResend}
                            componentName={PageNameJSON["code"]} type="phone" />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "new_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "new_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "new_pin" && <InputPinComponent header={localeObj.password_header} description={localeObj.password_descriptor}
                            confirm={this.getNewPin} componentName={PageNameJSON["new_pin"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "retype_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "retype_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "retype_pin" && <InputPinComponent header={localeObj.repeat_password_header} description={localeObj.repeat_password_descriptor}
                            confirm={this.getRetypePin} componentName={PageNameJSON["retype_pin"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "success" && <SuccessComponent message={successMessage} onFinish={this.onSuccess} componentName={PageNameJSON["success"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "error" && !this.state.processing ? true : false} timeout={300} classNames="pageSliderLeft">
                    <div style={{ display: (pinStatus === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "error" && !this.state.processing && <ErrorComponent errorJson={this.state.errors} onClick={onBack} componentName={PageNameJSON["error"]} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
ForgotPinComp.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
};
export default ForgotPinComp;