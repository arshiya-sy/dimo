import React from 'react';
import PropTypes from "prop-types";
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

import Log from '../../../Services/Log';
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import constantObjects from "../../../Services/Constants";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import ActionButtonComponent from "../../CommonUxComponents/ActionButton";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import GetAppIcon from '@material-ui/icons/GetApp';
import MetricServices from "../../../Services/MetricsService";
import utilities from "../../../Services/NewUtilities";
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import ClickWithTimeout from '../../EngageCardComponent/ClickWithTimeOut';
import Toolbar from '@material-ui/core/Toolbar';
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';
import AlertDialog from '../../NewOnboardingComponents/AlertDialog';
import androidApiCallsService from '../../../Services/androidApiCallsService';

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

class PixGenerateQrCode extends React.Component {
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
            keys: props.requiredInfo.keys,
            loaded: false,
            description: props.requiredInfo.description,
            code: this.props.QrCode,
            displayValue: "",
            snackBarOpen: false,
            fileName: "",
            processing: false,
            isMotopayOnly: androidApiCalls.checkIfMpOnly()
        };
        this.qr = React.createRef();
        this.handleShare = this.handleShare.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.pixRecieve.generate_qr_code;
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        let amount = this.props.requiredInfo.amount ? this.props.requiredInfo.amount : "00";
        let decimal = this.props.requiredInfo.decimal ? this.props.requiredInfo.decimal : "00";
        let displaySalary = utilities.parseSalary(amount + decimal);
        this.setState({
            displayValue: displaySalary,
        })

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
        this.setState({
            snackBarOpen: false
        }, () => {
            androidApiCalls.openReceipt(this.state.fileName);
        })
    }

    getFilename = () => {
        let name = "qrcode_Pix_" + moment().format("DDMMYYYY") + ".png";
        return name;
    }

    handleDownload = () => {
        this.showProgressDialog();
        androidApiCallsService.copyToClipBoard(this.props.copyCode);
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let download_failed = false;
            try {
                html2canvas(document.body, { allowTaint: true, useCORS: true }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png').split(';base64,')[1];

                    let fileName = this.getFilename();
                    this.setState({
                        fileName: this.getDownloadedFileName()
                    }, () => {
                        androidApiCalls.saveFile(imgData, "Download", this.state.fileName).then(result => {
                            if (result) {
                                //Log.sDebug("Receipt Downloaded", localeObj.pix_download_complete)
                            } else {
                                download_failed = true;
                                //Log.sDebug("Receipt Download FAIL", localeObj.pix_receipt_download_failed, constantObjects.LOG_PROD)
                            }
                            this.setState({
                                snackBarOpen: true,
                                processing: false
                            })
                            if (!download_failed) {
                                androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, this.state.fileName ? this.state.fileName : fileName);
                            } else {
                                androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.state.fileName ? this.state.fileName : fileName);
                            }
                            return;
                        })
                    })
                    return;
                });
            } catch (error) {
                this.hideProgressDialog();
                Log.debug('Error saving file:', error);
                androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.getDownloadedFileName());
            }
        } else {
            this.hideProgressDialog();
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

    render() {
        const screenHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div className="scroll" style={{ height: `${0.7 * screenHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? "block" : "none" }}>
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
                    <div style={{ width: "100%", margin: "1.5rem 0",textAlign: "center" }} data-html2canvas-ignore="true">
                        <ActionButtonComponent icon={<GetAppIcon />}
                            btn_text={localeObj.pix_download_QrCode}
                            onCheck={this.handleDownload}
                        />
                    </div>
                    <div>
                        <div className="caption highEmphasis" style={{ textAlign: "center", marginBottom: "1rem" }}>{localeObj.pix_info_fromQRCode} </div>
                        <FlexView column style={{ margin: "0 1.5rem" }}>
                            {
                                Object.keys(this.props.requiredInfo.receiver).map((key, idx) => {
                                    return (
                                        <div key={idx} style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{key}</span>
                                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.props.requiredInfo.receiver[key]}</span>
                                        </div>
                                    )
                                })
                            }
                            <div style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                                <span className="pixTableLeftContent tableLeftStyle mediumEmphasis">{localeObj.pix_key_header}</span>
                                <span className="pixTableRightContent tableRightStyle highEmphasis">{this.state.keys.key}</span>
                            </div>
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
                    {!this.state.processing &&
                        <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}} data-html2canvas-ignore="true">
                            <TimeOutPrimaryButton btn_text={localeObj.share} onCheck={this.handleShare} />
                            <TimeOutSecondaryButton btn_text={localeObj.back_home} onCheck={this.props.close} />
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
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div>
        )
    }
}

PixGenerateQrCode.propTypes = {
    classes: PropTypes.object.isRequired,
    requiredInfo: PropTypes.object,
    QrCode: PropTypes.string,
    componentName: PropTypes.string,
    copyCode: PropTypes.string,
    close: PropTypes.func
};

export default withStyles(styles)(PixGenerateQrCode);
