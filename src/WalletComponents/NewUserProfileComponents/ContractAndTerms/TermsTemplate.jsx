import React from 'react';
import PropTypes from "prop-types";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import moment from "moment";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import Log from '../../../Services/Log';
import PageState from '../../../Services/PageState';
import constantObjects from "../../../Services/Constants";
import arbiApiService from "../../../Services/ArbiApiService";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import AlertDialog from '../../NewOnboardingComponents/AlertDialog';

import Card from '@material-ui/core/Card';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import InputThemes from "../../../Themes/inputThemes";
import PrivacyPortuguese2024 from '../../../PrivacyFiles/Privacy_pt_2024';
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import ColorPicker from '../../../Services/ColorPicker';

const theme1 = InputThemes.TermsTheme;
const theme2 = InputThemes.DownloadSnackbarTheme;
const theme4 = InputThemes.MuiAlertForReceiptComponent;
const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";
var localeObj = {};

class TermsTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            firstScroll: false,
            snackBarOpen: false,
            download_failed: false,
            finalDoc: false,
            snackBarDuration: constantObjects.SNACK_BAR_DURATION,
            numPages: this.props.type === "generic" ? 7 : 1,
            fileName: "",
            fileType : this.props.type
        }
        this.style = {
            terms: {
                align: "left",
                marginTop: "3%",
            },
        }

        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "DISPLAY TERMS PAGE"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        Log.sDebug("Fetching chosen terms", "Contract&TermsComponent");
        document.addEventListener("visibilitychange", this.visibilityChange);
        document.getElementById("Terms").innerHTML = this.props.terms;
        let links =  document.getElementsByTagName('a');
        for(let i=0 ; i< links.length; i++) {
            links.item(i).onclick=()=> androidApiCalls.openUrlInBrowser("https://www.bancoarbi.com.br");
        }
        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === WRITE_EXTERNAL_STORAGE) {
                if (status === false) {
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

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        } 
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    getDownloadedFileName = () => {
        let fileName = this.getFilename();
        let filename = androidApiCalls.getDownloadedFileName("Download", fileName);
        return filename
    }

    getFilename = () => {
        let fileName = "termos_de_uso_motorola_" + moment().format("DDMMYYYY") + ".pdf";
        return fileName;
    }


    handleOpen = () => {
        androidApiCalls.openReceipt(this.state.fileName);
        this.setState({ finalDoc: false })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    closeDownloadBar = () => {
        this.setState({ finalDoc: false })
    }

    saveAsPdf = (url) => {
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let fileName = this.getFilename();
            this.setState({
                fileName : this.getDownloadedFileName()
            })
            androidApiCalls.saveFile(url, "Download", fileName).then(result => {
                if (result) {
                    this.setState({
                        finalDoc: true,
                    });
                    Log.sDebug(this.props.header + " " + "Downloaded", "Contract&TermsComponent");
                    androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.state.fileName);
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater,
                        snackBarDuration: constantObjects.SNACK_BAR_DURATION,
                    })
                    androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed,  this.state.fileName);
                    Log.sDebug(this.props.header + " " + "Download Failed", "Contract&TermsComponent", constantObjects.LOG_PROD);
                }
            })
        } else {
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    handleDownload = () => {
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.processing,
                snackBarDuration: null
            });
            if (this.props.header === localeObj.Account_open) {
                arbiApiService.getSignedGenericTerms(this.componentName)
                    .then(response => {
                        if (response.success) {
                            let processedResponse = ArbiResponseHandler.processGetSignedGenericTermsResponse(response.result);
                            if (processedResponse.success) {
                                if (processedResponse.text === "" || processedResponse.text === undefined) {
                                    this.setState({
                                        snackBarOpen: true,
                                        message: localeObj.retry_later,
                                        snackBarDuration: constantObjects.SNACK_BAR_DURATION
                                    })
                                } else {
                                    this.saveAsPdf(processedResponse.text);
                                    this.setState({
                                        snackBarOpen: false
                                    })
                                }
                            } else {
                                this.setState({
                                    snackBarOpen: true,
                                    message: localeObj.retry_later,
                                    snackBarDuration: constantObjects.SNACK_BAR_DURATION
                                })
                            }
                        } else {
                            let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                            this.setState({
                                snackBarOpen: true,
                                message: errorMesaage,
                                snackBarDuration: constantObjects.SNACK_BAR_DURATION
                            })
                        }
                    })
            } else if (this.props.header === localeObj.tor) {
                arbiApiService.getSignedAddressTerms(this.componentName)
                    .then(response => {
                        if (response.success) {
                            let processedResponse = ArbiResponseHandler.processGetSignedAddressTermsResponse(response.result);
                            if (processedResponse.success) {
                                if (processedResponse.text === "" || processedResponse.text === undefined) {
                                    this.setState({
                                        snackBarOpen: true,
                                        message: localeObj.retry_later,
                                        snackBarDuration: constantObjects.SNACK_BAR_DURATION
                                    })
                                } else {
                                    this.saveAsPdf(processedResponse.text);
                                    this.setState({
                                        snackBarOpen: false
                                    })
                                }
                            } else {
                                this.setState({
                                    snackBarOpen: true,
                                    message: localeObj.retry_later,
                                    snackBarDuration: constantObjects.SNACK_BAR_DURATION
                                })
                            }
                        } else {
                            let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                            this.setState({
                                snackBarOpen: true,
                                message: errorMesaage,
                                snackBarDuration: constantObjects.SNACK_BAR_DURATION
                            })
                        }
                    })
            }

            return;
        } else {
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div style={{ overflowX: "hidden" }}>
                <div className="scroll" style={{ overflowY: "auto", height: this.props.type !== "privacy" ? `${screenHeight - 240}px` : `${screenHeight - 150}px`, overflowX: "hidden" }} >
                    <div style={InputThemes.initialMarginStyle}>
                        <MuiThemeProvider theme={theme1}>
                            <Card variant="outlined" style={{ marginTop: "2rem", background: "none" }}>
                                <div style={{ display: (this.props.type === "privacy" ? 'block' : 'none') }}>
                                    <div className="body2 mediumEmphasis">
                                        {localeObj.privacy_policy}
                                    </div>
                                    <div className="body2 mediumEmphasis">
                                        {androidApiCalls.getLocale() === "en_US" ? <PrivacyPortuguese2024 /> : <PrivacyPortuguese2024 />}
                                    </div>
                                </div>
                                <div style={{ width: "100%", display: (this.props.type !== "privacy" ? 'block' : 'none') }}>
                                    <div className="body2 mediumEmphasis">
                                        {this.props.header}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={this.style.terms} id={"Terms"}>
                                    </div>
                                </div>
                            </Card>
                        </MuiThemeProvider>
                    </div>
                    <MuiThemeProvider theme={theme4}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={this.state.snackBarDuration} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                    <div style={{ ...InputThemes.bottomButtonStyle, display: (this.props.type !== "privacy" ? 'block' : 'none'), textAlign: "center" }}>
                        <PrimaryButtonComponent btn_text={localeObj.terms_download} onCheck={this.handleDownload} />
                    </div>
                </div>
                {this.state.storagePermissionAlert &&
                    <AlertDialog  title ={localeObj.allow_storage_title} description = {localeObj.allow_storage} 
                    positiveBtn = {localeObj.grant_permission}  neagtiveBtn = {localeObj.deny_permission} 
                    handleClose= {this.closestoragePermissionAlertDialog}/>
                }
                <div id="outer" style={{ width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.finalDoc}>
                        <MuiThemeProvider theme={theme2}>
                            <AppBar position="static" color="transparent" elevation="0">
                                <Toolbar>
                                    <IconButton style={{color : ColorPicker.white}} disabled={true}>
                                        <DoneIcon />
                                    </IconButton>
                                    <span className="Caption highEmphasis">
                                        {localeObj.download_complete}
                                    </span>
                                    <span className="Caption accent" onClick={() => this.handleOpen()}>
                                        {localeObj.open}
                                    </span>
                                    <IconButton>
                                        <CancelIcon style={{color : ColorPicker.white}} onClick={() => this.closeDownloadBar()} />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </MuiThemeProvider>
                    </Drawer>
                </div>
            </div>
        );
    }
}

TermsTemplate.propTypes = {
    type: PropTypes.object,
    componentName: PropTypes.string,
    terms: PropTypes.string,
    header: PropTypes.string,
};

export default withStyles()(TermsTemplate)
