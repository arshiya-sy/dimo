import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";

import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import dimo_logo from "../../images/Placeholder.png";
import new_dimo_rebranding_image from "../../images/Placeholder.png";

import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import { ONBOARD_STATUS } from "../../Services/MetricsService";
import androidApiCalls from "../../Services/androidApiCallsService";

import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";
import Log from "../../Services/Log";

var localeObj = {};
const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.forgotPasswordComponent;
class AccountApproveComponent extends React.Component {

    biometricAvailability = Object.freeze({ SUCCESS: "success", FAILURE: "failure", NEEDS_SETUP: "require" });
    bottomSheetTypes = Object.freeze({ ENABLE_FP_WARNING: "ENABLE_FP_WARNING", DISABLE_FP_WARNING: "DISABLE_FP_WARNING", FORGOT_PASSWORD: "FORGOT_PASSWORD", WRONG_PASSWORD: "WRONG_PASSWORD" });
    constructor(props) {
        super(props);
        this.next = this.next.bind(this);
        this.componentName = PageNames.firstAccessAccountApproved;
        this.state = {
            dialogOpen: false,
            open: false,
            processing: false,
            formattedEmail: ""
        };
        this.Styles = {
            bodyDiv: {
                width: "100%"
            },
            span1: {
                textAlign: 'center',
                margin: "1.5rem",
                marginBottom: "1rem"
            },
            span2: {
                margin: '0% 10%',
                textAlign: 'center',
            }
        }

        this.userName = "";
        this.accountKey = "";

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
            MetricServices.onPageTransitionStart(this.componentName);
            document.addEventListener("visibilitychange", this.visibilityChange);
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_APPROVED);
        window.onBackPressed = () => {
            this.onCancel();
        }
    }

    componentWillUnmount() {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    next = async () => {
        this.showProgressDialog();
        await ArbiApiService.forgotAccountPin2fa(PageNameJSON.code).then((response) => {
            this.hideProgressDialog();
            if (response && response.success) {
                let processorResponse = ArbiResponseHandler.processforgotAccountPin2faResponse(response.result);
                if (processorResponse && processorResponse.success) {
                    const mensagem = response.result.mensagem;
                    const formattedMensagem = mensagem.split(" ").pop();;
                    this.setState({ formattedEmail: formattedMensagem }, () => {
                        this.props.history.replace({ pathname: "/EmailVerification", transition: "left", formattedEmail: this.state.formattedEmail, "fromComponent": "accountApproveComponent" });
                    })
                } else {
                    this.openSnackBar(localeObj.tryAgainLater);
                }
            } else {
                this.hideProgressDialog();
                let errorMessage = ArbiErrorResponsehandler.processforgotAccountPin2faErrors(response.result, localeObj);
                this.openSnackBar(errorMessage);
                Log.sDebug("Resend token after One Minute", "ForgotPin");
                return;
            }
        })
    };

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    onCancel = () => {
        if (this.state.dialogOpen || this.state.open) {
            this.props.history.replace({ pathname: "/setUpPin", transition: "right", "fromComponent": "accountApproveComponent" });
        } else {
            this.props.history.replace({ pathname: "/", transition: "right" });
        }
    }

    showEnableFingerprintBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.first_access_fp_header,
            bottomSheetDescription: localeObj.first_access_fp_footer,
            primary_btn_text: localeObj.verify,
            bottomSheetType: this.bottomSheetTypes.ENABLE_FP_WARNING,
            bottomSheetSubText: localeObj.skip,
            open: true
        });
    }

    handleFingerPrint = () => {
        let isBiometricsEnabled = androidApiCalls.checkBiometricsEnabled();
        if (isBiometricsEnabled === this.biometricAvailability.SUCCESS) {
            this.showEnableFingerprintBottomSheet();
        } else if (isBiometricsEnabled === this.biometricAvailability.NEEDS_SETUP) {
            this.setVerificationDialogueStatus(true);
        } else {
            this.props.history.replace({ pathname: "/setUpPin", transition: "right", "fromComponent": "accountApproveComponent" });
        }
    }

    skipRegisterFP = () => {
        this.props.history.replace({ pathname: "/setUpPin", transition: "right", "fromComponent": "accountApproveComponent" });
    }

    setVerificationDialogueStatus = (status) => {
        this.setState({ dialogOpen: status });
    }

    cancelVerification = () => {
        this.setVerificationDialogueStatus(false);
    }

    registerFp = () => {
        androidApiCalls.askToSetUpBiometrics();
        window.fingerprintEnrollComplete = (result) => {
            if (result) {
                this.storeCredentials();
            }
        }
    }

    onPrimary = () => {
        this.setState({ open: false })
        this.storeCredentials();
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        });
    }

    storeCredentials = () => {

        let jsonObject = {};
        jsonObject["userName"] = ImportantDetails.clientKey;
        jsonObject["password"] = this.props.location.state.password;
        jsonObject["accountKey"] = this.accountKey;
        jsonObject["clientName"] = this.userName;
        jsonObject["cpf"] = this.props.location.state.cpf;
        androidApiCalls.storeEncryptPrefs(GeneralUtilities.CREDENTIALS_KEY, JSON.stringify(jsonObject), true);
        //androidApiCalls.storeToPrefs(GeneralUtilities.MASKED_CPF_KEY, GeneralUtilities.maskCpf(ImportantDetails.cpf));

        window.onEncryptCompleted = (key, statusOrData) => {
            if (statusOrData !== "failure") {
                androidApiCalls.setBiometricFlag(1);
                androidApiCalls.storeToPrefs(GeneralUtilities.MASKED_CPF_KEY, GeneralUtilities.maskCpf(this.props.location.state.cpf));
                this.props.history.replace({ pathname: "/setUpPin", transition: "right", "fromComponent": "accountApproveComponent" });
            }
            else {
                this.fpTimeout = setTimeout(() => {
                    clearTimeout(this.fpTimeout);
                    this.props.history.replace({ pathname: "/setUpPin", transition: "right", "fromComponent": "accountApproveComponent" });
                }, 1000);
            }
        }
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        let Styles = this.Styles;
        return (
            <div>
                {!this.state.processing && <div style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                    <div className='scrollContainer' style={{ width: screenWidth, overflow: "scroll", position: "relative" }}>
                        {/* <FlexView column hAlignContent="center" style={{ width: screenWidth }}>
                            <img style={{ marginTop: "1.5rem", height: `${0.095 * screenHeight}px` }} src={dimo_logo} alt=""></img>
                        </FlexView> */}
                        <FlexView column hAlignContent="center">
                            {/* <img style={{ marginTop: "2rem", height: `${0.4 * screenHeight}px`, width: screenWidth }} src={new_dimo_rebranding_image} alt=""></img> */}
                            <img style={{ marginTop: "129px", height: "256px", width: "256px" }} src={new_dimo_rebranding_image} alt=""></img>
                            <div className="headline5 highEmphasis" style={{ ...Styles.span1 }}>
                                {localeObj.ap_header}
                            </div>
                            <div className="subtitle2 highEmphasis" style={{ ...Styles.span2, marginBottom: "1.5rem" }}>
                                {localeObj.ap_description}
                            </div>
                        </FlexView>
                        <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                            <div style={{ textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.next} onCheck={() => this.next()} />
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                        <Drawer classes={{ paper: classes.paper }} anchor="bottom" open={this.state.dialogOpen}>
                            <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                {localeObj.no_fp_register}
                                </div>
                            </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", }} >
                            <PrimaryButtonComponent btn_text={localeObj.register_fp} onCheck={this.registerFp} />
                            <SecondaryButtonComponent btn_text={localeObj.skip} onCheck={this.cancelVerification} />
                            </div>
                        </Drawer>
                    </div>
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
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
                            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                <PrimaryButtonComponent btn_text={this.state.primary_btn_text} onCheck={this.onPrimary} />
                                {/* {this.state.secondary_btn_text && <SecondaryButtonComponent btn_text={this.state.secondary_btn_text} onCheck={this.onSecondary} />} */}
                                {this.state.bottomSheetSubText && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.skipRegisterFP}>
                                    {this.state.bottomSheetSubText}
                                </div>}
                            </div>
                        </Drawer>
                    </div>
                </div>}
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div>
        );
    }
}

AccountApproveComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object,
    location: PropTypes.object
};

export default withStyles(styles)(AccountApproveComponent);
