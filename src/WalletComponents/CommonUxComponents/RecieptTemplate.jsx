import React from 'react';
import FlexView from "react-flexview";
import * as html2canvas from 'html2canvas';
import moment from "moment";

import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";
import NewUtilities from "../../Services/NewUtilities";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from '../../Services/PageState';
import GeneralUtilities from '../../Services/GeneralUtilities';
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";

import CommonButtons from "../CommonUxComponents/CommonButtons";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import TableComponent from "../CommonUxComponents/TableComponent";
import TableDownloadComponent from "../CommonUxComponents/TableDownloadComponent";

import ShareIcon from '@material-ui/icons/Share';
import GetAppIcon from '@material-ui/icons/GetApp';
import Button from '@material-ui/core/Button';
import ArrowDownward from "../../images/SvgUiIcons/receive.svg";
import PhoneRecharge from '../../images/SvgUiIcons/mobile.svg';
import ArrowUpward from "../../images/SvgUiIcons/send.svg";
import SyncAlt from '../../images/SvgUiIcons/transaction.svg';
import DownloadArrowDownward from "../../images/SvgUiIcons/download_receive.svg";
import DownloadPhoneRecharge from '../../images/SvgUiIcons/download_mobile.svg';
import DownloadArrowUpward from "../../images/SvgUiIcons/download_send.svg";
import DownloadSyncAlt from '../../images/SvgUiIcons/download_transaction.svg';
import Zigzag from "../../images/SvgUiIcons/Receipt_zigzag.svg";
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import Drawer from '@material-ui/core/Drawer';
import receiptId from '../../images/SvgUiIcons/receipt_id.svg';
import downloadReceiptId from '../../images/SvgUiIcons/download_receipt_id.svg';
import dimo_logo from "../../images/DarkThemeImages/Dimo-Dark-Logo_4x.png";
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import TimeIcon from '@material-ui/icons/AccessTime';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import EditIcon from '@material-ui/icons/Edit';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Log from '../../Services/Log';
import AndroidActionButton from './AndroidActionButton';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';
import AlertDialog from '../NewOnboardingComponents/AlertDialog';
import HelloShopUtil from '../EngageCardComponent/HelloShopUtil';
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import PropTypes from 'prop-types';
import TransactionIcon from '../../images/SvgUiIcons/transaction.svg';

const theme1 = InputThemes.DownloadSnackbarTheme;
const TimeOutPrimaryButton = ClickWithTimeout(PrimaryButtonComponent);
const TimeOutActionButton = ClickWithTimeout(AndroidActionButton);
var localeObj = {};
const OutlineButton = CommonButtons.AwaitButton;

