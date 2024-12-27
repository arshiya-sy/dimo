import React from 'react';
import moment from "moment";
import FlexView from "react-flexview";
import { CSSTransition } from 'react-transition-group';
import PropTypes from "prop-types";
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';

import SelectOption from '../CommonUxComponents/SelectOptionFromList';
import CellularPhoneNumberInput from "../CellularRechargeComponents/CellularPhoneNumberComponent";
import ChooseOperatorComp from "../CellularRechargeComponents/ChooseOperatorComponent";
import ChooseRechargeAmountComp from "../CellularRechargeComponents/ChooseRechargeAmountComponent";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import androidApiCalls from "../../Services/androidApiCallsService";
import localeService from "../../Services/localeListService";
import httpRequest from "../../Services/httpRequest";
import arbiApiService from "../../Services/ArbiApiService";
import NewUtilities from "../../Services/NewUtilities";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../Services/ArbiErrorResponsehandler'
import { ERROR_IN_SERVER_RESPONSE } from "../../Services/httpRequest";
import MetricServices from "../../Services/MetricsService";
import InputThemes from "../../Themes/inputThemes";
import success from "../../images/SpotIllustrations/Checkmark.png";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import SetPinComponent from '../CommonUxComponents/InputPinPage';
import ReviewTemplate from '../CommonUxComponents/ReviewTemplate';
import ReceiptTemplate from '../CommonUxComponents/RecieptTemplate';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import ImageInformationComponent from '../CommonUxComponents/ImageInformationComponent';
import PixErrorComponent from '../CommonUxComponents/ErrorTemplate';
import constantObjects from '../../Services/Constants';
import GeneralUtilities from '../../Services/GeneralUtilities';
import Log from '../../Services/Log';
import androidApiCallsService from '../../Services/androidApiCallsService';
import Utils from '../EngageCardComponent/Utils';

import InstantDialogComponent from "../GamificationComponent/RewardComponents/InstantDialogComponent";
import GamificationService from "../../Services/Gamification/GamificationService";
import {TASK_DIMO_RECHARGE_CASHOUT} from "../../Services/Gamification/GamificationTerms";
import AlertDialog from '../NewOnboardingComponents/AlertDialog';

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.CellularRecharge;
const CONTACTS_PERMISSION = "android.permission.READ_CONTACTS";
var localeObj = {};

