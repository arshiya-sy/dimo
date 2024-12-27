import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import Drawer from '@material-ui/core/Drawer';
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices, { ONBOARD_STATUS } from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler, { clientCreationStatus } from '../../Services/ArbiResponseHandler';
import apiService from "../../Services/apiService";
import localeService from "../../Services/localeListService";

import SessionMetricsTracker from "../../Services/SessionMetricsTracker";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ConfirmFormComponent from "../OnBoardingSupportComponents/ConfirmFormComponent";

import alertIcon from "../../images/OnBoardingImages/Alert.png";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import GeneralUtilities from "../../Services/GeneralUtilities";
import { AuthStateContext } from "../../ContextProviders/AuthProvider";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import errorCodeList from "../../Services/ErrorCodeList";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import OcrProperties from "../../Services/OcrProperties";
import safety from "../../images/SpotIllustrations/Safety.png";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import { ACCOUNT_REJECT_NEXT_ACTION, returnCafRejectedMessages, returnOnboardResumeSections } from "../../Services/LoginAuthService";
import { returnDataForRgFormComponent } from "../../Services/ClientCreationJson";
import ShowOnboardingSections from "./ShowOnboardingSections";
import ArbiApiMetrics from "../../Services/ArbiApiMetrics";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import DimoFlashComponent from "../CommonUxComponents/DimoFlashComponent";
import walletJwtService from "../../Services/walletJwtService";
import CustomAlertDialogs from "../EngageCardComponent/CustomAlertDialogs";
import AlertDialog from "./AlertDialog";
import HelloShopUtils from "../EngageCardComponent/HelloShopUtil";
import GamificationAPIs from "../../Services/Gamification/GamificationAPIs"

import { PopupModalHocManger } from "../EngageCardComponent/PopupModalHoc";
import NewUtilities from "../../Services/NewUtilities";
import UnblockAccountService from "../../Services/UnblockAccount/UnblockAccountService";
import androidApiCallsService from "../../Services/androidApiCallsService";
import ImageHTMLInformationComponent from "../CommonUxComponents/ImageHTMLInformationComponent";

import TimerImage from "./../../images/UnblockAccountImages/timer.webp";
import WarningImage from "./../../images/UnblockAccountImages/warning.webp";
import CelebrationImage from "./../../images/UnblockAccountImages/celebration.webp";
import TransactionImage from "./../../images/UnblockAccountImages/transactions.webp";
import RocketImage from "./../../images/UnblockAccountImages/Rocket.webp";

import { UNBLOCK_ACCOUNT_SUCCESS } from "../../Services/UnblockAccount/UnblockAccountTerms";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;

const PIX_SUBSTRING = "br.gov.bcb.pix";
const ATM_SUBSTRING = "Banco24Horas/SaqueDigital";
const BOLETO_LENGTH = 44;
const PageNameJSON = PageNames.login;
var localeObj = {};

class LoginAuthComponent extends React.Component {

    static biometricAvailability = Object.freeze({ SUCCESS: "success", FAILURE: "failure", NEEDS_SETUP: "require" });
    static contextType = AuthStateContext;

