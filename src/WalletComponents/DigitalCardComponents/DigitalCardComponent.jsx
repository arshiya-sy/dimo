import React from "react";
import "../../styles/main.css";
import InputThemes from "../../Themes/inputThemes";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import PageNames from "../../Services/PageNames";
import httpRequest from "../../Services/httpRequest";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ColorPicker from "../../Services/ColorPicker";
import GeneralUtilities from "../../Services/GeneralUtilities";

import InputPinPage from "../CommonUxComponents/InputPinPage";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ArbiErrorResponseHandler from '../../Services/ArbiErrorResponsehandler';
import ActionButtonComponent from "../CommonUxComponents/ActionButton";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { CSSTransition } from 'react-transition-group';
import creditCard from "../../images/SpotIllustrations/CreditCard.png"
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import constantObjects from "../../Services/Constants";

import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import AddIcon from '@material-ui/icons/AddSharp';
import LockIcon from '@material-ui/icons/LockOutlined';
import Drawer from '@material-ui/core/Drawer';
import Chip from '@mui/material/Chip';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import CardIcon from "@material-ui/icons/CreditCard";
import PageState from "../../Services/PageState";
import MetricsService from "../../Services/MetricsService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarThemeForMyCards;
var localeObj = {};

class DigitalCardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            creationState: "initial",
            snackBarOpen: false,
            physicalDetails: [],
            virtualDetails: [],
            listCards: [],
            visaEnabled: false,
            cardActive: false,
            clearPassword: false,
            bottomSheetOpen: false,
            reset: false,
            noPhysicalCard: false,
            cardVisibility: true,
            visaExists: false,
            isOnBack: true,
            virtualCardExists: false,
            enableCreditandDebitVisibility: false,
            showCreditOption: true,
            processing: false,
            enableCreditCard: constantObjects.featureEnabler.CREDIT_CARD_ENABLED
        };
        this.blockedByIssue = "Bloqueado por Emissão";
        this.unblocked = "Desbloqueado";
        this.componentName = PageNames.cardHomePage;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
        arbiApiService.getMigrationPermission(this.componentName).then(response => {
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processMigratePermissionResponse(response.result);
                if (processedDetails.success) {
                    this.setState({
                        visaEnabled: true,
                        productId: processedDetails.productId
                    })
                }
            }
        });
        this.getCardDetails();
    }

    enableCreditCard() {
        arbiApiService.getGuaranteedCreditStatus(this.componentName).then(response => {
            //this.hideProgressDialog();
            if (response && response.success) {
                this.hideProgressDialog();
                let processedDetails = ArbiResponseHandler.processGuaranteedCreditStatusResponse(response.result);
                if (processedDetails && processedDetails.success) {
                    ImportantDetails.creditStatus = processedDetails.creditStatus.cardStatus;
                    if (processedDetails.creditStatus
                        && processedDetails.creditStatus.cardStatus >= 5
                        && constantObjects.featureEnabler.CREDIT_CARD_ENABLED) {
                        this.setState({
                            enableCreditandDebitVisibility: true,
                            creditStatus: processedDetails.creditStatus.cardStatus
                        });
                    } else {
                        this.setState({
                            enableCreditandDebitVisibility: false,
                            creditStatus: processedDetails.creditStatus.cardStatus
                        });
                    }
                } else {
                    this.setState({
                        enableCreditandDebitVisibility: false,
                        showCreditOption: true,
                    });
                }
            } else {
                this.setState({
                    enableCreditandDebitVisibility: false,
                });
                this.hideProgressDialog();
            }
        });
    }

    async getCardDetails() {
        let response = {};
        let action = "";
        let brand1 = "VISA";
        let entryPoint = "";

        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            action = this.props.location.additionalInfo["cardActions"];
            brand1 = this.props.location.additionalInfo["brand"];
            entryPoint = this.props.location.additionalInfo["entryPoint"];
        }
        if (Object.keys(ImportantDetails.cardDetailResponse).length === 0 ||
            ImportantDetails.cardDetailResponse === null ||
            ImportantDetails.cardDetailResponse == {} ||
            ImportantDetails.cardDetailResponse === undefined) {
            this.showProgressDialog();
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
        if (response && response.success) {
            if (ImportantDetails.creditStatus === -1) {
                this.enableCreditCard();
            } else {

                this.setState({
                    creditStatus: ImportantDetails.creditStatus
                }, () => {
                    if (ImportantDetails.creditStatus && ImportantDetails.creditStatus >= 5) {
                        this.setState({
                            enableCreditandDebitVisibility: true
                        })
                    } else {
                        this.setState({
                            enableCreditandDebitVisibility: false
                        })
                    }
                });
                this.hideProgressDialog();
            }
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
                        });
                    }
                    this.setState({ virtualDetails: virtualDetails })
                }
                if (processedDetails.physicalCardDetails) {
                    let physicalDetails = [];
                    if(processedDetails.physicalCardDetails) {
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
                            if (this.checkIfCancelled(opt.descricaoStatusCartao)) {
                                this.setState({
                                    cancelled: true,
                                    cancelledDetails: jsonObject
                                })
                            } else if (opt.descricaoStatusCartao === this.blockedByIssue) {
                                this.setState({ newCardRequested: true })
                            } else {
                                this.setState({ cardActive: true })
                            }
                        });
                    }
                    this.setState({ physicalDetails: physicalDetails })
                }
                this.setState({ listCards: listCards });

                let pd = this.state.physicalDetails;
                let vd = this.state.virtualDetails;
                if (action !== "" && action !== undefined) {
                    if (action === "google_pay" || action === "set_card_as_default_gpay") {
                        for (let i in pd) {
                            if (pd[i].brand === brand1 && !this.checkIfCancelled(pd[i].status)) {
                                if (androidApiCalls.isFeatureEnabledInApk("VISA_GPAY"))
                                    this.action(pd[i]);
                                break;
                            }
                        }
                    } else if (action === "google_pay_virtual" || action === "set_card_as_default_gpay_virtual") {
                        for (let i in vd) {
                            if (vd[i].brand === brand1) {
                                if (androidApiCalls.isFeatureEnabledInApk("VISA_GPAY")) {
                                    this.setState({
                                        virtualCardExists: true
                                    })
                                    this.action(vd[i]);
                                }
                                break;
                            }
                        }
                        if (!this.state.virtualCardExists && entryPoint === PageNames.firstAccessVCard)
                            this.showFinalAccessScreen();
                    }
                }
            } else {
                if (processedDetails.error === "NO_CARDS") {
                    if (entryPoint === PageNames.firstAccessVCard)
                        this.showFinalAccessScreen();
                    else
                        this.props.history.replace("/cardRequest");
                } else if (processedDetails.error === "VIRTUAL_CARD_ONLY") {

                    let virtualDetails = [];
                    let listCards = [];
                    if (processedDetails.virtualCardDetails) {
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
                            virtualDetails.push(jsonObject);
                            listCards.push(jsonObject);
                        });
                    }
                    this.setState({
                        virtualDetails: virtualDetails,
                        listCards: listCards,
                        noPhysicalCard: true
                    });
                    let vd = this.state.virtualDetails;
                    if (action !== "" && action !== undefined) {
                        if (action === "google_pay_virtual" || action === "set_card_as_default_gpay_virtual") {
                            for (let i in vd) {
                                if (vd[i].brand === brand1) {
                                    if (androidApiCalls.isFeatureEnabledInApk("VISA_GPAY")) {
                                        this.setState({
                                            virtualCardExists: true
                                        })
                                        this.action(vd[i]);
                                    }
                                    break;
                                }
                            }
                            if (!this.state.virtualCardExists && entryPoint === PageNames.firstAccessVCard)
                                this.showFinalAccessScreen();
                        }
                    }
                } else {
                    if (entryPoint === PageNames.firstAccessVCard)
                        this.showFinalAccessScreen();
                    else
                        this.props.history.replace("/failRequest");
                }
            }
        } else {
            if (entryPoint === PageNames.firstAccessVCard)
                this.showFinalAccessScreen();
            else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.card_failed;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error"
                })
            }
        }

    }

    showFinalAccessScreen = () => {
        this.props.history.replace({ pathname: "/accountConfirmation", transition: "left" });
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

    action = (details) => {
        MetricsService.onPageTransitionStop(PageNames.cardHomePage, PageState.close);
        if (details["status"] === this.blockedByIssue) {
            this.props.history.push({
                pathname: '/digitalCardArrival',
                state: {
                    "card": details,
                    "virtualDetails": this.state.virtualDetails,
                    "additionalInfo": this.props.location.additionalInfo
                }
            });
        } else if (details["cardType"] === "physical") {
            if (!this.checkIfCancelled(details["status"]))
                this.props.history.replace({
                    pathname: '/digitalCardCreated',
                    state: details,
                    listCards: this.state.listCards,
                    "additionalInfo": this.props.location.additionalInfo,
                    visaEnabled: this.state.visaEnabled,
                    cardKey: this.state.productId,
                    from : this.props.location.from
                });
        } else {
            let event = {
                eventType: constantObjects.vCardView,
                page_name: PageNames.DigitalCardScreen,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.props.history.replace({
                pathname: '/virtualCardComponent',
                state: this.state.virtualDetails,
                listCards: this.state.listCards,
                "additionalInfo": this.props.location.additionalInfo,
                from : this.props.location.from
            });
        }

    }

    showVisaStatus = () => {
        this.setState({
            snackBarOpen: true,
            message: localeObj.card_gen_toast
        })
    }

    requestNewCard = () => {
        this.props.history.replace({
            pathname: '/digitalCardCreated',
            state: this.state.cancelledDetails,
            actionState: "confirm_copy",
            visaEnabled: this.state.visaEnabled,
            cardKey: this.state.productId
        });
    }

    requestNewPhysicalCard = () => {
        this.props.history.replace("/cardRequest");
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

    cancel = () => {
        if (this.state.isOnBack) {
            this.setState({ isOnBack: false });
            MetricsService.onPageTransitionStop(PageNames.cardHomePage, PageState.cancel);
            this.setState({ cardVisibility: false });

            const { fromComponent = null, state = {} } = this.props.location;

            if (fromComponent === PageNames.GamificationComponent.program_details) {
                return this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
            } else if (fromComponent === "CreditCardHomePage") {
                return this.props.history.replace({ pathname: "/creditCard", transition: "right", state });
            }
            GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
        }
    }

    onBack = () => {
        if(this.props.location.from === "giftCard") {
            this.props.history.replace({pathname: "/giftCardMain"});
            return;
        }
        if (this.state.processing) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNames.cardHomePage, PageState.back);
            this.cancel();
        }
    }

    checkIfBlocked = (status) => {
        if (status === "Bloqueado a pedido do cliente" || status === "Bloqueado a pedido do cliente Cliente"
            || status === "Bloqueado por Senha Incorreta") {
            return true;
        } else {
            return false;
        }
    }

    learnMore = () => {
        MetricsService.onPageTransitionStop(PageNames.cardHomePage, PageState.close);
        let event = {
            eventType: constantObjects.vCardLearnMore,
            page_name: PageNames.DigitalCardScreen,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        if (this.state.virtualDetails.length === 0) {
            this.props.history.replace({
                pathname: '/virtualCardInfo',
                state: this.state.virtualDetails,
                cardState: "NO CARD"
            });
        } else {
            this.props.history.replace({
                pathname: '/virtualCardInfo',
                state: this.state.virtualDetails,
                cardState: "CARD PRESENT"
            });
        }
    }

    checkIfCancelled = (status) => {
        switch (status) {
            case "Bloqueado por Fraude":
            case "Bloqueado por Solicitação Judicial":
            case "Bloqueado por Roubo":
            case "Bloqueado por Perda":
            case "Bloqueado por Extravio":
            case "Bloqueado por Suspeita de Fraude":
            case "Bloqueado por PLD":
            case "Bloqueado por Dano":
            case "Cancelado/Desativado":
                return true;
            default: return false;
        }
    }

    requestNewVirtualCard = (cardPin) => {
        this.showProgressDialog();
        arbiApiService.requestVirtualCard(cardPin, this.componentName)
            .then(response => {
                this.hideProgressDialog();
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

                        this.setState({
                            virtualDetails: virtualCardDetails,
                            creationState: "initial",
                            snackBarOpen: true,
                            message: localeObj.virtual_card_added
                        })
                    } else {
                        let jsonObj = {};
                        jsonObj["header"] = localeObj.card_failed;
                        jsonObj["description"] = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            errorJson: jsonObj,
                            creationState: "error"
                        })
                    }
                } else {
                    let jsonObj = {};
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        jsonObj["header"] = localeObj.card_failed;
                        jsonObj["description"] = localeObj.pix_communication_issue;
                        this.setState({
                            errorJson: jsonObj,
                            creationState: "error"
                        })
                    } else if ('' + response.result.code === "10007") {
                        this.setState({ bottomSheetOpen: true })
                    } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                        this.setState({ reset: true })
                    } else {
                        jsonObj["header"] = localeObj.card_failed;
                        jsonObj["description"] = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            errorJson: jsonObj,
                            creationState: "error"
                        })
                    }
                }
            })
    }

    getPin = () => {
        this.setState({
            creationState: "pin"
        })
    }

    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    onConfirm = () => {
        MetricsService.onPageTransitionStop(PageNames.cardHomePage, PageState.close);
        let event = {
            eventType: constantObjects.migrateToVisa,
            page_name: PageNames.cardHomePage,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        this.props.history.push({
            pathname: '/migrateCard',
            state: {
                "cardKey": this.state.productId,
                "virtualDetails": this.state.virtualDetails
            }
        });
    }

    checkIfCardIsValid = (status) => {
        if (this.checkIfCancelled(status)) {
            if (this.state.cardActive) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    goToCreditCard = () => {
        MetricsService.onPageTransitionStop(PageNames.cardHomePage, PageState.close);
        let event = {
            eventType: constantObjects.requestCreditCard,
            page_name: PageNames.cardHomePage,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        this.props.history.push({
            pathname: '/creditCard',
            state: {
                "creditStatus": {},
                "entryPoint": "card"
            }
        });
    }

    render() {
        const screenHeight = window.screen.height;
        const creation = this.state.creationState;
        const { classes } = this.props;
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: creation === "initial" && !this.state.processing ? 'block' : 'none' }}>
                    <ButtonAppBar header={localeObj.acc_card_my_cards} onBack={this.onBack} action="none" />
                    <div style={{ overflowY: "auto", height: `${screenHeight * 0.85}px`, overflowX: "hidden" }}>
                        <FlexView column style={InputThemes.initialMarginStyle}>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.your_cards}
                            </div>
                        </FlexView>
                        {this.state.showCreditOption && this.state.enableCreditCard &&
                            <div  style={{ position: 'relative', margin: "1.5rem", marginBottom: "0", textAlign: "center" }} onClick={this.goToCreditCard}>
                                <img style={{ width: "100%", minHeight: "10.625rem", borderRadius: "1.75rem" }} src={creditCard} alt=""></img>
                                <div  style={{ position: 'absolute', top: "10%", left: "8%", right: 0, bottom: 0, width: "59%", textAlign: "left" }}>
                                    <span className="headline5 highEmphasis">{localeObj.credit_available}</span>
                                </div>
                                <div  style={{ position: 'absolute', top: "80%", left: "8%", right: 0, bottom: 0, width: "90%", textAlign: "left" }}>
                                    <span className="body2 highEmphasis">{localeObj.know_more}</span>
                                </div>
                            </div>
                        }
                        <div style={{ margin: "1.5rem" }}>
                            <div className="body2 ligtherAccent" style={{ textAlign: "left", marginBottom: "0.5rem" }}>
                                {localeObj.physical}
                            </div>
                            {this.state.cardVisibility && this.state.physicalDetails.map((opt, key) => (
                                <MuiThemeProvider key={key} theme={InputThemes.CardTheme}>
                                    {this.checkIfCardIsValid(opt.status) &&
                                        <Paper row className={classes.root} id={key} elevation="0"
                                            onClick={() => { this.action(opt) }} style={{ width: "94%", backgroundColor: ColorPicker.newProgressBar }}>
                                            <FlexView column style={{ width: "95%", marginLeft: "1rem" }}>
                                                <div className="body2 highEmphasis">
                                                    <span>{opt.brand === "VISA" ? this.state.enableCreditandDebitVisibility === true ? localeObj.visa_deb_and_credit : localeObj.visa_deb : localeObj.elo_pre}</span>
                                                    {opt.status === this.blockedByIssue &&
                                                        <Chip className="tagStyle" style={{ backgroundColor: ColorPicker.accent, height: "1.5rem" }} label={localeObj.card_blocked_cap} />}
                                                    {this.checkIfCancelled(opt.status) &&
                                                        <Chip className="tagStyle" style={{ backgroundColor: ColorPicker.errorRed, height: "1.5rem" }} label={localeObj.card_cancelled_cap} />}
                                                </div>
                                                <div className="body2 mediumEmphasis" style={{ marginTop: "0.25rem" }}>{opt.number}</div>
                                            </FlexView>
                                            <div style={{ display: 'flex', justifyContent: "flex-end", width: "5%" }}>
                                                {this.checkIfBlocked(opt.status) && <LockIcon style={{ fill: ColorPicker.accent, width: "1rem" }} />}
                                                {!this.checkIfBlocked(opt.status) && !this.checkIfCancelled(opt.status) && <NextIcon style={{ fill: ColorPicker.accent, width: "1rem" }} />}
                                            </div>
                                        </Paper>}
                                </MuiThemeProvider>
                            ))}
                            {!this.state.visaEnabled && !this.state.visaExists && !this.state.noPhysicalCard &&
                                <Paper row className={classes.root} elevation="0"
                                    onClick={() => { this.showVisaStatus() }} style={{ width: "94%", backgroundColor: ColorPicker.newProgressBar }}>
                                    <FlexView column style={{ width: "95%", marginLeft: "1rem" }}>
                                        <div className="body2 highEmphasis">
                                            <span>{localeObj.visa_deb}</span>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ marginTop: "0.25rem" }}>{localeObj.card_gen_progress}</div>
                                    </FlexView>
                                    <div style={{ width: "5%", display: 'flex', justifyContent: 'flex-end' }}>
                                        <NextIcon style={{ fill: ColorPicker.accent, width: "1rem", paddingLeft: "4.688rem" }} />
                                    </div>
                                </Paper>
                            }


                            <div  style={{ display: (this.state.cancelled && !this.state.newCardRequested && !this.state.cardActive) ? "block" : "none", textAlign: "center", margin: "0 auto" }}>
                                <ActionButtonComponent
                                    btn_text={localeObj.request_new_card}
                                    onCheck={this.requestNewCard}
                                    icon={<AddIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />}
                                />
                            </div>
                            <div  style={{ display: this.state.noPhysicalCard ? "block" : "none", textAlign: "center", margin: "0 auto" }}>
                                <ActionButtonComponent
                                    btn_text={localeObj.request_physical_card}
                                    onCheck={this.requestNewPhysicalCard}
                                    icon={<AddIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />}
                                />
                            </div>
                        </div>
                        {this.state.cardVisibility && this.state.virtualDetails.length >= 0 &&
                            <div style={{ margin: "0 1.5rem" }}>
                                <div style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span className="pixTableLeftContent tableLeftStyle ligtherAccent" >{localeObj.virtual}</span>
                                    <span className="pixTableRightContent tableRightStyle ligtherAccent" onClick={() => this.learnMore()}>{localeObj.learn_more}</span>
                                </div>
                                {this.state.virtualDetails.map((opt, key) => (
                                    <MuiThemeProvider key={key} theme={InputThemes.CardTheme}>
                                        <Paper row className={classes.root} id={key} elevation="0"
                                            onClick={() => { this.action(opt) }} style={{ width: "94%", backgroundColor: ColorPicker.newProgressBar }}>
                                            <FlexView column style={{ width: "95%", marginLeft: "1rem" }}>
                                                <div className="body2 highEmphasis">
                                                    <span>{opt.brand === "VISA" ? this.state.enableCreditandDebitVisibility === true ? localeObj.visa_deb_and_credit : localeObj.visa_deb : localeObj.elo_pre}</span>
                                                    {opt.status === this.unblocked &&
                                                        <Chip className="tagStyle" style={{ backgroundColor: ColorPicker.success, height: "1.5rem" }} label={localeObj.new} />}
                                                    {this.checkIfBlocked(opt.status) &&
                                                        <Chip className="tagStyle" style={{ backgroundColor: ColorPicker.accent, height: "1.5rem" }} label={localeObj.card_blocked_cap} />}
                                                </div>
                                                <div className="body2 mediumEmphasis" style={{ marginTop: "0.25rem" }}>{opt.number}</div>
                                            </FlexView>
                                            <div style={{ display: 'flex', justifyContent: "flex-end", width: "5%" }}>
                                                <NextIcon style={{ fill: ColorPicker.accent, width: "1rem", paddingLeft: "4.688rem" }} />
                                            </div>
                                        </Paper>
                                    </MuiThemeProvider>
                                ))}
                            </div>
                        }
                        {/*this.state.virtualDetails.length === 0 uncomment after jazz fixes*/ false &&
                            <div style={{ textAlign: "center", margin: "0 auto"}}>
                                <ActionButtonComponent addTopMargin={true}
                                    btn_text={localeObj.add_virtual_card}
                                    onCheck={this.getPin}
                                    icon={<AddIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />}
                                />
                            </div>
                        }
                        {this.state.visaEnabled &&
                            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                                <PrimaryButtonComponent btn_text={localeObj.ask_dimo_card} onCheck={this.onConfirm} icon={<CardIcon />} />
                            </div>
                        }
                    </div>
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames="pageSliderLeft">
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.cancel} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames="pageSliderLeft">
                    <div style={{ display: (creation === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_authentication} onBack={this.onBack} action="none" />
                        {creation === "pin" && <InputPinPage confirm={this.requestNewVirtualCard} clearPassword={this.state.clearPassword} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing &&
                        <div>
                            <ButtonAppBar header={localeObj.account_card} onBack={this.onBack} action="none" />
                            <CustomizedProgressBars />
                        </div>
                    }
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
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.try} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
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
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.LONG_SNACK_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

DigitalCardComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(DigitalCardComponent);
