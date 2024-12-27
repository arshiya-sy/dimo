import React from 'react';
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import Drawer from '@material-ui/core/Drawer';
import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import moment from "moment";
import * as html2canvas from 'html2canvas';

import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import constantObjects from "../../Services/Constants";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';

import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';
import ActionButtonComponent from "../CommonUxComponents/ActionButton";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ButtonAppBar from '../CommonUxComponents/ButtonAppBarComponent';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import GetAppIcon from '@material-ui/icons/GetApp';
import ShareIcon from '@material-ui/icons/Share';
import MetricServices from "../../Services/MetricsService";
import utilities from "../../Services/NewUtilities";
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import ClickWithTimeout from '../EngageCardComponent/ClickWithTimeOut';
import Toolbar from '@material-ui/core/Toolbar';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';
import AlertDialog from '../NewOnboardingComponents/AlertDialog';

const TimeOutPrimaryButton = ClickWithTimeout(PrimaryButtonComponent);
const TimeOutSecondaryButton = ClickWithTimeout(SecondaryButtonComponent);

const styles = InputThemes.singleInputStyleWithPaper;

const theme1 = InputThemes.DownloadSnackbarTheme;

const QR_CONTAINER = "qrContainer";

const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";

var localeObj = {};

class GCCPixRecieveQRCode extends React.Component {
    constructor(props) {
        super(props);
        this.styles = {
            qrContainer: {
                height: "60%",
                width: "60%",
                margin: "auto",
                borderRadius: "1.25rem"
            },
        };
        this.state = {
            date: moment(moment.now()).format("DD/MM/YYYY"),
            type: "PIX",
            editing: false,
            keys: this.props.location.requiredInfo.keys,
            loaded: false,
            description: this.props.location.requiredInfo.description,
            code: this.props.location.QrCode,
            displayValue: "",
            snackBarOpen: false,
            fileName: "",
            processing: false,
            isMotopayOnly: androidApiCalls.checkIfMpOnly()
        };
        this.qr = React.createRef();
        this.handleShare = this.handleShare.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.componentName = PageNames.gccPixRecieveQRCodeComponent;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        let amount = this.props.location.requiredInfo.amount ? this.props.location.requiredInfo.amount : "00";
        let decimal = this.props.location.requiredInfo.decimal ? this.props.location.requiredInfo.decimal : "00";
        let displaySalary = utilities.parseSalary(amount + decimal);
        this.setState({
            displayValue: displaySalary,
        })

        window.onBackPressed = () => {
            this.onBack();
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
                            snackBarMessage: localeObj.allow_storage,
                            snackBar: true
                        })
                    }

                }
            }
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
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    copyCode = () => {
        androidApiCalls.copyToClipBoard(this.props.location.copyCode);
        this.setState({
            snackBarMessage: localeObj.pix_copied_in_clipboard,
            snackBar: true
        });
    }
    handleShare = () => {
        html2canvas(document.body, { allowTaint: true, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png').split(';base64,')[1];
            androidApiCalls.shareWalletImage(imgData, localeObj.pix_receipt_share_header, this.getFilename());
        });
        return;
    }

    handleOpen = () => {
        androidApiCalls.openReceipt(this.state.fileName);
        this.setState({ snackBarOpen: false })
    }

    getFilename = () => {
        let name = "qrcode_Pix_" + moment().format("DDMMYYYY") + ".png";
        return name;
    }

    handleDownload = () => {
        this.showProgressDialog();
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let download_failed = false;
            let fileName = this.getFilename();
            this.setState({
                fileName: this.getDownloadedFileName()
            })

            html2canvas(document.body, { allowTaint: true, useCORS: true }).then(function (canvas) {
                const data = canvas.toDataURL('image/png').split(';base64,')[1];
                androidApiCalls.saveFile(data, "Download", fileName).then(result => {
                    if (result) {
                        //Log.sDebug("QrCode Downloaded", "PixGenerateQR")
                        return;
                    } else {
                        //Log.sDebug("QrCode Download FAIL", "PixGenerateQR", constantObjects.LOG_PROD)
                        download_failed = true;
                        return;
                    }
                })
            })
            this.hideProgressDialog();
            if (!download_failed) {
                androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.state.fileName ? this.state.fileName : fileName);
            } else {
                androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.state.fileName ? this.state.fileName : fileName);
            }

            this.setState({
                snackBarOpen: true,
            })
        } else {
            this.hideProgressDialog();
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    minBalanceLoaded = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(this.componentName)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        let balance = parseFloat(balanceInfo[0]);
                        let amountValue = parseFloat(this.props.location.requiredInfo.amount);
                        if (balance > amountValue ||
                            balance === amountValue) {
                            this.hideProgressDialog();
                            let event = {
                                eventType: constantObjects.firstAccess + "AMOUNT CREDIT SUCCESS",
                                page_name: this.componentName,
                            };
                            MetricServices.reportActionMetrics(event, new Date().getTime());
                            this.props.history.push({
                                pathname: "/gccFirstAccess",
                                "fromComponent": "GCCPixRecieveQRCode",
                                maybelater: false,
                                amount: this.props.location.requiredInfo.amount
                            });
                        } else {
                            let event = {
                                eventType: constantObjects.firstAccess + "AMOUNT CREDIT FAILED",
                                page_name: this.componentName,
                            };
                            MetricServices.reportActionMetrics(event, new Date().getTime());
                            this.hideProgressDialog();
                            this.setState({
                                noBalanceDrawer: true
                            });
                        }
                    } else {
                        let event = {
                            eventType: constantObjects.firstAccess + "AMOUNT CREDIT FAILED",
                            page_name: this.componentName,
                        };
                        MetricServices.reportActionMetrics(event, new Date().getTime());
                        this.hideProgressDialog();
                        this.setState({
                            noBalanceDrawer: true
                        });
                        // let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        // this.setTransactionInfo(errorJson);
                    }
                } else {
                    let event = {
                        eventType: constantObjects.firstAccess + "AMOUNT CREDIT FAILED",
                        page_name: this.componentName,
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                    this.hideProgressDialog();
                    this.setState({
                        noBalanceDrawer: true
                    });
                    // let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    // this.setTransactionInfo(errorJson);
                }
            });
    }

    getDownloadedFileName = () => {
        const moment = require('moment');
        let name = "qrcode_Pix_" + moment().format("DDMMYYYY") + ".png";
        let filename = androidApiCalls.getDownloadedFileName("Download", name);
        this.setState({
            fileName: filename
        })
        return filename
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    closePermissionSnackBar = () => {
        this.setState({ snackBar: false })
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

    onBack = () => {
        if (this.state.noBalanceDrawer === true) {
            this.CloseNoBalanceDrawer();
            return;
        } else {
            this.props.history.push({
                pathname: "/gccInvestmentAmount",
                amount: this.props.location.requiredInfo.amount
            });
        }
    }

    CloseNoBalanceDrawer = () => {
        this.setState({
            noBalanceDrawer: false
        });
    }

    render() {
        const screenHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div>
                {!this.state.processing &&
                    <div className="scroll" style={{ height: `${screenHeight - 295}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <ButtonAppBar header={localeObj.pix_header} onBack={this.onBack} action="none" />
                        <div style={InputThemes.initialMarginStyle}>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.gcc_fa_pix_QRCode}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.4rem" }}>
                                {localeObj.gcc_fa_pix_QRCode_bottom}
                            </div>
                        </div>
                        <div style={{ width: "100%", marginTop: "1.5rem" }}>
                            <FlexView column className='qrCont'>
                                <img ref={r => this.qr = r} id={QR_CONTAINER} onLoad={() => this.setState({ loaded: true })}
                                    style={this.styles.qrContainer} src={this.state.code} alt="new" />
                            </FlexView>
                        </div>
                        <FlexView style={{ justifyContent: "space-between", margin: "1.5rem 3rem" }}>
                            <ActionButtonComponent
                                btn_text={localeObj.share}
                                onCheck={this.handleShare}
                                icon={<ShareIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />

                            <ActionButtonComponent
                                btn_text={localeObj.download}
                                onCheck={this.handleDownload}
                                icon={<GetAppIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                        </FlexView>
                        <div>
                            <div className="caption highEmphasis" style={{ textAlign: "center", marginBottom: "1rem" }}>{localeObj.gcc_fa_pix_info_fromQRCode} </div>
                            <FlexView column style={{ margin: "0 1.5rem" }}>
                                {
                                    Object.keys(this.props.location.requiredInfo.receiver).map((key, idx) => {
                                        return (
                                            <div key={idx} style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                                                <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{key}</span>
                                                <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.props.location.requiredInfo.receiver[key]}</span>
                                            </div>
                                        )
                                    })
                                }
                                {this.state.displayValue !== "" &&
                                    <div style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                                        <span className="pixTableLeftContent tableLeftStyle mediumEmphasis">{localeObj.amount}</span>
                                        <span className="pixTableRightContent tableRightStyle highEmphasis">{"R$ "}{this.state.displayValue}</span>
                                    </div>
                                }
                                {this.state.description !== "" &&
                                    <div style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                                        <span className="pixTableLeftContent tableLeftStyle mediumEmphasis">{localeObj.pix_description}</span>
                                        <span className="pixTableRightContent tableRightStyle highEmphasis">{this.state.description}</span>
                                    </div>
                                }
                            </FlexView>
                        </div>
                    </div>}
                {!this.state.processing &&
                    <div style={InputThemes.bottomButtonStyle} data-html2canvas-ignore="true">
                        <TimeOutPrimaryButton btn_text={localeObj.copy_code} onCheck={this.copyCode} />
                        <TimeOutSecondaryButton btn_text={localeObj.first_access_gcc_QR_code_btn} onCheck={this.minBalanceLoaded} />
                    </div>
                }
                {this.state.storagePermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closestoragePermissionAlertDialog} />
                }
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBar} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closePermissionSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.noBalanceDrawer && !this.state.processing}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.first_access_gcc_QR_code_error_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.first_access_gcc_QR_code_error_footer}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
                            <PrimaryButtonComponent btn_text={localeObj.first_access_gcc_howitworks_option2_bottomsheet_btn} onCheck={this.CloseNoBalanceDrawer} />
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.blockInvoicePaymentDuetoAutomaticDebitSheet}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.autoDebitStopHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.autoDebitStopDescription}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem" , display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={this.cancelAutomaticDebitDrawer} />
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.snackBarOpen && !this.state.processing}>
                        <MuiThemeProvider theme={theme1}>
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
                                        <CancelIcon onClick={this.closeSnackBar} style={{ fill: ColorPicker.darkHighEmphasis }} />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </MuiThemeProvider>
                    </Drawer>
                </div>
                {this.state.processing &&
                    <div style={{ height: `${screenHeight}px` }}>
                        <CustomizedProgressBars />
                    </div>}
            </div>
        )
    }
}

GCCPixRecieveQRCode.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object,
    location: PropTypes.object
};

export default withStyles(styles)(GCCPixRecieveQRCode);