import React from 'react';
import FlexView from "react-flexview";

import { Card } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import Chip from '@mui/material/Chip';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import PixIcon from "../../images/SvgUiIcons/Pix.svg";
import PayIcon from "../../images/SvgUiIcons/pay.svg";
import ContactIcon from "../../images/SvgUiIcons/contact.svg";
import DepositIcon from "../../images/SvgUiIcons/receive.svg";
import SendIcon from "../../images/SvgUiIcons/send.svg";
import CardIcon from "../../images/SvgUiIcons/card.svg";
import PortabilityIcon from "../../images/SvgUiIcons/salary_port.svg";
import FgtsIcon from "../../images/SaqueAniversario/saqueaniversario.svg";
import PhoneIcon from "../../images/SvgUiIcons/mobile.svg";
import WithdrawIcon from "../../images/SvgUiIcons/wallet.svg";
import FinancingIcon from "../../images/SvgUiIcons/financing.svg";
import TransactionsIcon from "../../images/SvgUiIcons/seeTransactions.svg";
import RewardIcon from "../../images/GamificationImages/common/reward.png";
import InsuranceIcon from "../../images/SvgUiIcons/insurance.svg";
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import ImportantDetails from "./ImportantDetails";
import AlertDialog from '../NewOnboardingComponents/AlertDialog';

import { withStyles } from "@material-ui/core/styles";
import GeneralUtilities from '../../Services/GeneralUtilities';
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants"
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import ChatBotUtils from '../NewUserProfileComponents/ChatComponents/ChatBotUtils';
import PropTypes from "prop-types";

const singleInputStyle = InputThemes.singleInputStyle;
const pageName = PageNames.allServices;
const TimeOutDiv = ClickWithTimeout('div');
const CAMERA_PERMISSION = "android.permission.CAMERA";
var localeObj = {};

class AllServicesLandingComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showATMTutorial: false,
            isOnBack: true,
            isClickable: false,
            showInsurance: false,
            blockDoubleClick: false
        }
        this.styles = {
            cardStyle: {
                height: "4rem",
                width: "20.5rem",
                borderRadius: "1.25rem",
                marginTop: "0.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: ColorPicker.surface3
            },
            cardStyleRandomKey: {
                height: "5rem",
                width: "20.5rem",
                borderRadius: "1.25rem",
                marginTop: "0.5rem",
                padding: "0.25rem 1.5rem 0.25rem",
                backgroundColor: ColorPicker.surface3
            },
            operationsNewChipStyle: {
                height: "1.2rem",
                position: "absolute",
                right: '0.625rem',
                top: '-0.25rem',
                marginLeft: 0
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName)
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.setDAStringPrefs("options", "-1");
        window.onBackPressed = () => {
            this.onBack();
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === true) {
                    if (this.state.scanForm === "Boleto") {
                        this.showProgressDialog();
                        androidApiCalls.scanBoletoCode();
                    } else if (this.state.scanForm === "atm") {
                        const showBottomTutorial = androidApiCalls.shouldShowAtmWithdrawal()
                        this.setState({
                            showATMTutorial: showBottomTutorial
                        })
                        if (showBottomTutorial === false) {
                            this.showProgressDialog();
                            androidApiCalls.scanQrCode("atm");
                        }
                    } else if (this.state.scanForm === "pix") {
                        this.showProgressDialog();
                        androidApiCalls.scanPixQR();
                    } else {
                        this.showProgressDialog();
                        androidApiCalls.scanQrCode(this.state.scanForm);
                    }
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

        window.onScanQRComplete = (response) => {
            let timeoutId = setInterval(() => {
                clearInterval(timeoutId);
                this.hideProgressDialog();
            }, 500);
            if (response) {
                if (response === "cancelled") {
                    //Log.sDebug("User cancelled scanning", "WalletLandingPageComponent");
                } else if (this.state.scanForm === "Boleto") {
                    if (response === "manual") {
                        ImportantDetails.setTransactionEntryPoint(constantObjects.boletoManual);
                        //Log.sDebug("User opted to enter boleto code manually", "WalletLandingPageComponent");
                        this.props.history.push("insertBoleto");
                    } else if (response === "switchQR") {
                        ImportantDetails.setTransactionEntryPoint(constantObjects.pixQR);
                        //Log.sDebug("User selected to scan boleto QR", "WalletLandingPageComponent");
                        this.showProgressDialog();
                        androidApiCalls.scanQrCode("QR");
                    } else if (response === "switchBarCode") {
                        //Log.sDebug("User selected to scan boleto barcode", "WalletLandingPageComponent");
                        this.showProgressDialog();
                        ImportantDetails.setTransactionEntryPoint(constantObjects.boletoScan);
                        androidApiCalls.scanBoletoCode();
                    } else {
                        if (response.includes("boleto")) {
                            //Log.sDebug("Scanned boleto successfully", "WalletLandingPageComponent");
                            ImportantDetails.setTransactionEntryPoint(constantObjects.boletoScan);
                            this.props.history.push({
                                pathname: '/boleto',
                                state: {
                                    "manual": false,
                                    "qrCodeValue": response.split(":")[1]
                                }
                            });
                        } else {
                            //Log.sDebug("Scanned invalid boleto", "WalletLandingPageComponent");
                            this.openSnackBar(localeObj.invalid_Boleto);
                        }
                    }
                } else if (this.state.scanForm === "atm") {
                    if (response.includes("atm")) {
                        let qrCodeValue = response.split(":")[1];
                        //Log.sDebug("Scanned ATM QR code successfully", "WalletLandingPageComponent");
                        Log.debug("scanned qr code value is " + qrCodeValue);
                        this.props.history.push({
                            pathname: '/atmWithdraw',
                            state: { qrCodeValue: qrCodeValue }
                        });
                    } else {
                        //Log.sDebug("Scanned Invalid ATM QR code", "WalletLandingPageComponent");
                        this.openSnackBar(localeObj.invalid_ATM_QR_token);
                    }
                }
            }
        }

        this.visibilityOfInsurance();

    }

    visibilityOfInsurance = () => {
        const deviceActivationTime = Number(androidApiCalls.getDeviceActivationDate());
        const deviceActivationDate = new Date(deviceActivationTime);
        const targetDate = new Date(deviceActivationDate.getTime());
        targetDate.setDate(deviceActivationDate.getDate() + 299);
        const currentDate = new Date();

        if (currentDate.getTime() <= targetDate.getTime()) {
            this.setState({ showInsurance: true });
        } else {
            this.setState({ showInsurance: false });
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }

    componentWillUnmount() {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    handleClose = () => {
        this.setState({ "bottomSheet": false })
        return;
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
        if (this.state.showATMTutorial) {
            this.setState({
                showATMTutorial: false
            });
            return;
        } else if (this.state.processing) {
            this.hideProgressDialog();
        } else if (this.state.isOnBack) {
            this.setState({ isOnBack: false });
            MetricServices.onPageTransitionStop(pageName, PageState.back);
            GeneralUtilities.setBackPressTracking("");
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" })
        }
    }

    closeSnackBar = () => {
        this.setState({ showSnackBar: false })
    }

    openSnackBar = (message) => {
        this.setState({
            showSnackBar: true,
            snackBarDescription: message
        });
    }

    imageClick = (action) => {
        if(!this.state.blockDoubleClick) {
            this.setState({ blockDoubleClick: true } ,
                () => {
                    setTimeout(() => this.setState({ blockDoubleClick: false }), 1000);
            });
        } else {
            return "";
        }
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        let capitalizedAction = "";
        if (action !== undefined) {
            capitalizedAction = action.toUpperCase();
        }
        let event = {
            eventType: constantObjects.walletPageEvent + capitalizedAction,
            page_name: PageNames.allServicesPage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        GeneralUtilities.setBackPressTracking("AllServices");
        if (action === "Boleto" || action === "atm") {
            this.setState({ scanForm: action });
            document.activeElement.blur();
            if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
                if (action === "Boleto") {
                    this.showProgressDialog();
                    androidApiCalls.scanBoletoCode();
                } else {
                    const showBottomTutorial = androidApiCalls.shouldShowAtmWithdrawal()
                    this.setState({
                        showATMTutorial: showBottomTutorial
                    })
                    if (showBottomTutorial === false) {
                        this.showProgressDialog();
                        androidApiCalls.scanQrCode(action);
                    }
                }
            } else {
                androidApiCalls.requestPermission(CAMERA_PERMISSION);
            }
        } else if (action === "Transfer") {
            this.props.history.push({
                pathname: "/sendComponent",
                "fromComponent": "AllServices",
                "from": "AllServices"
            });
        } else if (action === "Deposit") {
            this.props.history.push({
                pathname: "/depositLandingComponent",
                "fromComponent": "AllServices"
            });
        } else if (action === "Recharge") {
            this.props.history.push({
                pathname: "/cellularRecharge",
                "fromComponent": "AllServices"
            });
        } else if (action === "Pix") {
            this.props.history.push({
                pathname: "/pixLandingComponent",
                "newOnboarding": this.props.location.newOnboarding,
                "fromComponent": "AllServices"
            });
        } else if (action === "PixScan") {
            this.scan();
        } else if (action === "card") {
            this.props.history.push({
                pathname: "/digitalCard",
                "fromComponent": "AllServices"
            });
        } else if (action === "Contact") {
            this.props.history.push({
                pathname: "/contacts",
                "fromComponent": "AllServices"
            });
        } else if (action === "fgts") {
            let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY);
            if (valuePropsEnable === "4") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "1");
            }
            this.props.history.push({
                pathname: "/fgtsHome",
                "fromComponent": "AllServices",
                "from": "home"
            });
        } else if (action === "Salary_Portability") {
            this.props.history.push({
                pathname: "/salaryPortability",
                "fromComponent": "AllServices"
            });
        } else if (action === "Smart_Financing") {
            this.props.history.push({
                pathname: "/financing"
            });
        } else if (action === "rewards") {
            const gamifyOnboardingCompleted = androidApiCalls.getDAStringPrefs(GeneralUtilities.GAMIFICATION_KEY);
            if (gamifyOnboardingCompleted === 'enable') {
                this.props.history.push("/rewards")
            } else {
                this.props.history.push("/gamificationOnboarding");
            }
        } else if (action === "CreditCard") {
            /* this.props.history.push({
                 pathname: "/creditCardHomePage"
             });*/
            this.props.history.push({
                pathname: '/creditCard',
                state: {
                    "creditStatus": {},
                    "entryPoint": "allServices"
                }
            });
        } else if (action === "Insurance") {
            this.props.history.push("/insurance");
        } else if (action === "see_transactions") {
            this.props.history.push({
                pathname: '/newTransactionHistory',
                "fromComponent": "AllServices"
            })
        }
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    getLeftMargin = () => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN":
            case "NEXT_LARGE_SCREEN":
            case "LARGE_SCREEN":
                return "0.5rem";
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN":
                return "2rem";
            default: return "1rem";
        }
    }

    getBoxHeight = (calculatedHeight) => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return calculatedHeight * 1.5;
            case "NEXT_LARGE_SCREEN": return calculatedHeight * 1.3;
            case "LARGE_SCREEN": return calculatedHeight * 1.2;
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN":
                return calculatedHeight;
            default: return calculatedHeight;
        }
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return;
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.atm_bottomcard_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right" });
    }

    render() {
        const handleClose = () => {
            this.setState({ showATMTutorial: false })
            return;
        }

        const handleContinue = () => {
            this.setState({ showATMTutorial: false });
            androidApiCalls.setShouldShowAtmWithdrawal();
            this.showProgressDialog();
            androidApiCalls.scanQrCode("atm");
            return;
        }
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const scrollHeight = screenHeight * 0.85;
        const boxWidth = (screenWidth * 0.84) / 2;
        const boxHeight = screenHeight < 780 ? this.getBoxHeight(screenHeight * 0.085) : this.getBoxHeight(screenHeight * 0.068);

        const allServicesList = [
            {
                text: localeObj.pix,
                action: "Pix",
                icon: <img src={PixIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.pay,
                action: "Boleto",
                icon: <img src={PayIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.deposit,
                action: "Deposit",
                icon: <img src={DepositIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.send,
                action: "Transfer",
                icon: <img src={SendIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.credit_card,
                action: 'CreditCard',
                icon: <img src={CardIcon} style={{ width: "1.5rem" }} alt="" />,
                hasNewOffer: true,
                disable: !constantObjects.featureEnabler.CREDIT_CARD_ENABLED
            },
            {
                text: localeObj.rewards_screen,
                action: 'rewards',
                hasNewChip: true,
                icon: <img src={RewardIcon} style={{ width: "1.5rem" }} alt="" />,
                disable: constantObjects.featureEnabler.DISABLE_GAMIFICATION
            },
            {
                text: localeObj.phone_recharge,
                action: "Recharge",
                icon: <img src={PhoneIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.fgts_saque,
                action: 'fgts',
                icon: <img src={FgtsIcon} style={{ width: "1.5rem" }} alt="" />,
                hasNewChip: true,
                isPopular: true
            },
            {
                text: localeObj.account_card,
                action: "card",
                icon: <img src={CardIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.contact_plural,
                action: "Contact",
                icon: <img src={ContactIcon} style={{ width: "1.5rem" }} alt="" />
            },

            {
                text: localeObj.atm_tool_header,
                action: 'atm',
                icon: <img src={WithdrawIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.salary_portability,
                action: 'Salary_Portability',
                icon: <img src={PortabilityIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.smart_financing,
                action: 'Smart_Financing',
                icon: <img src={FinancingIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.insurance_smartphone,
                action: 'Insurance',
                icon: <img src={InsuranceIcon} style={{ width: "1.5rem" }} alt="" />
            },
            {
                text: localeObj.see_transactions,
                action: 'see_transactions',
                icon: <img src={TransactionsIcon} style={{ width: "1.5rem" }} alt="" />
            }
        ];

        return (
            <div style={{ height: "100%", overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.all_services} onBack={this.onBack} action="none" />
                <div className='scroll' style={{ height: `${scrollHeight}px`, overflowY: 'auto', overflowX: "hidden" }}>
                    <Grid container spacing={1}>
                        {
                            allServicesList.map((opt, key) => (
                                (opt.action === "Insurance" && !this.state.showInsurance) ?
                                    null:
                                    <Grid key={key} align="center" item xs={6} md={6} style={{ display: (!opt.disable ? 'block' : 'none')}} >
                                        <TimeOutDiv onClick={() => this.imageClick(opt.action)} style={{ position: "relative" }}>
                                        {opt.hasNewChip && <Chip className="label2" style={{...this.styles.operationsNewChipStyle, backgroundColor: opt.isPopular ? ColorPicker.accent: ColorPicker.success}} label={opt.isPopular ? localeObj.popular : localeObj.new} />}
                                        {opt.hasNewOffer && <Chip className="label2" style={{ ...this.styles.operationsNewChipStyle, backgroundColor: opt.isPopular ? ColorPicker.accent : ColorPicker.success, maxWidth: `${boxWidth}px` }} label={localeObj.new_credit_card_offer} />}
                                            <Card align="center" style={{
                                                height: `${boxHeight}px`,
                                                width: `${boxWidth}px`,
                                                backgroundColor: ColorPicker.newProgressBar,
                                                borderRadius: "1.25rem",
                                                marginBottom: "0.5rem",
                                                maxWidth: `${boxWidth}px`,
                                                padding:'0'
                                            }} elevation="0">
                                                <FlexView style={{
                                                    height: `${boxHeight}px`
                                                }}>
                                                    <div
                                                        style={{
                                                            height: `${boxHeight}px`,
                                                            width: `${0.2 * boxWidth}px`,
                                                            maxWidth: `${0.2 * boxWidth}px`,
                                                            display: 'flex',
                                                            textAlign: 'center',
                                                            marginLeft: this.getLeftMargin(),
                                                            marginTop: 'auto',
                                                            marginBottom: 'auto',
                                                            flex: 1,
                                                            alignItems: 'center'
                                                        }}>
                                                        {opt.icon}
                                                    </div>
                                                    <span className="caption highEmphasis" style={{
                                                        height: `${boxHeight}px`,
                                                        width: `${0.8 * boxWidth}px`,
                                                        maxWidth: `${0.8 * boxWidth}px`,
                                                        display: 'flex',
                                                        textAlign: 'left',
                                                        marginRight: '2rem',
                                                        marginTop: 'auto',
                                                        marginBottom: 'auto',
                                                        flex: 1,
                                                        alignItems: 'center'
                                                    }}>{opt.text}</span>
                                                </FlexView>
                                            </Card>
                                        </TimeOutDiv>
                                    </Grid>
                            ))
                        }
                    </Grid>
                </div>
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />}
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.showATMTutorial}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.atm_sheet_header}
                                </div>
                                <div className="body2 mediumEmphasis"
                                    style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.atm_sheet_description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.motopay_continue}
                                onCheck={handleContinue} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }}
                                onClick={handleClose}>
                                {localeObj.not_now}
                            </div>
                            <div className="body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}>
                                {localeObj.get_help_chatbot}
                                <span className="body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.goToChatbot}>
                                    {localeObj.chatbot_help}
                                </span>
                            </div>
                        </div>
                    </Drawer>
                </div>
            </div>
        );
    }
}

AllServicesLandingComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}
export default withStyles(singleInputStyle)(AllServicesLandingComponent);
