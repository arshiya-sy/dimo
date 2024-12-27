import React from "react";
import "../../../styles/main.css";
import ColorPicker from "../../../Services/ColorPicker";
import InputThemes from "../../../Themes/inputThemes";
import FlexView from "react-flexview"

import List from '@material-ui/core/List';
import MuiAlert from '@material-ui/lab/Alert';
import Switch from '@material-ui/core/Switch';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import Snackbar from '@material-ui/core/Snackbar';
import ListItemText from '@material-ui/core/ListItemText';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import Log from "../../../Services/Log";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import constantObjects from "../../../Services/Constants";
import errorCodeList from "../../../Services/ErrorCodeList";
import arbiApiService from "../../../Services/ArbiApiService";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ConfirmFormComponent from "../../OnBoardingSupportComponents/ConfirmFormComponent";
import AccordianComponent from "../../NewUserProfileComponents/ProfileDetails/AccordianComp";
import PropTypes from "prop-types";

// const styles = InputThemes.singleInputStyle;
const securityPageName = PageNames.userProfileSecurity;
var localeObj = {};

const styles = () => ({
    drawerPaper: {
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        backgroundColor: "RGB(31, 63, 94) !important"
    },
    snackbar: {
        backgroundColor: "RGB(31, 63, 94) !important"
    }
})

