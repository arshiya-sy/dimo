import React from "react";
import PropTypes from "prop-types";
import jwtDecode from "jwt-decode";

import { withStyles } from "@material-ui/core/styles";

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import localeService from "../../Services/localeListService";
import CommonFunctions from "../../Services/CommonFunctions";
import GeneralUtilities from "../../Services/GeneralUtilities";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import androidApiCallsService from "../../Services/androidApiCallsService";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import {
    FACE_LIVELINESS, FACELIVENESS_URI, FACELIVENESS_SUCCESS, FACELIVENESS_FAILURE,
    CAMERA_PERMISSION, CAF_VALIDATION, UNBLOCK_ACCOUNT_FAILED, CAF_IMG_MAX_SIZE
} from "./../../Services/UnblockAccount/UnblockAccountTerms";

var localeObj = {};
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.UnblockAccountComponents;
const ConstantObjectJSON = constantObjects.UnblockAccount;

let caf_start_time = "";

class FaceAuthComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            jwtToken: "",
            isAlive: false,
            base64Image: "",
            selfieImageUrl: "",
            showCameralAlertDialog: false,
        };

        this.componentName = PageNameJSON.unblock_account_face_auth;

        this.styles = {};

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        this.InitFaceAuthEventListeners();
    }

    componentDidMount = () => {
        this.startFaceMatchAuth();
    }

    goBackScreenHandler = () => this.props.onBackButtonPressed();

    showSnackBarMessage = (snackBarMessage) => this.props.openSnackBar(snackBarMessage);

    goBackAndShowMessage = (message) => {
        this.showSnackBarMessage(message);
        this.goBackScreenHandler();
    }

    setSelfieImageDataHandler = () => {
        const { selfieImageUrl, jwtToken, base64Image } = this.state;

        this.props.setSelfieImageData({ jwtToken, selfieImageUrl, base64Image });
    };

    onNextButtonPressedHandler = (changeState = null) => this.props.onNextButtonPressed(changeState);

    setSelfieAndRedirectNext = () => {
        this.setSelfieImageDataHandler();
        this.onNextButtonPressedHandler();
    }

    nullCheck = (data) => GeneralUtilities.isNotEmpty(data) ? 'Not Null': 'Null';

    InitFaceAuthEventListeners = () => {
        window.onRequestPermissionsResult = (permission, status) => {
            if (permission !== CAMERA_PERMISSION) {
                return;
            }

            if (status === true) {
                return this.startFaceMatchAuth();
            }

            if (androidApiCallsService.isFeatureEnabledInApk(CAF_VALIDATION)) {
                this.setState({ showCameralAlertDialog: true });
            } else {
                return this.goBackAndShowMessage(localeObj.allow_camera);
            }
        }

        window.onPassiveLivenessImage = (selfieImageUrl) => {
            Log.sDebug(`onPassiveLivenessImage - Unblock Account: selfieImage=${this.nullCheck(selfieImageUrl)}`, this.componentName, constantObjects.LOG_PROD);

            this.setState({ selfieImageUrl });
        }

        window.onFaceLivenessImage = (selfieImageUrl, JWT) => {
            Log.sDebug(`onActiveFaceLivenessImage - Unblock Account: selfieImageUrl=${this.nullCheck(selfieImageUrl)} JWT=${this.nullCheck(JWT)}`, this.componentName, constantObjects.LOG_PROD);

            try {
                const JWTLastIndex = JWT.lastIndexOf(".");
                const JWTSubstring = JWT.substr(0, JWTLastIndex);
                const decodedJWTToken = jwtDecode(JWTSubstring);

                Log.sDebug(`onActiveFaceLivenessImage JWT substring - Unblock Account: ${JWTSubstring}`, this.componentName);
                Log.sDebug(`DecodedToken - Unblock Account: ${this.nullCheck(decodedJWTToken)}`, this.componentName, constantObjects.LOG_PROD);

                if (selfieImageUrl && decodedJWTToken && decodedJWTToken.isAlive) {
                    this.setState({ isAlive: decodedJWTToken.isAlive, selfieImageUrl, jwtToken: JWT });
                }
            } catch (error) {
                Log.sDebug(`Error decoding JWT token - Unblock Account: ${error.message}`, this.componentName);

                return this.goBackAndShowMessage(localeObj.retry_later);
            }
        }

        window.onPassiveLivenessStatus = (finalFaceLivenessJSON) => {
            Log.sDebug(`onPassiveLivenessStatus - Unblock Account: finalFaceLivenessStatusCode=${finalFaceLivenessJSON?.sdkStatusCode}`, this.componentName, constantObjects.LOG_PROD);

            if (!finalFaceLivenessJSON) {
                Log.sDebug("onPassiveLiveness - Unblock Account: SDK Failure with NULL JSON from APK", this.componentName);

                // Redirect to face Auth failed try again
                return this.goBackAndShowMessage(localeObj.retry_later);
            }

            Log.sDebug(`onPassiveLiveness SDK completed - Unblock Account: finalFaceLivenessJSON=${JSON.stringify(finalFaceLivenessJSON)}`, this.componentName);

            if (finalFaceLivenessJSON.sdkStatusCode && finalFaceLivenessJSON.sdkStatusCode === 1) {
                return this.setSelfieAndRedirectNext();
            } else {
                // Redirect to face Auth failed try again
                return this.goBackAndShowMessage(GeneralUtilities.getCAFFailureText(finalFaceLivenessJSON.sdkStatusMessage, localeObj));
            }
        }

        window.onFaceLivenessStatus = (finalFaceLiveness) => {
            Log.sDebug(`onActiveFaceLivenessStatus - Unblock Account: ${finalFaceLiveness}`, constantObjects.LOG_PROD);

            const timeSpentOnCAF = new Date().getTime() - caf_start_time;

            Log.sDebug(`FaceLiveness - Unblock Account: SDK completed ${finalFaceLiveness}`, this.componentName);

            if (!finalFaceLiveness || finalFaceLiveness !== "Success") {
                Log.sDebug(`FaceLiveness - Unblock Account: SDK Failure with status ${finalFaceLiveness}`, this.componentName);

                return this.goBackScreenHandler();
            }

            if (this.state.isAlive) {
                Log.sDebug("Active FaceLiveness SDK Success - Unblock Account: isAlive true", this.componentName);

                GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj, PageNameJSON['unblock_account_face_auth']);

                return this.setSelfieAndRedirectNext();
            } else {
                Log.sDebug("Active FaceLiveness - Unblock Account: SDK Failure due to isAlive false", this.componentName, constantObjects.LOG_PROD);

                GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON['unblock_account_face_auth']);

                // Redirect to face Auth failed try again
                return this.onNextButtonPressedHandler(UNBLOCK_ACCOUNT_FAILED);
            }
        }

        window.onAttachImageComplete = (response) => {
            this.onPassiveLivenessCameraImage(response);
            this.setSelfieAndRedirectNext();
            androidApiCallsService.hideProgressDialog();
        }
    }

    onPassiveLivenessCameraImage = (response) => {
        const mimeType = 'image/jpeg';
        const filename = Object.keys(response)[0];
        const dataURI = response[filename];
        const byteString = atob(dataURI);

        // Create a typed array directly from the byte string
        const arrayBuffer = Uint8Array.from(byteString, char => char.charCodeAt(0));

        // Create a Blob from the typed array
        const blob = new Blob([arrayBuffer], { type: mimeType });

        // Check the blob size and handle the condition
        if (blob.size > CAF_IMG_MAX_SIZE) {
            this.goBackAndShowMessage(localeObj.image_exceed_retake);
        } else {
            const base64Image = response[filename];

            this.setState({ base64Image, selfieImageUrl: `data:image/jpeg;base64,${base64Image}` });
        }
    }

    startFaceMatchAuth = () => {
        CommonFunctions.sendEventMetrics(ConstantObjectJSON.unblockAccountFaceMatch, PageNameJSON.unblock_account_face_auth);

        if (androidApiCallsService.checkSelfPermission(CAMERA_PERMISSION) !== 0) {
            return androidApiCallsService.requestPermission(CAMERA_PERMISSION);
        }

        if (!GeneralUtilities.isCAFEnabled()) {
            return this.goBackAndShowMessage(localeObj.facematch_not_sup);
        }

        if (androidApiCallsService.isFeatureEnabledInApk(FACE_LIVELINESS) && GeneralUtilities.doesDeviceSupportActiveFaceliveness()) {
            androidApiCallsService.faceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
        } else {
            if ([PageNameJSON.unblock_account_face_auth].includes(this.props.fromComponent)) {
                androidApiCallsService.showProgressDialog();
                return androidApiCallsService.openCustomCamera("selfie");
            }

            androidApiCallsService.passiveFaceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
        }
    }

    closeCameraAlertDialogHandler = () => this.setState({ showCameralAlertDialog: false }, () => this.goBackScreenHandler());

    render() {
        const { showCameralAlertDialog } = this.state;

        return (
            <div>
                <CustomizedProgressBars />

                {
                    showCameralAlertDialog
                    && <AlertDialog
                        title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialogHandler}
                    />
                }
            </div>
        );
    }
}

FaceAuthComponent.propTypes = {
    openSnackBar: PropTypes.func,
    onBackButtonPressed: PropTypes.func,
    setSelfieImageData: PropTypes.func,
    onNextButtonPressed: PropTypes.func,
};

export default withStyles(styles)(FaceAuthComponent);