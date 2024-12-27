import React from 'react';
import FlexView from "react-flexview";
import Drawer from '@material-ui/core/Drawer';
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";
import InputThemes from "../../../Themes/inputThemes";

import moment from "moment";
import * as html2canvas from 'html2canvas';

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import ActionButtonComponent from "../../CommonUxComponents/ActionButton";

import GetAppIcon from '@material-ui/icons/GetApp';
import MetricServices from "../../../Services/MetricsService";
import utilities from "../../../Services/NewUtilities";
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ClickWithTimeout from '../../EngageCardComponent/ClickWithTimeOut';
import Toolbar from '@material-ui/core/Toolbar';
import constantObjects from '../../../Services/Constants';
import PropTypes from 'prop-types';
const TimeOutPrimaryButton = ClickWithTimeout(PrimaryButtonComponent);
const TimeOutSecondaryButton = ClickWithTimeout(SecondaryButtonComponent);


const styles = {
    supScript: {
        verticalAlign: "top",
        position: "relative",
        top: "-0.15rem",
        fontSize: "70%",
        fontWeight: "500"
    },
    currStyle: {
        marginRight: "0.25rem",
        verticalAlign: "bottom",
        position: "relative",
        bottom: "-20%",
        fontWeight: "500"
    },
}

const theme1 = InputThemes.DownloadSnackbarTheme;
const QR_CONTAINER = "qrContainer";
const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";
var localeObj = {};

class PixRecieptComponent extends React.Component {
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
            loaded: false,
            code: this.props.QrCode,
            displayValue: "",
            snackBarOpen: false,
            dlsnackBarOpen: false,
            fileName: "",
            isMotopayOnly: androidApiCalls.checkIfMpOnly(),
            type: "PIX",
            date: this.props.expiryDate || moment(moment.now()).format("DD/MM/YYYY")
        };
        this.qr = React.createRef();
        this.handleShare = this.handleShare.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.CreditInvoicePaymentComponents.pix_success;
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        let amount = this.props.requiredInfo.amount ? this.props.requiredInfo.amount : "00";
        let decimal = this.props.requiredInfo.decimal ? this.props.requiredInfo.decimal : "00";
        let displaySalary = utilities.parseSalary(amount + decimal);
        this.setState({
            displayValue: displaySalary,
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

    handleShare = () => {
        this.setState({
            buttonDisable: true
        })
        html2canvas(document.body, { allowTaint: true, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png').split(';base64,')[1];
            androidApiCalls.shareWalletImage(imgData, localeObj.pix_receipt_share_header, "qrcode_Pix_");
            //Log.sDebug("User clicked QrCode Share", "PixGenerateQR");
        });
        setTimeout(() => {
            this.setState({
                buttonDisable: false
            })
        }, 1500);
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
                        //Log.sDebug("QrCode Download FAIL", "PixGenerateQR")
                        download_failed = true;
                        return;
                    }
                })
            })
            if (!download_failed) {
                androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.state.fileName ? this.state.fileName : fileName);
            } else {
                androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.state.fileName ? this.state.fileName : fileName);
            }

            this.setState({
                snackBarOpen: true,
            })
        } else {
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
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

    copyToClipboard = () => {
        androidApiCalls.copyToClipBoard(this.props.pixCode);
        this.setState({
            dlsnackBarOpen: true,
            message: localeObj.pix_copied_in_clipboard
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
        this.setState({ dlsnackBarOpen: false })
    }

    render() {
        const screenHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div className="scroll" style={{ display: !this.state.processing ? "block" : "none", height: `${screenHeight - 295}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                        {localeObj.pix_QRCode}
                    </div>
                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.4rem" }}>
                        {localeObj.pix_QRCode_bottom}
                    </div>
                </div>
                <div style={{ width: "100%", marginTop: "1.5rem" }}>
                    <FlexView column className='qrCont'>
                        <img ref={r => this.qr = r} id={QR_CONTAINER} onLoad={() => this.setState({ loaded: true })}
                            style={this.styles.qrContainer} src={this.state.code} alt="new" />
                    </FlexView>
                </div>
                <div style={{ width: "100%", margin: "1.5rem auto", textAlign: "center" }} data-html2canvas-ignore="true">
                    <ActionButtonComponent icon={<GetAppIcon />}
                        btn_text={localeObj.pix_download_QrCode}
                        onCheck={this.handleDownload}
                    />
                </div>
                <div>
                    <div className="caption highEmphasis" style={{ textAlign: "center", marginBottom: "1rem" }}>{localeObj.pix_info_fromQRCode} </div>
                    <FlexView column style={{ margin: "0 1.5rem" }}>
                        <div style={{ justifyContent: "space-between" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis">{localeObj.due_date}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis">{moment(this.state.date).format("DD/MM/YYYY")}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis">{localeObj.value}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis">{"R$ "}{this.state.displayValue}</span>
                        </div>
                    </FlexView>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}} data-html2canvas-ignore="true">
                    <TimeOutPrimaryButton btn_text={localeObj.copy_code} onCheck={this.copyToClipboard} />
                    <TimeOutSecondaryButton btn_text={localeObj.share} onCheck={this.handleShare} />
                </div>
                <div id="outer" style={{ width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.snackBarOpen}>
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
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.dlsnackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

PixRecieptComponent.propTypes = {
    QrCode: PropTypes.string,
    expiryDate: PropTypes.string,
    componentName: PropTypes.string,
    pixCode: PropTypes.string,
    requiredInfo: PropTypes.shape({
      amount: PropTypes.string,
      decimal: PropTypes.string
    }),
    classes: PropTypes.object
  };

export default withStyles(styles)(PixRecieptComponent);