const SwitchStyle = withStyles({
    switchBase: {
        width: "1.5rem",
        color: ColorPicker.buttonAccent,
        '&$checked': {
            color: ColorPicker.buttonAccent,
        },
        '&$checked + $track': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
    checked: {},
    track: {},
})(Switch);

class SecurityComponent extends React.Component {

    biometricAvailability = Object.freeze({ SUCCESS: "success", FAILURE: "failure", NEEDS_SETUP: "require" });
    bottomSheetTypes = Object.freeze({ ENABLE_FP_WARNING: "ENABLE_FP_WARNING", DISABLE_FP_WARNING: "DISABLE_FP_WARNING", FORGOT_PASSWORD: "FORGOT_PASSWORD", WRONG_PASSWORD: "WRONG_PASSWORD" });

    constructor(props) {
        super(props);
        let isBiometricsSetup = androidApiCalls.checkBiometricsEnabled() === this.biometricAvailability.SUCCESS;
        let isFpEnabled = isBiometricsSetup && androidApiCalls.isBiometricEnabled() === 1;
        this.state = {
            expanded1: false,
            expanded2: false,
            checked2: isFpEnabled,
            bottomSheet1: false,
            bottomSheet2: false,
            email: "",
            phoneNum: "" || this.props.location.phoneNumber,
            cpf: "",
            dialogOpen: false,
            password: "",
            showPasswordScreen: false,
            clearPassword: false,
            processing: false
        }
        this.componentName = "Security";
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(securityPageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        if (this.props.location.state && this.props.location.state.passwordDetails && this.props.location.state.passwordDetails.from !== undefined && this.props.location.state.passwordDetails.from === "Account Page") {
            this.setState({
                email: this.props.location.state.passwordDetails.email,
                phoneNum: this.props.location.state.passwordDetails.phone_number,
                cpf: this.props.location.state.passwordDetails.cpf
            })
        } else {
            this.showProgressDialog();
            arbiApiService.getAllClientData(this.componentName).then(response => {
                if (response.success) {
                    //Log.sDebug("User Details Fetched", "SecurityComp");
                    let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            email: processorResponse.data.email,
                            phoneNum: `+55 ${processorResponse.data.telefoneMovel.ddd.substring(1, 3)} ${processorResponse.data.telefoneMovel.numero}`,
                            cpf: ImportantDetails.cpf
                        })
                        this.hideProgressDialog();
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        this.hideProgressDialog();
                        return;
                    }
                } else {
                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj)
                    this.openSnackBar(errorMessage);
                    this.hideProgressDialog();
                    return;
                }
            })
        }

        window.onBackPressed = () => {
            MetricServices.onPageTransitionStop(securityPageName, PageState.back);
            if (this.props.location.state && GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            if (this.props.location.state && this.props.location.state.from === "pinPage") {
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            } else {
                this.props.history.replace({ pathname: "/myAccount", transition: "right" });
            }
        }

        if (this.props.location.state && this.props.location.state.from === "pinPage") {
            this.setState({
                bottomSheet1: !(this.state.bottomSheet1)
            });
        }
    }

    getProfileDetailsOfUser(clientData) {
        let nickname = ImportantDetails.nickName;

        if (nickname === "") {
            nickname = this.state.userName;
        }

        let profilePayload = {
            "name": clientData.nome,
            "email": clientData.email,
            "phoneNum": "+55 " + clientData.telefoneMovel.ddd.substring(1, 3) + " " + clientData.telefoneMovel.numero.substring(0, 5) + "-" + clientData.telefoneMovel.numero.substring(5, 9),
            "address": GeneralUtilities.formatAddress(clientData),
            "nickName": nickname,
            "isEmailVerified": clientData.emailConfirmado
        }
        return profilePayload;
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(securityPageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(securityPageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    handleFingerPrint = () => {
        let newFpSwitchValue = !this.state.checked2;
        // Log.sDebug("Finger Print switch operation, enable finger print state -" + newFpSwitchValue, "SecurityComp");
        if (!newFpSwitchValue) {

            this.showDisableFingerprintEnrollBottomSheet();
            // Log.sDebug("Diasble finger operation", "SecurityComp");


        } else {
            // Log.sDebug("Enable finger operation", "SecurityComp");
            // ask user to enter username and password, verify it from arbi and then enable biometric login
            // check if fingerprint is enrolled, if not ask user to enroll into fingerprint
            let isBiometricsEnabled = androidApiCalls.checkBiometricsEnabled();
            if (isBiometricsEnabled === this.biometricAvailability.NEEDS_SETUP) {
                // Log.sDebug("Biometric is not set up", "SecurityComp");
                this.setVerificationDialogueStatus(true);
            } else if (isBiometricsEnabled === this.biometricAvailability.SUCCESS) {
                this.showEnableFingerprintBottomSheet();
                // Log.sDebug("Biometric is set up - show bottom sheet", "SecurityComp");
            } else {
                this.openSnackBar(localeObj.no_biometric);
                // Log.sDebug("No Biometric for device", "SecurityComp");
            }
        }
    }

    showDisableFingerprintEnrollBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.disable_fingerprint_title,
            bottomSheetDescription: localeObj.disable_fingerprint_desc,
            primary_btn_text: localeObj.disable,
            bottomSheetType: this.bottomSheetTypes.DISABLE_FP_WARNING,
            bottomSheetSubText: "",
            open: true
        });
    }

    showEnableFingerprintBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.enable_fingerprint_title,
            bottomSheetDescription: localeObj.enable_fp_my_account_desc,
            primary_btn_text: localeObj.verify,
            bottomSheetType: this.bottomSheetTypes.ENABLE_FP_WARNING,
            bottomSheetSubText: "",
            open: true
        });
    }

    showIncorrectPasswordBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.wrong_password_text,
            bottomSheetDescription: localeObj.wrong_password_description,
            primary_btn_text: localeObj.try,
            bottomSheetType: this.bottomSheetTypes.WRONG_PASSWORD,
            bottomSheetSubText: localeObj.forgot_password_subText,
            open: true
        });
    }

    forgotPassword = () => {
        //Log.sDebug("User clicked forgot password", "SecurityComp");
        this.setState({
            bottomSheetHeader: localeObj.forgot_password_bottom,
            bottomSheetDescription: localeObj.forgot_password_description,
            primary_btn_text: localeObj.send,
            bottomSheetType: this.bottomSheetTypes.FORGOT_PASSWORD,
            bottomSheetSubText: localeObj.help,
            open: true
        })
    }

    onPrimary = () => {
        this.setState({ open: false })
        switch (this.state.bottomSheetType) {
            case this.bottomSheetTypes.WRONG_PASSWORD:
                this.setState({
                    clearPassword: true
                });
                break;

            case this.bottomSheetTypes.FORGOT_PASSWORD: this.sendMessage(); break;

            case this.bottomSheetTypes.ENABLE_FP_WARNING:
                this.setState({
                    showPasswordScreen: true
                });
                break;

            case this.bottomSheetTypes.DISABLE_FP_WARNING:
                //also clear credentials from storage
                androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
                androidApiCalls.setBiometricFlag(2);
                androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.MASKED_CPF_KEY);

                this.openSnackBar(localeObj.fp_disable);
                this.setState({ checked2: false });
                break;
            default:
                break;
        }
    }

    onSecondary = () => {
        this.setState({ open: false });
    }

    setVerificationDialogueStatus = (status) => {
        this.setState({ dialogOpen: status });
    }

    cancelVerification = () => {
        this.setVerificationDialogueStatus(false);
    }

    handleCredentialsChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    verify = (password) => {
        let jsonObject = {};
        jsonObject["usuario"] = ImportantDetails.clientKey;
        jsonObject["Senha"] = password;
        jsonObject["metadados"] = arbiApiService.getMetadata();

        this.showProgressDialog();
        arbiApiService.authenticateUserWithClientKey(jsonObject, this.componentName)
            .then(response => {

                this.hideProgressDialog();
                if (response.success) {
                    let data = response.result;
                    let processedResponseForLogin = ArbiResponseHandler.processAuthenticateUserApiResponse(data);
                    if (processedResponseForLogin && processedResponseForLogin.loginSuccess) {
                        this.storeCredentials();
                    } else {

                        this.setState({
                            showPasswordScreen: false
                        });
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {

                    Log.verbose("Login failed with error - " + response.result.details, this.componentName);

                    if (response.result.code === errorCodeList.INVALID_USERNAME_PASSWORD) {
                        this.showIncorrectPasswordBottomSheet();
                    } else if (response.result.details) {
                        this.openSnackBar(response.result.details);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                }
            });
    }

    storeCredentials = () => {
        //Log.sDebug("Store Credentials operation", "SecurityComp");
        let jsonObject = {
            userName: ImportantDetails.clientKey,
            password: this.state.password,
            accountKey: ImportantDetails.accountKey,
            clientName: ImportantDetails.userName,
            cpf: ImportantDetails.cpf
        }
        //store clientkey, password, accestoken, accestokenexpirytime
        androidApiCalls.storeEncryptPrefs(GeneralUtilities.CREDENTIALS_KEY, JSON.stringify(jsonObject), true);


        window.onEncryptCompleted = (key, statusOrData) => {
            this.setState({
                password: "",
                showPasswordScreen: false,
            });
            if (statusOrData !== "failure") {
                this.setState({ checked2: true });
                //user credentials have been successfully stored , login via fingerprint next time
                //Log.sDebug("user credentials have been successfully stored , login via fingerprint next time", "SecurityComp");
                androidApiCalls.setBiometricFlag(1);
                androidApiCalls.storeToPrefs(GeneralUtilities.MASKED_CPF_KEY, GeneralUtilities.maskCpf(ImportantDetails.cpf));
                this.openSnackBar(localeObj.fp_enable);

            } else {
                this.openSnackBar(localeObj.not_biometric);
                //Log.sDebug("Biometry not authorized for device", "SecurityComp");
            }
        }
    }

    verifyPassword = (field) => {
        this.setState({
            password: field
        })
        return this.verify(field);
    }

    help = () => {
        //Log.sDebug("User chose to get help", "SecurityComp");
        this.setState({ open: false })
        if (this.state.bottomSheetType === this.bottomSheetTypes.WRONG_PASSWORD) {
            this.forgotPassword();
        } else if (this.state.bottomSheetType === this.bottomSheetTypes.FORGOT_PASSWORD) {
            MetricServices.onPageTransitionStop(securityPageName, PageState.close);
            GeneralUtilities.openHelpSection();
        }
    }

    sendMessage = () => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        let jsonObject = {};
        jsonObject["cpf"] = ImportantDetails.cpf;
        this.showProgressDialog();
        arbiApiService.forgotPassword(jsonObject)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processForgotPasswordResponse(response.result);
                    if (processorResponse.success) {
                        this.props.history.replace("/forgotPassword", { "email": processorResponse.message, "cpf": ImportantDetails.cpf });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.openSnackBar(errorMessage);
                }
            })
    };

    primary = () => {
        this.setState({
            bottomSheet1: false
        })
        this.showProgressDialog();
        arbiApiService.forgotAccountPin2fa(this.componentName)
            .then(response => {
                this.hideProgressDialog();
                //Log.sDebug("Token sent, forgot pin", "SecurityComp");
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processforgotAccountPin2faResponse(response.result);
                    if (processorResponse.success) {
                        //Log.sDebug("Message has been sent to the user", "SecurityComp");
                        this.openSnackBar(processorResponse.message);
                        let from = "myAccount";
                        if (this.props.location.state && this.props.location.state.from === "pinPage") {
                            from = "pinPage";
                        }
                        MetricServices.onPageTransitionStop(securityPageName, PageState.close);
                        this.props.history.replace("/newForgotPin", { "phoneNum": this.state.phoneNum, "from": from });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.openSnackBar(errorMessage);
                    return;
                }
            })
    }

    registerFp = () => {
        androidApiCalls.askToSetUpBiometrics();
        this.setVerificationDialogueStatus(false);
        window.fingerprintEnrollComplete = (result) => {
            Log.sDebug("fingerprintEnrollComplete " + result, "SecurityComp");
            // if (result) {
            //     this.setVerificationDialogueStatus(false);
            //     this.showEnableFingerprintBottomSheet();
            // }
        }
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

        const { classes } = this.props;

        const onChangePassowrd = () => {
            MetricServices.onPageTransitionStop(securityPageName, PageState.close);
            this.props.history.replace({ pathname: "/newChangePassword", "phoneNumber": this.state.phoneNum });
        }

        const onChangePin = () => {
            MetricServices.onPageTransitionStop(securityPageName, PageState.close);
            this.props.history.replace({ pathname: "/newChangePin", "phoneNumber": this.state.phoneNum });
        }

        const onBack = () => {
            MetricServices.onPageTransitionStop(securityPageName, PageState.back);
            if (this.props.location.state && GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            if (this.props.location.state && this.props.location.state.from === "pinPage") {
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            } else {
                this.props.history.replace({ pathname: "/myAccount", transition: "right" });
            }
        }

        const openBottomSheet1 = () => {
            this.setState({
                bottomSheet1: true
            });
        }

        const closeBottomSheet1 = () => {
            this.setState({
                bottomSheet1: false
            });
        }

        const onHelp = () => {
            closeBottomSheet1();
            MetricServices.onPageTransitionStop(securityPageName, PageState.close);
            /*this.props.history.replace({
                pathname: "/helpPage",
                callingUrl: this.props.location.pathname,
                resumeState: this.props.location.state
            })*/
            GeneralUtilities.openHelpSection();
        }

        const screenHeight = window.screen.height;

        return (
            <div>
                <ButtonAppBar header={this.state.showPasswordScreen ? localeObj.enable_fp_password_verify_title : localeObj.security} onBack={onBack} action="none" />
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={InputThemes.SecurityInputTheme}>
                    <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                        {this.state.showPasswordScreen === true ?
                            <div style={{ display: (this.state.showPasswordScreen === true ? 'block' : 'none') }}>
                                {this.state.showPasswordScreen === true && <ConfirmFormComponent header={localeObj.login_password} field={localeObj.password} recieveField={this.verifyPassword} type="password"
                                    btnText={localeObj.verify} forgotPassword={this.forgotPassword} value={this.state.password} clearPassword={this.state.clearPassword} />}
                            </div> :
                            <div style={{ width: "100%", height: `${0.65 * screenHeight}px`, overflow: 'scroll' }}>
                                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                                    <FlexView column align="left" style={{ width: "100%", marginTop: "1rem" }}>
                                        <AccordianComponent
                                            primary={localeObj.app_password}
                                            secondary={localeObj.app_to_access}
                                            button1={localeObj.change_password_top}
                                            onChange={onChangePassowrd} />
                                        <AccordianComponent
                                            primary={localeObj.account_password}
                                            secondary={localeObj.account_to_access}
                                            button1={localeObj.change_password_top}
                                            button2={localeObj.forgot_password_top}
                                            onForgot={() => openBottomSheet1()}
                                            onChange={onChangePin} />
                                        <div style={{ textAlign: "left" }}>
                                            <List>
                                                <ListItem disablePadding={true} align="left" style={{ paddingLeft: "1.5rem", width: "95%", display: "flex" }}>
                                                    <ListItemText style={{ display: "flex", justifyContent: "flex-start", flexDirection: "column" }} align="left" className="body2 highEmphasis"
                                                        primary={localeObj.enable_device_security}
                                                        secondary={localeObj.enable_device_security_bottom} />
                                                    <span style={{ display: "flex", justifyContent: "flex-end", textAlign: "right" }}>
                                                        <SwitchStyle checked={this.state.checked2} onChange={() => this.handleFingerPrint()} />
                                                    </span>
                                                </ListItem>
                                            </List>
                                        </div>
                                    </FlexView>
                                </div>
                                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                                    {this.state.processing && <CustomizedProgressBars />}
                                </div>
                            </div>
                        }
                    </div>
                </MuiThemeProvider>
                <div style={{ width: "100%" }} >
                    <Drawer classes={{ paper: classes.drawerPaper }}
                        anchor="bottom"
                        open={this.state.dialogOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.no_fp_register}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.register_fp} onCheck={this.registerFp} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.cancelVerification} />
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        classes={{ paper: classes.drawerPaper }}
                        open={this.state.phoneNum && this.state.bottomSheet1}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.forgot_password_bottom}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.forgot_bottom} {this.state.phoneNum}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.send} onCheck={this.primary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={closeBottomSheet1} />
                        </div>
                        <FlexView column align="center" className="body2 highEmphasis" style={{ width: "100%", marginBottom: "1.5rem" }} onClick={() => onHelp()}>
                            <span style={{ textAlign: "center" }}>
                                {localeObj.need_help}
                            </span>
                        </FlexView>
                    </Drawer>
                </div>
                <div style={{ width: "100%" }} >
                    <Drawer classes={{ paper: classes.drawerPaper }}
                        anchor="bottom"
                        open={this.state.open}>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.primary_btn_text} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                            <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.help}>
                                {this.state.bottomSheetSubText}
                            </div>
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert classes={{ root: classes.snackbar }} elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        )
    }
}
SecurityComponent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object
};
export default withStyles(styles)(SecurityComponent);
