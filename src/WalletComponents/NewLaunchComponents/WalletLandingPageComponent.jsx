import React from "react";
import FlexView from "react-flexview";

import Fab from '@material-ui/core/Fab';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import Chip from '@mui/material/Chip';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import "../../styles/lazyLoad.css";
import "../../styles/caroucel.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import LoadingGrid from "../EngageCardComponent/LoadingGrid";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';

import apiService from "../../Services/apiService";
import DomRenderComponent from '../EngageCardComponent/DomRenderComponent';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import MobileStepper from '@material-ui/core/MobileStepper';
import { Card } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, createTheme, withStyles } from "@material-ui/core/styles";

import Paper from '@material-ui/core/Paper';
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import Account from '@material-ui/icons/AccountCircleRounded';
import NotVisibleIcon from '@material-ui/icons/VisibilityOffRounded';
import VisibleIcon from '@material-ui/icons/VisibilityRounded';
import HelpIcon from '@material-ui/icons/Help';
import RefreshIcon from '@material-ui/icons/Autorenew';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@material-ui/core/CircularProgress';

import RewardIcon from "../../images/GamificationImages/common/reward.png";
import PixIcon from "../../images/SvgUiIcons/Pix.svg";
import QrIcon from "../../images/SvgUiIcons/QR code FAB.svg";
import PayIcon from "../../images/SvgUiIcons/pay.svg";
import DepositIcon from "../../images/SvgUiIcons/receive.svg";
import SendIcon from "../../images/SvgUiIcons/send.svg";
import CardIcon from "../../images/SvgUiIcons/card.svg";
import AddIcon from '../../images/SvgUiIcons/allServicesIcon.png';
import PhoneIcon from "../../images/SvgUiIcons/mobile.svg";
import engage_pix from "../../images/LandingPageBanners/Banner PIX with copy.png";
import engage_deposit from "../../images/LandingPageBanners/Banner email with copy.png";
import ScratchCardWrapper from "../ScratchCardComponent/ScratchCardWrapper";
import { AuthStateContext } from "../../ContextProviders/AuthProvider";
import ImportantDetails from "./ImportantDetails";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";
import GeneralUtilities from "../../Services/GeneralUtilities";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import { PopupModalHocManger } from "../EngageCardComponent/PopupModalHoc";
import CustomAlertDialogs from "../EngageCardComponent/CustomAlertDialogs";
import Utils from '../EngageCardComponent/Utils';
import DBService from "../../Services/DBService";
import { CUSTOM_BRUSH_PRESET } from "../ScratchCardComponent/ScratchCardCanvas";
import ChatIcon from '@material-ui/icons/Chat';
import ChatBotUtils from "../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import FgtsIcon from "../../images/SaqueAniversario/saqueaniversario.svg";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";

import InstantDialogComponent from "../GamificationComponent/RewardComponents/InstantDialogComponent";
import GamificationService from "../../Services/Gamification/GamificationService";
import GeneralAPIs from "../../Services/GeneralAPIs";
import NewUtilities from "../../Services/NewUtilities";
import PropTypes from "prop-types";
import moment from "moment";

const CAMERA_PERMISSION = "android.permission.CAMERA";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const TimeOutDiv = ClickWithTimeout('div');
const TimeOutSpan = ClickWithTimeout('span');
const pageName = PageNames.pixLandingPage;
var localeObj = {};

const snackBarTheme = createTheme({
    overrides: {
        MuiAlert: {
            root: {
                backgroundColor: ColorPicker.newProgressBar,
                padding: "1rem",
                borderRadius: "0.5rem",
                margin: "1rem",
            },
            message: {
                color: ColorPicker.darkHighEmphasis,
                padding: "0 0.5rem"
            },
            filledSuccess: {
                backgroundColor: ColorPicker.newProgressBar
            }
        }
    }
})
const theme1 = createTheme({
    overrides: {
        MuiGrid: {
            item: {
                boxSizing: "none"
            }
        },
        MuiPaper: {
            elevation1: {
                boxShadow: "none"
            }
        },
        MuiMobileStepper: {
            dotActive: {
                backgroundColor: ColorPicker.darkMediumEmphasis,
            },
            dot: {
                backgroundColor: ColorPicker.newProgressBar
            },
            root: {
                backgroundColor: ColorPicker.surface0
            }
        }
    }
});

