import React from "react";
import FlexView from "react-flexview";

import InputThemes from "../../Themes/inputThemes";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import PropTypes from "prop-types";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import httpRequest from "../../Services/httpRequest";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import NewUtilities from "../../Services/NewUtilities";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import GeneralUtilities from "../../Services/GeneralUtilities";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import PixOnboarding from "../PIXComponent/PixOnboarding/PixOnboardingMain";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import PixCopyPasteDrawerComponent from "../PIXComponent/PixQRCopyPasteComponents/PixCopyPasteDrawerComponent";
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import SendIconDark from '../../images/DarkThemeImages/send.svg';
import ScanIconDark from '../../images/DarkThemeImages/scan.svg';
import ReceiveIconDark from '../../images/DarkThemeImages/receive.svg';
import PasteIconDark from '../../images/DarkThemeImages/contentCopy.svg';
import KeyIconDark from '../../images/DarkThemeImages/mykeys.svg';
import TransactionIconDark from '../../images/DarkThemeImages/pixtransactions.svg';
import MyLimits from '../../images/DarkThemeImages/mylimits.svg';
import AlertDialog from "../NewOnboardingComponents/AlertDialog";
import SimpleIcon from "../../images/SpotIllustrations/PixWith1.png";
import LeaveIcon from "../../images/SpotIllustrations/PixWith2.png";
import SafeIcon from "../../images/SpotIllustrations/PixWith3.png";

import { Card } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Log from "../../Services/Log";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import constantObjects from "../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.pixLandingTheme;
const styles = InputThemes.singleInputStyle;
const pageName = PageNames.pixLandingPage;
const CAMERA_PERMISSION = "android.permission.CAMERA";
const TimeOutDiv = ClickWithTimeout('div');
var localeObj = {};

class PIXHomePageComponent extends React.Component {

    constructor(props) {
        super(props);
        this.componentName = PageNames.pixLandingPage;
        this.state = {
            bottom: false,
            myKeys: [],
            snackBarOpen: false,
            showOnboarding: this.props.location.newOnboarding || false,
            subDeepLink: false,
            isOnBack: true,
            pixReceiveCreditCard: false,
            blockDoubleClick: false,
            blockDoubleClickForAllOperations: false
        };
        this.styles = {
            gridItem: {
                width: "9rem",
                marginTop: "2rem"
            },
            imgStyle: {
                height: '2em',
                width: '2em',
                fill: ColorPicker.regularAccent,
                justifySelf: 'center',
                alignSelf: 'center',
            },
            imgStyleDark: {
                height: '1.125rem',
                width: '1.25rem',
                fill: ColorPicker.regularAccentDarkTheme,
                justifySelf: 'center',
                alignSelf: 'center',
            },
            imgStylePasteScreen: {
                height: '1.375rem',
                width: '1.188rem',
                fill: ColorPicker.regularAccentDarkTheme,
                justifySelf: 'center',
                alignSelf: 'center',
            },
            linkStyle: {
                height: '3em',
                fill: ColorPicker.regularAccent,
                justifySelf: 'center',
                alignSelf: 'center',
                marginBottom: "0.2rem"
            },
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                justifySelf: 'center',
                alignSelf: 'center'
            },
            listStyleSelect: {
                margin: "1rem 1.5rem",
                display: "flex",
                alignItems: 'center',
            },
            imgStyle1: {
                height: "3rem",
                marginBottom: "4rem"
            },
            imgStyle2: {
                height: "3rem",
                marginBottom: "2rem"
            },
            imgStyle3: {
                height: "3rem",
                marginBottom: "2rem"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName);
    }

    componentDidMount() {
       
        document.body.style.overflowY = "hidden";
        this.deepLinkCheck().then(() => { });
        androidApiCalls.enablePullToRefresh(false);
        document.body.style.overflowY = "scroll";
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }

