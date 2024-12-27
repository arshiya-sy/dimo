import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import { CSSTransition } from 'react-transition-group';

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import httpRequest from "../../Services/httpRequest";
import constantObjects from "../../Services/Constants";
import NewUtilities from "../../Services/NewUtilities";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import InputPinPage from "../CommonUxComponents/InputPinPage";
import CalenderPicker from "../CommonUxComponents/CalenderPicker";
import ReviewTemplate from "../CommonUxComponents/ReviewTemplate";
import RecieptTemplate from "../CommonUxComponents/RecieptTemplate";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';

import InstantDialogComponent from "../GamificationComponent/RewardComponents/InstantDialogComponent";
import GamificationService from "../../Services/Gamification/GamificationService";
import { TASK_DIMO_BOLETO_CASHOUT } from "../../Services/Gamification/GamificationTerms"
import Utils from '../EngageCardComponent/Utils';
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.boletoComponent;
const componentName = "BOLETO MAIN COMPONENT"
var localeObj = {};

class BoletoComp extends React.Component {

    constructor(props) {
        super(props);
        this.styles = {
            outerStyle: {
                width: "100%",
            },
        }
        this.state = {
            transcationState: "getDetails",
            payload: props.location.state,
            details: {},
            info: {},
            transactionCode: "",
            isFromTransactionHistory: false,
            isEditSchedule: false,
            header: "",
            direction: "",
            clearPassword: false,
            errorJson: {},
            isScheduled: false,
            scheduledDate: new Date(),
            scheduleOptions: [],
            balance: -1,
            decimal: "",
            pinExpiredSnackBarOpen: false,
            hasDateChanged: false,
            gamInstantPopup: false,
            gamProgramData: {},
            fromCalender: false,
            fromEditSchedule: false
        };
        this.accountKey = "";
        this.minSheduledDate = new Date();

        this.onCompleteHandler = this.onCompleteHandler.bind(this);
        this.complete = this.complete.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            if (this.state.open) {
                this.setState({ open: false });
                return;
            } else {
                this.back();
            }
        }

