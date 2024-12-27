import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';

import Drawer from '@material-ui/core/Drawer';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ArbiApiService from "../../Services/ArbiApiService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ConfirmFormComponent from "../OnBoardingSupportComponents/ConfirmFormComponent";
import errorCodeList from "../../Services/ErrorCodeList";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;

const SwitchStyle = withStyles({
    width: "6%",
    switchBase: {
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

const styles = {
    paper: InputThemes.singleInputStyle.paper
};

var localeObj = {};

class AppSettings extends React.Component {

    biometricAvailability = Object.freeze({ SUCCESS: "success", FAILURE: "failure", NEEDS_SETUP: "require" });
    bottomSheetTypes = Object.freeze({ ENABLE_FP_WARNING: "ENABLE_FP_WARNING", DISABLE_FP_WARNING: "DISABLE_FP_WARNING", FORGOT_PASSWORD: "FORGOT_PASSWORD", WRONG_PASSWORD: "WRONG_PASSWORD" });

    constructor(props) {
        super(props);
        let isBiometricsSetup = androidApiCalls.checkBiometricsEnabled() === this.biometricAvailability.SUCCESS;
        let isFpEnabled = isBiometricsSetup && androidApiCalls.isBiometricEnabled() === 1;
        this.state = {
            checked1: false,
            checked2: isFpEnabled,
            checked3: false,
            checked4: false,
            checked5: false,
            dialogOpen: false,
            password: "",
            phoneNum: "",
            showPasswordScreen: false,
            clearPassword: false,
            processing: false
        }
        this.componentName = "AppSettings";
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onTransitionStart("AppSettings");
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }

        ArbiApiService.getAllClientData(this.componentName).then(response => {
            if (response.success) {
                Log.sDebug("Phone Number Fetched", "AppSettings");
                let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
                if (processorResponse.success) {
                    let clientData = processorResponse.data
                    this.setState({
                        phoneNum: "+55 " + clientData.telefoneMovel.ddd.substring(1, 3) + " " + clientData.telefoneMovel.numero.substring(0, 5) + "-" + clientData.telefoneMovel.numero.substring(5, 9)
                    })
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.tryAgainLater
                })
                return;
            }
        })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onTransitionStop();
        } else if (visibilityState === "visible") {
            MetricServices.onTransitionStart("AppSettings");
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        MetricServices.onTransitionStop();
    }

    onSelectOption() {
        androidApiCalls.showToast(localeObj.coming_soon);
    }

    handleGeoloaction() {
        this.setState({
            checked1: !(this.state.checked1)
        })
    }

    handleFingerPrint = () => {
        let newFpSwitchValue = !this.state.checked2;
        if (!newFpSwitchValue) {

            this.showDisableFingerprintEnrollBottomSheet();

        } else {
            // ask user to enter username and password, verify it from arbi and then enable biometric login
            // check if fingerprint is enrolled, if not ask user to enroll into fingerprint
            let isBiometricsEnabled = androidApiCalls.checkBiometricsEnabled();
            if (isBiometricsEnabled === this.biometricAvailability.NEEDS_SETUP) {
                this.setVerificationDialogueStatus(true);
            } else if (isBiometricsEnabled === this.biometricAvailability.SUCCESS) {
                this.showEnableFingerprintBottomSheet();
            } else {
                this.openSnackBar(localeObj.no_biometric)
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

    verify = () => {
        let jsonObject = {};

        jsonObject["usuario"] = ImportantDetails.clientKey;
        jsonObject["Senha"] = this.state.password;
        jsonObject["metadados"] = ArbiApiService.getMetadata();

        this.showProgressDialog();
        ArbiApiService.authenticateUserWithClientKey(jsonObject, this.componentName).then(response => {
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
                androidApiCalls.setBiometricFlag(1);
                androidApiCalls.storeToPrefs(GeneralUtilities.MASKED_CPF_KEY, GeneralUtilities.maskCpf(ImportantDetails.cpf));
                this.openSnackBar(localeObj.fp_enable);

            }
        }
    }

    handleReminders() {
        this.setState({
            checked3: !(this.state.checked3)
        })
    }

    handleTransfers() {
        this.setState({
            checked4: !(this.state.checked4)
        })
    }

    handleNews() {
        this.setState({
            checked5: !(this.state.checked5)
        })
    }

    verifyPassword = (field) => {
        this.setState({ password: field })
        return this.verify();
    }


    help = () => {
        this.setState({ open: false })
        if (this.state.bottomSheetType === this.bottomSheetTypes.WRONG_PASSWORD) {
            this.forgotPassword();
        } else if (this.state.bottomSheetType === this.bottomSheetTypes.FORGOT_PASSWORD) {
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
        ArbiApiService.forgotPassword(jsonObject)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processForgotPasswordResponse(response.result);
                    if (processorResponse.success) {
                        this.openSnackBar(processorResponse.message);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    this.openSnackBar(localeObj.tryAgainLater);
                }
            })
    };

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    registerFp = () => {
        androidApiCalls.askToSetUpBiometrics();
        window.fingerprintEnrollComplete = (result) => {
            if (result) {
                this.setVerificationDialogueStatus(false);
                this.showEnableFingerprintBottomSheet();
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

        const onBack = () => {
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }

        const { classes } = this.props;

        return (
            <div>
                <ButtonAppBar header={this.state.showPasswordScreen ? localeObj.enable_fp_password_verify_title : localeObj.app_settings} onBack={onBack} action="none" />
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>

                    {this.state.showPasswordScreen === true ?
                        <div style={{ display: (this.state.showPasswordScreen === true ? 'block' : 'none') }}>

                            {this.state.showPasswordScreen === true && <ConfirmFormComponent header={localeObj.login_password} field={localeObj.password} recieveField={this.verifyPassword} type="password"
                                btnText={localeObj.verify} forgotPassword={this.forgotPassword} value={this.state.password} clearPassword={this.state.clearPassword} />}
                        </div> :
                        <div>
                            <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                                <div style={{ margin: "1.5rem" }}>
                                    <FlexView column align="left">
                                        <List>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.enable_device_security}
                                                    secondary={localeObj.enable_device_security_bottom} />
                                                <span style={{ textAlign: "right" }}>
                                                    <SwitchStyle checked={this.state.checked2} onChange={() => this.handleFingerPrint()} />
                                                </span>
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.geolocation}
                                                    secondary={localeObj.geolocation_bottom} />
                                                <span style={{ textAlign: "right" }}>
                                                    <SwitchStyle checked={this.state.checked1} onChange={() => this.handleGeoloaction()} />
                                                </span>
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "1.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.notifications} />
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.reminders}
                                                    secondary={localeObj.reminders_bottom} />
                                                <span style={{ textAlign: "right" }}>
                                                    <SwitchStyle checked={this.state.checked3} onChange={() => this.handleReminders()} />
                                                </span>
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.transactions}
                                                    secondary={localeObj.transactions_bottom} />
                                                <span style={{ textAlign: "right" }}>
                                                    <SwitchStyle checked={this.state.checked4} onChange={() => this.handleTransfers()()} />
                                                </span>
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.news_promotions}
                                                    secondary={localeObj.news_promotions_bottom} />
                                                <span style={{ textAlign: "right" }}>
                                                    <SwitchStyle checked={this.state.checked5} onChange={() => this.handleNews()} />
                                                </span>
                                            </ListItem>
                                        </List>
                                    </FlexView>
                                </div>
                            </MuiThemeProvider>
                        </div>
                    }


                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                    <div style={{ width: "100%" }} >
                        <Drawer classes={{ paper: classes.paper }}
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
                    <div style={{ width: "100%" }} >
                        <Drawer classes={{ paper: classes.paper }}
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
                </div>
            </div>
        )
    }
}

AppSettings.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AppSettings);