const FilterButton = withStyles(() => ({
    root: {
        color: ColorPicker.darkHighEmphasis,
        backgroundColor: ColorPicker.newProgressBar,
        borderRadius: "30px",
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "20px",
        padding: "8px 16px",
        boxShadow: "0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%), 0px 2px 4px -1px rgb(0 0 0 / 20%)",
        textTransform: 'none',
        textAlign: 'center',
        justifyContent: "center",
        minWidth: "8rem",
        '&:hover': {
            backgroundColor: ColorPicker.newProgressBar,
        },
        "& .MuiTouchRipple-root span": {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
}))(Button);

class WalletLandingPageComponent extends React.Component {

    static contextType = AuthStateContext;
    fetchAccountDetailsPromise;
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            myKeys: [],
            processing: false,
            status: "Waiting",
            showReceive: false,
            showOnboarding: false,
            showBalance: true,
            nickName: "",
            balance: "",
            decimal: "",
            activeItemIndex: 0,
            scanForm: "",
            open: false,
            showChat: !constantObjects.featureEnabler.DISABLE_CHATBOT,
            showATMTutorial: false,
            snackBarOpen: false,
            newOnboarding: this.props.location.newOnboarding || false,
            storyDom: [],
            showStaticCards: false,
            storyDomAutoLoop: true,
            storyDomSwipeable: true,
            storyDomDraggable: true,
            storyDomInfiniteLoop: true,
            maxWidth: null,
            iconContentsVariable: [],
            serverStoryData: null,
            isMotopayOnly: androidApiCalls.checkIfMpOnly(),
            showMDALoginDialog: false,
            launchTime: new Date().getTime(),
            scratchedCards: [],
            gamInstantPopup: false,
            gamProgramData: {},
            isIconTapped: false,
            blockDoubleClick: false,
            smartReminderData: "",
            smartAlertText: "",
            latestAlertResp: [],
            toRecharge: true,
            toBoleto: true,
            toCredit: true,
            tocashin: true,
            boletoState: false,
            carouselKey: 0,
            cancelReminder: false,
            input1: "",
            input2: "",
            icon: "",
            onboardedCC: false,
            showLazyLoad: false
        };
        this.componentName = PageNames.launchPage;
        this.accountKey = "";
        this.iconContents = [];
        this.userDetails = {};
        this.style = {
            cardStyle: {
                margin: "1.5rem",
                height: "5rem",
            },
            nameCardStyle: {
                marginBottom: "1.5rem",
                marginLeft: "1.5rem",
                marginRight: "1.5rem",
                paddingTop: "1.5rem",
                display: "flex",
                width: "90%"
            },
            cardScrollStyle: {
                height: "11rem",
                borderRadius: "2rem",
                position: "relative",
                padding: "0",
                margin: "0",
                backgroundColor: ColorPicker.newProgressBar
            },
            cardLazyLoadScrollStyle: {
                height: "11rem",
                borderRadius: "2rem",
                position: "relative",
                backgroundColor: ColorPicker.newProgressBar
            },
            alertLazyLoadScrollStyle: {
                height: "5rem",
                borderRadius: "2rem",
                position: "relative",
                backgroundColor: ColorPicker.newProgressBar
            },
            lazyLoading: {
                backgroundColor: ColorPicker.lazyLoadColor,
                borderRadius: "0.875rem"
            },
            nickNameLazyLoadBlock: {
                marginLeft: "2%",
                backgroundColor: ColorPicker.lazyLoadColor,
                borderRadius: "0.75rem"
            },
            nickNameBlock: {
                display: "flex",
                flex: "50%",
                alignItems: "center"
            },
            iconStyle: {
                fill: ColorPicker.darkHighEmphasis
            },
            operationsNewChipStyle: {
                position: "absolute",
                height: "1.2rem",
                right: 0,
                top: '-0.25rem',
                marginLeft: 0
            },
            imgStyle: {
                height: "1.5rem",
                width: "1.5rem",
                padding: "1rem"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.smartIconBackground
            }
        }
        this.deletedCards = [];
        this.carouselRef = React.createRef();
        this.customCarouselLoop = null;
        this.checkUserScratchingCard = false;
        this.initialScratchCardCheck = true;
        this.dialogCall = null;
        this.gamificationTimer = null;

        try {
            const localStorageStoryData = androidApiCalls.getFromPrefs(Utils.LOCAL_STORY_CARDS);
            if (GeneralUtilities.isNotEmpty(this.props.location.accountKey, false)) {
                androidApiCalls.clearFromEncryptedprefs(Utils.LOCAL_STORY_CARDS);
                this.state.showMDALoginDialog = true;
                DBService.clearServedCardList();
            } else if (GeneralUtilities.isNotEmpty(localStorageStoryData, false)) {
                this.state.serverStoryData = JSON.parse(localStorageStoryData);
            }
        } catch (e) {
            Log.Debug("Error while getting local story data from storage:" + e);
        }

        MetricServices.onPageTransitionStart(this.componentName);
    }

    async submitMotoSafeData() {
        let motosafeDataSubmitedList = androidApiCalls.getDAStringPrefs(GeneralUtilities.MOTOSAFECLIENTIDLIST_KEY);
        let currentClientKey = ImportantDetails.clientKey;
        let clientsList = motosafeDataSubmitedList.split(";");
        if (motosafeDataSubmitedList === undefined ||
            motosafeDataSubmitedList === null ||
            clientsList.length === 0 ||
            !clientsList.includes(currentClientKey)) {
            if (!androidApiCalls.checkIfNm()) {
                let imei = androidApiCalls.getImei();
                let deviceId = androidApiCalls.getDeviceId();
                let anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
                //let deviceType = androidApiCalls.isDeviceNotSecure();
                let deviceType = androidApiCalls.getEnv();
                let type = "staging";
                if (deviceType === "prod") {
                    type = "production";
                }
                let motoSafeJson = {
                    "imei": imei + "",
                    "clientKey": currentClientKey + "",
                    "smartphoneId": deviceId + "",
                    "anonymizedSerialNumber": anonymizedSerialNumber + "",
                    "device": type
                };
                await apiService.sendMotoSafeInfo(motoSafeJson).then(async response => {
                    try {
                        if (response.status === 200 || response.status === 201) {
                            let existingClientKeys = androidApiCalls.getDAStringPrefs(GeneralUtilities.MOTOSAFECLIENTIDLIST_KEY);
                            existingClientKeys = existingClientKeys === "" ? existingClientKeys + currentClientKey : existingClientKeys + ";" + currentClientKey;
                            androidApiCalls.setDAStringPrefs(GeneralUtilities.MOTOSAFECLIENTIDLIST_KEY, existingClientKeys);
                            Log.debug("Moto Safe data submitted successfully. =>" + JSON.stringify(motoSafeJson));
                        } else {
                            Log.debug("Moto Safe data submission failed =>" + JSON.stringify(motoSafeJson));
                        }
                    } catch (error) {
                        Log.debug("Moto Safe data submission failed =>" + JSON.stringify(error));
                    }
                });
            }
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        if (this.props.location.otherTransaction !== "" && this.props.location.otherTransaction !== undefined) {
            androidApiCalls.setShouldShowAtmWithdrawal();
            this.imageClick(this.props.location.otherTransaction)
        }
        if (this.props.history.location.additionalInfo !== "" && this.props.history.location.additionalInfo !== undefined) {
            let action = this.props.history.location.additionalInfo["cameraActions"];
            if (action !== "" && action !== undefined) {
                this.imageClick(action)
            }
            action = this.props.history.location.additionalInfo["Action"];
            if (action === "Open link in engage") {
                androidApiCalls.openInEngage(this.props.history.location.additionalInfo["url"]);
            } else if (action === "Open link in browser") {
                androidApiCalls.openUrlInBrowserLegacy(this.props.history.location.additionalInfo["url"]);
            }
        }
        if (this.props.history.location.url !== "" && this.props.history.location.url !== undefined) {
            androidApiCalls.openInEngage(this.props.history.location.url);
        }

        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        document.body.style.overflowY = "scroll";
        this.submitMotoSafeData();
        this.deletedCards = DBService.getDeletedCards();
        androidApiCalls.setDAStringPrefs("options", "-1");
        androidApiCalls.setDAStringPrefs("contactCPF", "");
        if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
            this.showBalance("HIDE");
            this.checkBalance().then(() => {
                this.setState({
                    balance: ImportantDetails.walletBalance,
                    decimal: ImportantDetails.walletDecimal
                });
                return this.creditCardBillPayment();
            }).then(() => {
                if (this._isMounted) {
                    this.checkForReminder();
                }
            });
        } else {
            this.setState({
                balance: ImportantDetails.walletBalance,
                decimal: ImportantDetails.walletDecimal,
                scratchedCards: DBService.getScratchedCards()
            });
            this.setSmartReminderCashin(ImportantDetails.clientKey);
            this.creditCardBillPayment().then(() => {
                if (this._isMounted) {
                    this.checkForReminder();
                }
            });
        }

        this.setState({
            iconContentsVariable: [
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
                    text: localeObj.account_card,
                    action: "card",
                    icon: <img src={CardIcon} style={{ width: "1.5rem" }} alt="" />,
                    disable: constantObjects.featureEnabler.CREDIT_CARD_ENABLED
                },
                {
                    text: localeObj.dimo_credit_card,
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
                    text: localeObj.all_services,
                    action: 'All_Services',
                    icon: <img src={AddIcon} style={{ width: "1.1rem" }} alt="" />
                }
            ]
        });

        if (!!this.props.location.state && !!this.props.location.state.showSnackBar && this.props.location.state.showSnackBar !== "") {
            this.openSnackBar(this.props.location.state.showSnackBar)
        }
        if (this.props.location && this.props.location.message && this.props.location.message !== "") {
            this.openSnackBar(this.props.location.message)
        }

        const screenWidth = window.screen.width;
        this.setState({
            maxWidth: (screenWidth - 32) / 3
        });

        this.fetchStoryCards().then(() => { });

        this.accountKey = this.props.location.accountKey ? this.props.location.accountKey : ImportantDetails.accountKey;

        window.onBackPressed = () => {
            this.onCancel();
        }

        window.onScanQRComplete = (response) => {
            let timeoutId = setInterval(() => {
                clearInterval(timeoutId);
                this.hideProgressDialog();
            }, 500);
            if (response) {
                if (response === "cancelled") {
                    // Log.sDebug("User cancelled scanning", "WalletLandingPageComponent");
                } else if (this.state.scanForm === "Boleto") {
                    if (response === "manual") {
                        ImportantDetails.setTransactionEntryPoint(constantObjects.boletoManual);
                        //Log.sDebug("User opted to enter boleto code manually", "WalletLandingPageComponent");
                        if(this.state.boletoState){
                            this.props.history.push({
                                pathname: '/insertBoleto',
                                state: {
                                    "entryPoint": "BOLETO_BILL_PAYMENT_SMARTALERT_CLICK"
                                }
                            });
                        } else {
                            this.props.history.push("insertBoleto");
                        }
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
                            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                            if(this.state.boletoState) {
                                this.props.history.push({
                                    pathname: '/boleto',
                                    state: {
                                        "manual": false,
                                        "qrCodeValue": response.split(":")[1],
                                        "entryPoint": "BOLETO_BILL_PAYMENT_SMARTALERT_CLICK"
                                    }
                                });
                            } else {
                                this.props.history.push({
                                    pathname: '/boleto',
                                    state: {
                                        "manual": false,
                                        "qrCodeValue": response.split(":")[1]
                                    }
                                });
                            }
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
                        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
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

        window.onPIXScanQRComplete = (response) => {
            // Don't move to landing page if user cancelled the scanner.
            // Log.sDebug("onPIXScanQRComplete" + response);
            let timeoutId = setInterval(() => {
                clearInterval(timeoutId);
                this.hideProgressDialog();
            }, 500);
            if (response === "cancelled") {
                //Log.sDebug("User cancelled scanning", "WalletLandingPageComponent");
            } else if (response === "manual_paste") {
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.props.history.replace({ pathname: "/pixLandingComponent", "qrCodeValue": response, "launchSource": "/newWalletLaunch", from: "landingPage", transition: "none" });
            } else if (response.includes("dimo:qrcode/payment")) {
                ImportantDetails.dimoPayEntryPoint = "DIMO_PAY_FROM_FAB_CAMERA";
                this.props.history.replace({ pathname: "/dimoPayComponent", state: response, "launchSource": "/newWalletLaunch", from: "landingPage" });
            } else {
                this.updateQrCodeInfo(response);
            }
        }

        this.setState({
            showBalance: androidApiCalls.getDAStringPrefs("showBalance") === "false" ? false : true
        })

        if (this.props.location.scanBoleto) {
            this.imageClick("Boleto");
        }

        if (ImportantDetails.fetchedAccountData) {
            this.setState({ nickName: (ImportantDetails.nickName ? ImportantDetails.nickName : ImportantDetails.userName) });
        }

        this.showDialogBoxOnLanding();
        androidApiCalls.getDataSyncProperties();
        androidApiCalls.setDAStringPrefs("userLoggedIn", true)
        //enabling shortcuts
        androidApiCalls.appShortcutIntents(localeObj);
        androidApiCalls.updateCameraCPValues(localeObj.cp_app_value);
        androidApiCalls.widgetIntents(localeObj);

        if (ChatBotUtils.clientKey !== "" && ChatBotUtils.clientKey !== ImportantDetails.clientKey) {
            ChatBotUtils.storeClientKey(ImportantDetails.clientKey);
            ChatBotUtils.setChats([]);
        }

        if (this.props.history.location.fromPixWithdraw) {
            this.scan();
        }
    }

    componentDidUpdate(prevState) {
        if (this.state.NoRemSnackBarOpen && !prevState.NoRemSnackBarOpen) {
            this.autoHideTimer = setTimeout(this.closeAlert, constantObjects.SNACK_BAR_DURATION);
        }
    }

    closeAlert = () => {
        this.setState({ NoRemSnackBarOpen: false });
    }

    updateQrCodeInfo(response) {
        if (response === "cancelled") {
            //Log.sDebug("User cancelled scanning", "WalletLandingPageComponent");
        } else if (response === "manual_paste") {
            androidApiCalls.enableCopyPaste();
            this.setState({ pasteQRdrawer: true })
        } else if (response === "key_selected") {
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            let launchUrl = "/newWalletLaunch";
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

    handleQrData(code) {
        if (code.toLowerCase().includes("br.gov.bcb.pix")) {
            let qrCodeValue = code.split(":")[1];
            qrCodeValue = qrCodeValue ? qrCodeValue : code
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            let launchUrl = "/pixLandingComponent"
            if (this.props.location && this.props.location.launchSource) {
                launchUrl = this.props.location.launchSource
            }
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            this.props.history.replace({
                pathname: "/pixQrCopyPasteComponent",
                state: qrCodeValue,
                launchUrl: launchUrl
            })
        } else {
            let message = localeObj.invalid_QR_token
            this.openSnackBar(message);
        }
    }

    showDialogBoxOnLanding() {
        let storyId = androidApiCalls.getDAStringPrefs("story_id");
        let isDialog = androidApiCalls.getDAStringPrefs("isdialog");

        if (!this.state.showMDALoginDialog && isDialog !== 'true') {
            return;
        }

        let params = {};

        if (isDialog === 'true') {
            params = {
                dialogtrigger: "none",
                storyId: storyId + "_A",
                timeoutCheck: true
            };
            androidApiCalls.setDAStringPrefs("story_id", "");
            androidApiCalls.setDAStringPrefs("isdialog", "");
        } else {
            params = {
                dialogtrigger: "onMDAlogin",
                placement: "Wallet",
                launchTime: this.state.launchTime
            };
        }

        this.dialogCall = apiService.getDialog(params);
        this.dialogCall.then(response => {
            Log.debug('Wallet component getDialog response: ' + JSON.stringify(response));

            if (response.main) {
                try {
                    const dialogData = response.main.dialogData;
                    const versionedData = dialogData['A'] || dialogData['B'];

                    if (this.deletedCards.includes(versionedData.default[0].id)) {
                        Log.debug('Wallet component story inside deleted array: ' + JSON.stringify(response));
                        return;
                    }
                } catch (e) {
                    console.error("An error occurred while processing dialogData:", e);
                }

                PopupModalHocManger.openPopupModalHoc(CustomAlertDialogs, response.main, response.extra, this.onclickEngageCards);
            } else {
                this.gamificationTimer = setTimeout(() => {
                    const gamProgramData = GamificationService.checkForMissedLuckyNumbers();

                    Log.debug("Missed lucky number program id is " + gamProgramData.programId, this.componentName);

                    if (GeneralUtilities.isNotEmpty(gamProgramData)) {
                        let currentSnapshot = androidApiCalls.getDAStringPrefs("GPSnapshotData");
                        androidApiCalls.setDAStringPrefs("PreGPSnapshotData", currentSnapshot)

                        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.showInstantDialog);

                        this.setState({ gamInstantPopup: true, gamProgramData });
                    }
                }, 3000);
            }
        });
    }

    fetchStoryCards = async () => {
        const componentName = "BannerCards";
        androidApiCalls.setAppRendered(true);
        if (GeneralUtilities.isNotEmpty(this.state.serverStoryData, false)) {
            await new Promise(accept => this.setState(this.state.serverStoryData, accept));
        } else {
            const cardsListData = await GeneralAPIs.fetchCardsListAPI(constantObjects.HOME_TAB_NAME, componentName);

            try {
                if (cardsListData.length !== 0) {
                    const serverStoryData = {
                        storyDom: cardsListData,
                        showStaticCards: false
                    };

                    androidApiCalls.storeToPrefs(Utils.LOCAL_STORY_CARDS, JSON.stringify(serverStoryData));
                    await new Promise(accept => this.setState(serverStoryData, accept));
                }
            } catch (err) {
                Log.debug(err)
                Log.sDebug("Receiving exception for cards" + err, componentName, constantObjects.LOG_PROD);
            }
        }

        this.state.storyDom.length === 0 && this.addStaticCardToDom().then(() => { });

        this.checkIfCardCanAutoLoop() && this.initializeAutoCardLoop();
    }

    addStaticCardToDom = async () => {
        let engage_cards = [
            {
                image: engage_pix,
                text: "",
                subtext: "",
                action: this.getStaticCardUrl("/pixLandingComponent")
            }
        ];

        const userEmailConfirmed = androidApiCalls.getFromPrefs('userEmailConfirmed');
        if (!GeneralUtilities.isNotEmpty(userEmailConfirmed, false)) {
            await arbiApiService.getAllClientData(this.componentName)
                .then(async response => {
                    if (!response.success) {
                        throw new Error(JSON.stringify(response));
                    }
                    let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "onBoard");
                    if (!processorResponse.success || !processorResponse.emailConfirmed) {
                        throw new Error(JSON.stringify(processorResponse));
                    }

                    androidApiCalls.storeToPrefs('userEmailConfirmed', true);
                })
                .catch(() => {
                    engage_cards = engage_cards.concat([
                        {
                            image: engage_deposit,
                            text: "",
                            subtext: "",
                            action: this.getStaticCardUrl("/myAccount")
                        }
                    ]);
                });
        }

        const serverStoryData = {
            storyDom: engage_cards,
            showStaticCards: true
        };

        androidApiCalls.storeToPrefs(Utils.LOCAL_STORY_CARDS, JSON.stringify(serverStoryData));
        await this.setState(serverStoryData);
    }

    getStaticCardUrl = (url) => {
        let json = {
            componentPath: url
        }
        return JSON.stringify(json)
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
        this._isMounted = false;
        document.removeEventListener("visibilitychange", this.visibilityChange);
        document.body.style.overflowY = "hidden";
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);

        this.checkIfCardCanAutoLoop() && clearInterval(this.customCarouselLoop);

        GeneralUtilities.isNotEmpty(this.dialogCall, false)
            && PopupModalHocManger.closeModal();
        clearTimeout(this.gamificationTimer);
        clearTimeout(this.autoHideTimer);
    }

    checkIfCardCanAutoLoop = () => this.state.storyDom.length > 1 && this.state.storyDomAutoLoop;

    initializeAutoCardLoop = () => {
        this.customCarouselLoop = setInterval(() => {
            if (GeneralUtilities.isNotEmpty(this.carouselRef.current, false)) {
                if (
                    this.carouselRef.current.state.currentSlide === (this.state.storyDom.length - 1)
                    && this.state.storyDomInfiniteLoop
                ) {
                    this.carouselRef.current.goToSlide(0);
                } else {
                    this.carouselRef.current.next();
                }
            }
        }, 5000);
    }

    showBalance = (val) => {
        this.setState({
            showBalance: !this.state.showBalance
        })
        if (val === "HIDE") {
            let event = {
                eventType: constantObjects.hideBalance,
                page_name: PageNames.launchPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
        } else {
            let event = {
                eventType: constantObjects.showBalance,
                page_name: PageNames.launchPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
        }
        androidApiCalls.setDAStringPrefs("showBalance", !this.state.showBalance);
    }

    showHistory = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace({
            pathname: '/newTransactionHistory',
            transition: "left",
            balanceData: { "balance": this.state.balance, "decimal": this.state.decimal }
        })
    }

    refreshBalance = () => {
        ImportantDetails.balanceFetched = false;
        this.setState({
            balance: "",
            showBalance: true
        }, () => {
            androidApiCalls.setDAStringPrefs("showBalance", this.state.showBalance);
        })
        this.checkBalance();
    }

    checkBalance = async () => {
        await arbiApiService.getUserBalance(this.componentName, this.accountKey)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        this.setState({
                            balance: balanceInfo[0],
                        });
                        let decimal = balanceInfo[1];
                        if (decimal) {
                            switch (decimal.length) {
                                case 0:
                                    decimal = "00";
                                    break;
                                case 1:
                                    decimal = decimal + "0";
                                    break;
                                default:
                                    decimal = decimal.substring(0, 2);
                                    break;
                            }
                        } else {
                            decimal = "00";
                        }
                        this.setState({
                            decimal: decimal
                        });
                        ImportantDetails.setBalance(this.state.balance, this.state.decimal);
                        this.setSmartReminderCashin(ImportantDetails.clientKey);
                    }
                } else {
                    this.openSnackBar(response.result.message);
                }
            });
    }
    handleMoveToChat = () => {
        ChatBotUtils.insideChatBot(constantObjects.home_page_entrypoint);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace('/chat');
    }

    handleProfileclick = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        //Log.sDebug("User clicked on user profile icon", "landing page");
        this.props.history.replace('/myAccount');
    }

    help = () => {
        //Log.sDebug("User clicked on help icon", "landing page");
        GeneralUtilities.openHelpSection();
    }

    onCancel = () => {
        if (this.state.showATMTutorial) {
            this.setState({
                showATMTutorial: false
            });
            return;
        } else if (this.state.gamInstantPopup) {
            this.setState({
                gamInstantPopup: false
            });
            return;
        }
        else if (this.state.processing) {
            this.hideProgressDialog();
        } else {
            this.setState({ open: true })
        }
    }

    onSecondary = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
        this.setState({ open: false })
    }

    onPrimary = () => {
        ImportantDetails.walletBalance = "";
        ImportantDetails.walletDecimal = "";
        if (androidApiCalls.checkIfMpOnly()) {
            MetricServices.onPageTransitionStop(this.componentName, PageState.logout);
            this.props.history.replace({ pathname: "/", state: { from: this.componentName }, transition: "right" });
        } else {
            MetricServices.reportSessionMetrics();
            androidApiCalls.openHY();
        }
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

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    scan = () => {
        this.setState({ scanForm: "pix" });
        document.activeElement.blur();
        if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
            this.showProgressDialog();
            ImportantDetails.setTransactionEntryPoint(constantObjects.pixQR);
            androidApiCalls.scanPixQR();
        } else {
            androidApiCalls.requestPermission(CAMERA_PERMISSION);
        }
    }

    imageClick = (action) => {
        if (!this.state.blockDoubleClick) {
            this.setState({ blockDoubleClick: true },
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
            eventType: action === "Boleto" ? constantObjects.walletPageEvent + "PAY_" + capitalizedAction : constantObjects.walletPageEvent + capitalizedAction,
            page_name: PageNames.launchPage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        GeneralUtilities.setBackPressTracking("WalletLandingPage");
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
                "fromComponent": "newWalletLaunch",
                "from": "newWalletLaunch"
            });
        } else if (action === "Deposit") {
            this.props.history.push("/depositLandingComponent");
        } else if (action === "Recharge") {
            this.props.history.push("/cellularRecharge");
        } else if (action === "Pix") {
            this.props.history.push({
                pathname: "/pixLandingComponent",
                "newOnboarding": this.props.location.newOnboarding
            });
        } else if (action === "PixScan") {
            this.scan();
        } else if (action === "card") {
            this.props.history.push("/digitalCard");
        } else if (action === "CreditCard") {
            this.props.history.push({
                pathname: '/creditCard',
                state: {
                    "creditStatus": {},
                    "entryPoint": "walletlanding"
                }
            });
        } else if (action === "Contact") {
            this.props.history.push("/contacts");
        } else if (action === "fgts") {
            let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY);
            if (valuePropsEnable === "4") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "1");
            }
            this.props.history.push({
                pathname: "/fgtsHome",
                "fromComponent": "newWalletLaunch",
                "from": "home"
            });
        } else if (action === "All_Services") {
            this.props.history.push("/allServices");
        }
        else if (action === "rewards") {
            const gamifyOnboardingCompleted = androidApiCalls.getDAStringPrefs(GeneralUtilities.GAMIFICATION_KEY);
            gamifyOnboardingCompleted === 'enable'
                ? this.props.history.push("/rewards")
                : this.props.history.push("/gamificationOnboarding");
        }
    }

    onHandleOnboardingAction = () => {
        this.setState({ newOnboarding: false })
    }

    registerKey = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        //Log.sDebug("User has no pix keys, user clicked to register new key", "PixReceiveComponent");
        this.props.history.replace({ pathname: '/registerNewKeyComponent', from: "landingPage" });
    }

    //All the in-app routing happens here and external urls will be rendered from the respective domelement class
    onclickEngageCards = (action) => {
        GeneralUtilities.onclickEngageCards(action, this.componentName);
    }

    removeStoryFromCards = async (storyId) => {
        let storyDom = this.state.storyDom;
        if (GeneralUtilities.isNotEmpty(storyDom, false)) {
            storyDom = storyDom.filter((storyData) => storyData.id !== storyId);
        }

        androidApiCalls.clearFromEncryptedprefs(Utils.LOCAL_STORY_CARDS);

        if (GeneralUtilities.isNotEmpty(storyDom, false)) {
            await this.setState({ storyDom });
            return;
        }
        await this.addStaticCardToDom();
    }

    stopCarouselAutoLoopEvent = (scratchCardEvent = false) => {
        if (this.checkUserScratchingCard && scratchCardEvent !== true) {
            return;
        }

        if (this.checkIfCardCanAutoLoop() && GeneralUtilities.isNotEmpty(this.customCarouselLoop, false)) {
            clearInterval(this.customCarouselLoop);
            this.customCarouselLoop = null;
        }
    }

    startCarouselAutoLoopEvent = (scratchCardEvent = false) => {
        if (this.checkUserScratchingCard && scratchCardEvent !== true) {
            return;
        }
        this.checkIfCardCanAutoLoop()
            && !GeneralUtilities.isNotEmpty(this.customCarouselLoop, false)
            && this.initializeAutoCardLoop();
    }

    cardScratchAttempted = () => {
        this.checkUserScratchingCard = true;
        this.setState({
            storyDomSwipeable: false,
            storyDomDraggable: false
        });

        this.stopCarouselAutoLoopEvent(true);
    }

    cardScratchCompleted = (storyId) => {
        this.setState((prevState) => ({
            storyDomSwipeable: true,
            storyDomDraggable: true,
            scratchedCards: [...prevState.scratchedCards, storyId]
        }));

        this.startCarouselAutoLoopEvent(true);
        this.checkUserScratchingCard = false;
    }

    getOperationIconMargin = (opt, boxHeight) => {
        let margintop = `${0.25 * boxHeight}px`;

        if (opt.action === "All_Services") {
            margintop = `${0.28 * boxHeight}px`;
        }

        return margintop;
    }

    getOperationContentMargin = (opt, boxHeight) => {
        let margintop = `${0.125 * boxHeight}px`;

        if (
            (androidApiCalls.getLocale() === "en_US" && opt.action === 'Recharge')
            || opt.action === 'fgts'
        ) {
            margintop = `${0.02 * boxHeight}px`;
        }
        else if (opt.action === "All_Services") {
            margintop = `${0.05 * boxHeight}px`;
        }

        return margintop;
    }

    bottomCardScratchCardCheck = (currentSlideIndex) => {
        const elementFocused = document.querySelector(`.hasScratchCard[data-index="${currentSlideIndex}"]`);

        if (
            GeneralUtilities.isNotEmpty(elementFocused, false)
            && !this.state.scratchedCards.includes(elementFocused.getAttribute('data-story'))
        ) {
            this.state.storyDomSwipeable && this.setState({ storyDomSwipeable: false, storyDomDraggable: false });
        } else {
            !this.state.storyDomSwipeable && this.setState({ storyDomSwipeable: true, storyDomDraggable: true });
        }
    }

    initialScratchCardHandler = () => {
        if (
            GeneralUtilities.isNotEmpty(this.state.storyDom, false)
            && GeneralUtilities.isNotEmpty(this.carouselRef.current, false)
            && this.carouselRef.current.state.currentSlide === 0
            && this.initialScratchCardCheck
        ) {
            this.initialScratchCardCheck = false;
            this.bottomCardScratchCardCheck(0);
        }
    }

    setSmartReminderCashin = (clientKey) => {
        let cashinDetails = androidApiCalls.getFromPrefs(Utils.CASHIN_SMARTALERT);
        let reminderObj = {
            remainderType: "cashin",
            clientId: clientKey,
        };
        cashinDetails = GeneralUtilities.emptyValueCheck(cashinDetails) ? [] : JSON.parse(cashinDetails);
        if (ImportantDetails.walletBalance === "0" && ImportantDetails.walletDecimal === "00") {
            const existingEntry = cashinDetails.filter(entry => entry.clientId === clientKey);
            if (existingEntry.length === 0) {
                reminderObj["type_id"] = cashinDetails.length + 1;
                cashinDetails.push(reminderObj);
                androidApiCalls.storeToPrefs(Utils.CASHIN_SMARTALERT, JSON.stringify(cashinDetails));
                const isDuplicate = ImportantDetails.latestAlertResp.some(entry =>
                    entry.clientId === reminderObj.clientId && entry.remainderType === reminderObj.remainderType
                );
                if (!isDuplicate) {
                    ImportantDetails.latestAlertResp.push(reminderObj);
                    ImportantDetails.smartAlert = true;
                    this.setState({ latestAlertResp: ImportantDetails.latestAlertResp, carouselKey: this.state.carouselKey + 1 });
                }
            }
        } else {
            const updatedDetails = cashinDetails.filter(entry => entry.clientId !== clientKey);
            androidApiCalls.storeToPrefs(Utils.CASHIN_SMARTALERT, JSON.stringify(updatedDetails));
            let existingReminder = ImportantDetails.latestAlertResp.filter(entry => entry.remainderType !== "cashin");
            ImportantDetails.smartAlert = existingReminder.length > 0;
            ImportantDetails.latestAlertResp = existingReminder;
            this.setState({ latestAlertResp: existingReminder, carouselKey: this.state.carouselKey + 1 });
        }
    };

    setSmartReminder = (jsonObject, clientKey) => {
        let deeplink_type;
        if (androidApiCalls.checkIfNm()) {
            deeplink_type = "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FcreditCard;S.motopay_addInfo=%7B%22creditActions%22%3A%22invoicePayment%22%7D;end"
        } else {
            deeplink_type = "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FcreditCard;S.motopay_addInfo=%7B%22creditActions%22%3A%22invoicePayment%22%7D;end"
        }
        let existing_data;
        let index = 0;
        existing_data = androidApiCalls.getFromPrefs(Utils.CREDIT_PAYMENT)

        var originalDate = new Date();
        let reminderObj = {};
        reminderObj["remainderType"] = "credit_card";
        reminderObj["amount"] = jsonObject.amount.toString();
        reminderObj["dueDate"] = moment(jsonObject.dueDate).format('DD-MM-YYYY')
        reminderObj["destinationAccount"] = "Credit Card";
        reminderObj["deeplink"] = deeplink_type;
        reminderObj["remainderDate"] = moment(originalDate).format('DD-MM-YYYY')
        reminderObj["clientId"] = clientKey
        if (existing_data !== "") {
            existing_data = JSON.parse(existing_data);
            if (existing_data.length >= 10) {    //to delete oldest entry
                existing_data = existing_data.slice(-9)
                for (let i = 0; i < existing_data.length; i++) {
                    existing_data[i].type_id = i + 1;
                }
            }
            index = existing_data.length + 1;
            reminderObj["type_id"] = index;
            reminderObj = [reminderObj]
            existing_data = existing_data.concat(reminderObj);
            androidApiCalls.storeToPrefs(Utils.CREDIT_PAYMENT, JSON.stringify(existing_data));
        } else {
            reminderObj["type_id"] = 1;
            reminderObj = [reminderObj]
            androidApiCalls.storeToPrefs(Utils.CREDIT_PAYMENT, JSON.stringify(reminderObj));
        }
    }

    async creditCardBillPayment() {
        if (ImportantDetails.alertSessionFlag) {
            return new Promise(async (resolve, reject) => {
                try {
                    await arbiApiService.getGuaranteedCreditStatus().then(response => {
                        if (response && response.success) {
                            let processedDetails = ArbiResponseHandler.processGuaranteedCreditStatusResponse(response.result);
                            if (processedDetails && processedDetails.success) {
                                ImportantDetails.creditStatus = processedDetails.creditStatus.cardStatus;
                                if (processedDetails.creditStatus.cardStatus >= 5) {
                                    this.setState({ onboardedCC: true });
                                }
                            } else {
                                return;
                            }
                        } else {
                            return;
                        }
                    });
                    if (this.state.onboardedCC && !ImportantDetails.autoDebit) {
                        await arbiApiService.getCreditCardData().then(response => {
                            if (response && response.success) {
                                this.hideProgressDialog();
                                let processorResponse = ArbiResponseHandler.processCreditCardDetailsData(response.result);
                                if (processorResponse && processorResponse.success) {
                                    ImportantDetails.autoDebit = processorResponse.autoDebit;
                                } else {
                                    return;
                                }
                            } else {
                                return;
                            }
                        });
                        if (!ImportantDetails.autoDebit) {
                            this.setState({ showLazyLoad: true })
                            let credit_data = androidApiCalls.getFromPrefs(Utils.CREDIT_PAYMENT);
                            Log.sDebug("CREDIT_PAYMENT : " + credit_data);
                            let currentDate = new Date();
                            currentDate.setHours(0, 0, 0, 0);
                            let dueDate = "";
                            if (credit_data || credit_data !== "" || credit_data.length !== 0) {
                                let result = [credit_data].reduce((acc, curr) => {
                                    if (curr.trim() !== "") {
                                        return [...acc, ...JSON.parse(curr)];
                                    } else {
                                        return acc;
                                    }
                                }, []);
                                credit_data = result.filter(item => item.clientId === ImportantDetails.clientKey);
                                dueDate = new Date(credit_data[0].dueDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1") + "T00:00:00");
                                dueDate.setHours(0, 0, 0, 0);
                            }
                            Log.sDebug("currentDate", currentDate, "dueDate", dueDate)
                            if (credit_data === "" || currentDate > dueDate) {
                                let invoiceHistoryfromDate = moment().subtract(1, 'year');
                                let invoiceHistoryToDate = new Date();
                                let jsonObject = {};
                                await arbiApiService.getCreditCardInvoiceHistory(invoiceHistoryfromDate.toISOString(), invoiceHistoryToDate.toISOString()).then(response => {
                                    if (response && response.success) {
                                        let processorResponse = ArbiResponseHandler.processCreditCardInvoiceHistoryData(response.result);
                                        Log.sDebug("CC Invoice history", JSON.stringify(processorResponse));
                                        if (processorResponse && processorResponse.success) {
                                            const closedInvoices = processorResponse.invoiceHistoryData
                                                .filter(invoice => invoice.invoiceStatus === "closed") // Filter by closed status
                                                .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
                                            const latestClosedInvoice = (closedInvoices && closedInvoices.length > 0 && new Date(closedInvoices[0].dueDate) >= currentDate) ? closedInvoices[0] : {};
                                            Log.sDebug("Closed invoice" + JSON.stringify(closedInvoices));
                                            Log.sDebug("Latest closed invoice" + JSON.stringify(latestClosedInvoice));
                                            this.setState({ showLazyLoad: false })
                                            if (Object.keys(latestClosedInvoice).length !== 0) {
                                                jsonObject["dueDate"] = latestClosedInvoice.dueDate;
                                                jsonObject["amount"] = latestClosedInvoice.amount;
                                                jsonObject["decimal"] = latestClosedInvoice.decimal;
                                                jsonObject["formatted_amount"] = latestClosedInvoice.formatted_amount;
                                                jsonObject["invoiceStatus"] = latestClosedInvoice.invoiceStatus;
                                                this.setSmartReminder(jsonObject, ImportantDetails.clientKey)
                                            }
                                        } else {
                                            this.setState({ showLazyLoad: false })
                                        }
                                    } else {
                                        this.setState({ showLazyLoad: false })
                                    }
                                });
                            } else {
                                this.setState({ showLazyLoad: false })
                            }
                        } else {
                            this.hideProgressDialog();
                            this.setState({ showLazyLoad: false })
                        }
                    } else {
                        this.hideProgressDialog();
                    }
                    resolve();
                } catch (error) {
                    this.hideProgressDialog();
                    reject(error);
                }
            });
        }
    }
    smartAlertText = (key) => {
        switch (key.remainderType) {
            case "recharge":
                return {
                    text: localeObj.recharge_alert,
                    input1: "R$ " + parseFloat(key.amount).toFixed(2).replace('.', ',').toString(),
                    input2: NewUtilities.parsePhoneNum(key.destinationAccount).phoneNumber,
                    icon: LocalPhoneIcon
                };
            case "credit_card":
                return {
                    text: localeObj.invoice_alert,
                    input1: "R$ " + parseFloat(key.amount).toFixed(2).replace('.', ',').toString(),
                    input2: key.dueDate.replaceAll("-", "."),
                    icon: AccessTimeFilledIcon
                };
            case "boleto":
                return {
                    text: key.destinationAccount.charAt(0).toUpperCase() + key.destinationAccount.slice(1).toLowerCase(),
                    input1: "Boleto",
                    input2: key.dueDate.replaceAll("-", "."),
                    icon: AccessTimeFilledIcon
                };
            case "cashin":
                return {
                    text: localeObj.cashin_header,
                    input1: localeObj.cashin_subheader,
                    input2: ""
                };
            default:
                return
        }
    }
    checkForReminder = () => {
        let cashin_data = androidApiCalls.getFromPrefs(Utils.CASHIN_SMARTALERT);
        let recharge = androidApiCalls.getFromPrefs(Utils.CELLULAR_RECHARGE);
        let boleto = androidApiCalls.getFromPrefs(Utils.BOLETO_PAYMENT);
        let credit_card = androidApiCalls.getFromPrefs(Utils.CREDIT_PAYMENT);
        if (ImportantDetails.alertSessionFlag) {
            ImportantDetails.alertSessionFlag = false;
            if (recharge !== "" || boleto !== "" || credit_card !== "" || cashin_data !== "") {
                let result = [recharge, boleto, credit_card, cashin_data].reduce((acc, curr) => {
                    if (curr.trim() !== "") {
                        return [...acc, ...JSON.parse(curr)];
                    } else {
                        return acc;
                    }
                }, []);
                this.setState({
                    smartReminderData: result,
                    latestAlertResp: ImportantDetails.latestAlertResp,
                    cancelReminder: false
                }, () => {
                    Log.sDebug("smartReminderData", JSON.stringify(this.state.smartReminderData))
                    let filterAlertResp = [];
                    let deletedData = [];
                        let parsedData = this.state.smartReminderData.filter(item => item.clientId === ImportantDetails.clientKey);
                        for (let item of parsedData) {
                            let currentDate = moment().startOf('day');
                            let reminderDate = moment(item.remainderDate, "DD/MM/YYYY").toDate();
                            reminderDate.setHours(0, 0, 0, 0);
                            let dueDate = moment(item.dueDate, "DD/MM/YYYY").toDate();
                            dueDate.setHours(0, 0, 0, 0);
                            if (reminderDate && dueDate && reminderDate <= currentDate && currentDate <= dueDate) {
                                filterAlertResp.push(item);
                            } else if (dueDate < currentDate) {
                                deletedData = deletedData.concat(item);
                            }
                            if(item.remainderType === "cashin"){
                                filterAlertResp.push(item);
                            }
                        }
                        if(filterAlertResp && filterAlertResp.length !== 0) {
                            filterAlertResp.forEach((item, index) => {
                                item.type_id = index + 1;
                            });
                        }
                        this.setState({
                            latestAlertResp: filterAlertResp
                        }, () => {
                            ImportantDetails.smartAlert = true;
                            ImportantDetails.latestAlertResp = this.state.latestAlertResp;
                            this.setState({ smartAlert: true })
                            this.noReminderALert();
                        });
                        if (deletedData && deletedData.length !== 0) {
                            let convertArrayStr = deletedData.map(obj => JSON.stringify(obj));
                            let filteredArray = this.state.smartReminderData.filter(obj => !convertArrayStr.some(str => JSON.stringify(obj) === str));
                            let rechargeArray = [];
                            let creditCardArray = [];
                            let boletoArray = [];
                            filteredArray.forEach(item => {
                                switch (item.remainderType) {
                                    case "recharge":
                                        rechargeArray.push({ ...item, type_id: rechargeArray.length + 1 });
                                        break;
                                    case "credit_card":
                                        creditCardArray.push({ ...item, type_id: creditCardArray.length + 1 });
                                        break;
                                    case "boleto":
                                        boletoArray.push({ ...item, type_id: boletoArray.length + 1 });
                                        break;
                                    default:
                                        break;
                                }
                            });
                            rechargeArray = rechargeArray.length > 0 ? JSON.stringify(rechargeArray) : "";
                            creditCardArray = creditCardArray.length > 0 ? JSON.stringify(creditCardArray) : "";
                            boletoArray = boletoArray.length > 0 ? JSON.stringify(boletoArray) : "";
                            filteredArray = filteredArray.length > 0 ? JSON.stringify(filteredArray) : "";
                            this.setState({
                                smartReminderData: JSON.stringify(filteredArray),
                            })
                            androidApiCalls.storeToPrefs(Utils.CELLULAR_RECHARGE, rechargeArray);
                            androidApiCalls.storeToPrefs(Utils.BOLETO_PAYMENT, boletoArray);
                            androidApiCalls.storeToPrefs(Utils.CREDIT_PAYMENT, creditCardArray);
                        }
                })
            } else {
                this.noReminderALert();
            }
        }
    }

    noReminderALert = () => {
        if (this.state.latestAlertResp &&
            this.state.latestAlertResp.length === 0 &&
            this.state.onboardedCC &&
            !ImportantDetails.autoDebit
        ) {
            this.setState({
                NoRemSnackBarOpen: true,
                noReminderMessage: localeObj.noReminders
            })
        }
    }

    invoicePayment = () => {
        let addInfoJson = {
            "creditActions": "invoicePayment",
        }
        this.props.history.replace({
            pathname: "/creditCard",
            additionalInfo: addInfoJson,
            state: {
                "entryPoint": "INVOICE_DUE_PAYMENT_SMARTALERT_CLICK"
            }
        });
    }

    open = (key) => {
        if(key.remainderType !== "cashin") {
            this.removeReminder(key.type_id);
        }
        if (this.state.toRecharge && key.remainderType === "recharge") {
            this.setState({ toRecharge: false })
            let event = {
                eventType: constantObjects.cellularRecharge,
                page_name: PageNames.launchPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.props.history.push({
                pathname: '/cellularRecharge',
                state: {
                    "entryPoint": "CELLULAR_RECHARGE_SMARTALERT_CLICK"
                }
            });
        } else if (this.state.toBoleto && key.remainderType === "boleto") {
            this.setState({ toBoleto: false, boletoState: true })
            let event = {
                eventType: constantObjects.boleto,
                page_name: PageNames.launchPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.showProgressDialog();
            androidApiCalls.scanBoletoCode();
        } else if (this.state.toCredit && key.remainderType === "credit_card") {
            this.setState({ toCredit: false })
            let event = {
                eventType: constantObjects.creditCard,
                page_name: PageNames.launchPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.invoicePayment();
        } else if (this.state.tocashin && key.remainderType === "cashin") {
            this.setState({ tocashin: false })
            let event = {
                eventType: constantObjects.cashin,
                page_name: PageNames.launchPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.props.history.push({
                pathname: '/pixReceive',
                from: "landingPage",
                state: {
                    "entryPoint": "CASHIN_SMARTALERT_CLICK"
                }
            });
        }
    }

    removeReminder = (key) => {
        ImportantDetails.latestAlertResp = ImportantDetails.latestAlertResp.filter(item => item.type_id !== key);
        ImportantDetails.alertSessionFlag = false;
        if (ImportantDetails.latestAlertResp.length === 0) {
            ImportantDetails.smartAlert = false
            this.setState({ cancelReminder: false })
        }
        this.openSnackBar(localeObj.cancel_alert);
        this.setState({
            latestAlertResp: ImportantDetails.latestAlertResp,
            carouselKey: this.state.carouselKey + 1,
            cancelReminder: true
        })
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

        const responsive = GeneralUtilities.getCarouselBreakPoint();
        const { classes } = this.props;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const boxHeight = GeneralUtilities.getBoxHeight(screenHeight > 780 ? screenHeight * 0.1 : screenHeight * 0.11);
        const boxWidth = (screenWidth * 0.84) / 3;
        const hyMargin = screenWidth - (16 * 2);

        const beforeChange = (nextSlide) => {
            nextSlide = nextSlide % this.state.storyDom.length;
            this.setState({ activeItemIndex: nextSlide });

            this.bottomCardScratchCardCheck(nextSlide);
        }

        const smartAlertIcons = [
            {
                action: "boleto",
                icon: <img src={PayIcon} alt="Boleto" style={this.style.imgStyle} />
            },
            {
                action: "recharge",
                icon: <img src={PhoneIcon} alt="Recharge" style={this.style.imgStyle} />
            },
            {
                action: "credit_card",
                icon: <img src={CardIcon} alt="Invoice" style={this.style.imgStyle} />
            },
            {
                action: "cashin",
                icon: <img src={PixIcon} alt="cashin" style={this.style.imgStyle} />
            }
        ]
        return (
            <div style={{ position: "relative" }}>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div style={{ display: (!this.state.processing ? 'block' : 'none') }}>
                    <div>
                        <MuiThemeProvider theme={theme1}>
                            <div style={this.style.nameCardStyle}>
                                {this.state.nickName &&
                                    <span className="headline5 highEmphasis" style={{ width: "70%", display: "flex", justifyContent: "flex-left", textAlign: "left" }}>
                                        {GeneralUtilities.formattedString(localeObj.hello_user, [this.state.nickName])}
                                    </span>
                                }

                                {!this.state.nickName &&
                                    <span className="headline5 highEmphasis" style={{ width: "70%", display: "flex", justifyContent: "flex-start", textAlign: "left" }}>
                                        {localeObj.hello}
                                    </span>
                                }
                                <span style={{ width: "30%", display: "flex", justifyContent: "flex-end" }}>
                                    {this.state.showChat && /*set show chat to true to enable chatbot*/
                                        <TimeOutSpan onClick={() => this.handleMoveToChat()}>
                                            <ChatIcon style={{ marginLeft: "auto", marginRight: "0.5rem", fill: ColorPicker.darkHighEmphasis }} />
                                        </TimeOutSpan>
                                    }
                                    <TimeOutSpan onClick={() => this.help()}>
                                        <HelpIcon style={{
                                            marginLeft: "auto",
                                            marginRight: "0.5rem",
                                            fill: ColorPicker.darkHighEmphasis
                                        }} />
                                    </TimeOutSpan>
                                    <TimeOutSpan onClick={() => this.handleProfileclick()}>
                                        <Account style={{ fill: ColorPicker.darkHighEmphasis }} />
                                    </TimeOutSpan>
                                </span>
                            </div>
                            <div style={this.style.cardStyle}>
                                <div style={{ display: "flex" }}>
                                    <span className="body2 mediumEmphasis"
                                        style={{ color: ColorPicker.darkMediumEmphasis }}>
                                        {localeObj.total}
                                    </span>
                                </div>
                                <div style={{ marginTop: this.state.balance === "" ? "0" : "0.3rem", height: "2.4rem" }}>
                                    {this.state.balance === "" && this.state.showBalance && this.state.newOnboarding === false &&
                                        <div className="shimmer-container">
                                            <section className="shimmer-card-wraper">
                                                <div className="shimmer-card-bar shimming"></div>
                                                <div className="shimmer-card-bar shimming"></div>
                                            </section>
                                        </div>
                                    }
                                    {this.state.balance === "" && !this.state.showBalance &&
                                        <span style={{ textAlign: "center" }}>
                                            <span className="headline5 highEmphasis"
                                                style={{ marginRight: "0.25rem" }}>{"R$ "}</span>
                                            <span className="hidestyle headline5 highEmphasis">
                                                {"***"}</span>
                                        </span>
                                    }
                                    {this.state.showBalance && this.state.balance !== "" &&
                                        <span style={{ textAlign: "center" }}>
                                            <span className="headline5 highEmphasis"
                                                style={{ marginRight: "0.325rem" }}>{"R$"}</span>
                                            <span className="headline2 highEmphasis balanceStyle"
                                                style={{ marginRight: "0.125rem" }}>{GeneralUtilities.formatBalance(this.state.balance)}</span>
                                            <span
                                                className="pixSubScript headline5 highEmphasis">{"," + this.state.decimal}</span>
                                        </span>
                                    }
                                    {!this.state.showBalance && this.state.balance !== "" &&
                                        <span style={{ textAlign: "center" }}>
                                            <span className="headline5 highEmphasis"
                                                style={{ marginRight: "0.25rem" }}>{"R$ "}</span>
                                            <span className="hidestyle headline5 highEmphasis">
                                                {this.state.balance.toString().replace(/[-0-9]/g, "*")}{this.state.decimal.replace(/[0-9]/g, "*")}</span>
                                        </span>
                                    }
                                    {this.state.showBalance && this.state.balance !== "" &&
                                        <span className="hidestyle" onClick={() => this.showBalance("HIDE")} style={{ marginLeft: "1.2rem" }}>
                                            <VisibleIcon style={{ fill: ColorPicker.darkHighEmphasis }} />
                                        </span>
                                    }
                                    {!this.state.showBalance &&
                                        <span className="hidestyle" onClick={() => this.showBalance("SHOW")} style={{ marginLeft: "1.2rem" }}>
                                            <NotVisibleIcon style={{ fill: ColorPicker.darkHighEmphasis }} />
                                        </span>
                                    }
                                    {this.state.balance !== "" &&
                                        <span className="hidestyle" style={{ marginLeft: "0.75rem" }}>
                                            <TimeOutSpan onClick={() => this.refreshBalance()}>
                                                <RefreshIcon style={{ fill: ColorPicker.darkHighEmphasis }} />
                                            </TimeOutSpan>
                                        </span>
                                    }
                                </div>
                                {this.state.balance === "" && this.state.showBalance ? <div></div> :
                                    <div>
                                        <TimeOutSpan onClick={() => this.showHistory()}
                                            style={{ display: "inline-flex", alignItems: "center" }}>
                                            <span className="body2 duskHorizon">{localeObj.see_txn}</span>
                                            <ArrowIcon style={{
                                                fontSize: "0.65rem",
                                                marginLeft: "0.1rem",
                                                fill: ColorPicker.duskHorizon
                                            }} />
                                        </TimeOutSpan>
                                    </div>
                                }
                            </div>
                        </MuiThemeProvider>
                        <div style={{ display: (this.state.showLazyLoad ? 'block' : 'none') }}>
                            <div style={{ margin: "1rem", display: "flex", justifyContent: "center", position: "relative" }}>
                                <CircularProgress style={{ color: ColorPicker.loaderColor }} size={36} />
                            </div>
                        </div>
                        <div style={{ display: (this.state.NoRemSnackBarOpen ? 'block' : 'none'), margin: "0.5rem", marginTop: "0", position: "relative" }}>
                            <MuiThemeProvider theme={snackBarTheme}>
                                <MuiAlert elevation={6} variant="filled" icon={false}>
                                    {this.state.noReminderMessage}
                                </MuiAlert>
                            </MuiThemeProvider>
                        </div>
                        <div style={ImportantDetails.smartAlert ? { height: `${screenHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" } : {}}>
                            {ImportantDetails.smartAlert && ImportantDetails.latestAlertResp && (
                                <Carousel
                                    key={this.state.carouselKey}
                                    responsive={responsive}
                                    swipeable={ImportantDetails.latestAlertResp.length > 1}
                                    draggable={ImportantDetails.latestAlertResp.length > 1}
                                    showDots={ImportantDetails.latestAlertResp.length > 1}
                                    autoPlay={true}
                                    autoPlaySpeed={3000}
                                    keyBoardControl={false}
                                    containerClass="carousel-container"
                                    removeArrowOnDeviceType={["tablet", "mobile"]}
                                    dotListClass="custom-dot-list-style"
                                    itemClass="carousel-item-padding-40-px"
                                >
                                    {ImportantDetails.latestAlertResp.map((key, index) => {
                                        const alertText = this.smartAlertText(key)
                                        return (
                                            <div key={index} style={{ margin: "0rem 1rem" }}>
                                                <MuiThemeProvider theme={InputThemes.CardTheme}>
                                                    <Paper row className={classes.root} elevation="0"
                                                        style={{ backgroundColor: ColorPicker.newProgressBar }}>
                                                        {
                                                            smartAlertIcons.map((keys) => (
                                                                <div style={this.style.circle}>{key.remainderType === keys.action ? keys.icon : null}</div>
                                                            ))
                                                        }
                                                        <FlexView column className="Button1" style={{ width: "90%", margin: "0rem 1rem", color: ColorPicker.darkHighEmphasis }} onClick={(event) => { event.stopPropagation(); this.open(key) }}>
                                                            <div>{alertText.text}</div>
                                                            <div style={{ marginTop: "0.188rem", color: ColorPicker.smartDisplayData }}>
                                                                <span>{alertText.input1}</span>
                                                                <span style={{ marginLeft: "0.5rem" }}>
                                                                {alertText.icon && (<alertText.icon style={{ height: "15px", width: "15px", fill: ColorPicker.smartDisplayData, verticalAlign: "top" }} />)}&nbsp;
                                                                    {alertText.input2}
                                                                </span>
                                                            </div>
                                                        </FlexView>
                                                        <CloseIcon style={{ height: "19px", width: "10%", fill: ColorPicker.darkHighEmphasis, verticalAlign: "middle" }} onClick={() => this.removeReminder(key.type_id)} />
                                                    </Paper>
                                                </MuiThemeProvider>
                                            </div>
                                        )
                                    })}
                                </Carousel>
                            )}

                            <div style={{ marginLeft: "1.5rem" }}>
                                <span className="subtitle4 highEmphasis">
                                    {localeObj.operation}
                                </span>
                            </div>
                            <div style={{ margin: '1rem' }}>
                                <Grid container>
                                    {
                                        this.state.iconContentsVariable && this.state.iconContentsVariable.map((opt, key) => (
                                            <Grid align="center" item xs={4} key={key} style={{ display: (!opt.disable ? 'block' : 'none') }}>
                                                <TimeOutDiv onClick={() => this.imageClick(opt.action)} style={{ position: "relative" }}>
                                                    {opt.hasNewChip && <Chip className="label2" style={{ ...this.style.operationsNewChipStyle, backgroundColor: opt.isPopular ? ColorPicker.accent : ColorPicker.success, maxWidth: `${boxWidth}px` }}
                                                        label={opt.isPopular ? localeObj.popular : localeObj.new} />}
                                                    {opt.hasNewOffer && <Chip className="label2" style={{ ...this.style.operationsNewChipStyle, backgroundColor: opt.isPopular ? ColorPicker.accent : ColorPicker.success, maxWidth: `${boxWidth}px` }}
                                                        label={localeObj.new_credit_card_offer} />}
                                                    <Card align="center" style={{
                                                        height: `${boxHeight}px`,
                                                        width: `${boxWidth}px`,
                                                        backgroundColor: ColorPicker.newProgressBar,
                                                        borderRadius: "1.25rem",
                                                        marginBottom: "0.5rem",
                                                        flexDirection: "column",
                                                        padding: "0",
                                                        marginLeft: "auto",
                                                        marginRight: "auto",
                                                        maxWidth: `${this.state.maxWidth}px`,
                                                    }} elevation="0">
                                                        <div
                                                            style={{ marginTop: this.getOperationIconMargin(opt, boxHeight), textAlign: "center" }}>
                                                            {opt.icon}
                                                        </div>
                                                        <span className="label2 highEmphasis" style={{
                                                            display: "table-caption",
                                                            marginTop: this.getOperationContentMargin(opt, boxHeight)
                                                        }}>{opt.text}</span>
                                                    </Card>
                                                </TimeOutDiv>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </div>


                            <div style={{ display: (this.state.storyDom.length === 0 ? 'block' : 'none'), margin: "5%", marginTop: "0" }}>
                                <Card style={this.style.cardLazyLoadScrollStyle} >
                                    {<LoadingGrid />}
                                </Card>
                            </div>
                            <div style={{
                                display: (this.state.storyDom.length !== 0 ? 'block' : 'none'),
                                margin: "5%",
                                marginTop: "0"
                            }}>
                                <div
                                    style={this.style.cardScrollStyle}
                                    onMouseEnter={this.stopCarouselAutoLoopEvent}
                                    onMouseDown={this.stopCarouselAutoLoopEvent}
                                    onTouchStart={this.stopCarouselAutoLoopEvent}
                                    onMouseUp={this.startCarouselAutoLoopEvent}
                                    onMouseLeave={this.startCarouselAutoLoopEvent}
                                    onTouchEnd={this.startCarouselAutoLoopEvent}
                                >
                                    <Carousel
                                        ref={this.carouselRef}
                                        swipeable={this.state.storyDomSwipeable}
                                        draggable={this.state.storyDomDraggable}
                                        arrows={false}
                                        showDots={false}
                                        responsive={responsive}
                                        keyBoardControl={false}
                                        beforeChange={beforeChange}
                                        containerClass="carousel-container"
                                        deviceType={this.props.deviceType}
                                        dotListClass="custom-dot-list-style"
                                        itemClass="carousel-item-padding-40-px"
                                    >
                                        {
                                            this.state.storyDom.map((item, index) => {
                                                item.removeStoryFromCards = (storyId) => this.removeStoryFromCards(storyId);
                                                item.openSnackBar = (message) => this.openSnackBar(message);
                                                const storyDomObject = item.dom;
                                                const hasScratchCard =
                                                    GeneralUtilities.isNotEmpty(storyDomObject, false)
                                                    && GeneralUtilities.isNotEmpty(storyDomObject.scratchCover, false)
                                                    && storyDomObject.scratchcard
                                                    && !this.state.scratchedCards.includes(item.id);

                                                const domRenderElement = (<Card key={index} style={this.style.cardScrollStyle}>
                                                    {
                                                        !this.state.showStaticCards
                                                        && <DomRenderComponent
                                                            storydom={item}
                                                            onclickEngageCards={this.onclickEngageCards}
                                                            index={index} length={this.state.storyDom.length}
                                                        />
                                                    }
                                                    {
                                                        this.state.showStaticCards
                                                        && <Card
                                                            key={index}
                                                            style={{ borderRadius: "2rem", width: "100%", height: "100%", margin: "0", padding: "0" }}
                                                            onClick={() => this.onclickEngageCards(item.action)}
                                                        >
                                                            <img style={{ width: "100%", height: "100%", objectFit: "cover" }} src={item.image} alt=""></img>
                                                            <div style={{ position: 'absolute', top: "1rem", left: "1rem", width: "40%", textAlign: "left" }}>
                                                                <span className="headline5 highEmphasis">{item.text}</span>
                                                            </div>
                                                            <div style={{ position: 'absolute', bottom: "2rem", left: "1rem", width: "40%", textAlign: "left" }}>
                                                                <span className="label2 highEmphasis">{item.subtext}</span>
                                                            </div>
                                                        </Card>
                                                    }
                                                </Card>);

                                                if (hasScratchCard) {
                                                    const width = (window.innerWidth - 42) / 100 * parseInt(item.dom.parentsize.width);
                                                    const height = 11 * 16;
                                                    const scratchCardWrapperData = {
                                                        width,
                                                        height,
                                                        image: storyDomObject.scratchCover,
                                                        customBrush: CUSTOM_BRUSH_PRESET,
                                                        finishPercent: 40,
                                                        cardScratchAttempted: this.cardScratchAttempted,
                                                        cardScratchCompleted: this.cardScratchCompleted,
                                                        initialScratchCardHandler: this.initialScratchCardHandler,
                                                        card: item,
                                                        scratchedCards: this.state.scratchedCards
                                                    };

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="hasScratchCard"
                                                            data-index={index} data-story={item.id}
                                                            style={{ width: '100%', height }}
                                                        >
                                                            <ScratchCardWrapper {...scratchCardWrapperData}>{domRenderElement}</ScratchCardWrapper>
                                                        </div>
                                                    );
                                                }

                                                return domRenderElement;
                                            })
                                        }
                                    </Carousel>
                                </div>
                                {
                                    this.state.storyDom.length > 1
                                    && <FlexView column hAlignContent="center" style={{ paddingBottom: "5%", paddingTop: "2%" }}>
                                        <MuiThemeProvider theme={theme1}>
                                            <MobileStepper
                                                variant="dots"
                                                steps={this.state.storyDom.length}
                                                position="static"
                                                activeStep={this.state.activeItemIndex}
                                            />
                                        </MuiThemeProvider>
                                    </FlexView>
                                }
                            </div>
                            {/* hides FilterButton if there is only motopay webview support, also ensures responsive button*/}
                            <div style={{
                                width: `${hyMargin}px`, bottom: "1rem", marginLeft: "1rem", //position: "fixed"
                                display: "flex",
                                "flex-direction": this.state.isMotopayOnly ? "row-reverse" : "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                {!this.state.isMotopayOnly &&
                                    <FilterButton
                                        className="label1"
                                        onClick={this.onPrimary}>
                                        {localeObj.go_to_hy}
                                    </FilterButton>
                                }
                                <TimeOutDiv onClick={this.scan}>
                                    <Fab aria-label="add" className={classes.fab}><img src={QrIcon} alt="" /></Fab>
                                </TimeOutDiv>
                            </div>
                        </div>
                    </div>

                </div>
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div>
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                        <Drawer classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.open}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                    <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.wallet_exit}
                                    </div>
                                    <div className="body2 mediumEmphasis"
                                        style={{ textAlign: "center", marginTop: "1rem" }}>
                                        {this.state.isMotopayOnly ? localeObj.wallet_exit_desc_nmhy : localeObj.wallet_exit_desc}
                                    </div>
                                </FlexView>
                            </div>
                            <FlexView column hAlignContent='center' vAlignContent='center' style={{ width: "100%", marginBottom: "1.5rem" }}>
                                <PrimaryButtonComponent btn_text={localeObj.exit} onCheck={this.onPrimary} />
                                <SecondaryButtonComponent btn_text={localeObj.cancel}
                                    onCheck={this.onSecondary} />
                            </FlexView>
                        </Drawer>
                    </div>
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
                            <FlexView hAlignContent='center' vAlignContent='center' style={{ width: "100%", marginBottom: "1.5rem" }}>
                                <PrimaryButtonComponent btn_text={localeObj.motopay_continue}
                                    onCheck={handleContinue} />
                                <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }}
                                    onClick={handleClose}>
                                    {localeObj.not_now}
                                </div>
                            </FlexView>
                        </Drawer>
                    </div>
                    {this.state.gamInstantPopup && <InstantDialogComponent gamProgramData={this.state.gamProgramData} />}
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={this.state.cancelReminder ? constantObjects.CANCEL_ALERT_DURATION : constantObjects.SNACK_BAR_DURATION}
                            onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}

WalletLandingPageComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    deviceType: PropTypes.string
};

export default withStyles(styles)(WalletLandingPageComponent);