        if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
            this.setState({
                isFromTransactionHistory: true,
                isEditSchedule: this.state.payload.isEditSchedule
            });
        }

        this.showProgressDialog();
        ArbiApiService.getBoletoDetails(this.state.payload, componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processGetBoletoDetails(response.result, localeObj);
                if (processedDetails.success) {
                    this.setState({
                        details: processedDetails.boletoInformation,
                        scheduleOptions: [
                            { "name": localeObj.send_now, "value": 0 },
                            { "name": localeObj.schedule_transfer, "value": 1 }],
                        maxSheduledDate: moment(processedDetails.boletoInformation.dueDate).toISOString()
                    });
                    this.fetchTariff(processedDetails.boletoInformation);
                } else {
                    this.hideProgressDialog();
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.hideProgressDialog();
                let errorObj = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorObj);
            }
        });
    }

    complete = () => {
        const { fromComponent = null, state = {} } = this.props?.location;

        if (fromComponent === PageNames.GamificationComponent.program_details) {
            return this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
        }

        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
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

    fetchTariff = (boletoInfo) => {
        let jsonObject = {};
        jsonObject["amount"] = parseFloat(boletoInfo["amount"] + "." + boletoInfo["decimal"]);
        jsonObject["code"] = 4009; // Boleto payment code
        ArbiApiService.getTariff(jsonObject, PageNameJSON.boletoLoad).then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse.success) {
                    if (this.state.isEditSchedule) {
                        boletoInfo["tariff"] = processorResponse.tariff;
                        boletoInfo["scheduled"] = true;
                        boletoInfo["scheduledReview"] = true;
                        boletoInfo["scheduledDate"] = moment(this.state.payload.scheduleDate).format("DD/MM/YYYY");
                        boletoInfo["scheduleNoFormat"] = moment(this.state.payload.scheduleDate).toISOString();
                        boletoInfo["recurrence"] = 1;
                    } else {
                        boletoInfo["tariff"] = processorResponse.tariff;
                        boletoInfo["allowSchedule"] = true;
                        boletoInfo["scheduledReview"] = false;
                        boletoInfo["scheduled"] = false;
                    }
                    this.checkDayOfWeek(boletoInfo)
                } else {
                    let jsonObj = {};
                    jsonObj["error"] = true;
                    jsonObj["reason"] = "tariff_fetch_failed";
                    this.setTransactionInfo(jsonObj);
                }
            } else {
                this.setState({
                    direction: "left",
                    transcationState: "boletoLoad",
                    header: localeObj.review_payment,
                });
            }
        });
    }

    checkDayOfWeek = (boletoInfo) => {
        let transactionData = boletoInfo;
        if ((moment().day() === 0 || moment().day() === 6) || moment().hour() >= 17) {
            let scheduledDate = moment();
            this.setState({
                hasDateChanged: true
            });
            if (moment().day() === 0) {
                //Log.sDebug("Day is Sunday, Hence scheduled Boleto for Monday " + scheduledDate , componentName);
                scheduledDate = moment().add(1, 'day');
            } else if (moment().day() === 6) {
                //Log.sDebug("Day is Saturday, Hence scheduled Boleto for Monday " + scheduledDate, componentName);
                scheduledDate = moment().add(2, 'days');
            } else if (moment().hour() >= 17) {
                if (moment().add(1, 'day').day() === 0) {
                    //Log.sDebug("Time is more than 5pm and Day is Sunday, Hence scheduled Boleto for Monday " + scheduledDate, componentName);
                    scheduledDate = moment().add(2, 'days');
                } else if (moment().add(1, 'day').day() === 6) {
                    //Log.sDebug("Time is more than 5pm and Day is Saturday, Hence scheduled Boleto for Monday " + scheduledDate, componentName);
                    scheduledDate = moment().add(3, 'days');
                } else {
                    //Log.sDebug("Time is more than 5pm, Hence scheduled boleto for next day " + scheduledDate, componentName);
                    scheduledDate = moment().add(1, 'day');
                }
            }
            transactionData["scheduled"] = true;
            transactionData["scheduledReview"] = true;
            transactionData["scheduledDate"] = moment(scheduledDate).format("DD/MM/YYYY");
            transactionData["scheduleNoFormat"] = moment(scheduledDate).toISOString();
            transactionData["recurrence"] = 1;


            if (this.state.isFromTransactionHistory) {
                this.setState({
                    isEditSchedule: true
                })
            }
            //Log.sDebug("User selected Paynow/Edit during non banking hours. User can only edit the schedule now", componentName);
            this.setState({
                transcationState: "boletoScheduleReview",
                direction: "left",
                header: localeObj.review_payment,
                details: transactionData
            });
        } else {
            if (this.state.isEditSchedule) {
                this.setState({
                    scheduleDate: transactionData["scheduleNoFormat"],
                    transcationState: "select_date",
                    header: localeObj.date,
                    direction: "left",
                });
            } else {
                transactionData["scheduled"] = false;
                transactionData["scheduledReview"] = false;
                this.setState({
                    scheduleDate: transactionData["scheduleNoFormat"],
                    transcationState: "boletoLoad",
                    direction: "left",
                    header: localeObj.review_payment,
                    details: transactionData
                });
            }
        }
    }


    setTransactionInfo = (transactionInfo) => {
        if (transactionInfo && transactionInfo.error) {
            let jsonObj = {}
            jsonObj["title"] = localeObj.pay;
            jsonObj["header"] = localeObj.boleto_failed;
            switch (transactionInfo && transactionInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "tariff_fetch_failed":
                    jsonObj["description"] = localeObj.tariff_failed;
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
                case "unverified_balance":
                    jsonObj["description"] = localeObj.balance_unverified;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = transactionInfo.reason;
                    break;
            }
            this.setState({
                transcationState: "error",
                direction: "left",
                header: "Error",
                errorJson: jsonObj
            })
        } else {
            switch (this.state.transcationState) {
                case "boletoLoad":
                    this.handleReviewActions(transactionInfo);
                    break;
                case "select_date":
                    if (moment(transactionInfo.date).isSame(moment(this.state.today), 'day')) {
                        let transactionJSON = this.state.details;
                        transactionJSON["scheduled"] = false;
                        if (this.state.isFromTransactionHistory && this.state.payload.isEditSchedule) {
                            this.setState({
                                isEditSchedule: false
                            });
                        }
                        this.checkDayOfWeek(transactionJSON);
                    } else {
                        if (this.state.isFromTransactionHistory && !this.state.payload.isEditSchedule) {
                            this.setState({
                                isEditSchedule: true
                            });
                        }
                        let transactionJSON = this.state.details;
                        transactionJSON["scheduled"] = true;
                        transactionJSON["scheduledReview"] = true;
                        transactionJSON["scheduledDate"] = moment(transactionInfo.date).format("DD/MM/YYYY");
                        transactionJSON["scheduleNoFormat"] = moment(transactionInfo.date).toISOString();
                        transactionJSON["recurrence"] = 1;
                        this.setState({
                            scheduledDate: transactionInfo.date,
                            details: transactionJSON,
                            direction: "left",
                            transcationState: "boletoScheduleReview",
                            header: localeObj.review_payment,
                            fromEditSchedule: true
                        });
                    }
                    break;
                case "boletoScheduleReview":
                    this.handleReviewActions(transactionInfo);
                    break;
                case "pin":
                    if (!this.state.processing) {
                        this.handleFinalPayment(transactionInfo);
                    }
                    break;
                default: break;
            }
        }
    }

    handleReviewActions = (transactionInfo) => {
        if (transactionInfo.editDate) {
            this.setState({
                transcationState: "select_date",
                header: localeObj.date,
                direction: "left"
            });
        } else {
            this.showProgressDialog();
            ArbiApiService.getUserBalance(PageNameJSON.boletoScheduleReview)
                .then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                        if (processorResponse.success) {
                            if (parseFloat(this.state.details["amount"] + "." + this.state.details["decimal"]) <= parseFloat(processorResponse.balance)) {
                                let jsonObject = {};
                                Object.keys(transactionInfo).forEach((key) => {
                                    jsonObject[key] = transactionInfo[key];
                                })
                                delete jsonObject["editDate"]
                                this.setState({
                                    transcationState: "pin",
                                    direction: "left",
                                    header: localeObj.pix_authentication,
                                    info: jsonObject
                                });
                            } else {
                                let jsonObject = {};
                                Object.keys(transactionInfo).forEach((key) => {
                                    jsonObject[key] = transactionInfo[key];
                                })
                                delete jsonObject["editDate"]
                                this.setState({
                                    info: jsonObject
                                })
                                this.onLowBalance();
                            }
                        } else {
                            let jsonObj = {};
                            jsonObj["error"] = true;
                            jsonObj["reason"] = "unverified_balance";
                            this.setTransactionInfo(jsonObj);
                        }
                    } else {
                        let jsonObj = {};
                        jsonObj["error"] = true;
                        jsonObj["reason"] = "unverified_balance";
                        this.setTransactionInfo(jsonObj);
                    }
                });
        }
    }

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then((balanceResponse) => {
            Log.sDebug(balanceResponse, PageNameJSON.result);
        });
    }

    handleFinalPayment = (pin) => {
        let jsonObject = {};
        jsonObject["pin"] = pin;
        jsonObject["digitableLine"] = this.state.details["digitableLine"];
        jsonObject["amount"] = this.state.details["payableAmount"];
        if (!this.state.isFromTransactionHistory && this.state.details.scheduled) {
            //Log.sDebug("Transaction is being scheduled for a different Day", componentName);
            jsonObject["scheduledDate"] = this.state.details["scheduleNoFormat"];
            this.onScheduleBoleto(jsonObject);
        } else if (this.state.isFromTransactionHistory) {
            if (this.state.isEditSchedule) {
                //Log.sDebug("Scheduled Transaction is being edited for different Day", componentName);
                let editJSON = {
                    "pin": pin,
                    "txnId": this.state.payload.scheduleId,
                    "sendDate": this.state.details["scheduleNoFormat"]
                }
                this.onAlterBoleto(editJSON);
            } else {
                //Log.sDebug("Scheduled Transaction is being paid immediately", componentName);
                let cancelJSON = {
                    "pin": pin,
                    "scheduleId": this.state.payload.scheduleId
                }
                this.cancelScheduledBoletoTransaction(cancelJSON, jsonObject);
            }
        } else {
            //Log.sDebug("Immediate pay has been chosen by the user", componentName);
            this.onCompleteHandler(jsonObject);
        }
    }

    cancelScheduledBoletoTransaction = (jsonForCancel, boletoData) => {
        this.showProgressDialog();
        ArbiApiService.cancelBoletoScheduledTransactions(jsonForCancel, PageNameJSON.success_immediate).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processCancelBoletoScheduledTransactions(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "Boleto Cancel Schedule Success", componentName);
                    this.onCompleteHandler(boletoData);
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ",componentName);
                    this.hideProgressDialog();
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: errorMesaage
                    });
                }
            } else {
                this.hanldeBoletoError(response);
            }
        });
    }
    setSmartReminder = (boletoData, clientKey) => {
        let deeplink_type;
        if (androidApiCalls.checkIfNm()) {
            deeplink_type = "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FnewWalletLaunch;S.motopay_addInfo=%7B%22cameraActions%22%3A%22Boleto%22%7D;end"
        } else {
            deeplink_type = "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FnewWalletLaunch;S.motopay_url=%2FnewWalletLaunch;S.motopay_addInfo=%7B%22cameraActions%22%3A%22Boleto%22%7D;end"
        }
        let existing_data;
        let index = 0;
        existing_data = androidApiCalls.getFromPrefs(Utils.BOLETO_PAYMENT);
        let dueDate = new Date(new Date(boletoData.receiver["Due Date"].split("/").reverse().join("-")).getTime() + (30 * 24 * 60 * 60 * 1000)); //30 days after the due date
        let reminderDate = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000); //3 days prior to the calculated due date
        let reminderObj = {};
        reminderObj["remainderType"] = "boleto";
        reminderObj["amount"] = parseFloat(boletoData["amount"] + "." + boletoData["decimal"]).toString();
        reminderObj["dueDate"] = moment(dueDate).utcOffset('+05:30').format('DD-MM-YYYY');
        reminderObj["destinationAccount"] = boletoData.receiver.Beneficiary;
        reminderObj["deeplink"] = deeplink_type;
        reminderObj["remainderDate"] = moment(reminderDate).utcOffset('+05:30').format('DD-MM-YYYY');
        reminderObj["clientId"] = clientKey;
        if (existing_data !== "") {
            existing_data = JSON.parse(existing_data);
            if (existing_data.length >= 5) {    //to delete oldest entry
                existing_data = existing_data.slice(-4)
                for (let i = 0; i < existing_data.length; i++) {
                    existing_data[i].type_id = i + 1;
                }
            }
            index = existing_data.length + 1;
            reminderObj["type_id"] = index;
            reminderObj = [reminderObj]
            existing_data = existing_data.concat(reminderObj);
            androidApiCalls.storeToPrefs(Utils.BOLETO_PAYMENT, JSON.stringify(existing_data));
        } else {
            reminderObj["type_id"] = 1;
            reminderObj = [reminderObj]
            androidApiCalls.storeToPrefs(Utils.BOLETO_PAYMENT, JSON.stringify(reminderObj));
        }
    }

    onCompleteHandler = (boletoData) => {
        this.showProgressDialog();
        if(this.props && this.props.location && this.props.location.state && this.props.location.state.entryPoint === "BOLETO_BILL_PAYMENT_SMARTALERT_CLICK") {
            ImportantDetails.transactionEntryPoint = this.props.location.state.entryPoint;
        }
        ArbiApiService.payBoleto(boletoData, PageNameJSON.success_immediate).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processPayBoletoApi(response.result);
                if (processedResponse.success) {
                    this.onGetBalance();
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.tariff]: localeObj.currency + this.state.details["tariff"],
                            [localeObj.transaction_code]: processedResponse.transactionId
                        },
                        details: {
                            ...prevState.details,
                            date: moment(processedResponse.date).format('DD/MM/YYYY'),
                            hour: moment(processedResponse.date).format('HH'),
                            mins: moment(processedResponse.date).format('mm'),
                            fileName: "comprovante_pagamento_"
                        },
                        transcationState: "success",
                        direction: "left",
                    }))
                    let receiptDetails = this.state.details;
                    delete receiptDetails.receiver[localeObj.payment_time]
                    this.setState({
                        details: receiptDetails
                    })
                    this.checkForInstantRewardStatus(boletoData)
                    this.setSmartReminder(this.state.details, ImportantDetails.clientKey);
                    ImportantDetails.transactionEntryPoint = "";
                } else {
                    ImportantDetails.transactionEntryPoint = "";
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                ImportantDetails.transactionEntryPoint = "";
                this.hanldeBoletoError(response);
            }
        });
    }

    checkForInstantRewardStatus = (jsonObject) => {
        try {
            setTimeout(() => {
                const gamProgramData = GamificationService.CheckForTaskCompletion(TASK_DIMO_BOLETO_CASHOUT, jsonObject["amount"]);

                if (GeneralUtilities.isNotEmpty(gamProgramData)) {
                    GeneralUtilities.sendActionMetrics(componentName, constantObjects.Gamification.showInstantDialog);
                    this.setState({ gamInstantPopup: true, gamProgramData });
                }
            }, 2000);
        } catch (err) {
            Log.sDebug("Exception in checkForInstantRewardStatus " + err, componentName)
        }
    }

    onScheduleBoleto = (boletoData) => {
        this.showProgressDialog();
        ArbiApiService.scheduleBoletoPayment(boletoData, PageNameJSON.success_schedule).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processScheduleBoletoPaymentResponse(response.result);
                if (processedResponse.success) {
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.tariff]: localeObj.currency + this.state.details["tariff"],
                            [localeObj.transaction_code]: processedResponse.transactionId
                        },
                        details: {
                            ...prevState.details,
                            scheduled_date: this.state.details.scheduleNoFormat,
                            recurrence: 1,
                            date: moment(processedResponse.date).format('DD/MM/YYYY'),
                            hour: moment(processedResponse.date).format('HH'),
                            mins: moment(processedResponse.date).format('mm'),
                            fileName: "comprovante_pagamento_"
                        },
                        transcationState: "success",
                        direction: "left",
                    }))
                    let receiptDetails = this.state.details;
                    delete receiptDetails.receiver[localeObj.payment_time]
                    let txnInfo = this.state.info
                    delete txnInfo["editDate"]
                    this.setState({
                        details: receiptDetails,
                        info: txnInfo
                    })
                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.hanldeBoletoError(response);
            }
        });
    }

    onAlterBoleto = (boletoData) => {
        this.showProgressDialog();
        ArbiApiService.editScheduledBoleto(boletoData, PageNameJSON.boletoScheduleReview).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processEditScheduledBoletoResponse(response.result);
                if (processedResponse.success) {
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.tariff]: localeObj.currency + this.state.details["tariff"],
                            [localeObj.transaction_code]: processedResponse.transactionId
                        },
                        details: {
                            ...prevState.details,
                            scheduled_date: this.state.details.scheduleNoFormat,
                            recurrence: 1,
                            date: moment(processedResponse.date).format('DD/MM/YYYY'),
                            hour: moment(processedResponse.date).format('HH'),
                            mins: moment(processedResponse.date).format('mm'),
                            fileName: "comprovante_pagamento_"
                        },
                        transcationState: "success",
                        direction: "left",
                    }))
                    let receiptDetails = this.state.details;
                    let txnInfo = this.state.info
                    delete receiptDetails.receiver[localeObj.payment_time]
                    delete txnInfo["editDate"]
                    this.setState({
                        details: receiptDetails,
                        info: txnInfo
                    })
                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.hanldeBoletoError(response);
            }
        });
    }

    hanldeBoletoError = (response) => {
        let jsonObj = {};
        if ('' + response.result.code === "10007") {
            this.onForgotPassword();
        } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
            this.onReset();
        } else if ('' + response.result.code === "40007") {
            jsonObj["error"] = true;
            jsonObj["reason"] = "account_unavailable";
            this.setTransactionInfo(jsonObj);
        } else {
            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
            this.setTransactionInfo(errorJson);
        }
    }

    onReset = () => {
        this.setState({
            open: true,
            bottomSheetHeader: localeObj.reset_password,
            bottomSheetSubtext: localeObj.pin_expired,
            button1text: localeObj.reset_password,
            showButton2: false,
            button2text: localeObj.cancel,
            showForgot: false,
        })
    }

    onForgotPassword = () => {
        this.setState({
            open: true,
            bottomSheetHeader: localeObj.wrong_passcode,
            bottomSheetSubtext: localeObj.wrong_passcode_header,
            button1text: localeObj.try,
            showButton2: true,
            button2text: localeObj.cancel,
            showForgot: true,
        })
    }

    onLowBalance = () => {
        this.setState({
            open: true,
            bottomSheetHeader: localeObj.insufficient_balance,
            bottomSheetSubtext: localeObj.schedule_outofbound,
            button1text: localeObj.schedule_proceed,
            showButton2: true,
            button2text: localeObj.cancel
        })
    }

    processNext = () => {
        if (this.state.bottomSheetHeader === localeObj.reset_password) {
            this.onForgot();
        } else if (this.state.bottomSheetHeader === localeObj.wrong_passcode) {
            this.onPrimary();
        } else {
            this.setState({
                open: false,
                transcationState: "pin",
                direction: "left",
                header: localeObj.pix_authentication
            });
        }
    }

    onForgot = () => {
        this.setState({
            open: false,
            reset: false
        })
        let pageNameForBackKey = this.processPageName();
        MetricServices.onPageTransitionStop(pageNameForBackKey, PageState.close);
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    onPressCancel = () => {
        this.setState({ open: false })
    }

    onPrimary = () => {
        this.setState({
            open: false,
            clearPassword: true
        })
    }

    OtherTransaction = () => {
        if (this.state.isFromTransactionHistory) {
            this.getBalanceAndMovetoMain();
        } else {
            if (GeneralUtilities.getBackPressTracking() === "AllServices") {
                GeneralUtilities.setBackPressTracking("");
                this.props.history.replace({ pathname: "/allServices", transition: "right", otherTransaction: "Boleto" });
            } else {
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right", otherTransaction: "Boleto" });
            }
        }
    }

    rescan = () => {
        let pageNameForBackKey = this.processPageName();
        MetricServices.onPageTransitionStop(pageNameForBackKey, PageState.retake);
        this.props.history.replace({
            pathname: '/newWalletLaunch',
            scanBoleto: true,
            transition: "right"
        });
    }

    back = () => {
        if (this.state.processing) {
            return this.setState({
                pinExpiredSnackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            let pageNameForBackKey = this.processPageName();
            MetricServices.onPageTransitionStop(pageNameForBackKey, PageState.back);
            switch (this.state.transcationState) {
                case "getDetails":
                case "boletoScheduleReview":
                    this.complete();
                    break;
                case "boletoLoad":
                    this.complete();
                    break;
                case "select_date":
                    if (this.state.isFromTransactionHistory && this.state.payload.isEditSchedule) {
                        this.getBalanceAndMovetoMain();
                    } else {
                        MetricServices.onPageTransitionStart(PageNameJSON.transaction_schedule);
                        return this.setState({
                            transcationState: "boletoLoad",
                            direction: "right",
                            header: localeObj.review_payment,
                            fromCalender: true
                        });
                    }
                    break;
                case "pin":
                    if (this.state.details.scheduled) {
                        return this.setState({
                            transcationState: "boletoScheduleReview",
                            direction: "right",
                            header: localeObj.review_payment,
                        });
                    } else {
                        return this.setState({
                            transcationState: "boletoLoad",
                            direction: "right",
                            header: localeObj.review_payment,
                        });
                    }
                case "error":
                    return this.complete();
                case "success":
                    if (this.state.gamInstantPopup === true) {
                        this.setState({ gamInstantPopup: false });
                        return;
                    }
                    return this.complete();
                default: break;
            }
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(PageNameJSON.success_immediate)
            .then(response => {
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
                    let jsonObj = {};
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = "communication_issue"
                        this.setTransactionInfo(jsonObj);
                    } else {
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = response.status !== 504 ? "technical_issue" : "time_limit_exceeded"
                        this.setTransactionInfo(jsonObj);
                    }
                }
            });
    }

    processPageName = () => {
        //Log.sDebug("Processing Page Name for meterics", componentName);
        let pageName = "";
        switch (this.state.transcationState) {
            case "pin":
                pageName = this.state.details.scheduled ? PageNameJSON.pin_schedule : PageNameJSON.pin_immediate;
                break;
            case "success":
                pageName = this.state.details.scheduled ? PageNameJSON.success_schedule : PageNameJSON.success_immediate;
                break;
            default:
                pageName = PageNameJSON[this.state.transcationState];
                break;
        }
        return pageName;
    }

    render() {
        const transaction = this.state.transcationState;
        const { classes } = this.props;
        return (
            <div style={{ overflowX: "hidden" }}>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "boletoLoad" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "boletoLoad" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={this.state.header} onBack={this.back} action="none" />
                        {transaction === "boletoLoad" && <ReviewTemplate requiredInfo={this.state.details} setTransactionInfo={this.setTransactionInfo}
                            header={localeObj.paying} detailHeader={localeObj.boleto_info} btnText={this.state.fromCalender && this.state.fromEditSchedule ? localeObj.confirm_schedule : localeObj.start_payment}
                            componentName={PageNameJSON.boletoLoad} dateChange={this.state.hasDateChanged ? this.state.details.scheduleNoFormat : ""} showScheduleOption={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "select_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "select_date" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "select_date" && <CalenderPicker value={this.state.scheduledDate} minDate={this.minSheduledDate} maxDate={this.state.maxSheduledDate}
                            confirm={this.setTransactionInfo} header={localeObj.select_date_boleto} isSchedule={true} regular={false} primaryButtonText={localeObj.next}
                            shouldDisableWeekend={true} componentName={PageNameJSON.select_date} subtxt={localeObj.calender_subtext} fromBoleto={true} onBack={this.back} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "boletoScheduleReview" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "boletoScheduleReview" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={this.state.header} onBack={this.back} action="none" />
                        {transaction === "boletoScheduleReview" && <ReviewTemplate requiredInfo={this.state.details} setTransactionInfo={this.setTransactionInfo}
                            header={localeObj.paying} detailHeader={localeObj.boleto_info} btnText={localeObj.confirm_schedule} showScheduleOption={false}
                            componentName={PageNameJSON.boletoScheduleReview} dateChange={GeneralUtilities.emptyValueCheck(this.state.details.scheduleNoFormat) ? "" : this.state.details.scheduleNoFormat} fromBoleto={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={this.state.header} onBack={this.back} action="none" />
                        {transaction === "pin" && <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword}
                            componentName={this.state.details.scheduled ? PageNameJSON.pin_schedule : PageNameJSON.pin_immediate} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "success" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onCancel={this.back} action="cancel" inverse="true" />
                        {transaction === "success" && <RecieptTemplate requiredInfo={this.state.details} info={this.state.info} confirm={this.complete} onBack={this.back}
                            header={this.state.details.scheduledReview ? localeObj.you_scheduled : localeObj.paid} OtherTransaction={this.OtherTransaction}
                            schedule={this.state.details.scheduledReview} btnText={localeObj.back_home} componentName={this.state.details.scheduled ? PageNameJSON.success_schedule : PageNameJSON.success_schedule} fromBoleto={true} />}
                        {this.state.gamInstantPopup && <InstantDialogComponent gamProgramData={this.state.gamProgramData} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing && !this.state.open ? 'block' : 'none' }}>
                    <ButtonAppBar header={(this.state.transcationState === "pin") ? localeObj.verifying_loader : ""} onBack={this.back} action="none" />
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.complete} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.pinExpiredSnackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomSheetHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomSheetSubtext}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.button1text} onCheck={this.processNext} />
                            <SecondaryButtonComponent style={{ display: this.state.showButton2 ? "block" : "none" }} btn_text={this.state.button2text} onCheck={this.onPressCancel} />
                            <div className="body2 highEmphasis" style={{ display: this.state.showForgot ? "block" : "none", textAlign: "center", marginTop: "1.5rem" }} onClick={this.onForgot}>
                                {localeObj.forgot_passcode}
                            </div>
                        </div>
                    </Drawer>
                </div>
            </div >
        );
    }

}


BoletoComp.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(BoletoComp);

