import React from "react";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import "../../../styles/new_pix_style.css";
import InputThemes from "../../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';
import moto_logo from "../../../images/SpotIllustrations/Rocket.png";

import { Divider } from "@mui/material";
import List from '@material-ui/core/List';
import FlexView from "react-flexview/lib";
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@material-ui/icons/Error';
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import Button from '@material-ui/core/Button';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import error from "../../../images/SpotIllustrations/Alert.png";
import jwtDecode from 'jwt-decode';

import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import ColorPicker from "../../../Services/ColorPicker";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';

import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import DetailFormComponent from "../../OnBoardingSupportComponents/DetailFormComponent";
import AddressComponent from "../../OnBoardingSupportComponents/AddressComponent";
import AddressCompleteComponent from "../../OnBoardingSupportComponents/AddressCompleteComponent";
import PhoneNumberComponent from "./ProfileDetailsUpdatePhoneNumberComponent";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

import ProfileDetailsOtpComp from "./ProfileDetailsOtpComp";
import FaceMatchComponent from "../../CommonUxComponents/FaceMatchComponent";
import GeneralAPIs from "../../../Services/GeneralAPIs";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import AlertDialog from "../../NewOnboardingComponents/AlertDialog";
import InputPinPageWithValidation from "../../CommonUxComponents/InputPinPageWithValidation";

const styles = InputThemes.singleInputStyle;
const theme1 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.userProfileDetails;

var localeObj = {};
var fourthDescriptionText = "";
var redactedMail = "";
var alteredDetailsObj = {};

