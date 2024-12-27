import React from "react";
import "../../../styles/main.css";
import FlexView from "react-flexview";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import moment from "moment";
import PropTypes from 'prop-types';
import PageState from "../../../Services/PageState";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

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

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import ClickWithTimeout from '../../EngageCardComponent/ClickWithTimeOut';
import constantObjects from "../../../Services/Constants";
import AndroidActionButton from "../../CommonUxComponents/AndroidActionButton";

const styles = {
    paper: {
        borderTopLeftRadius: "1.25rem",
        borderTopRightRadius: "1.25rem",
        backgroundColor: ColorPicker.newProgressBar
    }
}

const theme1 = InputThemes.snackBarTheme;
const theme2 = InputThemes.DownloadSnackbarTheme;
const TimeOutActionButton = ClickWithTimeout(AndroidActionButton);
const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";

var localeObj = {};

class BoletoRecieptComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pinExpiredSnackBarOpen: false,
            snackBarDuration: constantObjects.SHORT_SNACK_DURATION,
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
        MetricsService.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    share = () => {
        this.shareOrdownloadBoletoPDF("share");
        //Log.sDebug("User clicked Boleto QrCode Share", "BoletoRecieptComponent");
        return;
    }

    download = () => {
        this.shareOrdownloadBoletoPDF("download");
        //Log.sDebug("User clicked Boleto QrCode download", "BoletoRecieptComponent");
        return;
    }

    copyToClipboard = () => {
        androidApiCalls.copyToClipBoard(this.props.info.number);
        this.setState({
            pinExpiredSnackBarOpen: true,
            message: localeObj.copied_in_clipboard,
            snackBarDuration: constantObjects.SHORT_SNACK_DURATION
        })
    }

    shareOrdownloadBoletoPDF = (action) => {
        if (action === "download") {
            this.downloadPDFBoletoQR(this.state.pdfDocInfo)
        } else {
            let name = "boleto_deposito_" + moment().format("DDMMYYYY");
            androidApiCalls.sharePdfFile(this.state.pdfDocInfo, name);
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
                        snackBarDuration: constantObjects.SHORT_SNACK_DURATION,
                    })
                    androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, this.state.fileName);
                }
            })
            //Log.sDebug("BoletoSlip Downloaded " + !this.state.download_failed, "BoletoSlip");
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

    back = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.complete();
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
        //this.setState({ snackBarDuration: constantObjects.SHORT_SNACK_DURATION })
    }

    closedlsnackBarOpen = () => {
        this.setState({ dlsnackBarOpen: false });
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

        return (
            <div className="scroll" style={{ height: `${screenHeight - 280}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.boleto_created}
                            </div>
                            <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {localeObj.invoice_paid_boleto}
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
                                    <div style={this.style.itemStyle}>
                                        <span className="body2 mediumEmphasis">{localeObj.due_date}</span>
                                        <span className="subtitle4 highEmphasis">{this.props.info.expiryDate}</span>
                                    </div>
                                    <div style={{ margin: "1rem", textAlign: "center" }}>
                                        <span className="caption highEmphasis" >{localeObj.invoice_paid_boleto_desc}</span>
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

                    <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.copy_code} onCheck={this.copyToClipboard} />
                        <SecondaryButtonComponent btn_text={localeObj.back_home} onCheck={this.back} />
                    </FlexView>

                </div>

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>

                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.pinExpiredSnackBarOpen} autoHideDuration={this.state.snackBarDuration} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
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
                                        <CancelIcon style={{ fill: ColorPicker.darkHighEmphasis }} onClick={this.closedlsnackBarOpen} />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </MuiThemeProvider>
                    </Drawer>
                </div>
            </div >
        )
    }
}

BoletoRecieptComponent.propTypes = {
    componentName: PropTypes.string,
    complete: PropTypes.func,
    info: PropTypes.shape({
        value: PropTypes.string,
        expiryDate: PropTypes.string,
        number: PropTypes.string,
        doc: PropTypes.string
    })
};

export default withStyles(styles)(BoletoRecieptComponent);