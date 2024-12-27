import React from "react";
import "../../styles/main.css";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';
import moment from "moment";
import 'moment/locale/pt-br';
import jwtDecode from 'jwt-decode';

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants";
import arbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../Services/ArbiErrorResponsehandler';
import GeneralUtilities from "../../Services/GeneralUtilities";
import walletJwtService from "../../Services/walletJwtService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";

import face from "../../images/SpotIllustrations/Face.png";
import resume_onboarding from "../../images/SpotIllustrations/cc_onboarding.webp";
import success from "../../images/SpotIllustrations/credit_success.png";

import ChatBotUtils from "../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import InputPinPageWithValidation from "../CommonUxComponents/InputPinPageWithValidation";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import HistoryDisplayGrid from "./CreditCardComponents/CreditCardInvoiceHistory/HistoryDisplayGrid";
import TransactionHistoryReceipt from "./CreditCardComponents/CreditCardInvoiceHistory/TransactionHistoryReceipt";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import InputThemes from "../../Themes/inputThemes";
import { MuiThemeProvider, withStyles, styled } from "@material-ui/core/styles";
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import CircleIcon from '@mui/icons-material/Circle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import icon from "../../images/SpotIllustrations/Alert.png";
import { Image } from 'react-bootstrap';
import BackIcon from '@material-ui/icons/ArrowBack';
import winChanceIcon from "../../images/SpotIllustrations/cdi.png";
import cashbackIcon from "../../images/SvgUiIcons/cashback.svg";
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BarcodeIcon from "../../images/SvgUiIcons/BarCode.svg";
import ZeroLimitBackgroundImage from "../../images/SvgUiIcons/CCHomePageZeroUsedLimit.webp";

import LoadingGrid from "./CreditCardComponents/CreditCardLoadingGrid";
import CreditInvestmentAmountComp from "./CreditCardComponents/CreditInvestmentAmountComp";
import CreditCardInfoPage from "./CreditCardComponents/CreditCardInfoPage";
import CreditCardInvestmentInfo from "./CreditCardComponents/CreditCardInvestmentInfo";
import CreditCardDueDate from "./CreditCardComponents/CreditCardDueDate";
import CreditContract from "./CreditCardComponents/CreditContract";
import CreditCardSettingsComponent from "./CreditCardComponents/CreditCardSettingsPage";
import CreditCardSuccess from "./CreditCardComponents/CreditCardSuccess";
import CreditCardInvoicePaymentComponent from "./CreditPaymentComponents/InvoicePaymentComponent";
import InvoiceDetails from "./CreditPaymentComponents/InvoiceDetails";
import PageState from "../../Services/PageState";
import PixReceiveComponents from "../PIXComponent/PixNewRecieve/PixReceiveComponents";
import RegisterNewKeyComponent from "../PIXComponent/PixKeyHandleComponents/RegisterNewKeyComponent";
import CreditCardChangeDueDateComponent from "./CreditCardComponents/CreditCardChangeDueDateComponent";
import CreditCardInvoiceHistoryHomePage from "./CreditCardComponents/CreditCardInvoiceHistory/CreditCardInvoiceHistoryHomePage";
import CreditCardInvestmentComp from "./CreditCardComponents/CreditCardInvestmentComp";
import MetricServices from "../../Services/MetricsService";
import PixAmountComp from "./CreditCardComponents/PixAmountComp";
import NewUtilities from "../../Services/NewUtilities";
import CreditCardResumeOnboarding from "./CreditCardComponents/CreditCardResumeOnboarding";
import ColorPicker from "../../Services/ColorPicker";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.CreditCardComponents;
var localeObj = {};
const CAMERA_PERMISSION = "android.permission.CAMERA";
const CAF_LOGS = "CAF_FACELIVENESS";
const FACELIVENESS_SUCCESS = "FACELIVENESS_SUCCESS";
const FACELIVENESS_FAILURE = "FACELIVENESS_FAILURE";
const FACELIVENESS_URI = "GET_LIVENESS_METRICS_FOR_CAF";

var caf_start_time = "";