        if (!!this.props.location.state && !!this.props.location.state.showSnackBar && this.props.location.state.showSnackBar !== "") {
            this.openSnackBar(this.props.location.state.showSnackBar)
        }
        window.onPIXScanQRComplete = (response) => {
            this.updateQrCodeInfo(response);
        }
        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === true) {
                    androidApiCalls.scanPixQR();
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
        let fromRegisterPixKey = ImportantDetails.fromRegisterPixKey;
        if(Object.keys(ImportantDetails.pixKeysResponse).length === 0 || fromRegisterPixKey) {
            this.getAllPixKeys();
            ImportantDetails.fromRegisterPixKey = false;
        }
        if (this.props.location && this.props.location.qrCodeValue) {
            this.updateQrCodeInfo(this.props.location.qrCodeValue);
        }

        if (this.props.history.location.fromPixWithdraw) {
            this.openScanner();
        }
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }

    deepLinkCheck = async () => {
        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            let action = this.props.location.additionalInfo["pixActions"];
            let pixReceiveCreditCard = this.props.location.additionalInfo["entryPoint"] === "pixReceiveCreditCard";
            this.setState({
                pixReceiveCreditCard: pixReceiveCreditCard
            })
            if (action !== "" && action !== undefined) {
                await this.setState({ subDeepLink: true });
                this.imageClick(action)
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    handleClose = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.setState({ bottom: false })
        if (this.props.location && this.props.location.action
            && this.props.location.action === "pix_receive") {
            this.props.history.replace("/depositLandingComponent");
        }
        return;
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

    registerKey = () => {
        this.setState({ bottom: false })
        this.props.history.replace("/registerNewKeyComponent")
        //Log.sDebug("clicked register key", "pix_landing_page");
    }

    updateQrCodeInfo = (response) => {
        if (response === "cancelled") {
            MetricServices.onPageTransitionStop(pageName, PageState.cancel);
            if (GeneralUtilities.getBackPressTracking() === "AllServices") {
                GeneralUtilities.setBackPressTracking("");
                this.props.history.replace({ pathname: "/allServices", transition: "right" });
            } else if (this.props.location && this.props.location.from
                && this.props.location.from === "landingPage") {
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        } else if (response === "manual_paste") {
            androidApiCalls.enableCopyPaste();
            this.setState({ pasteQRdrawer: true })
        } else if (response === "key_selected") {
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            let launchUrl = "/pixLandingComponent";
            if (!!this.props.location && !!this.props.location.launchSource) {
                launchUrl = this.props.location.launchSource
            }
            this.props.history.replace({
                pathname: "/pixSendComponent",
                launchUrl: launchUrl
            })
        } else {
            this.handleQrData(response);
        }
    }

    handleQrData = (code, from = "pixQr") => {
        if (code.toLowerCase().includes("br.gov.bcb.pix")) {
            let qrCodeValue = code.split(":")[1];
            qrCodeValue = qrCodeValue ? qrCodeValue : code // Entry from other than camera which might not have pix string.
            // scan can be launch from landing page too, in that case we have to redirect to landing page when there is invalid qr or error.
            // So send parent launch page.
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            let launchUrl = "/pixLandingComponent"
            if (!!this.props.location && !!this.props.location.launchSource) {
                launchUrl = this.props.location.launchSource
            }
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            this.props.history.replace({
                pathname: "/pixQrCopyPasteComponent",
                state: qrCodeValue,
                launchUrl: launchUrl,
                from: this.props.history.location.from
            })
        } else if (code) {
            let message = localeObj.invalid_QR_token
            if (from === "drawer") {
                message = localeObj.invalid_pix_link
            }
            this.openSnackBar(message);

            if (this.props.location && this.props.location.from
                && this.props.location.from === "landingPage") {
                MetricServices.onPageTransitionStop(pageName, PageState.error);
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right", message: message, from: "pixlanding" });
            }
        }
    }

    handleNext = (code) => {
        androidApiCalls.disableCopyPaste();
        this.setState({ pasteQRdrawer: false })
        this.handleQrData(code, "drawer");
        ImportantDetails.setTransactionEntryPoint(constantObjects.pixQRPaste);
    }

    handleOpenCloseCopyPaste = (openStatus) => {
        if (openStatus) {
            androidApiCalls.enableCopyPaste();
        } else {
            androidApiCalls.disableCopyPaste();
            if (this.props.location && this.props.location.from
                && this.props.location.from === "landingPage") {
                MetricServices.onPageTransitionStop(pageName, PageState.close);
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        }
        this.setState({ pasteQRdrawer: openStatus })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            if (this.state.pasteQRdrawer) {
                this.setState({ pasteQRdrawer: false })
                if (this.props.location && this.props.location.from && this.props.location.from === "landingPage") {
                    MetricServices.onPageTransitionStop(pageName, PageState.back);
                    this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                }
            }else if(this.state.bottom){
                this.setState({
                    bottom: false
                });
            } else if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
                this.getBalanceAndMovetoMain();
            } else if (this.state.isOnBack) {
                this.setState({ isOnBack: false });
                MetricServices.onPageTransitionStop(pageName, PageState.back);
                GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
            }
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(this.componentName).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".")
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1])
                        this.props.history.replace({ pathname: "/newTransactionHistory", transition: "right", balanceData: { "balance": balance, "decimal": decimal } });
                    }
                } else {
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_communication_issue
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_technical_issue
                        })
                    }
                }
            });
    }

    onHandleOnboardingAction = (action) => {
        //Log.sDebug("onboarding action chosen by user " + action, "pix_landing_page");
        androidApiCalls.setShowPixOnboarding(false);
        switch (action) {
            case "cancel":
            case "maybeLater":
                this.setState({
                    showOnboarding: false
                });
                break;
            case "register":
                this.setState({
                    showOnboarding: false
                });
                this.props.history.replace({ pathname: "/registerNewKeyComponent", from: "pixOnboarding" });
                break;
            default:
                break;
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

    getAllPixKeys() {
        this.showProgressDialog();
        ArbiApiService.getAllPixKeys(this.componentName).then(response => {
            this.hideProgressDialog();
            if(response === null || response === undefined || response.length === 0)
                ImportantDetails.pixKeysResponse = {};
            else
                ImportantDetails.pixKeysResponse = response;
        });
    }

    openScanner = () => {
        if (this.state.pageState === "first_access") {
            this.setState({ pageState: "" })
        }
        if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
            ImportantDetails.setTransactionEntryPoint(constantObjects.pixQR);
            androidApiCalls.scanPixQR();
        } else {
            androidApiCalls.requestPermission(CAMERA_PERMISSION);
        }
    }

    imageClick = (action) => {
        if(!this.state.blockDoubleClickForAllOperations) {
            this.setState({ blockDoubleClickForAllOperations: true } ,
                () => {
                    setTimeout(() => this.setState({ blockDoubleClickForAllOperations: false }), 1000);
            });
        } else {
            return "";
        }

        //Log.sDebug("clicked " + action, this.componentName);
        switch (action) {
            case "pix_key":
                if (!this.state.blockDoubleClick) {
                    this.setState({ blockDoubleClick: true });
                    setTimeout(() => this.setState({ blockDoubleClick: false }), 5000);
                    MetricServices.onPageTransitionStop(pageName, PageState.close);
                    this.props.history.replace("/myPixKeysComponent");
                }
                break;
            case "pix_send":
                MetricServices.onPageTransitionStop(pageName, PageState.close);
                ImportantDetails.setTransactionEntryPoint(constantObjects.pixSend);
                this.props.history.replace({ pathname: '/pixSendComponent', from: "pix_page", subDeepLink: this.state.subDeepLink });
                break;
            case "pix_scan":
                MetricServices.onPageTransitionStop(pageName, PageState.close);
                if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
                    ImportantDetails.setTransactionEntryPoint(constantObjects.pixQR);
                    androidApiCalls.scanPixQR();
                } else {
                    androidApiCalls.requestPermission(CAMERA_PERMISSION);
                }
                break;
            case "pix_receive": {
                let response = {};
                if (ImportantDetails.pixKeysResponse === null ||
                    ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey
                    || Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
                    this.showProgressDialog();
                    ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                        this.hideProgressDialog();
                        response = pixResponse;
                        ImportantDetails.pixKeysResponse = pixResponse;
                        ImportantDetails.fromRegisterPixKey = false;
                    });
                } else {
                    response = ImportantDetails.pixKeysResponse;
                }
                if (response.success) {
                    let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
                    if (responseHandler.success) {
                        const pixKeys = responseHandler.pixKeys;
                        if (pixKeys.length === 0) {
                            this.setState({
                                bottom: true
                            });
                        } else {
                            Log.debug("registered keys are " + pixKeys, "pix_landing_page");
                            MetricServices.onPageTransitionStop(pageName, PageState.close);
                            ImportantDetails.setTransactionEntryPoint(constantObjects.pixReceive);
                            this.props.history.push({ pathname: "/pixReceive", additionalInfo: this.props.location.additionalInfo, subDeepLink: this.state.subDeepLink });
                        }
                    } else {
                        Log.sDebug("there is some error " + JSON.stringify(response), pageName, constantObjects.LOG_PROD);
                    }
                } else {
                    Log.sDebug("there is some error " + JSON.stringify(response), pageName, constantObjects.LOG_PROD);
                }
                break;
            }
            case "first_access":{
                this.showProgressDialog();
                let responseTwo = {};
                if (ImportantDetails.pixKeysResponse === null ||
                    ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey
                    || Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
                    ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                        responseTwo = pixResponse;
                        ImportantDetails.pixKeysResponse = pixResponse;
                        ImportantDetails.fromRegisterPixKey = false;
                    });
                } else {
                    responseTwo = ImportantDetails.pixKeysResponse;
                }
                if (responseTwo.success) {
                    let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(responseTwo.result);
                    if (responseHandler.success) {
                        if (responseHandler.pixKeys.length === 0) {
                            MetricServices.onPageTransitionStop(pageName, PageState.close);
                            this.setState({ showOnboarding: true })
                        }
                    }
                    this.hideProgressDialog();
                }
                break;
            }
            case "pix_paste_link":
                this.handleOpenCloseCopyPaste(true);
                break;
            case "pix_transaction":
                MetricServices.onPageTransitionStop(pageName, PageState.close);
                this.props.history.replace("/pixTransactionHistory");
                break;
            case "pix_limit":
                this.props.history.push("/pixLimits");
                break;
            case "pix_withdraw":
                let valuePropsEnable = androidApiCalls.getDAStringPrefs("PWFirst_Access");
                if (valuePropsEnable !== "1") {
                    this.setState({
                        pageState: "first_access"
                    })
                    androidApiCalls.setDAStringPrefs("PWFirst_Access", "1");
                }
                else {
                    this.openScanner();
                }
                break;
            default:
                break;
        }
    }

    render() {
        const { classes } = this.props;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const cardDimension = (screenWidth - 30) / 2;
        const pixIconContents = [
            {
                icon: <img src={SendIconDark} style={this.styles.imgStyleDark} alt="" />,
                text: localeObj.send,
                action: "pix_send"
            },
            {
                icon: <img src={ScanIconDark} style={this.styles.imgStyleDark} alt=""/>,
                text: localeObj.scan,
                action: "pix_scan"
            },
            {
                icon: <img src={ReceiveIconDark} style={this.styles.imgStyleDark} alt=""/>,
                text: localeObj.receive,
                action: "pix_receive"
            },
            {
                icon: <img src={PasteIconDark} style={this.styles.imgStylePasteScreen} alt=""/>,
                text: localeObj.paste_link,
                action: "pix_paste_link"
            },
        ];

        const depositContents = [
            {
                heading: localeObj.pix_withdraw_header_2,
                text: localeObj.pix_withdraw_desc_2,
                icon: <img alt="" src={SimpleIcon} style={this.styles.imgStyle1} />
            },
            {
                heading: localeObj.pix_withdraw_header_3,
                text: localeObj.pix_withdraw_desc_3,
                icon: <img alt="" src={LeaveIcon} style={this.styles.imgStyle2} />
            },
            {
                heading: localeObj.pix_withdraw_header_4,
                text: localeObj.pix_withdraw_desc_4,
                icon: <img alt="" src={SafeIcon} style={this.styles.imgStyle3} />
            }
        ];

        const onHelp = () => {
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            GeneralUtilities.openHelpSection();
            //Log.sDebug("clicked help", this.componentName);
        }

        return (
            <div style={{textAlign: "center"}}>
                <div style={{ textAlign: "center", display: (this.state.showOnboarding ? "block" : 'none') }}>
                    {this.state.showOnboarding && <PixOnboarding handleOnboarding={this.onHandleOnboardingAction} />}
                </div>
                <div style={{ display: (!!this.state.pasteQRdrawer && !this.state.showOnboarding ? 'block' : 'none') }}>
                    <PixCopyPasteDrawerComponent open={!!this.state.pasteQRdrawer} next={this.handleNext} handleOpenClose={this.handleOpenCloseCopyPaste} />
                </div>
                {this.state.pageState === "first_access" &&
                    <div style={{ display: (this.state.pageState === "first_access" ? "block" : "none") }}>
                        <ButtonAppBar header={localeObj.pix_withdraw} onBack={this.onBack} action="none" />
                        <div className="scroll" style={{ height: `${screenHeight*0.7}px`, overflowY: "auto", display: !this.state.processing ? "block" : "none" }}>
                            <div style={InputThemes.initialMarginStyle}>
                                <FlexView column>
                                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                        {localeObj.pix_withdraw_header_1}
                                    </div>
                                    <div className="body2 highEmphasis scroll" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                        {localeObj.pix_withdraw_desc_1}
                                    </div>
                                </FlexView>
                            </div>
                            <div align="center" style={{ width: "100%" }}>
                                <MuiThemeProvider theme={InputThemes.SalaryWithDrawTheme}>
                                    <Grid container spacing={0}>
                                        {
                                            depositContents.map((keys) => (
                                                <div align="center" style={this.styles.cardStyle}>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <div style={this.styles.circle}>{keys.icon}</div>
                                                        </ListItemIcon>
                                                        <ListItemText>
                                                            <div align="left" style={{ marginLeft: "1rem" }}>
                                                                <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                                <div className="body2 mediumEmphasis" style={{ marginTop: "0.5rem" }}>{keys.text}</div>
                                                            </div>
                                                        </ListItemText>
                                                    </ListItem>
                                                </div>
                                            ))
                                        }
                                    </Grid>
                                </MuiThemeProvider>
                            </div>
                            <div align="center" style={InputThemes.bottomButtonStyle}>
                                <PrimaryButtonComponent btn_text={localeObj.pix_got_it} onCheck={this.openScanner} />
                            </div>
                        </div>
                    </div>
                }
                {this.state.pageState !== "first_access" &&
                    <div style={{ display: (!this.state.showOnboarding ? 'block' : 'none') }}>
                    <ButtonAppBar header={this.state.pixReceiveCreditCard ? localeObj.new_dimo_credit_investment : localeObj.pix} onBack={this.onBack} onHelp={onHelp} action={this.state.pixReceiveCreditCard ? "none" : "help"} />

                    <div style={{ display: (!!this.state.processing && !this.state.showOnboarding ? 'none' : 'block') }}>
                        <div style={{ margin: "1rem 1.5rem 1rem", textAlign: "left" }}>
                            <span className="button1 highEmphasis">
                                {localeObj.pix_operation}
                            </span>
                        </div>
                        <div style={{ margin: "0.5rem 0.5rem", textAlign: "center" }}>
                            <MuiThemeProvider theme={theme1}>
                                <Grid container>
                                    {
                                        pixIconContents.map((opt, key) => (
                                            <Grid key={key} align="center" item xs={6} style={{ marginBottom: "0.5rem" }}>
                                                <TimeOutDiv onClick={() => this.imageClick(opt.action)}>
                                                    <Card align="center" elevation="0"
                                                        style={{ borderRadius: "1rem", backgroundColor: ColorPicker.surface3, width: `${cardDimension}px`, height: "6rem", display: "table-cell", verticalAlign: "middle", padding: "0" }}>
                                                        <div>
                                                            <span style={{ width: "1.25rem", height: "1.125rem", marginBottom: "0.5rem", textAlign: "center" }}>{opt.icon}</span>
                                                            <div className="caption highEmphasis" style={{ marginTop: "0.5rem" }}>{opt.text}</div>
                                                        </div>
                                                    </Card>
                                                </TimeOutDiv>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </MuiThemeProvider>
                        </div>
                        <div style={{ margin: "1rem 1.5rem", textAlign: "left" }}>
                            <span className="button1 highEmphasis">
                                {localeObj.more}
                            </span>
                        </div>
                        <div style={{...this.styles.listStyleSelect, textAlign: "center"}} onClick={() => this.imageClick("pix_key")}>
                            <div style={this.styles.imgStyleMore} >
                                <img src={KeyIconDark} alt="" className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", marginTop: "0.75rem", color: "#FFB684" }} />
                                </div>
                                <div align="center" className="body2 highEmphasis" style={{ marginLeft: "1rem" }}>
                                    <span>{localeObj.my_key}</span>
                                </div>
                            </div>
                            <TimeOutDiv onClick={() => this.imageClick("pix_transaction")}>
                                <div align="center" style={this.styles.listStyleSelect}>
                                    <div style={this.styles.imgStyleMore} >
                                        <img alt="" src={TransactionIconDark} className="regularAccent" style={{ width: "0.875rem", height: "1.125rem", marginTop: "1rem", color: "#FFB684" }} />
                                    </div>
                                    <div align="center" className="body2 highEmphasis" style={{ marginLeft: "1rem" }}>
                                        <span>{localeObj.pix_transaction}</span>
                                    </div>
                                </div>
                            </TimeOutDiv>
                            <div align="center" style={this.styles.listStyleSelect} onClick={() => this.imageClick("pix_limit")}>
                                <div style={this.styles.imgStyleMore} >
                                    <img alt="" src={MyLimits} className="regularAccent" style={{ width: "1.063rem", height: "1.125rem", marginTop: "1rem", color: "#FFB684" }} />
                                </div>
                                <div align="center" className="body2 highEmphasis" style={{ marginLeft: "1rem" }}>
                                    <span>{localeObj.my_limits}</span>
                                </div>
                            </div>
                            <div align="center" style={this.styles.listStyleSelect}
                                onClick={() => {
                                    this.imageClick("pix_withdraw")
                                }}>
                                <div style={this.styles.imgStyleMore} >
                                    <img alt="" src={SafeIcon} className="regularAccent" style={{ width: "3rem", height: "3rem", marginTop: "0rem", color: "#FFB684" }} />
                                </div>
                                <div align="center" className="body2 highEmphasis" style={{ marginLeft: "1rem" }}>
                                    <span>{localeObj.pix_withdraw}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottom}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.no_key_title}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.no_key_text}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem" , textAlign: "center"}}>
                            <PrimaryButtonComponent btn_text={localeObj.register_new_key} onCheck={this.registerKey} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleClose} />
                        </div>
                    </Drawer>
                </div>
            </div>
        );
    }
}
export default withStyles(styles)(PIXHomePageComponent)

PIXHomePageComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};