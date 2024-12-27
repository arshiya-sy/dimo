import React from "react";
import "../../../styles/main.css";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from "../../../Services/ArbiErrorResponsehandler";
import InputThemes from "../../../Themes/inputThemes";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import SuccessComponent from "../PasswordandPinOperations/SuccessComponent";
import PhoneVerificationComponent from "../../DigitalCardComponents/CardArrivalComponents/TokenComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import DetailFormComponent from "../../OnBoardingSupportComponents/DetailFormComponent";
import PropTypes from "prop-types";

var localeObj = {};
const theme1 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.forgotPasswordComponent;

class ForgotPasswordComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            passwordState: "code",
            cpf: this.props.location.state.cpf,
            code: "",
            snackBarOpen: false,
            errors: {},
            message: "",
            direction: "",
            newpass: "",
            retype: "",
            flag: false
        };

        this.getCode = this.getCode.bind(this);
        this.getNewPassword = this.getNewPassword.bind(this);
        this.getRetypePassword = this.getRetypePassword.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onTransitionStart("ForgotPasswordMain");
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);

        window.onBackPressed = () => {
            this.onBack();
        }
    }

    getCode = (Vcode) => {
        this.setState({
            code: Vcode,
            passwordState: "new_password",
            direction: "left"
        })
    }

    getNewPassword = (new_password) => {
        this.setState({
            newpass: new_password,
            passwordState: "retype_password",
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
        androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
        androidApiCalls.setBiometricFlag(0);
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.passwordState], PageState.back);
        this.props.history.replace({ pathname: "/newLogin", transition: "right" });
    }

    onResend = () => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["cpf"] = this.state.cpf;
        this.showProgressDialog();
        arbiApiService.forgotPassword(jsonObject)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processForgotPasswordResponse(response.result);
                    if (processorResponse.success) {
                        this.openSnackBar(localeObj.verfication_code_sent);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    let errorMessage = ArbiErrorResponseHandler.processforgotAccountPin2faErrors(response.result, localeObj);
                    this.openSnackBar(errorMessage);
                }
            })
    }

    getRetypePassword = (retype_password) => {

        if (this.state.newpass !== retype_password) {
            Log.sDebug("New password and retyped password missmatched", "ForgotPassword");
            this.setState({
                snackBarOpen: true,
                message: localeObj.password_dont_match
            })
            return;
        }
        this.setState({
            retype: retype_password,
        })

        let passwordChangeObj = {}
        passwordChangeObj['token'] = this.state.code;
        passwordChangeObj['newPassword'] = this.state.newpass;
        passwordChangeObj['cpf'] = this.state.cpf;

        this.showProgressDialog();
        arbiApiService.changeForgottenPassword(passwordChangeObj, PageNameJSON.retype_password)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processChangePasswordResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            message: localeObj.password_change_success,
                            snackBarOpen: true,
                            flag: true
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorJSON = {
                        "header": localeObj.password_change_failed,
                        "description": response.result.message
                    };
                    this.setState({
                        errors: errorJSON,
                        passwordState: "error",
                        direction: "left"
                    });
                    return;
                }
            })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
        if(this.state.flag === true){
            this.setState({
                flag: false
            })
            this.onSuccess();
        }
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.passwordState], PageState.back);
            if (this.state.passwordState === "new_password") {
                this.setState({
                    passwordState: "code",
                    direction: "right"
                })
            } else if (this.state.passwordState === "retype_password") {
                this.setState({
                    passwordState: "new_password",
                    direction: "right"
                })
            } else if (this.state.passwordState === "success") {
                this.onSuccess();
            } else {
                this.props.history.replace({ pathname: "/newLogin", transition: "right" });
            }
        }
    }

    onHelp = () => {
        GeneralUtilities.openHelpSection();
    }

    render() {
        const passwordStatus = this.state.passwordState;
        const successMessage = this.state.message;

        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: (passwordStatus !== "error" && passwordStatus !== "success" ? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.reset_app_password} onBack={this.onBack} action="none" />
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "code" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "code" ? 'block' : 'none') }}>
                        {passwordStatus === "code" && <PhoneVerificationComponent messageSent={this.props.location.state.email} verify={this.getCode} resend={this.onResend} type="email" onHelp={this.onHelp} componentName={PageNameJSON["code"]}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "new_password" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "new_password" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "new_password" && <DetailFormComponent header={localeObj.setup_new_password} description={localeObj.password_descriptor} field={localeObj.password} type={"password"} recieveField={this.getNewPassword} componentName={PageNameJSON["new_password"]}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "retype_password" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "retype_password" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "retype_password" && <DetailFormComponent header={localeObj.repeat_password_header} description={localeObj.repeat_password_descriptor} type={"password"} field={localeObj.password} recieveField={this.getRetypePassword} componentName={PageNameJSON["retype_password"]}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "success" && <SuccessComponent message={successMessage} onFinish={this.onSuccess} componentName={PageNameJSON["success"]}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "error" && !this.state.processing ? true : false} timeout={300} classNames="pageSliderLeft">
                    <div style={{ display: (passwordStatus === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "error" && !this.state.processing && <ErrorComponent errorJson={this.state.errors} onClick={this.onBack} componentName={PageNameJSON["error"]}/>}
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
ForgotPasswordComp.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
};
export default ForgotPasswordComp;