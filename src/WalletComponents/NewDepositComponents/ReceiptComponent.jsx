import React from "react";
import "../../styles/main.css";
import FlexView from "react-flexview";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import moment from "moment";

import PageState from "../../Services/PageState";
import MetricsService from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import { Card } from "@material-ui/core";
import GetAppIcon from '@material-ui/icons/GetApp';
import ShareIcon from '@material-ui/icons/Share';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ClickWithTimeout from '../EngageCardComponent/ClickWithTimeOut';
import constantObjects from "../../Services/Constants";
import AndroidActionButton from "../CommonUxComponents/AndroidActionButton";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";
import PropTypes from "prop-types";

const styles = {
    paper: {
        borderTopLeftRadius: "1.25rem",
        borderTopRightRadius: "1.25rem",
        backgroundColor: ColorPicker.newProgressBar
    }
}

const theme2 = InputThemes.DownloadSnackbarTheme;
const theme3 = InputThemes.MuiAlertForReceiptComponent;
const TimeOutActionButton = ClickWithTimeout(AndroidActionButton);
const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";
var localeObj = {};

class RecieptComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pinExpiredSnackBarOpen: false,
            snackBarDuration: constantObjects.SNACK_BAR_DURATION,
            dlsnackBarOpen: false,
            fileName: "",
            pdfDocInfo: this.props.info.doc
        };
        this.style = {
            textStyle: {
                margin: "1.5rem"
            },
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                backgroundColor: ColorPicker.newProgressBar,
            },
            itemStyle: {
                display: "flex",
                justifyContent: "space-between",
                margin: "5% 0"
            }
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "BOLETO GENERATION RECEIPT"
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        if (this.props.info.status) {
            if (this.props.info.status === localeObj.boleto_payment) {
                this.setState({ statusVerified: true })
            }
        } else {
            this.setState({ statusVerified: true })
        }

        if (!this.props.info.status) {
            this.setState({ boletoInfo: true })
        }

        window.onContentShared = () => {
            ImportantDetails.shareEnabled = true;
        }

        window.onPauseCamera = () => {
            ImportantDetails.shareEnabled = false;
        }
        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === WRITE_EXTERNAL_STORAGE) {
                if (status === false) {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            storagePermissionAlert: true
                        })
                    } else {
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.allow_storage,
                            snackBarDuration: constantObjects.SNACK_BAR_DURATION
                        })
                    }  
                    
                } 
            }
        }
        window.onBackPressed = () => {
            this.back()
        }
        
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    share = () => {
        this.shareOrdownloadBoletoPDF("share");
        //Log.sDebug("User clicked Boleto QrCode Share", "RecieptComponent");
        return;
    }

    download = () => {
        this.shareOrdownloadBoletoPDF("download");
        //Log.sDebug("User clicked Boleto QrCode download", "RecieptComponent");
        return;
    }

    copyToClipboard = () => {
        androidApiCalls.copyToClipBoard(this.props.info.number);
        this.setState({
            pinExpiredSnackBarOpen: true,
            message: localeObj.copied_in_clipboard,
            snackBarDuration: constantObjects.SNACK_BAR_DURATION
        })
    }

    shareOrdownloadBoletoPDF = (action) => {
        if (this.state.pdfDocInfo === "" || this.state.pdfDocInfo === undefined) {
            // Boleto PDF for generated old boleto from transaction history
            this.setState({
                pinExpiredSnackBarOpen: true,
                message: localeObj.processing,
                snackBarDuration: null
            })
            arbiApiService.getBoletoPDF(this.props.info.boletoId, this.componentName)
                .then(response => {
                    if (response.success) {
                        let processedResponse = ArbiResponseHandler.processCreateBoletoResponse(response.result);
                        if (processedResponse.success) {
                            if (processedResponse.doc === "" || processedResponse.doc === undefined) {
                                this.setState({
                                    pinExpiredSnackBarOpen: true,
                                    message: localeObj.retry_later,
                                    snackBarDuration: constantObjects.SNACK_BAR_DURATION
                                })
                            } else {
                                if (action === "download") {
                                    this.downloadPDFBoletoQR(processedResponse.doc)
                                } else {
                                    let name = "boleto_deposito_" + moment().format("DDMMYYYY");
                                    androidApiCalls.sharePdfFile(processedResponse.doc, name);
                                }
                                this.setState({
                                    pdfDocInfo: processedResponse.doc,
                                    pinExpiredSnackBarOpen: false
                                })
                            }
                        } else {
                            this.setState({
                                pinExpiredSnackBarOpen: true,
                                message: localeObj.retry_later,
                                snackBarDuration: constantObjects.SNACK_BAR_DURATION
                            })
                        }
                    } else {
                        let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: errorMesaage,
                            snackBarDuration: constantObjects.SNACK_BAR_DURATION
                        })
                    }
                })
        } else {
            // Boleto PDF for Boleto generation from deposit
            if (action === "download") {
                this.downloadPDFBoletoQR(this.state.pdfDocInfo)
            } else {
                let name = "boleto_deposito_" + moment().format("DDMMYYYY");
                androidApiCalls.sharePdfFile(this.state.pdfDocInfo, name);
            }
        }
    }

    downloadPDFBoletoQR = (pdfDoc) => {
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let fileName = this.getFilename();
            this.setState({
                fileName: this.getDownloadedFileName()
            })
            androidApiCalls.saveFile(pdfDoc, "Download", fileName).then(result => {
                if (result) {
                    androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.state.fileName);
                    this.setState({
                        dlsnackBarOpen: true
                    });
                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.tryAgainLater,
                        snackBarDuration: constantObjects.SNACK_BAR_DURATION,
                    })
                    androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.state.fileName);
                }
            })
        } else {
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    handleOpen = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        androidApiCalls.openReceipt(this.state.fileName);
        this.setState({ dlsnackBarOpen: false })
    }

    getFilename = () => {
        let name = "boleto_deposito_" + moment().format("DDMMYYYY") + ".pdf";
        return name;
    }

    getDownloadedFileName = () => {
        let fileName = this.getFilename();
        let filename = androidApiCalls.getDownloadedFileName("Download", fileName);
        return filename;
    }

    cancelBoleto = () => {
        this.showProgressDialog();
        arbiApiService.cancelBoleto(this.props.info.slipNumber, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processCancelBoletoApi(response.result);
                if (processedResponse.success) {
                    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.cancelBoleto();
                }
            } else {
                MetricsService.onPageTransitionStop(this.componentName, PageState.error);
                this.props.failure(response.result.message);
            }
        }).catch(err => {
            MetricsService.onPageTransitionStop(this.componentName, PageState.error);
            this.props.failure(err.error.message);
        });
    }

    back = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.complete();
    }

    cancel = () => {
        this.setState({ open: true })
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
        this.setState({ dlsnackBarOpen: false })
        this.setState({ snackBarDuration: constantObjects.SNACK_BAR_DURATION })
    }

    onSecondary = () => {
        this.setState({ open: false })
    }

    onPrimary = () => {
        this.setState({ open: false })
        this.cancelBoleto();
    }

    gotIt = () => {
        this.setState({ boletoInfo: false })
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
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        const BoletoMessage = () => {
            let message = localeObj.success_message + ". ";
            if (this.props.showMin) {
                message = localeObj.payment_after_few_minutes + ". " + localeObj.success_message;
            }
            return message;
        }

        return (
            <div className="scroll" style={{ height: `${screenHeight - 280}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.boleto_created}
                            </div>
                            <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {localeObj.boleto_created_desc}
                            </div>
                        </FlexView>
                    </div>
                    <div style={InputThemes.initialMarginStyle}  >
                        <Card align="center" style={this.style.cardStyle} elevation="0">
                            <ListItem>
                                <ListItemText>
                                    <div style={this.style.itemStyle}>
                                        <span className="body2 mediumEmphasis">{localeObj.value}</span>
                                        <span className="subtitle4 highEmphasis">{"R$ "}{this.props.info.value}</span>
                                    </div>
                                    {this.props.info.status !== localeObj.expired &&
                                        <div style={this.style.itemStyle}>
                                            <span className="body2 mediumEmphasis">{localeObj.due_date}</span>
                                            <span className="subtitle4 highEmphasis">{this.props.info.expiryDate}</span>
                                        </div>
                                    }
                                    {this.props.info.status === localeObj.expired &&
                                        <div style={this.style.itemStyle}>
                                            <span className="body2 errorRed">{localeObj.expired_on}</span>
                                            <span className="subtitle4 errorRed">{this.props.info.expiryDate}</span>
                                        </div>
                                    }
                                    <div style={{ margin: "1rem", textAlign: "center" }}>
                                        <span className="caption highEmphasis" >{BoletoMessage()}</span>
                                    </div>
                                    <div style={{ margin: "1rem 2rem", textAlign: "center" }}>
                                        <span className="subtitle4 highEmphasis" style={{ wordWrap: "break-word" }}>{this.props.info.number}</span>
                                    </div>
                                </ListItemText>
                            </ListItem>
                        </Card>
                    </div>
                    <FlexView style={{ justifyContent: "space-between", margin: "2rem" }}>
                        <TimeOutActionButton
                            btn_text={localeObj.share}
                            onCheck={this.share}
                            icon={<ShareIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />

                        <AndroidActionButton
                            btn_text={localeObj.download}
                            onCheck={this.download}
                            icon={<GetAppIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                    </FlexView>
                    {this.state.statusVerified &&
                        <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                            <PrimaryButtonComponent btn_text={localeObj.copy_code} onCheck={this.copyToClipboard} />
                            {!this.props.info.status && <SecondaryButtonComponent btn_text={localeObj.back_home} onCheck={this.back} />}
                            {this.props.info.status === localeObj.boleto_payment && <SecondaryButtonComponent btn_text={localeObj.cancel_boleto} onCheck={this.cancel} />}
                        </FlexView>
                    }
                </div>

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>

                <MuiThemeProvider theme={theme3}>
                    <Snackbar open={this.state.pinExpiredSnackBarOpen} autoHideDuration={this.state.snackBarDuration} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                {this.state.storagePermissionAlert &&
                    <AlertDialog  title ={localeObj.allow_storage_title} description = {localeObj.allow_storage} 
                    positiveBtn = {localeObj.grant_permission}  neagtiveBtn = {localeObj.deny_permission} 
                    handleClose= {this.closestoragePermissionAlertDialog}/>
                }
                <div id="outer" style={{ width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.dlsnackBarOpen}>
                        <MuiThemeProvider theme={theme2}>
                            <AppBar position="static" color="transparent" elevation="0">
                                <Toolbar>
                                    <IconButton color="inherit" disabled={true}>
                                        <DoneIcon style={{ fill: ColorPicker.darkHighEmphasis }} />
                                    </IconButton>
                                    <span className="body1 highEmphasis">
                                        {localeObj.download_complete}
                                    </span>
                                    <span className="body1 accent" onClick={() => this.handleOpen()}>
                                        {localeObj.open}
                                    </span>
                                    <IconButton color="inherit">
                                        <CancelIcon style={{ fill: ColorPicker.darkHighEmphasis }} onClick={this.closeSnackBar} />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </MuiThemeProvider>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.cancel_boleto_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem", fontWeight: 400 }}>
                                    {localeObj.cancel_boleto_description}
                                </div>
                            </FlexView>
                        </div>
                        <FlexView column hAlignContent="center" style={{ width: "100%", marginBottom: "1.5rem" }}>
                            <PrimaryButtonComponent btn_text={localeObj.cancel_boleto} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.not_now} onCheck={this.onSecondary} />
                        </FlexView>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.boletoInfo}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.find_boleto}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.boleto_filter}
                                </div>
                            </FlexView>
                        </div>
                        <FlexView hAlignContent="center" style={{ width: "100%", marginBottom: "1.5rem" }}>
                            <PrimaryButtonComponent btn_text={localeObj.got_it} onCheck={this.gotIt} />
                        </FlexView>
                    </Drawer>
                </div>
            </div >
        )
    }
}

RecieptComponent.propTypes = {
    info: PropTypes.object,
    history: PropTypes.object,
    componentName: PropTypes.string,
    classes: PropTypes.object,
    cancelBoleto: PropTypes.func,
    failure: PropTypes.func,
    complete: PropTypes.func,
    showMin: PropTypes.bool,
}

export default withStyles(styles)(RecieptComponent);
