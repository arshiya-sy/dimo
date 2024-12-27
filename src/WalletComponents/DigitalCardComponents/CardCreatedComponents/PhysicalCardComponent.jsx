import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import moment from "moment";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponseHandler from "../../../Services/ArbiErrorResponsehandler";
import ArbiApiMetrics from "../../../Services/ArbiApiMetrics";
import MetricServices from "../../../Services/MetricsService";

import success from "../../../images/SpotIllustrations/Checkmark.png";
import card from "../../../images/SpotIllustrations/Card.png";
import newCard from "../../../images/SpotIllustrations/cc_onboarding.webp";
import gpayCard from "../../../images/SpotIllustrations/Credcard-google-pay-page.png";
import alertIcon from "../../../images/SpotIllustrations/Alert.png";
import googleIcon from '../../../images/SpotIllustrations/gpay_txt.png';
import addToGpayIcon from '../../../images/SpotIllustrations/add_to_gpay_btn.png';
import setAsDefaultIcon from '../../../images/SpotIllustrations/setAsDefault.png';
import OneIcon from "../../../images/SvgUiIcons/number_1.svg";
import TwoIcon from "../../../images/SvgUiIcons/number_2.svg";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import SelectMenuOption from "../../CommonUxComponents/SelectMenuOption";
import InputPinPage from "../../CommonUxComponents/InputPinPage";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import GooglePayComponent from "../../CommonUxComponents/GooglePayComponent";

import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import CardExistComponent from "./CardExistComponent";
import androidApiCallsService from "../../../Services/androidApiCallsService";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import RequestNotAllowedComponent from "./RequestNotAllowed";
import DigitalCardArrival from "../CardRequestComponents/DigitalCardArrival";
import CreditCardSettingsComponent from "../CreditCardComponents/CreditCardSettingsPage";
import CreditCardChangeDueDateComponent from "../CreditCardComponents/CreditCardChangeDueDateComponent";
import MoreOptionsComponent from "./MoreOptionsComponent";
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import ColorPicker from "../../../Services/ColorPicker";

const theme2 = InputThemes.snackBarThemeForMyCards;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.physicalCardComponents;
const TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION = 3;
const GET_CARD_STATUS_IN_GPAY = "GET_CARD_STATUS_IN_GPAY";
const CARD_STATUS_UPDATE = "CARD_STATUS_UPDATE_CUSTOM";
var localeObj = {};

class PhysicalCardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            cardType: "Physical Card",
            creationState: "card",
            open: false,
            bottomSheetOpen: false,
            direction: "",
            details: props.location.state,
            listCards: props.location.listCards,
            appBar: "",
            userName: "",
            bottomSheetEnabled: false,
            menuOptionsVisibility: true,
            selection: false,
            gpayEntryPoint: PageNameJSON["card"],
            enableCreditCard: false,
            invoiceDueDate: "",
            automaticDebit: false,
            isClickable: false

        };
        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.bottomSheetColor
            },
            imgStyle: {
                height: "1.25rem",
                width: "1.25rem",
                padding: "1rem"
            },
            iconStyle: {
                height: "1.1rem",
                width: "1.1rem",
                padding: "1rem"
            },
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.blockedTemp = "Bloqueado a pedido do cliente Cliente";
        this.blockedByIncorrectPin = "Bloqueado por Senha Incorreta";
        this.unblocked = "Desbloqueado";
        this.menuOptions = [];
        this.cardAddedToGPay = false;
        this.isCardDefaultCardInGPay = false;
        this.istokenStatePendingVerification = false;
        this.tokenID = "";
        this.gpayJson = {};
        this.userDetails = {};
        this.walletId = "";
        this.deviceId = "";
        this.componentName = PageNameJSON["card"];
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            appBar: localeObj.physical_card
        })
        window.onBackPressed = () => {
            this.onBack();
        }

        window.isTokenized = (response, isCardDefault, tokenStateInt, tokenID) => {
            this.isCardTokenized(response, isCardDefault, tokenStateInt, tokenID);
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
                if (tokenArray[2] === this.state.details.number.substring(15, 19)) {
                    tokenAvailable = true;
                    if (this.state.details.brand === "ELO")
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

        window.handleExceptionInGPayIntegration = (response) => {
            Log.sDebug("handleExceptionInGPayIntegration response: " + response);

        }

        window.getActiveWalletId = (response) => {
            Log.sDebug("getActiveWalletId response: " + response);
            this.walletId = response;
        }
        window.getStableHardwareId = (response) => {
            Log.sDebug("getStableHardwareId response: " + response);
            this.deviceId = response;
        }

        window.gPayDataChangedListener = () => {
            Log.sDebug("gPayDataChangedListener");
            if (this.state.creationState === "google_pay") {
                this.showGPayScreen();
            }
        }

        this.gpayJson = {
            "userName": this.state.details.number.substring(15, 19),
            "last4Digits": this.state.details.number.substring(15, 19),
            "cardNetwork": this.state.details.brand === "ELO" ? constantObjects.CARD_NETWORK_ELO : constantObjects.CARD_NETWORK_VISA,
            "tsp": this.state.details.brand === "ELO" ? constantObjects.TSP_ELO : constantObjects.TSP_VISA
        }
        this.fetchUserDetails();
        if (ImportantDetails.creditStatus) {
            this.setState({
                creditStatus: ImportantDetails.creditStatus
            }, () => {
                if (ImportantDetails.creditStatus && ImportantDetails.creditStatus >= 5) {
                    this.setState({
                        enableCreditCard: true
                    })
                } else {
                    this.setState({
                        enableCreditCard: false
                    })
                }
            });
        }
        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            let action = this.props.location.additionalInfo["cardActions"];
            if (action !== "" && action !== undefined) {
                if (action === "google_pay" || action === "set_card_as_default_gpay")
                    this.showGPayScreen();
            }
        }

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
                    if (action === "set_card_as_default_gpay")
                        this.setCardAsDefaultInGPay();
                }
            }
        } else {
            this.cardAddedToGPay = false;
        }
        this.handleIsTokenizedResponse();
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
                    //Log.sDebug("fetchUserDetails, Error getting user deatils", PageNameJSON[this.state.creationState], constantObjects.LOG_PROD);
                }
            } else {
                //let errorMessage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                //Log.sDebug("fetchUserDetails" + errorMessage, PageNameJSON[this.state.creationState], constantObjects.LOG_PROD);
            }
        })
    }

    multipleSelection = (field) => {
        this.setState({
            selection: field
        })
    }

    open = () => {
        this.setState({ open: true })
    }

    onSecondary = () => {
        this.setState({ open: false })
    }

    onPrimary = () => {
        Log.debug("onPrimary: btnText: " + this.state.btnText);
        this.setState({ open: false })
        if (this.state.btnText === localeObj.remove_btn) {
            this.removeCardFromGPay();
        } else if (this.state.btnText === localeObj.install_btn) {
            this.installGPay();
        } else if (this.state.btnText === localeObj.set_gpay_default_tap_btnText) {
            this.setCardAsDefaultInGPay();
        } else if (this.state.btnText === localeObj.card_block) {
            this.onBlockCard("Temp");
        } else {
            if (this.state.details.status === this.blockedTemp) {
                this.onUnblockCardTemp();
            } else {
                this.setState({
                    creationState: "new_pin",
                    direction: "left"
                })
            }
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

    moreOptionsRequestSecondCopy = () => {
        if (this.state.details.brand === "ELO") {
            if (this.props.location.visaEnabled) {
                this.setState({
                    creationState: "request_not_allowed",
                    direction: "left",
                    appBar: localeObj.request_copy
                })
            } else {
                this.setState({
                    creationState: "card_exists",
                    direction: "left"
                })
            }
        } else {
            this.getSecondCopyTariff();
        }
    }

    moreOptionsCancelCard = () => {
        this.setState({
            creationState: "cancel",
            direction: "left",
            appBar: localeObj.cancel_card
        })
    }

    action = (option) => {
        switch (option) {
            case localeObj.card_block:
                this.setState({
                    open: true,
                    btnText: localeObj.card_block,
                    header: localeObj.block_header
                })
                break;
            case localeObj.cancel_card:
                this.setState({
                    creationState: "cancel",
                    direction: "left",
                    appBar: localeObj.cancel_card
                })
                break;
            case localeObj.unblock_card:
                this.setState({
                    open: true,
                    btnText: localeObj.unblock_card,
                    header: localeObj.unblock_header
                })
                break;
            case localeObj.request_copy:
                if (this.state.details.brand === "ELO") {
                    if (this.props.location.visaEnabled) {
                        this.setState({
                            creationState: "request_not_allowed",
                            direction: "left",
                            appBar: localeObj.request_copy
                        })
                    } else {
                        this.setState({
                            creationState: "card_exists",
                            direction: "left"
                        })
                    }
                } else {
                    this.getSecondCopyTariff();
                }
                break;
            case localeObj.google_pay:
                this.sendEventMetrics(constantObjects.googlePay, PageNameJSON["card"]);
                this.showGPayScreen();
                break;
            case localeObj.more_card_options:
                this.sendEventMetrics(constantObjects.moreOptions, PageNameJSON["card"]);
                this.showMoreOptionsScreen();
                break;
            case localeObj.credit_card_settings:
                this.sendEventMetrics(constantObjects.creditCardSettings, PageNameJSON["card"]);
                this.openCreditCardSettingsScreen();
                break;
            default:
                break;
        }
    }

    showMoreOptionsScreen = () => {
        this.showProgressDialog();
        arbiApiService.getCreditCardSettingsData(this.state.details.cardKey, this.componentName).then(response => {
            if (response.success) {
                //Log.sDebug("Credit Card Settings details Fetched", "Credit Card Settings Page");
                let processorResponse = ArbiResponseHandler.processCreditCardSettingsDetailsData(response.result);
                if (processorResponse.success) {
                    this.hideProgressDialog();
                    //Log.sDebug("Credit Card Setting Details Fetched: ");
                    //Log.sDebug("creditCardContactlessPayment =>" + processorResponse.contactlessPayment);
                    this.setState({
                        creditCardContactlessPayment: processorResponse.contactlessPayment,
                        creationState: "more_options",
                        direction: "left",
                        appBar: localeObj.more_card_options
                    });
                } else {
                    //this.openSnackBar(localeObj.noCreditCardSettings);
                    this.hideProgressDialog();
                    //Log.sDebug("getCreditCardData, Error getting credit card deatils");
                    let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    this.openSnackBar(errorMessageToUser);
                }
            } else {
                //this.openSnackBar(localeObj.noCreditCardSettings);
                this.hideProgressDialog();
                //Log.sDebug("getCreditCardData failed");
                let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                this.openSnackBar(errorMessageToUser);
            }
        });
    }

    openCreditCardSettingsScreen = () => {
        this.showProgressDialog();
        arbiApiService.getCreditCardData(this.componentName).then(response => {
            if (response.success) {
                //Log.sDebug("Credit Card Home page details Fetched", "Credit Card Home Page");
                let processorResponse = ArbiResponseHandler.processCreditCardDetailsData(response.result);
                if (processorResponse.success) {
                    this.hideProgressDialog();
                    this.setState({
                        invoiceDueDate: moment(processorResponse.dueDate).format('DD'),
                        automaticDebit: processorResponse.autoDebit,
                        creationState: "credit_card_settings",
                        direction: "left",
                        appBar: localeObj.credit_card_settings
                    });
                } else {
                    //Log.sDebug("getCreditCardSettingsData, Error getting credit card deatils");
                    this.hideProgressDialog();
                    let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    this.openSnackBar(errorMessageToUser);
                }
            } else {
                //Log.sDebug("getCreditCardSettingsData failed");
                this.hideProgressDialog();
                let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                this.openSnackBar(errorMessageToUser);
            }
        });

    }

    onBlockCard = (index) => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }

        this.showProgressDialog();
        if (index === 0) {
            arbiApiService.blockCardDamaged(this.state.details.cardKey, this.componentName)
                .then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        ImportantDetails.cardDetailResponse = {};
                        let processorResponse = ArbiResponseHandler.processBlockCardDamagedResponse(response.result);
                        if (processorResponse.success) {
                            this.formSuccessResponse();
                            this.formApiResponsePayload("cartao/bloquear-cartao-danificado");
                        } else {
                            this.openSnackBar(processorResponse.message);
                            return;
                        }
                    } else {
                        let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                        this.openSnackBar(errorMessageToUser);
                    }
                })
        } else if (index === 1) {
            arbiApiService.blockCardStolen(this.state.details.cardKey, this.componentName)
                .then(response => {
                    this.hideProgressDialog();
                    Log.debug("Card Block " + response.success)
                    if (response.success) {
                        ImportantDetails.cardDetailResponse = {};
                        let processorResponse = ArbiResponseHandler.processBlockCardStolenResponse(response.result);
                        if (processorResponse.success) {
                            this.formSuccessResponse();
                            this.formApiResponsePayload("cartao/bloquear-cartao-roubo");
                        } else {
                            this.openSnackBar(processorResponse.message);
                            return;
                        }
                    } else {
                        let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                        this.openSnackBar(errorMessageToUser);
                    }
                })
        } else if (index === 2) {
            arbiApiService.blockCardLost(this.state.details.cardKey, this.componentName)
                .then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        ImportantDetails.cardDetailResponse = {};
                        let processorResponse = ArbiResponseHandler.processBlockCardLostResponse(response.result);
                        if (processorResponse.success) {
                            this.formSuccessResponse();
                            this.formApiResponsePayload("cartao/bloquear-cartao-perda");
                        } else {
                            this.openSnackBar(processorResponse.message);
                            return;
                        }
                    } else {
                        let errorMessageToUser = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                        this.openSnackBar(errorMessageToUser);
                    }
                })
        } else {
            arbiApiService.blockCardtemp(this.state.details.cardKey, this.componentName)
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
                                creationState: "success",
                                appBar: localeObj.account_card,
                                direction: "left"
                            })
                        } else {
                            this.openSnackBar(processorResponse.message);
                            return;
                        }
                    } else {
                        this.formErrorJson(response);
                    }
                })
        }
    };

    onUnblockCardTemp = () => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        this.showProgressDialog();
        arbiApiService.unblockCardTemp(this.state.details.cardKey, this.componentName)
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
                            creationState: "success",
                            appBar: localeObj.account_card,
                            direction: "left"
                        })
                    } else {
                        this.openSnackBar(processorResponse.message);
                        return;
                    }
                } else {
                    this.formErrorJson(response);
                }
            })
    };

    onUnblockIncorrectPin = (pin) => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        this.showProgressDialog();
        arbiApiService.unblockCardIncorrectPin({ "cardKey": this.state.details.cardKey, "pin": pin }, this.componentName)
            .then(response => {
                this.hideProgressDialog();
                Log.debug("Card Unblock " + response.success)
                if (response.success) {
                    ImportantDetails.cardDetailResponse = {};
                    let processorResponse = ArbiResponseHandler.processUnblockCardIncorrectPinResponse(response.result);
                    if (processorResponse.success) {
                        this.formApiResponsePayload("cartao/desbloquear-cartao-por-senha-incorreta");
                        this.setState({
                            title: localeObj.card_unblocked,
                            description: localeObj.unblock_description,
                            creationState: "success",
                            appBar: localeObj.account_card,
                            direction: "left"
                        })
                    } else {
                        this.openSnackBar(processorResponse.message);
                        return;
                    }
                } else {
                    this.formErrorJson(response);
                }
            })
    };

    onRequestNewCard = () => {
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        if (parseFloat(this.state.tariff) <= parseFloat(ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal)) {
            this.showProgressDialog();
            arbiApiService.requestSecondCopy({ "cardKey": this.state.details.cardKey, "reason": this.state.reason }, this.componentName)
                .then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        ImportantDetails.cardDetailResponse = {};
                        let processorResponse = ArbiResponseHandler.processUnblockCardIncorrectPinResponse(response.result);
                        if (processorResponse.success) {
                            this.formApiResponsePayload("cartao/solicitar-segunda-via-cartao-fisico");
                            this.setState({
                                title: localeObj.physical_card_header,
                                description: localeObj.arrive_time,
                                creationState: "success",
                                appBar: localeObj.account_card,
                                direction: "left"
                            })
                        } else {
                            this.openSnackBar(processorResponse.message);
                            return;
                        }
                    } else {
                        this.formErrorJson(response);
                    }
                })
        } else {
            let jsonObj = {};
            jsonObj["header"] = localeObj.card_failed;
            jsonObj["description"] = localeObj.pix_amount_outofbound;
            this.setState({
                errorJson: jsonObj,
                creationState: "error",
                direction: "left"
            })
        }
    };

    formErrorJson = (data) => {
        let jsonObj = {};
        let errorMessage = ArbiErrorResponseHandler.processCardErrors(data, localeObj);
        jsonObj["header"] = localeObj.card_failed;
        jsonObj["description"] = errorMessage;
        this.setState({
            errorJson: jsonObj,
            creationState: "error",
            direction: "left"
        })
    }

    formSuccessResponse = () => {
        this.setState({
            title: localeObj.card_cancelled,
            description: localeObj.block_description,
            subText: localeObj.unblock_subText,
            creationState: "success",
            appBar: localeObj.account_card,
            direction: "left"
        })
    }

    formApiResponsePayload = (uri) => {
        let jsonObj = {};
        jsonObj["chaveDeConta"] = ImportantDetails.accountKey;
        jsonObj["chaveDeCliente"] = ImportantDetails.clientKey;
        jsonObj["chaveDeCartao"] = this.state.details.cardKey;
        jsonObj["cardType"] = "physical";
        jsonObj["cardProvider"] = this.state.details.brand;
        jsonObj["apiName"] = "/" + uri;
        ArbiApiMetrics.sendArbiMetrics(CARD_STATUS_UPDATE, CARD_STATUS_UPDATE, true, 201, jsonObj, 0);
    }

    onHandleGoToHome = () => {
        if (this.props.location.from === "giftCard") {
            this.props.history.replace({ pathname: "/digitalCard", from: "giftCard", transition: "right" });
            return;
        }
        this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
    }

    onBack = () => {
        if (this.state.bottomSheetOpen) {
            return this.setState({
                bottomSheetOpen: false
            });
        } else if (this.state.open) {
            return this.setState({ open: false })
        }
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "card":
                    if (!this.state.selection) {
                        this.onHandleGoToHome();
                    } else {
                        this.setState({
                            selection: false
                        })
                    }
                    break;
                case "error":
                case "success":
                case "card_exists":
                    this.setState({
                        menuOptionsVisibility: false
                    });
                    this.onHandleGoToHome();
                    break;
                case "cancel":
                case "confirm_copy":
                    this.setState({
                        creationState: "card",
                        direction: "right",
                        appBar: localeObj.physical_card
                    })
                    break;
                case "new_pin":
                    this.onHandleGoToHome();
                    break;
                case "google_pay":
                case "request_not_allowed":
                    this.setState({
                        creationState: "card",
                        direction: "right",
                        appBar: localeObj.physical_card
                    })
                    break;
                case "credit_card_settings_due_date":
                    this.setState({
                        creationState: "credit_card_settings",
                        direction: "right",
                    });
                    break;
                case "gpay_pin":
                case "google_pay_error":
                    this.setState({
                        creationState: "google_pay",
                        direction: "right",
                    });
                    break;
                case "address":
                    this.setState({
                        creationState: "new_copy",
                        direction: "right"
                    })
                    break;
                case "new_copy":
                    this.setState({
                        creationState: "confirm_copy",
                        direction: "right"
                    })
                    break;
                case "credit_card_settings":
                case "more_options":
                    this.setState({
                        creationState: "card",
                        direction: "right",
                        appBar: localeObj.physical_card
                    })
                    break;
                case "migrate_success":
                    this.onSuccess();
                    break;
                default:
                    this.onHandleGoToHome();
                    break;
            }
        }
    }

    getDeliveryAddress = () => {
        this.showProgressDialog();
        arbiApiService.getAllClientData(this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
                let data = processedResponse ? processedResponse.data : {};
                this.setState({
                    creationState: "address",
                    direction: "left",
                    address: GeneralUtilities.formatMailingAddress(data) !== "NO ADDRESS" ? data.enderecoCorrespondencia : data.endereco,
                })
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.failed_address;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error",
                    direction: "left"
                })
            }
        });
    }

    moveToSecondCopy = (field) => {
        let reason;
        switch (this.state.creationState) {
            case "google_pay":
            case "confirm_copy":
                this.setState({
                    creationState: "new_copy",
                    direction: "left"
                })
                break;
            case "new_copy":

                switch (field) {
                    case 0:
                        reason = 3;
                        break;
                    case 1:
                        reason = 2;
                        break;
                    case 2:
                        reason = 1;
                        break;
                    default:
                        break;
                }
                this.setState({
                    reason: reason
                })
                return this.getDeliveryAddress();
            default:
                break;
        }
    }



    gpayAction = () => {
        //Log.sDebug("gpayAction");
        let eventName = "";
        if (this.state.gpayBtnText === localeObj.remove_btn) {
            eventName = constantObjects.removeCardFromGooglePay;
            this.removeCardFromGPayDialog()
        }
        else {
            eventName = constantObjects.addCardToGooglePay;
            if (this.walletId === "") {
                androidApiCallsService.createWallet();

            } else if (this.isGPayInstalled()) {
                this.setState({
                    creationState: "gpay_pin",
                });

            } else {
                this.installGPayDialog();
            }
        }
        this.sendEventMetrics(eventName, PageNameJSON["google_pay"]);
    }

    isGPayInstalled = () => {
        return androidApiCallsService.isPackageAvailable("com.google.android.apps.walletnfcrel");
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
        androidApiCallsService.getActiveWalletId();
        androidApiCallsService.getStableHardwareId();
        androidApiCallsService.listTokens(false);
        this.showProgressDialog();
    }

    handleIsTokenizedResponse() {
        this.hideProgressDialog();
        if (this.cardAddedToGPay) {
            this.setState({
                creationState: "google_pay",
                gpayDescription1: localeObj.gpay_desc1,
                gpayDescription2: localeObj.gpay_desc2,
                gpayDescription3: localeObj.gpay_desc3,
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
                creationState: "google_pay",
                gpayDescription1: localeObj.gpay_desc1,
                gpayDescription2: localeObj.gpay_desc2,
                gpayDescription3: localeObj.gpay_desc3,
                gpayDescription4: localeObj.gpay_desc4,
                gpayBtnText: localeObj.add_to_gpay_btn,
                isCardAddedToGpay: false,
                direction: "left",
                appBar: localeObj.google_pay
            });
        }
    }

    showGPayErrorScreen = () => {
        this.setState({
            creationState: "google_pay_error",
            gpayErrorHeader: localeObj.gpay_error_header,
            gpayErrorBody: localeObj.gpay_error_body,
            gpayErrorBtn: localeObj.gpay_error_primary_btn,
            gpayErrorBtn2: localeObj.gpay_error_secondary_btn
        });
    }

    gpayErrorAction = () => {
        //Log.sDebug("gpayErrorAction", PageNameJSON[this.state.creationState], constantObjects.LOG_PROD);
        this.sendEventMetrics(constantObjects.backToGPay, PageNameJSON["google_pay_error"]);
        this.onBack();
    }

    removeCardFromGPayDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.remove_btn,
            header: localeObj.remove_card_from_gpay,
        })
    }

    installGPayDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.install_btn,
            header: localeObj.install_gpay_header,
            description: localeObj.install_gpay_desc,
        })
    }

    setGPayAsDefaulTAPDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.set_gpay_default_tap_btnText,
            header: localeObj.set_gpay_default_tap_header,
            description: localeObj.set_gpay_default_tap_desc,
        })
    }

    setCardAsDefaulDialog = () => {
        this.sendEventMetrics(constantObjects.setCardAsDefaultCardInGPay, PageNameJSON["google_pay"]);
        this.setState({
            open: true,
            btnText: localeObj.set_gpay_default_tap_btnText,
            header: localeObj.set_card_default_header,
            description: localeObj.set_card_default_desc,
        })
    }

    removeCardFromGPay = () => {
        //Log.sDebug("removeCardFromGPay");
        this.sendEventMetrics(constantObjects.removeCardFromGooglePay, PageNameJSON["google_pay_bottom_dialog"]);
        if (this.state.details.brand === "ELO")
            androidApiCallsService.removeCardFromGPay(this.tokenID, constantObjects.TSP_ELO);
        else
            androidApiCallsService.removeCardFromGPay(this.tokenID, constantObjects.TSP_VISA);
    }

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }

    installGPay = () => {
        //Log.sDebug("installGPay");
        this.sendEventMetrics(constantObjects.installGPay, PageNameJSON["google_pay_bottom_dialog"]);
        androidApiCallsService.installGPay();
    }

    setGPayAsDefaulTAP = () => {
        //Log.sDebug("setGPayAsDefaulTAP");
        androidApiCallsService.setGPayAsDefaultTAPApplication();
    }

    setCardAsDefaultInGPay = () => {
        //Log.sDebug("setCardAsDefaultInGPay");
        this.sendEventMetrics(constantObjects.setCardAsDefaultCardInGPay, PageNameJSON["google_pay_bottom_dialog"]);
        if (this.state.details.brand === "ELO")
            androidApiCallsService.setCardAsDefaultInGPay(this.tokenID, constantObjects.TSP_ELO);
        else
            androidApiCallsService.setCardAsDefaultInGPay(this.tokenID, constantObjects.TSP_VISA);
    }

    getSecondCopyTariff = () => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["amount"] = 0;
        jsonObject["code"] = 1020; //Second card request tariff
        arbiApiService.getTariff(jsonObject, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse.success) {
                    this.setState({
                        tariff: processorResponse.tariff ? processorResponse.tariff : 0,
                        charge: processorResponse.tariff ? GeneralUtilities.formattedString(localeObj.charge_for_additional_copy, [processorResponse.tariff]) : "",
                        creationState: "confirm_copy",
                        direction: "left",
                        appBar: localeObj.request_copy
                    });
                } else {
                    let jsonObj = {};
                    jsonObj["header"] = localeObj.tariff_failed;
                    jsonObj["description"] = response.result.message;
                    this.setState({
                        errorJson: jsonObj,
                        creationState: "error",
                        direction: "left"
                    });
                }
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.failed;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error",
                    direction: "left"
                });
            }
        });
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
        if(this.state.listCards) {
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
        payloadData["isGpayDefaultNFC"] = androidApiCallsService.isGPayDefaultTAPApplication();
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

    getOPC = (field) => {
        this.onBack();
        this.showProgressDialog();
        arbiApiService.getOPC({ "cardKey": this.state.details.cardKey, "pin": field }, this.walletId, this.deviceId, this.componentName)
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
                        //Log.sDebug("OPC fail", PageNameJSON[this.state.creationState], constantObjects.LOG_PROD);
                        this.hideProgressDialog();
                        this.showGPayErrorScreen();
                    }
                } else {
                    //Log.sDebug("Failure in getting OPC", PageNameJSON[this.state.creationState], constantObjects.LOG_PROD);
                    this.hideProgressDialog();
                    this.showGPayErrorScreen();
                }
            })
    }

    requestMigration = () => {
        this.showProgressDialog();
        arbiApiService.migrateCard(this.props.location.cardKey, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processMigrateCardResponse(response.result);
                if (processorResponse.success) {
                    this.setState({
                        creationState: "migrate_success"
                    })
                } else {
                    this.openSnackBar(processorResponse.message);
                    return;
                }
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.card_failed;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error",
                    direction: "left"
                })
            }
        });
    }

    onSuccess = () => {
        MetricsService.onPageTransitionStop(PageNameJSON.success, PageState.close);
        let event = {
            eventType: constantObjects.migrationSuccess,
            page_name: PageNameJSON.success,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        this.props.history.replace("/digitalCard");
    }

    help = () => {
        GeneralUtilities.openHelpSection();
    }

    goToProfile = () => {
        this.props.history.replace("/myAccount", { "dataUpdated": true });
    }

    openChangeInvoiceDueDate = () => {
        this.setState({
            creationState: "credit_card_settings_due_date",
            direction: "left",
            appBar: localeObj.invoice_due_date
        });
    }

    setBillingDate = (modifiedDate) => {
        this.setState({
            invoiceDueDate: modifiedDate
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

    changeAddress = () => {
        this.setState({ bottomSheetOpen: true })
    }

    cancel = () => {
        this.setState({ bottomSheetOpen: false })
    }

    render() {
        this.menuOptions = [];
        const status = this.state.details.status;
        if (status === this.unblocked) {
            if (androidApiCallsService.isFeatureEnabledInApk("VISA_GPAY"))
                this.menuOptions.push(localeObj.google_pay);
            this.menuOptions.push(localeObj.card_block);
            if (!this.state.enableCreditCard)
                this.menuOptions.push(localeObj.cancel_card);
        } else if (status === this.blockedTemp || status === this.blockedByIncorrectPin) {
            this.menuOptions.push(localeObj.unblock_card);
            if (!this.state.enableCreditCard)
                this.menuOptions.push(localeObj.cancel_card);
        }
        if (this.state.enableCreditCard) {
            this.menuOptions.push(localeObj.credit_card_settings);
            this.menuOptions.push(localeObj.more_card_options);
        } else {
            this.menuOptions.push(localeObj.request_copy);
        }
        const { classes } = this.props;
        const currentState = this.state.creationState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const depositContents = [
            {
                heading: localeObj.update_address,
                text: localeObj.update_address_desc,
                icon: <img src={OneIcon} style={this.styles.imgStyle} alt="" />
            },
            {
                heading: localeObj.request_card_profile,
                text: localeObj.request_card_desc,
                icon: <img src={TwoIcon} style={this.styles.iconStyle} alt="" />
            }
        ];
        return (
            <div>
                {currentState !== "error" && currentState !== "success" && currentState !== "migrate_success" && currentState !== "credit_card_settings" && currentState !== "more_options" &&
                    <div>
                        <ButtonAppBar header={this.state.appBar} onBack={this.onBack} action="none" />
                    </div>
                }
                <div style={{ display: (currentState === "card" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "card" && this.state.menuOptionsVisibility && <CardExistComponent details={this.state.details} menuOptions={this.menuOptions} action={this.action}
                        componentName={PageNameJSON["card"]} selection={this.state.selection} multipleSelection={this.multipleSelection} />}
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "cancel" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "cancel" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "cancel" && <SelectMenuOption type="Card" header={localeObj.card_list} recieveField={this.onBlockCard}
                            footNote={localeObj.irreversible} btnText={localeObj.confirm} componentName={PageNameJSON["cancel"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "confirm_copy" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "confirm_copy" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "confirm_copy" && <ImageInformationComponent header={localeObj.request_copy + "?"} onCancel={this.onBack} icon={card}
                            appBar={false} card={true} charge={this.state.charge} btnText={localeObj.confirm} next={this.moveToSecondCopy} type={PageNameJSON["confirm_copy"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "google_pay" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "google_pay" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "google_pay" && <GooglePayComponent virtualCard={localeObj.physical_card} onCancel={this.onBack} gpayIcon={gpayCard} details={this.state.details} gpayDesc={this.state.gpayDescription1} gpayEntryPoint={this.state.gpayEntryPoint} isGpayErrorScreen={false}
                            appBar={false} card={true} gpayBtn={true} gpayDesc2={this.state.gpayDescription2} gpayDesc3={this.state.gpayDescription3} gpayDesc4={this.state.gpayDescription4} googleIcon={googleIcon} addToGpayIcon={addToGpayIcon} setAsDefaultIcon={setAsDefaultIcon} gpayBtnText={this.state.gpayBtnText} setAsDefaultBtnTxt={this.state.setAsDefaultBtnTxt} addedToGpay={this.state.addedToGpay}
                            handleGPayResponse={this.handleGPayResponse} cardKey={this.state.details.cardKey} cardType={this.state.details.cardType} gPayDataChangedListener={this.gPayDataChangedListener} isCardAddedToGpay={this.state.isCardAddedToGpay} isCardDefaultCardInGPay={this.state.isCardDefaultCardInGPay} next={this.gpayAction} onAction={this.setCardAsDefaulDialog} type={PageNameJSON["google_pay"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "google_pay_error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "google_pay_error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "google_pay_error" && <GooglePayComponent header={this.state.gpayErrorHeader} icon={alertIcon} appBar={false} onCancel={this.onBack} type={PageNameJSON["google_pay_error"]} gpayEntryPoint={this.state.gpayEntryPoint} isGpayErrorScreen={true}
                            description={this.state.gpayErrorBody} btnText={this.state.gpayErrorBtn} action={this.state.gpayErrorBtn2} next={this.gpayErrorAction} onAction={this.showBottomSheet}
                            bottomSheet={this.state.bottomSheetEnabled} handleBottomSheet={this.handleBottomSheet} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "more_options" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "more_options" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "more_options" &&
                            <MoreOptionsComponent
                                history={this.props.history}
                                moreOptionsRequestSecondCopy={this.moreOptionsRequestSecondCopy}
                                contactlessPayments={this.state.creditCardContactlessPayment}
                                cardNumber={this.state.details.cardKey}
                                onBackHome={this.onBack}
                                moreOptionsCancelCard={this.moreOptionsCancelCard} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_card_settings" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_card_settings" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_card_settings" && <div>
                            <CreditCardSettingsComponent
                                automaticDebit={this.state.automaticDebit}
                                onBackHome={this.onBack}
                                updateCreditCardAutomaticDebitStatus={this.updateCreditCardAutomaticDebitStatus}
                                openMyCards={this.openMyCardsPage}
                                invoiceDueDate={this.state.invoiceDueDate}
                                openChangeInvoiceDueDate={this.openChangeInvoiceDueDate}
                                componentName={PageNameJSON['credit_card_settings']} goToChatbot={this.goToChatbot} fromPhysicalCard={true} />
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
                    in={currentState === "new_copy" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "new_copy" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "new_copy" && <SelectMenuOption type="Card" header={localeObj.new_copy_list} recieveField={this.moveToSecondCopy}
                            btnText={localeObj.confirm} componentName={PageNameJSON["new_copy"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "address" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "address" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "address" &&
                            <DigitalCardArrival icon={newCard} next={this.onRequestNewCard} type="request" componentName={PageNameJSON["address"]}
                                secondary={this.changeAddress} address={this.state.address} />
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "new_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "new_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "new_pin" && <InputPinPage confirm={this.onUnblockIncorrectPin} header={localeObj.physical_pin_header} componentName={PageNameJSON["new_pin"]} />}
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
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onHandleGoToHome} componentName={PageNameJSON["error"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "request_not_allowed" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "request_not_allowed" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "request_not_allowed" && <RequestNotAllowedComponent onClick={this.requestMigration} componentName={PageNameJSON["request_not_allowed"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} classNames="pageSliderLeft"
                    in={currentState === "migrate_success" && !this.state.processing ? true : false} timeout={300}>
                    <div style={{ display: (currentState === "migrate_success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "migrate_success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight, overflowY: "hidden" }}>
                                <ImageInformationComponent type={PageNameJSON["success"]} header={localeObj.card_issued} icon={success} appBar={true} onCancel={this.onSuccess} btnText={localeObj.ok_i_got}
                                    description={localeObj.card_issued_desc1} subText={localeObj.card_issued_desc2} tip={localeObj.card_issued_desc3} next={this.onSuccess} noAction={true} />
                            </div>
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={this.state.title} onCancel={this.onBack} icon={success} type={PageNameJSON["success"]}
                                    appBar={true} description={this.state.description} btnText={false} subText={this.state.subText} />
                            </div>
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "card_exists" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "card_exists" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "card_exists" && <DigitalCardArrival icon={card} next={this.onBack} type="card_exists" onHelp={this.help}
                            componentName={PageNameJSON["card_exists"]} />}
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
                                    {this.state.header}
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
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.change_address}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                    {localeObj.change_address_desc}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <MuiThemeProvider theme={InputThemes.SalaryWithDrawTheme}>
                                <Grid container spacing={0}>
                                    {
                                        depositContents.map((keys, index) => (
                                            <div key={index} style={{ ...this.styles.cardStyle, textAlign: "center" }}>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <div style={this.styles.circle}>{keys.icon}</div>
                                                    </ListItemIcon>
                                                    <ListItemText>
                                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
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
                        <div style={{ width: "100%", margin: "1.5rem 0", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.go_to_my_profile} onCheck={this.goToProfile} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.cancel} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

PhysicalCardComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(PhysicalCardComponent);