    constructor(props) {
        super(props);
        this.state = {
            appBarState: "Login",
            loginState: "initial",
            direction: "",
            cpf: "",
            password: "",
            bottomSheetHeader: "",
            bottomSheetDescription: "",
            bottomSheettType: "",
            bottomSheetSubText: "",
            primary_btn_text: "",
            secondary_btn_text: "",
            open: false,
            accountRejected: false,
            accountRejectedTitle: "",
            accountRejectionReasons: "",
            accountRejectedNextActionButton: "",
            isRelogin: "false",
            errorSections: "",
            resumeSections: "",
            clientCreationStatus: "",
            snackBarOpen: false,
            bottomSheetEnabled: false,
            bottomSheetType: "",
            emailSentForVerification: false,
            snackBarMessage: "",
            clearPassword: false,
            showError: true,
            newLogin: false,
            location: undefined,
            securityOptin: "undecided",
            securityOptinTimestamp: Date.now(),
            locationFetched: false,
            unblockAccountSuccessScreen: '',
            fourthDescriptionText: '',
            emailConfirmado: false
        };
        this.setField = this.setField.bind(this);
        this.onBack = this.onBack.bind(this);

        this.userName = "";
        this.accountKey = "";
        this.accountNumber = "";
        this.clientKey = "";
        this.password = "";
        this.doesDeviceHaveFpSetUp = androidApiCalls.checkBiometricsEnabled() === LoginAuthComponent.biometricAvailability.SUCCESS;
        this.deepLinkInfo = "";
        this.qrCode = "";
        this.hasNotificationDialog = false;

        this.componentName = "LoginAuthComponent";
        this.lockedOut = "The user account has been locked out. Please try again later.";
        this.loggedInViaFp = false;
        this.dialogCall = null;
        this.styles = {
            selfieInfoTextStyles: { display: "flex", alignItems: "center", textAlign: "left" },
            selfieInfoImageStyles: { marginRight: "1rem", marginLeft: "0.625rem", width: "3rem" },
            selfieReviewImageStyles: { display: "flex", justifyContent: "center", marginTop: "3rem" },
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.clearReminder();
    }

    componentDidMount() {
        this.getOnboardingAccessToken();
        SessionMetricsTracker.setTimeTakenForLaunch();
        if ((this.props.location.state && this.props.location.state.relogin) && !GeneralUtilities.emptyValueCheck(androidApiCalls.getDAStringPrefs("SESSION_DATA"))) {
            let dataForSend = JSON.parse(androidApiCalls.getDAStringPrefs("SESSION_DATA"))
            if (!(JSON.stringify(dataForSend) === "{}")) {
                Log.sDebug("STORED SESSION METRICS SENT");
                androidApiCalls.submitSessionEventMetrics(JSON.stringify(dataForSend));
            }
        }

        let params = {
            dialogtrigger: "onMDALoginDowntime",
            placement: "Wallet"
        };

        this.dialogCall = apiService.getDialog(params);
        this.dialogCall.then(response => {
            Log.debug('Login component getDialog response: ' + JSON.stringify(response));

            if (response.main) {
                androidApiCalls.stopSignInWithBiometrics();
                PopupModalHocManger.openPopupModalHoc(CustomAlertDialogs, response.main, response.extra);
            }
        });
        if (Number(androidApiCalls.getAppVersion()) < constantObjects.MINIMAL_APK_VERSION && !androidApiCalls.checkIfNm()) {
            this.props.history.replace("/upgradeAppPage");
        } else {
            androidApiCalls.enablePullToRefresh(false);
            this.showProgressDialog();
            let deepLinkInfo = androidApiCalls.getMotopayDeepLinkUrl();
            let giftCardDeepLink = false;
            Log.sDebug("Notification deeplink details " + deepLinkInfo);
            if (deepLinkInfo !== "" && deepLinkInfo !== undefined) {
                let deepLinkJson = JSON.parse(deepLinkInfo);
                let url = deepLinkJson["componentPath"];
                if (url !== "" && url !== undefined && url.includes("/giftCardMain")) {
                    androidApiCalls.clearMotopayDeepLinkUrl();
                    androidApiCalls.storeToPrefs("showGiftCardBottomSheet", "true");
                    let addInfoJson = ""
                    try {
                        let addInfo = deepLinkJson["additionalInfo"];
                        addInfoJson = (addInfo !== "" && addInfo !== undefined) ? JSON.parse(addInfo) : "";
                    } catch (err) {
                        Log.sError("Error is ", err);
                    }
                    this.hideProgressDialog();
                    this.props.history.replace({
                        pathname: "/giftCardMain",
                        additionalInfo: addInfoJson
                    });
                    giftCardDeepLink = true;

                } else if (url !== "" && url !== undefined && url.toLowerCase().includes("/hy")) {
                    ///HY
                    androidApiCalls.openHY();
                } else if (url !== "" && url !== undefined && url.toLowerCase().includes("/appsrecommendation")) {
                    ///AppsRecommendation
                    let hyUrl = androidApiCalls.getHyUrl();
                    hyUrl = hyUrl.replace("card", "apps");
                    window.location.replace(hyUrl);
                }
            }
            Log.sDebug("giftCardDeepLink: " + giftCardDeepLink);
            if (!giftCardDeepLink) {
                this.deepLinkCheck().then(() => { });
                this.setState({
                    appBarState: localeObj.login,
                    loginState: "cpf",
                    processing: false
                })
                Log.sDebug("Scale factor :" + androidApiCalls.getScreenDimensions() + " Display is set to :" + androidApiCalls.checkDisplaySize());
                if (this.props.location && this.props.location.cpf && this.props.location.cpf !== "") {
                    this.setState({
                        cpf: this.props.location.cpf
                    })
                }
                if (
                    androidApiCalls.isBiometricEnabled() === 1
                    && !(this.props.location.state && this.props.location.state.cpf)
                    && !(this.props.location.state && this.props.location.state.auth && this.shouldAllowDeeplink())
                ) {
                    // launch biometric only if the control has not come from userid component
                    Log.sDebug("Launching fingerprint screen", this.componentName);
                    this.fingerprintAuth();
                }

                if (this.props.location.state && this.props.location.state.snackBarMessage) {
                    this.openSnackBar(this.props.location.state.snackBarMessage);
                }
                if (this.props.location.state && this.props.location.state.cpf) {
                    this.setState({ cpf: this.props.location.state.cpf })
                }
            }

            //Check and set motopay backend token if needed.
            // Commenting below setAuthorization as this is duplicate and function call already made in NewMotoPayLandingComponent.
            //walletJwtService.setAuthorization();
            window.onBackPressed = () => {
                if (this.state.open) {
                    this.setState({ open: false })
                } else {
                    this.onBack();
                }

            }


            window.onCurrentLocationComplete = (response) => {
                if (response === "enable_location_setting" || response === "cancelled" ||
                    response === "request_permission" || response === "failure") {
                    Log.sDebug("Location permission denied in apk: " + response);
                    this.setState({
                        location: false,
                        locationFetched: false
                    })
                } else {
                    let metadata = [
                        {
                            "tipoMetadado": 1,
                            "valor": NewUtilities.getMetadataForDeviceType()
                        },
                        {
                            "tipoMetadado": 2,
                            "valor": androidApiCalls.getSystemStringProperty("ro.product.model")
                        },
                        {
                            "tipoMetadado": 8,
                            "valor": response["Latitude"]
                        },
                        {
                            "tipoMetadado": 9,
                            "valor": response["Longitude"]
                        }
                    ];
                    this.setState({
                        location: metadata,
                        locationFetched: true,
                        latitude: response["Latitude"],
                        longitude: response["Longitude"]
                    })
                }
            }
            window.onRequestLocationPermission = (json) => {
                if (json["android.permission.ACCESS_COARSE_LOCATION"] !== -1) {
                    androidApiCalls.getCurrentLocation();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            locationAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.perm_deny);
                    }
                }
            }
        }
    }

    getOnboardingAccessToken = async () => {
        await arbiApiService.getOnboardingAuthToken().then((response) => {
            Log.sDebug("getOnboardingAccessToken:" + JSON.stringify(response));
            if (response.success) {
                ImportantDetails.onboardingAcessToken = response.result;
            }
        });
    };

    clearReminder = () => {
        ImportantDetails.smartAlert = false;
        ImportantDetails.latestAlertResp = [];
        ImportantDetails.alertSessionFlag = true;
        ImportantDetails.autoDebit = false;
    }

    shouldAllowDeeplink = () => {
        let userLoggedIn = androidApiCalls.getDAStringPrefs("userLoggedIn")
        return this.props.location.state.deeplink && (userLoggedIn === "true");
    }

    deepLinkCheck = async () => {
        this.hasNotificationDialog = GeneralUtilities.checkForNotificationDialog();

        await this.setState({ qrCode: androidApiCalls.getMotopayQRCode() })
        await this.setState({ deepLinkInfo: androidApiCalls.getMotopayDeepLinkUrl() })

        Log.sDebug("Notification deeplink details " + androidApiCalls.getMotopayDeepLinkUrl());
        Log.sDebug("Camera qrcode deeplink details " + androidApiCalls.getMotopayQRCode());
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            if (this.state.deepLinkInfo !== "" && this.state.deepLinkInfo !== undefined) {
                let deepLinkJson = JSON.parse(this.state.deepLinkInfo);
                let url = deepLinkJson["componentPath"];
                if (url !== "" && url !== undefined && url === "/checkWaitlistId") {
                    this.showProgressDialog();
                    let addInfoJson = ""
                    try {
                        let addInfo = deepLinkJson["additionalInfo"];
                        addInfoJson = (addInfo !== "" && addInfo !== undefined) ? JSON.parse(addInfo) : "";
                    } catch (err) {
                        Log.sError("Error is ", err);
                    }
                    this.props.history.replace({
                        pathname: url,
                        additionalInfo: addInfoJson
                    });
                }
            }
        }, 1000);

        if (!GeneralUtilities.emptyValueCheck(androidApiCalls.getMotopayQRCode())) {
            androidApiCalls.clearMotopayQRCode();
        }
        androidApiCalls.clearMotopayDeepLinkUrl();

        if (this.props.location.state && this.props.location.state.auth && this.shouldAllowDeeplink()) {
            this.moveToLandingPage();
        }
    }

    checkAndGetLocation = (cpf) => {
        apiService.getOptinStatus(cpf)
            .then(response => {
                if (response.status === 200) {
                    if (response.data.locationSecurityOptIn === "true") {
                        if (androidApiCalls.hasCoarsePermission()) {
                            androidApiCalls.getCurrentLocation();
                        } else {
                            androidApiCalls.requestFineOrCoarseLocation();
                        }
                    } else if (response.data.deviceId !== androidApiCalls.getDeviceId()) {
                        return this.setState({
                            direction: "left",
                            loginState: "security"
                        })
                    }
                } else {
                    return this.setState({
                        direction: "left",
                        loginState: "security"
                    })
                }
            }).catch(err => {
                Log.sError("Error is ", err);
                return this.setState({
                    direction: "left",
                    loginState: "security"
                })
            });
    }

    fingerprintAuth = () => {
        let isFpUnavailable = androidApiCalls.checkBiometricsEnabled() === LoginAuthComponent.biometricAvailability.NEEDS_SETUP;
        if (isFpUnavailable) {
            //safety cleanup
            androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
            androidApiCalls.setBiometricFlag(0);
            androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.MASKED_CPF_KEY);
            return;
        }

        let maskedCpf = androidApiCalls.getFromPrefs(GeneralUtilities.MASKED_CPF_KEY);
        this.setState({ cpf: maskedCpf, showError: false });

        androidApiCalls.getEncryptPrefs(GeneralUtilities.CREDENTIALS_KEY, true);
        window.onDecryptCompleted = (key, value) => {
            Log.debug("decrypted " + key + " : " + JSON.stringify(value));
            // clear the masked cpf from the text field
            this.setState({ cpf: "", clearPassword: true, showError: true });
            if (value === "failure") {
                Log.sDebug("could not decrypt credentials", this.componentName);
                this.openSnackBar(localeObj.fingerprint_fail);

            } else if (value === "error") {
                Log.sDebug("could not decrypt credentials", this.componentName);
            } else {
                this.closeSnackBar();
                this.loggedInViaFp = true;
                let userCredentials = value;
                // check if username and password exist in encrypted shared preferences, if not redirect him to loginauthcomp
                if (userCredentials["userName"] && userCredentials["password"] && userCredentials["cpf"]) {

                    this.clientKey = userCredentials["userName"];
                    if (ImportantDetails.isUserDifferentThanTheCurrentOne(this.clientKey)) {
                        this.setState({ newLogin: true })
                        ImportantDetails.resetAllFieldsIfUserIsDifferent(this.clientKey);
                        this.props.location.state = {};
                    }

                    ImportantDetails.clientKey = this.clientKey;

                    this.password = userCredentials["password"];
                    if (userCredentials["clientName"]) {
                        this.userName = userCredentials["clientName"];
                        ImportantDetails.userName = userCredentials["clientName"];
                    }
                    this.setState({
                        cpf: userCredentials["cpf"]
                    });
                    this.cpf = userCredentials["cpf"];
                    ImportantDetails.cpf = userCredentials["cpf"];

                    Log.debug("access token and its expiry " + ImportantDetails.accessTokenExpiryTime + " " + ImportantDetails.accessToken);

                    //temproary change for users who have already setup fp and masked cpf is not already stored
                    if (!androidApiCalls.getFromPrefs(GeneralUtilities.MASKED_CPF_KEY)) {
                        androidApiCalls.storeToPrefs(GeneralUtilities.MASKED_CPF_KEY, GeneralUtilities.maskCpf(ImportantDetails.cpf));
                    }
                    this.validateUser(userCredentials["userName"], userCredentials["password"], true);
                } else {
                    Log.sDebug("decrypted credentials does not have required details", this.componentName);
                    this.openSnackBar(localeObj.fingerprint_fail);
                    androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
                    androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.MASKED_CPF_KEY);
                    androidApiCalls.setBiometricFlag(0);

                }
            }
        }
    }

    updateAuthForAllUrls = () => {
        const { auth, updateAuth } = this.context;
        Log.sDebug("Auth is: " + auth);
        updateAuth(true, false);
    }

    setField = (field) => {
        switch (this.state.loginState) {
            case "cpf":
                this.setState({ cpf: field })
                return this.getOnboardingStatus(field);
            case "password":
                this.password = field;
                return this.validateUser(this.clientKey, this.password);
            default: break;
        }
    }

    registerUser = (field) => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        let jsonObject = {};
        jsonObject["cpf"] = field;
        jsonObject["pageName"] = this.componentName;
        this.showProgressDialog();
        arbiApiService.getUserWithCPF(jsonObject)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let repsonseHandler = ArbiResponseHandler.processCpfValidationResponse(response.result);
                    if (repsonseHandler.success) {
                        this.clientKey = repsonseHandler.clientKey;
                        this.checkAndGetLocation(field);

                        return this.setState({
                            direction: "left",
                            loginState: "password",
                            cpf: field,
                        })
                    } else {
                        this.openSnackBar(localeObj.cpf_does_not_exist);
                    }
                } else {
                    if (response.result.details) {
                        this.createErrorJson(response.result.details);
                    } else {
                        this.createErrorJson(localeObj.tryAgainLater);
                    }
                }
            }).catch(err => {
                this.hideProgressDialog();
                this.createErrorJson(err.response.error.details);
            });
    }

    getOnboardingStatus = (cpf) => {
        this.showProgressDialog();
        arbiApiService.getOnboardingStatus(cpf).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                ImportantDetails.chaveOnboarding = response.result.chaveOnboarding;
                if (response.result.status === 0) {
                    this.props.history.replace({
                        pathname: "/userIdCreation",
                        state: {
                            creationState: "email"
                        },
                    });
                } else if (response.result.status === 1) {
                    this.props.history.replace({
                        pathname: "/userIdCreation",
                        state: {
                            creationState: "phoneNumber"
                        },
                    });
                } else if (response.result.status === 2) {
                    this.props.history.replace({
                        pathname: "/userIdCreation",
                        state: {
                            creationState: "password"
                        },
                    });
                } else {
                    this.clientKey = response.result.chaveUsuario;
                    this.checkAndGetLocation(cpf);

                    return this.setState({
                        direction: "left",
                        loginState: "password",
                        cpf: cpf,
                    })
                }
            } else {
                this.openSnackBar(localeObj.cpf_does_not_exist);
            }
        });
    };

    createErrorJson = (message) => {
        let jsonObj = {};
        jsonObj["header"] = localeObj.login_failed;
        jsonObj["description"] = message;
        MetricServices.onPageTransitionStart(PageNameJSON.error);
        this.setState({
            errorJson: jsonObj,
            loginState: "error"
        });
    }

    fetchTokenForCAF = async (cpf) => {
        await Promise.all([await walletJwtService.CAFAuthentication(cpf)]).then(async values => {
            if (GeneralUtilities.emptyValueCheck(values[0])) {
                Log.sDebug("Retrying for token as value is empty");
                await walletJwtService.CAFAuthentication(cpf)
            }
        }).catch(async err => {
            Log.sDebug("Retrying for token as due to following error " + err);
            await walletJwtService.CAFAuthentication(cpf)
        })
    }

    getClientStatus = async () => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        this.showProgressDialog();
        await arbiApiService.getClientStatus(PageNameJSON.cpf)
            .then(async response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetStatusResponse(response.result);
                    if (processorResponse.success) {
                        Log.sDebug("get client status api returned - " + JSON.stringify(processorResponse), this.componentName);
                        let clientStatus = processorResponse.status;
                        let errorSections = processorResponse.sections;
                        switch (clientStatus) {
                            case clientCreationStatus.UPLOAD_DOCUMENT:
                                await this.fetchTokenForCAF(this.state.cpf);
                                this.hideProgressDialog();
                                this.setState({ loginState: "resumeOnboarding", clientCreationStatus: clientCreationStatus.UPLOAD_DOCUMENT, resumeSections: returnOnboardResumeSections(1, localeObj) });
                                break;

                            case clientCreationStatus.UPLOAD_SELFIE:
                                await this.fetchTokenForCAF(this.state.cpf);
                                this.hideProgressDialog();
                                this.setState({ loginState: "resumeOnboarding", clientCreationStatus: clientCreationStatus.UPLOAD_SELFIE, resumeSections: returnOnboardResumeSections(1, localeObj) });
                                break;

                            case clientCreationStatus.ADD_ID_DETAILS:
                                await this.fetchTokenForCAF(this.state.cpf);
                                this.hideProgressDialog();
                                this.setState({ loginState: "resumeOnboarding", clientCreationStatus: clientCreationStatus.ADD_ID_DETAILS, resumeSections: returnOnboardResumeSections(1, localeObj) });
                                break;

                            case clientCreationStatus.ADD_OTHER_INFO:
                                this.hideProgressDialog();
                                this.setState({ loginState: "resumeOnboarding", clientCreationStatus: clientCreationStatus.ADD_OTHER_INFO, resumeSections: returnOnboardResumeSections(1, localeObj) });

                                break;

                            case clientCreationStatus.SIGN_TERMS:
                                this.hideProgressDialog();
                                this.setState({ loginState: "resumeOnboarding", clientCreationStatus: clientCreationStatus.SIGN_TERMS, resumeSections: returnOnboardResumeSections(2, localeObj) });
                                break;

                            case clientCreationStatus.VALIDATE_EMAIL:
                                this.hideProgressDialog();
                                this.setState({ loginState: "resumeOnboarding", clientCreationStatus: clientCreationStatus.VALIDATE_EMAIL, resumeSections: returnOnboardResumeSections(2, localeObj) });
                                break;

                            case clientCreationStatus.KYC_ANALISE:
                                this.hideProgressDialog();
                                this.props.history.replace("/waitingApproval");
                                break;

                            case clientCreationStatus.CAF_ANALISE:
                                this.hideProgressDialog();
                                MetricServices.onPageTransitionStop(PageNameJSON[this.state.loginState], PageState.close);
                                this.props.history.replace("/waitingApproval");
                                break;

                            case clientCreationStatus.CAF_REJECTED: {
                                await this.fetchTokenForCAF(this.state.cpf);
                                this.hideProgressDialog();
                                let cafRejectMessages = returnCafRejectedMessages(errorSections, localeObj);
                                Log.debug("returned message is " + JSON.stringify(cafRejectMessages));

                                if (cafRejectMessages.nextAction.length === 1) {
                                    this.setState({ loginState: "clientRejected", errorSections: cafRejectMessages.nextAction, direction: "left", accountRejected: true, accountRejectedTitle: cafRejectMessages.title, accountRejectionReasons: cafRejectMessages.subtitle, accountRejectedNextActionButton: cafRejectMessages.buttonText });
                                } else {
                                    this.setState({ loginState: "clientRejectedMultipleReasons", errorSections: cafRejectMessages.nextAction, direction: "left", accountRejected: true, accountRejectedTitle: cafRejectMessages.title, accountRejectionReasons: cafRejectMessages.subtitle, accountRejectedNextActionButton: cafRejectMessages.buttonText });
                                }
                            }
                                break;

                            case clientCreationStatus.KYC_REJECTED:
                                this.hideProgressDialog();
                                this.setState({ loginState: "clientRejected", errorSections: [ACCOUNT_REJECT_NEXT_ACTION.CONTACT_CUSTOMER_CARE], accountRejected: true, direction: "left", accountRejectedTitle: localeObj.kyc_reject_title, accountRejectionReasons: localeObj.kyc_reject_desc, accountRejectedNextActionButton: localeObj.contact_customer_care });
                                break;

                            case clientCreationStatus.REGISTRATION_COMPLETE:
                                this.hideProgressDialog();
                                MetricServices.onPageTransitionStop(PageNameJSON[this.state.loginState], PageState.close);
                                this.props.history.push({
                                    pathname: '/accountAprove',
                                    state: {
                                        "password": this.password,
                                        "accountKey": this.accountKey,
                                        "clientName": this.userName,
                                        "cpf": this.state.cpf
                                    }
                                });
                                break;

                            default:
                                this.hideProgressDialog();
                                this.openSnackBar(localeObj.failedToProcess);

                        }
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    this.hideProgressDialog();
                    this.openSnackBar(localeObj.tryAgainLater);
                    return;
                }
            }).catch(err => {
                Log.sError("Error is ", err);
                this.hideProgressDialog();
                this.openSnackBar(localeObj.tryAgainLater);
            });
    }

    getAllClientData = () => {
        return new Promise((resolve) => {
            this.showProgressDialog();
            arbiApiService.getAllClientData(this.componentName).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let responseHandler = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
                    if (responseHandler.success) {
                        resolve("true");
                    } else {
                        resolve("false");
                    }
                } else {
                    resolve("false");
                }
            });
        });
    }

    componentWillUnmount() {
        GeneralUtilities.isNotEmpty(this.dialogCall, false)
            && PopupModalHocManger.closeModal();
    }

    validateUser = (clientKey, field, initiatedByFp = false) => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        let jsonObject = {};
        jsonObject["usuario"] = clientKey;
        jsonObject["senha"] = field;
        if (this.state.location) {
            jsonObject["metadados"] = this.state.location;
        } else {
            jsonObject["metadados"] = arbiApiService.getMetadata();
        }
        this.showProgressDialog();
        arbiApiService.authenticateUserWithClientKey(jsonObject, this.componentName)
            .then(response => {
                if (response.success) {
                    let data = response.result;
                    let processedResponseForLogin = ArbiResponseHandler.processAuthenticateUserApiResponse(data);
                    if (processedResponseForLogin && processedResponseForLogin.loginSuccess) {
                        this.updateAuthForAllUrls();
                        if (processedResponseForLogin.accountSuccess) {
                            this.userName = processedResponseForLogin.userName;
                            this.accountKey = processedResponseForLogin.accountKey;
                            let isFpUnset = androidApiCalls.isBiometricEnabled() === 0;
                            if (!response.result.login.emailConfirmado) {
                                this.setState({ emailConfirmado: true })
                            }
                            if (this.doesDeviceHaveFpSetUp && isFpUnset) {
                                this.hideProgressDialog();
                                this.showEnableFingerprintEnrollBottomSheet();
                            } else if (!response.result.login.emailConfirmado) {
                                this.props.history.push({
                                    pathname: '/accountAprove',
                                    state: {
                                        "password": this.password,
                                        "accountKey": this.accountKey,
                                        "clientName": this.userName,
                                        "cpf": this.state.cpf
                                    }
                                });
                            } else {
                                this.hideProgressDialog();
                                this.moveToLandingPage();
                            }
                        } else {
                            if (androidApiCallsService.checkIfNm()) {
                                this.hideProgressDialog();
                                Log.sDebug("could not process response of getUserName() ", this.componentName);
                                let errorMessageToUser = localeObj.nm_onboarding;
                                this.openSnackBar(errorMessageToUser);
                            } else if (processedResponseForLogin.message === "NO_ACCOUNT") {
                                this.getAllClientData().then((response) => {
                                    if (response === "true") {
                                        this.getClientStatus();
                                    } else {
                                        this.hideProgressDialog();
                                        this.openSnackBar(localeObj.failedToProcess);
                                    }
                                });
                            } else {
                                this.hideProgressDialog();
                                Log.sDebug("could not process response of getUserName() ", this.componentName);
                                let errorMessageToUser = localeObj.tryAgainLater;
                                this.openSnackBar(errorMessageToUser);
                            }
                        }
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    Log.verbose("Login failed with error - " + JSON.stringify(response), this.componentName);
                    this.hideProgressDialog();
                    if (response.result.code === errorCodeList.INVALID_USERNAME_PASSWORD) {

                        if (initiatedByFp) {
                            androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
                            androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.MASKED_CPF_KEY);
                            androidApiCalls.setBiometricFlag(0);

                            this.setState({
                                bottomSheetHeader: localeObj.authentication_unsuccessful,
                                bottomSheetDescription: localeObj.authentication_unsuccessful_desc,
                                primary_btn_text: localeObj.try,
                                secondary_btn_text: localeObj.cancel,
                                bottomSheetType: "wrongPasswordFp",
                                bottomSheetSubText: "",
                                open: true
                            });
                        } else {
                            if (response.result.details === this.lockedOut) {
                                this.createErrorJson(this.lockedOut);
                            } else {
                                this.setState({
                                    bottomSheetHeader: localeObj.wrong_password_text,
                                    bottomSheetDescription: localeObj.wrong_password_description,
                                    primary_btn_text: localeObj.try,
                                    secondary_btn_text: localeObj.cancel,
                                    bottomSheetType: "wrongPassword",
                                    bottomSheetSubText: localeObj.forgot_password_subText,
                                    open: true
                                });
                            }
                        }
                    } else if (response.result.code === errorCodeList.USER_BLOCKED) {
                        this.setState({
                            bottomSheetHeader: localeObj.unblock_account,
                            bottomSheetDescription: localeObj.unblock_acc_description,
                            primary_btn_text: localeObj.unblock_btn,
                            bottomSheetSubText: "",
                            bottomSheetType: "forgotPassword",
                            secondary_btn_text: "",
                            open: true
                        });
                    } else if (response.result.code === errorCodeList.NEW_DEVICE_LOGIN_DETECTED) {
                        androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.MASKED_CPF_KEY);
                        this.props.history.replace("/newDeviceAlert");
                    } else if (response.result.details) {
                        this.openSnackBar(response.result.details);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                }
            }).catch(err => {
                this.hideProgressDialog();
                console.log(err);
                this.openSnackBar(localeObj.token_validation_failed);
                return;
            });
    }

    sendMessage = () => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        let jsonObject = {};
        jsonObject["cpf"] = this.state.cpf;
        this.showProgressDialog();
        arbiApiService.forgotPasswordPhone(jsonObject)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processForgotPasswordResponse(response.result);
                    this.setState({
                        emailSentForVerification: false
                    })
                    if (processorResponse.success) {
                        MetricServices.onPageTransitionStop(PageNameJSON[this.state.loginState], PageState.back);
                        // this.props.history.replace("/forgotPassword", { "email": processorResponse.message, "cpf": this.state.cpf });
                        this.props.history.replace("/phoneNumberVerification", { from: "forgetPassword", cpf: this.state.cpf });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    if ('' + response.result.code === "11014") {
                        if (this.state.emailSentForVerification === false) {
                            this.sendEmailVerification();
                        } else {
                            this.setState({
                                bottomSheetHeader: localeObj.email_not_verification_header,
                                bottomSheetDescription: localeObj.email_not_verification_description,
                                primary_btn_text: localeObj.email_not_verification_btn,
                                bottomSheetType: "ReaskEmailVerification",
                                secondary_btn_text: "",
                                bottomSheetSubText: "",
                                open: true
                            });
                        }
                        //this.openSnackBar(response.result.details);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                }
            })
    };

    sendEmailVerification = () => {
        this.showProgressDialog();
        arbiApiService.confirmEmailId(this.componentName)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let repsonseHandler = ArbiResponseHandler.processEmailIdResponse(response.result);
                    if (repsonseHandler.success) {
                        let jsonObj = {};
                        jsonObj["title"] = localeObj.email_verification_title;
                        jsonObj["header"] = localeObj.email_verification_header;
                        jsonObj["description"] = localeObj.email_verification_description;
                        jsonObj["caption"] = localeObj.email_verification_caption;
                        jsonObj["caption2"] = androidApiCalls.getLocale() === "en_US" ? "" : localeObj.email_verification_caption2;
                        jsonObj["btnText"] = localeObj.send_code;
                        this.setState({
                            open: false,
                            direction: "right",
                            loginState: "email_verification",
                            errorJson: jsonObj,
                            emailSentForVerification: true
                        })
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else {
                    this.openSnackBar(localeObj.tryAgainLater);
                }
            })
    }

    onBack = () => {
        if (this.props.location.followToDigitalCard) {
            this.props.history.replace({ pathname: "/giftCardMain" });
            return;
        }
        if (HelloShopUtils.isHelloShopDimopayQRPayment(this.state.deepLinkInfo)) {
            return this.setState({
                bottomSheetHeader: localeObj.hs_abort_warning_title,
                bottomSheetDescription: localeObj.hs_abort_warning_message,
                primary_btn_text: localeObj.hs_abort_pstbtn,
                secondary_btn_text: "",
                bottomSheetType: "HSAbortSheet",
                bottomSheetSubText: localeObj.hs_abort_ngtbtn,
                open: true
            });
        }
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                snackBarMessage: localeObj.no_action
            })
        } else if (this.state.open === true) {
            this.setState({ open: false });
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.loginState], PageState.back);
            switch (this.state.loginState) {
                case "cpf":
                case "error":
                    return this.props.history.replace({ pathname: "/", state: { from: this.componentName }, transition: "right" });
                case "password":
                case "security":
                    return this.setState({
                        direction: "right",
                        loginState: "cpf",
                    })
                case "email_verification":
                    return this.setState({
                        direction: "right",
                        loginState: "password",
                    })
                default:
                    return this.setState({
                        direction: "right",
                        loginState: "cpf",
                    })
            }
        }
    }

    onCancel = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.loginState], PageState.cancel);
        this.props.history.replace({ pathname: "/", state: { from: this.componentName }, transition: "right" });
    }

    onSecondary = () => {
        this.setState({ open: false });
        if (this.state.bottomSheetType === "enableFingerPrint") {
            if (this.state.emailConfirmado) {
                this.props.history.push({
                    pathname: '/accountAprove',
                    state: {
                        "password": this.password,
                        "accountKey": this.accountKey,
                        "clientName": this.userName,
                        "cpf": this.state.cpf
                    }
                });
            } else {
                this.moveToLandingPage();
            }
        }
    }

    onPrimary = () => {
        this.setState({ open: false })
        if (this.state.bottomSheetType === "wrongPassword") {
            this.setState({
                clearPassword: true
            })
        } else if (this.state.bottomSheetType === "forgotPassword" || this.state.bottomSheetType === "ReaskEmailVerification") {
            this.sendMessage();
        } else if (this.state.bottomSheetType === "enableFingerPrint") {
            this.storeCredentials();
        } else if (this.state.bottomSheetType === "HSAbortSheet") {
            //close the bottom sheet
        } else if (this.state.bottomSheetType === "AskEmailVerification") {
            this.sendEmailVerification();
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
        });
    }


    forgotPassword = () => {
        this.setState({
            bottomSheetHeader: localeObj.forgotPassword,
            bottomSheetDescription: localeObj.forgot_password_description,
            primary_btn_text: localeObj.send,
            secondary_btn_text: localeObj.cancel,
            bottomSheetType: "forgotPassword",
            bottomSheetSubText: localeObj.help,
            open: true
        })
    }

    help = () => {
        this.setState({ open: false })
        if (this.state.bottomSheetType === "wrongPassword") {
            this.forgotPassword();
        } else if (this.state.bottomSheetType === "forgotPassword") {
            GeneralUtilities.openHelpSection();
        } else if (this.state.bottomSheetType === "HSAbortSheet") {
            this.returnToHS();
        }
    }


    storeCredentials = () => {
        let jsonObject = {
            userName: this.clientKey,
            password: this.password,
            accountKey: this.accountKey,
            accountNumber: this.accountNumber,
            clientName: this.userName,
            cpf: ImportantDetails.cpf
        }

        Log.debug("storing " + JSON.stringify(jsonObject));

        //store clientkey, password, accestoken, accestokenexpirytime, accountNumber
        androidApiCalls.storeEncryptPrefs(GeneralUtilities.CREDENTIALS_KEY, JSON.stringify(jsonObject), true);
        window.onEncryptCompleted = (key, statusOrData) => {
            if (statusOrData !== "failure") {
                //user credentials have been successfully stored , login via fingerprint next time
                androidApiCalls.setBiometricFlag(1);
                androidApiCalls.storeToPrefs(GeneralUtilities.MASKED_CPF_KEY, GeneralUtilities.maskCpf(ImportantDetails.cpf));
                this.moveToLandingPage();
            } else {
                this.openSnackBar(localeObj.fingerprint_fail);
            }
        }
    }

    showEnableFingerprintEnrollBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.enable_fingerprint_title,
            bottomSheetDescription: localeObj.enable_fingerprint_desc,
            primary_btn_text: localeObj.enable_fingerprint_positive,
            bottomSheetSubText: "",
            bottomSheetType: "enableFingerPrint",
            secondary_btn_text: localeObj.skip,
            open: true
        });
    }

    moveToLandingPage = async () => {
        //Comment Check for Blocked Accounts using CAF SDK as api isn't working
        /*this.showProgressDialog();
        const accountData = await UnblockAccountService.checkIfAccountIsBlocked(this.componentName);
        const { isAccountBlocked } = accountData;
        this.hideProgressDialog();
        if (isAccountBlocked) {
            androidApiCallsService.storeToPrefs(ImportantDetails.clientKey, "Blocked");
            const { redirectRoute, redirectRouteData } = accountData;
            this.props.history.replace({ pathname: redirectRoute, ...redirectRouteData });
            return;
        }*/

        if (androidApiCallsService.getFromPrefs(ImportantDetails.clientKey) === "Blocked") {
            const firstDescriptionText = (
                <>
                    <img
                        style={this.styles.selfieInfoImageStyles}
                        src={TimerImage}
                        alt=""
                    />{" "}
                    {localeObj.unblock_account_success_first_tip}
                </>
            );
            const secondDescriptionText = (
                <>
                    <img
                        style={this.styles.selfieInfoImageStyles}
                        src={TransactionImage}
                        alt=""
                    />{" "}
                    {localeObj.unblock_account_success_second_tip}
                </>
            );
            const thirdDescriptionText = (
                <>
                    <img
                        style={this.styles.selfieInfoImageStyles}
                        src={WarningImage}
                        alt=""
                    />{" "}
                    {localeObj.unblock_account_success_third_tip}
                </>
            );
            const fourthDescriptionText = (
                <>
                    <img
                        style={this.styles.selfieInfoImageStyles}
                        src={CelebrationImage}
                        alt=""
                    />{" "}
                    {localeObj.unblock_account_success_fourth_tip}
                </>
            );
            this.componentName = UNBLOCK_ACCOUNT_SUCCESS;
            this.setState({
                description: firstDescriptionText,
                subText: secondDescriptionText,
                tip: thirdDescriptionText,
                extra: fourthDescriptionText

            }, () => {
                this.setState({ loginState: 'account_unblock_success' })
            })
            return;
        } else {
            //sync with gamification backend for program snapshot
            GamificationAPIs.fetchProgramSnapshotListAPI();
            if ((SessionMetricsTracker.prevSessionID !== SessionMetricsTracker.sessionID)
                || SessionMetricsTracker.sessionID === null || SessionMetricsTracker.sessionID === "") {
                Log.sDebug("Balance API should be called.");
                ImportantDetails.walletBalance = "";
                ImportantDetails.walletDecimal = "";
            } else {
                Log.sDebug("Repeated session values have been removed");
            }
            // done go to landing page now
            androidApiCalls.setAccountLoggedIn(true);
            androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.ACCOUNT_LOGGED_IN);
            SessionMetricsTracker.setSessionStartTimers();
            SessionMetricsTracker.setPrevSessionIdToEmpty();
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.loginState], PageState.close);
            //let sessionId = SessionMetricsTracker.createSessionId(ImportantDetails.cpf);
            let loginJson = {
                "isFpSet": androidApiCalls.isBiometricEnabled() === 1,
                "sessionId": SessionMetricsTracker.sessionID,
                "loggedInViaFp": this.loggedInViaFp,
            }

            if (this.state.location && this.state.location !== "") {
                this.state.location.forEach((metadata) => {
                    if (metadata.tipoMetadado === 8) {
                        loginJson["latitude"] = metadata.valor;
                    } else if (metadata.tipoMetadado === 9) {
                        loginJson["longitude"] = metadata.valor;
                    }
                });
            }

            ArbiApiMetrics.sendArbiSuccessMetrics("MOTOPAY_CUSTOM_LOGIN_EVENT", loginJson);

            if (this.hasNotificationDialog) {
                this.setState({ direction: "left", loginState: "dimo" });
                let timeoutId = setInterval(() => {
                    clearInterval(timeoutId);
                    this.props.history.replace({ pathname: "/newWalletLaunch", "accountKey": this.accountKey });
                }, 1.5 * 1000);
            } else if (this.state.qrCode !== "" && this.state.qrCode !== undefined) {
                if (this.state.qrCode.toLowerCase().includes("dimo:qrcode/payment")) {
                    ImportantDetails.dimoPayEntryPoint = "DIMO_PAY_FROM_EXTERNAL";
                    this.props.history.replace({ pathname: "/dimoPayComponent", state: this.state.qrCode });
                } else if (this.state.qrCode.toLowerCase().includes(PIX_SUBSTRING.toLowerCase())) {
                    this.props.history.replace({
                        pathname: "/pixQrCopyPasteComponent",
                        state: this.state.qrCode
                    });
                } else if (this.state.qrCode.toLowerCase().includes(ATM_SUBSTRING.toLowerCase())) {
                    this.props.history.replace({
                        pathname: '/atmWithdraw',
                        state: { qrCodeValue: this.state.qrCode }
                    });
                } else if (this.state.qrCode.split("://")[0] === "dimo") {
                    Log.sDebug("Camera scanned url " + this.state.qrCode);

                    // this.state.qrCode = dimo://myAccount/qrcode?profileActions=feedback
                    let qrCodeData = this.state.qrCode.split("://")[1]; //myAccount/qrcode?profileActions=feedback
                    if (qrCodeData !== "" && qrCodeData !== undefined) {
                        let routerPath = qrCodeData.split("/")[0]; //myAccount
                        let additionalInfo = [];

                        let extraData = qrCodeData.split("/")[1]; //qrcode?profileActions=feedback
                        if (extraData !== "" && extraData !== undefined) {
                            let params = extraData.split("?")[1] //profileActions=feedback
                            if (params !== "" && params !== undefined) {
                                params = params.split("&");
                                for (const index in params) {
                                    if (params[index] !== "" && params[index] !== undefined) {
                                        let key = params[index].split("=")[0];
                                        let value = params[index].split("=")[1];
                                        additionalInfo[key] = value;
                                    }
                                }
                            }
                        }
                        if (routerPath !== "" || routerPath !== undefined) {
                            this.props.history.replace({
                                pathname: "/" + routerPath,
                                additionalInfo: additionalInfo
                            });
                            return;
                        }
                    }
                    //If path is wrong fallback to landing page
                    this.props.history.replace({ pathname: "/newWalletLaunch", "accountKey": this.accountKey });
                } else if (this.state.qrCode.length >= BOLETO_LENGTH) {
                    let payload = {
                        "manual": false,
                        "qrCodeValue": this.state.qrCode
                    }
                    this.props.history.replace({
                        pathname: '/boleto',
                        state: payload
                    });
                }
            } else if (this.state.deepLinkInfo !== "" && this.state.deepLinkInfo !== undefined) {
                let deepLinkJson = JSON.parse(this.state.deepLinkInfo);
                let url = deepLinkJson["componentPath"];
                if (url !== "" && url !== undefined && url !== "/newLogin") {
                    if (url.toLowerCase().includes("https://dimomotorola.com.br")) {
                        url = url.split("dimomotorola.com.br/")[1];
                        if (url !== "" && url !== undefined && url.toLowerCase().includes("dimo:qrcode/payment")) {
                            this.props.history.replace({
                                pathname: "/dimoPayComponent",
                                state: url
                            });
                            return;
                        } else if (url !== "" && url !== undefined && url.toLowerCase().includes(PIX_SUBSTRING.toLowerCase())) {
                            url = url.replace("%20", " ");
                            this.props.history.replace({
                                pathname: "/pixQrCopyPasteComponent",
                                state: url
                            });
                            return;
                        } else if (url !== "" && url !== undefined) {
                            //<path>?<additionparam>&stats=<via>
                            let pathname = "/" + url.split("?")[0]; //myAccount
                            let additionalInfo = [];
                            let extraData = url.split("?")[1]; //qrcode?profileActions=feedback
                            if (extraData !== "" && extraData !== undefined) {
                                let params = extraData.split("&");
                                for (const index in params) {
                                    if (params[index] !== "" && params[index] !== undefined) {
                                        let key = params[index].split("=")[0];
                                        let value = params[index].split("=")[1];
                                        additionalInfo[key] = value;
                                    }
                                }
                            }
                            this.props.history.replace({
                                pathname: pathname,
                                additionalInfo: additionalInfo
                            });
                            return;
                        }
                        //If path is wrong fallback to landing page
                        this.setState({
                            direction: "left",
                            loginState: "dimo"
                        })
                        let timeoutId = setInterval(() => {
                            clearInterval(timeoutId);
                            this.props.history.replace({ pathname: "/newWalletLaunch", "accountKey": this.accountKey });
                        }, 1.5 * 1000);
                        return;
                    } else if (url.indexOf('https://') === 0) {
                        this.props.history.replace({
                            pathname: "/newWalletLaunch",
                            url: url
                        });
                        return;
                    } else if (url.toLowerCase().includes("dimo:qrcode/payment")) {
                        this.props.history.replace({
                            pathname: "/dimoPayComponent",
                            state: url
                        });
                        return;
                    } else if (url.toLowerCase().includes(PIX_SUBSTRING.toLowerCase())) {
                        this.props.history.replace({
                            pathname: "/pixQrCopyPasteComponent",
                            state: url
                        });
                        return;
                    }
                    let addInfoJson = ""
                    try {
                        let addInfo = deepLinkJson["additionalInfo"];
                        addInfoJson = (addInfo !== "" && addInfo !== undefined) ? JSON.parse(addInfo) : "";
                    } catch (err) {
                        Log.sError("Error is ", err);
                    }
                    if (addInfoJson !== "" && addInfoJson !== undefined) {
                        let action = addInfoJson["Action"];
                        if (action === "Open link in engage" || action === "Open link in browser") {
                            addInfoJson["url"] = url;
                            this.props.history.replace({
                                pathname: "/newWalletLaunch",
                                additionalInfo: addInfoJson
                            });
                            return;
                        }
                    }
                    this.props.history.replace({
                        pathname: url,
                        additionalInfo: addInfoJson
                    });
                } else {
                    this.setState({
                        direction: "left",
                        loginState: "dimo"
                    })
                    let timeoutId = setInterval(() => {
                        clearInterval(timeoutId);
                        this.props.history.replace({ pathname: "/newWalletLaunch", "accountKey": this.accountKey });
                    }, 1.5 * 1000);
                }
            } else if (this.props.location.followToDigitalCard) {
                this.props.history.replace({
                    pathname: "/digitalCard",
                    from: "giftCard"
                });
            } else if (this.props.location.followToCreditCard) {
                this.props.history.replace({
                    pathname: "/creditCard",
                    from: "giftCard"
                });
            } else if (!!this.props.location.state && !!this.props.location.state.followTo
                && !ImportantDetails.isUserDifferentThanTheCurrentOne(this.accountKey) && !this.state.newLogin) {
                this.props.history.replace({ pathname: this.props.location.state.followTo, state: this.props.location.state.followState });
            } else {
                this.setState({
                    direction: "left",
                    loginState: "dimo"
                })
                let timeoutId = setInterval(() => {
                    clearInterval(timeoutId);
                    this.props.history.replace({ pathname: "/newWalletLaunch", "accountKey": this.accountKey });
                }, 1.5 * 1000);
            }
        }
    }

    resumeClientNextStep = () => {
        Log.debug("resumeClientNextStep " + this.state.clientCreationStatus);
        switch (this.state.clientCreationStatus) {
            case clientCreationStatus.UPLOAD_DOCUMENT:
                this.props.history.replace({
                    pathname: "/docInformation",
                    state: {
                        creationState: "political"
                    }
                });
                break;

            case clientCreationStatus.UPLOAD_SELFIE:
                this.props.history.replace({
                    pathname: "/docInformation",
                    state: {
                        creationState: "political"
                    }
                });
                break;

            case clientCreationStatus.ADD_ID_DETAILS:
                this.props.history.replace({
                    pathname: "/docInformation",
                    state: {
                        creationState: "political"
                    }
                });
                break;

            case clientCreationStatus.ADD_OTHER_INFO:
                this.props.history.replace({
                    pathname: "/docInformation",
                    state: {
                        creationState: "political"
                    }
                });
                break;

            case clientCreationStatus.SIGN_TERMS:
                this.props.history.replace("/waitingApproval");
                break;

            default: break;
        }
    }

    rejectClientNextStep = () => {
        Log.debug("rejectClientNextStep " + this.state.errorSections);

        if (this.state.errorSections.length === 1) {

            switch (this.state.errorSections[0]) {
                case ACCOUNT_REJECT_NEXT_ACTION.CONTACT_CUSTOMER_CARE:
                    this.handleBottomSheet(true);
                    break;
                case ACCOUNT_REJECT_NEXT_ACTION.VALIDATE_DOCUMENT_INFO: {
                    let dataTobeSent = returnDataForRgFormComponent();
                    this.props.history.replace({ pathname: "/docInformation", state: { details: dataTobeSent, nextUrl: "/terms" } });
                    break;
                }
                case ACCOUNT_REJECT_NEXT_ACTION.REUPLOAD_DOCUMENTS:
                    //this.props.history.replace({ pathname: "/newDocUpload", state: { nextUrl: "/validateIdCreation", nextUrlPayload: { nextUrlPayload: { nextUrl: "/terms" } } } }); break;
                    this.props.history.replace({ pathname: '/identityCreation', nextUrlPayload: { nextUrlPayload: { nextUrl: "/terms" } } });
                    break;
                case ACCOUNT_REJECT_NEXT_ACTION.REUPLOAD_SELFIE:
                    this.props.history.replace({
                        pathname: "/newDocUpload",
                        state: { creationState: "selfieCam", steps: 13, nextUrl: "/terms" }
                    });
                    break;

                default:
                    //contact custmer care
                    this.openSnackBar(localeObj.coming_soon); break;
            }

        } else {
            Log.sDebug("multiple errors");
            return this.props.history.replace({ pathname: '/identityCreation', nextUrlPayload: { nextUrlPayload: { nextUrl: "/terms" } } });
            //this.props.history.replace({ pathname: "/newDocUpload", state: { nextUrlPayload: { nextUrlPayload: { nextUrl: "/terms" } } } });
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    handleBottomSheet = (val) => {
        this.setState({
            bottomSheetEnabled: val
        });
    }

    onSkip = () => {
        Log.sDebug("Location consent skipped", "LocationConsent");
        this.setLocationOptinStatus();
    }

    onAskPermission = () => {
        if (androidApiCalls.hasCoarsePermission()) {
            this.showProgressDialog();
            androidApiCalls.getCurrentLocation();
            this.setState({
                securityOptin: "true",
                securityOptinTimestamp: Date.now()
            });
            let timeoutId = setInterval(() => {
                clearInterval(timeoutId);
                this.setLocationOptinStatus();
            }, 1.5 * 1000);
        } else {
            androidApiCalls.requestFineOrCoarseLocation();
        }
    }

    onDone = () => {
        this.hideProgressDialog();
        return this.setState({
            direction: "right",
            loginState: "password"
        })
    }

    closeLocationAlertDialog = () => {
        this.setState({
            locationAlert: false
        })
    }

    setLocationOptinStatus = () => {
        this.showProgressDialog();
        var payloadJson = Object.assign({}, {});
        payloadJson.cpf = this.state.cpf;
        payloadJson.chaveDeCliente = ImportantDetails.clientKey;
        payloadJson.locationSecurityOptIn = this.state.securityOptin;
        payloadJson.locationSecurityOptInTimestamp = this.state.securityOptinTimestamp;
        if (!androidApiCalls.checkIfNm()) {
            payloadJson.deviceId = androidApiCalls.getDeviceId();
            payloadJson.serialNumber = androidApiCalls.getBarcode();
            payloadJson.model = androidApiCalls.getModelName();
        } else {
            let deviceDetails = androidApiCalls.getDeviceInformation();
            let deviceDetailsObj = JSON.parse(deviceDetails);
            payloadJson.fcmId = deviceDetailsObj.deviceInfo.fcmId;
        }

        if (this.state.securityOptin && this.state.locationFetched) {
            payloadJson.latitude = this.state.latitude.toString();
            payloadJson.longitude = this.state.longitude.toString();
        }

        apiService.setOptinStatus(payloadJson)
            .then(() => {
                this.hideProgressDialog();
                this.onDone();
            }).catch(err => {
                this.hideProgressDialog();
                Log.sDebug("Failed to set location optin" + err, this.componentName, constantObjects.LOG_PROD);
                this.onDone();
            });
    }

    returnToHS = () => {
        let returnUrl = HelloShopUtils.getAbortedURL(this.state.deepLinkInfo, HelloShopUtils.USER_ABORTED_ERROR)
        HelloShopUtils.returnToHS(returnUrl)
        return;
    }

    goToHome = () => {
        androidApiCallsService.storeToPrefs(ImportantDetails.clientKey, "unblocked");
        this.componentName = "LoginAuthComponent";
        this.moveToLandingPage();
    }

    render() {
        const { classes } = this.props;
        const creation = this.state.loginState;
        return (
            <div style={{ overflowX: "hidden" }}>
                {(creation === "cpf" || creation === "password") &&
                    <div>
                        <ButtonAppBar header={localeObj.login} onBack={this.onBack} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "cpf" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "cpf" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "cpf" && <ConfirmFormComponent header={localeObj.login_cpf} field={localeObj.cpf} recieveField={this.setField} type="tel"
                            btnText={localeObj.next} value={ImportantDetails.cpf} clearPassword={this.state.clearPassword} showError={this.state.showError} componentName={PageNameJSON.cpf} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "password" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "password" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "password" && <ConfirmFormComponent header={localeObj.login_password} field={localeObj.password} recieveField={this.setField} type="password"
                            btnText={localeObj.login} forgotPassword={this.forgotPassword} value={this.state.password} componentName={PageNameJSON.password} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "security" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ overflowX: "hidden" }}>
                        <ImageInformationComponent header={localeObj.loc_account_safe} icon={safety} appBar={false}
                            description={localeObj.loc_description} btnText={localeObj.plain_allow} onAction={this.onSkip}
                            next={this.onAskPermission} action={localeObj.plain_maybe_later} />
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "dimo" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "dimo" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "dimo" && <DimoFlashComponent />}
                    </div>
                </CSSTransition >
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onBack} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "email_verification" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "email_verification" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "email_verification" &&
                            <PixErrorComponent
                                errorJson={this.state.errorJson}
                                caption="allow"
                                caption2="allow"
                                title="allow"
                                onBackHome={this.onBack}
                                btnText={localeObj.send_code}
                                onClick={this.sendMessage} />}
                    </div>
                </CSSTransition>
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
                            {this.state.secondary_btn_text && <SecondaryButtonComponent btn_text={this.state.secondary_btn_text} onCheck={this.onSecondary} />}
                            {this.state.bottomSheetSubText && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.help}>
                                {this.state.bottomSheetSubText}
                            </div>}
                        </div>
                    </Drawer>
                </div>
                {
                    !this.state.processing && creation === "clientRejected" &&
                    <CSSTransition mountOnEnter={true} unmountOnExit={true} timeout={300} in={true}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <ImageInformationComponent header={this.state.accountRejectedTitle} icon={alertIcon} appBar={true} type={PageNameJSON.clientRejected}
                            description={this.state.accountRejectionReasons} btnText={this.state.accountRejectedNextActionButton} next={this.rejectClientNextStep} onCancel={this.onCancel}
                            bottomSheet={this.state.bottomSheetEnabled} handleBottomSheet={this.handleBottomSheet} noAction={true} />
                    </CSSTransition>
                }

                {
                    !this.state.processing && creation === "clientRejectedMultipleReasons" &&
                    <CSSTransition mountOnEnter={true} unmountOnExit={true} timeout={300} in={true}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} componentName={PageNameJSON.clientRejectedMultipleReasons} >
                        <ShowOnboardingSections payload={{ type: "cafDenial", title: this.state.accountRejectedTitle, listOfSections: this.state.accountRejectionReasons, buttonText: this.state.accountRejectedNextActionButton, bottomHeader: localeObj.try_again }} next={this.rejectClientNextStep} onCancel={this.onCancel} />
                    </CSSTransition>
                }

                {
                    !this.state.processing && creation === "resumeOnboarding" &&
                    <CSSTransition mountOnEnter={true} unmountOnExit={true} timeout={300} in={true}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <ShowOnboardingSections payload={{ type: "resumeOnboarding", title: localeObj.resume_onboard_title, listOfSections: this.state.resumeSections, buttonText: localeObj.motopay_continue, bottomHeader: "" }}
                            next={this.resumeClientNextStep} onCancel={this.onCancel} componentName={PageNameJSON.resumeOnboarding} />
                    </CSSTransition>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "account_unblock_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (creation === "account_unblock_success" && !this.state.processing ? 'block' : 'none') }}>
                        <ImageHTMLInformationComponent type={this.componentName} hasAppappBar={true} icon={RocketImage} header={localeObj.unblock_account_success_header} suggestion={localeObj.unblock_account_success_suggestion}
                            description={this.state.description} descriptionStyles={this.styles.selfieInfoTextStyles} subText={this.state.subText} subTextStyles={this.styles.selfieInfoTextStyles} appBarAction="cancel" appBar={true}
                            tip={this.state.tip} tipStyles={this.styles.selfieInfoTextStyles} btnText={localeObj.unblock_account_success_primary_btn} extra={this.state.extra} appBarInverse={true} onCancel={this.goToHome} next={this.goToHome}
                        />
                    </div>
                </CSSTransition>

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                {this.state.locationAlert &&
                    <AlertDialog title={localeObj.allow_location_title} description={localeObj.loc_description}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeLocationAlertDialog} />
                }

                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >

        );
    }
}

LoginAuthComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(LoginAuthComponent);
