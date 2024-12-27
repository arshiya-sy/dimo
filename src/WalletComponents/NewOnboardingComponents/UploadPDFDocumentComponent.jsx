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

import ActionButtonComponent from "../CommonUxComponents/ActionButton";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import AlertDialog from "./AlertDialog";

import FlexView from "react-flexview";
import PropTypes from "prop-types";
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ColorPicker from "../../Services/ColorPicker";

const theme1 = InputThemes.OperatorMenuTheme;
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const MAX_IMG_SIZE_LIMIT = 1024 * 1024 * 3;
const READ_EXT_STORAGE_PERMISSION = "android.permission.READ_EXTERNAL_STORAGE";
const READ_MEDIA_IMAGES_PERMISSION = "android.permission.READ_MEDIA_IMAGES";
const mime_type = ["application/pdf"];

const PageNameJSON = PageNames.doumentUpload;
var localeObj = {};


class UploadPDFDocumentComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appBarState: "Identification",
            steps: 8,
            fileUploaded: false,
            filename: "",
            image: "",
            convertedblobs: "",
            storagePermissionAlert: false,
            nextUrlPayload: this.props.nextUrlPayload ? this.props.nextUrlPayload : {},
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNameJSON.pdf);
        this.componentName = PageNameJSON.pdf;
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.setState({
            appBarState: localeObj.pix_identification
        })

        if (ImportantDetails.uploadDocType === constantObjects.DOC_TYPE.RG) {
            this.setState({
                rgDoc: true
            })
        }

        window.onAttachImageComplete = (response) => {

            if (response === "err_app_not_avail" || response === "err_img_fetch_failure") {
                this.openSnackBar(localeObj.upload_valid_image);
            } else {
                this.updatePreview(response);
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === READ_EXT_STORAGE_PERMISSION || permission === READ_MEDIA_IMAGES_PERMISSION) {
                if (status === true) {
                    androidApiCalls.uploadImage();
                } else {
                    this.setState({
                        storagePermissionAlert: true
                    })
                }
            }
        }

    }

    visibilityChange = (e) => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    fetchPDF = () => {
        if ((androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) ||
            (androidApiCalls.getSDKVersion() >= 33 && androidApiCalls.checkSelfPermission(READ_MEDIA_IMAGES_PERMISSION) === 0)) {
            androidApiCalls.uploadImageChatBot(mime_type);
        } else {
            androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
            if (!androidApiCalls.shouldShowRequestPermissionRationale(READ_EXT_STORAGE_PERMISSION)) {
                this.setState({
                    snackBarOpen: true,
                    snackBarMessage: localeObj.allow_storage
                });
            }
        }
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    uploadPDFFile = () => {
        if (!GeneralUtilities.isEngage()) {
            this.openSnackBar('Feature not supported for browser!!');
        }
        if (androidApiCalls.getSDKVersion() < 33) {
            if (androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) {
                androidApiCalls.uploadImageChatBot(mime_type);
            } else {
                androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
            }
        } else { // Above android 12 it will come to this block
            if ((androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) ||
                (androidApiCalls.checkSelfPermission(READ_MEDIA_IMAGES_PERMISSION) === 0)) {
                androidApiCalls.uploadImageChatBot(mime_type);
            } else {
                androidApiCalls.requestPermission(READ_MEDIA_IMAGES_PERMISSION);
            }
        }
    }

    updatePreview = (response) => {
        let filenames = Object.keys(response);
        let filename = filenames[0];
        let fileExtension = filename.split('.').pop();
        let mimeString = '';
        if (fileExtension === 'pdf') {
            mimeString = 'application/pdf';
        } else {
            this.openSnackBar(localeObj.invalid_file);
            return;
        }

        let image = this.state.image;
        let convertedblobs = this.state.convertedblobs;

        let dataURI = response[filename];
        let byteString = atob(dataURI);
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let j = 0; j < byteString.length; j++) {
            ia[j] = byteString.charCodeAt(j);
        }

        let convertedblob = new Blob([ab], { type: mimeString });
        let fileSizeinMB = parseFloat(convertedblob.size / (1024 * 1024)).toFixed(2);
        if (convertedblob.size > MAX_IMG_SIZE_LIMIT) {
            setTimeout(() => {
                this.openSnackBar(localeObj.upload_pdf_size_exceed);
            }, 500);
        } else {
            image = response[filename];
            convertedblobs = convertedblob;
            this.setState({
                image: image,
                convertedblobs: convertedblob,
                fileSizeinMB: fileSizeinMB,
                filename: filename,
                fileUploaded: true
            });
        }
    }

    removeFile = () => {
        this.setState({
            image: "",
            convertedblobs: 0,
            fileSizeinMB: 0,
            filename: "",
            fileUploaded: false
        });
    }

    cancelFileUpload = () => {
        MetricServices.onPageTransitionStop(PageNameJSON.pdf, PageState.back)
        this.props.back();
    }

    onSelectOption = (option) => {
        switch (option) {
            case "Select_file":
                this.uploadPDFFile();
                break;
            case "Replace_file":
                this.removeFile();
                this.uploadPDFFile();
                break;
            default:
                this.cancelFileUpload();
                break;
        }
    }

    openGovWebsite = () => {
        androidApiCalls.openUrlInBrowser("https://www.gov.br/governodigital/pt-br/identidade/carteira-de-documentos-digitais");
    }

    uploadFrontDoc = async () => {
        let jsonObjectFront = {
            "base64": this.state.image,
            "extensao": 1
        }
        return new Promise((resolve, reject) => {
            arbiApiService.uploadFront(jsonObjectFront, false, PageNameJSON.pdf)
                .then(response => {
                    if (response && response.success) {
                        let processorResponse = ArbiResponseHandler.processUploadFrontDocResponse(response.result);
                        if (processorResponse && processorResponse.success) {
                            resolve("Front Success");
                        } else {
                            reject(processorResponse);
                        }
                    } else {
                        reject(response);
                    }
                }).catch(err => {
                    if (err.response) {
                        reject("Error");
                    }
                });
        })
    }

    uploadBackDoc = async () => {
        let jsonObjectBack = {
            "base64": this.state.image,
            "extensao": 1
        }

        return new Promise((resolve, reject) => {
            arbiApiService.uploadBack(jsonObjectBack, false, PageNameJSON.pdf)
                .then(response => {
                    if (response && response.success) {
                        let processorResponse = ArbiResponseHandler.processUploadBackDocResponse(response.result);
                        if (processorResponse && processorResponse.success) {

                            resolve("Back Success")
                        } else {
                            reject(processorResponse);
                        }
                    } else {
                        reject(response);
                    }
                }).catch(err => {
                    if (err.response) {
                        reject("Error");
                    }
                });
        })

    }

    uploadDocToJAZZ = async () => {
        try {
            this.showProgressDialog();
            await Promise.all([await this.uploadFrontDoc(), await this.uploadBackDoc()])
                .then(values => {
                    this.hideProgressDialog();
                    MetricServices.onPageTransitionStop(PageNameJSON.pdf, PageState.close)
                    this.props.openSelfiePage();
                }).catch(err => {
                    Log.sDebug("Doc detector SDK Failure Jazz PDF upload failue", constantObjects.LOG_DEV);
                    this.hideProgressDialog();
                    if (err && err.result && err.result.message) {
                        this.openSnackBar(err.result.message);
                    } else {
                        this.openSnackBar(localeObj.retry_later);
                    }
                })
        } catch (err) {
            Log.sDebug("Doc detector SDK Failure Jazz PDF upload exception", constantObjects.LOG_DEV);
            this.hideProgressDialog();
            if (err && err.result && err.result.message) {
                this.openSnackBar(err.result.message);
            } else {
                this.openSnackBar(localeObj.retry_later);
            }

        }
    }

    render() {
        const { classes } = this.props;
        const creation = this.state.creationState;
        const steps = this.state.steps;
        return (
            <div style={{ overflowX: "hidden" }}>
                <MuiThemeProvider theme={theme1}>
                    <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                        <div style={{ margin: "4rem 1.5rem 1.5rem 1.5rem" }}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.upload_documents}
                                </div>
                                <div className="body2" style={{ textAlign: "left", marginTop: "1.5rem" }}>
                                    <span className="highEmphasis">{localeObj.upload_documents_footer_1}</span>
                                    <span className="accent" onClick={this.openGovWebsite}>{localeObj.upload_documents_footer_2}</span>
                                    <span className="highEmphasis">{localeObj.upload_documents_footer_3}</span>
                                </div>
                            </FlexView>
                        </div>
                        {!this.state.fileUploaded &&
                            <div align="center" style={{ marginTop: "1rem" }}>
                                <ActionButtonComponent
                                    btn_text={localeObj.select_file}
                                    icon={<FileUploadIcon style={{ color: ColorPicker.white, width: "1rem", height: "1rem" }} />}
                                    onCheck={() => this.onSelectOption("Select_file")}
                                />
                            </div>}
                        {this.state.fileUploaded &&
                            <div style={{ marginLeft: "1.5rem", marginRight: "1.5rem" }}>
                                <div align="center" style={{ marginTop: "1rem" }}>
                                    <ActionButtonComponent
                                        btn_text={localeObj.replace_file}
                                        icon={<FileUploadIcon style={{ color: ColorPicker.white, width: "1rem", height: "1rem" }} />}
                                        onCheck={() => this.onSelectOption("Replace_file")}
                                    />
                                </div>
                                <div align="left" style={{ marginTop: "1rem" }}>
                                    <span className="body2 highEmphasis">
                                        {localeObj.uploaded_files}
                                    </span>
                                    <div style={{ marginTop: "1.5rem" }}>
                                        <MuiThemeProvider theme={InputThemes.CardTheme}>
                                            <Paper
                                                row
                                                className={classes.root}
                                                elevation="0"
                                                style={{ width: "90%", height: "4.5rem", backgroundColor: ColorPicker.newProgressBar }}>
                                                <FlexView column style={{ width: "90%", marginLeft: "1rem" }}>
                                                    <div className="body2 highEmphasis">
                                                        <span>{this.state.filename}</span>
                                                    </div>
                                                    <div className="body2 mediumEmphasis" style={{ marginTop: "0.25rem" }}>
                                                        <span>{this.state.fileSizeinMB}{"mb"}</span>
                                                    </div>
                                                </FlexView>
                                                <div onClick={this.removeFile} style={{ display: 'flex', justifyContent: "flex-end", width: "10%" }}>
                                                    <CloseIcon style={{ fill: ColorPicker.errorRed, width: "1.5rem", paddingLeft: "4.688rem" }} />
                                                </div>
                                            </Paper>
                                        </MuiThemeProvider>
                                    </div>
                                </div>
                            </div>}
                        <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.send} disabled={!this.state.fileUploaded} onCheck={this.uploadDocToJAZZ} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.cancelFileUpload} />
                        </div>
                        {this.state.storagePermissionAlert &&
                            <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                                positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                                handleClose={this.closestoragePermissionAlertDialog} />
                        }
                    </div>
                    <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                        {this.state.processing && <CustomizedProgressBars />}
                    </div>
                </MuiThemeProvider>

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
                        <div align="center" style={{ width: "100%", marginBottom: "1.5rem" }}>
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

UploadPDFDocumentComponent.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UploadPDFDocumentComponent);
