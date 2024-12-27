import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ProgressBar from "../CommonUxComponents/ProgressBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import InformationPage from "../CommonUxComponents/ImageInformationComponent";
import PreviewImageComponent from "../OnBoardingSupportComponents/PreviewImageComponent";
import AlertDialog from "./AlertDialog";

import FlexView from "react-flexview";
import PropTypes from "prop-types";
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';

import photo_back_rg from "../../images/SpotIllustrations/RG Big - Back.png";
import photo_back_cnh from "../../images/SpotIllustrations/CNH Big - Back.png";
import face from "../../images/SpotIllustrations/Face.png";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import OcrProperties from "../../Services/OcrProperties";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import GeneralUtilities from "../../Services/GeneralUtilities";
import jwtDecode from 'jwt-decode';

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const MAX_IMG_SIZE_LIMIT = 1024 * 1024 * 3;
const CAF_LOGS = "CAF_FACELIVENESS";
const FACELIVENESS_SUCCESS = "FACELIVENESS_SUCCESS";
const FACELIVENESS_FAILURE = "FACELIVENESS_FAILURE";
const FACELIVENESS_URI = "GET_LIVENESS_METRICS_FOR_CAF"
const ACCESS_CAMERA_PERMISSION = "android.permission.CAMERA";

var caf_start_time = "";
var jsonObjectFront = {};
var jsonObjectBack = {};
var jsonObjectSelfie = {};

const PageNameJSON = PageNames.doumentUpload;
var localeObj = {};
let sdk_enabled_path = {
    pathname: '/identityCreation',
    state: 'doc',
    transition: "right",
    steps: 9
}

let sdk_not_enabled_path = {
    pathname: '/identityCreation',
    state: 'photo',
    transition: "right",
    steps: 9
}

class DocumentUploadComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appBarState: "Identification",
            creationState: this.props.location.state && this.props.location.state.creationState ? this.props.location.state.creationState : "front",
            frontImg: "",
            direction: "",
            backImg: "",
            selfie: "",
            steps: this.props.location.state && this.props.location.state.steps ? this.props.location.state.steps : 15,
            nextUrl: this.props.location.state && this.props.location.state.nextUrl ? this.props.location.state.nextUrl : "",
            nextUrlPayload: this.props.location.state && this.props.location.state.nextUrlPayload ? this.props.location.state.nextUrlPayload : {},
            open: false,
            snackBarOpen: false,
            rgDoc: false,
            callFaceLiveness: false,
            disabled: false,
            isAlive: false,
            selfieSucess: false
        };
        Log.sDebug("nextUrl is " + this.state.nextUrl);
        this.onBack = this.onBack.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.send = this.send.bind(this);
        this.onRetakePress = this.onRetakePress.bind(this);
        MetricServices.onPageTransitionStart(PageNameJSON.front);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
            this.setState({
                appBarState: localeObj.pix_identification
            })
        }

        if (ImportantDetails.uploadDocType === constantObjects.DOC_TYPE.RG) {
            this.setState({
                rgDoc: true
            })
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === ACCESS_CAMERA_PERMISSION) {
                if (status === true) {
                    this.send();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            cameraAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.allow_camera);
                    }
                }
            }
        }

        window.onPassiveLivenessImage = (selfieImage) => {
            OcrProperties.readOcr(PageNameJSON.selfieReview);
            this.setState({
                selfie: selfieImage
            });
        }

        window.onFaceLivenessImage = (imageUrl, jwt) => {
           Log.sDebug("onActiveFaceLivenessImage " + imageUrl + " : " + jwt);


           try {
              let i = jwt.lastIndexOf(".");
              let subjwt = jwt.substr(0, i);
              Log.sDebug("onActiveFaceLivenessImage sub test : " + subjwt);
              const decodedToken = jwtDecode(subjwt);
              Log.sDebug("decodedToken : " + decodedToken + " : " + decodedToken.isAlive + " : " + decodedToken.userId + " : " + decodedToken.requestId);
              if(imageUrl && decodedToken && decodedToken.isAlive) {
                 OcrProperties.readOcr(PageNameJSON.selfieCAF);
                 this.setState({
                    isAlive: decodedToken.isAlive
                 });
                 this.setState({
                    selfie: imageUrl
                 });
              }
           } catch (error) {
              Log.sDebug('Error decoding JWT token:', error);
              return null;
           }

        }

        window.onPassiveLivenessStatus = (faceLiveJson) => {
            MetricServices.onPageTransitionStop(PageNameJSON.selfieCAF, PageState.closed);
            let timeSpentOnCAF = new Date().getTime() - caf_start_time;
            let finalFaceLivenessJSON = faceLiveJson;
            this.showProgressDialog();
            if (finalFaceLivenessJSON) {
                Log.sDebug("Faceliveness SDK compelte. Logs " + JSON.stringify(finalFaceLivenessJSON));
                if (finalFaceLivenessJSON.sdkStatusCode && finalFaceLivenessJSON.sdkStatusCode === 1) {
                    GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLivenessJSON, localeObj, PageNameJSON.selfieCAF);
                    this.uploadSelfieDocWithCAF(this.state.selfieImage);
                } else {
                    this.hideProgressDialog();
                    GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLivenessJSON, localeObj, PageNameJSON.selfieCAF);
                    Log.sDebug("Faceliveness SDK Failure with status code 0", CAF_LOGS, constantObjects.LOG_PROD);
                    this.openSnackBar(GeneralUtilities.getCAFFailureText(finalFaceLivenessJSON.sdkStatusMessage, localeObj));
                }
            } else {
                GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, "", localeObj, PageNameJSON.selfieCAF);
                this.hideProgressDialog();
                Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK", CAF_LOGS, constantObjects.LOG_PROD);
                this.openSnackBar(localeObj.retry_later);
            }
        }

        window.onFaceLivenessStatus = (faceLive) => {
            Log.sDebug("DocumentUploadComponent - onActiveFaceLivenessStatus : " + faceLive);
            MetricServices.onPageTransitionStop(PageNameJSON.selfieCAF, PageState.closed);
            let timeSpentOnCAF = new Date().getTime() - caf_start_time;
            let finalFaceLiveness = faceLive;
            if(finalFaceLiveness) {
                Log.sDebug("Active Faceliveness SDK compelte. Logs " + finalFaceLiveness + " : " + this.state.isAlive);
                if(finalFaceLiveness === "Success") {
                    if(this.state.isAlive) {
                       GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj, PageNameJSON.selfieCAF);
                       this.uploadSelfieDocWithCAF(this.state.selfieImage);
                    } else {
                        this.hideProgressDialog();
                        Log.sDebug("Active Faceliveness SDK Failure due to isAlive false", CAF_LOGS, constantObjects.LOG_PROD);
                        this.openSnackBar(GeneralUtilities.getCAFFailureText("1", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON.selfieCAF);
                    }
                } else {
                    this.hideProgressDialog();
                    Log.sDebug("Active Faceliveness SDK Failure with status code 0", CAF_LOGS, constantObjects.LOG_PROD);
                    if (finalFaceLiveness === "Network Error") {
                        //Need to enable this in future : this.openSnackBar(GeneralUtilities.getCAFFailureText("2000", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "2000", localeObj, PageNameJSON.selfieCAF);
                    } else if (finalFaceLiveness === "Server Error") {
                        //Need to enable this in future : this.openSnackBar(GeneralUtilities.getCAFFailureText("1000", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "1000", localeObj, PageNameJSON.selfieCAF);
                    } else {
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON.selfieCAF);
                    }
                }
            } else {
                GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, "", localeObj, PageNameJSON.selfieCAF);
                this.hideProgressDialog();
                Log.sDebug("Active Faceliveness SDK Failure with NULL JSON from APK", CAF_LOGS, constantObjects.LOG_PROD);
                this.openSnackBar(localeObj.retry_later);
            }
        }

        window.onBackPressed = () => {
            if (this.state.open) {
                this.setState({ open: false });
            } else {
                this.onBack();
            }
        }

        window.onAttachImageComplete = (response) => {
            this.updatePreview(response);
        }

        window.onPauseCamera = () => {
            this.onResume();
        }

        if (this.state.creationState === "front") {
            androidApiCalls.openCustomCamera("front");
        }
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    updatePreview = (response) => {
        let mimeString = 'image/jpeg';
        let filename = Object.keys(response)[0];
        let dataURI = response[filename];
        let byteString = atob(dataURI);

        // write the bytes of the string to an ArrayBuffer
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let j = 0; j < byteString.length; j++) {
            ia[j] = byteString.charCodeAt(j);
        }
        androidApiCalls.showProgressDialog(localeObj.loading, false);
        // write the ArrayBuffer to a blob, and you're done
        let convertedblob = new Blob([ab], { type: mimeString });
        if (convertedblob.size > MAX_IMG_SIZE_LIMIT) {
            androidApiCalls.hideProgressDialog();
            this.openSnackBar(localeObj.image_exceed + ". Please retake the image");
            this.onBack();
        } else {
            androidApiCalls.hideProgressDialog();
            this.send(response[filename]);
        }
    }

    uploadFrontDoc(frontDoc) {
        this.showProgressDialog();
        let frontImage = GeneralUtilities.emptyValueCheck(frontDoc) ? this.state.frontImg : frontDoc;
        jsonObjectFront = {
            "base64": frontImage,
            "extensao": 1
        }
        arbiApiService.uploadFront(jsonObjectFront, false,  PageNameJSON.front)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processUploadFrontDocResponse(response.result);
                    if (processorResponse.success) {
                        this.hideProgressDialog();
                        return this.setState({
                            creationState: "backCam",
                            steps: this.state.steps + 1 // 11
                        });
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(localeObj.error_front);
                    }
                } else {
                    this.hideProgressDialog();
                    this.openSnackBar(localeObj.error_front);
                }
            });
    }

    uploadBackDoc(backDoc) {
        let backImage = GeneralUtilities.emptyValueCheck(backDoc) ? this.state.backImg : backDoc;
        jsonObjectBack = {
            "base64": backImage,
            "extensao": 1
        }

        this.showProgressDialog();
        arbiApiService.uploadBack(jsonObjectBack, false, PageNameJSON.back)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processUploadBackDocResponse(response.result);
                    if (processorResponse.success) {
                        this.hideProgressDialog();
                        OcrProperties.readOcr(PageNameJSON.backCam);

                        let nextUrl = this.state.nextUrl ? this.state.nextUrl : "/validateIdCreation";
                        this.props.history.replace({ pathname: nextUrl });
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(localeObj.error_back);
                    }
                } else {
                    this.hideProgressDialog();
                    this.openSnackBar(localeObj.error_back);
                }
            })
    }

    uploadSelfieDoc(selfieImage) {
        let selfieClicked = GeneralUtilities.emptyValueCheck(selfieImage) ? this.state.selfie : selfieImage;
        jsonObjectSelfie = {
            "base64": selfieClicked,
            "extensao": 1
        }

        this.showProgressDialog();
        arbiApiService.uploadSelfie(jsonObjectSelfie, false, PageNameJSON.selfie).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processUploadSelfieDocResponse(response.result);
                    if (processorResponse.success) {
                        this.props.history.replace({
                            pathname: "/docInformation",
                            state: { creationState: "selfieSuccess",
                                steps: 13,
                                details: this.props.location.state && this.props.location.state.rgInfo ? this.props.location.state.rgInfo : {} },
                        });
                    } else {
                        this.openSnackBar(localeObj.error_selfie);
                    }
                } else {
                    this.openSnackBar(localeObj.error_selfie);
                }
            });
    }

    async uploadSelfieDocWithCAF(selfieImage) {
        let selfieClicked = GeneralUtilities.emptyValueCheck(selfieImage) ? this.state.selfie : selfieImage;
        jsonObjectSelfie = {
            "url": selfieClicked,
            "extensao": 1
        }
        await arbiApiService.uploadSelfie(jsonObjectSelfie, true, PageNameJSON.selfieCAF)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processUploadSelfieDocResponse(response.result);
                    if (processorResponse && processorResponse.success) {
                        this.props.history.replace({
                            pathname: "/docInformation",
                            state: { creationState: "selfieSuccess",
                                steps: 13,
                                details: this.props.location.state && this.props.location.state.rgInfo ? this.props.location.state.rgInfo : {} },
                        });
                    } else {
                        this.openSnackBar(localeObj.error_selfie);
                    }
                } else {
                    this.openSnackBar(localeObj.error_selfie);
                }
            });
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        });
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        });
    }

    send = (field) => {
        if (androidApiCalls.checkSelfPermission(ACCESS_CAMERA_PERMISSION) === 0) {
            switch (this.state.creationState) {
                case "front":
                    androidApiCalls.hideProgressDialog();
                    MetricServices.onPageTransitionStop(PageNameJSON.front, PageState.close);
                    return this.setState({
                        frontImg: field,
                        creationState: "frontReview",
                        direction: "left",
                        steps: this.state.steps + 1 //10
                    })
                case "frontReview":
                    this.uploadFrontDoc();
                    break;
                case "backCam":
                    this.setState({
                        creationState: "back",
                        direction: "left",
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.back);
                    return androidApiCalls.openCustomCamera("back");
                case "back":
                    androidApiCalls.hideProgressDialog();
                    MetricServices.onPageTransitionStop(PageNameJSON.back, PageState.close);
                    return this.setState({
                        creationState: "backPreview",
                        direction: "left",
                        backImg: field,
                        steps: this.state.steps + 1 //12
                    })
                case "backPreview":
                    this.hideProgressDialog();
                    this.uploadBackDoc();
                    break;
                case "selfieCam":
                    if (GeneralUtilities.isCAFEnabled()) {
                        MetricServices.onPageTransitionStart(PageNameJSON.selfieCAF);
                        this.setState({ disabled: true });
                        caf_start_time = new Date().getTime();
                        Log.sDebug("Just before apk launch");
                        let retStatus = 0;
                        if (androidApiCalls.isFeatureEnabledInApk("FACE_LIVELINESS")) {
                            Log.sDebug("Active Face Liveness");
                            retStatus = androidApiCalls.faceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                        } else {
                            Log.sDebug("Passive Face Liveness");
                            retStatus = androidApiCalls.passiveFaceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                        }
                        Log.sDebug("After apk launch - show progress");
                        this.showProgressDialog();
                        this.timeoutHandleOne = setTimeout(() => {
                            clearTimeout(this.timeoutHandleOne);
                            this.hideProgressDialog();
                        }, 10000);
                        return retStatus;
                    } else {
                        MetricServices.onPageTransitionStart(PageNameJSON.selfie);
                        this.setState({
                            creationState: "selfie",
                            direction: "left",
                        })
                    }
                    return androidApiCalls.openCustomCamera("selfie");
                case "selfie":
                    androidApiCalls.hideProgressDialog();
                    MetricServices.onPageTransitionStop(PageNameJSON.selfie, PageState.close);
                    return this.setState({
                        selfie: field,
                        steps: this.state.steps + 1, //14
                        creationState: "selfieReview",
                        direction: "left",
                    })
                case "selfieReview":
                    this.uploadSelfieDoc();
                    break;
                default: break;
            }

        } else {
            androidApiCalls.requestPermission(ACCESS_CAMERA_PERMISSION);
        }

    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "front":
                    if(GeneralUtilities.isCAFEnabled()) {
                        return this.openSnackBar(localeObj.back_press_CAF);
                   } else {
                        return this.props.history.replace(sdk_not_enabled_path);
                    }
                case "frontReview":
                    this.setState({
                        creationState: "front",
                        direction: "right",
                        steps: this.state.steps - 1,
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.front);
                    return androidApiCalls.openCustomCamera("front");
                case "backCam":
                    return this.setState({
                        creationState: "frontReview",
                        direction: "right",
                        steps: this.state.steps - 1

                    })
                case "back":
                    return this.setState({
                        creationState: "backCam",
                    })
                case "backPreview":
                    this.setState({
                        creationState: "back",
                        direction: "right",
                        steps: this.state.steps - 1,
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.back);
                    return androidApiCalls.openCustomCamera("back");
                case "selfieCam":
                    if (this.state.backImg === "") {
                        if(GeneralUtilities.isCAFEnabled()) {
                            return this.openSnackBar(localeObj.back_press_CAF);
                       } else {
                            return this.props.history.replace(sdk_not_enabled_path);
                        }
                    } else {
                        return this.setState({
                            steps: this.state.steps - 1,
                            direction: "right",
                            creationState: "backPreview"
                        })
                    }
                case "selfie":
                    return this.setState({
                        creationState: "selfieCam"
                    })
                case "selfieReview":
                    this.setState({
                        creationState: "selfie",
                        direction: "right",
                        steps: this.state.steps - 1,
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.selfie);
                    return androidApiCalls.openCustomCamera("selfie");
                default: break;
            }
        }
    }

    onResume = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.resume);
        switch (this.state.creationState) {
            case "front":
                if (GeneralUtilities.isCAFEnabled()) {
                    return this.props.history.replace(sdk_enabled_path);
                } else {
                    return this.props.history.replace(sdk_not_enabled_path);
                }
            case "back":
                return this.setState({
                    creationState: "backCam"
                })
            case "selfie":
                return this.setState({
                    creationState: "selfieCam"
                })
            default: break;
        }
    }

    onRetakePress = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.retake);
        switch (this.state.creationState) {
            case "frontReview":
                this.setState({
                    creationState: "front",
                    steps: this.state.steps - 1,
                })
                MetricServices.onPageTransitionStart(PageNameJSON.front);
                return androidApiCalls.openCustomCamera("front");
            case "backPreview":
                this.setState({
                    creationState: "back",
                    steps: this.state.steps - 1,
                })
                MetricServices.onPageTransitionStart(PageNameJSON.back);
                return androidApiCalls.openCustomCamera("back");
            case "selfieReview":
                this.setState({
                    creationState: "selfie",
                    steps: this.state.steps - 1,
                })
                MetricServices.onPageTransitionStart(PageNameJSON.selfie);
                return androidApiCalls.openCustomCamera("selfie");
            default: break;
        }
    }

    onCancel = () => {
        this.setState({ open: true })
    }

    onSecondary = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.cancel);
        this.props.history.replace({ pathname: "/", transition: "right" });
        this.setState({ open: false })
    }

    onPrimary = () => {
        this.setState({ open: false })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    next = () => {
        this.props.history.replace({ pathname: "/", transition: "right" });
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    render() {
        const { classes } = this.props;
        const creation = this.state.creationState;
        const steps = this.state.steps;
        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.identification} onBack={this.onBack} onCancel={this.onCancel} action="cancel" />
                <ProgressBar size={steps} />
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "frontReview" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "frontReview" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "frontReview" && <PreviewImageComponent header={localeObj.review_header}
                            description={localeObj.review_description_front}
                            id={this.state.frontImg} componentName={PageNameJSON.frontReview} reviewCompleted={this.send} retake={this.onRetakePress} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "backCam" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "backCam" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "backCam" &&
                            <InformationPage header={this.state.rgDoc ? localeObj.back_cam_header_rg : localeObj.back_cam_header_cnh}
                                icon={this.state.rgDoc ? photo_back_rg : photo_back_cnh} appBar={false} btnText={localeObj.open_cam} disabled={this.state.disabled} type={PageNameJSON.backCam} next={this.send}
                                description={this.state.rgDoc ? localeObj.back_cam_description_rg : localeObj.back_cam_description_cnh} />
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "backPreview" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "backPreview" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "backPreview" && <PreviewImageComponent header={localeObj.review_header}
                            description={localeObj.review_description_back} componentName={PageNameJSON.backPreview}
                            id={this.state.backImg} reviewCompleted={this.send} retake={this.onRetakePress} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "selfieCam" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "selfieCam" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "selfieCam" &&
                            <InformationPage header={localeObj.selfie_header} icon={face} appBar={false} suggestion={localeObj.selfie_sugestion}
                                description={localeObj.selfie_description} subText={localeObj.unblock_selfie_info_tip} type={PageNameJSON.selfieCam}
                                btnText={localeObj.open_cam} next={this.send} fromSelfieCam={true} selfieSubHeader={localeObj.selfie_subHeader}/>
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "selfieReview" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "selfieReview" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "selfieReview" && <PreviewImageComponent header={localeObj.review_selfie}
                            description={localeObj.review_description_selfie} componentName={PageNameJSON.selfieReview}
                            id={this.state.selfie} reviewCompleted={this.send} retake={this.onRetakePress} />}
                    </div>
                </CSSTransition>

                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "selfieSucess" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "selfieSucess" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "selfieSucess" &&
                            <InformationPage appBar={false} header={"You're all set!"} 
                                description={"You have finished registering with Dimo, now we will analyze your data and we will notify you by email in a instant."}
                                btnText={"Understood"} next={this.next} type={this.componentName} footer={localeObj.help}
                            />
                        }
                    </div>
                </CSSTransition> */}

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.cancel_message_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.cancel_message_description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
                            <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
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

DocumentUploadComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(DocumentUploadComponent);