const BorderLinearProgress = styled(LinearProgress)(() => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: ColorPicker.tableBackground,
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: ColorPicker.accent,
    },
}));
class CreditCardComponenet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardStatus: "",
            direction: "",
            snackBarOpen: false,
            message: "",
            processing: false,
            open: false,
            bottomSheetOpen: false,
            bottomSheetEnabled: false,
            noCardbottomSheetOpen: false,
            appBar: "",
            toc: "<h1>  </h1>",
            showMoreDetails: false,
            creditStatus: {},
            visaExists: false,
            cardActive: false,
            cardErrorShown: false,
            blockInvoicePaymentDuetoAutomaticDebitSheet: false,
            autoDebit: false,
            redeemStatus: false,
            investMoreStatus: false,
            usedLimitZero: false,
            previousComponent: "DimoHomePage",
            isClickable: false,
            openResumeOnboardingBS: false,
            editedOnboardingParams: false,
            isAlive: false,
            transactionHistory: "loading",
            transactionHistoryData: [],
            investmentAmount: "",
            creditInvestmentInfo: {
                minInvestment: 50,
                maxInvestment: 20000
            }
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.unblocked = "Desbloqueado";
        this.style = {
            textStyle: {
                margin: "1rem"
            },
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            cardStyle2: {
                width: "100%",
                borderRadius: "1.25rem",
                marginBottom: "1rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            smallCardStyle: {
                width: "5rem",
                height: "5rem",
                borderRadius: "1rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            itemStyle: {
                display: "flex",
                justifyContent: "space-between",
                margin: "5% 0",
                align: 'left'
            }
        }
    }

    componentDidMount = () => {
        const tz = androidApiCalls.getLocale() === "en_US" ? "en" : "pt-br";
        moment.locale(tz);
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
        this.fetchTokenForCAF(ImportantDetails.cpf);

        window.onBackPressed = () => {
            this.onBack();
        }
        this.showProgressDialog();
        this.setState({
            appBar: localeObj.credit_card
        });
        this.componentName = PageNameJSON['credit_card_homepage']
        arbiApiService.getGuaranteedCreditStatus(this.componentName).then(response => {
            //Log.sDebug("getGuaranteedCreditStatus: response: " + JSON.stringify(response));
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processGuaranteedCreditStatusResponse(response.result);
                //Log.sDebug("getGuaranteedCreditStatus: processedDetails: " + JSON.stringify(processedDetails));

                if (processedDetails.success) {
                    ImportantDetails.creditStatus = processedDetails.creditStatus.cardStatus;
                    this.setState({
                        creditStatus: processedDetails.creditStatus
                    })
                    if (this.state.creditStatus) {
                        let creditStatus = this.state.creditStatus;
                        //Log.sDebug("cardStatus:" + creditStatus.cardStatus);
                        switch (creditStatus.cardStatus) {
                            case 0:
                                this.componentName = PageNameJSON['card_info'];
                                this.checkIfDimoCardActive(0);
                                break;
                            case 1:
                                this.componentName = PageNameJSON['credit_contract'];
                                this.resumeOnboarding();
                                break;
                            case 2:
                            case 3:
                            case 4:
                                this.componentName = PageNameJSON['credit_success'];
                                this.hideProgressDialog();
                                this.setState({
                                    cardStatus: "credit_success",
                                    direction: "left"
                                });
                                break;
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                                this.componentName = PageNameJSON['credit_card_homepage'];
                                //this.checkIfDimoCardActive(creditStatus.cardStatus);
                                this.getHomePageDetails(true);
                                break;
                            default:{
                                this.hideProgressDialog();
                                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                                this.setTransactionInfo(errorJson);
                            }
                                break;
                        }
                    }
                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });

        window.onPassiveLivenessImage = (selfieImage) => {
            this.setState({
                selfie: selfieImage
            });
        }

        window.onFaceLivenessImage = (imageUrl, jwt) => {
            Log.sDebug("onActiveFaceLivenessImage " + imageUrl + " " + jwt);
            try {
                let i = jwt.lastIndexOf(".");
                let subjwt = jwt.substr(0, i);
                Log.sDebug("onActiveFaceLivenessImage sub test " + " : " + subjwt);
                const decodedToken = jwtDecode(subjwt);
                Log.sDebug("decodedToken : " + decodedToken + " : " + decodedToken.isAlive + " : " + decodedToken.userId + " : " + decodedToken.requestId);
                if (imageUrl && decodedToken && decodedToken.isAlive) {
                    this.setState({
                        isAlive: decodedToken.isAlive
                    });
                    this.setState({
                        selfie: imageUrl
                    });
                }
            } catch (error) {
                Log.sDebug('Error decoding JWT token:', error);
                return null;
            }
        }

        window.onPassiveLivenessStatus = (faceLiveJson) => {
            //Log.sDebug("onPassiveLivenessStatus:", faceLiveJson);
            let finalFaceLivenessJSON = faceLiveJson;
            if (finalFaceLivenessJSON) {
                //Log.sDebug("Faceliveness SDK compelte. Logs " + JSON.stringify(finalFaceLivenessJSON));
                if (finalFaceLivenessJSON.sdkStatusCode && finalFaceLivenessJSON.sdkStatusCode === 1) {
                    this.uploadSelfieDocWithCAF(this.state.selfieImage);
                } else {
                    this.hideProgressDialog();
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.getCAFFailureText(finalFaceLivenessJSON.sdkStatusMessage, localeObj)
                    });
                }
            } else {
                this.hideProgressDialog();
                //Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.retry_later
                })
            }
        }

        window.onFaceLivenessStatus = (faceLive) => {
            Log.sDebug("onActiveFaceLivenessStatus : " + faceLive);
            let finalFaceLiveness = faceLive;
            let timeSpentOnCAF = new Date().getTime() - caf_start_time;
            if (finalFaceLiveness) {
                Log.sDebug("Faceliveness SDK compelte. Logs " + finalFaceLiveness);
                if (finalFaceLiveness && finalFaceLiveness === "Success") {
                    if (this.state.isAlive) {
                        GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj, PageNameJSON['credit_facematch']);
                        this.uploadSelfieDocWithCAF(this.state.selfieImage);
                    } else {
                        this.hideProgressDialog();
                        Log.sDebug("Active Faceliveness SDK Failure due to isAlive false", CAF_LOGS, constantObjects.LOG_PROD);
                        this.openSnackBar(GeneralUtilities.getCAFFailureText("1", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON['credit_facematch']);
                    }
                } else {
                    this.hideProgressDialog();
                    Log.sDebug("Faceliveness SDK Failure with status code 0");
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.getCAFFailureText("0", localeObj)
                    });
                }
            } else {
                this.hideProgressDialog();
                Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.setState({
                    snackBarOpen: true,
                    message: GeneralUtilities.getCAFFailureText("0", localeObj)
                });
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === true) {
                    this.doFaceMatch();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            cameraAlert: true
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.allow_camera
                        })
                    }
                }
            }
        }

    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
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

    async checkIfDimoCardActive(status) {
        this.showProgressDialog();
        let response = {};
        if (Object.keys(ImportantDetails.cardDetailResponse).length === 0 ||
            ImportantDetails.cardDetailResponse == {} ||
            ImportantDetails.cardDetailResponse === null ||
            ImportantDetails.cardDetailResponse === undefined) {
            await arbiApiService.getCardDetails(this.componentName).then(cardResponse => {
                response = cardResponse;
                if (response === null ||
                    response === undefined ||
                    response.length === 0 ||
                    response.success === 'false' ||
                    (response.status !== 201 && response.status !== 200)) {
                    ImportantDetails.cardDetailResponse = {};
                } else {
                    ImportantDetails.cardDetailResponse = response;
                }
            });
        } else {
            response = ImportantDetails.cardDetailResponse;
        }
        // arbiApiService.getCardDetails().then(response => {
        this.setState({
            cardErrorShown: false
        });
        if (response && response.success) {
            let processedDetails = ArbiResponseHandler.processGetCardDetailsApi(response.result);
            if (processedDetails.success) {
                let listCards = [];
                if (processedDetails.virtualCardDetails) {
                    let virtualDetails = [];
                    if(processedDetails.virtualCardDetails){
                        processedDetails.virtualCardDetails.forEach((opt) => {
                            let jsonObject = {};
                            jsonObject["cardType"] = "virtual";
                            jsonObject["name"] = opt.nomeImpresso;
                            jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
                            jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
                            jsonObject["cardKey"] = opt.chaveDeCartao;
                            jsonObject["status"] = opt.descricaoStatusCartao;
                            jsonObject["brand"] = opt.bandeiraNome;
                            jsonObject["idStatusCartao"] = opt.idStatusCartao;
                            virtualDetails.push(jsonObject)
                            listCards.push(jsonObject);
                            if (opt.bandeiraNome === "VISA") {
                                this.setState({ visaExists: true })
                            }
                            if (opt.bandeiraNome === "VISA" && opt.descricaoStatusCartao === this.unblocked) {
                                this.setState({ cardActive: true })
                            }
                        });
                    }
                    this.setState({ virtualDetails: virtualDetails })
                }
                if (processedDetails.physicalCardDetails) {
                    let physicalDetails = [];
                    if(processedDetails.physicalCardDetails){
                        processedDetails.physicalCardDetails.forEach((opt) => {
                            let jsonObject = {};
                            jsonObject["cardType"] = "physical";
                            jsonObject["name"] = opt.nomeImpresso;
                            jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
                            jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
                            jsonObject["cardKey"] = opt.chaveDeCartao;
                            jsonObject["status"] = opt.descricaoStatusCartao;
                            jsonObject["brand"] = opt.bandeiraNome;
                            jsonObject["idStatusCartao"] = opt.idStatusCartao;
                            physicalDetails.push(jsonObject)
                            listCards.push(jsonObject);
                            if (opt.bandeiraNome === "VISA") {
                                this.setState({ visaExists: true })
                            }
                            if (opt.bandeiraNome === "VISA" && opt.descricaoStatusCartao === this.unblocked) {
                                this.setState({ cardActive: true })
                            }
                        });
                    }
                    this.setState({ physicalDetails: physicalDetails })
                }
                this.setState({ listCards: listCards });


            } else {
                if (processedDetails.error === "NO_CARDS") {
                    //Log.sDebug("Account has no phyiscal cards or virtual cards");
                    if (status === 0) {
                        this.setState({
                            cardStatus: "cardError",
                            cardHeader: localeObj.no_cards_head,
                            cardDesc: localeObj.no_cards_desc,
                            cardErrorShown: true,
                            appBar: localeObj.no_cards_appbar

                        })
                    }
                    this.hideProgressDialog();

                } else if (processedDetails.error === "VIRTUAL_CARD_ONLY") {

                    //Log.sDebug("Account has no phyiscal cards, just virtual card");
                    let virtualDetails = [];
                    if(processedDetails.virtualCardDetails){
                        processedDetails.virtualCardDetails.forEach((opt) => {
                            let jsonObject = {};
                            jsonObject["cardType"] = "virtual";
                            jsonObject["name"] = opt.nomeImpresso;
                            jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
                            jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
                            jsonObject["cardKey"] = opt.chaveDeCartao;
                            jsonObject["status"] = opt.descricaoStatusCartao;
                            jsonObject["brand"] = opt.bandeiraNome;
                            jsonObject["idStatusCartao"] = opt.idStatusCartao;
                            virtualDetails.push(jsonObject)
                            if (opt.bandeiraNome === "VISA") {
                                this.setState({ visaExists: true })
                            }
                            if (opt.bandeiraNome === "VISA" && opt.descricaoStatusCartao === this.unblocked) {
                                this.setState({ cardActive: true })
                            }
                        });
                    }
                    this.setState({
                        virtualDetails: virtualDetails,
                        noPhysicalCard: true
                    });

                } else {
                    this.hideProgressDialog();
                    this.setState({
                        cardErrorShown: true
                    });

                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            }
        } else {
            this.hideProgressDialog();
            this.setState({
                cardErrorShown: true
            })

            let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
            this.setTransactionInfo(errorJson);

        }
        if (status === 0)
            this.checkCardStatus();
        else
            this.getHomePageDetails(true);
        // });

    }

    setUserBalance = (editAmount = false) => {
        this.showProgressDialog();
        arbiApiService.getUserBalance(PageNameJSON.credit_invest_amount)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        GeneralUtilities.setBalanceToCache(processorResponse.balance);
                        this.hideProgressDialog();
                        if (editAmount) {
                            this.setState({
                                balance: processorResponse.balance,
                                cardStatus: "credit_edit_amount",
                                appBar: localeObj.new_dimo_credit_investment,
                                previousComponent: this.state.currentState,
                                direction: "right"
                            });
                        } else {
                            this.setState({
                                balance: processorResponse.balance,
                                cardStatus: "credit_invest_amount",
                                appBar: localeObj.credit_card_welcome_benifits_banner_title,
                                previousComponent: this.state.currentState,
                                direction: "right"
                            });
                        }

                    } else {
                        this.hideProgressDialog();
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            });
    }

    checkCardStatus = () => {
        this.hideProgressDialog();
        if (this.state.cardErrorShown)
            return;
        if (this.state.visaExists && this.state.cardActive) {
            this.setState({
                cardStatus: "card_info",
                appBar: localeObj.dimo_card,
                direction: "left"
            })
        }
        else if (!this.state.visaExists) {
            this.setState({
                cardStatus: "cardError",
                cardHeader: localeObj.no_dimo_cards_head,
                cardDesc: localeObj.no_cards_dimo_desc,
                appBar: localeObj.no_cards_appbar

            })
        } else if (!this.state.cardActive) {
            this.setState({
                cardStatus: "cardError",
                cardHeader: localeObj.no_cards_head,
                cardDesc: localeObj.no_cards_desc,
                appBar: localeObj.no_cards_appbar

            })
        }
    }


    goToCardsPage = () => {
        this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
    }


    showErrorScreen = () => {
        let jsonObj = {};
        jsonObj["error"] = true;
        jsonObj["reason"] = "generic_error";
        this.setTransactionInfo(jsonObj);
    }

    fetchTokenForCAF = async (cpf) => {
        await Promise.all([await walletJwtService.CAFAuthentication(cpf)]).then(async values => {
            if (GeneralUtilities.emptyValueCheck(values[0])) {
                //Log.sDebug("Retrying for token as value is empty");
                await walletJwtService.CAFAuthentication(cpf)
            }
        }).catch(async () => {
            //Log.sDebug("Retrying for token as due to following error " + err);
            await walletJwtService.CAFAuthentication(cpf)
        })
    }

    pixAmountPage = () => {
        this.setState({
            cardStatus: "credit_pix_amount",
            appBar: localeObj.pix_header,
            direction: "left",
        })
    }

    sendPixToMyAccount = async (amount, decimal, displayAmount = 0) => {
        //Log.sDebug("sendPixToMyAccount: amount: " + amount + " decimal: " + decimal);
        let limit = parseFloat(amount + "." + decimal);
        this.sendEventMetrics(constantObjects.sendPix, PageNameJSON["credit_invest_amount"]);
        this.setState({
            creditLimit: limit,
            investmentAmount: displayAmount
        });
        let response = {};
        if (ImportantDetails.pixKeysResponse === null ||
            ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey
            || Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
            this.showProgressDialog();
            await arbiApiService.getAllPixKeys(PageNameJSON["credit_invest_amount"]).then(pixResponse => {
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
                    this.setState({
                        cardStatus: "receive_pix",
                        location: {
                            additionalInfo: {
                                pixActions: "pix_receive",
                                amount: amount,
                                decimal: decimal,
                                entryPoint: "pixReceiveCreditCard"
                            },
                            subDeepLink: true
                        }
                    })
                }
            } else {
                this.showErrorScreen();
                Log.sDebug("CreditCardComponent|" + ImportantDetails.accountKey + " there is some error " + JSON.stringify(response));
            }
        } else {
            let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
            this.setTransactionInfo(errorJson);
        }

        Log.debug("registered keys are " + this.state.myKeys, "credit_card_component");
    }

    registerKey = () => {
        //this.setState({ bottom: false });
        // Log.sDebug("clicked register key", "credit card page");
        this.setState({
            bottom: false,
            cardStatus: "register_key"
        });

    }

    handleClose = () => {
        this.setState({ bottom: false });
    }

    cancelAutomaticDebitDrawer = () => {
        let event = constantObjects.creditCardInvoicePayment
        this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
        this.setState({
            cardStatus: "invoice_payment",
            direction: "left",
            blockInvoicePaymentDuetoAutomaticDebitSheet: false
        });
        //this.setState({ blockInvoicePaymentDuetoAutomaticDebitSheet: false });
    }

    uploadSelfieDocWithCAF(selfieImage) {
        let selfieClicked = GeneralUtilities.emptyValueCheck(selfieImage) ? this.state.selfie : selfieImage;
        let jsonObjectSelfie = {
            "url": selfieClicked,
            "extensao": 2

        }
        this.signCreditContract(jsonObjectSelfie);
        /* arbiApiService.uploadSelfieWithCAF(jsonObjectSelfie)
             .then(response => {
                 this.hideProgressDialog();
                 if (response.success) {
                     let processorResponse = ArbiResponseHandler.processUploadSelfieDocResponse(response.result);
                     if (processorResponse && processorResponse.success) {
                         let nextUrl = this.state.nextUrl ? this.state.nextUrl : "/validateIdCreation";
                         this.props.history.replace({ pathname: nextUrl, state: this.state.nextUrlPayload });
                     } else {
                         this.openSnackBar(localeObj.error_selfie);
                     }
                 } else {
                     this.openSnackBar(localeObj.error_selfie);
                 }
             });*/
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo && !!formInfo.error) {
            //Log.sDebug("Error occured: " + formInfo.error);
            this.hideProgressDialog();
            let jsonObj = {}
            jsonObj["header"] = localeObj.gpay_error_header;
            switch (formInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "account_unavailable":
                    jsonObj["description"] = localeObj.pix_account_unavailable;
                    break;
                case "time_limit_exceeded":
                    jsonObj["description"] = localeObj.pix_time_limit_exceeded;
                    break;
                case "insufficient_balance":
                    jsonObj["header"] = localeObj.insufficient_balance
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
                    break;
                case "insufficient_balance_pix":
                    jsonObj["header"] = localeObj.insufficient_balance
                    jsonObj["description"] = GeneralUtilities.formattedString(localeObj.credit_pix_insufficient_bal, [formInfo.amount])
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                case "detalhes_error":
                    jsonObj["header"] = formInfo.title;
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = formInfo.reason;
                    break;
            }
            this.setState({
                cardStatus: "error",
                direction: "left",
                creditErrorJson: jsonObj
            })
        } else {
            switch (this.state.cardStatus) {
                case "credit_invest":
                    this.sendEventMetrics(constantObjects.investConfirm, PageNameJSON["credit_invest"]);
                    this.setUserBalance();
                    break;
                case "credit_invest_amount":
                    this.setState({
                        cardStatus: "credit_due_date",
                        appBar: localeObj.credit_card_welcome_benifits_banner_title,
                        direction: "left"
                    })
                    break;
                case "credit_due_date":
                    this.sendEventMetrics(constantObjects.dueDate, PageNameJSON["credit_due_date"]);

                    this.setState({
                        dueDate: formInfo,
                        //bottomSheetOpen: true
                    }, () => {
                        this.configureCreditParams(true);
                    });
                    break;
                case "credit_edit_due_date":
                    this.sendEventMetrics(constantObjects.dueDate, PageNameJSON["credit_edit_due_date"]);

                    this.setState({
                        dueDate: formInfo,
                        cardStatus: "credit_resume_onboarding",
                        appBar: localeObj.resume_cc_appbar
                    });
                    break;
                case "credit_contract":
                    this.sendEventMetrics(constantObjects.acceptContract, PageNameJSON["credit_contract"]);
                    this.showProgressDialog();
                    arbiApiService.getUserBalance(PageNameJSON.credit_contract).then(response => {
                        if (response.success) {
                            let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                            if (processorResponse.success) {
                                let amount = parseInt(androidApiCalls.getFromPrefs("creditInvestedAmount"));
                                GeneralUtilities.setBalanceToCache(processorResponse.balance);
                                if (processorResponse.balance < amount) {
                                    let jsonObj = {};
                                    jsonObj["error"] = true;
                                    jsonObj["errorCode"] = 422;
                                    jsonObj["reason"] = "insufficient_balance_pix"
                                    jsonObj["amount"] = amount
                                    this.hideProgressDialog();
                                    this.setTransactionInfo(jsonObj);
                                } else {
                                    this.hideProgressDialog();
                                    this.setState({
                                        cardStatus: "credit_pin_input",
                                        appBar: localeObj.pix_authentication,
                                        direction: "left",
                                    })
                                }
                            } else {
                                this.hideProgressDialog();
                                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                                this.setTransactionInfo(errorJson);
                            }
                        } else {
                            this.hideProgressDialog();
                            let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                            this.setTransactionInfo(errorJson);
                        }
                    });
                    break;
                case "credit_facematch":
                    this.goToHomePage();
                    break;
                default:
                    break;
            }
        }
    }

    getHomePageDetails = (deepLinkNavigation) => {
        if (this.state.cardErrorShown)
            return;
        this.showProgressDialog();
        arbiApiService.getCreditCardData(this.componentName).then(response => {
                if (response.success) {
                    //Log.sDebug("Credit Card Home page details Fetched", "Credit Card Home Page");
                    let processorResponse = ArbiResponseHandler.processCreditCardDetailsData(response.result);
                    if (processorResponse.success) {
                        let cpValue = 0;
                        let usedLimitBanner = false;
                        if (processorResponse.availableLimit > 0) {
                            if (processorResponse.usedLimit >= 0) {
                                cpValue = parseFloat((processorResponse.usedLimit / (processorResponse.usedLimit + processorResponse.availableLimit)) * 100).toFixed(2)
                            } else {
                                cpValue = 0;
                            }
                        } else if (processorResponse.availableLimit === 0) {
                            cpValue = 0;
                        } else {
                            if (processorResponse.usedLimit > 0) {
                                cpValue = 100
                            } else {
                                cpValue = 0
                            }
                        }
                        if (processorResponse.usedLimit === 0) {
                            usedLimitBanner = true
                        }
                        this.setState({
                            usedLimitZero: usedLimitBanner,
                            usedLimit: processorResponse.usedLimit,
                            usedLimitAmount: GeneralUtilities.formatBalance(processorResponse.usedLimit.toString().split(".")[0]),
                            usedLimitDecimal: NewUtilities.formatDecimal(processorResponse.usedLimit.toString().split(".")[1]),
                            availableLimit: processorResponse.availableLimit,
                            availableLimitAmount: GeneralUtilities.formatBalance(processorResponse.availableLimit.toString().split(".")[0]),
                            availableLimitDecimal: NewUtilities.formatDecimal(processorResponse.availableLimit.toString().split(".")[1]),
                            totalLimit: processorResponse.totalLimit,
                            totalLimitAmount: GeneralUtilities.formatBalance(processorResponse.totalLimit.toString().split(".")[0]),
                            totalLimitDecimal: NewUtilities.formatDecimal(processorResponse.totalLimit.toString().split(".")[1]),
                            invoiceDueDate: moment(processorResponse.dueDate).format('DD'),
                            dueDate: moment(processorResponse.dueDate).format('DD/MM/YYYY'),
                            bestDate: processorResponse.bestDay,
                            processDueDate: processorResponse.dueDate,
                            creditPercentage: cpValue,
                            invoiceStatus: this.getInvoiceStatusString(processorResponse.status),
                            value: processorResponse.valor,
                            valueAmount: GeneralUtilities.formatBalance(processorResponse.valor.toString().split(".")[0]),
                            valueDecimal: NewUtilities.formatDecimal(processorResponse.valor.toString().split(".")[1]),
                            autoDebit: processorResponse.autoDebit,
                            invoiceId: processorResponse.invoiceId,
                            redeemStatus: processorResponse.redeemStatus,
                            cardStatus: "credit_card_homepage",
                            direction: "left",
                            appBar: localeObj.credit_card,
                            transactionHistory: "loading",
                            processing: false
                        });
                        if (deepLinkNavigation === true && this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
                            let action = this.props.location.additionalInfo["creditActions"];
                            if (action !== "" && action !== undefined) {
                                if (action === "invoiceDetails") {
                                    this.openInvoiceDetails();
                                } else if (action === "invoicePayment") {
                                    this.payInvoice();
                                } else if (action === "invoiceHistory") {
                                    this.openInvoiceHistory();
                                } else if (action === "investMentHomePage" || action === "investMore" || action === "redeem") {
                                    this.openInvestmentPage();
                                } else if (action === "creditCardSettings" || action === "changeDueDate" || action === "automaticDebit") {
                                    this.openSettingsPage();
                                }

                            }
                        }
                        ImportantDetails.autoDebit = processorResponse.autoDebit;
                        arbiApiService.getCreditCardTransactionHistory(moment().subtract(90, "days"), moment(), this.componentName).then(response => {
                            //Log.sDebug("getCreditCardTransactionHistory, response.success" + JSON.stringify(response));  
                            if (response.success) {
                                //Log.sDebug("getCreditCardTransactionHistory, response.success" + JSON.stringify(response));
                                let processorResponse = ArbiResponseHandler.processCreditCardTransactionHistoryData(response.result);
                                //Log.sDebug("getCreditCardTransactionHistory, processorResponse" + JSON.stringify(processorResponse));
                                if (processorResponse.success) {
                                    let tranArray = [];
                                    tranArray = processorResponse.transactionData;
                                    let transactionHistoryList = GeneralUtilities.transactionHistoryDateOrganizer(tranArray, localeObj);
                                    let finalArray = transactionHistoryList.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
                                    //Log.sDebug("transactionHistoryList:" + JSON.stringify(finalArray));
                                    //Log.sDebug("transactionHistoryList--isArrayEmpty: " + GeneralUtilities.isArrayEmpty(finalArray));

                                    if (!GeneralUtilities.isArrayEmpty(finalArray)) {
                                        this.setState({
                                            transactionHistoryData: finalArray,
                                            transactionHistory: "data_available"
                                        })
                                    } else {
                                        this.setState({
                                            transactionHistoryData: [],
                                            transactionHistory: "data_not_available"
                                        });
                                    }
                                    // if (!(this.state.visaExists && this.state.cardActive)) {
                                    //     this.setState({
                                    //         noCardbottomSheetOpen: true,
                                    //         bottomSheetheader: localeObj.no_cards_bottom_head,
                                    //         bottomSheetdescription: localeObj.no_cards_bottom_desc,
                                    //         bottomBtnText: localeObj.no_cards_bottom_btn
                                    //     })
                                    // }
                                } else {
                                    //Log.sDebug("getCreditCardTransactionHistory, processorResponse, failed");
                                    //this.hideProgressDialog();
                                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                                    //this.setTransactionInfo(errorJson);
                                    this.setState({
                                        transactionHistoryData: [],
                                        transactionHistory: "data_fetch_error",
                                        transactionHistoryDataFetchErrorTitle: errorJson.title,
                                        transactionHistoryDataFetchErrorDescriptor: errorJson.descriptor
                                    });
                                }
                            } else {
                                //Log.sDebug("getCreditCardTransactionHistory, failed");
                                //this.hideProgressDialog();
                                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                                //this.setTransactionInfo(errorJson);
                                this.setState({
                                    transactionHistoryData: [],
                                    transactionHistory: "data_fetch_error",
                                    transactionHistoryDataFetchErrorTitle: errorJson.title,
                                    transactionHistoryDataFetchErrorDescriptor: errorJson.descriptor
                                });
                            }

                        })
                        //Log.sDebug("getCreditCardData, successful");
                    } else {
                        this.hideProgressDialog();
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                        this.setTransactionInfo(errorJson);
                        //Log.sDebug("getCreditCardData, Error getting credit card deatils");
                    }
                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                    //Log.sDebug("getCreditCardData failed");
                }
            });
    }


    onPixReceiveContinue = () => {
        this.setUserBalance();
    }

    investMoneyCreditCard = () => {
        this.showProgressDialog();
        arbiApiService.getGuaranteedCreditInvestmentInfo(this.componentName).then(response => {
            //Log.sDebug("getGuaranteedCreditInvestmentInfo: response: " + JSON.stringify(response));
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processGuaranteedCreditInvestmentInfoResponse(response.result);
                if (processedDetails.success) {
                    //Log.sDebug("getGuaranteedCreditInvestmentInfo: processedDetails: " + JSON.stringify(processedDetails));
                    this.setState({
                        creditInvestmentInfo: processedDetails.creditInvestmentInfo
                    })
                    this.hideProgressDialog();
                    this.sendEventMetrics(constantObjects.investConfirm, PageNameJSON["card_info"]);
                    this.setUserBalance();
                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });

    }

    investMoneyCreditCardOnRequest = (editAmount = false) => {
        if (!editAmount) {
            this.setState({
                cardStatus: "credit_invest",
                appBar: localeObj.new_dimo_credit_investment,
                direction: "left"
            })
        } else {
            this.setUserBalance(true);
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        //Log.sDebug("hideProgressDialog");
        this.setState({
            processing: false
        })
    }

    help = () => {
        GeneralUtilities.openHelpSection();
    }


    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false
        })
        this.configureCreditParams(true);
    }

    onSecondary = () => {
        this.setState({
            bottomSheetOpen: false,
        })
        this.configureCreditParams(false);
    }

    search = () => {
        //Log.sDebug("CreditCardHomePage, search");
        this.props.history.replace({ pathname: "/creditCardHistoryPage", transition: "right" });

    }

    openInvoiceHistory = () => {
        this.setState({
            cardStatus: "invoice_history",
            direction: "left"
        });
    }

    openInvestmentPage = () => {
        this.setState({
            cardStatus: "investment",
            direction: "left"
        });
    }

    onSelectTransaction = (transactionDetails) => {
        //Log.sDebug("onSelectTransaction, transactionDetails: " + JSON.stringify(transactionDetails));
        this.setState({
            cardStatus: "transactionDetails",
            transactionDetails: transactionDetails,
            appBar: localeObj.transaction_receipt
        })
    }

    noCardonPrimary = () => {
        this.setState({
            noCardbottomSheetOpen: false
        });
    }

    configureCreditParams = (autoDebit) => {
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["creditLimit"] = this.state.creditLimit;
        jsonObj["dueDate"] = this.state.dueDate;
        jsonObj["autoDebit"] = autoDebit;
        androidApiCalls.storeToPrefs("creditInvestedAmount", this.state.creditLimit);
        //Log.sDebug("jsonObj" + JSON.stringify(jsonObj));
        arbiApiService.configureCreditCard(jsonObj, this.componentName).then(response => {
            //Log.sDebug("configureCreditCard: response: " + JSON.stringify(response));
            if (response.success) {
                /*let processorResponse = ArbiResponseHandler.processCleanConfigureCreditResponse(response.result);
                if (processorResponse.success) {
                    this.fetchCreditContract();
                }*/
                this.setState({
                    creditLimitPrev: this.state.creditLimit,
                    dueDatePrev: this.state.dueDate
                });
                this.fetchCreditContract();

            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    fetchCreditContract = () => {
        this.showProgressDialog();
        arbiApiService.fetchCreditContract(this.componentName).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("fetchCreditContract: " + JSON.stringify(response));
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditContractResponse(response.result);
                //Log.sDebug("fetchCreditContract: processorResponse: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    if (GeneralUtilities.emptyValueCheck(processorResponse.toc)) {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                        this.setTransactionInfo(errorJson);
                    } else {
                        this.setState({
                            toc: processorResponse.toc,
                            contractId: processorResponse.contractId,
                            cardStatus: "credit_contract",
                            appBar: localeObj.contract,
                            direction: "left"
                        })
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    getCreditContract = () => {
        this.showProgressDialog();
        arbiApiService.getCreditContract(this.componentName).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("getCreditContract: " + JSON.stringify(response));
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditContractResponse(response.result);
                //Log.sDebug("getCreditContract: processorResponse: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    if (GeneralUtilities.emptyValueCheck(processorResponse.toc)) {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                        this.setTransactionInfo(errorJson);
                    } else {
                        this.setState({
                            toc: processorResponse.toc,
                            contractId: processorResponse.contractId,
                            cardStatus: "credit_contract",
                            appBar: localeObj.contract,
                            direction: "left"
                        })
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    faceMatchScreen = (token) => {
        this.sendEventMetrics(constantObjects.inputPin, PageNameJSON["credit_pin_input"]);
        this.setState({
            appBar: localeObj.faceMatch,
            cardStatus: "credit_facematch",
            direction: "left",
            token: token
        })
    }

    doFaceMatch = () => {
        this.sendEventMetrics(constantObjects.facematch, PageNameJSON["credit_facematch"]);
        caf_start_time = new Date().getTime();
        if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
            if (GeneralUtilities.isCAFEnabled()) {
                if (androidApiCalls.isFeatureEnabledInApk("FACE_LIVELINESS") && GeneralUtilities.doesDeviceSupportActiveFaceliveness()) {
                    androidApiCalls.faceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                } else {
                    androidApiCalls.passiveFaceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                }

            }
            else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.facematch_not_sup
                })
            }
        } else {
            androidApiCalls.requestPermission(CAMERA_PERMISSION);
        }


    }

    toggleShowMoreDetails = () => {
        let event = constantObjects.contractCreditCardHomeDetails
        if (!this.state.showMoreDetails) {
            event = constantObjects.expandCreditCardHomeDetails
        }
        this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
        this.setState({
            showMoreDetails: !this.state.showMoreDetails
        });
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    openSettingsPage = () => {
        let event = constantObjects.creditCardSettings
        this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
        this.setState({
            cardStatus: "credit_card_settings",
            appBar: localeObj.credit_card_settings
        });
    }

    updateCreditCardAutomaticDebitStatus = (status) => {
        this.setState({
            autoDebit: status
        });
        ImportantDetails.autoDebit = status;
    }

    payInvoice = () => {
        if (!this.state.autoDebit) {
            let event = constantObjects.creditCardInvoicePayment
            this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
            this.setState({
                cardStatus: "invoice_payment",
                direction: "left"
            });
        } else {
            let event = constantObjects.creditCardBlockedInvoicePayment
            this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
            this.setState({
                blockInvoicePaymentDuetoAutomaticDebitSheet: true
            });
        }
    }

    signCreditContract = (selfieObj) => {
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["token"] = this.state.token;
        jsonObj["contractId"] = this.state.contractId;
        jsonObj["selfieObj"] = selfieObj;
        arbiApiService.signCreditContract(jsonObj, this.componentName).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("signCreditContract: response: " + JSON.stringify(response));
            if (response.success) {
                this.setState({
                    cardStatus: "credit_facematch_success",
                    direction: "left"
                })

            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    goToHomePage = () => {
        if (this.props && this.props.location && this.props.location.state && this.props.location.state.entryPoint === "allServices")
            this.props.history.replace({ pathname: "/allServices", transition: "right" });
        else if (this.props && this.props.location && this.props.location.state && this.props.location.state.entryPoint === "card")
            this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
        else {
            const { fromComponent = null, state = {} } = this.props.location;

            if (fromComponent === PageNames.GamificationComponent.program_details) {
                return this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
            }

            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
        }
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else if (this.state.bottomSheetOpen) {
            return this.setState({
                bottomSheetOpen: false,
                cardStatus: "credit_due_date",
                appBar: localeObj.credit_card_welcome_benifits_banner_title,
                direction: "right"
            })

        } else if (this.state.noCardbottomSheetOpen) {
            this.noCardonPrimary();

        } else if (this.state.bottom) {
            this.handleClose();

        } else if (this.state.openResumeOnboardingBS) {
            this.handleBottomSheet();
        } else if (this.state.blockInvoicePaymentDuetoAutomaticDebitSheet) {
            //this.cancelAutomaticDebitDrawer();
            this.setState({
                blockInvoicePaymentDuetoAutomaticDebitSheet: false
            });
        } else {
            switch (this.state.cardStatus) {
                case "register_key":
                case "receive_pix":
                case "credit_due_date":
                case "credit_pix_amount":
                    this.setUserBalance();
                    break;
                case "credit_invest_amount":
                    this.setState({
                        cardStatus: "card_info",
                        direction: "right",
                        previousComponent: "credit_invest_amount",
                        appBar: localeObj.dimo_card
                    });
                    break;
                case "credit_contract":
                    if (this.state.creditStatus.cardStatus === 0) {
                        this.goToHomePage();
                    } else {
                        this.setState({
                            cardStatus: "credit_resume_onboarding",
                            appBar: localeObj.resume_cc_appbar,
                            direction: "right",
                        });
                    }
                    break;
                case "credit_edit_due_date":
                case "credit_edit_amount":
                    this.setState({
                        cardStatus: "credit_resume_onboarding",
                        appBar: localeObj.resume_cc_appbar,
                        direction: "right",
                    });
                    break;
                case "credit_pin_input":
                    this.setState({
                        cardStatus: "credit_contract",
                        appBar: localeObj.contract,
                        direction: "right",
                    });
                    break;
                case "credit_invest":
                    this.setState({
                        cardStatus: "card_info",
                        direction: "right",
                        appBar: localeObj.dimo_card,
                        previousComponent: "credit_invest"
                    });
                    break;
                case "credit_facematch":
                    this.setState({
                        cardStatus: "credit_pin_input",
                        appBar: localeObj.pix_authentication,
                        direction: "right",
                    });
                    break;
                case "credit_card_settings":
                case "transactionDetails":
                case "credit_card_invoice_details":
                case "invoice_payment":
                case "invoice_history":
                case "investment":
                    this.getHomePageDetails(false);
                    break;
                case "credit_card_settings_change_due_date":
                    this.setState({
                        cardStatus: "credit_card_settings",
                        appBar: localeObj.credit_card_settings,
                        direction: "right"
                    });
                    break;
                case "card_info":
                    this.setState({
                        previousComponent: "card_info"
                    });
                    this.goToHomePage();
                    break;
                case "credit_resume_onboarding":
                    this.setState({
                        openResumeOnboardingBS: true
                    });
                    break;
                case "error":
                case "cardError":
                case "credit_success":
                default:
                    this.goToHomePage();
                    break;
            }
        }
    }


    setBillingDate = (modifiedDate) => {
        this.setState({
            dueDate: modifiedDate
        });
    }

    setInvestMentAmount = (amount, decimal, displayAmount = 0) => {
        Log.sDebug("setInvestMentAmount, amount: " + amount + "decimal:" + decimal);
        this.sendEventMetrics(constantObjects.amountEnter, PageNameJSON["credit_invest_amount"]);
        this.setState({
            creditLimit: amount,
            cardStatus: "credit_due_date",
            direction: "left",
            investmentAmount: displayAmount
        });
    }

    setInvestMentAmountAfterEdit = (amount, decimal, displayAmount = 0) => {
        Log.sDebug("setInvestMentAmount, amount: " + amount + "decimal:" + decimal);
        this.sendEventMetrics(constantObjects.amountEnter, PageNameJSON["credit_invest_amount"]);
        this.setState({
            creditLimit: amount,
            cardStatus: "credit_resume_onboarding",
            appBar: localeObj.resume_cc_appbar,
            direction: "left",
            investmentAmount: displayAmount
        });
    }

    editDueDate = () => {
        this.setState({
            cardStatus: "credit_edit_due_date",
            direction: "left",
        });
    }

    getBoxHeight = (calculatedHeight) => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return calculatedHeight * 1.5;
            case "NEXT_LARGE_SCREEN": return calculatedHeight * 1.3;
            case "LARGE_SCREEN": return calculatedHeight * 1.2;
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN": return calculatedHeight;
            default: return calculatedHeight;
        }
    }

    getInvoiceStatusString = (invoiceStatus) => {
        let invoiceText = "";
        switch (invoiceStatus) {
            case "open": invoiceText = localeObj.invoice_open; break;
            case "closed": invoiceText = localeObj.invoice_closed; break;
            case "partial": invoiceText = localeObj.partially_paid; break;
            case "paid": invoiceText = localeObj.paid_invoice; break;
            case "installment": invoiceText = localeObj.installments; break;
            case "future": invoiceText = localeObj.future_invoice; break;
            default: invoiceText = localeObj.invoice_closed; break;
        }
        return invoiceText;

    }

    openInvoiceDetails = () => {
        let event = constantObjects.creditCardInvoiceDetails
        this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
        this.showProgressDialog();
        arbiApiService.getInvoiceDetails(this.state.invoiceId, this.componentName).then(response => {

            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processInvoiceDetails(response.result);
                if (processorResponse.success) {
                    this.setState({
                        minLimit: processorResponse.minPayment,
                        amountLeftToPay: processorResponse.invoiceValue - processorResponse.alreadyPaid,
                        invoiceContent: processorResponse,
                        invoiceDetailsStatus: this.getInvoiceStatusString(processorResponse.status),
                        status: processorResponse.status,
                        closedInvoiceDate: processorResponse.closeDate,
                        payableDate: processorResponse.payableDate,
                        nationalCharges: processorResponse.nationalCharges,
                        internationalCharges: processorResponse.internationalCharges,
                        taxes: processorResponse.taxes,
                        pendingBalance: processorResponse.pendingBalance,
                        InvoiceDetailsValue: processorResponse.invoiceValue,
                        cardStatus: "credit_card_invoice_details",
                        appBar: localeObj.invoice_details,
                        transactionData: processorResponse.transactionData
                    })
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    openChangeInvoiceDueDate = () => {
        let event = constantObjects.creditCardInvoiceDetails
        this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
        this.setState({
            cardStatus: "credit_card_settings_change_due_date",
            preSelectedDate: this.state.invoiceDueDate,
            appBar: localeObj.invoice_due_date
        });
    }

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }

    openMyCardsPage = () => {
        let event = constantObjects.creditCardOpenMyCards
        this.sendEventMetrics(event, PageNameJSON["credit_card_settings"]);
        this.props.history.push({
            pathname: "/digitalCard",
            "fromComponent": "CreditCardHomePage"
        });
    }
    handleBottomSheet = () => {
        this.setState({
            openResumeOnboardingBS: false
        });
    }

    continueOnboarding = () => {
        Log.sDebug("Continue onboarding");
        this.handleBottomSheet();
        this.resumeInvestment();
    }

    resumeOnboarding = () => {
        arbiApiService.getCreditCardInvestmentOnboarding().then(response => {
            this.hideProgressDialog();
            Log.sDebug("getCreditCardInvestmentOnboarding: " + JSON.stringify(response));
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditCardInvestmentOnboardingResponse(response.result);
                Log.sDebug("getCreditCardInvestmentOnboarding: processorResponse: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    this.setState({
                        cardStatus: "credit_resume_onboarding",
                        appBar: localeObj.resume_cc_appbar,
                        creditLimit: processorResponse.valueInvested,
                        creditLimitPrev: processorResponse.valueInvested,
                        dueDatePrev: processorResponse.dueDate,
                        dueDate: processorResponse.dueDate,
                    })

                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });


    }

    resumeInvestment = () => {
        Log.sDebug("creditLimit:" + this.state.creditLimit);
        Log.sDebug("creditLimitPrev:" + this.state.creditLimitPrev);
        Log.sDebug("dueDate:" + this.state.dueDate);
        Log.sDebug("dueDatePrev:" + this.state.dueDatePrev);
        if (this.state.creditLimit !== this.state.creditLimitPrev || this.state.dueDate !== this.state.dueDatePrev) {
            this.configureCreditParams(true);
        } else {
            this.getCreditContract();
        }

    }

    editOnboardingDetails = (option, details) => {
        switch (option) {
            case localeObj.resume_cc_list1:
                this.investMoneyCreditCardOnRequest(true, details);
                break;
            case localeObj.resume_cc_list2:
                this.editDueDate();
                break;
            default:
                break;
        }
    }

    quitOnboarding = () => {
        Log.sDebug("Quit onboarding");
        this.handleBottomSheet();
        this.goToHomePage();

    }

    openChatBot = () => {
        ChatBotUtils.insideChatBot(constantObjects.creditCardHomePage);
        this.props.history.replace('/chat');
    }

    getBoxWidth = (calculatedWidth) => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return calculatedWidth * 1.3;
            case "NEXT_LARGE_SCREEN": return calculatedWidth * 1.2;
            case "LARGE_SCREEN": return calculatedWidth * 1.1;
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN":
                return calculatedWidth;
            default: return calculatedWidth;
        }
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return;
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.invoice_details_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right" });
    }

    render() {
        const { classes } = this.props;
        const currentState = this.state.cardStatus;
        const moreDetails = this.state.showMoreDetails;
        const openInvoiceString = localeObj.invoice_open;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const creditCardZeroUsedLimitBannerHeight = screenHeight * 0.4;
        const actions = [
            { handler: this.payInvoice, label: localeObj.pay_invoice, icon: <img src={BarcodeIcon} style={{ width: "1.5rem" }} alt="" /> },
            { handler: this.openInvoiceHistory, label: localeObj.invoice_history, icon: <HistoryIcon style={{ fill: ColorPicker.accent, fontSize: "1.25rem" }} /> },
            { handler: this.openInvestmentPage, label: localeObj.credit_Investment_home_page, icon: <TrendingUpIcon style={{ fill: ColorPicker.accent, fontSize: "1.25rem" }} /> },
            { handler: this.openMyCardsPage, label: localeObj.acc_card_my_cards, icon: <CreditCardIcon style={{ fill: ColorPicker.accent, fontSize: "1.25rem" }} /> }
        ];

        return (
            <div style={{ overflowX: "hidden" }}>
                {!this.state.processing && currentState !== "error" && currentState !== "credit_facematch_success" && currentState !== "receive_pix" && currentState !== "credit_card_settings" && currentState !== "card_info" && currentState !== "credit_card_invoice_details"
                    && currentState !== "register_key" && currentState !== "register_value" && currentState !== "invoice_payment" && currentState !== "invoice_history" && currentState !== "investment" && this.state.usedLimitZero !== true &&
                    <ButtonAppBar
                        header={this.state.appBar}
                        inverse={(currentState === "transactionDetails" || currentState === "credit_resume_onboarding") ? true : false}
                        onBack={this.onBack}
                        onCancel={this.onBack}
                        search={this.search}
                        onClickSettings={() => this.openSettingsPage()}
                        action={currentState === "credit_invest" ? "help" : ((currentState === "transactionDetails" || currentState === "credit_resume_onboarding") ? "cancel" : (currentState === "credit_card_homepage" ? "settings" : "none"))}
                        onHelp={() => GeneralUtilities.openHelpSection()} />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "card_info" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "card_info" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "card_info" &&
                            <CreditCardInfoPage
                                next={this.setUserBalance}
                                showInvestInfo={this.investMoneyCreditCardOnRequest}
                                onBackHome={this.onBack}
                                componentName={PageNameJSON['card_info']}
                                previousComponent={this.state.previousComponent} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_invest" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_invest" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_invest" &&
                            <CreditCardInvestmentInfo
                                next={this.setTransactionInfo}
                                onBackHome={this.onBack}
                                creditInvestmentInfo={this.state.creditInvestmentInfo}
                                hideProgressDialog={this.hideProgressDialog}
                                componentName={PageNameJSON['credit_invest']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_resume_onboarding" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_resume_onboarding" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_resume_onboarding" &&
                            <CreditCardResumeOnboarding
                                header={localeObj.resume_cc_head}
                                icon={resume_onboarding}
                                dueDate={this.state.dueDate}
                                bottomSheet={this.state.openResumeOnboardingBS}
                                handleBottomSheet={this.handleBottomSheet}
                                onPrimary={this.continueOnboarding}
                                creditLimit={this.state.creditLimit}
                                onSecondary={this.quitOnboarding}
                                appBar={false}
                                description={localeObj.resume_cc_desc}
                                btnText={localeObj.resume_cc_primary}
                                next={this.resumeInvestment}
                                action={localeObj.resume_cc_secondary}
                                onAction={this.help}
                                type={PageNameJSON['credit_resume_onboarding']}
                                editOnboardingDetails={this.editOnboardingDetails} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_invest_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_invest_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_invest_amount" &&
                            <CreditInvestmentAmountComp
                                next={this.setTransactionInfo}
                                onBackHome={this.onBack}
                                balance={this.state.balance}
                                minAmount={this.state.creditInvestmentInfo.minInvestment}
                                maxAmount={this.state.creditInvestmentInfo.maxInvestment}
                                pixAmountPage={this.pixAmountPage}
                                setInvestMentAmount={this.setInvestMentAmount}
                                investmentAmount={this.state.creditLimit}
                                componentName={PageNameJSON['credit_invest_amount']} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_edit_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_edit_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_edit_amount" &&
                            <CreditInvestmentAmountComp
                                next={this.setTransactionInfo}
                                onBackHome={this.onBack}
                                balance={this.state.balance}
                                minAmount={this.state.creditInvestmentInfo.minInvestment}
                                maxAmount={this.state.creditInvestmentInfo.maxInvestment}
                                pixAmountPage={this.pixAmountPage}
                                investmentAmount={this.state.creditLimit}
                                setInvestMentAmount={this.setInvestMentAmountAfterEdit}
                                componentName={PageNameJSON['credit_edit_amount']} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_pix_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_pix_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_pix_amount" && <PixAmountComp next={this.setTransactionInfo} onBackHome={this.onBack}
                            minAmount={this.state.creditInvestmentInfo.minInvestment} maxAmount={this.state.creditInvestmentInfo.maxInvestment} sendPixToMyAccount={this.sendPixToMyAccount}
                        />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "receive_pix" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "receive_pix" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "receive_pix" && <PixReceiveComponents next={this.setTransactionInfo} onBack={this.onBack}
                            location={this.state.location} onContinue={this.onPixReceiveContinue} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "register_key" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "register_key" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "register_key" && <RegisterNewKeyComponent onBack={this.onBack} from="creditCard" />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_due_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_due_date" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_due_date" && <CreditCardDueDate recieveField={this.setTransactionInfo} value={this.state.dueDate} componentName={PageNameJSON['credit_due_date']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_edit_due_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_edit_due_date" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_edit_due_date" && <CreditCardDueDate recieveField={this.setTransactionInfo} value={this.state.dueDate} componentName={PageNameJSON['credit_due_date']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_contract" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_contract" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_contract" && <CreditContract moveToContract={this.setTransactionInfo} terms={this.state.toc} componentName={PageNameJSON['credit_contract']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_pin_input" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_pin_input" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_pin_input" && <InputPinPageWithValidation history={this.props.history} confirm={this.faceMatchScreen} componentName={PageNameJSON['credit_pin_input']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.creditErrorJson} onClick={this.goToHomePage} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_facematch" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_facematch" && !this.state.processing ? 'block' : 'none') }}>
                        <ImageInformationComponent header={localeObj.faceMatch_val} icon={face}
                            appBar={false} description={localeObj.faceMatch_desc} btnText={localeObj.faceMatch_btn} next={this.doFaceMatch}
                            action={localeObj.help} onAction={this.help} type={PageNameJSON['credit_facematch']} />
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_facematch_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_facematch_success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_facematch_success" && <CreditCardSuccess header={localeObj.credit_success_title}
                            description={localeObj.credit_success_desc} subtext={""} btnText={localeObj.back_home} next={this.goToHomePage} componentName={PageNameJSON['credit_facematch_success']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_success" && !this.state.processing ? 'block' : 'none') }}>
                        <ImageInformationComponent header={localeObj.almost_there} icon={success}
                            appBar={false} description={localeObj.credit_success_desc1} subtext={localeObj.credit_success_desc2} btnText={localeObj.i_understand} next={this.onBack} type={PageNameJSON['credit_success']} />
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "cardError" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "cardError" && !this.state.processing ? 'block' : 'none') }}>
                        <ImageInformationComponent header={this.state.cardHeader} next={this.goToCardsPage} icon={icon}
                            appBar={false} description={this.state.cardDesc} btnText={localeObj.go_to_settings_2}
                            secBtnText={localeObj.back_home} close={this.onBack} action={localeObj.help} onAction={this.help} type={PageNameJSON['cardError']} />
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_invoice_details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_card_invoice_details" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_card_invoice_details" && <div>
                            <ButtonAppBar header={localeObj.invoice_details} onBack={this.onBack} action="none" />
                            <InvoiceDetails
                                details={this.state.invoiceContent}
                                amountLeftToPay={this.state.amountLeftToPay}
                                invoiceValue={this.state.InvoiceDetailsValue}
                                onBack={this.onBack}
                                status={this.state.status}
                                invoiceStatus={this.state.invoiceDetailsStatus}
                                processDueDate={this.state.processDueDate}
                                transactionData={this.state.transactionData}
                                pendingBalance={this.state.pendingBalance}
                                onSelectTransaction={this.onSelectTransaction}
                                goToChatbot={this.goToChatbot}
                                componentName={PageNameJSON['credit_card_invoice_details']} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_settings" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_card_settings" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_card_settings" && <div>
                            <CreditCardSettingsComponent
                                history={this.props.history}
                                automaticDebit={this.state.autoDebit}
                                onBackHome={this.onBack}
                                updateCreditCardAutomaticDebitStatus={this.updateCreditCardAutomaticDebitStatus}
                                openMyCards={this.openMyCardsPage}
                                invoiceDueDate={this.state.invoiceDueDate}
                                openChangeInvoiceDueDate={this.openChangeInvoiceDueDate}
                                componentName={PageNameJSON['credit_card_settings']} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_settings_change_due_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_card_settings_change_due_date" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_card_settings_change_due_date" && <div>
                            <CreditCardChangeDueDateComponent
                                onBack={this.onBack}
                                setBillingDate={this.setBillingDate}
                                preSelectedDate={this.state.invoiceDueDate}
                                componentName={PageNameJSON['credit_card_settings_change_due_date']} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "invoice_payment" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "invoice_payment" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "invoice_payment" && <div>
                            <CreditCardInvoicePaymentComponent
                                history={this.props.history}
                                details={this.state.invoiceContent}
                                invoiceTotal={this.state.value}
                                onBackHome={this.onBack}
                                processDueDate={this.state.processDueDate}
                                invoiceId={this.state.invoiceId}
                                autoDebit={this.state.autoDebit}
                                componentName={PageNameJSON['invoice_payment']} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "invoice_history" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "invoice_history" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "invoice_history" && <div>
                            <CreditCardInvoiceHistoryHomePage
                                onBack={this.onBack} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "investment" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "investment" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "investment" && <div>
                            <CreditCardInvestmentComp
                                onBack={this.onBack}
                                additionalInfo={this.props.location.additionalInfo}
                                history={this.props.history}
                                creditUsage={this.state.usedLimitAmount + "," + this.state.usedLimitDecimal}
                                componentName={PageNameJSON['investment']} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_homepage" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ height: `${screenHeight * 0.9}px`, marginBottom: "1.5rem", overflowY: "auto", display: (currentState === "credit_card_homepage" && !this.state.processing ? 'block' : 'none') }} >
                        {this.state.usedLimitZero === true && <div>
                            <FlexView vAlignContent="center" hAlignContent="center" style={{ position: 'relative', width: `${screenWidth}px`, height: `${creditCardZeroUsedLimitBannerHeight}px` }}>
                                <Image
                                    style={{
                                        width: `${screenWidth}px`,
                                        height: `${creditCardZeroUsedLimitBannerHeight}px`,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                    }}
                                    responsive
                                    src={ZeroLimitBackgroundImage}>
                                </Image>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '2.75rem 2.5rem',
                                    zIndex: 2
                                }}>
                                    <BackIcon
                                        onClick={() => this.onBack()}
                                        style={{
                                            position: 'absolute',
                                            left: '1.75rem',
                                            fill: ColorPicker.white,
                                            width: "1.5rem",
                                            fontSize: "1.25rem"
                                        }}
                                    />
                                    <span className="body2 highEmphasis"
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            transform: 'translateX(-50%)'
                                        }}>
                                        {localeObj.credit_card}
                                    </span>
                                    <SettingsIcon
                                        onClick={() => this.openSettingsPage()}
                                        style={{
                                            position: 'absolute',
                                            right: '1.75rem',
                                            fill: ColorPicker.darkHighEmphasis,
                                            fontSize: "1.25rem"
                                        }} />
                                </div>
                                <FlexView column>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        zIndex: 1,
                                        padding: "0 3rem",
                                        width: `${screenWidth * 0.75}px`
                                    }}>
                                        <div className="headline5 highEmphasis" style={{ whiteSpace: 'normal', marginLeft: "1rem" }}>
                                            {localeObj.credit_card_zero_limit_header}{this.state.availableLimitAmount + "," + this.state.availableLimitDecimal + "!"}
                                        </div>
                                        <div className="body1 accent" style={{ whiteSpace: 'normal', marginLeft: "1rem", marginTop: "0.5rem" }}>
                                            {localeObj.credit_card_zero_limit_footer}
                                        </div>
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        zIndex: 1,
                                        marginTop: "8rem",
                                        padding: "0 3rem",
                                        width: `${screenWidth * 0.75}px`
                                    }}>
                                        <FlexView>
                                            <img src={winChanceIcon} style={{ width: "1rem", height: "1rem", marginTop: "1rem" }} alt="" />
                                            <span className="body1 highEmphasis" style={{ whiteSpace: 'normal', marginLeft: "1rem", textAlign: "left" }}>
                                                {localeObj.credit_card_zero_limit_list_one}
                                            </span>
                                        </FlexView>
                                        <FlexView style={{ marginTop: "1rem" }}>
                                            <img src={cashbackIcon} style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem" }} alt="" />
                                            <span className="body1 highEmphasis" style={{ whiteSpace: 'normal', marginLeft: "1rem", textAlign: "left" }}>
                                                {localeObj.credit_card_zero_limit_list_two}
                                            </span>
                                        </FlexView>
                                    </div>
                                </FlexView>
                            </FlexView>
                        </div>}
                        {currentState === "credit_card_homepage" &&
                            <div style={InputThemes.initialMarginStyle}>
                                {this.state.redeemStatus && <Card align="center" style={this.style.cardStyle2} elevation="0">
                                    <CardContent>
                                        <FlexView align="left" style={{ marginTop: "0.5rem" }}>
                                            <div style={{ display: (this.state.invoiceStatus === openInvoiceString) ? 'block' : 'none' }}>
                                                <InfoOutlinedIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: '0.25rem', color: ColorPicker.white }} />
                                            </div>
                                            <span style={{ marginLeft: "0.5rem" }} className="caption highEmphasis">{localeObj.redeem_status}</span>
                                        </FlexView>
                                    </CardContent>
                                </Card>}
                                {this.state.creditStatus.cardStatus === "6" && <Card align="center" style={this.style.cardStyle2} elevation="0">
                                    <CardContent>
                                        <FlexView align="left" style={{ marginTop: "0.5rem" }}>
                                            <div style={{ display: (this.state.invoiceStatus === openInvoiceString) ? 'block' : 'none' }}>
                                                <InfoOutlinedIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: '0.25rem', color: ColorPicker.white }} />
                                            </div>
                                            <span style={{ marginLeft: "0.5rem" }} className="caption highEmphasis">{localeObj.invest_more_status_6}</span>
                                        </FlexView>
                                    </CardContent>
                                </Card>}
                                {/*{this.state.creditStatus.cardStatus == "7" && <Card align="center" style={this.style.cardStyle2} elevation="0">
                                    <CardContent>
                                        <FlexView align="left" style={{ marginTop: "0.5rem" }}>
                                            <div style={{ display: (this.state.invoiceStatus === openInvoiceString) ? 'block' : 'none' }}>
                                                <InfoOutlinedIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: '0.25rem', color: ColorPicker.white }} />
                                            </div>
                                            <span style={{marginLeft: "0.5rem"}} className="caption highEmphasis">{localeObj.invest_more_status_7}</span>
                                        </FlexView>
                                    </CardContent>
                                </Card>}
                                {this.state.creditStatus.cardStatus == "8" && <Card align="center" style={this.style.cardStyle2} elevation="0">
                                    <CardContent>
                                        <FlexView align="left" style={{ marginTop: "0.5rem" }}>
                                            <div style={{ display: (this.state.invoiceStatus === openInvoiceString) ? 'block' : 'none' }}>
                                                <InfoOutlinedIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: '0.25rem', color: ColorPicker.white }} />
                                            </div>
                                            <span style={{marginLeft: "0.5rem"}} className="caption highEmphasis">{localeObj.invest_more_status_8}</span>
                                        </FlexView>
                                    </CardContent>
                                </Card>} */}
                                <Card align="center" style={this.style.cardStyle} elevation="0">
                                    <CardContent>
                                        <FlexView align="left" style={{ marginTop: "1.2rem" }}>
                                            <div style={{ display: (this.state.invoiceStatus === openInvoiceString) ? 'block' : 'none' }}>
                                                <CircleIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: '0.25rem', color: ColorPicker.transactionGreen }} />
                                            </div>
                                            <div style={{ display: (this.state.invoiceStatus !== openInvoiceString) ? 'block' : 'none' }}>
                                                <CircleIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: '0.25rem', color: ColorPicker.errorRed }} />
                                            </div>
                                            <span className="caption highEmphasis">{this.state.invoiceStatus}</span>
                                            {moreDetails === true && <KeyboardArrowUpIcon onClick={() => this.toggleShowMoreDetails()} style={{ height: "1.5rem", width: "1.5rem", marginRight: 0, marginLeft: 'auto', color: ColorPicker.darkHighEmphasis }} />}
                                            {moreDetails === false && <KeyboardArrowDownIcon onClick={() => this.toggleShowMoreDetails()} style={{ height: "1.5rem", width: "1.5rem", marginRight: 0, marginLeft: 'auto', color: ColorPicker.darkHighEmphasis }} />}
                                        </FlexView>
                                        <FlexView column align="center" style={{ marginTop: '1rem' }}>
                                            <FlexView align="center" style={{ display: 'inline-block', width: '100%' }}>
                                                <div  style={{ float: 'left', textAlign: "left" }}>
                                                    <span className="caption highEmphasis">{localeObj.used_limit}</span>
                                                </div>
                                                <div  style={{ float: 'right', textAlign: "right" }}>
                                                    <span className="caption highEmphasis">{localeObj.available_limit}</span>
                                                </div>
                                            </FlexView>
                                            <div style={{textAlign: "center"}}>
                                                {currentState === "credit_card_homepage" && <BorderLinearProgress style={{ height: "0.75rem", marginTop: "0.5rem", marginBottom: "0.5rem" }} variant="determinate" value={this.state.creditPercentage} />}
                                            </div>
                                            <FlexView align="center" style={{ display: 'inline-block', width: '100%' }}>
                                                <div  style={{ float: 'left', textAlign: "left" }}>
                                                    <span className="caption highEmphasis">{"R$ "}{this.state.usedLimitAmount + "," + this.state.usedLimitDecimal}</span>
                                                </div>
                                                <div  style={{ float: 'right', textAlign: "right" }}>
                                                    <span className="caption highEmphasis">{"R$ "}{this.state.availableLimitAmount + "," + this.state.availableLimitDecimal}</span>
                                                </div>
                                            </FlexView>
                                        </FlexView>
                                        {moreDetails === true && <FlexView column align="center" style={{ marginTop: '1rem' }}>
                                            <FlexView align="center" style={{ display: 'inline-block', width: '100%' }}>
                                                <div  style={{ float: 'left', textAlign: "left" }}>
                                                    <span className="caption highEmphasis">{localeObj.total_limit}</span>
                                                </div>
                                                <div  style={{ float: 'right', textAlign: "right" }}>
                                                    <span className="caption highEmphasis">{"R$ "}{this.state.totalLimitAmount + "," + this.state.totalLimitDecimal}</span>
                                                </div>
                                            </FlexView>
                                            <FlexView align="center" style={{ display: 'inline-block', width: '100%' }}>
                                                <div  style={{ float: 'left', textAlign: "left" }}>
                                                    <span className="caption highEmphasis">{localeObj.dueDate}</span>
                                                </div>
                                                <div  style={{ float: 'right', textAlign: "right" }}>
                                                    <span className="caption highEmphasis">{moment(this.state.processDueDate).format("DD MMM")}</span>
                                                </div>
                                            </FlexView>
                                            {this.state.bestDate && <FlexView align="center" style={{ display: 'inline-block', width: '100%' }}>
                                                <div style={{ float: 'left', textAlign: "left" }}>
                                                    <span className="caption highEmphasis">{localeObj.bestDate}</span>
                                                </div>
                                                <div style={{ float: 'right', textAlign: "right" }}>
                                                    <span className="caption highEmphasis">{moment(this.state.bestDate , 'YYYY-MM-DD').format("DD MMM")}</span>
                                                </div>
                                            </FlexView>}
                                            <FlexView align="center" style={{ display: 'inline-block', width: '100%', marginTop: '1rem' }}>
                                                <FlexView column align="left" style={{ float: 'left', display: 'flex', alignItems: 'left', verticalAlign: 'left' }}>
                                                    <span className="caption highEmphasis">{localeObj.current_invoice}</span>
                                                    <span className="headline6 highEmphasis">{"R$ "}{this.state.valueAmount + "," + this.state.valueDecimal}</span>
                                                </FlexView>
                                                <FlexView align="right" style={{ float: 'right', marginTop: "1rem" }} onClick={() => this.openInvoiceDetails()}>
                                                    <span className="body2 highEmphasis">{localeObj.details}</span>
                                                    <ArrowForwardIos style={{ color: ColorPicker.white, width: "0.75rem" }} />
                                                </FlexView>
                                            </FlexView>
                                        </FlexView>}
                                    </CardContent>
                                </Card>
                                <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                                    {localeObj.cc_actions}
                                </div>
                                <FlexView hAlignContent="center" style={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    marginRight: "1.5rem",
                                    marginTop: "0.5rem",
                                    width: `${screenWidth * 0.9}px`,
                                    overflowY: 'hidden',
                                    overflowX: 'auto'
                                }}>
                                    {actions.map((action, index) => (
                                        <div key={index}>
                                            <div onClick={action.handler}
                                                style={{
                                                    width: '4.125rem',
                                                    height: '4.125rem',
                                                    borderRadius: '50%',
                                                    marginRight: "2rem",
                                                    backgroundColor: ColorPicker.newProgressBar,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                }}>
                                                {action.icon}
                                            </div>
                                            <span className="caption highEmphasis"
                                                style={{
                                                    marginTop: "2rem",
                                                    width: "4.125",
                                                    overflowWrap: 'break-word',
                                                    maxWidth: "4.125rem",
                                                    textAlign: "center",
                                                }}>
                                                {action.label}
                                            </span>
                                        </div>
                                    ))}
                                </FlexView>
                                {this.state.transactionHistory === "data_available" &&
                                    <div>
                                        <span className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                                            {localeObj.cc_history}
                                        </span>
                                        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.transactionHistory ? true : false} timeout={300} classNames="pageSliderLeft" >
                                            <HistoryDisplayGrid txn={this.state.transactionHistoryData} onSelect={this.onSelectTransaction} />
                                        </CSSTransition>
                                    </div>}
                                {this.state.transactionHistory === "loading" &&
                                    <div>
                                        <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                                            {localeObj.cc_history}
                                        </div>
                                        <div style={{ display: ((this.state.transactionHistory === "loading" && !this.state.processing) ? 'block' : 'none'), marginLeft: "3%", overflowY: "hidden" }}>
                                            {this.state.transactionHistory === "loading" && <LoadingGrid />}
                                        </div>
                                    </div>}
                                {this.state.transactionHistory === "data_not_available" &&
                                    <div>
                                        <span className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                                            {localeObj.cc_history}
                                        </span>
                                        <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                                            <span className="label1 highEmphasis"
                                                style={{
                                                    marginTop: "2rem",
                                                    width: "90%",
                                                    overflowWrap: 'normal'
                                                }}>
                                                {localeObj.cc_history_empty_1}
                                            </span>
                                            <span className="label1 accent"
                                                onClick={() => this.openChatBot()}
                                                style={{
                                                    marginTop: "2rem",
                                                    width: "90%",
                                                    overflowWrap: 'normal'
                                                }}>
                                                {localeObj.cc_history_empty_2}
                                            </span>
                                        </div>
                                    </div>}
                                {this.state.transactionHistory === "data_fetch_error" &&
                                    <div>
                                        <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                                            {localeObj.cc_history}
                                        </div>
                                        <div
                                            onClick={() => this.openChatBot()}
                                            style={{textAlign: "center"}}>
                                            <span className="label1 highEmphasis"
                                                style={{
                                                    marginTop: "2rem",
                                                    width: "90%",
                                                    overflowWrap: 'normal'
                                                }}>
                                                {this.state.transactionHistoryDataFetchErrorTitle}
                                            </span>
                                            <span className="label1 accent"
                                                style={{
                                                    marginTop: "2rem",
                                                    width: "90%",
                                                    overflowWrap: 'normal'
                                                }}>
                                                {this.state.transactionHistoryDataFetchErrorDescriptor}
                                            </span>
                                        </div>
                                    </div>}
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "transactionDetails" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "transactionDetails" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "transactionDetails" && <TransactionHistoryReceipt transactionData={this.state.transactionDetails} />}
                    </div>
                </CSSTransition>
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.automatic_debit}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.automatic_debit_desc}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.automatic_debit_desc_1}
                                </div>
                            </FlexView>
                        </div>
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.activate} onCheck={() => this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.plain_maybe_later} onCheck={() => this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
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
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.register_new_key} onCheck={this.registerKey} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleClose} />
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
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={this.cancelAutomaticDebitDrawer} />
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.noCardbottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomSheetheader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomSheetdescription}
                                </div>
                            </FlexView>
                        </div>
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.bottomBtnText} onCheck={this.noCardonPrimary} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }

}

CreditCardComponenet.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(CreditCardComponenet);