class CellularRechargeComponents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transcationState: "inputNumber",
            ddd: "",
            phoneNumber: "",
            providersList: [],
            direction: "",
            providersId: [],
            selectedProvider: "",
            selectedProviderId: "",
            selectedAmount: 0,
            transactionPin: -1,
            displayNumber: "",
            prevState:"",
            operatorInfo: {},
            balance: -1,
            decimal: "",
            snackBarOpen: false,
            clearPassword: false,
            isOnBack: true,
            showPermissionToast: false,
            showContacts: false,
            gamInstantPopup:false,
            gamProgramData: {}
        }
        this.accountKey = "";
        this.pinError = "Senha inválida";
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            appBar: localeObj.phone_recharge,
            showContacts : androidApiCalls.isFeatureEnabledInApk("SHOW_CONTACTS_FEATURE")
        })

        window.onBackPressed = () => {
            this.onBack();
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CONTACTS_PERMISSION) {
                if (status === true) {
                   this.loadContacts();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            contactsPermissionAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.recharge_permission_denied);
                    }
                }
        }
    }
}
    onInputNumber = (valObj) => {
        this.showProgressDialog();
        arbiApiService.getServiceProviders("0" + valObj.ddd, PageNameJSON.inputNumber)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processServiceProvidersApiResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({ providersId: [...this.state.providersId, ...processorResponse.providerId] });
                        this.setState({ providersList: [...this.state.providersList, ...processorResponse.providers] });
                        this.setState(prevState => ({
                            operatorInfo: {
                                ...prevState.operatorInfo,
                                "ddd": valObj.ddd,
                                "phoneNumber": valObj.phoneNumber,
                                "displayNumber": valObj.displayNumber,
                                "providersId": processorResponse.providerId,
                                "providersList": processorResponse.providers,
                            },
                        }))
                        this.setState({
                            ddd: valObj.ddd,
                            phoneNumber: valObj.phoneNumber,
                            displayNumber: valObj.displayNumber,
                            transcationState: "operator",
                            direction: "left",
                        });
                    }
                } else {
                    let errorMessage = ArbiErrorResponseHandler.processGetCellularProvidersError(response.result, localeObj);
                    let jsonObj = {}
                    jsonObj["header"] = localeObj.recharge_failure_title;
                    jsonObj["description"] = errorMessage;
                    this.setState({
                        transcationState: "error",
                        direction: "left",
                        errorJson: jsonObj
                    })
                }
            });
    };

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    onInputProvider = (valObj) => {
        this.setState(prevState => ({
            operatorInfo: {
                ...prevState.operatorInfo,
                "displayAmountList": valObj.displayAmountList,
                "amountList": valObj.amountList,
                "selectedProvider": valObj.selectedProvider,
            },
        }))
        this.setState({
            selectedProvider: valObj.selectedProvider,
            selectedProviderId: valObj.selectedProviderId,
            displayAmountList: valObj.displayAmountList,
            amountList: valObj.amountList,
            transcationState: "amount",
            direction: "left",
        });
    };

    onInputAmount = (selectedAmount) => {
        this.showProgressDialog();
        arbiApiService.getUserBalance(PageNameJSON.amount)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        if (parseFloat(selectedAmount) <= parseFloat(processorResponse.balance)) {
                            let reviewInfo = {
                                "amount": selectedAmount,
                                "decimal": "00",
                                "receiver": {},
                                "transferType": localeObj.phone_recharge
                            }
                            reviewInfo["receiver"][localeObj.phone_number] = this.state.displayNumber
                            reviewInfo["receiver"][localeObj.operator] = this.state.selectedProvider
                            reviewInfo["receiver"][localeObj.Institution] = localeObj.app_name

                            this.setState(prevState => ({
                                operatorInfo: {
                                    ...prevState.operatorInfo,
                                    "selectedAmount": selectedAmount
                                },
                            }))
                            this.setState({
                                selectedAmount: selectedAmount,
                                direction: "left",
                                reviewInfo: reviewInfo,
                                appBar: localeObj.review_payment
                            });

                            let requestObj = {};
                            requestObj["amount"] = parseFloat(selectedAmount);
                            requestObj["code"] = 4010; // Cellular code
                            arbiApiService.getTariff(requestObj, PageNameJSON.review).then(response => {
                                this.hideProgressDialog();
                                if (response.success) {
                                    let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                                    if (processorResponse.success) {
                                        this.setState(prevState => ({
                                            reviewInfo: {
                                                ...prevState.reviewInfo,
                                                tariff: processorResponse.tariff,
                                            },
                                            transcationState: "review",
                                        }))
                                    } else {
                                        let jsonObj = {};
                                        jsonObj["header"] = localeObj.recharge_failure_title;
                                        jsonObj["description"] = localeObj.tariff_failed;
                                        this.setState({
                                            transcationState: "error",
                                            direction: "left",
                                            errorJson: jsonObj
                                        })
                                    }
                                } else {
                                    let jsonObj = {};
                                    jsonObj["header"] = localeObj.recharge_failure_title;
                                    jsonObj["description"] = localeObj.tariff_failed;
                                    this.setState({
                                        transcationState: "error",
                                        direction: "left",
                                        errorJson: jsonObj
                                    })
                                }
                            });
                        } else {
                            this.hideProgressDialog();
                            this.openSnackBar(localeObj.pix_amount_outofbound)
                        }
                    } else {
                        this.hideProgressDialog();
                        let jsonObj = {};
                        jsonObj["header"] = localeObj.recharge_failure_title;
                        jsonObj["description"] = localeObj.balance_unverified;
                        this.setState({
                            transcationState: "error",
                            direction: "left",
                            errorJson: jsonObj
                        })
                    }
                } else {
                    this.hideProgressDialog();
                    let jsonObj = {};
                    jsonObj["header"] = localeObj.recharge_failure_title;
                    jsonObj["description"] = localeObj.balance_unverified;
                    this.setState({
                        transcationState: "error",
                        direction: "left",
                        errorJson: jsonObj
                    })
                }
            });
    };

    setTransactionInfo = (info) => {
        this.setState({
            direction: "left",
            info: info,
            appBar: localeObj.pix_authentication,
            transcationState: "pin",
        })
    };
    setSmartReminder = (jsonObject,clientKey) => {
        let deeplink_type;
        if(androidApiCalls.checkIfNm()){
            deeplink_type = "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/cellularRecharge;S.motopay_launch_point=Recharge;end"
        } else {
            deeplink_type = "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/cellularRecharge;S.motopay_launch_point=Recharge;end"
        }
        let existing_data;
        let index = 0;
        existing_data = androidApiCalls.getFromPrefs(Utils.CELLULAR_RECHARGE)

        var originalDate = new Date();
        let dueDate = new Date(originalDate.getTime() + (30 * 24 * 60 * 60 * 1000)); //Add days in milliseconds next 30 days
        let reminderDate = new Date(originalDate.getTime() + (20 * 24 * 60 * 60 * 1000)); //next 20 days is the reminder date
        let reminderObj = {};
        reminderObj["remainderType"] = "recharge";
        reminderObj["amount"] = jsonObject.amount.toString();
        reminderObj["dueDate"] = moment(dueDate).format('DD-MM-YYYY')
        reminderObj["destinationAccount"] = this.state.ddd + jsonObject.numero;
        reminderObj["deeplink"] = deeplink_type;
        reminderObj["remainderDate"] = moment(reminderDate).format('DD-MM-YYYY')
        reminderObj["clientId"] = clientKey
        if(existing_data !== ""){
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
            androidApiCalls.storeToPrefs(Utils.CELLULAR_RECHARGE,JSON.stringify(existing_data));
        } else {
            reminderObj["type_id"] = 1;
            reminderObj = [reminderObj]
            androidApiCalls.storeToPrefs(Utils.CELLULAR_RECHARGE,JSON.stringify(reminderObj));
        }
    }

    onAlert = (pin) => {
        this.setState({ transactionPin: pin });
        let jsonObject = {};
        jsonObject["provedorId"] = this.state.selectedProviderId;
        jsonObject["token"] = pin;
        jsonObject["ddd"] = "0" + this.state.ddd;
        jsonObject["numero"] = this.state.phoneNumber;
        jsonObject["amount"] = parseFloat(this.state.selectedAmount.toFixed(2));
        jsonObject["mode"] = "Cellular Recharge";

        this.showProgressDialog();
        if(this.props && this.props.location && this.props.location.state && this.props.location.state.entryPoint === "CELLULAR_RECHARGE_SMARTALERT_CLICK") {
            ImportantDetails.transactionEntryPoint = this.props.location.state.entryPoint;
        }
        arbiApiService.CompleteCelluarRecharge(jsonObject, PageNameJSON.result)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processCellularRechargeResponse(response.result);
                    if (processorResponse.success) {
                        this.onGetBalance();
                        this.hideProgressDialog();
                        this.setState(prevState => ({
                            info: {
                                ...prevState.info,
                                [localeObj.transaction_code]: processorResponse.transactionId
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                date: moment(processorResponse.date).format('DD/MM/YYYY'),
                                hour: moment(processorResponse.date).utcOffset(-3).format('HH'),
                                mins: moment(processorResponse.date).utcOffset(-1860).format('mm'),
                                fileName: "comprovante_recarga_"
                            },
                            transcationState: "result",
                            direction: "left",
                        }))
                        this.checkForInstantRewardStatus(jsonObject)
                        this.setSmartReminder(jsonObject,ImportantDetails.clientKey);
                        ImportantDetails.transactionEntryPoint = "";
                    } else {
                        ImportantDetails.transactionEntryPoint = "";
                        this.hideProgressDialog();
                    }
                } else {
                    ImportantDetails.transactionEntryPoint = "";
                    this.hideProgressDialog();
                    let jsonObj = {}
                    if ('' + response.result.code === "14202" && response.result.details === this.pinError) {
                        this.setState({ bottomSheetOpen: true })
                    } else if (response.result.details === constantObjects.EXPIRY_ERROR) {
                        this.setState({ reset: true })
                    } else {
                        jsonObj["header"] = localeObj.recharge_failure_title;
                        jsonObj["description"] = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            transcationState: "error",
                            direction: "left",
                            errorJson: jsonObj
                        })
                    }
                }
            });
    };

    checkForInstantRewardStatus = (jsonObject) => {
        try {
            setTimeout(() => {
                const gamProgramData = GamificationService.CheckForTaskCompletion(TASK_DIMO_RECHARGE_CASHOUT, jsonObject["amount"]);
                
                if (GeneralUtilities.isNotEmpty(gamProgramData)) {
                    GeneralUtilities.sendActionMetrics('RechargeComponent', constantObjects.Gamification.showInstantDialog);
                    this.setState({ gamInstantPopup: true, gamProgramData });
                }
            }, 2000);
        } catch(err) {
            Log.sDebug("Exception in checkForInstantRewardStatus " + err, "RechargeComponent")
        }
    }

    moveToReciept = () => {
        this.setState({
            transcationState: "reciept",
            direction: "left",
        })
        this.setState(prevState => ({
            info: {
                ...prevState.info,
                [localeObj.tariff]: localeObj.currency + this.state.reviewInfo["tariff"],
                [localeObj.amount]: "R$ " + NewUtilities.formatAmount(this.state.reviewInfo["amount"])
            }
        }))
    }

    onComplete = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.close);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
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

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then((balanceResponse) => {
            Log.sDebug(balanceResponse, PageNameJSON.result);
        });
    }

    onBack = () => {
        if (this.state.processing) {
            return this.openSnackBar(localeObj.no_action);
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.back);
            const {fromComponent = null, state = {}} = this.props.location;
            switch (this.state.transcationState) {
                case "inputNumber":
                    if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
                        this.getBalanceAndMovetoMain();
                    } else if (fromComponent === PageNames.GamificationComponent.program_details) {
                        return this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
                    } else {
                        if (this.state.isOnBack) {
                            this.setState({ isOnBack: false });
                            GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
                        }
                    }
                    break;
                case "getContacts":
                    // this.setState({  });
                    this.setState({
                        appBar: localeObj.phone_recharge,
                        transcationState: "inputNumber",
                        direction: "right",
                        prevState: "",
                        "ddd": "",
                        "phoneNumber": "",
                        "displayNumber": ""
                    });
                    break;
                case "operator":
                    if(this.state.prevState === "getContacts") {
                        // this.setState({ appBar: localeObj.phone_recharge });
                        this.setState({ 
                            appBar: localeObj.phone_recharge,
                            transcationState: "getContacts",
                            direction: "right"
                        });
                    } else {
                        // this.setState({ appBar: localeObj.phone_recharge });
                        this.setState({ 
                            appBar: localeObj.phone_recharge,
                            transcationState: "inputNumber",
                            direction: "right"
                        });
                    }
                     this.setState((prevValue) => ({
                            ...prevValue,
                            selectedProvider: "",
                            operatorInfo: {
                                ...prevValue.operatorInfo,
                                selectedProvider: ""
                            }
                        }))
                    break;
                case "amount":
                    // this.setState({ appBar: localeObj.phone_recharge });
                    this.setState({
                        appBar: localeObj.phone_recharge,
                        transcationState: "operator",
                        direction: "right"
                    });
                    break;
                case "review":
                    // this.setState({ appBar: localeObj.phone_recharge });
                    this.setState({
                        appBar: localeObj.phone_recharge,
                        transcationState: "amount",
                        direction: "right"
                    });
                    break;
                case "pin":
                    // this.setState({  });
                    this.setState({
                        appBar: localeObj.review_payment,
                        transcationState: "review",
                        direction: "right",
                        bottomSheetOpen: false,
                        reset: false
                    });
                    break;
                case "result":
                    if (this.state.gamInstantPopup === true) {
                        this.setState({ gamInstantPopup: false });
                        return;
                    }
                    this.OtherTransaction();
                    break;
                case "reciept":
                case "error":
                    this.onComplete();
                    break;
                default:
            }
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        arbiApiService.getUserBalance(PageNameJSON.result)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1]);
                        MetricServices.onPageTransitionStop(PageNames.sendPage, PageState.back);
                        this.props.history.replace({ pathname: "/newTransactionHistory", transition: "right", balanceData: { "balance": balance, "decimal": decimal } });
                    }
                } else {
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        this.setState({
                            snackBarOpen: true,
                            snackBarMessage: localeObj.pix_communication_issue
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            snackBarMessage: localeObj.pix_technical_issue
                        })
                    }
                }
            });
    }

    editAmount = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.edit);
        this.setState({
            transcationState: "amount",
            direction: "left",
            appBar: localeObj.phone_recharge
        })
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
    }

    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    returnErrorMessage(errorMessage) {
        let errorMessageToUser = localeObj.retry_later;
        if (errorMessage.toString() !== ERROR_IN_SERVER_RESPONSE) {
            errorMessageToUser = errorMessage.details;
        }
        return errorMessageToUser;
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.close);
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    OtherTransaction = () => {
        this.props.history.replace({ pathname: "/cellularRecharge", transition: "right" });
    }

    checkAndroidPermissions = () => {
        if (androidApiCalls.checkSelfPermission(CONTACTS_PERMISSION) === 0) {
            this.loadContacts();
        } else {
            androidApiCalls.requestPermission(CONTACTS_PERMISSION);
        }  

    }

    loadContacts = () => {
        if(GeneralUtilities.emptyValueCheck(androidApiCallsService.getContactsForRecharge())) {
            this.setState({
                snackBarOpen: true,
                snackBarMessage: localeObj.recharge_no_contacts
            })
        } else {
            let contacts = JSON.parse(androidApiCallsService.getContactsForRecharge());
            if(contacts.length === 0) {
                this.setState({
                    snackBarOpen: true,
                    snackBarMessage: localeObj.recharge_no_contacts
                })
            } else {
                let filteredAndVailidatedContacts = contacts.filter( function (item) { 
                    let formattedNumber = item.Number.replace(" ", "");
                    return (!GeneralUtilities.emptyValueCheck(item.name) && !GeneralUtilities.emptyValueCheck(item.Number) && formattedNumber.length === 11)}
                );
                let contactNames = filteredAndVailidatedContacts.map(values => values.name);
                let numberList = filteredAndVailidatedContacts.map(values => values.Number);
                this.setState({
                    transcationState: "getContacts",
                    direction: "left",
                    prevState: "getContacts",
                    contactList: numberList,
                    contactName: contactNames,
                    appBar: localeObj.phone_recharge
                })
            }
        }
    }

    closeContactsPermissionAlertDialog = () => {
        this.setState({
            contactsPermissionAlert: false
        })
    }

    render() {
        const transaction = this.state.transcationState;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div style={{ overflowX: "hidden" }}>
                {transaction !== "error" && transaction !== "reciept" && transaction !== "result" &&
                    <div>
                        <ButtonAppBar
                            header={this.state.appBar}
                            onBack={this.onBack}
                            action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "inputNumber" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "inputNumber" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "inputNumber" && <CellularPhoneNumberInput onInputNumber={this.onInputNumber} onBack={this.onBack} details={this.state.operatorInfo}
                            componentName={PageNameJSON.inputNumber} getContacts={this.checkAndroidPermissions} shouldShowContacts={this.state.showContacts}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "getContacts" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "getContacts" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "getContacts" && <SelectOption type="Recharge" header={localeObj.recharge_select_contact} confirm={this.onInputNumber}
                            componentName={PageNameJSON.institute} contactList= {this.state.contactList} contactName={this.state.contactName}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "operator" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "operator" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "operator" && <ChooseOperatorComp onInputProvider={this.onInputProvider} details={this.state.operatorInfo} onBack={this.onBack}
                            componentName={PageNameJSON.operator} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "amount" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "amount" && <ChooseRechargeAmountComp onInputAmount={this.onInputAmount} details={this.state.operatorInfo} onBack={this.onBack}
                            componentName={PageNameJSON.amount} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "review" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} back={this.editAmount}
                            btnText={localeObj.next} header={localeObj.recharging} detailHeader={localeObj.recharge_info} componentName={PageNameJSON.review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "pin" && <SetPinComponent confirm={this.onAlert} clearPassword={this.state.clearPassword} componentName={PageNameJSON.pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "result" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "result" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "result" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <div style={{ marginTop: "3rem" }}>
                                    <ImageInformationComponent header={localeObj.recharge_success_title} next={this.moveToReciept} icon={success}
                                        appBar={false} description={localeObj.recharge_success_text} btnText={localeObj.next}
                                        secBtnText={localeObj.back_home} close={this.onComplete} componentName={PageNameJSON.result} />
                                </div>
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "reciept" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "reciept" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onCancel={this.onComplete} action="cancel" inverse="true" />
                        {transaction === "reciept" && <ReceiptTemplate requiredInfo={this.state.reviewInfo} confirm={this.onComplete} info={this.state.info} recharge={true} onBack={this.onBack}
                            header={localeObj.recharge_requested} btnText={localeObj.back_home} detailHeader={localeObj.recharge_info}
                            OtherTransaction={this.OtherTransaction} componentName={PageNameJSON.reciept} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onComplete} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                {this.state.gamInstantPopup && <InstantDialogComponent gamProgramData={this.state.gamProgramData}/>}
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign:"center" }}>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
                {this.state.contactsPermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeContactsPermissionAlertDialog} />
                }
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}
CellularRechargeComponents.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
}
export default withStyles(styles)(CellularRechargeComponents);