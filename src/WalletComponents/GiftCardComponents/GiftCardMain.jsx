import React from 'react';
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import { MuiThemeProvider } from '@material-ui/core/styles';
import localeService from "../../Services/localeListService";
import MetricServices from "../../Services/MetricsService";
import { v4 as uuidv4 } from 'uuid';
import InputThemes from '../../Themes/inputThemes';
import { withStyles} from '@material-ui/core/styles';
import PropTypes from "prop-types";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from '../../Services/Constants';
import GiftCardFormComp from './GiftCardFormComp';
import ButtonAppBar from '../CommonUxComponents/ButtonAppBarComponent';
import GiftCardCreation from './GiftCardCreation';
import { CSSTransition } from 'react-transition-group';
import Log from '../../Services/Log';
import ArbiApiService from '../../Services/ArbiApiService';
import androidApiCallsService from '../../Services/androidApiCallsService';
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import GiftCardGooglePayComp from './GiftCardGooglePayComp';
import visaGpayCard from "../../images/SpotIllustrations/VisaVirtualCard.webp"
import googleIcon from '../../images/SpotIllustrations/gpay_txt.png';
import addToGpayIcon from '../../images/SpotIllustrations/add_to_gpay_btn.png';
import Drawer from '@material-ui/core/Drawer';
import GeneralUtilities from '../../Services/GeneralUtilities';
import PrimaryButtonComponent from '../CommonUxComponents/PrimaryButtonComponent';
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';
import FlexView from 'react-flexview';
import ArbiApiMetrics from '../../Services/ArbiApiMetrics';
import GiftCardPrivacyComp from './GiftCardPrivacyComp';
import moment from 'moment';
import GiftCardLoader from './GiftCardLoader';
import GiftCardErrorComp from './GiftCardErrorComp';
import ImageInformationComponent from '../CommonUxComponents/ImageInformationComponent';
import add_card_to_gpay from "../../images/SpotIllustrations/add_card_to_gpay.png"
import apiService from '../../Services/apiService';
import PageNames from '../../Services/PageNames';
import error from "../../images/SpotIllustrations/Alert.png";

const theme2 = InputThemes.snackBarThemeForMyCards;
const styles = InputThemes.singleInputStyle;
const TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION = 3;
const GET_GIFT_CARD_STATUS_IN_GPAY = "GET_GIFT_CARD_STATUS_IN_GPAY";
const GET_CARD_ADDED_STATUS_GPAY = "GET_CARD_ADDED_STATUS_GPAY";
const GIFT_CARD_ELIGIBILITY_STATUS_EMPTY = "GIFT_CARD_ELIGIBILITY_STATUS_EMPTY";

var localeObj = {};
const PageNameJSON = PageNames.GiftCardComponents;

class GiftCardMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showProgressDialog: true,
            timer: 60,
            snackBarOpen: false,
            processing: false,
            gcClientKey: "",
            gcAccountKey: "",
            gcCardKey: "",
            name: "",
            number: "",
            ddd: "",
            cpf: "",
            amount: 15,
            phoneNumber: "",
            gpayBtnText: "",
            setAsDefaultBtnTxt: "",
            opc: "",
            walletId: "",
            deviceId: "",
            userDetails: "",
            istokenStatePendingVerification: false,
            isCardDefaultCardInGPay: false,
            cardAddedToGPay: false,
            customerCareBottomSheet: false,
            retryVerification: false,
            showNewJourney: false,
            showPhase3: false,
            fetchedNewJourneyStatus: false,
            fetchedPhase3Status: false,
            suceesScreen: false
        };
        this.style = {

        }
        this.verifyGiftCardStatus = this.verifyGiftCardStatus.bind(this);
        // this.getGiftCardNewJourneyStatus = this.getGiftCardNewJourneyStatus.bind(this);
        // this.getGiftCardPhase3Status = this.getGiftCardPhase3Status.bind(this);
    }

    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.getGiftCardAccessToken();
        // if(!this.state.fetchedNewJourneyStatus)
        //     this.getGiftCardNewJourneyStatus();
        // if(!this.state.fetchedPhase3Status) 
        //     this.getGiftCardPhase3Status();
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCallsService.getActiveWalletId();
        androidApiCallsService.getStableHardwareId();
        window.getActiveWalletId = (response) => {
            //Log.sDebug("getActiveWalletId response" + response);
            this.setState({
                walletId: response
            });
        }
        window.getStableHardwareId = (response) => {
            // Log.sDebug("getStableHardwareId response" + response);
            this.setState({
                deviceId: response
            });
        }
        window.onBackPressed = () => {
            this.onBack();
        }

        window.gPayDataChangedListener = () => {
            Log.sDebug("gPayDataChangedListener");
            if (this.state.currentState === "google_pay") {
                this.showGPayScreen();
            }
        }

        window.isReadyToPay = (response) => {
            Log.sDebug("isReadyToPay:" + response);
            Log.sDebug("isReadyToPay: this.state.showphase3" + this.state.showPhase3);
            let isEligibleResp = this.getEligibleForGiftCardPromotion();
            let isEligible;
            let isEligibleMetrics;
            isEligibleResp.then(result => {
                isEligible = result;
                Log.sDebug("getEligibleForGiftCardPromotion: isEligible:" + isEligible);
                if(response) {
                    if (GeneralUtilities.emptyValueCheck(isEligible)) {
                        this.sendIsEligibleEmptyMetrics();
                        this.setEligibleForGiftCardPromotion(false);
                        isEligible = false;
                    }
                    isEligibleMetrics = isEligible;
                    if (!this.state.showPhase3) // Disable gift card phase3 if backend sends false
                        isEligible = true;

                    Log.sDebug("isReadyToPay: true, isEligible:  " + isEligible);
                    if (!isEligible) {
                        this.showInEligibleScreen();
                    } else {
                        let clientId = uuidv4();
                        this.setStatus(clientId);
                        this.setState({
                            currentState: "create_card",
                            processing: false,
                            gcClientKey: clientId
                        });
                        this.createGiftCard(this.state.json, this.state.address, clientId);
                    }
                    this.sendIsGpayAppReadyToPayMetrics(true, isEligibleMetrics);
                } else {
                    if (GeneralUtilities.emptyValueCheck(isEligible)) {
                        this.sendIsEligibleEmptyMetrics();
                        this.setEligibleForGiftCardPromotion(true);
                        isEligible = true;
                    }
                    isEligibleMetrics = isEligible;
                    if (!this.state.showPhase3) // Disable gift card phase3 if backend sends false
                        isEligible = true;

                    Log.sDebug("isReadyToPay: false, isEligible:  " + isEligible);
                    if (!isEligible) {
                        this.showInEligibleScreen();
                    } else {
                        this.setState({
                            currentState: "add_card_to_gpay",
                            processing: false
                        })
                    }
                    this.sendIsGpayAppReadyToPayMetrics(false, isEligibleMetrics);
                }
            }).catch(err => {
                Log.sDebug("getEligibleForGiftCardPromotion: err: " + err);
                this.showErrorScreen();
            });
        }

        window.isTokenized = (response, isCardDefault, tokenStateInt, tokenID) => {
            this.isCardTokenized(response, isCardDefault, tokenStateInt, tokenID);
        }

        window.lisTokens = (response) => {
            Log.sDebug("listTokens response: " + response);
            let resArray = response.split("/");
            let tokenArray = [];
            let token = "";
            let tokenAvailable = false;
            for (let i in resArray) {
                token = resArray[i];
                tokenArray = token.split(":");
                if (tokenArray[2] === this.state.number.substring(12, 16)) {
                    tokenAvailable = true;
                    androidApiCallsService.isTokenized(constantObjects.TSP_VISA, tokenArray[0]);
                }
                tokenArray = [];
                token = "";
            }
            if (!tokenAvailable) {
                this.isCardTokenized(false, false, -1, "");
            }
        }
    }

    // async getGiftCardNewJourneyStatus () {
    //     apiService.getGiftCardNewJourneyStatus()
    //         .then(response => {
    //             Log.sDebug("getGiftCardNewJourneyStatus, response: " + JSON.stringify(response), "GiftCardMain", constantObjects.LOG_PROD);
    //             let responseObj = response?.data;
    //             this.setState({
    //                 fetchedNewJourneyStatus: true
    //             });
    //             if (response && response.status === 200) {
    //                 if (responseObj) {
    //                     this.setState({
    //                         showNewJourney: true,
    //                     })
    //                 }
    //             }
    //         }).catch(err => {
    //             Log.sDebug("getGiftCardNewJourneyStatus, error: " + err, "GiftCardMain", constantObjects.LOG_PROD);
    //         });
    // }

    // async getGiftCardPhase3Status () {
    //     apiService.getGiftCardPhase3Status()
    //         .then(response => {
    //             Log.sDebug("getGiftCardPhase3Status, response: " + JSON.stringify(response), "GiftCardMain", constantObjects.LOG_PROD);
    //             this.setState({
    //                 fetchedPhase3Status: true
    //             });
    //             let responseObj = response?.data;
    //             if (response && response.status === 200 && responseObj) {
    //                 this.setState({
    //                     showPhase3: true
    //                 }) 
    //             } 
    //         }).catch(() => {
    //             return;
    //         });
    // }


    getEligibleForGiftCardPromotion = () => {
        if(!androidApiCallsService.isDeviceRooted()){
            return new Promise((resolve) => {
                apiService.getEligibleForGiftCardPromotion(androidApiCallsService.getBarcode())
                .then(response => {
                    Log.sDebug("getEligibleForGiftCardPromotion, response: " + JSON.stringify(response));
                    if (response && response.status === 200) {
                        resolve(response.data);
                    } else {
                        resolve("");
                    } 
                }).catch(() => {
                    resolve("");
                });
            })
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    setEligibleForGiftCardPromotion = (isEligible) => {
        apiService.setEligibleForGiftCardPromotion(androidApiCallsService.getBarcode(), isEligible)
            .then(response => {
                Log.sDebug("setEligibleForGiftCardPromotion, response: " + JSON.stringify(response), "GiftCardMain", constantObjects.LOG_PROD);
            }).catch(() => {
                return;
            });
    }

    async setStatus (clientKey) {
        if(GeneralUtilities.emptyValueCheck(androidApiCallsService.getBarcode()) ||
        GeneralUtilities.emptyValueCheck(androidApiCallsService.getDeviceId()) ||
        GeneralUtilities.emptyValueCheck(androidApiCallsService.getImei())) {
            this.showErrorScreen();
            return;
        } else  {
            apiService.setStatus(androidApiCallsService.getBarcode(), clientKey, androidApiCallsService.getDeviceId(), this.state.cpf, androidApiCallsService.getImei())
            .then(response => {
                Log.sDebug("setStatus, response: " + JSON.stringify(response), "GiftCardMain", constantObjects.LOG_PROD);
            }).catch(() => {
                return;
            });
        }
    }

    sendIsEligibleEmptyMetrics = () => {
        let data = {};
        data["isEmpty"] = true;
        ArbiApiMetrics.sendGiftCardAlertMetrics(GIFT_CARD_ELIGIBILITY_STATUS_EMPTY, "isEligibleEmpty", true, 201, data, 0);
    }


    showInEligibleScreen = () => {
        androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
        this.setState({
            currentState: "not_eligible_gift_card",
            processing: false
        })  
    }

    isGpayAppReadyToPay = () => {
        this.showProgressDialog();
        androidApiCallsService.isGpayAppReadyToPay();
    }

    onBack = () => {
        if (this.state.customerCareBottomSheet) {
            this.setCustomerCareBottomSheet(false);
            return
        }
        if (this.state.processing || this.state.currentState === "loadingCard" ) {
            this.setState({
                snackBarOpen: true,
                snackBarMessage: localeObj.no_action
            })
        } else if (this.state.currentState === "add_card_to_gpay") {
            this.setState({
                snackBarOpen: true,
                snackBarMessage: localeObj.gift_card_nj_no_action
            })

        } else if (this.state.currentState === "privacy_policy") {
            this.setState({
                currentState: "gift_card_form"
            });
        } else {
            this.goToMotoPayLandingPage();
        }
    }
    closeSnackBar = () => {
        this.setState({
            snackBarOpen: false
        });
    }

    goToMotoPayLandingPage = () => {
        this.props.history.replace({ pathname: "/", state: { from: "Gift Card" }, transition: "right" });
    }

    mayBeLater = () => {
        this.props.history.replace({ pathname: "/", state: { from: "Gift Card", hideGiftCardBS: true }, transition: "right" });
    }

    fetchUserDetails = () => {
        this.showProgressDialog();
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.getAllClientDataGiftCard(this.state.gcClientKey, PageNameJSON['google_pay']).then(response => {
                if (response.success) {
                    Log.sDebug("User Details Fetched", "MyAccountPage");
                    let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "profile");
                    if (processorResponse.success) {
                        Log.sDebug("User Details Fetched: ");
                        let profileData = this.getProfileDetailsOfUser(processorResponse.data)
                        this.setState({
                            userDetails: profileData
                        });
                        this.getOPCGiftCard(profileData);
                    } else {
                        Log.sDebug("fetchUserDetails, Error getting user details");
                        this.showErrorScreen();
                    }
                } else {
                    Log.sDebug("fetchUserDetails: respone.success: false");
                    this.showErrorScreen();
                }
            })
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }
    getProfileDetailsOfUser = (data) => {
        let clientData = data.endereco;
        let number = this.areAllArgsValid(clientData.complemento) || this.areAllArgsValid(clientData.bairro) ? clientData.numero + "- " : "";
        let complement = this.areAllArgsValid(clientData.complemento) && this.areAllArgsValid(clientData.bairro) ? clientData.complemento + ", " : "";
        Log.sDebug("getProfileDetailsOfUser: " + JSON.stringify(data));
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


    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "visible") {
            if(this.state.currentState === "add_card_to_gpay")
                this.isGpayAppReadyToPay();
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    receiveDetails = (json, address) => {
        Log.sDebug("receiveDetails: " + JSON.stringify(json));
        window.onBackPressed = () => {
            this.onBack();
        }
        Log.sDebug("showNewJourney: " + this.state.showNewJourney, "GiftCardMain", constantObjects.LOG_PROD);
        if (this.state.showNewJourney) {
            this.setState({
                ddd: json.ddd,
                phoneNumber: json.mobNum,
                address: address,
                cpf: json.cpf,
                json: json
            }, () => {
                this.isGpayAppReadyToPay();
            });
        } else {
            let clientId = uuidv4();
            this.setState({
                currentState: "create_card",
                ddd: json.ddd,
                phoneNumber: json.mobNum,
                address: address,
                cpf: json.cpf,
                gcClientKey: clientId
            });
            this.setStatus(clientId);
            this.createGiftCard(json, address, clientId);
        }
    }

    createGiftCard = (json, address, clientId) => {
        if(!androidApiCallsService.isDeviceRooted()){
            let addressObj = {
                "Rua": address.street,
                "Numero": address.number,
                "Complemento": address.complement,
                "Bairro": address.neighbourhood,
                "Cep": address.cep,
                "Cidade": address.city,
                "Uf": address.uf
            };
            ArbiApiService.createGiftCard(json, addressObj, clientId, PageNameJSON.create_card).then(response => {
                Log.sDebug("createGiftCard: response: " + JSON.stringify(response));
                if (response.success) {
                    // this.sendGiftCardMetrics("gc-clientes/gc-cartao-presente/cadastrar", "CREATE GIFT CARD ACCOUNT", true, response.status, json, clientId, {});
                } else {
                    this.registerOnBackPressed("notification")
                    if (response.status === 400 && response.result?.code === 0) {
                        let jsonObj = {}
                        jsonObj["header"] = localeObj.gift_card_error_head;
                        jsonObj["validationErrors"] = response.result?.validationErrors;
                        jsonObj["btnText"] = localeObj.gift_card_try_again
                        this.setState({
                            currentState: "error",
                            direction: "left",
                            creditErrorJson: jsonObj,
                            processing: false
                        });
                    }
                    // this.sendGiftCardMetrics("gc-clientes/gc-cartao-presente/cadastrar", "CREATE GIFT CARD ACCOUNT", false, response.status, json, clientId, response.result);
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    sendGiftCardMetrics = (uri, apiName, success, status, jsonObject, clientId, result) => {
        let data = {};
        data["gc_chaveDeCliente"] = clientId
        data["identificacaoFiscal"] = jsonObject.cpf;
        data["nome"] = jsonObject.name;
        data["nomeMae"] = jsonObject.motherName;
        data["ddd"] = "0" + jsonObject.ddd;
        data["numero"] = jsonObject.mobNum;
        data["dataNascimento"] = jsonObject.dob;
        data["unidadeOrganizacionalId"] = 20192;
        data["email"] = jsonObject.email;
        if (!success) {
            data["result"] = result;
        }
        ArbiApiMetrics.sendGiftCardAlertMetrics(uri, apiName, success, status, data, 0);
    }

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }

    hideProgressDialog = () => {
        Log.sDebug("hideProgressDialog");
        this.setState({
            processing: false
        });
    }

    getGiftCardAccessToken = () => {
        this.showProgressDialog();
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.getGiftCardAccessToken().then(response => {
                Log.sDebug("getGiftCardAccessToken:" + JSON.stringify(response));
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processGiftCardAccessTokenResponse(response.result);
                    if (processedResponse.success) {
                        Log.sDebug("getGiftCardAccessToken, processedResponse:" + JSON.stringify(processedResponse));
                        this.verifyGiftCardStatus("dimo", true);
                    } else {
                        Log.sDebug("unexpected error in getting the token");
                        this.showErrorScreen();
                    }
                } else {
                    Log.verbose("error in getting the token");
                    this.showErrorScreen();
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    registerOnBackPressed = (from) => {
        if(from === "notification") {
            window.onBackPressed = null;
            window.onBackPressed = () => {
                this.onBack();
            }
        }
    }

    async verifyGiftCardStatus(from, afterTimerExpiry = false) {
        if(!androidApiCallsService.isDeviceRooted()){
        if (afterTimerExpiry)
            this.showProgressDialog();
        let gcClientKey;
        //let gcClientKey = androidApiCallsService.getFromPrefs("giftCardClientId");
       if ( from === "notification") {
            gcClientKey = this.state.gcClientKey;
       } else {
            gcClientKey = "";
            if(GeneralUtilities.emptyValueCheck(androidApiCallsService.getBarcode()) ||
            GeneralUtilities.emptyValueCheck(androidApiCallsService.getDeviceId()) ||
            GeneralUtilities.emptyValueCheck(androidApiCallsService.getImei())) {
                this.showErrorScreen();
                return;
            } else {
                const cpf = GeneralUtilities.emptyValueCheck(this.state.cpf) ? "" : this.state.cpf;
                const gcClientKeyResp = await apiService.getStatusV2(androidApiCallsService.getBarcode(), androidApiCallsService.getDeviceId(), cpf, androidApiCallsService.getImei());
                    if (gcClientKeyResp && gcClientKeyResp.data && gcClientKeyResp.data.success && gcClientKeyResp.data.data) {
                        Log.sDebug("gcClientKeyResp", JSON.stringify(gcClientKeyResp))
                        if(gcClientKeyResp.data.data.isEligible) {
                            Log.sDebug("getStatus: " + JSON.stringify(gcClientKeyResp.data.data.gcClientKey));
                            gcClientKey = gcClientKeyResp.data.data.gcClientKey;
                            this.setState({ gcClientKey : gcClientKey })
                            if(gcClientKeyResp.data.data.journey >= 2)
                                this.setState({ showNewJourney: true })
                            if(gcClientKeyResp.data.data.journey === 3)
                                this.setState({ showPhase3: true })
                            if(!GeneralUtilities.emptyValueCheck(gcClientKeyResp.data.data.amount)) {
                                this.setState({ amount: gcClientKeyResp.data.data.amount })
                            }
                        } else {
                            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
                            this.showErrorScreen();
                            return;
                        }
                    } else {
                        this.showErrorScreen();
                        return;
                    }
            }
       }

        Log.sDebug("gcClientKey: " + gcClientKey);
        if (GeneralUtilities.emptyValueCheck(gcClientKey) && from === "dimo") {
            this.setState({
                currentState: "gift_card_form",
                processing: false
            });
            return;
        }

        let response = await ArbiApiService.verifyGiftCardStatus(gcClientKey, PageNameJSON.gift_card_form);
        Log.sDebug("verifyGiftCardStatus: response: " + JSON.stringify(response));
        if (response.success) {
            let processedResponse = ArbiResponseHandler.processverifyGiftCardStatus(response.result);
            if (processedResponse.success) {
                if (processedResponse.gcCreationStatus === 2) {
                    this.registerOnBackPressed(from);
                    this.setState({
                        currentState: "loadingCard",
                        processing: false
                    });
                    this.getGiftCardAccountKey();
                } else if (processedResponse.gcCreationStatus === 8 || processedResponse.gcCreationStatus === 5) {
                    this.registerOnBackPressed(from);
                    let jsonObj = {}
                    jsonObj["header"] = localeObj.gift_card_error_head;
                    jsonObj["description"] = localeObj.gift_card_error_desc1;
                    jsonObj["caption"] = localeObj.gift_card_error_desc2;
                    jsonObj["action"] = localeObj.gift_card_error_customer_care;
                    jsonObj["btnText"] = localeObj.gift_card_try_again;
                    this.setState({
                        currentState: "error",
                        direction: "left",
                        creditErrorJson: jsonObj,
                        processing: false
                    });
                } else if (afterTimerExpiry && (processedResponse.gcCreationStatus === 1 || processedResponse.gcCreationStatus === 7)) {
                    this.registerOnBackPressed(from);
                    let jsonObj = {}
                    jsonObj["header"] = localeObj.gift_card_error_head_retry;
                    jsonObj["description"] = localeObj.gift_card_error_desc11_retry;
                    jsonObj["caption"] = localeObj.gift_card_error_desc12_retry;
                    jsonObj["btnText"] = localeObj.gift_card_try_again;
                    jsonObj["secBtnText"] = localeObj.gift_card_error_secondary;
                    jsonObj["timer"] = true
                    jsonObj["gcCreationInProgress"] = "gcCreationInProgress";
                    this.setState({
                        currentState: "error",
                        direction: "left",
                        creditErrorJson: jsonObj,
                        processing: false,
                    });
                } else {
                    if (afterTimerExpiry) {
                        this.registerOnBackPressed(from);
                        this.showErrorScreen();
                    }
                }
            } else {
                if (afterTimerExpiry) {
                    this.registerOnBackPressed(from);
                    this.showErrorScreen();
                }
            }
        } else if (afterTimerExpiry) {
            this.registerOnBackPressed(from);
            let res = response.result;
            if (res?.code === 11016 && from === "dimo") {
                this.setState({
                    currentState: "gift_card_form",
                    processing: false
                });
            } else if (res?.code === 11016) {
                let jsonObj = {}
                jsonObj["header"] = localeObj.gift_card_error_head1;
                jsonObj["description"] = localeObj.gift_card_error_desc11;
                jsonObj["caption"] = localeObj.gift_card_error_desc12;
                jsonObj["btnText"] = localeObj.gift_card_try_again
                jsonObj["secBtnText"] = localeObj.gift_card_error_secondary
                this.setState({
                    currentState: "error",
                    direction: "left",
                    creditErrorJson: jsonObj,
                    processing: false
                });
            } else {
                this.showErrorScreen();
            }
        }
    } else {
        androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
        this.showErrorScreen();
    }
    }

    showErrorScreen = () => {
        let jsonObj = {}
        jsonObj["header"] = localeObj.gift_card_error_head1;
        jsonObj["description"] = localeObj.gift_card_error_desc11;
        this.setState({
            currentState: "error",
            direction: "left",
            creditErrorJson: jsonObj,
            processing: false
        });
    }

    checkIfAccountIsLoaded = (payloadData) => {
        const startDate = moment().subtract(90, 'days');
        const endDate = new Date();
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.getGiftCardTransactionHistory(startDate, endDate, "all", payloadData.gcAccountKey, PageNameJSON.google_pay).then(response => {
                Log.sDebug("getGiftCardTransactionHistory:" + JSON.stringify(response));
                if (response.success) {
                    Log.sDebug("getGiftCardTransactionHistory: response.success");
                    if (response.result.totalItems > 0) {
                        this.getGCCardKey(payloadData.gcAccountKey);
                    } else {
                        this.loadMoneyToGiftCard(payloadData)
                    }
                } else {
                    Log.verbose("getGiftCardTransactionHistory, failed ");
                    this.showErrorScreen();
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    loadMoneyToGiftCard = async (payloadData) => {
        Log.sDebug("loadMoneyToGiftCard");
        let gcClientKey = "";
        if(GeneralUtilities.emptyValueCheck(androidApiCallsService.getBarcode()) ||
        GeneralUtilities.emptyValueCheck(androidApiCallsService.getDeviceId()) ||
        GeneralUtilities.emptyValueCheck(androidApiCallsService.getImei())) {
            this.showErrorScreen();
            return;
        } else {
            const cpf = GeneralUtilities.emptyValueCheck(this.state.cpf) ? "" : this.state.cpf;
            const gcClientKeyResp = await apiService.getStatusV2(androidApiCallsService.getBarcode(), androidApiCallsService.getDeviceId(), cpf, androidApiCallsService.getImei());
                if(gcClientKeyResp && gcClientKeyResp.data && gcClientKeyResp.data.success && gcClientKeyResp.data.data){
                    Log.sDebug("getStatus: " + JSON.stringify(gcClientKeyResp.data.data.gcClientKey));
                    gcClientKey = gcClientKeyResp.data.data.gcClientKey;
                } else {
                    this.showErrorScreen();
                    return;
                }
        }
        if(!androidApiCallsService.isDeviceRooted() && gcClientKey){
            ArbiApiService.loadMoneyToGiftCard(payloadData.gcClientKey, payloadData.gcAccountKey, this.state.amount, PageNameJSON.google_pay).then(response => {
                Log.sDebug("loadMoneyToGiftCard:" + JSON.stringify(response));
                if (response.success) {
                    Log.sDebug("loadMoneyToGiftCard: response.success");
                    this.getGCCardKey(payloadData.gcAccountKey);
                } else {
                    Log.verbose("Loding money failed");
                    if (response.result?.code === 17000) {
                        let jsonObj = {}
                        jsonObj["header"] = localeObj.gift_card_run_out_head;
                        jsonObj["description"] = localeObj.gift_card_run_out_desc1;
                        jsonObj["caption"] = localeObj.gift_card_run_out_desc2;
                        jsonObj["btnText"] = localeObj.gift_card_run_out_primary
                        jsonObj["warning"] = true
                        this.setState({
                            currentState: "error",
                            direction: "left",
                            creditErrorJson: jsonObj,
                            processing: false
                        })
                    } else {
                        this.showErrorScreen();
                    }
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    getGCCardKey = (gcAccountKey) => {
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.getGCCardKey(gcAccountKey, PageNameJSON.google_pay).then(response => {
                Log.sDebug("getGCCardKey:" + JSON.stringify(response));
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processGetGCCardKey(response.result);
                    if (processedResponse.success) {
                        Log.sDebug("getGCCardKey, processedResponse:" + JSON.stringify(processedResponse));
                        if (!processedResponse.noCards) {
                            this.setState({
                                gcCardKey: processedResponse.gcCardKey,
                                name: processedResponse.name,
                                number: processedResponse.number,
                            }, () => {
                                this.showGPayScreen();
                            });
                        } else {
                            Log.sDebug("unexpected error no card");
                            this.requestNewVirtualCard(gcAccountKey);
                        }
                    } else {
                        Log.sDebug("unexpected error no card");
                        this.showErrorScreen();
                    }
                } else {
                    Log.verbose("getGCCardKey failed");
                    this.showErrorScreen();
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    requestNewVirtualCard = (gcAccountKey) => {
        ArbiApiService.requestGCVirtualCard("1234", gcAccountKey, PageNameJSON.create_card)
            .then(response => {
                this.hideProgressDialog();
                Log.sDebug("requestGCVirtualCard: " + JSON.stringify(response));
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processRequestVirtaulCardAPI(response.result);
                    if (processorResponse.success) {
                        let virtualCardDetails = [];
                        let jsonObject = {};
                        jsonObject["cardType"] = "virtual";
                        jsonObject["name"] = processorResponse.virtualCardDetails.nomeImpresso;
                        jsonObject["number"] = "**** **** **** " + processorResponse.virtualCardDetails.cartaoNumero.slice(-4);
                        jsonObject["expiry"] = processorResponse.virtualCardDetails.cartaoDataExpiracao.split("/").join("");
                        jsonObject["cardKey"] = processorResponse.virtualCardDetails.chaveDeCartao;
                        jsonObject["status"] = processorResponse.virtualCardDetails.descricaoStatusCartao;
                        jsonObject["brand"] = processorResponse.virtualCardDetails.bandeiraNome;
                        virtualCardDetails.push(jsonObject);
                    } else {
                        this.showErrorScreen();
                    }
                } else {
                    this.showErrorScreen();
                }
            })
    }


    giftCardForgotAccountPin = () => {
        this.showProgressDialog();
        ArbiApiService.giftCardForgotAccountPin(this.state.gcAccountKey, PageNameJSON.create_card).then(response => {
            Log.sDebug("giftCardForgotAccountPin:" + JSON.stringify(response));
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processforgotAccountPin2faResponse(response.result);
                if (processorResponse.success) {
                    //this.getOPC();
                } else {
                    Log.sDebug("Resend token failed", "ForgotPin");
                }
            } else {
                Log.verbose("giftCardForgotAccountPin: failed with error - ");
                this.showErrorScreen();
            }
        });
    }

    getOPCGiftCard = (userDetails) => {
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.getOPCGiftCard({ "cardKey": this.state.gcCardKey, "pin": "1234" }, this.state.walletId, this.state.deviceId)
            .then(response => {
                Log.sDebug("getOPC response: " + JSON.stringify(response));
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetOPCResponse(response.result);
                    if (processorResponse.success) {
                        Log.sDebug("OPC = " + response.result.opaqueJson);
                        Log.sDebug("istokenStatePendingVerification" + this.istokenStatePendingVerification);
                        Log.sDebug("tokenID" + this.tokenID);
                        let gpayJson = {
                            "userName": this.state.name,
                            "last4Digits": this.state.number.substring(12, 15),
                            "cardNetwork": constantObjects.CARD_NETWORK_VISA,
                            "tsp": constantObjects.TSP_VISA
                        }
                        this.hideProgressDialog();
                        if (this.state.istokenStatePendingVerification) {
                            androidApiCallsService.manualProvisioning(this.gpayJson, this.tokenID);
                        } else {
                            androidApiCallsService.addCardToGpay(response.result.opaqueJson, gpayJson, userDetails);
                        }
                    } else {
                        Log.sDebug("OPC fail");
                        this.showErrorScreen();
                    }
                } else {
                    Log.sDebug("Failure in getting OPC");
                    this.showErrorScreen();
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    sendGiftCardAddedMetrics = (isCardAddedToGpay) => {
        let data = {};
        data["gc_chaveDeCliente"] = this.state.gcClientKey;
        data["gc_chaveDeConta"] = this.state.gcAccountKey;
        data["gc_chaveDeCartao"] = this.state.gcCardKey;
        data["isCardAddedToGpay"] = isCardAddedToGpay;
        ArbiApiMetrics.sendGiftCardAlertMetrics(GET_GIFT_CARD_STATUS_IN_GPAY, "tapAndPayClient.getTokenStatus", isCardAddedToGpay, isCardAddedToGpay ? 201 : 400, data, 0);
    }
    
    sendIsGpayAppReadyToPayMetrics = (isReady, isEligible) => {
        let data = {};
        let jsonObject = this.state.json;
        data["isReady"] = isReady;
        data["isEligible"] = isEligible;
        data["nome"] = jsonObject.name;
        data["identificacaoFiscal"] = jsonObject.cpf;
        data["ddd"] = "0" + jsonObject.ddd;
        data["numero"] = jsonObject.mobNum;
        data["email"] = jsonObject.email;
        data["dataNascimento"] = jsonObject.dob;
        ArbiApiMetrics.sendGiftCardAlertMetrics(GET_CARD_ADDED_STATUS_GPAY, "isReadyToPay", true, 201, data, 0);
    }


    getGiftCardAccountKey = () => {
       // let gcClientKey = androidApiCallsService.getFromPrefs("giftCardClientId");
        Log.sDebug("gcClientKey: " + this.state.gcClientKey);
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.getGiftCardAccountKey(this.state.gcClientKey).then(response => {
                Log.sDebug("getAccountKey:" + JSON.stringify(response));
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processGetGiftCardAccountKey(response.result);
                    if (processedResponse.success) {
                        this.setState({
                            gcAccountKey: processedResponse.gcAccountKey,
                            gcClientKey: processedResponse.gcClientKey
                        });
                        this.checkIfAccountIsLoaded(processedResponse);
                    } else {
                        Log.sDebug("unexpected error no account");
                        this.showErrorScreen();
                    }
                } else {
                    Log.verbose("Login failed with error - ");
                    this.showErrorScreen();
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    openPrivacyPolicy = () => {
        this.setState({
            currentState: "privacy_policy"
        })
    }

    gpayAction = () => {
        if (this.state.walletId === "") {
            androidApiCallsService.createWallet();
        } else if (this.isGPayInstalled()) {
            //this.getOPC();
            this.fetchUserDetails();
        } else {
            this.installGPayDialog();
        }
    }

    isGPayInstalled = () => {
        return androidApiCallsService.isPackageAvailable("com.google.android.apps.walletnfcrel");
    }

    onPrimary = () => {
        this.setState({
            open: false
        });
        androidApiCallsService.installGPay();

    }

    onSecondary = () => {
        this.setState({
            open: false,
        })
    }

    setCustomerCareBottomSheet = (open) => {
        this.setState({
            customerCareBottomSheet: open
        })

    };

    installGPayDialog = () => {
        this.setState({
            open: true,
            btnText: localeObj.install_btn,
            bottom_header: localeObj.install_gpay_header,
            description: localeObj.install_gpay_desc,
        })
    }


    showGPayScreen = () => {
        this.showProgressDialog();
        androidApiCallsService.getActiveWalletId();
        androidApiCallsService.getStableHardwareId();
        //androidApiCallsService.listTokens(false);
        if(!androidApiCallsService.isDeviceRooted()){
            ArbiApiService.listTokensGiftCard(this.state.gcClientKey, this.state.gcAccountKey, this.state.gcCardKey, PageNameJSON.google_pay).then(response => {
                //Log.sDebug("listTokensGiftCard:" + JSON.stringify(response));
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processListTokensGiftCard(response.result);
                    if (processedResponse.success) {
                        //Log.sDebug("listTokensGiftCard, processedResponse:" + JSON.stringify(processedResponse));
                        if (processedResponse.tokenStatus === "ACTIVE" || processedResponse.tokenStatus === "INACTIVE" || processedResponse.tokenStatus === "SUSPENDED") {
                            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
                            this.sendGiftCardAddedMetrics(true);
                            let jsonObj = {}
                            jsonObj["header"] = localeObj.gift_card_gpay_success_header;
                            jsonObj["description"] = localeObj.gift_card_gpay_success_desc1;
                            jsonObj["caption"] = localeObj.gift_card_gpay_success_desc2;
                            jsonObj["desc"] = localeObj.gift_card_gpay_success_desc3;
                            jsonObj["btnText"] = localeObj.gift_card_run_out_primary
                            jsonObj["gpaySuccess"] = true
                            this.setState({
                                currentState: "error",
                                direction: "left",
                                creditErrorJson: jsonObj,
                                suceesScreen: true,
                                processing: false
                            })
                        } else {
                            this.showAddCardToGpayScreen();
                        }
                    } else {
                        //Log.sDebug("listTokensGiftCard: false");
                        this.showAddCardToGpayScreen();
                    }
                } else {
                    //Log.verbose("listTokensGiftCard, failed");
                    this.showAddCardToGpayScreen();
                }
            });
        } else {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.showErrorScreen();
        }
    }

    showAddCardToGpayScreen = () => {
        let istokenStatePendingVerification = false;
        let isCardDefaultCardInGPay = false;
        let cardAddedToGPay = false;
        this.sendGiftCardAddedMetrics(false);
        this.setState({
            istokenStatePendingVerification: istokenStatePendingVerification,
            isCardDefaultCardInGPay: isCardDefaultCardInGPay,
            cardAddedToGPay: cardAddedToGPay,
            currentState: "google_pay",
            processing: false
        })
    }

    isCardTokenized = (response, isCardDefault, tokenStateInt, tokenID) => {
        Log.sDebug("isTokenized response: " + response + " isCardDefault: " + isCardDefault + " tokenStateInt: " + tokenStateInt + "'tokenID: " + tokenID);
        this.tokenID = tokenID;
        let istokenStatePendingVerification = false;
        let isCardDefaultCardInGPay = false;
        let cardAddedToGPay = false;
        if (tokenStateInt === TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION) {
            Log.sDebug("istokenStatePendingVerification, true");
            istokenStatePendingVerification = true;
        } else {
            Log.sDebug("istokenStatePendingVerification, false");
            istokenStatePendingVerification = false;
        }
        if (response) {
            Log.sDebug("isTokenized response, true response");
            cardAddedToGPay = true;
            if (isCardDefault)
                isCardDefaultCardInGPay = true;
            else
                isCardDefaultCardInGPay = false;

        } else {
            cardAddedToGPay = false;
        }
        if (cardAddedToGPay) {
            androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
            this.sendGiftCardAddedMetrics(true);
            let jsonObj = {}
            jsonObj["header"] = localeObj.gift_card_gpay_success_header;
            jsonObj["description"] = localeObj.gift_card_gpay_success_desc1;
            jsonObj["caption"] = localeObj.gift_card_gpay_success_desc2;
            jsonObj["desc"] = localeObj.gift_card_gpay_success_desc3;
            jsonObj["btnText"] = localeObj.gift_card_run_out_primary
            jsonObj["gpaySuccess"] = true
            this.setState({
                currentState: "error",
                direction: "left",
                creditErrorJson: jsonObj,
                processing: false
            })
        } else {
            this.sendGiftCardAddedMetrics(false);
            this.setState({
                istokenStatePendingVerification: istokenStatePendingVerification,
                isCardDefaultCardInGPay: isCardDefaultCardInGPay,
                cardAddedToGPay: cardAddedToGPay,
                currentState: "google_pay",
                processing: false
            })
        }
    }



    handleGPayResponse = (response) => {
        Log.sDebug("response is = " + response);
        if (response === -1) {
            this.showGPayScreen();
        }
    }


    gPayDataChangedListener = () => {
        Log.sDebug("gPayDataChangedListener: ");
        if (this.state.currentState === "google_pay") {
            this.showGPayScreen();
        }
    }

    giftCardForm = () => {
        this.setState({
            currentState: "gift_card_form"
        });
    }

    errorPrimaryOnclick = (btnText) => {
        switch (btnText) {
            case "gcCreationInProgress":
                this.setState({
                    currentState: "create_card",
                    retryVerification: true
                });
                break;
            case localeObj.gift_card_try_again:
                this.giftCardForm();
                break;
            case localeObj.gift_card_run_out_primary:
                if(this.state.suceesScreen) {
                    this.sendEventMetrics(constantObjects.wantDimoAccount, PageNameJSON["success"]);
                }
                this.mayBeLater();
                break;
            default:
                this.mayBeLater();
                break;
        }
    }

    errorSecondaryOnclick = () => {
        this.mayBeLater();
    }

    addCardToGpayPrimary = () => {
        this.props.history.replace({
            pathname: "/newLogin",
            followToDigitalCard: true
        });
        this.sendEventMetrics(constantObjects.newJourneyPrimary, PageNameJSON["add_card_to_gpay"]);
    }

    addCardToGpaySecondary = () => {
        if(this.isGPayInstalled())
            androidApiCallsService.openPackage("com.google.android.apps.walletnfcrel");
        else
            this.installGPayDialog();
        this.sendEventMetrics(constantObjects.newJourneySecondary, PageNameJSON["add_card_to_gpay"]);
    }

    giftCardInEligibleOnPrimary = () => {
        androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
        this.props.history.replace({
            pathname: "/newLogin",
            followToCreditCard: true
        });
        this.sendEventMetrics(constantObjects.gcInEligiblePrimary, PageNameJSON["not_eligible_gift_card"]);
    }

    giftCardInEligibleOnSecondary = () => {
        androidApiCallsService.storeToPrefs("showGiftCardBottomSheet", "false");
        this.mayBeLater();
        this.sendEventMetrics(constantObjects.gcInEligibleSecondary, PageNameJSON["not_eligible_gift_card"]);
    }

    render() {
        const { classes } = this.props;
        const currentState = this.state.currentState
        return (
            <div style={{ overflowX: "hidden" }}>
                {
                    (currentState === "create_card" || currentState === "google_pay" || currentState === "privacy_policy" || currentState === "add_card_to_gpay") &&
                    <ButtonAppBar header={currentState === "add_card_to_gpay" ? localeObj.gift_card_gpay_appbar : localeObj.gift_card_dimo} onCancel={this.onBack} action={currentState === "privacy_policy" ? "cancel" : "none"}
                        inverse={currentState === "add_card_to_gpay" ? false : true} onBack={this.onBack} />
                }
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "loadingCard" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "loadingCard" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "loadingCard" && <GiftCardLoader />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "gift_card_form" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "gift_card_form" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "gift_card_form" && <GiftCardFormComp receiveDetails={this.receiveDetails} mayBeLater={this.mayBeLater} goToMotoPayLandingPage={this.goToMotoPayLandingPage} 
                        sendEventMetrics = {this.sendEventMetrics} openPrivacyPolicy={this.openPrivacyPolicy} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "create_card" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "create_card" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "create_card" && <GiftCardCreation verifyGiftCardStatus={this.verifyGiftCardStatus} retryVerification={this.state.retryVerification} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <GiftCardErrorComp errorJson={this.state.creditErrorJson} onBack={this.onBack}
                            customerCareBottomSheet={this.state.customerCareBottomSheet} setCustomerCareBottomSheet={this.setCustomerCareBottomSheet}
                            onClick={this.errorPrimaryOnclick} close={this.errorSecondaryOnclick} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "add_card_to_gpay" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "add_card_to_gpay" && !this.state.processing ? 'block' : 'none') }}>

                        {currentState === "add_card_to_gpay" && <ImageInformationComponent header={localeObj.gift_card_new_journey_header} next={this.addCardToGpaySecondary} icon={add_card_to_gpay}
                            appBar={false} description={localeObj.gift_card_new_journey_desc1} btnText={localeObj.gift_card_new_journey_primary} giftCardIcon={true}
                            charge={localeObj.gift_card_new_journey_desc2} subText={localeObj.gift_card_new_journey_desc3} tip={localeObj.gift_card_new_journey_desc4} card = {true}
                             onAction={this.addCardToGpaySecondary} type={PageNameJSON["add_card_to_gpay"]} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "not_eligible_gift_card" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "not_eligible_gift_card" && !this.state.processing ? 'block' : 'none') }}>

                        {currentState === "not_eligible_gift_card" && <ImageInformationComponent header={localeObj.gift_card_not_eligible_head} next={this.giftCardInEligibleOnPrimary} 
                            appBar={true} description={localeObj.gift_card_not_eligible_desc1} btnText={localeObj.gift_card_not_eligible_primary} action = {localeObj.gift_card_not_eligible_secondary} 
                            charge={localeObj.gift_card_not_eligible_desc2}  card = {true} onCancel = {this.mayBeLater} noBottomSheet = {true} icon={error}
                             onAction={this.giftCardInEligibleOnSecondary} type={PageNameJSON["not_eligible_gift_card"]} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "google_pay" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "google_pay" && !this.state.processing ? 'block' : 'none') }}>

                        {currentState === "google_pay" && <GiftCardGooglePayComp virtualCard={localeObj.gift_card_gpay} gpayIcon={visaGpayCard} gpayDesc={localeObj.gift_card_gpay_header1} amount={this.state.amount} gpayEntryPoint={"gift_card"} isGpayErrorScreen={false} goToMotoPayLandingPage={this.goToMotoPayLandingPage}
                            appBar={false} card={true} gpayBtn={true} gcClientKey={this.state.gcClientKey} gcAccountKey={this.state.gcAccountKey} gpayDesc2={localeObj.gift_card_gpay_desc1} gpayDesc3={localeObj.gift_card_gpay_caption} cardActive={localeObj.gift_card_gpay_desc2} googleIcon={googleIcon} addToGpayIcon={addToGpayIcon} gpayBtnText={this.state.gpayBtnText} setAsDefaultBtnTxt={this.state.setAsDefaultBtnTxt} addedToGpay={localeObj.added_to_gpay}
                            cardKey={this.state.gcCardKey} gPayDataChangedListener={this.gPayDataChangedListener} handleGPayResponse={this.handleGPayResponse} isCardAddedToGpay={this.state.isCardAddedToGpay} isCardDefaultCardInGPay={this.state.isCardDefaultCardInGPay} next={this.gpayAction} type = {PageNameJSON['google_pay']}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "privacy_policy" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "privacy_policy" && !this.state.processing ? 'block' : 'none') }}>

                        {currentState === "privacy_policy" && <GiftCardPrivacyComp />}
                    </div>
                </CSSTransition>

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
                        <FlexView column hAlignContent='center' vAlignContent='center' style={{ width: "100%", marginBottom: "1.5rem" }}>
                            <PrimaryButtonComponent btn_text={this.state.btnText} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                        </FlexView>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>


            </div>

        );
    }
}
GiftCardMain.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(GiftCardMain);