const AwaitButton = withStyles(() => ({
    root: {
        backgroundColor: ColorPicker.newProgressBar,
        borderRadius: "0.75rem",
        padding: "0.5rem",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        justifyContent: "center",
        width: "100%",
        '&:disabled': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
}))(Button);


const ColoredTextButton = withStyles({
    root: {
        color: ColorPicker.duskHorizon,
        textTransform: "none"
    },
})((props) => <Button color="default" {...props} />);

const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";

export default class ReceiptTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seconds: 5,
            showDetails: false,
            payerInfoAvailable: false,
            snackBarOpen: false,
            disableOtherTransactions: false,
            disableShare: false,
            fileName: "",
            processing: false,
            isMotopayOnly: androidApiCalls.checkIfMpOnly()
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "RECEIPT PAGE"
        }
        this.timer = 0;
        this.countDown = this.countDown.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
        this.stopCountDown();
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        if (!!this.props.requiredInfo && !!this.props.requiredInfo.payer) {
            this.setState({
                payerInfoAvailable: true,
            });
        }

        if (GeneralUtilities.isNotEmpty(this.props.requiredInfo.componentPath)) {
            this.startTimer();
        }

        window.onBackPressed = () => {
            this.props.onBack();
        }

        window.onScanQRComplete = (response) => {
            if (response) {
                if (response === "cancelled") {
                    //Log.sDebug("User cancelled scanning", this.props.componentName);
                } else if (this.props.requiredInfo.newTransaction === "boleto") {
                    if (response === "manual") {
                        //Log.sDebug("User opted to enter boleto code manually", this.props.componentName);
                        this.props.actOnScanComplete(1);
                    } else if (response === "switchQR") {
                        //Log.sDebug("User selected to scan boleto barcode", this.props.componentName);
                        this.props.actOnScanComplete(2);
                    } else {
                        if (response.includes("boleto")) {
                            //Log.sDebug("Scanned boleto successfully", this.props.componentName);
                            let qrVal = response.split(":")[1]
                            this.props.actOnScanComplete(3, qrVal);
                        } else {
                            //Log.sDebug("Scanned invalid boleto", this.props.componentName);
                            this.setState({
                                snackBarOpen: true,
                                message: localeObj.invalid_Boleto
                            })
                        }
                    }
                } else if (this.props.requiredInfo.newTransaction === "atm") {
                    if (response.includes("atm")) {
                        let qrCodeValue = response.split(":")[1];
                        //Log.sDebug("Scanned ATM QR code successfully", this.props.componentName);
                        this.props.actOnScanComplete(4, qrCodeValue);
                    } else {
                        //Log.sDebug("Scanned Invalid ATM QR code", this.props.componentName);
                        this.openSnackBar(localeObj.invalid_ATM_QR_token);
                    }
                }
                //1: Manual, 2: Switch bar code, 3: Boleto Component, 4:ATM
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === WRITE_EXTERNAL_STORAGE) {
                if (status === true) {
                    if (this.props.requiredInfo.newTransaction === "boleto") {
                        androidApiCalls.scanBoletoCode();
                    } else if (this.props.requiredInfo.newTransaction === "atm") {
                        androidApiCalls.scanQrCode("atm")
                    }
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

        window.onContentShared = () => {
            ImportantDetails.shareEnabled = true;
        }

        window.onPauseCamera = () => {
            ImportantDetails.shareEnabled = false;
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        this.setState({
            seconds: seconds,
        });
        // Check if we're at zero.
        if (seconds === 0) {
            this.stopCountDown();
            let url = HelloShopUtil.getSuccessURL(JSON.stringify(this.props.requiredInfo))
            HelloShopUtil.returnToHS(url);
        }
    }

    stopCountDown() {
        clearInterval(this.timer);
        this.timer = 0;
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

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, this.props.componentName);
    }

    onReturn = () => {
        MetricServices.onTransitionStop(this.componentName, PageState.close);
        this.props.returnMoney();
    }

    handleNextTransition = param => () => {
        if (param === "transactions") {
            this.handleLogging("Clicked on other transactions");
            MetricServices.onTransitionStop(this.componentName, PageState.close);
            this.props.OtherTransaction();
        } else if (param === "pay_now") {
            this.handleLogging("Clicked on pay now");
            MetricServices.onTransitionStop(this.componentName, PageState.close);
            this.props.payNow();
        } else if (param === "save_contact") {
            this.handleLogging("Clicked on save contact");
            MetricServices.onTransitionStop(this.componentName, PageState.close);
            this.props.saveContact();
        } else if (param === "report_unauthorized") {
            this.handleLogging("Clicked on report unauthorized");
            MetricServices.onTransitionStop(this.componentName, PageState.close);
            this.props.onReportUnauthorized();
        } else if (param === "menu") {
            if (this.props.btnText === localeObj.cancel_scheduled) {
                this.handleLogging("Clicked on cancel schedule");
                this.props.cancelSchdule();
            } else {
                this.handleLogging("Clicked on main menu");
                MetricServices.onTransitionStop(this.componentName, PageState.close);
                this.props.confirm();
            }
        }
        return;
    }

    editSchedule = () => {
        this.handleLogging("Clicked on Edit Schedule");
        MetricServices.onTransitionStop(this.componentName, PageState.close);
        this.props.editSchedule();
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    handleShare = () => {
        this.handleLogging("Clicked on share");
        let temp = this.props.requiredInfo.date.replace(/\//g, "");
        let fileName = this.props.requiredInfo.fileName + temp;
        html2canvas(document.getElementById('share_or_download'), { allowTaint: true, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png').split(';base64,')[1];
            androidApiCalls.shareWalletImage(imgData, localeObj.pix_receipt_share_header, fileName);
        });
        return;
    }

    getFilename = () => {
        let temp = this.props.requiredInfo.date.replace(/\//g, "")
        let fileName = this.props.requiredInfo.fileName;
        fileName = (fileName !== "" && fileName !== undefined) ? fileName : "comprovante_";
        fileName = fileName + temp + ".png";
        this.handleLogging("Downloading file " + fileName);
        return fileName;
    }

    handleDownload = () => {
        this.showProgressDialog();
        this.handleLogging("Clicked on download");
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let download_failed = false;
            html2canvas(document.getElementById('share_or_download'), { allowTaint: true, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL('image/png').split(';base64,')[1];

                let fileName = this.getFilename();
                this.setState({
                    fileName: this.getDownloadedFileName()
                })
                androidApiCalls.saveFile(imgData, "Download", fileName).then(result => {
                    if (result) {
                        //Log.sDebug("Receipt Downloaded", localeObj.pix_download_complete)
                    } else {
                        download_failed = true;
                        //Log.sDebug("Receipt Download FAIL", localeObj.pix_receipt_download_failed, constantObjects.LOG_PROD)
                    }
                    this.hideProgressDialog();
                    if (!download_failed) {
                        androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.state.fileName);
                    } else {
                        androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.state.fileName);
                    }
                    return;
                })
                return;
            });

            if (!download_failed) {
                androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.getDownloadedFileName());
            } else {
                androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.getDownloadedFileName());
            }

            this.setState({
                snackBarOpen: true,
            })
        } else {
            this.hideProgressDialog();
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    getDownloadedFileName = () => {
        let fileName = this.getFilename();
        let filename = androidApiCalls.getDownloadedFileName("Download", fileName);
        return filename
    }

    changeShowStatus = () => {
        this.setState({
            showDetails: !this.state.showDetails
        })
    }

    handleOpen = () => {
        androidApiCalls.openReceipt(this.state.fileName);
        this.setState({ snackBarOpen: false })
    }

    isNonEmpty = (info) => {
        if (info === "" || info === undefined) {
            return false;
        } else {
            return true;
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
        })
    }

    render() {
        const full = this.props.requiredInfo.amount;
        const decimal = NewUtilities.formatDecimal(this.props.requiredInfo.decimal);
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const typeOfTransaction = this.props.typeOfTransaction;

        const isReceived = () => {
            if (this.props.requiredInfo.Type === "C") {
                return true;
            } else {
                return false;
            }
        }

        const scheduledDetails = () => {
            let details = ""
            if (this.props.schedule) {
                if (!GeneralUtilities.emptyValueCheck(this.props.requiredInfo.recurrence)) {
                    if (this.props.requiredInfo.recurrence > 1) {
                        let displayDate = (GeneralUtilities.getLocale() === "en_US" ? moment(this.props.requiredInfo.scheduled_date).format("Do") : moment(this.props.requiredInfo.scheduled_date).format("D"))
                        details = localeObj.scheduled_for + " " + displayDate;
                    } else {
                        details = localeObj.schedule + " " + moment(this.props.requiredInfo.scheduled_date).format("DD/MM/YYYY");
                    }
                } else {
                    details = localeObj.schedule + " " + moment(this.props.requiredInfo.scheduled_date).format("DD/MM/YYYY");
                }
            } else {
                details = localeObj.recharge_conf;
            }
            return details;
        }

        const getAuthCode = () => {
            let authID = this.props.authCode;
            if (authID !== "" && authID !== undefined) {
                let length = authID.toString().length;
                if (length <= 40) {
                    authID = authID.substring(0, length)
                } else {
                    authID = authID.substring(0, 39) + "\n" + authID.substring(39, length);
                }
                return authID.toUpperCase();
            }
            return "";
        }

        const sentOrReceived = () => {
            if (this.props.requiredInfo.type === "C") {
                if (GeneralUtilities.emptyValueCheck(this.props.requiredInfo.payerName)) {
                    return " ";
                } else {
                    return (localeObj.pix_from + " " + this.props.requiredInfo.payerName)
                }
            } else if (this.props.requiredInfo.type === "D") {
                if (this.props.requiredInfo.receiver[localeObj.name] === undefined && this.props.requiredInfo.typeOfOperation === "Saque") {
                    return (localeObj.pix_from + " " + localeObj.txn_atm)
                } else if (this.props.requiredInfo.receiver[localeObj.name] === undefined && this.props.requiredInfo.typeOfOperation === "Recarga de celular") {
                    return (localeObj.pix_from + " " + this.props.requiredInfo.receiver[localeObj.operator])
                }
                else {
                    return (localeObj.pix_to + " " + this.props.requiredInfo.receiver[localeObj.name])
                }
            } else {
                return (this.props.requiredInfo.header === localeObj.you_received) ?
                    (localeObj.pix_from + " " + this.props.requiredInfo.receiver[localeObj.name]) :
                    (localeObj.pix_to + " " + this.props.requiredInfo.receiver[localeObj.name]);
            }
        }

        const selectPrimaryButtonText = () => {
            if (this.props.allowScheduleEdit && this.props.schedule) {
                return {
                    "text": localeObj.pay_now,
                    "action": "pay_now"
                }
            } else if (this.props.showSaveContact) {
                return {
                    "text": localeObj.save_contact,
                    "action": "save_contact"
                }
            } else if (this.props.showUnauthrizedOption) {
                return {
                    "text": localeObj.chatbot_report_unauthorized,
                    "action": "report_unauthorized"
                }
            } else if (this.props.fromBoleto) {
                return {
                    "text": localeObj.pay_another_boleto,
                    "action": "transactions"
                }
            }
            else {
                return {
                    "text": localeObj.other_transactions,
                    "action": "transactions"
                }
            }
        }

        return (
            <div>
                <div style={{ display: !this.state.processing ? "flex" : "none", flexDirection: "column", background: ColorPicker.newProgressBar }}>
                    <div style={{ textAlign: "center", marginTop: "1.5rem", marginBottom: "0.75rem" }} className="body1 highEmphasis">
                        {this.props.header}
                    </div>
                    <span style={{ textAlign: "center" }}>
                        <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                        <span className="headline2 balanceStyle highEmphasis">{full}</span>
                        <span className="subScript headline5 highEmphasis">{"," + decimal}</span>
                    </span>
                    {this.props.header !== localeObj.pix_withdraw_receipt_header && this.props.requiredInfo.receiver[localeObj.name] &&
                        <div style={{ margin: "0.3rem 20%", textAlign: "center", }} className="body1 highEmphasis">
                            <span style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{sentOrReceived()}</span>
                        </div>
                    }
                    {this.isNonEmpty(this.props.requiredInfo.date) &&
                        <FlexView hAlignContent="center" style={{ textAlign: "center", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                            <div className="Caption highEmphasis">
                                {this.props.requiredInfo.date}
                            </div>
                            {this.isNonEmpty(this.props.requiredInfo.hour) && this.isNonEmpty(this.props.requiredInfo.mins) &&
                                <div className="Caption highEmphasis" style={{ marginLeft: ".5rem" }}>
                                    {this.props.requiredInfo.hour + "h" + this.props.requiredInfo.mins}
                                </div>
                            }
                        </FlexView>
                    }
                    {!GeneralUtilities.isNotEmpty(this.props.requiredInfo.componentPath) && <FlexView style={{ justifyContent: "space-around", width: "90%", margin: "0rem 5% 1.5rem" }}>
                        <TimeOutActionButton
                            btn_text={localeObj.share}
                            onCheck={this.handleShare}
                            disabled={this.state.disableShare}
                            icon={<ShareIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                        <AndroidActionButton
                            btn_text={localeObj.download}
                            onCheck={this.handleDownload}
                            icon={<GetAppIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                    </FlexView>
                    }
                </div>
                {/* <div style={{ display: (this.props.schedule) ? "block" : "none" }}>
                        <OutlineButton 
                            startIcon={<TimeIcon style={{ fill: ColorPicker.darkHighEmphasis }} />}
                        >
                            <span className="body2 highEmphasis">{scheduledDetails()}</span>
                        </OutlineButton>
                </div> */}
                <div style={{ display: !this.state.processing ? "block" : "none", height: this.props.schedule ? `${screenHeight * 0.32}px` : `${screenHeight * 0.35}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", marginBottom: "2rem" }}>
                        {this.props.header === localeObj.pix_withdraw_receipt_header &&
                            <div>
                                <TableComponent
                                    localeObj={localeObj}
                                    array={this.props.requiredInfo.receiver}
                                    detailHeader={localeObj.details}
                                    icon={TransactionIcon}
                                />
                            </div>
                        }
                        {!isReceived() && this.props.header !== localeObj.pix_withdraw_receipt_header &&
                            <div style={{ marginBottom: "1rem", marginTop: "1rem", display: (this.props.recharge || this.props.schedule) ? "block" : "none" }}>
                                <AwaitButton disabled={!this.props.allowScheduleEdit} onClick={this.editSchedule}
                                    startIcon={this.props.schedule ? <TimeIcon style={{ fill: ColorPicker.darkHighEmphasis }} /> : <ErrorIcon style={{ fill: ColorPicker.darkHighEmphasis }} />}
                                    endIcon={<EditIcon style={{ marginLeft: "0.5rem", fill: ColorPicker.darkHighEmphasis, display: this.props.allowScheduleEdit ? 'block' : 'none' }} />}>
                                    <span className="body2 highEmphasis">{scheduledDetails()}</span>
                                </AwaitButton>
                            </div>
                        }
                        {(!isReceived() && this.props.header !== localeObj.pix_you_sent) &&
                            <div>
                                <div>
                                    {this.state.payerInfoAvailable && <TableComponent
                                        localeObj={localeObj}
                                        array={this.props.requiredInfo.payer}
                                        detailHeader={localeObj.source}
                                        icon={ArrowUpward} />
                                    }
                                </div>
                            </div>
                        }
                        {!isReceived() && this.props.header === localeObj.pix_you_sent &&
                            <div>
                                <TableComponent
                                    localeObj={localeObj}
                                    array={this.props.requiredInfo.receiver}
                                    detailHeader={this.props.detailHeader ? this.props.detailHeader : localeObj.destination}
                                    icon={(this.props.detailHeader === localeObj.recharge_info) ? PhoneRecharge : ArrowDownward} />
                            </div>
                        }
                        {isReceived() &&
                            <div>
                                <TableComponent
                                    localeObj={localeObj}
                                    array={this.props.info}
                                    detailHeader={localeObj.transcation_details}
                                    icon={SyncAlt} />
                            </div>
                        }
                        {!this.state.showDetails &&
                            <div style={{ display: this.props.returnText !== undefined ? "block" : "none", paddingTop: "2rem", textAlign: "center" }}>
                                <div style={{ display: this.props.returnText ? "block" : "none", textAlign: "center" }}>
                                    <AndroidActionButton
                                        btn_text={localeObj.return_money}
                                        onCheck={this.onReturn} />
                                </div>
                            </div>
                        }
                        {!isReceived() && !this.props.fromBoleto && this.props.header !== localeObj.pix_withdraw_receipt_header &&
                            <div className="pixEditButton" style={{ marginTop: "1rem", display: this.state.showDetails ? "none" : "block", textAlign: "center" }}>
                                <ColoredTextButton className="Caption" onClick={this.changeShowStatus} >{localeObj.show_details}</ColoredTextButton>
                            </div>
                        }
                        {(!isReceived() && this.props.header === localeObj.pix_you_sent) &&
                            <div style={{ display: this.state.showDetails ? "block" : "none" }}>
                                <div style={{ display: this.state.payerInfoAvailable ? "block" : "none" }}>
                                    {this.state.payerInfoAvailable && <TableComponent
                                        localeObj={localeObj}
                                        array={this.props.requiredInfo.payer}
                                        detailHeader={localeObj.source}
                                        icon={ArrowUpward} />
                                    }
                                </div>
                            </div>
                        }
                        {(!isReceived() && this.props.header !== localeObj.pix_you_sent) &&
                            (this.props.fromBoleto ?
                                <div>
                                    <TableComponent
                                        localeObj={localeObj}
                                        array={this.props.requiredInfo.receiver}
                                        detailHeader={this.props.detailHeader ? this.props.detailHeader : localeObj.destination}
                                        icon={(this.props.detailHeader === localeObj.recharge_info) ? PhoneRecharge : ArrowDownward} />
                                </div>
                                :
                                <div style={{ display: this.state.showDetails ? "block" : "none" }}>
                                    <TableComponent
                                        localeObj={localeObj}
                                        array={this.props.requiredInfo.receiver}
                                        detailHeader={this.props.detailHeader ? this.props.detailHeader : localeObj.destination}
                                        icon={(this.props.detailHeader === localeObj.recharge_info) ? PhoneRecharge : ArrowDownward} />
                                </div>
                            )
                        }
                        {!isReceived() && this.props.fromBoleto &&
                            <div className="pixEditButton" style={{ textAlign: "center", marginTop: "1rem", display: this.state.showDetails ? "none" : "block" }}>
                                <ColoredTextButton className="Caption" onClick={this.changeShowStatus} >
                                    {localeObj.show_details}
                                    <KeyboardArrowDownOutlinedIcon />
                                </ColoredTextButton>
                            </div>
                        }
                        {!isReceived() &&
                            <div style={{ display: this.state.showDetails ? "block" : "none" }}>
                                <div>
                                    <TableComponent
                                        localeObj={localeObj}
                                        array={this.props.info}
                                        detailHeader={localeObj.transcation_details}
                                        icon={SyncAlt} />
                                </div>
                            </div>
                        }
                        {this.isNonEmpty(this.props.authCode) &&
                            <FlexView column style={{ marginTop: "1.5rem", display: this.state.showDetails ? "block" : "none" }}>
                                <div className="pixTableRightContent tableRightStyle highEmphasis" style={{ textAlign: "left", width: "100%", paddingBottom: ".5rem" }}>
                                    <img src={receiptId} alt="" className="pixReceiverSenderIcon" />
                                    {localeObj.authentication_code}
                                </div>
                                <div className="pixTableLeftContent tableLeftStyle mediumEmphasis" style={{ textAlign: "left", marginTop: ".375rem" }}>
                                    {getAuthCode()}
                                </div>
                            </FlexView>
                        }
                        {this.state.showDetails &&
                            <div style={{ display: this.props.returnText !== undefined ? "block" : "none", paddingTop: "2rem", textAlign: "center" }}>
                                <div style={{ display: this.props.returnText ? "block" : "none", textAlign: "center" }}>
                                    <AndroidActionButton
                                        btn_text={localeObj.return_money}
                                        onCheck={this.onReturn} />
                                </div>
                            </div>
                        }
                        {!isReceived() &&
                            <div className="pixEditButton" style={{ marginTop: "1rem", display: this.state.showDetails ? "block" : "none", textAlign: "center" }}>
                                <ColoredTextButton className="Caption" onClick={this.changeShowStatus} >{localeObj.hide_details}</ColoredTextButton>
                            </div>
                        }
                    </FlexView>
                </div>
                {!this.state.processing && !GeneralUtilities.isNotEmpty(this.props.requiredInfo.componentPath) &&
                    <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                        {this.props.schedule &&
                            <FlexView column>
                                <div className="subtitle2 highEmphasis" style={{ margin: "1.5rem", opacity: "60%" }}>{localeObj.pay_another_boleto_desc}</div>
                            </FlexView>
                        }
                        {this.props.header !== localeObj.pix_withdraw_receipt_header &&
                            <TimeOutPrimaryButton btn_text={selectPrimaryButtonText().text}
                                onCheck={this.handleNextTransition(selectPrimaryButtonText().action)} />}
                        <SecondaryButtonComponent btn_text={this.props.btnText} onCheck={this.handleNextTransition("menu")} />
                        {this.props.fromTransactionHistory && (typeOfTransaction !== "C") && !this.props.fromChatbot &&
                            <div className="body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}>
                                {localeObj.get_help_chatbot}
                                <span className="body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.props.goToChatbot}>
                                    {localeObj.chatbot_help}
                                </span>
                            </div>
                        }
                    </div>
                }
                {GeneralUtilities.isNotEmpty(this.props.requiredInfo.componentPath) && <div style={{ paddingLeft: "7rem", paddingRight: "3rem", height: "2.5rem" }}>
                    <FlexView>
                        <span style={{}}><CustomizedProgressBars timer={true} size={40} /></span>
                        <span style={{}} className="tableLeftStyle highEmphasis" >{GeneralUtilities.formattedString(localeObj.hs_redirect_message, [this.state.seconds])}</span>
                    </FlexView>
                </div>}

                <div style={{ display: !this.state.processing ? "block" : "none", position: "absolute", width: "100%", left: "-9999px", backgroundColor: "#ffffff" }}>
                    <div id={"share_or_download"} style={{ width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center" }}>
                            <FlexView column hAlignContent="center" style={{ width: screenWidth }}>
                                <img style={{ marginTop: "1.5rem", height: '3rem' }} src={dimo_logo} alt=""></img>
                            </FlexView>
                            <div className="body1 btnHighEmphasis" style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}>
                                {this.props.schedule ? this.props.info[localeObj.pix_type] + " " + localeObj.scheduled_filter + " " + localeObj.pix_receipt :
                                    this.props.info[localeObj.pix_type] + " " + localeObj.pix_receipt}
                            </div>
                            <FlexView style={{ margin: "1rem", textAlign: "center" }}>
                                <span className="headline5 btnHighEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                                <span className="headline2 balanceStyle btnHighEmphasis">{full}</span>
                                <span className="subScript headline5 btnHighEmphasis">{"," + decimal}</span>
                            </FlexView>
                            <FlexView style={{ marginBottom: "1rem" }}>
                                <div className="caption btnHighEmphasis">
                                    {this.props.requiredInfo.date}
                                </div>
                                <div className="caption btnHighEmphasis" style={{ marginLeft: ".5rem" }}>
                                    {this.props.requiredInfo.hour + "h" + this.props.requiredInfo.mins}
                                </div>
                            </FlexView>
                        </div>
                        <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", paddingBottom: "2rem" }}>
                            {this.props.schedule &&
                                <div style={{ marginBottom: "1rem", marginTop: "1rem", display: (this.props.schedule) ? "block" : "none" }}>
                                    <OutlineButton disabled={true}
                                        startIcon={<TimeIcon style={{ color: ColorPicker.darkHighEmphasis }} />}>
                                        <span className="body2 highEmphasis">{scheduledDetails()}</span>
                                    </OutlineButton>
                                </div>
                            }
                            <TableDownloadComponent
                                localeObj={localeObj}
                                array={this.props.requiredInfo.receiver}
                                detailHeader={this.props.detailHeader ? this.props.detailHeader : localeObj.destination}
                                icon={(this.props.detailHeader === localeObj.recharge_info) ? DownloadPhoneRecharge : DownloadArrowDownward} />
                            <div style={{ display: this.state.payerInfoAvailable ? "block" : "none" }}>
                                {this.state.payerInfoAvailable &&
                                    <TableDownloadComponent
                                        localeObj={localeObj}
                                        array={this.props.requiredInfo.payer}
                                        detailHeader={localeObj.pix_sender_info}
                                        icon={DownloadArrowUpward} />
                                }
                            </div>
                            <div>
                                <TableDownloadComponent
                                    localeObj={localeObj}
                                    array={this.props.info}
                                    detailHeader={localeObj.transcation_details}
                                    icon={DownloadSyncAlt} />
                            </div>
                            {this.isNonEmpty(this.props.authCode) &&
                                <FlexView column style={{ marginTop: "1.5rem" }}>
                                    <div className="pixTableRightContent tableRightStyle btnHighEmphasis" style={{ textAlign: "left", width: "100%", paddingBottom: ".5rem", display: "inline-flex" }}>
                                        <img src={downloadReceiptId} alt="" className="pixReceiverSenderIcon" />
                                        {localeObj.authentication_code}
                                    </div>
                                    <div className="pixTableLeftContent tableLeftStyle btnMediumEmphasis" style={{ textAlign: "left", marginTop: ".375rem" }}>
                                        {getAuthCode()}
                                    </div>
                                </FlexView>
                            }
                        </FlexView>
                        <div>
                            <img src={Zigzag} alt="" style={{ width: screenWidth }} />
                        </div>
                    </div>
                </div>
                {this.state.storagePermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closestoragePermissionAlertDialog} />
                }
                <div id="outer" style={{ display: !this.state.processing ? "block" : "none", width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer
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
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div >

        )
    }
}

ReceiptTemplate.propTypes = {
    componentName: PropTypes.string,
    onBack: PropTypes.func,
    requiredInfo: PropTypes.shape({
        amount: PropTypes.number,
        decimal: PropTypes.number,
        Type: PropTypes.string,
        recurrence: PropTypes.number,
        scheduled_date: PropTypes.string,
        payerName: PropTypes.string,
        type: PropTypes.string,
        receiver: PropTypes.object,
        header: PropTypes.string,
        date: PropTypes.string,
        hour: PropTypes.string,
        mins: PropTypes.string,
        componentPath: PropTypes.string,
        payer: PropTypes.object,
        newTransaction: PropTypes.string,
        fileName: PropTypes.string,
        typeOfOperation: PropTypes.string,
    }),
    typeOfTransaction: PropTypes.string,
    recharge: PropTypes.string,
    schedule: PropTypes.bool,
    authCode: PropTypes.string,
    header: PropTypes.string,
    allowScheduleEdit: PropTypes.bool,
    showSaveContact: PropTypes.bool,
    showUnauthrizedOption: PropTypes.bool,
    btnText: PropTypes.string,
    fromTransactionHistory: PropTypes.bool,
    fromChatbot: PropTypes.bool,
    goToChatbot: PropTypes.func,
    onReturn: PropTypes.func,
    handleShare: PropTypes.func,
    handleDownload: PropTypes.func,
    changeShowStatus: PropTypes.func,
    editSchedule: PropTypes.func,
    handleNextTransition: PropTypes.func,
    returnMoney: PropTypes.func,
    OtherTransaction: PropTypes.func,
    payNow: PropTypes.func,
    saveContact: PropTypes.func,
    onReportUnauthorized: PropTypes.func,
    confirm: PropTypes.func,
    cancelSchdule: PropTypes.func,
    actOnScanComplete: PropTypes.func,
    detailHeader: PropTypes.string,
    info: PropTypes.object,
    returnText: PropTypes.bool,
    fromBoleto: PropTypes.bool,
};
