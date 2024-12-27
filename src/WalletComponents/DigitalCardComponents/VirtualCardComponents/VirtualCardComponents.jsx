import React from "react";
import "../../../styles/main.css";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';
import moment from "moment";

import Log from "../../../Services/Log";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import httpRequest from "../../../Services/httpRequest";
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiMetrics from "../../../Services/ArbiApiMetrics";
import arbiApiService from "../../../Services/ArbiApiService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';

import success from "../../../images/SpotIllustrations/Checkmark.png";
import InputPinPage from "../../CommonUxComponents/InputPinPage";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import GooglePayComponent from "../../CommonUxComponents/GooglePayComponent";

import gpayCard from "../../../images/SpotIllustrations/Credcard-google-pay-page.png";
import visaGpayCard from "../../../images/DarkThemeImages/VisaVirtualCard.png"

import alertIcon from "../../../images/SpotIllustrations/Alert.png";
import googleIcon from '../../../images/SpotIllustrations/gpay_txt.png';
import addToGpayIcon from '../../../images/SpotIllustrations/add_to_gpay_btn.png';
import setAsDefaultIcon from '../../../images/SpotIllustrations/setAsDefault.png';

import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import InputThemes from "../../../Themes/inputThemes";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import VirtualCardMainPage from "./VirtualCardMainPage";

import CreditCardSettingsComponent from "../CreditCardComponents/CreditCardSettingsPage";
import CreditCardChangeDueDateComponent from "../CreditCardComponents/CreditCardChangeDueDateComponent";
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";

const theme2 = InputThemes.snackBarThemeForMyCards;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.VirtualCardComponent;
const TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION = 3;
const GET_CARD_STATUS_IN_GPAY = "GET_CARD_STATUS_IN_GPAY";
const CARD_STATUS_UPDATE = "CARD_STATUS_UPDATE_CUSTOM";
var localeObj = {};