const CAMERA_PERMISSION = "android.permission.CAMERA";
const CAF_LOGS = "CAF_FACELIVENESS";
const FACELIVENESS_SUCCESS = "FACELIVENESS_SUCCESS";
const FACELIVENESS_FAILURE = "FACELIVENESS_FAILURE";
const FACELIVENESS_URI = "GET_LIVENESS_METRICS_FOR_CAF";
var caf_start_time = "";
class ProfileDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded1: false,
            expanded2: false,
            snackBarOpen: false,
            message: "",
            type: "",
            cep: "",
            errorJson: {},
            currentState: this.props.location.state && this.props.location.state.currentState ? this.props.location.state.currentState : "profile",
            selfieImage: "",
            bottomSheetEnabled: false,
            email: "",
            phoneNumber: "",
            numeroDdd: this.props.location.state && this.props.location.state.profileData && this.props.location.state.profileData.phoneNumber.ddd ? this.props.location.state.profileData.phoneNumber.ddd : "",
            numeroMovel: this.props.location.state && this.props.location.state.profileData && this.props.location.state.profileData.phoneNumber.number ? this.props.location.state.profileData.phoneNumber.number : "",
            address: this.props.location.state && this.props.location.state.profileData && this.props.location.state.profileData.address ? this.props.location.state.profileData.address : "",
            isAlive: false,
            jwtToken: ""
        }
        this.style = {
            buttonStyle: {
                textTransform: 'none',
                align: "center",
                background: ColorPicker.newProgressBar,
                width: "100%",
                border: "0px",
            }
        }
        this.componentName = PageNames.userProfileDetails;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNameJSON.profile);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        document.body.style.overflowY = "scroll";
        window.onBackPressed = () => {
            if (this.state.bottomSheetEnabled) {
                this.setState({ bottomSheetEnabled: false });
                Log.sDebug("Closing bottomsheet", "ProfileDetailsPage")
            } else {
                this.back();
            }
        }
        GeneralAPIs.fetchTokenForCAF(ImportantDetails.cpf);
        window.onPassiveLivenessImage = (imageUrl) => {
            this.setState({
                selfieImage: imageUrl
            });
        }

        window.onFaceLivenessImage = (imageUrl, jwt) => {
            Log.sDebug("onActiveFaceLivenessImage " + imageUrl + " " + jwt);
            try {
                let i = jwt.lastIndexOf(".");
                let subjwt = jwt.substr(0, i);
                Log.sDebug("onActiveFaceLivenessImage sub test: " + subjwt);
                const decodedToken = jwtDecode(subjwt);
                Log.sDebug("decodedToken : " + decodedToken + " : " + decodedToken.isAlive + " : " + decodedToken.userId + " : " + decodedToken.requestId);
                if (imageUrl && decodedToken && decodedToken.isAlive) {
                    this.setState({
                        isAlive: decodedToken.isAlive,
                        selfieImage: imageUrl,
                        jwtToken: jwt
                    });
                }
            } catch (error) {
                Log.sDebug('Error decoding JWT token:', error);
                return null;
            }
        }

        window.onPassiveLivenessStatus = (faceLiveJson) => {
            //Log.sDebug("onPassiveLivenessStatus:", faceLiveJson);
            let finalFaceLivenessJSON = faceLiveJson;
            if (finalFaceLivenessJSON) {
                //Log.sDebug("Faceliveness SDK compelte. Logs " + JSON.stringify(finalFaceLivenessJSON));
                if (finalFaceLivenessJSON.sdkStatusCode && finalFaceLivenessJSON.sdkStatusCode === 1) {
                    this.uploadSelfieDocWithCAF();
                } else {
                    this.hideProgressDialog();
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.getCAFFailureText(finalFaceLivenessJSON.sdkStatusMessage, localeObj)
                    });
                }
            } else {
                this.hideProgressDialog();
                //Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.retry_later
                })
            }
        }

        window.onFaceLivenessStatus = (faceLive) => {
            Log.sDebug("onActiveFaceLivenessStatus : " + faceLive);
            let finalFaceLiveness = faceLive;
            let timeSpentOnCAF = new Date().getTime() - caf_start_time;
            if (finalFaceLiveness) {
                Log.sDebug("Faceliveness SDK compelte. Logs " + finalFaceLiveness);
                if (finalFaceLiveness && finalFaceLiveness === "Success") {
                    if (this.state.isAlive) {
                        GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj, PageNameJSON.update_profile_details_facematch);
                        this.uploadSelfieDocWithCAF();
                    } else {
                        this.hideProgressDialog();
                        Log.sDebug("Active Faceliveness SDK Failure due to isAlive false", CAF_LOGS, constantObjects.LOG_PROD);
                        this.openSnackBar(GeneralUtilities.getCAFFailureText("1", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON.update_profile_details_facematch);
                    }
                } else {
                    this.hideProgressDialog();
                    Log.sDebug("Faceliveness SDK Failure with status code 0");
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.getCAFFailureText("0", localeObj)
                    });
                }
            } else {
                this.hideProgressDialog();
                Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.setState({
                    snackBarOpen: true,
                    message: GeneralUtilities.getCAFFailureText("0", localeObj)
                });
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === true) {
                    this.doFaceMatch();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            cameraAlert: true
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.allow_camera
                        })
                    }
                }
            }
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNameJSON.profile, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNameJSON.profile);
        }
    }

    back = () => {
        if (this.state.processing) {
            this.openSnackBar(localeObj.no_action);
            return;
        } else {
            switch (this.state.currentState) {
                case "input_email_otp":
                    this.setState({
                        currentState: "update_email",
                        direction: "right"
                    });
                    break;
                case "input_phone_otp":
                    this.setState({
                        currentState: "update_phoneNumber",
                        direction: "right"
                    });
                    break;
                case "input_pin":
                    this.setState({
                        currentState: "revision",
                        direction: "right"
                    });
                    break;
                case "faceMatch":
                    this.setState({
                        currentState: this.state.previousState,
                        direction: "right"
                    });
                    break;
                case "error":
                    this.complete();
                    break;
                case "selfie_review":
                    this.setState({ selfieImage: "" })
                    this.doFaceMatch();
                    break;
                case "address_incomplete":
                    this.setState({
                        creationState: "update_address",
                        direction: "right"
                    })
                    break;
                case "address":
                    if (this.state.isAddressincomplete === -1) {
                        this.setState({
                            currentState: "update_address",
                            direction: "right"
                        })
                    } else if (this.state.isAddressincomplete > -1 && this.state.isAddressincomplete < 3) {
                        return this.setState({
                            currentState: "address_incomplete",
                            direction: "right"
                        })
                    }
                    break;
                case "addNum":
                    this.setState({
                        currentState: "address",
                        direction: "right"
                    })
                    break;
                case "complement":
                    this.setState({
                        currentState: "addNum",
                        direction: "right"
                    })
                    break;
                case "revision":
                    this.setState({
                        currentState: "complement",
                        direction: "right"
                    })
                    break;
                case "update_email":
                    if (this.props.location.state.fromComponent === "emailVerification") {
                        this.props.history.replace({ pathname: "/EmailVerification", transition: "left", "fromComponent": "accountApproveComponent" });
                    } else {
                        this.setState({
                            currentState: "profile",
                            direction: "right"
                        });
                    }
                    break;
                case "update_phoneNumber":
                case "update_address":
                    this.resetAllFields();
                    this.setState({
                        currentState: "profile",
                        direction: "right"
                    });
                    break;
                case "success":
                    this.backToProfile();
                    break;
                case "profile":
                default:
                    MetricServices.onPageTransitionStop(PageNameJSON.profile, PageState.back);
                    if (GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                        return;
                    }
                    this.props.history.replace({ pathname: "/myAccount", transition: "right" });
                    break;
            }
        }
    }

    cancelChanges = () => {
        if (this.props.location.state.fromComponent === "emailVerification") {
            this.props.history.replace({ pathname: "/EmailVerification", transition: "left", "fromComponent": "accountApproveComponent" });
        } else {
            this.resetAllFields();
            this.setState({
                currentState: "profile",
                direction: "right"
            });
        }
    }

    resetAllFields = () => {
        this.setState({
            email: "",
            phoneNumber: "",
            cep: "",
            addNum: ""
        })
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        document.body.style.overflowY = "hidden";
    }

    openSnackBar = (message) => this.setState({ snackBarOpen: true, message: message });

    sendOtpToEmail = () => {
        this.showProgressDialog();
        arbiApiService.generateEmailOtp(this.state.email, PageNameJSON.update_email)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processOtpForProfileResponse(response.result);
                    if (processorResponse.success) {
                        redactedMail = processorResponse.message;
                        this.setState({
                            currentState: "input_email_otp",
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setState({ previousState: "update_email" });
                    this.setErrorJson(errorJson);
                }
            });
    }

    sendOtpToPhone = () => {
        this.showProgressDialog();
        let phoneObj = {
            "ddd": this.state.ddd,
            "numero": this.state.phoneNumber
        }
        arbiApiService.generatePhoneOtp(phoneObj, PageNameJSON.update_phonenumber)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processOtpForProfileResponse(response.result);
                    if (processorResponse.success) {
                        redactedMail = processorResponse.message;
                        this.setState({
                            currentState: "input_phone_otp",
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setState({ previousState: "update_phoneNumber" });
                    this.setErrorJson(errorJson);
                }
            });
    }

    consultCEP = (cep) => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        this.showProgressDialog();
        arbiApiService.consultCEP(cep)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetAddressResponse(response.result);
                    if (processorResponse.success) {
                        let jsonObject = {
                            "street": processorResponse.address.street,
                            "complement": "",
                            "neighbourhood": processorResponse.address.neighbourhood,
                            "cep": cep,
                            "city": processorResponse.address.city,
                            "uf": processorResponse.address.uf
                        }

                        Log.debug("The address is " + JSON.stringify(jsonObject), "Address CEP page");

                        if (GeneralUtilities.emptyValueCheck(jsonObject.neighbourhood) || GeneralUtilities.emptyValueCheck(jsonObject.street)) {
                            if (GeneralUtilities.emptyValueCheck(jsonObject.neighbourhood) && GeneralUtilities.emptyValueCheck(jsonObject.street)) {
                                this.setState({
                                    isAddressincomplete: 2
                                });
                            } else if (GeneralUtilities.emptyValueCheck(jsonObject.neighbourhood)) {
                                this.setState({
                                    isAddressincomplete: 1
                                });
                            } else if (GeneralUtilities.emptyValueCheck(jsonObject.street)) {
                                this.setState({
                                    isAddressincomplete: 0
                                });
                            }
                            this.setState({
                                currentState: "address_incomplete",
                                direction: "left",
                                address: jsonObject,
                                complement: processorResponse.address.complement,
                                step: this.state.step + 1
                            })
                        } else {
                            this.setState({
                                currentState: "address",
                                direction: "left",
                                address: jsonObject,
                                complement: processorResponse.address.complement,
                                step: this.state.step + 1
                            })
                        }
                    } else {
                        this.openSnackBar(localeObj.cep_doesnt_exist);
                        return;
                    }
                } else {
                    this.openSnackBar(localeObj.tryAgainLater);
                    return;
                }
            });
    }

    handleBottomSheet = val => () => {
        if (val) {
            Log.sDebug("Opening bottomSheet", "ProfileDetailsPage");
        } else {
            Log.sDebug("Closing bottomSheet", "ProfileDetailsPage")
        }
        this.setState({
            bottomSheetEnabled: val
        });
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

    handleDialer = (phNum) => () => {
        let event = {
            eventType: constantObjects.customerCare,
            page_name: PageNameJSON.profile,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        MetricServices.onPageTransitionStop(PageNameJSON.profile, PageState.close);
        Log.sDebug("Opening Phone Dialer", "ProfileDetailsPage");
        androidApiCalls.startDialer(phNum);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openEmail = () => {
        androidApiCalls.openEmail();
    }

    sendVerificationMail = () => {
        this.showProgressDialog();
        Log.sDebug("Email Not Verfied, Clicked resend link", "ProfileDetailsPage");
        arbiApiService.confirmEmailId(this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                Log.sDebug("Resent Verification Link", "ProfileDetailsPage");
                let processorResponse = ArbiResponseHandler.processEmailIdResponse(response.result);
                if (processorResponse.success) {
                    this.setState({
                        currentState: "profile",
                        snackBarOpen: true,
                        message: localeObj.verify_email_sent
                    })
                    setTimeout(() => {
                        MetricServices.onPageTransitionStop(PageNameJSON.profile, PageState.close);
                        this.props.history.replace({ pathname: "/myAccount", transition: "right" });
                    }, 1500);
                    return;
                } else {
                    this.setState({
                        currentState: "profile",
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                this.setState({
                    currentState: "profile",
                    snackBarOpen: true,
                    message: localeObj.tryAgainLater
                })
                return;
            }
        })
    }

    cancelAccount = () => {
        this.props.history.replace("/cancelAccount", { "profileData": this.props.location.state.profileData });
    }

    handleOpenWhatApp = () => {
        androidApiCalls.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
    }

    help = () => {
        GeneralUtilities.openHelpSection();
    }

    callUpdateProfileDetails = () => {
        if (this.state.type === "email" || this.props.location.state.fromComponent === "emailVerification") {
            this.modifyUserEmail();
        } else if (this.state.type === "phoneNumber") {
            this.modifyUserPhone();
        } else if (this.state.type === "address") {
            this.modifyUserAddress();
        }
    }

    modifyUserEmail = () => {
        alteredDetailsObj.profileUpdateData = this.state.email;
        this.showProgressDialog();
        arbiApiService.updateEmailDetails(alteredDetailsObj, PageNameJSON.update_profile_details_selfie_review)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processRegisteringContact(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            currentState: "success",
                            success_header: GeneralUtilities.formattedString(localeObj.detail_updated, [localeObj.email]),
                            success_desc: GeneralUtilities.formattedString(localeObj.detail_updated_desc, [localeObj.email_address]),
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.resetAllFields();
                    this.setState({ previousState: "profile" });
                    this.setErrorJson(errorJson);
                }
            });
    }

    modifyUserPhone = () => {
        alteredDetailsObj.profileUpdateData = {
            "ddd": this.state.ddd,
            "numero": this.state.phoneNumber
        }
        this.showProgressDialog();
        arbiApiService.updatePhoneDetails(alteredDetailsObj, PageNameJSON.update_profile_details_selfie_review)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processRegisteringContact(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            currentState: "success",
                            success_header: GeneralUtilities.formattedString(localeObj.detail_updated, [localeObj.phone_number]),
                            success_desc: GeneralUtilities.formattedString(localeObj.detail_updated_desc, [localeObj.phone_success_num]),
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.resetAllFields();
                    this.setState({ previousState: "profile" });
                    this.setErrorJson(errorJson);
                }
            });
    }

    modifyUserAddress = () => {
        alteredDetailsObj.profileUpdateData = {
            "rua": this.state.address.street,
            "numero": this.state.address.number,
            "complemento": this.state.complement,
            "bairro": this.state.address.neighbourhood,
            "cep": this.state.address.cep,
            "cidade": this.state.address.city,
            "uf": this.state.address.uf
        }
        this.showProgressDialog();
        arbiApiService.updateAddressDetails(alteredDetailsObj, PageNameJSON.update_profile_details_selfie_review)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processRegisteringContact(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            currentState: "success",
                            success_header: GeneralUtilities.formattedString(localeObj.detail_updated, [localeObj.profile_address]),
                            success_desc: GeneralUtilities.formattedString(localeObj.detail_updated_desc, [localeObj.profile_mailing_address]),
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.resetAllFields();
                    this.setState({ previousState: "profile" });
                    this.setErrorJson(errorJson);
                }
            });
    }

    setErrorJson(formInfo) {
        if (formInfo.error) {
            let jsonObj = {}
            jsonObj["title"] = this.state.type === "email" ? localeObj.email : this.state.type === "phoneNumber" ? localeObj.phone_number : localeObj.profile_address;
            jsonObj["header"] = formInfo.title ? formInfo.title : localeObj.profile_failed_header;
            switch (formInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "time_limit_exceeded":
                    jsonObj["description"] = localeObj.pix_time_limit_exceeded;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = formInfo.descriptor;
                    break;
            }
            this.setState({
                currentState: "error",
                direction: "left",
                errorJson: jsonObj
            })
        }
    }

    complete = () => {
        this.resetAllFields();
        this.setState({
            currentState: this.state.previousState,
            clearPassword: true,
            direction: "right"
        });
    }

    addAddressDetails = (field) => {
        switch (this.state.isAddressincomplete) {
            case 0:
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        street: field.street,
                    }
                }))
                break;
            case 1:
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        neighbourhood: field.neighbourhood
                    }
                }))
                break;
            case 2:
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        street: field.street,
                        complement: field.neighbourhood
                    }
                }))
                break;
            default: break;
        }
        this.setState({
            currentState: "address",
            direction: "left"
        })
    }

    setTransactionInfo = (field) => {
        switch (this.state.currentState) {
            case "update_email":
                if (this.props.location.state.profileData?.email === field["field"]) {
                    let jsonObj = {
                        "title": localeObj.email_address,
                        "description": localeObj.email_address_duplicate_caption,
                        "header": localeObj.email_address_duplicate,
                    }
                    this.setState({
                        previousState: "update_email",
                        currentState: "error",
                        direction: "left",
                        errorJson: jsonObj
                    });
                } else {
                    this.setState({
                        email: field["field"]
                    }, () => {
                        this.sendOtpToEmail();
                    });
                }
                break;
            case "update_phoneNumber":
                if (field === this.state.numeroMovel) {
                    let jsonObj = {
                        "title": localeObj.phone_number,
                        "description": localeObj.phone_number_duplicate_caption,
                        "header": localeObj.phone_number_duplicate,
                    }
                    this.setState({
                        previousState: "update_phoneNumber",
                        currentState: "error",
                        direction: "left",
                        errorJson: jsonObj
                    });
                } else {
                    this.setState({
                        phoneNumber: field
                    }, () => {
                        this.sendOtpToPhone();
                    });
                }
                break;
            case "input_email_otp":
            case "input_phone_otp":
                this.setState({
                    previousState: this.state.currentState === "input_email_otp" ? "input_email_otp" : "input_phone_otp",
                    token: field,
                    currentState: "faceMatch",
                    direction: "left",
                })
                break;
            case "update_address":
                this.setState({
                    cep: field,
                    isAddressincomplete: -1
                })
                this.consultCEP(field);
                break;
            case "address_incomplete":
                this.addAddressDetails(field);
                break;
            case "address":
                this.setState({
                    currentState: "addNum",
                    direction: "left"
                });
                break;
            case "addNum":
                this.setState({
                    currentState: "complement",
                    direction: "left",
                    addNum: field
                })
                break;
            case "complement":
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        number: this.state.addNum,
                        complement: field
                    },
                    complement: field,
                    currentState: "revision",
                    direction: "left"
                }))
                break;
            case "revision":
                this.setState({
                    currentState: "input_pin",
                    type: "address",
                    direction: "left"
                });
                break;
            case "input_pin":
                this.setState({
                    previousState: "revision",
                    token: field,
                    currentState: "faceMatch",
                    direction: "left",
                })
                break;
            default:
                break;
        }
    }

    setDDD = (json) => {
        this.setState({
            actualDdd: json["field"],
            // DD is usually two digits, but ARBI expects, 3 digit input
            ddd: "0" + json["field"]
        })
    }

    editProfileDetails = (profile) => {
        switch (profile) {
            case localeObj.email:
                this.setState({
                    type: "email",
                    currentState: "update_email",
                    direction: "left",
                });
                break;
            case localeObj.phone_number:
                this.setState({
                    type: "phoneNumber",
                    currentState: "update_phoneNumber",
                    direction: "left",
                });
                break;
            case localeObj.profile_mail_address:
                this.setState({
                    type: "address",
                    currentState: "update_address",
                    direction: "left",
                });
                break;
            default:
                break;
        }
    }

    uploadSelfieDocWithCAF = () => {
        this.hideProgressDialog();
        fourthDescriptionText = <img style={{ maxWidth: "15.5rem", maxHeight: "19.5rem" }} src={this.state.selfieImage} alt="" />;
        alteredDetailsObj.token = this.state.token;
        let jsonObjectSelfie = {
            "url": "", //this.state.selfieImage,
            "extensao": 2,
            "encodedUrl": this.state.jwtToken
        }
        alteredDetailsObj.selfieObj = jsonObjectSelfie;
        this.setState({
            currentState: "selfie_review",
            direction: "left",
        })
    }

    doFaceMatch = () => {
        caf_start_time = new Date().getTime();
        if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
            if (GeneralUtilities.isCAFEnabled()) {
                this.showProgressDialog();
                if (androidApiCalls.isFeatureEnabledInApk("FACE_LIVELINESS") && GeneralUtilities.doesDeviceSupportActiveFaceliveness()) {
                    androidApiCalls.faceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                } else {
                    androidApiCalls.passiveFaceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                }
            }
            else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.facematch_not_sup
                })
            }
        } else {
            androidApiCalls.requestPermission(CAMERA_PERMISSION);
        }
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    moveToAddress = () => {
        this.setState({
            type: "address",
            currentState: "update_address",
            direction: "left"
        });
    }

    backToProfile = () => {
        if (this.props.location.state.fromComponent === "emailVerification") {
            this.showProgressDialog();
            arbiApiService.forgotAccountPin2fa(PageNameJSON.profile).then((response) => {
                if (response.success) {
                    this.hideProgressDialog();
                    const mensagem = response.result.mensagem;
                    const formattedMensagem = mensagem.split(" ").pop();;
                    this.setState({ formattedEmail: formattedMensagem })
                    this.props.history.replace({ pathname: "/EmailVerification", transition: "left", formattedEmail: this.state.formattedEmail, "fromComponent": "accountApproveComponent" });
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.gift_card_error_head1,
                    });
                }
            });
        } else {
            this.resetAllFields();
            this.props.history.replace("/myAccount", { "dataUpdated": true });
        }
    }

    render() {
        const { classes } = this.props;
        if (this.state.currentState !== "profile") {
            document.body.style.overflowY = "hidden";
        } else {
            document.body.style.overflowY = "scroll";
        }
        const profileData = this.props.location.state?.profileData || {};

        const Details = [
            {
                header: localeObj.profile_name_preference,
                details: profileData.nickName || "",
                edit: false,
                classNameEditProfileDetails: ""
            },
            {
                header: localeObj.fullname,
                details: profileData.name || "",
                edit: false,
                classNameEditProfileDetails: ""
            },
            {
                header: localeObj.email,
                details: profileData.email || "",
                verified: profileData.isEmailVerified || false,
                edit: true,
                classNameEditProfileDetails: "pixTableLeftContent"
            },
            {
                header: localeObj.phone_number,
                details: profileData.phoneNum || "",
                edit: true,
                classNameEditProfileDetails: "pixTableLeftContent"
            },
            {
                header: localeObj.profile_address,
                details: profileData.address || "",
                edit: false,
                classNameEditProfileDetails: "pixTableLeftContent"
            },
            {
                header: localeObj.profile_mail_address,
                details: profileData.mailing_address || "",
                edit: true,
                classNameEditProfileDetails: "pixTableLeftContent"
            }
        ];


        const onBack = () => {
            MetricServices.onPageTransitionStop(PageNameJSON.profile, PageState.back);
            if (GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }

        const screenHeight = window.screen.height;

        return (
            <div>
                <div style={{ display: (this.state.processing ? 'block' : 'none') }}>
                    {this.state.processing && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                <div style={{
                    display: (this.state.currentState === "profile" ? 'block' : 'none'),
                    height: `${0.8 * screenHeight}px`,
                    overflow: "scroll"
                }}>
                    <ButtonAppBar header={localeObj.profile_details_header} onBack={onBack} action="none" />
                    <FlexView column align="left" style={{ marginLeft: "4%", marginRight: "4%", marginTop: "3.8%" }}>
                        {
                            Details.map((opt, key) => (
                                <List key={key} style={{ marginLeft: "4%", marginRight: "7%", marginTop: "3%" }}>
                                    <div style={{ display: (opt.verified !== undefined ? (!(opt.verified) ? 'block' : "none") : "none") }}>
                                        <span className="pixTableLeftContent caption mediumEmphasis">{opt.header}</span>
                                        <span className="pixTableRightContent caption mediumEmphasis">
                                            <ErrorIcon className="errorRed" style={{ fontSize: "0.831rem" }} />
                                            <span className="caption errorRed" style={{ verticalAlign: "top", display: 'inline-flex' }}>{" "}{localeObj.verify_email}</span>
                                        </span>
                                    </div>
                                    <div style={{ display: (opt.verified !== undefined ? (opt.verified ? 'block' : "none") : "block") }}>
                                        <div
                                            className={"caption mediumEmphasis"}
                                            style={{
                                                float: "left",
                                                width: opt.edit === true ? "80%" : "100%",
                                            }} >{opt.header}</div>
                                        <span
                                            style={{
                                                display: opt.edit === true ? 'block' : "none",
                                                float: "right",
                                                textAlign: 'right',
                                                width: opt.edit === true ? "20%" : "0%",
                                                wordWrap: 'break-word'
                                            }}
                                            className="caption mediumEmphasis">
                                            <EditIcon
                                                className="accent"
                                                style={{ fontSize: "0.831rem" }}
                                                onClick={() => this.editProfileDetails(opt.header)} />
                                        </span>
                                    </div>
                                    <div className="body1 highEmphasis">{opt.details}</div>
                                    <div style={{ display: (opt.verified !== undefined ? (!(opt.verified) ? 'block' : "none") : "none"), marginTop: "3%" }}>
                                        <Button className="body2 highEmphasis" style={this.style.buttonStyle} onClick={this.sendVerificationMail}>{localeObj.verify_email_button}</Button>
                                    </div>
                                </List>
                            ))
                        }
                    </FlexView>
                    <Divider style={{ borderColor: ColorPicker.disabledTxt, margin: "0 1.5rem" }} />
                    <FlexView column align="left" style={{ marginLeft: "4%", marginRight: "4%", marginTop: "3.8%" }} onClick={this.cancelAccount}>
                        <List style={{
                            marginLeft: "4%", marginRight: "7%", marginTop: "3%",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <FlexView column>
                                <div className="caption mediumEmphasis">{localeObj.account}</div>
                                <div className="body1 highEmphasis">{localeObj.cancelAccount}</div>
                            </FlexView>
                            <div style={{ marginTop: "3%" }}>
                                <ArrowIcon className="accent" style={{ fontSize: "1rem" }} onClick={this.cancelAccount} />
                            </div>
                        </List>
                    </FlexView>
                    <FlexView column align="center" onClick={this.handleBottomSheet(true)} style={{ marginTop: "13%", width: "70%", marginBottom: "1.5rem", marginLeft: "3rem", marginRight: "3rem", position: "fixed", bottom: "0px", justifyContent: "center", alignItems: "center" }}>
                        <div className="body2  highEmphasis">{localeObj.change_details}</div>
                    </FlexView>
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "update_email" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "update_email" && !this.state.processing) ? 'block' : 'none' }}>
                        <ButtonAppBar header={localeObj.email} onBack={this.back} onCancel={this.cancelChanges} action="cancel" />
                        {this.state.currentState === "update_email" &&
                            <DetailFormComponent
                                header={localeObj.email_header_profile_update}
                                description={this.props.location.state.profileData ? GeneralUtilities.formattedString(localeObj.email_desc_profile_details, [this.props.location.state.profileData.email]) : ""}
                                field={localeObj.email}
                                type="email"
                                recieveField={this.setTransactionInfo}
                                value={this.state.email}
                                componentName={PageNameJSON.update_email}
                                firstBtn={localeObj.next} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "input_email_otp" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "input_email_otp" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.email_verification} onBack={this.back} onCancel={this.cancelChanges} action="cancel" />
                        {this.state.currentState === "input_email_otp" && <ProfileDetailsOtpComp header={localeObj.email_verification} verify={this.setTransactionInfo}
                            resend={this.sendOtpToEmail}
                            desc={GeneralUtilities.formattedString(localeObj.email_verification_text_profile, [redactedMail])}
                            componentName={PageNameJSON.input_otp} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "faceMatch" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (this.state.currentState === "faceMatch" && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.currentState === "faceMatch" && <FaceMatchComponent
                            componentName={PageNameJSON.update_profile_details_facematch} imageStatus="Selfie info"
                            fourthDescriptionText={fourthDescriptionText} primaryBtnAction={this.doFaceMatch} onBackButtonPressed={this.back} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "selfie_review" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (this.state.currentState === "selfie_review" && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.currentState === "selfie_review" && <FaceMatchComponent
                            componentName={PageNameJSON.update_profile_details_facematch} imageStatus="Selfie review"
                            fourthDescriptionText={fourthDescriptionText} primaryBtnAction={this.callUpdateProfileDetails} onBackButtonPressed={this.back} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.currentState === "success" && <ImageInformationComponent header={this.state.success_header} onCancel={this.backToProfile} icon={moto_logo} type={PageNameJSON["success"]}
                            appBar={true} description={this.state.success_desc} btnText={localeObj.back_to_profile} next={this.backToProfile} noAction={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "update_phoneNumber" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "update_phoneNumber" && !this.state.processing) ? 'block' : 'none' }}>
                        <ButtonAppBar header={localeObj.phone_number} onBack={this.back} onCancel={this.cancelChanges} action="cancel" />
                        {this.state.currentState === "update_phoneNumber" &&
                            <PhoneNumberComponent
                                desc={GeneralUtilities.formattedString(localeObj.phone_desc_profile_details, [this.props.location.state.profileData.phoneNum])}
                                recieveField={this.setTransactionInfo}
                                ddd={this.state.actualDdd}
                                fromComponent={"update_profile"}
                                phoneNumber={this.state.phoneNumber}
                                setDDD={this.setDDD}
                                field={localeObj.phone_number}
                                componentName={PageNameJSON.phoneNumber} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "input_phone_otp" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "input_phone_otp" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.phone_verification} onBack={this.back} onCancel={this.cancelChanges} action="cancel" />
                        {this.state.currentState === "input_phone_otp" && <ProfileDetailsOtpComp header={localeObj.phone_verification} verify={this.setTransactionInfo} resend={this.sendOtpToPhone}
                            desc={GeneralUtilities.formattedString(localeObj.phone_verification_text_profile, [redactedMail])}
                            componentName={PageNameJSON.input_otp} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "update_address" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "update_address" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.profile_address} onBack={this.back} action="cancel" onCancel={this.cancelChanges} />
                        {this.state.currentState === "update_address" && <DetailFormComponent header={localeObj.cep_header} field={localeObj.cep} recieveField={this.setTransactionInfo} type="tel"
                            value={this.state.cep} componentName={PageNameJSON.update_address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "address_incomplete" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "address_incomplete" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.profile_address} onBack={this.back} action="cancel" onCancel={this.cancelChanges} />
                        {this.state.currentState === "address_incomplete" && <AddressCompleteComponent header={localeObj.cep_header} address={this.state.address} showFields={this.state.isAddressincomplete} recieveField={this.setTransactionInfo}
                            componentName={PageNameJSON.update_address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "address" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "address" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.profile_address} onBack={this.back} action="cancel" onCancel={this.cancelChanges} />
                        {this.state.currentState === "address" && <AddressComponent address={this.state.address} recieveField={this.setTransactionInfo} reset={this.back} componentName={PageNameJSON.update_address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "addNum" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "addNum" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.profile_address} onBack={this.back} action="cancel" onCancel={this.cancelChanges} />
                        {this.state.currentState === "addNum" && <DetailFormComponent header={localeObj.address} field={localeObj.add_num} recieveField={this.setTransactionInfo} type="tel"
                            value={this.state.addNum} componentName={PageNameJSON.update_address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "complement" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "complement" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.profile_address} onBack={this.back} action="cancel" onCancel={this.cancelChanges} />
                        {this.state.currentState === "complement" && <DetailFormComponent header={localeObj.comp_header} field={localeObj.add_comp} recieveField={this.setTransactionInfo}
                            value={this.state.complement} componentName={PageNameJSON.update_address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "revision" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "revision" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.profile_address} onBack={this.back} action="cancel" onCancel={this.cancelChanges} />
                        {this.state.currentState === "revision" &&
                            <ImageInformationComponent
                                header={localeObj.update_profile_details_address_header}
                                icon={error}
                                appBar={false}
                                description={localeObj.update_profile_details_address_footer}
                                address={this.state.address}
                                btnText={localeObj.update_profile_details_address_btn}
                                next={this.setTransactionInfo}
                                secBtnText={localeObj.not_address}
                                close={this.moveToAddress}
                                type={PageNameJSON.update_address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "input_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "input_pin" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_authentication} onBack={this.back} action="none" />
                        {this.state.currentState === "input_pin" &&
                            <InputPinPageWithValidation history={this.props.history} confirm={this.setTransactionInfo} componentName={PageNameJSON.input_pin} back={this.back} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.currentState === "error" &&
                            <PixErrorComponent errorJson={this.state.errorJson} btnText={localeObj.back} onClick={this.complete} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetEnabled}
                        onOpen={this.handleBottomSheet(true)}
                        onClose={this.handleBottomSheet(false)}
                        onBackdropClick={this.handleBottomSheet(false)}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ textAlign: "center", marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis">
                                    {localeObj.help_customer_care}
                                </div>
                                <div className="body2 highEmphasis" style={{ marginTop: "1rem" }}>
                                    {localeObj.help_contact_cc}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ marginTop: "1rem", color: ColorPicker.textDisabledColor }}>
                                    {localeObj.cc_timings}
                                </div>
                                <div onClick={this.handleOpenWhatApp}>
                                    <div className="subtitle4" style={{ marginTop: "2.5rem", color: ColorPicker.customerCarelinkColor }}>
                                        {localeObj.cc_whatsapp}
                                    </div>
                                    <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                                        <span onClick={this.handleOpenWhatApp}>{constantObjects.customerCareWADisplay}</span>
                                    </div>
                                </div>
                                <div onClick={this.handleDialer(constantObjects.customerCarePhoneNumberDialer)}>
                                    <div className="subtitle4" style={{ marginTop: "2rem", color: ColorPicker.customerCarelinkColor }}>
                                        {localeObj.cc_call_us}
                                    </div>
                                    <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                                        <span onClick={this.handleDialer(constantObjects.customerCarePhoneNumberDialer)}>{constantObjects.customerCarePhoneNumberDisplay}</span>
                                    </div>
                                </div>
                                <div className="body2 highEmphasis" style={{ marginTop: "4rem" }}>
                                    <span onClick={this.handleBottomSheet(false)}>{localeObj.cancel}</span>
                                </div>
                            </FlexView>
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

ProfileDetailsComponent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ProfileDetailsComponent);
