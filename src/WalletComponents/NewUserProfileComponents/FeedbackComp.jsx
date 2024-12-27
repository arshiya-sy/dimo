import React from "react";
import FlexView from "react-flexview";
import { CSSTransition } from 'react-transition-group';
import card from "../../images/SpotIllustrations/Checkmark.png";

import { Button, Snackbar, Fade, TextField, MuiThemeProvider, withStyles } from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';
import InputAdornment from "@material-ui/core/InputAdornment";
import "../../styles/main.css";

import AddIcon from '@material-ui/icons/Add';
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import CancelIcon from '@material-ui/icons/Cancel';

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import Globals from "../../Services/Config/config";
import apiService from "../../Services/apiService";
import MetricsService from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

import InputThemes from "../../Themes/inputThemes";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import constantObjects from "../../Services/Constants";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ColorPicker from "../../Services/ColorPicker";
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";
import LongList from "../CommonUxComponents/LongListComponent";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";
import PropTypes from "prop-types";

const TimeOutButton = ClickWithTimeout(Button, 1000);

const feedbackType = "digitalaccountfeedback";
const MAX_UPLOAD_LIMIT = 4;
const MAX_IMG_SIZE_LIMIT = 1024 * 1024 * 2; //2MB per image
const SOFT_INPUT_ADJUST_NOTHING = 48; //0x30
const SOFT_INPUT_ADJUST_RESIZE = 16; //0x10
const screenHeight = window.innerHeight;
const READ_EXT_STORAGE_PERMISSION = "android.permission.READ_EXTERNAL_STORAGE";
const READ_MEDIA_IMAGES_PERMISSION = "android.permission.READ_MEDIA_IMAGES";
const mime_type = ["png", "jpeg", "jpg", "JPG", "JPEG", "PNG"];

const styles = () => ({
    notchedOutline: {
        borderWidth: "1px",
        borderColor: ColorPicker.darkMediumEmphasis
    },
    input: {
        color: ColorPicker.darkHighEmphasis
    },
    finalInput: {
        fontSize: "1rem",
        color: ColorPicker.darkHighEmphasis,
    },
    underline: {
        borderBottom: '1px solid ' + ColorPicker.darkHighEmphasis,
    },
});

var localeObj = {};

class FeedComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feedbackText: "",
            feedbackSubmitted: false,
            category: "",
            images: {},
            convertedblobs: {},
            categoryList: {},
            showSnackBar: false,
            user: GeneralUtilities.emptyValueCheck(this.props.location.state.userDetails.name) ? ImportantDetails.userName : this.props.location.state.userDetails.name,
            email: GeneralUtilities.emptyValueCheck(this.props.location.state.userDetails.email) ? "" : this.props.location.state.userDetails.email,
            fieldOpen: false,
            count: 0
        };

        this.style = {
            screenshotDiv: {
                minHeight: '74px',
                margin: "0 1.5rem",
                display: 'inline-flex',
                flexWrap: 'wrap'
            },
            ssIconDiv: {
                display: 'grid',
                minWidth: '72px',
                minHeight: '72px',
                border: 'none',
                backgroundColor: ColorPicker.newProgressBar,
                borderRadius: '0.5rem'
            },
            imageDiv: {
                width: '74px',
                height: '74px',
                marginLeft: '4px',
                marginRight: '4px',
                position: 'relative'
            },
            cancelIcon: {
                position: 'absolute',
                right: '-2px',
                top: '-2px',
                fontSize: '1.2rem',
                fill: ColorPicker.accent,
            },
            image: {
                height: '72px',
                width: '72px',
                objectFit: 'cover'
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(PageNames.feedBackComponent);
        androidApiCalls.setSoftInputMode(SOFT_INPUT_ADJUST_NOTHING);
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    componentDidMount = () => {
        window.addEventListener("resize", this.checkIfInputIsActive);
        document.addEventListener("visibilitychange", this.visibilityChange);
        localeObj = localeService.getActionLocale();
        this.setState({
            title: GeneralUtilities.emptyValueCheck(this.state.user) ? localeObj.thank_user_new : GeneralUtilities.formattedString(localeObj.thank_user, [this.state.user])
        })
        window.onBackPressed = () => {
            this.onBack();
        }
        window.onAttachImageComplete = (response) => {
            let filename = Object.keys(response);
            let fileType;
            if (filename) {
                fileType = filename[0].split('.').pop();
            }
            if (response === "err_app_not_avail" || response === "err_img_fetch_failure" || !mime_type.includes(fileType)) {
                this.openSnackBar(localeObj.upload_valid_image);
            } else {
                if (Object.keys(response).length + Object.keys(this.state.images).length > MAX_UPLOAD_LIMIT) {
                    this.openSnackBar(localeObj.image_attach_maxlimit)
                } else {
                    this.updatePreview(response);
                }
            }
        }
        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === READ_EXT_STORAGE_PERMISSION || permission === READ_MEDIA_IMAGES_PERMISSION) {
                if (status === true) {
                    androidApiCalls.uploadImage();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            storagePermissionAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.allow_storage);
                    }
                }
            }
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(PageNames.feedBackComponent, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(PageNames.feedBackComponent);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.setSoftInputMode(SOFT_INPUT_ADJUST_RESIZE);
    }

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }

    handleChange = event => {
        let len = event.target.value.length;
        if (len <= 300) {
            this.setState({
                feedbackText: event.target.value,
                count: len
            });
        } else {
            this.openSnackBar(localeObj.comment_description);
        }
    };

    changeCategory = () => {
        this.setState({ openCategoryList: true });
    }

    handleSubmit = () => {
        let actionEvent = {
            eventType: constantObjects.submitFeedback,
            page_name: PageNames.feedBackComponent,
        };
        MetricsService.reportActionMetrics(actionEvent, new Date().getTime());
        var data = {};
        data.feedbackText = this.state.feedbackText;
        data.category = this.state.category;

        if (navigator.onLine) {
            this.showProgressDialog();
            let ts = new Date().getTime();
            if (Object.keys(this.state.images).length > 0) {
                this.uploadImages(ts);
                let fetchFromBucketURL = Globals.getStoragePath() + androidApiCalls.getDeviceId();
                let filenames = Object.keys(this.state.images);
                let imageURLS = [];
                for (let i = 0; i < filenames.length; i++) {
                    imageURLS.push(fetchFromBucketURL + '/' + ts + '_' + filenames[i]);
                }
                data.imageURLS = imageURLS.toString();
                this.submitFeedback(data);
            } else {
                this.submitFeedback(data);
            }
        } else {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
    };

    submitFeedback = (data) => {
        GeneralUtilities.submitFeedback(data, feedbackType).then(response => {
            if (response.status !== 200) {
                this.openSnackBar(this.state.tryAgainLater);
                Log.sError("Not able to submit feedback: " + JSON.stringify(data));
            } else {
                this.setState({ feedbackSubmitted: true });
            }
            this.hideProgressDialog();
        }).catch(() => {
            this.hideProgressDialog();
            this.openSnackBar(localeObj.tryAgainLater);
            Log.sError("Not able to submit feedback: " + JSON.stringify(data));
        });
    }

    updatePreview = (response) => {
        let mimeString = 'image/jpeg';
        let images = this.state.images;
        let convertedblobs = this.state.convertedblobs;
        let filenames = Object.keys(response);
        for (let i = 0; i < filenames.length; i++) {
            if (filenames[i] in images) {
                this.openSnackBar(localeObj.already_img);
                return;
            }
            let dataURI = response[filenames[i]];
            let byteString = atob(dataURI);
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let j = 0; j < byteString.length; j++) {
                ia[j] = byteString.charCodeAt(j);
            }
            let convertedblob = new Blob([ab], { type: mimeString });
            if (convertedblob.size > MAX_IMG_SIZE_LIMIT) {
                this.openSnackBar(localeObj.image_size_exceed);
            } else {
                images[filenames[i]] = response[filenames[i]];
                convertedblobs[filenames[i]] = convertedblob;
            }
        }

        this.setState({
            images: images,
            convertedblobs: convertedblobs
        });
    }

    addScreenshot = () => {
        if (!GeneralUtilities.isEngage()) {
            this.openSnackBar('Feature not supported for browser!!');
        }
        if (androidApiCalls.getSDKVersion() < 33) {
            if (androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) {
                androidApiCalls.uploadImage();
            } else {
                androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
            }
        } else {
            if ((androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) || (androidApiCalls.checkSelfPermission(READ_MEDIA_IMAGES_PERMISSION) === 0)) {
                androidApiCalls.uploadImage();
            } else {
                androidApiCalls.requestPermission(READ_MEDIA_IMAGES_PERMISSION);
            }
        }
    }

    handleSnackbar = () => {
        if (androidApiCalls.checkIfMpOnly()) {
            androidApiCalls.openApp('package:com.motorola.dimo#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end;');
        } else {
            androidApiCalls.openApp('package:com.motorola.ccc.notification#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end;');
        }
        this.setState({
            showSnackBar: false
        })
    };

    hideSnackBar = () => {
        this.setState({
            showSnackBar: false
        })
    }

    uploadImages = (ts) => {
        let filenames = Object.keys(this.state.images);
        for (let i = 0; i < filenames.length; i++) {
            let fileName = filenames[i] ? filenames[i].replace(",", "") : filenames[i];
            let finalFilename = ts + '_' + fileName;
            let uploadURL = Globals.getSaveToEngBucketPath() + androidApiCalls.getDeviceId() + '/' + finalFilename;
            let fd = new FormData();
            fd.append('feedback', this.state.convertedblobs[filenames[i]]);
            let locale = localeObj;
            apiService.uploadImage(uploadURL, fd).then(() => {
                Log.info(finalFilename + ' uploaded successfully.');
            }).catch(err => {
                Log.debug(finalFilename + ' upload failed with error => ' + err + '. Retrying once');
                apiService.uploadImage(uploadURL, fd).then(() => {
                    Log.debug(finalFilename + 'uploaded successfully after retry.');
                }).catch(err => {
                    this.openSnackBar(locale.image_upload_failed);
                    Log.debug(' upload failed for ' + finalFilename + ' ' + err);
                })
            })
        }
    }

    removeScreenshot = imageToRemove => {
        let images = this.state.images;
        let convertedblobs = this.state.convertedblobs;
        delete images[imageToRemove];
        delete convertedblobs[imageToRemove];
        this.setState({
            images: images,
            convertedblobs: convertedblobs
        })
    }

    handleIAgree = () => {
        this.setState({
            checked: !this.state.checked
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    onBack = () => {

        if (this.state.processing) {
            this.openSnackBar(localeObj.no_action);
        } else if (this.state.openCategoryList) {
            this.setState({ openCategoryList: false });
        } else {
            MetricsService.onPageTransitionStop(PageNames.feedBackComponent, PageState.back);
            if (GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }
    }

    next = () => {
        let userJSON = {
            "name": this.state.user,
            "email": this.state.email
        }
        MetricsService.onPageTransitionStop(PageNames.feedBackComponent, PageState.close);
        this.props.history.replace("/feedback", { "userDetails": userJSON });
    }

    confirm = (option) => {
        this.setState({
            category: option,
            openCategoryList: false
        })
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        let showImageUpload = androidApiCalls.isImageAttacherAvailable();
        let enableButton = false;

        if (this.state.feedbackText && this.state.category !== "") {
            if (this.state.feedbackText.trim().length > 0) {
                enableButton = true;
            } else {
                enableButton = false;
            }
        }
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: !this.state.feedbackSubmitted ? 'block' : 'none' }}>
                    <ButtonAppBar header={localeObj.feedback} onBack={this.onBack} action="none" />
                    {!this.state.processing && !this.state.openCategoryList &&
                        <div className="scroll" style={{ height: `${screenHeight * 0.63}px`, overflowY: "auto", overflowX: "hidden" }}>
                            <FlexView className='feedFormInner' column style={{ position: 'relative' }}>
                                <div style={InputThemes.initialMarginStyle}>
                                    <FlexView column>
                                        <div className="headline5 highEmphasis">
                                            <span>{localeObj.feedback_header}</span>
                                        </div>
                                    </FlexView>
                                </div>

                                <MuiThemeProvider theme={InputThemes.CategoryInputTheme} style={{ marginTop: "1.5rem" }}>
                                    <TextField value={this.state.category}
                                        label={this.state.category === "" ? localeObj.category : ""}
                                        onClick={this.changeCategory}
                                        InputLabelProps={{ className: classes.finalInput }}
                                        InputProps={{
                                            className: classes.finalInput,
                                            endAdornment: (
                                                <InputAdornment position="start">
                                                    <ArrowIcon style={{ fill: ColorPicker.accent, fontSize: "1rem" }} />
                                                </InputAdornment>
                                            )
                                        }} />
                                </MuiThemeProvider>
                                <div className="subtitle2 highEmphasis" style={{ margin: "0.5rem 1.5rem", marginTop: "2.5rem" }}>
                                    <span>{localeObj.comments}</span>
                                </div>
                                <MuiThemeProvider theme={InputThemes.feedbackTheme}>
                                    <TextField className='feedTextfield2' variant="outlined"
                                        value={this.state.feedbackText}
                                        placeholder={localeObj.feedback_text_placeholder}
                                        onChange={this.handleChange} multiline rows={3}
                                        InputProps={{
                                            classes: {
                                                notchedOutline: classes.notchedOutline
                                            },
                                            className: classes.input
                                        }} />
                                    <div className="body2 mediumEmphasis" style={{ margin: "0.25rem 1.5rem", marginLeft: "auto" }}>
                                        <span>{this.state.count}/300</span>
                                    </div>
                                    {showImageUpload &&
                                        <div>
                                            <div style={{ margin: "0 1.5rem", marginBottom: "0.25rem" }}>
                                                <span className="tableRightStyle highEmphasis" >{localeObj.add_screenshots}</span>
                                                <span className='caption mediumEmphasis'> {" - " + localeObj.pix_optional}</span>
                                            </div>
                                            {Object.keys(this.state.images).length === MAX_UPLOAD_LIMIT &&
                                                <div className='caption errorRed' style={{ margin: "0.25rem 1.5rem" }}>{localeObj.image_attach_limit}</div>
                                            }
                                            <div id="preview" style={this.style.screenshotDiv}>
                                                {Object.keys(this.state.images).map((image, key) => {
                                                    let imageurl = 'data:image/jpeg;base64, ' + this.state.images[image]
                                                    return (
                                                        <div key={key} style={this.style.imageDiv}>
                                                            <img style={this.style.image} src={imageurl} alt=""/>
                                                            <CancelIcon style={this.style.cancelIcon} onClick={() => this.removeScreenshot(image)} />
                                                        </div>)
                                                })}
                                                {Object.keys(this.state.images).length < MAX_UPLOAD_LIMIT &&
                                                    <div style={this.style.ssIconDiv} onClick={this.addScreenshot}>
                                                        <div style={{ margin: "auto 0" }}>
                                                            <AddIcon style={{ fill: ColorPicker.accent, fontSize: "1.25rem", marginLeft: "1.6rem" }} />
                                                            <div className='caption highEmphasis' style={{
                                                                display: "table-caption", textAlign: "center",
                                                                marginLeft: androidApiCalls.getLocale() === "en_US" ? "1.1rem" : "0.75rem"
                                                            }}>{localeObj.add_img}</div>
                                                        </div>
                                                    </div>}
                                            </div>
                                        </div>
                                    }
                                </MuiThemeProvider>
                                {!this.state.fieldOpen &&
                                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                                        <div className="body2 highEmphasis" style={{ textAlign: "center", position: "relative", bottom: "2.18rem", margin: "1rem" }}>
                                            {localeObj.feedback_terms}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "center", position: "fixed", bottom: "4.063rem", margin: "1rem" }}>
                                            {localeObj.feedback_terms_desc}
                                            <a href="https://api.whatsapp.com/send?phone=551151980000&text=Hello" style={{ color: ColorPicker.white }}>+55 11 5198-0000</a>
                                        </div>
                                        <PrimaryButtonComponent btn_text={localeObj.submit} onCheck={this.handleSubmit} disabled={!enableButton} />
                                    </div>}
                            </FlexView>
                        </div>
                    }
                    <div style={{ display: this.state.openCategoryList ? 'block' : 'none' }}>
                        {this.state.openCategoryList && <LongList type="category" header={localeObj.category + " :"} confirm={this.confirm} />}
                    </div>
                    <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                        {this.state.processing && <CustomizedProgressBars />}
                    </div>
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.feedbackSubmitted ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.feedbackSubmitted && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.feedbackSubmitted &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={this.state.title} onCancel={this.onBack} icon={card}
                                    footer={localeObj.forgot_close} onAction={this.onBack} appBar={true} next={this.next}
                                    description={localeObj.feedback_description} btnText={localeObj.add_new} />
                            </div>}
                    </div>
                </CSSTransition>
                {this.state.storagePermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closestoragePermissionAlertDialog} />
                }
                <Snackbar
                    style={{ bottom: "0px" }}
                    open={this.state.showSnackBar}
                    anchorOrigin={this.style.anchor}
                    autoHideDuration={5000}
                    TransitionComponent={Fade}
                    onClose={this.hideSnackBar}
                    className='feedSnackbar'
                    message={
                        <span id="snackbar-fab-message-id"
                            style={this.style.snackbarText}
                        >{localeObj.enable_permission}</span>
                    }
                    action={
                        (<TimeOutButton color="secondary" size="small" onClick={() => this.handleSnackbar()}>
                            {localeObj.settings}
                        </TimeOutButton>)} />
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
FeedComp.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(FeedComp);