class VirtualCardComponenet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardDetails: {},
            vCardStatus: "",
            direction: "",
            snackBarOpen: false,
            message: "",
            processing: false,
            clearPassword: false,
            open: false,
            cardKey: "",
            blockStatus: "",
            cardType: "Virtual Card",
            bottomSheetOpen: false,
            reset: false,
            userName: "",
            bottomSheetEnabled: false,
            appBar: "",
            listCards: props.location.listCards,
            gpayEntryPoint: PageNameJSON.show_vcard_details,
            gpayOnboarding: false,
            pin: "",
            enableCreditCard: constantObjects.featureEnabler.CREDIT_CARD_ENABLED,
            deeplinkShown: false,
            enableCreditCardSettings: false,
            isClickable: false
        };
        this.cardAddedToGPay = false;
        this.isCardDefaultCardInGPay = false;
        this.gpayJson = {};
        this.userDetails = {};
        this.istokenStatePendingVerification = false;
        this.tokenID = "";
        this.walletId = "";
        this.deviceId = "";
        this.componentName = PageNames["VirtualCardInfoScreen"];
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            appBar: localeObj.pix_authentication
        })

        ImportantDetails.setVirtualCardKey(this.props.location.state[0].cardKey);
        this.setState({
            cardDetails: {
                "name": this.props.location.state[0].name,
                "number": this.props.location.state[0].number,
                "key": this.props.location.state[0].cardKey,
                "brand": this.props.location.state[0].brand,
                "cardType": this.props.location.state[0].cardType,
                "status": this.props.location.state[0].status,
                "idStatusCartao": this.props.location.state[0].idStatusCartao

            },
            vCardStatus: this.isPinAvailable() ? "" : "verify_pin",
            blockStatus: this.props.location.state[0].status,
        })
        if (ImportantDetails.creditStatus) {
            this.setState({
                creditStatus: ImportantDetails.creditStatus
            }, () => {
                if (ImportantDetails.creditStatus && ImportantDetails.creditStatus >= 5) {
                    this.setState({
                        enableCreditCardSettings: true
                    })
                } else {
                    this.setState({
                        enableCreditCardSettings: false
                    })
                }
            });
        }
        window.onBackPressed = () => {
            this.onBack();
        }
        window.isTokenized = (response, isCardDefault, tokenStateInt, tokenID) => {
            this.isCardTokenized(response, isCardDefault, tokenStateInt, tokenID)
        }
        window.lisTokens = (response) => {
            //Log.sDebug("listTokens response: " + response);
            let resArray = response.split("/");
            let tokenArray = [];
            let token = "";
            let tokenAvailable = false;
            for (let i in resArray) {
                token = resArray[i];
                tokenArray = token.split(":");
                if (tokenArray[2] === this.props.location.state[0].number.substring(15, 19)) {
                    tokenAvailable = true
                    if (this.state.cardDetails.brand === "ELO")
                        androidApiCalls.isTokenized(constantObjects.TSP_ELO, tokenArray[0]);
                    else
                        androidApiCalls.isTokenized(constantObjects.TSP_VISA, tokenArray[0]);
                    break;
                }
                tokenArray = [];
                token = "";
            }
            if (!tokenAvailable) {
                this.isCardTokenized(false, false, -1, "");
            }
            this.sendGpayStatusMetrics(resArray);
        }

        window.handleExceptionInGPayIntegration = () => {
            //Log.sDebug("handleExceptionInGPayIntegration response: " + response);
        }

        window.getActiveWalletId = (response) => {
            //Log.sDebug("getActiveWalletId response");
            this.walletId = response;
        }
        window.getStableHardwareId = (response) => {
            //Log.sDebug("getStableHardwareId response");
            this.deviceId = response;
        }

        this.gpayJson = {
            "userName": this.props.location.state[0].number.substring(15, 19),
            "last4Digits": this.props.location.state[0].number.substring(15, 19),
            "cardNetwork": this.state.cardDetails.brand === "ELO" ? constantObjects.CARD_NETWORK_ELO : constantObjects.CARD_NETWORK_VISA,
            "tsp": this.state.cardDetails.brand === "ELO" ? constantObjects.TSP_ELO : constantObjects.TSP_VISA
        }
        this.fetchUserDetails();
        //Log.sDebug("userDetails" + JSON.stringify(this.userDetails));
    }

    isPinAvailable() {
        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            let action = this.props.location.additionalInfo["cardActions"];
            let entryPoint = this.props.location.additionalInfo["entryPoint"];
            let userPin = this.props.location.additionalInfo["pin"];
            if (!GeneralUtilities.emptyValueCheck(entryPoint)) {
                this.setState({
                    gpayEntryPoint: entryPoint,
                    gpayOnboarding: PageNames.firstAccessVCard === entryPoint
                });

            }
            if (action !== "" && action !== undefined) {
                if (action === "google_pay_virtual" || action === "set_card_as_default_gpay_virtual") {
                    if (GeneralUtilities.emptyValueCheck(userPin))
                        return false;
                    this.setState({
                        pin: userPin,
                        deeplinkShown: true
                    })
                    this.showGPayScreen();
                    return true;
                }

            }
        }
        return false;

    }

    isCardTokenized = (response, isCardDefault, tokenStateInt, tokenID) => {
        //Log.sDebug("isTokenized response: " + response + " isCardDefault: " + isCardDefault + " tokenStateInt: " + tokenStateInt + "'tokenID: " + tokenID);
        this.tokenID = tokenID;
        if (tokenStateInt === TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION) {
            //Log.sDebug("istokenStatePendingVerification, true");
            this.istokenStatePendingVerification = true;
        } else {
            //Log.sDebug("istokenStatePendingVerification, false");
            this.istokenStatePendingVerification = false;
        }
        if (response) {
            //Log.sDebug("isTokenized response, true response");
            this.cardAddedToGPay = true;
            if (isCardDefault)
                this.isCardDefaultCardInGPay = true;
            else
                this.isCardDefaultCardInGPay = false;
            if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
                let action = this.props.location.additionalInfo["cardActions"];
                if (action !== "" && action !== undefined) {
                    if (action === "set_card_as_default_gpay_virtual")
                        this.setCardAsDefaultInGPay();
                }
            }
        } else {
            this.cardAddedToGPay = false;
        }
        this.handleIsTokenizedResponse();
    }

    sendGpayStatusMetrics = (listTokensRes) => {
        let resData = [];
        let gpayTokens = [];
        let tokenArray = [];
        if(listTokensRes){
            listTokensRes.forEach((token) => {
                tokenArray = token.split(":");
                gpayTokens.push(tokenArray);
                tokenArray = [];
            });
        }
        //Log.sDebug("gpayTokens: " + JSON.stringify(gpayTokens));
        if(this.state.listCards){
            this.state.listCards.forEach((opt) => {
                let gpayToken = [];
                let isCardAddedToGPay = false;
                let isCardDefault = false;
                let tokenStateInt = -1;
                for (let i in gpayTokens) {
                    gpayToken = gpayTokens[i];
                    if (gpayToken[2] === opt.number.substring(15, 19)) {
                        isCardAddedToGPay = (gpayToken[6] === '5');
                        isCardDefault = gpayToken[7];
                        tokenStateInt = gpayToken[6];
                        break;
                    }
                    gpayToken = [];
                }
                resData.push(this.getGpayStatusJson(opt, isCardAddedToGPay, isCardDefault, tokenStateInt));
            });
        }
        let payloadData = {};
        payloadData["cardDetails"] = JSON.stringify(resData);
        payloadData["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
        payloadData["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;
        payloadData["isGpayInstalled"] = this.isGPayInstalled();
        payloadData["isGpayDefaultNFC"] = androidApiCalls.isGPayDefaultTAPApplication();
        payloadData["requestedBy"] = "0";
        ArbiApiMetrics.sendGpayAlertMetrics(GET_CARD_STATUS_IN_GPAY, "tapAndPayClient.getTokenStatus", true, 201, payloadData, 0, this.state.gpayEntryPoint);
    }

    getGpayStatusJson = (details, isCardAddedToGPay, isCardDefault, tokenStateInt) => {
        let data = {};
        data["chaveDeCartao"] = details.cardKey;
        data["cardNetwork"] = details.brand;
        data["cardType"] = details.cardType;
        data["cardStatus"] = details.status;
        data["idStatusCartao"] = details.idStatusCartao + "";
        data["isCardAddedToGPay"] = isCardAddedToGPay + "";
        data["isCardDefault"] = isCardDefault + "";
        data["tokenStateInt"] = tokenStateInt;
        //Log.sDebug("getGpayStatusJson: " + data);
        return data;
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo.error) {
            //Log.sDebug("Error occured: " + formInfo.error, PageNameJSON[this.state.vCardStatus], constantObjects.LOG_PROD);
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["title"] = localeObj.card_failed;
            jsonObj["header"] = localeObj.card_failed;
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
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = formInfo.reason;
                    break;
            }
            this.setState({
                simulateStatus: "error",
                direction: "left",
                pixErrorJson: jsonObj
            })
        } else {
            switch (this.state.vCardStatus) {
                case "verify_pin":
                    this.setState({
                        pin: formInfo,
                        appBar: localeObj.virtual_card
                    })
                    this.getCardDetails(formInfo);
                    break;
                case "show_vcard_details": {
                    let eventName = ""
                    if (formInfo === localeObj.card_block) {
                        eventName = constantObjects.vCardBlock;
                        this.setState({
                            bottom_header: localeObj.card_block_header,
                            btnText: androidApiCalls.getLocale() === "en_US" ? localeObj.card_block : localeObj.yes,
                            open: true
                        })
                    } else if (formInfo === localeObj.unblock_card) {
                        eventName = constantObjects.vCardUnblock;
                        this.setState({
                            bottom_header: localeObj.card_unblock_header,
                            btnText: androidApiCalls.getLocale() === "en_US" ? localeObj.unblock_card : localeObj.yes,
                            open: true
                        })
                    } else if (formInfo === localeObj.google_pay) {
                        eventName = constantObjects.vCardGpay;
                        this.showGPayScreen();
                    } else if (formInfo === localeObj.virtual_card_delete) {
                        eventName = constantObjects.vCardDelete;
                        this.setState({
                            vCardStatus: "delete",
                            direction: "left",
                            deleteWarning: {
                                "header": localeObj.virtual_card_delete_header,
                                "description": localeObj.virtual_card_delete_warning
                            }
                        })
                    } else if (formInfo === localeObj.credit_card_settings) {
                        this.sendEventMetrics(constantObjects.creditCardSettings, PageNameJSON["card"]);
                        this.openCreditCardSettingsScreen();
                    }
                    let event = {
                        eventType: eventName,
                        page_name: PageNameJSON.show_vcard_details,
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                }
                    break;
                case "delete":
                    this.setState({
                        vCardStatus: "verify_pin_delete",
                        direction: "left",
                    })
                    break;
                case localeObj.credit_card_settings:
                    this.sendEventMetrics(constantObjects.creditCardSettings, PageNameJSON["card"]);
                    this.openCreditCardSettingsScreen();
                    break;
                case "verify_pin_delete":
                    this.goToHomePage();
                    break;
                default:
                    break;
            }
        }
    }

    getCardDetails = (pin) => {
        this.showProgressDialog();
        arbiApiService.validatePin(pin, this.componentName).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processValidatePinResponse(response.result);
                if (processorResponse.success) {
                    arbiApiService.getIframehash(this.state.cardDetails.key, pin).then(response => {
                        this.hideProgressDialog();
                        if (response.success) {
                            this.setState({
                                hashVal: response.result,
                                iframeSrc: arbiApiService.getIframe(response.result),
                                vCardStatus: "show_vcard_details",
                                direction: "left",
                                appBar: localeObj.virtual_card
                            })
                            if (!this.state.deeplinkShown && this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
                                let action = this.props.location.additionalInfo["cardActions"];
                                if (action !== "" && action !== undefined) {
                                    if (action === "google_pay_virtual" || action === "set_card_as_default_gpay_virtual") {
                                        this.showGPayScreen();
                                        this.setState({
                                            deeplinkShown: true
                                        })
                                        return true;
                                    }
                                }
                            }
                        } else {
                            this.hideProgressDialog();
                            this.setState({
                                snackBarOpen: true,
                                message: localeObj.generic_error + ". " + localeObj.generic_error_subtext
                            })
                        }
                    });
                }
            } else {
                this.hideProgressDialog();
                let jsonObj = {};
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["reason"] = "communication_issue"
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true })
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
                } else {
                    jsonObj["header"] = localeObj.card_failed;
                    jsonObj["description"] = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        errorJson: jsonObj,
                        vCardStatus: "error"
                    })
                }
            }
        });
    }

    getProfileDetailsOfUser(data) {
        let clientData = data.endereco;
        let number = this.areAllArgsValid(clientData.complemento) || this.areAllArgsValid(clientData.bairro) ? clientData.numero + "- " : "";
        let complement = this.areAllArgsValid(clientData.complemento) && this.areAllArgsValid(clientData.bairro) ? clientData.complemento + ", " : "";
        //Log.sDebug("getProfileDetailsOfUser: " + JSON.stringify(data));
        let profilePayload = {
            "address1": clientData.rua,
            "address2": number + complement + clientData.bairro,
            "countryCode": "BR",
            "locality": clientData.cidade,
            "administrativeArea": clientData.uf,
            "name": data.apelido,
            "phoneNumber": "+55 " + data.telefoneMovel.ddd.substring(1, 3) + data.telefoneMovel.numero,
            "postalCode": clientData.cep,
        }
        return profilePayload;
    }

    areAllArgsValid = (...args) => {
        for (const arg of args) {
            if (arg === null || arg === undefined) {
                return false;
            } else if (typeof arg === "string" && arg.length === 0) {
                return false;
            }
        }
        return true;
    }

    fetchUserDetails() {
        arbiApiService.getAllClientData(this.componentName).then(response => {
                if (response.success) {
                    //Log.sDebug("User Details Fetched", "MyAccountPage");
                    let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "profile");
                    if (processorResponse.success) {
                        //Log.sDebug("User Details Fetched: ");
                        let profileData = this.getProfileDetailsOfUser(processorResponse.data)
                        this.userDetails = profileData;
                    } else {
                        //Log.sDebug("fetchUserDetails, Error getting user details", PageNameJSON[this.state.vCardStatus], constantObjects.LOG_PROD);
                    }
                } else {
                    //let errorMessage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    //Log.sDebug("fetchUserDetails" + errorMessage, PageNameJSON[this.state.vCardStatus], constantObjects.LOG_PROD);
                }
            })
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
        this.setState({
            processing: false
        })
    }

    defineValue = () => {
        this.setState({
            simulateStatus: "get_amount",
            direction: "right",
        })
    }

    goToWalletPage = () => {
        let event = {
            eventType: constantObjects.vCardSuccess,
            page_name: PageNameJSON.show_vcard_details,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    action = (option) => {
        switch (option) {
            case localeObj.credit_card_settings:
                this.sendEventMetrics(constantObjects.creditCardSettings, PageNameJSON["card"]);
                this.openCreditCardSettingsScreen();
                break;
            default:
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.coming_soon
                });
                break;
        }
    }

    onPrimary = () => {
        this.setState({
            open: false
        })
        if (this.state.bottom_header === localeObj.card_block_header) {
            this.blockCard();
        } else if (this.state.bottom_header === localeObj.card_unblock_header) {
            this.unblockCard();
        } else if (this.state.btnText === localeObj.remove_btn) {
            this.removeCardFromGPay();
        } else if (this.state.btnText === localeObj.install_btn) {
            this.installGPay();
        } else if (this.state.btnText === localeObj.set_gpay_default_tap_btnText) {
            this.setCardAsDefaultInGPay();
        }
    }

    onSecondary = () => {
        this.setState({
            open: false,
        })
    }

    onPrimaryPin = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    onSecondaryPin = () => {
        this.setState({ bottomSheetOpen: false })
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    blockCard = () => {
        this.showProgressDialog();
        arbiApiService.blockCardtemp(this.state.cardDetails.key, this.componentName)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    ImportantDetails.cardDetailResponse = {};
                    let processorResponse = ArbiResponseHandler.processBlockCardTempResponse(response.result);
                    if (processorResponse.success) {
                        this.formApiResponsePayload("cartao/bloquear-cartao-pedido-cliente");
                        this.setState({
                            title: localeObj.card_blocked,
                            description: localeObj.block_description,
                            subText: localeObj.block_subText,
                            vCardStatus: "success",
                            header: localeObj.account_card,
                            direction: "left"
                        })
                    } else {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            })
    }

    unblockCard = () => {
        this.showProgressDialog();
        arbiApiService.unblockCardTemp(this.state.cardDetails.key, this.componentName)
            .then(response => {
                this.hideProgressDialog();
                Log.debug("Card Unblock " + response.success)
                if (response.success) {
                    ImportantDetails.cardDetailResponse = {};
                    let processorResponse = ArbiResponseHandler.processUnblockCardTempResponse(response.result);
                    if (processorResponse.success) {
                        this.formApiResponsePayload("cartao/desbloquear-cartao-pedido-cliente");
                        this.setState({
                            title: localeObj.card_unblocked,
                            description: localeObj.unblock_description,
                            vCardStatus: "success",
                            header: localeObj.account_card,
                            direction: "left"
                        })
                    } else {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            })
    };

    formApiResponsePayload = (uri) => {
        let jsonObj = {};
        jsonObj["chaveDeConta"] = ImportantDetails.accountKey;
        jsonObj["chaveDeCliente"] = ImportantDetails.clientKey;
        jsonObj["chaveDeCartao"] = this.state.cardDetails.key;
        jsonObj["cardType"] = "virtual";
        jsonObj["cardProvider"] = this.state.cardDetails.brand;
        jsonObj["apiName"] = "/" + uri;
        ArbiApiMetrics.sendArbiMetrics(CARD_STATUS_UPDATE, CARD_STATUS_UPDATE, true, 201, jsonObj, 0);
    }

    gpayAction = () => {
        //Log.sDebug("gpayAction");
        if (this.state.gpayBtnText === localeObj.remove_btn) {
            this.removeCardFromGPayDialog()
        }
        else {
            this.setState({
                skipGpay: false
            })
            if (this.walletId === "") {
                androidApiCalls.createWallet();
            } else if (this.isGPayInstalled()) {
                if (GeneralUtilities.emptyValueCheck(this.state.pin)) {
                    this.setState({
                        vCardStatus: "gpay_pin",
                    });
                } else {
                    this.getOPC(this.state.pin);
                }

            } else {
                this.installGPayDialog();
            }
        }
        this.sendEventMetrics(constantObjects.eventName, PageNameJSON["google_pay"]);
    }

    isGPayInstalled = () => {
        return androidApiCalls.isPackageAvailable("com.google.android.apps.walletnfcrel");
    }

    handleGPayResponse = (response) => {
        //Log.sDebug("response is = " + response);
        if (response === -1) {
            this.showGPayScreen();
        } else {
            this.showGPayErrorScreen();
        }
    }

    gPayDataChangedListener = () => {
        this.showGPayScreen();
    }

    showGPayScreen = () => {
        this.showProgressDialog();
        androidApiCalls.getActiveWalletId();
        androidApiCalls.getStableHardwareId();
        androidApiCalls.listTokens(false);
    }

    handleIsTokenizedResponse() {
        this.hideProgressDialog();
        if (this.cardAddedToGPay) {
            if (this.state.gpayOnboarding)
                this.skipGpayOnboarding();
            this.setState({
                vCardStatus: "google_pay",
                gpayDescription1: this.state.gpayOnboarding ? localeObj.gpay_desc1_onboarding : localeObj.gpay_desc1,
                gpayDescription2: this.state.gpayOnboarding ? localeObj.gpay_desc2_onboarding : localeObj.gpay_desc2,
                gpayDescription3: this.state.gpayOnboarding ? localeObj.gpay_desc3_onboarding : localeObj.gpay_desc3,
                gpayDescription4: localeObj.gpay_desc4,
                gpayBtnText: localeObj.remove_btn,
                setAsDefaultBtnTxt: localeObj.set_gpay_default_tap_btnText,
                addedToGpay: localeObj.added_to_gpay,
                isCardAddedToGpay: true,
                isCardDefaultCardInGPay: this.isCardDefaultCardInGPay,
                direction: "left",
                appBar: localeObj.google_pay
            });
        } else {
            this.setState({
                vCardStatus: "google_pay",
                gpayDescription1: this.state.gpayOnboarding ? localeObj.gpay_desc1_onboarding : localeObj.gpay_desc1,
                gpayDescription2: this.state.gpayOnboarding ? localeObj.gpay_desc2_onboarding : localeObj.gpay_desc2,
                gpayDescription3: this.state.gpayOnboarding ? localeObj.gpay_desc3_onboarding : localeObj.gpay_desc3,
                gpayDescription4: localeObj.gpay_desc4,
                gpayBtnText: localeObj.add_to_gpay_btn,
                accesAccountBtn: localeObj.access_account,
                isCardAddedToGpay: false,
                direction: "left",
                appBar: localeObj.google_pay
            });
        }
    }

    accesAccount = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", newOnboarding: true });
    }

    showGPayErrorScreen = () => {
        this.setState({
            vCardStatus: "google_pay_error",
            gpayErrorHeader: localeObj.gpay_error_header,
            gpayErrorBody: localeObj.gpay_error_body,
            gpayErrorBtn: localeObj.gpay_error_primary_btn,
            gpayErrorBtn2: localeObj.gpay_error_secondary_btn
        });
    }

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }

    gpayErrorAction = () => {
        //Log.sDebug("gpayErrorAction", PageNameJSON[this.state.vCardStatus], constantObjects.LOG_PROD);
        this.sendEventMetrics(constantObjects.backToGPay, PageNameJSON["google_pay_error"]);
        this.onBack();
    }

    removeCardFromGPayDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.remove_btn,
            bottom_header: localeObj.remove_card_from_gpay,
        })
    }

    skipGpayOnboarding = () => {
        this.setState({
            skipGpay: false
        })
        this.props.history.replace({ pathname: "/accountConfirmation", transition: "left" });
    }

    installGPayDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.install_btn,
            bottom_header: localeObj.install_gpay_header,
            description: localeObj.install_gpay_desc,
        })
    }

    setGPayAsDefaulTAPDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.set_gpay_default_tap_btnText,
            bottom_header: localeObj.set_gpay_default_tap_header,
            description: localeObj.set_gpay_default_tap_desc,
        })
    }

    setCardAsDefaulDialog = () => {
        this.sendEventMetrics(constantObjects.setCardAsDefaultCardInGPay, PageNameJSON["google_pay"]);
        this.setState({
            open: true,
            btnText: localeObj.set_gpay_default_tap_btnText,
            bottom_header: localeObj.set_card_default_header,
            description: localeObj.set_card_default_desc,
        })
    }

    removeCardFromGPay = () => {
        //Log.sDebug("removeCardFromGPay");
        this.sendEventMetrics(constantObjects.removeCardFromGooglePay, PageNameJSON["google_pay_bottom_dialog"]);
        if (this.state.cardDetails.brand === "ELO")
            androidApiCalls.removeCardFromGPay(this.tokenID, constantObjects.TSP_ELO);
        else
            androidApiCalls.removeCardFromGPay(this.tokenID, constantObjects.TSP_VISA);
    }

    installGPay = () => {
        //Log.sDebug("installGPay");
        this.sendEventMetrics(constantObjects.installGPay, PageNameJSON["google_pay_bottom_dialog"]);
        androidApiCalls.installGPay();
    }

    setGPayAsDefaulTAP = () => {
        //Log.sDebug("setGPayAsDefaulTAP");
        androidApiCalls.setGPayAsDefaultTAPApplication();
    }

    setCardAsDefaultInGPay = () => {
        //Log.sDebug("setCardAsDefaultInGPay");
        this.sendEventMetrics(constantObjects.setCardAsDefaultCardInGPay, PageNameJSON["google_pay_bottom_dialog"]);
        if (this.state.cardDetails.brand === "ELO")
            androidApiCalls.setCardAsDefaultInGPay(this.tokenID, constantObjects.TSP_ELO);
        else
            androidApiCalls.setCardAsDefaultInGPay(this.tokenID, constantObjects.TSP_VISA);
    }

    showBottomSheet = () => {
        this.sendEventMetrics(constantObjects.customerCare, PageNameJSON["google_pay_error"]);
        this.handleBottomSheet(true);
    }

    handleBottomSheet = (val) => {
        this.setState({
            bottomSheetEnabled: val
        });
    }

    getOPC = (field) => {
        if (this.state.vCardStatus === "gpay_pin")
            this.onBack();
        this.showProgressDialog();
        arbiApiService.getOPC({ "cardKey": this.state.cardDetails.key, "pin": field }, this.walletId, this.deviceId, this.componentName)
            .then(response => {
                //Log.sDebug("getOPC response: " + response.success)
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetOPCResponse(response.result);
                    if (processorResponse.success) {
                        //Log.sDebug("OPC = " + response.result.opaqueJson);
                        //Log.sDebug("istokenStatePendingVerification" + this.istokenStatePendingVerification);
                        //Log.sDebug("tokenID" + this.tokenID);
                        this.hideProgressDialog();
                        if (this.istokenStatePendingVerification) {
                            androidApiCalls.manualProvisioning(this.gpayJson, this.tokenID);
                        } else {
                            androidApiCalls.addCardToGpay(response.result.opaqueJson, this.gpayJson, this.userDetails);
                        }

                    } else {
                        //Log.sDebug("OPC fail", PageNameJSON[this.state.vCardStatus], constantObjects.LOG_PROD);
                        this.hideProgressDialog();
                        this.showGPayErrorScreen();
                    }
                } else {
                    //Log.sDebug("Failure in getting OPC", PageNameJSON[this.state.vCardStatus], constantObjects.LOG_PROD);
                    this.hideProgressDialog();
                    this.showGPayErrorScreen();
                }
            })
    }



    goToHomePage = () => {
        let event = {
            eventType: constantObjects.vCardSuccess,
            page_name: PageNameJSON[this.state.vCardStatus],
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        if (this.state.open === true) {
            this.onSecondary()
        } else {
            if (this.props.location.from === "giftCard") {
                this.props.history.replace({ pathname: "/digitalCard", from: "giftCard", transition: "right" });
                return;
            }
            this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
        }
    }

    onCancel = () => {
        if (this.state.vCardStatus === "google_pay_error")
            this.onBack();
        else if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        }
        this.setState({
            bottom_header: localeObj.skip_gpay_bottom_sheet_title,
            description: localeObj.skip_gpay_bottom_sheet_desc,
            skipGpay: true
        })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else if (this.state.reset) {
            return this.setState({ reset: false })
        } else if (this.state.bottomSheetOpen) {
            return this.setState({ bottomSheetOpen: false })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.vCardStatus], PageState.back);
            switch (this.state.vCardStatus) {
                case "verify_pin":
                    this.goToHomePage();
                    break;
                case "success":
                case "show_vcard_details":
                    this.goToHomePage();
                    break;
                case "credit_card_settings":
                    this.setState({
                        vCardStatus: "show_vcard_details",
                        direction: "right",
                    });
                    break;
                case "google_pay":
                    if (this.state.gpayOnboarding)
                        this.props.history.push({ pathname: "/", transition: "right" });
                    else
                        this.getCardDetails(this.state.pin);
                    break;
                case "delete":
                    this.getCardDetails();
                    break;
                case "credit_card_settings_due_date":
                    this.setState({
                        vCardStatus: "credit_card_settings",
                        direction: "right",
                    });
                    break;
                case "verify_pin_delete":
                    this.setState({
                        vCardStatus: "delete",
                        direction: "right",
                    })
                    break;
                case "gpay_pin":
                case "google_pay_error":
                    this.setState({
                        vCardStatus: "google_pay",
                        direction: "right",
                    });
                    break;
                default:
                    this.goToHomePage();
                    break;
            }
        }
    }

    openCreditCardSettingsScreen = () => {
        this.showProgressDialog();
        // arbiApiService.getCreditCardSettingsData().
        //     then(response => {
        //         if (response.success) {
        //             //Log.sDebug("Credit Card Settings details Fetched", "Credit Card Settings Page");
        //             let processorResponse = ArbiResponseHandler.processCreditCardSettingsDetailsData(response.result);
        //             if (processorResponse.success) {
        //                 //Log.sDebug("Credit Card Setting Details Fetched: ");
        //                 //Log.sDebug("creditCardContactlessPayment =>" + processorResponse.contactlessPayment);
        //                 this.setState({
        //                     creditCardContactlessPayment: processorResponse.contactlessPayment,
        //                     creditCardSettingsResult: processorResponse.result
        //                 });
        arbiApiService.getCreditCardData(this.componentName).then(response => {
            if (response.success) {
                //Log.sDebug("Credit Card Home page details Fetched", "Credit Card Home Page");
                let processorResponse = ArbiResponseHandler.processCreditCardDetailsData(response.result);
                if (processorResponse.success) {
                    this.hideProgressDialog();
                    this.setState({
                        invoiceDueDate: moment(processorResponse.dueDate).format('DD'),
                        automaticDebit: processorResponse.autoDebit,
                        vCardStatus: "credit_card_settings",
                        direction: "left",
                        appBar: localeObj.credit_card_settings
                    });
                } else {
                    //Log.sDebug("getCreditCardSettingsData, Error getting credit card deatils");
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                //Log.sDebug("getCreditCardSettingsData failed");
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
        //         } else {
        //             //Log.sDebug("getCreditCardData, Error getting credit card deatils");
        //             this.hideProgressDialog();
        //             let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
        //             this.setTransactionInfo(errorJson);

        //         }
        //     } else {
        //         //Log.sDebug("getCreditCardData failed");
        //         this.hideProgressDialog();
        //         let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
        //         this.setTransactionInfo(errorJson);

        //     }
        // });
    }

    setBillingDate = (modifiedDate) => {
        this.setState({
            invoiceDueDate: modifiedDate
        });
    }

    openChangeInvoiceDueDate = () => {
        let event = constantObjects.creditCardInvoiceDetails
        this.sendEventMetrics(event, PageNameJSON["credit_card_homepage"]);
        this.setState({
            vCardStatus: "credit_card_settings_due_date",
            preSelectedDate: this.state.invoiceDueDate,
            appBar: localeObj.invoice_due_date
        });
    }

    updateCreditCardAutomaticDebitStatus = (status) => {
        this.setState({
            automaticDebit: status
        });
    }

    openMyCardsPage = () => {
        this.props.history.push({
            pathname: "/digitalCard",
            "fromComponent": "CreditCardSettings"
        });
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return;
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.credit_card_settings);
        this.props.history.replace({ pathname: "/chat", transition: "right" });
    }

    render() {
        const { classes } = this.props;
        const currentState = this.state.vCardStatus;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        this.menuOptions = [];

        if (this.state.blockStatus === "Desbloqueado") {
            if (androidApiCalls.isFeatureEnabledInApk("VISA_GPAY"))
                this.menuOptions.push(localeObj.google_pay);
            this.menuOptions.push(localeObj.card_block);
            // this.menuOptions.push(localeObj.virtual_card_delete);

        } else {
            this.menuOptions.push(localeObj.unblock_card);
            // this.menuOptions.push(localeObj.virtual_card_delete);
        }

        if (this.state.enableCreditCardSettings)
            this.menuOptions.push(localeObj.credit_card_settings);
        const appBarAction = this.state.gpayOnboarding ? "cancel" : "none";

        return (
            <div style={{ overflowX: "hidden" }}>
                {currentState !== "error" && currentState !== "success" && currentState !== "delete" && currentState !== "credit_card_settings" &&
                    <ButtonAppBar header={this.state.appBar} onBack={this.onBack} action={appBarAction} onCancel={this.onCancel} />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "verify_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "verify_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "verify_pin" && <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword}
                            componentName={PageNameJSON.verify_pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "show_vcard_details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "show_vcard_details" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "show_vcard_details" && <VirtualCardMainPage details={this.state.cardDetails} menuOptions={this.menuOptions} action={this.setTransactionInfo}
                            componentName={PageNameJSON.show_vcard_details} back={this.onBack} hashVal={this.state.hashVal} pin={this.state.pin} src={this.state.iframeSrc} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.goToWalletPage} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "verify_pin_delete" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "verify_pin_delete" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "verify_pin_delete" && <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword}
                            componentName={PageNameJSON.verify_pin_delete} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_settings" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_card_settings" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_card_settings" &&
                            this.state.enableCreditCardSettings && <div>
                                <CreditCardSettingsComponent
                                    automaticDebit={this.state.automaticDebit}
                                    onBackHome={this.onBack}
                                    updateCreditCardAutomaticDebitStatus={this.updateCreditCardAutomaticDebitStatus}
                                    openMyCards={this.openMyCardsPage}
                                    invoiceDueDate={this.state.invoiceDueDate}
                                    openChangeInvoiceDueDate={this.openChangeInvoiceDueDate}
                                    componentName={PageNameJSON['credit_card_settings']} goToChatbot={this.goToChatbot} fromVirtualCard={true} />
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_settings_due_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_card_settings_due_date" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_card_settings_due_date" && <div>
                            <CreditCardChangeDueDateComponent
                                onBack={this.onBack}
                                setBillingDate={this.setBillingDate}
                                preSelectedDate={this.state.invoiceDueDate}
                                componentName={PageNameJSON['credit_card_settings_change_due_date']} />
                        </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "google_pay" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "google_pay" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "google_pay" && <GooglePayComponent virtualCard={localeObj.virtual_card} onCancel={this.onBack} gpayIcon={this.state.cardDetails.brand === "VISA" ? visaGpayCard : gpayCard} details={this.state.cardDetails} gpayDesc={this.state.gpayDescription1} gpayEntryPoint={this.state.gpayEntryPoint} gpayOnboarding={this.state.gpayOnboarding} isGpayErrorScreen={false}
                            appBar={false} card={true} gpayBtn={true} gpayDesc2={this.state.gpayDescription2} gpayDesc3={this.state.gpayDescription3} gpayDesc4={this.state.gpayDescription4} googleIcon={googleIcon} addToGpayIcon={addToGpayIcon} setAsDefaultIcon={setAsDefaultIcon} gpayBtnText={this.state.gpayBtnText} setAsDefaultBtnTxt={this.state.setAsDefaultBtnTxt} addedToGpay={this.state.addedToGpay}
                            accesAccountBtn={this.state.accesAccountBtn} accesAccount={this.accesAccount} handleGPayResponse={this.handleGPayResponse} cardKey={this.state.cardDetails.key} cardType={this.state.cardDetails.cardType} gPayDataChangedListener={this.gPayDataChangedListener} isCardAddedToGpay={this.state.isCardAddedToGpay} isCardDefaultCardInGPay={this.state.isCardDefaultCardInGPay} next={this.gpayAction} onAction={this.setCardAsDefaulDialog} type={PageNameJSON["google_pay"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "google_pay_error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "google_pay_error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "google_pay_error" && <GooglePayComponent header={this.state.gpayErrorHeader} icon={alertIcon} appBar={false} onCancel={this.onBack} type={PageNameJSON["google_pay_error"]} isGpayErrorScreen={true}
                            gpayEntryPoint={this.state.gpayEntryPoint} description={this.state.gpayErrorBody} btnText={this.state.gpayErrorBtn} action={this.state.gpayErrorBtn2} next={this.gpayErrorAction} onAction={this.showBottomSheet}
                            bottomSheet={this.state.bottomSheetEnabled} handleBottomSheet={this.handleBottomSheet} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "gpay_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "gpay_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "gpay_pin" && <InputPinPage confirm={this.getOPC} header={localeObj.four_digit_auth} description={localeObj.enterPin} componentName={PageNameJSON["enter_pin"]} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "delete" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "delete" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "delete" && <PixErrorComponent errorJson={this.state.deleteWarning} onClick={this.setTransactionInfo} btnText={localeObj.virtual_card_delete_button} componentName={PageNameJSON.delete} sendJson={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={this.state.title} onCancel={this.goToHomePage} icon={success} type={PageNameJSON.success}
                                    appBar={true} description={this.state.description} btnText={false} subText={this.state.subText} onClick={this.setTransactionInfo} />
                            </div>
                        }
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottom_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.btnText} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>

                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.skipGpay}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottom_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <div style={{textAlign: "center"}} onClick={this.gpayAction}>
                                <img style={{ width: `${screenWidth * 0.7}px` }} src={addToGpayIcon} alt=""/>
                            </div>
                            <div className="Body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.skipGpayOnboarding}>
                                {localeObj.gpay_skip}
                            </div>
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.wrong_passcode}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.wrong_passcode_header}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.try} onCheck={this.onPrimaryPin} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondaryPin} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.forgot_passcode}>
                                {localeObj.forgot_passcode}
                            </div>
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.reset}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.reset_password}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.pin_expired}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
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

VirtualCardComponenet.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(VirtualCardComponenet);