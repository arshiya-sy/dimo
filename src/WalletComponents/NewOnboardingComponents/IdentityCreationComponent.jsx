import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import SelectMenuOption from "../CommonUxComponents/SelectMenuOption";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ProgressBar from "../CommonUxComponents/ProgressBarComponent";
import InformationPage from "../CommonUxComponents/ImageInformationComponent";

import FlexView from "react-flexview";
import PropTypes from "prop-types";
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ChevronRightOutlined';

import tipsRg from "../../images/SpotIllustrations/New RG - Tips.png";
import tipsCnh from "../../images/SpotIllustrations/CNH - Tips.png";
import photoRg from "../../images/SpotIllustrations/RG Big - Front.png";
import photoCnh from "../../images/SpotIllustrations/CNH Big - Front.png";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import GeneralUtilities from "../../Services/GeneralUtilities";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import Log from "../../Services/Log";
import AlertDialog from "./AlertDialog";
import ColorPicker from "../../Services/ColorPicker";
import UploadPDFDocumentComponent from "./UploadPDFDocumentComponent";

const ACCESS_CAMERA_PERMISSION = "android.permission.CAMERA";
const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.identityData;
const CAF_LOGS = "CAF_DOCUMENT_DETECTOR";
const DOCUMENT_DETECTOR_SUCCESS = "DOCUMENT_DETECTOR_SUCCESS";
const DOCUMENT_DETECTOR_FAILURE = "DOCUMENT_DETECTOR_FAILURE";
const DOCUMENT_DETECTOR_URI = "GET_DOCUMENT_METRICS_FOR_CAF";
var localeObj = {};
var jsonObjectFront = {};
var jsonObjectBack = {};
var typeSet = "";
var caf_start_time = "";

class IdentityCreationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            direction: "",
            steps: this.props.location.state && this.props.location.state.step ? this.props.location.state.step : 11,
            creationState: props.location.state.creationState || "doc",
            docType: "",
            open: false,
            snackBarOpen: false,
            rgDoc: false,
            nextUrlPayload: props.location.nextUrlPayload ? props.location.nextUrlPayload : {},
            cancelState: false,
            setFieldValue: "",
            documentSelection: false,
            address: this.props.location.state && this.props.location.state.address ? this.props.location.state.address : {},
            cepInfo: this.props.location.state && this.props.location.state.cepInfo ? this.props.location.state.cepInfo : {},
            salary: this.props.location.state && this.props.location.state.salary ? this.props.location.state.salary : "",
            political: this.props.location.state && this.props.location.state.political ? this.props.location.state.political : "",
            appBarState: localeObj.pix_identification
        };
        this.setField = this.setField.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.uploadDocument = this.uploadDocument.bind(this);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
            this.setState({
                appBarState: localeObj.pix_identification
            })
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === ACCESS_CAMERA_PERMISSION) {
                if (status === true) {
                    if (GeneralUtilities.isCAFEnabled()) {
                        this.uploadDocument(typeSet);
                    } else {
                        this.setState({
                            creationState: "photo",
                            direction: "left",
                            steps: this.state.steps + 1
                        })
                    }
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
        window.onBackPressed = () => {
            if (this.props.location.state === "photo") {
                if (GeneralUtilities.isCAFEnabled()) {
                    return this.setState({
                        creationState: "doc",
                        direction: "right",
                        steps: this.state.steps - 1
                    });
                } else {
                    this.props.location.state = "";
                    this.onBack();
                }
            } else {
                if (this.state.documentSelection) {
                    this.setState({ documentSelection: false });
                } else if (this.state.open) {
                    this.setState({ open: false });
                } else {
                    this.onBack();
                }
            }
        }

        window.onDocDetectorFront = (base64FrontImage) => {
            this.showProgressDialog();
            Log.sDebug("Front image received successfully");
            this.setState({
                frontImg: base64FrontImage,
            });
        }

        window.onDocDetectorBack = (base64BackImage) => {
            Log.sDebug("Back image received successfully");
            this.setState({
                backImg: base64BackImage,
            });
        }

        window.onDocumentsDetectorSuccess = async (jsonObj) => {
            MetricServices.onPageTransitionStop(PageNameJSON.caf, PageState.close);
            let timeSpentOnCAF = new Date().getTime() - caf_start_time;
            let finalDocJSON = jsonObj;
            if (finalDocJSON) {
                Log.sDebug("Doc detector SDK compelte. Logs " + JSON.stringify(finalDocJSON));
                if (finalDocJSON.sdkStatusCode && finalDocJSON.sdkStatusCode === 1) {
                    GeneralUtilities.sendCAFSDKMetrics(DOCUMENT_DETECTOR_URI, DOCUMENT_DETECTOR_SUCCESS, true, timeSpentOnCAF, finalDocJSON, localeObj);
                    await Promise.all([await this.uploadFrontDoc(this.state.frontImg), await this.uploadBackDoc(this.state.backImage)])
                        .then(() => {
                            this.hideProgressDialog();
                            this.props.history.replace({
                                pathname: "/validateIdCreation",
                                state: {step: 13, nextUrlPayload: this.state.nextUrlPayload },
                            });
                        }).catch(() => {
                            this.hideProgressDialog();
                            Log.sDebug("Doc detector SDK Failure Jazz upload failue", CAF_LOGS, constantObjects.LOG_PROD);
                            this.openSnackBar(localeObj.retry_later);
                        })
                } else {
                    this.hideProgressDialog();
                    Log.sDebug("Doc detector SDK Failure with code 0", CAF_LOGS, constantObjects.LOG_PROD);
                    GeneralUtilities.sendCAFSDKMetrics(DOCUMENT_DETECTOR_URI, DOCUMENT_DETECTOR_FAILURE, true, timeSpentOnCAF, finalDocJSON, localeObj);
                    this.openSnackBar(GeneralUtilities.getCAFFailureText(finalDocJSON.sdkStatusMessage, localeObj));
                }
            } else {
                this.hideProgressDialog();
                GeneralUtilities.sendCAFSDKMetrics(DOCUMENT_DETECTOR_URI, DOCUMENT_DETECTOR_FAILURE, true, timeSpentOnCAF, "", localeObj);
                Log.sDebug("Doc detector SDK Failure with NULL JSON from APK", CAF_LOGS, constantObjects.LOG_PROD);
                this.openSnackBar(localeObj.retry_later);
            }
        }

        if (ImportantDetails.uploadDocType === constantObjects.DOC_TYPE.RG) {
            this.setState({
                rgDoc: true
            });
        }
    }

    setField = (field) => {
        switch (this.state.creationState) {
            case "doc":
                if (GeneralUtilities.isCAFEnabled()) {
                    if (field === localeObj.rg) {
                        this.setState({
                            docType: field,
                            rgDoc: true,
                        });
                        typeSet = localeObj.rg;
                        this.uploadDocument(localeObj.rg);
                    } else if (field === localeObj.cnh) {
                        this.setState({
                            rgDoc: false,
                            docType: field,
                        });
                        typeSet = localeObj.cnh;
                        this.uploadDocument(localeObj.cnh);
                    } else if (field === localeObj.rne) {
                        this.setState({
                            rgDoc: false,
                            docType: field,
                        });
                        typeSet = localeObj.rne;
                        this.uploadDocument(localeObj.rne);
                    }
                } else {
                    if (field === localeObj.rg) {
                        this.setState({
                            rgDoc: true
                        });
                    } else if (field === localeObj.cnh) {
                        this.setState({
                            rgDoc: false
                        });
                    } else if (field === localeObj.rne) {
                        this.setState({
                            rgDoc: false
                        });
                    }
                    return this.setState({
                        creationState: "tips",
                        direction: "left",
                        docType: field,
                        steps: this.state.steps + 1
                    });
                }
                break;
            case "tips":
                if (GeneralUtilities.isCAFEnabled()) {
                    this.uploadDocument(this.state.docType);
                } else {
                    this.checkCameraPermission();
                }
                break;
            default: break;
        }
    }

    uploadDocument = (type) => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        if (GeneralUtilities.isCAFEnabled()) {
            let docTypeForAPK = "";
            if (type === localeObj.cnh) {
                docTypeForAPK = 2;
            } else if (type === localeObj.rne) {
                docTypeForAPK = 3;
            } else {
                docTypeForAPK = 1;
            }
            ImportantDetails.setUploadDocType(type);
            this.checkCameraPermissionOpenSdk(docTypeForAPK);
        } else {
            this.showProgressDialog();
            ImportantDetails.setUploadDocType(this.state.docType);
            this.hideProgressDialog();
            this.props.history.replace({
                pathname: "/newDocUpload",
                state: { nextUrlPayload: this.state.nextUrlPayload },
            });
        }

    }

    checkCameraPermission = () => {
        if (androidApiCalls.checkSelfPermission(ACCESS_CAMERA_PERMISSION) === 0) {
            this.setState({
                creationState: "photo",
                direction: "left",
                steps: this.state.steps + 1
            })
        } else {
            androidApiCalls.requestPermission(ACCESS_CAMERA_PERMISSION);
        }
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }


    checkCameraPermissionOpenSdk = (type) => {
        MetricServices.onPageTransitionStart(PageNameJSON.caf);
        if (androidApiCalls.checkSelfPermission(ACCESS_CAMERA_PERMISSION) === 0) {
            caf_start_time = new Date().getTime();
            androidApiCalls.getDocDetectorSdk(type, ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
            setTimeout(() => {
                this.hideProgressDialog();
            }, 200);
        } else {
            androidApiCalls.requestPermission(ACCESS_CAMERA_PERMISSION);
        }
    }

    uploadFrontDoc = async (frontDoc) => {
        let frontImage = GeneralUtilities.emptyValueCheck(frontDoc) ? this.state.backImg : frontDoc;
        jsonObjectFront = {
            "url": frontImage,
            "extensao": 1
        }
        return new Promise((resolve, reject) => {
            arbiApiService.uploadFront(jsonObjectFront, true, PageNameJSON.caf)
                .then(response => {
                    Log.sDebug("FinalObj " + JSON.stringify(jsonObjectFront));
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processUploadFrontDocResponse(response.result);
                        if (processorResponse && processorResponse.success) {
                            resolve("Front Success");
                        } else {
                            this.hideProgressDialog();
                            this.openSnackBar(localeObj.error_front);
                            reject("Error");
                        }
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(localeObj.error_front);
                        reject("Error");
                    }
                }).catch(err => {
                    Log.sDebug("Error while uploading front doc " + JSON.stringify(err));
                    this.hideProgressDialog();
                    reject("Error");
                });
        })
    }

    uploadBackDoc = async (backDoc) => {
        let backImage = GeneralUtilities.emptyValueCheck(backDoc) ? this.state.backImg : backDoc;
        jsonObjectBack = {
            "url": backImage,
            "extensao": 1
        }

        return new Promise((resolve, reject) => {
            arbiApiService.uploadBack(jsonObjectBack, true, PageNameJSON.caf)
                .then(response => {
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processUploadBackDocResponse(response.result);
                        if (processorResponse && processorResponse.success) {
                            resolve("Back Success")
                        } else {
                            this.hideProgressDialog();
                            reject("Error");
                            this.openSnackBar(localeObj.error_back);
                        }
                    } else {
                        this.hideProgressDialog();
                        reject("Error");
                        this.openSnackBar(localeObj.error_back);
                    }
                }).catch(err => {
                    Log.sDebug("Error while uploading back doc " + JSON.stringify(err));
                    this.hideProgressDialog();
                    reject("Error");
                });
        })

    }

    onBack = () => {
        switch (this.state.creationState) {
            case "upload_file":
                return this.setState({
                    creationState: "doc",
                    direction: "right",
                    appBarState: localeObj.pix_identification
                });
            case "doc":
                return this.props.history.replace({ pathname : "/docInformation",
                    state: {
                        creationState : "address",
                        step: this.state.steps - 1,
                        address: this.state.address,
                        cepInfo: this.state.cepInfo,
                        salary: this.state.salary,
                        political: this.state.political,
                        appBarState: localeObj.personalInfo
                    }
                });
            case "tips":
                MetricServices.onPageTransitionStop(PageNameJSON.tips, PageState.back);
                return this.setState({
                    creationState: "doc",
                    direction: "right",
                    steps: this.state.steps - 1
                });
            case "photo":
                MetricServices.onPageTransitionStop(PageNameJSON.photo, PageState.back);
                return this.setState({
                    creationState: "tips",
                    direction: "right",
                    steps: this.state.steps - 1
                });
            default: break;
        }
    }

    onCancel = () => {
        this.setState({ open: true });
    }

    onSecondary = () => {
        switch (this.state.creationState) {
            case "doc":
                MetricServices.onPageTransitionStop(PageNameJSON.doc, PageState.cancel);
                break;
            case "tips":
                MetricServices.onPageTransitionStop(PageNameJSON.tips, PageState.cancel);
                break;
            case "photo":
                MetricServices.onPageTransitionStop(PageNameJSON.photo, PageState.cancel);
                break;
            default: break;
        }
        this.props.history.replace({ pathname: "/", transition: "right" });
        this.setState({ open: false })
    }

    onPrimary = () => {
        this.setState({ open: false });
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
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

    checkDocumentType = (field) => {
        if(field === localeObj.rg){
            this.setState({
                documentSelection: false,
                setFieldValue: field
            }, () => {
                this.openCamera();
            });
        } else {
            this.setState({
                documentSelection: true,
                setFieldValue: field
            });
        }
    }

    openCamera = () => {
        this.setState({
            documentSelection: false
        });
        this.setField(this.state.setFieldValue);
    }

    openDocumentUpload = () => {
        ImportantDetails.setUploadDocType(this.state.setFieldValue);
        this.setState({
            documentSelection: false,
            creationState: "upload_file",
            appBarState: localeObj.upload_file_header,
            steps: this.state.steps + 1
        });
    }

    openSelfiePage = () => {
        this.props.history.replace({
            pathname: "/validateIdCreation",
            state: {step: 13, nextUrlPayload: this.state.nextUrlPayload },
        });
    }

    render() {
        const { classes } = this.props;
        const creation = this.state.creationState;
        const steps = this.state.steps;
        return (
            <div style={{ overflowX: "hidden" }}>

                <ButtonAppBar header={this.state.appBarState} onBack={this.onBack} onCancel={this.onCancel} action="cancel" />
                <ProgressBar size={steps} />
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "doc" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "doc" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "doc" &&
                            <SelectMenuOption
                                type="Doc"
                                header={localeObj.doc_header}
                                recieveField={this.checkDocumentType}
                                value={this.state.docType}
                                componentName={PageNameJSON.doc} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "upload_file" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "upload_file" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "upload_file" &&
                            <UploadPDFDocumentComponent
                                type="upload_file"
                                header={localeObj.doc_header}
                                back={this.onBack}
                                openSelfiePage={this.openSelfiePage}
                                nextUrlPayload={this.state.nextUrlPayload}
                                recieveField={this.checkDocumentType}
                                value={this.state.docType}
                                componentName={PageNameJSON.upload_file} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "tips" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "tips" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "tips" &&
                            <InformationPage
                                header={localeObj.tips_header}
                                suggestion={localeObj.tips_suggestion}
                                subText={localeObj.tips_subtxt}
                                icon={this.state.rgDoc ? tipsRg : tipsCnh}
                                description={localeObj.tips_description}
                                btnText={localeObj.next}
                                next={this.setField}
                                appBar={false} type={PageNameJSON.tips} />
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "photo" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "photo" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "photo" &&
                            <InformationPage
                                header={this.state.docType === localeObj.rg
                                    ? localeObj.photo_header_rg
                                    : this.state.docType === localeObj.cnh
                                        ? localeObj.photo_header_cnh
                                        : localeObj.photo_header_rne}
                                appBar={false}
                                subText={this.state.rgDoc ? "" : localeObj.cnh_tip}
                                next={this.uploadDocument}
                                icon={this.state.rgDoc ? photoRg : photoCnh}
                                description={this.state.rgDoc ? localeObj.cam_description_rg : localeObj.cam_description_cnh}
                                btnText={localeObj.open_cam}
                                type={PageNameJSON.photo} />
                        }
                    </div>
                </CSSTransition>

                {this.state.cameraAlert &&
                    <AlertDialog
                        title={localeObj.allow_camera_title}
                        description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission}
                        neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <MuiThemeProvider theme={InputThemes.OperatorMenuTheme}>
                        <Drawer
                            classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.documentSelection}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                    <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.doc_drawer_bottom_sheet_header}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                        {localeObj.doc_drawer_bottom_sheet_footer}
                                    </div>
                                </FlexView>
                            </div>
                            <div onClick={this.openCamera} align="center" style={{ margin: "1rem 1.5rem", display: "flex", alignItems: 'center' }}>
                                <div>
                                    <CameraAltOutlinedIcon style={{ width: "1.5rem", height: "1.5rem", color: ColorPicker.accent }} />
                                </div>
                                <div align="center" className="subtitle6 highEmphasis" style={{ marginLeft: "1rem", width: "80%", textAlign: "left" }}>
                                    <span>{localeObj.doc_drawer_bottom_sheet_option_1}</span>
                                </div>
                                <span style={{ marginRight: "2%" }}>
                                    <ArrowForwardIosIcon style={{ color: ColorPicker.accent, width: "1.5rem", height: "1.5rem" }} />
                                </span>
                            </div>
                            <div onClick={this.openDocumentUpload} align="center" style={{ margin: "1rem 1.5rem", display: "flex", alignItems: 'center' }}>
                                <div>
                                    <FileUploadOutlinedIcon style={{ width: "1.5rem", height: "1.5rem", color: ColorPicker.accent }} />
                                </div>
                                <div align="center" className="subtitle6 highEmphasis" style={{ marginLeft: "1rem", width: "80%", textAlign: "left" }}>
                                    <span>{localeObj.doc_drawer_bottom_sheet_option_2}</span>
                                </div>
                                <span style={{ marginRight: "2%" }}>
                                    <ArrowForwardIosIcon style={{ color: ColorPicker.accent, width: "1.5rem", height: "1.5rem" }} />
                                </span>
                            </div>
                        </Drawer>
                    </MuiThemeProvider>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <MuiThemeProvider theme={InputThemes.OperatorMenuTheme}>
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
                            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
                                <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
                            </div>
                        </Drawer>
                    </MuiThemeProvider>
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

IdentityCreationComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(IdentityCreationComponent);
