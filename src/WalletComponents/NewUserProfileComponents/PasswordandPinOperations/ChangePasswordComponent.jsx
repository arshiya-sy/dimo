import React from "react";
import "../../../styles/main.css";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import { CSSTransition } from 'react-transition-group';
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';

import DetailFormComponent from "../../OnBoardingSupportComponents/DetailFormComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent"
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import SuccessComponent from "../PasswordandPinOperations/SuccessComponent";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import InputThemes from "../../../Themes/inputThemes";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import PropTypes from "prop-types";

const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.passwordChangeComponent;
var localeObj = {};

class ChangePasswordComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            passwordState: "new_password",
            newpass: "",
            direction: "",
            retype: "",
            snackBarOpen: false,
            message: ""
        };
        this.getNewPassword = this.getNewPassword.bind(this);
        this.getRetypePassword = this.getRetypePassword.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onSuccess = () => {
        androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
        androidApiCalls.setBiometricFlag(0);

        this.props.history.replace({ pathname: "/newLogin", transition: "right" });
    }

    getNewPassword = (new_password) => {
        Log.sDebug("Setting new password", "ChangePasswordMain");
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

    getRetypePassword = (retype_password) => {
        Log.sDebug("retyped new password", "ChangePasswordMain");
        if (this.state.newpass !== retype_password) {
            Log.sDebug("retyped password did not match", "ChangePasswordMain");
            this.setState({
                snackBarOpen: true,
                message: localeObj.password_dont_match
            });
            return;
        }
        this.setState({
            retype: retype_password,
        })

        let jsonObject = {};
        jsonObject["novaSenha"] = this.state.newpass;
        this.showProgressDialog();
        arbiApiService.changePassword(jsonObject, PageNameJSON.retype_password)
            .then(response => {
                Log.sDebug("Change Password Success", "ChangePasswordMain");
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processChangePasswordResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            message: localeObj.password_change_success,
                            passwordState: "success",
                            direction: "left"
                        })
                    } else {
                        Log.sDebug("Password Change Failed", "ChangePasswordMain", constantObjects.LOG_PROD);
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                    }
                } else {
                    Log.sDebug("redirecting", "ChangePasswordMainnt");
                    let errorMessageToUser = ArbiErrorResponseHandler.processChangeUserPasswordError(response.result, localeObj);
                    androidApiCalls.showToast(errorMessageToUser);
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.errorMessageToUser
                    })
                }
            })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.passwordState], PageState.back);
            Log.sDebug("back from " + this.state.passwordState, "ChangePasswordMain");
            if (this.state.passwordState === "new_password") {
                let securityJSON = {
                    "from": "Password Page"
                }
                this.props.history.replace({pathname: "/securityComp", "passwordDetails": securityJSON, "phoneNumber" : this.props.location.phoneNumber});
            } else if (this.state.passwordState === "retype_password") {
                this.setState({
                    passwordState: "new_password",
                    direction: "right"
                })
            }
        }
    }

    render() {
        const passwordStatus = this.state.passwordState;
        const successMessage = this.state.message;

        return (
            <div style={{ overflowX: "hidden" }}>
                {passwordStatus !== "success" && <ButtonAppBar header={localeObj.app_password} onBack={this.onBack} action="none" />}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "new_password" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "new_password" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "new_password" && <DetailFormComponent header={localeObj.setup_new_password} description={localeObj.password_descriptor} field={localeObj.password} type={"password"}
                            recieveField={this.getNewPassword}
                            value = {this.state.newpass}
                            componentName={PageNameJSON["new_password"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "retype_password" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "retype_password" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "retype_password" && <DetailFormComponent header={localeObj.repeat_password_header} description={localeObj.repeat_password_descriptor} type={"password"}
                           value = {this.state.retype} field={localeObj.password} recieveField={this.getRetypePassword} componentName={PageNameJSON["retype_password"]} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={passwordStatus === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (passwordStatus === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {passwordStatus === "success" && <SuccessComponent message={successMessage} onFinish={this.onSuccess} componentName={PageNameJSON["success"]} />}
                    </div>
                </CSSTransition>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
ChangePasswordComp.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
};
export default ChangePasswordComp;