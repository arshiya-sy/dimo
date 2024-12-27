import React from "react";
import moment from 'moment';
import 'moment/locale/pt';
import FlexView from "react-flexview";
import { CSSTransition } from 'react-transition-group';

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import PropTypes from "prop-types";
import Log from "../../../Services/Log";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import httpRequest from "../../../Services/httpRequest";
import NewUtilities from "../../../Services/NewUtilities";
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";

import InputPinPage from "../../CommonUxComponents/InputPinPage";
import ReviewTemplate from "../../CommonUxComponents/ReviewTemplate";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ReceiptTemplate from "../../CommonUxComponents/RecieptTemplate";
import AmountComponent from "../../CommonUxComponents/AmountComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import PixTransactionsDisplayComp from "../PixTransactions/PixTransactionsDisplayComp";

import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.pixMainTransactions;
var localeObj = {};

class PixTransactionsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailsObj: {},
            pixstate: "starting",
            processing: false,
            fromDate: moment().startOf('year'),
            toDate: new Date(),
            bottomSheetOpen: false,
            bottomSheetHeader: "",
            bottomSheetSubtext: "",
            receiptData: {},
            loadingText: "",
            transactionInfo: {},
            returnDetails: {},
            amountInfo: {},
            direction: "",
            reviewInfo: {},
            returnPossible: false,
            finalReceipt: {},
            finalTxnInfo: {},
            pixErrorJson: {},
            returnAmount: "",
            returnDecimal: "",
            snackBarOpen: false,
            message: "",
            isScheduledEmpty: false,
            isTransactionScheduled: false,
            isEmpty: false,
            clearPassword: false,
            pinExpiredSnackBarOpen: false,
            txn: [],
            scheduledTxn: [],
            closeBottomSheets: false,
            bottomSheet1: false,
            bottomSheet2: false,
            calender: false,
            changeScheduletoAll: false,
            fullData: []
        };
        this.txData = [];
        this.scheduledTxData = []
        this.fromDate = moment().subtract(90, 'days')
        this.toDate = new Date();
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        this.getAllTransactions();
        window.onBackPressed = () => {
            this.onBack();
        }
    }


    getAllTransactions = () => {
        this.txData = [];
        this.setState({
            pixstate: "loading",
            loadingText: localeObj.all_filter
        });
        arbiApiService.getPixTransactionHistory(this.fromDate.toISOString(), this.toDate.toISOString(), PageNameJSON.display_transactions).then(response => {
            androidApiCalls.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetPixTransactionHistoryResponse(response.result);
                if (processorResponse.success) {
                    let trasanctionData = processorResponse.txn;
                    this.txData = this.txData.concat(trasanctionData);
                    this.getScheduledTransactions("cancelled", this.fromDate.toISOString(), this.toDate.toISOString());
                } else if (processorResponse.message === 1) {
                    this.setState({
                        isEmpty: true,
                        pixstate: "display_transactions",
                    })
                }
            } else {
                let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                this.setState({
                    pixstate: "display_transactions",
                    isEmpty: true,
                    snackBarOpen: true,
                    message: errorMesaage
                })
            }
        });
    }

    getScheduledDetails = () => {
        let fromDate = this.fromDate.toISOString();
        let toDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
        this.getScheduledTransactions("scheduled", fromDate, toDate);
    }

    getScheduledTransactions = (type, from, to) => {
        if (type === "scheduled") {
            this.setState({
                pixstate: "loading",
                loadingText: localeObj.scheduled_filter
            });
        }
        arbiApiService.getPixScheduledTransactions(type, from, to, PageNameJSON.display_transactions).then(response => {
            androidApiCalls.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetPixScheduledTransactions(response.result, localeObj);
                if (processorResponse.success) {
                    if (type === "cancelled") {
                        let cancelledtrasanctionData = processorResponse.txn_cancelled;
                        this.txData = this.txData.concat(cancelledtrasanctionData);
                        this.processTransactions();
                    }
                    else if (type === "scheduled") {
                        this.setState({
                            scheduledTxn: []
                        });
                        this.scheduledTxData = [];
                        let scheduledTransactionData = processorResponse.txn_scheduled;
                        this.scheduledTxData = this.scheduledTxData.concat(scheduledTransactionData);
                        this.processScheduledTransactions();
                    }
                } else if (processorResponse.message === 1) {
                    if (type === "cancelled") {
                        this.processTransactions();
                    }
                    else if (type === "scheduled") {
                        this.setState({
                            isScheduledEmpty: true,
                            pixstate: "Schedule",
                            direction: "left"
                        })
                    }
                }
            } else {
                let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                this.setState({
                    pixstate: "display_transactions",
                    isEmpty: true,
                    snackBarOpen: true,
                    message: errorMesaage
                })
            }
        });
    }

    processTransactions = () => {
        let TransactionArray = GeneralUtilities.transactionHistoryDateOrganizer(this.txData, localeObj);
        let finalArray = TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        this.reportlogs("No PIX Transactions yet", "No Transactions to show");
        if (finalArray.length === 0) {
            this.setState({
                isEmpty: true
            })
        }

        this.setState({
            txn: [...this.state.txn, ...finalArray],
            pixstate: "display_transactions",
            direction: "left",
            isTransactionScheduled: false
        })
        return;
    }

    processScheduledTransactions = () => {
        let TransactionArray = GeneralUtilities.transactionHistoryScheduledDateOrganizer(this.scheduledTxData, localeObj);
        for (let i = 0; i < 5; i++) {
            TransactionArray[i].transactions.sort((d2, d1) => new Date(d2.date).getTime() - new Date(d1.date).getTime());
        }

        let finalArray = TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        this.reportlogs("No PIX Scheduled Transactions yet", "No Transactions to show");
        if (finalArray.length === 0) {
            this.setState({
                isScheduledEmpty: true
            })
        }

        this.setState({
            scheduledTxn: [...this.state.scheduledTxn, ...finalArray],
            pixstate: "Schedule",
            direction: "left"
        })
        return;
    }

    formReceiptData = (selectedTransaction) => {
        let receiptJson = {}
        let finalAmount = "R$"

        if (GeneralUtilities.emptyValueCheck(selectedTransaction.returnAmount)) {
            finalAmount = "R$ " + selectedTransaction.formatted_amount + "," + NewUtilities.formatDecimal(selectedTransaction.decimal)
        } else {
            finalAmount = "R$ " + selectedTransaction.returnAmount + "," + NewUtilities.formatDecimal(selectedTransaction.returnDecimal)
        }

        receiptJson["type"] = selectedTransaction.transaction;
        receiptJson["date"] = moment(selectedTransaction.date).format('DD/MM/YYYY');
        receiptJson["hour"] = moment(selectedTransaction.date).format('HH');
        receiptJson["mins"] = moment(selectedTransaction.date).format('mm');
        receiptJson["fileName"] = "comprovante_Pix_";
        receiptJson["amount"] = selectedTransaction.formatted_amount;
        receiptJson["decimal"] = selectedTransaction.decimal;

        let transactionDetails = {
            [localeObj.date]: moment(selectedTransaction.date).format('DD/MM/YYYY'),
            [localeObj.pix_type]: localeObj.pix_header,
            [localeObj.amount]: finalAmount,
            [localeObj.transaction_code]: selectedTransaction.txnId
        }

        if (selectedTransaction.newDescription) {
            transactionDetails[localeObj.pix_description] = selectedTransaction.newDescription;
        }
        if (selectedTransaction.isScheduled) {
            this.setState({
                isTransactionScheduled: true
            })
            receiptJson["recurrence"] = selectedTransaction.recurrence;
            receiptJson["scheduled_date"] = selectedTransaction.date;

            if (!GeneralUtilities.emptyValueCheck(selectedTransaction.recurrence) && selectedTransaction.recurrence > 1) {
                transactionDetails[localeObj.repeat_schedule] = selectedTransaction.recurrence + " " + GeneralUtilities.captitalizeStrings(localeObj.month_plural);
            }
        }

        if (selectedTransaction.transaction === "D") {
            let formatCpf = ImportantDetails.cpf.substring(0, 3) + "." + ImportantDetails.cpf.substring(3, 6) + "." + ImportantDetails.cpf.substring(6, 9) + "-" + ImportantDetails.cpf.substring(9, 11);

            if (selectedTransaction.isScheduled) {
                receiptJson["header"] = localeObj.you_scheduled;
            } else {
                receiptJson["header"] = localeObj.pix_you_sent;
            }
            receiptJson["receiver"] = {
                [localeObj.name]: selectedTransaction.nameOfParty,
                [localeObj.cpf]: GeneralUtilities.maskCpf(selectedTransaction.cpfOfParty),
                [localeObj.Institution]: selectedTransaction.institutionOfParty,
            }
            receiptJson["payer"] = {
                [localeObj.name]: ImportantDetails.userName,
                [localeObj.cpf]: GeneralUtilities.maskCpf(formatCpf),
                [localeObj.Institution]: localeObj.bank_name
            }
        } else {
            receiptJson["header"] = localeObj.you_received
            receiptJson["payer"] = {
                [localeObj.name]: selectedTransaction.nameOfParty,
                [localeObj.cpf]: GeneralUtilities.maskCpf(selectedTransaction.cpfOfParty),
                [localeObj.Institution]: selectedTransaction.institutionOfParty,
            }
            receiptJson["receiver"] = {
                [localeObj.name]: ImportantDetails.userName,
                [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                [localeObj.Institution]: localeObj.bank_name
            }
        }
        this.reportlogs("receipt", "Chose to view receipt");
        this.setState({
            pixstate: "show_receipt",
            direction: "left",
            receiptData: receiptJson,
            transactionInfo: transactionDetails,
            returnDetails: selectedTransaction,
            returnPossible: selectedTransaction.returnEligibility,
        })
    }

    addRecurrence = (val) => {
        if (!GeneralUtilities.emptyValueCheck(val) && val > 1) {
            this.setState(prevState => ({
                info: {
                    ...prevState.info,
                    [localeObj.repeat_schedule]: val + " " + GeneralUtilities.captitalizeStrings(localeObj.month_plural)
                },
            }))
        }
        return;
    }

    processReturn = () => {
        let amountPage = {
            "amount": this.state.returnDetails.returnAmount,
            "decimal": NewUtilities.formatDecimal(this.state.returnDetails.returnDecimal)
        }
        this.setState({
            amountInfo: amountPage,
            pixstate: "amount",
            direction: "left",
        })
    }

    onGetAmount = (amountJSON) => {
        let formatCpf = ImportantDetails.cpf.substring(0, 3) + "." + ImportantDetails.cpf.substring(3, 6) + "." + ImportantDetails.cpf.substring(6, 9) + "-" + ImportantDetails.cpf.substring(9, 11);
        let amountPage = {
            "amount": amountJSON.amount,
            "decimal": amountJSON.decimal
        }
        let reviewData = {
            "amount": amountJSON.amount,
            "decimal": amountJSON.decimal,
            "transferType": localeObj.pix_return,
            "receiver": {}
        }
        reviewData["receiver"][localeObj.name] = ImportantDetails.userName
        reviewData["receiver"][localeObj.cpf] = formatCpf
        reviewData["receiver"][localeObj.Institution] = localeObj.bank_name

        this.setState({
            returnAmount: amountJSON.amount,
            returnDecimal: amountJSON.decimal,
            reviewInfo: reviewData,
            amountInfo: amountPage,
            pixstate: "pix_review",
            direction: "left"
        })
    }

    onReviewComplete = (reviewDetails) => {
        if (reviewDetails.error) {
            this.errorHandler(reviewDetails);
        } else {
            let jsonObj = this.state.returnDetails
            jsonObj["Description"] = reviewDetails.Description;
            this.setState({
                reviewDetails: jsonObj,
                pixstate: "enter_pin",
                direction: "left"
            })
        }
    }

    processPin = (pin) => {
        if (this.state.isTransactionScheduled) {
            this.cancelScheduledTransaction(pin);
        } else if (this.state.returnPossible) {
            this.startReturn(pin);
        }
    }

    startReturn = (pin) => {
        let jsonForReturn = {
            "pin": pin,
            "description": this.state.returnDetails.Description,
            "amount": this.state.returnAmount + "." + this.state.returnDecimal,
            "endtoend": this.state.returnDetails.endToEnd
        }
        this.showProgressDialog();
        arbiApiService.processPixReturnAmount(jsonForReturn, PageNameJSON.enter_pin).then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processedResponse = ArbiResponseHandler.processPixReturnAmountResponse(response.result);
                if (processedResponse.success) {
                    this.reportlogs("PIX return", "Pix return - success ");
                    let transactionDetails = processedResponse;
                    this.createReceiptForReturn(transactionDetails);
                } else {
                    this.reportlogs("PIX return Error", "Pix return - failed ");
                    this.hideProgressDialog();
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                let jsonObj = {};
                this.hideProgressDialog();
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.errorHandler(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.openBottomSheetForWrongPasscode();
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.openBottomSheetForResetPassword();
                } else if ('' + response.result.code === "40007") {
                    jsonObj["error"] = true;
                    jsonObj["reason"] = "account_unavailable";
                    this.errorHandler(jsonObj);
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.errorHandler(errorJson);
                }
            }
        });
    }

    cancelScheduledTransaction = (pin) => {
        let jsonForCancel = {
            "pin": pin,
            "scheduleId": this.state.returnDetails.txnId
        }
        this.showProgressDialog();
        arbiApiService.cancelPixScheduledTransactions(jsonForCancel, PageNameJSON.pix_review).then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processedResponse = ArbiResponseHandler.processCancelPixScheduledTransactions(response.result);
                if (processedResponse.success) {
                    this.reportlogs("Cancel Schedule", "Pix Cancel Schedule Success");
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.cancel_schedule_success,
                    })
                    this.getScheduledDetails();
                } else {
                    this.reportlogs("Cancel Schedule", "Cancel Schedule - failed ");
                    this.hideProgressDialog();
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                let jsonObj = {};
                this.hideProgressDialog();
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.errorHandler(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.openBottomSheetForWrongPasscode();
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.openBottomSheetForResetPassword();
                } else if ('' + response.result.code === "40007") {
                    jsonObj["error"] = true;
                    jsonObj["reason"] = "account_unavailable";
                    this.errorHandler(jsonObj);
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.errorHandler(errorJson);
                }
            }
        });
    }

    onSelectPayNow = () => {
        let reviewPageJSON = {
            "amount": this.state.receiptData.amount,
            "decimal": this.state.receiptData.decimal,
            "transferType": localeObj.pix_header,
            "name": this.state.returnDetails.nameOfParty,
            "CPF": GeneralUtilities.maskCpf(this.state.returnDetails.cpfOfParty),
            "receiverInstitute": this.state.returnDetails.institutionOfParty,
        }

        let additonalInformation = {
            "isScheduled": true,
            "scheduledDate": this.state.receiptData.scheduled_date,
            "isEditSchedule": false,
            "key": this.state.returnDetails.key,
            "scheduleId": this.state.returnDetails.txnId
        }

        //Log.sDebug("Moving to Pix send component to perfrom pay now function");
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.close);
        this.props.history.replace({
            pathname: "/pixSendComponent",
            from: "pixTransactionHistory",
            reviewData: reviewPageJSON,
            additonalData: additonalInformation
        })
    }

    onSelectEditSchedule = () => {
        let reviewPageJSON = {
            "amount": this.state.receiptData.amount,
            "decimal": this.state.receiptData.decimal,
            "transferType": localeObj.pix_header,
            "name": this.state.returnDetails.nameOfParty,
            "CPF": GeneralUtilities.maskCpf(this.state.returnDetails.cpfOfParty),
            "receiverInstitute": this.state.returnDetails.institutionOfParty,
        }

        let additonalInformation = {
            "isScheduled": true,
            "scheduledDate": this.state.receiptData.scheduled_date,
            "isEditSchedule": true,
            "key": this.state.returnDetails.key,
            "scheduleId": this.state.returnDetails.txnId
        }

        //Log.sDebug("Moving to Pix send component to perfrom edit schedule function");
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.close);
        this.props.history.replace({
            pathname: "/pixSendComponent",
            from: "pixTransactionHistory",
            reviewData: reviewPageJSON,
            additonalData: additonalInformation
        })

    }

    errorHandler = (errorJson) => {
        let jsonObj = {}
        jsonObj["title"] = localeObj.pix;
        jsonObj["header"] = localeObj.pix_failed;
        switch (errorJson.reason) {
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
                jsonObj["description"] = errorJson.descriptor;
                break;
            default:
                jsonObj["description"] = errorJson.reason;
                break;
        }
        this.reportlogs("PIX return Error", errorJson.reason);
        this.setState({
            pixstate: "error",
            direction: "left",
            pixErrorJson: jsonObj
        })
    }

    createReceiptForReturn = (transactionData) => {
        let formatCpf = ImportantDetails.cpf.substring(0, 3) + "." + ImportantDetails.cpf.substring(3, 6) + "." + ImportantDetails.cpf.substring(6, 9) + "-" + ImportantDetails.cpf.substring(9, 11);
        let receiptJson = {}
        let transactionDetails = {}
        receiptJson["date"] = moment(transactionData.date).format('DD/MM/YYYY');
        receiptJson["hour"] = moment(transactionData.date).format('HH');
        receiptJson["mins"] = moment(transactionData.date).format('mm');
        receiptJson["fileName"] = "comprovante_Pix_";
        receiptJson["amount"] = this.state.returnAmount;
        receiptJson["decimal"] = this.state.returnDecimal;
        transactionDetails = {
            [localeObj.date]: moment(transactionData.date).format('DD/MM/YYYY'),
            [localeObj.pix_type]: localeObj.pix_header,
            [localeObj.amount]: "R$ " + this.state.returnAmount + ", " + this.state.returnDecimal,
            [localeObj.transaction_code]: transactionData.transactionId,
        }
        receiptJson["header"] = localeObj.pix_you_sent;
        receiptJson["receiver"] = {
            [localeObj.name]: this.state.returnDetails.nameOfParty,
            [localeObj.cpf]: GeneralUtilities.maskCpf(this.state.returnDetails.cpfOfParty),
            [localeObj.Institution]: this.state.returnDetails.institutionOfParty,
        }
        receiptJson["payer"] = {
            [localeObj.name]: ImportantDetails.userName,
            [localeObj.cpf]: GeneralUtilities.maskCpf(formatCpf),
            [localeObj.Institution]: localeObj.bank_name
        }

        this.setState({
            finalReceipt: receiptJson,
            finalTxnInfo: transactionDetails,
            direction: "left",
            pixstate: "final_receipt"
        })
    }

    openBottomSheetForWrongPasscode = () => {
        this.setState({
            bottomSheetOpen: true,
            showSubtext: true,
            bottomSheetHeader: localeObj.wrong_passcode,
            bottomSheetSubtext: localeObj.wrong_passcode_header,
            showSecondary: true,
            primarybutton: localeObj.try,
            secondarybutton: localeObj.cancel,
            showBottomLine: true,
        });
    }

    openBottomSheetForResetPassword = () => {
        this.setState({
            bottomSheetOpen: true,
            showSubtext: true,
            bottomSheetHeader: localeObj.reset_password,
            bottomSheetSubtext: localeObj.pin_expired,
            showSecondary: true,
            primarybutton: localeObj.reset_password,
            secondarybutton: localeObj.cancel,
            showBottomLine: false,
        });
    }

    openBottomSheetforCancelScheduled = () => {
        this.setState({
            bottomSheetOpen: true,
            showSecondary: true,
            showSubtext: false,
            bottomSheetHeader: localeObj.cancel_scheduled_question,
            primarybutton: localeObj.cancel_scheduled,
            secondarybutton: localeObj.keep_scheduled,
            showBottomLine: false,
        })
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.close);
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
    }

    onPrimary = () => {
        switch (this.state.bottomSheetHeader) {
            case localeObj.wrong_passcode:
                this.setState({
                    bottomSheetOpen: false,
                    clearPassword: true
                })
                break;
            case localeObj.reset_password:
                this.forgot_passcode();
                break;
            case localeObj.cancel_scheduled_question:
                this.setState({
                    bottomSheetOpen: false,
                    direction: "left",
                    pixstate: "enter_pin"
                });
                break;
            default:
                break;
        }
    }

    onBack = () => {
        this.onSecondary();
        switch (this.state.pixstate) {
            case "loading":
                this.onHandleGoToHome();
                break;
            case "display_transactions":
                if (this.state.bottomSheet1) {
                    this.setState({
                        bottomSheet1: false,
                    });
                    this.getAllTransactions();
                } else if (this.state.bottomSheet2) {
                    this.setState({
                        bottomSheet2: false
                    });
                } else if (this.state.calender) {
                    this.setState({
                        calender: false
                    });
                    this.getAllTransactions();
                } else {
                    this.onHandleGoToHome();
                }
                break;
            case "Schedule":
                if (this.state.bottomSheet1) {
                    this.setState({
                        bottomSheet1: false,
                    });
                    this.getAllTransactions();
                } else if (this.state.bottomSheet2) {
                    this.setState({
                        bottomSheet2: false
                    });
                } else if (this.state.calender) {
                    this.setState({
                        calender: false
                    });
                    this.getAllTransactions();
                } else {
                    this.onHandleGoToHome();
                }
                break;
            case "show_receipt":
                MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
                if (this.state.isTransactionScheduled) {
                    this.setState({
                        direction: "right",
                        pixstate: "Schedule",
                    });
                } else {
                    this.setState({
                        isTransactionScheduled: false,
                        pixstate: "display_transactions"
                    })
                }
                break;
            case "amount":
                MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
                this.setState({
                    direction: "right",
                    pixstate: "show_receipt"
                })
                break;
            case "pix_review":
                MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
                this.setState({
                    direction: "right",
                    pixstate: "amount"
                })
                break;
            case "enter_pin":
                MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
                if (this.state.isTransactionScheduled) {
                    this.setState({
                        direction: "right",
                        pixstate: "Schedule"
                    })
                } else {
                    this.setState({
                        direction: "right",
                        pixstate: "pix_review"
                    })
                }
                break;
            case "final_receipt":
                MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
                this.handleLaunch();
                break;
            default:
                break;
        }
    }

    multipleSelection1 = (field) => {
        this.setState({
            bottomSheet1: field
        })
    }

    multipleSelection2 = (field) => {
        this.setState({
            bottomSheet2: field
        })
    }

    CalenderState = (field) => {
        this.setState({
            calender: field
        })
    }

    changeToAll = () => {
        if (this.state.pixstate === "Schedule") {
            this.setState({
                isTransactionScheduled: false
            })
        }
    }

    handleLaunch = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.close);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    OtherTransaction = () => {
        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
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

    reportlogs = (type, message) => {
        Log.sDebug(message, "PixTransactionComponent");
    }

    onHandleGoToHome = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.close);
        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onCancel = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.cancel);
        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
    }

    render() {
        const { classes } = this.props;
        const pixState = this.state.pixstate;
        const txnData = this.state.txn;
        const schedule = this.state.scheduledTxn

        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: (pixState === "loading" && !this.state.processing ? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.pix_transaction} onBack={this.onBack} action="none" />
                    {pixState === "loading" && <PixTransactionsDisplayComp onBack={this.onBack} clickText={GeneralUtilities.emptyValueCheck(this.state.loadingText) ? localeObj.all_filter : this.state.loadingText} currentState={pixState} />}
                </div>
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "display_transactions" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} > */}
                    <div style={{ display: (pixState === "display_transactions" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={this.state.calender ? localeObj.date : localeObj.pix_transaction} onBack={this.onBack} action="none" />
                        {pixState === "display_transactions" && <PixTransactionsDisplayComp onBack={this.onBack} clickText={localeObj.all_filter} isEmpty={this.state.isEmpty} currentState={pixState} txnHist={txnData} getReceiptData={this.formReceiptData}
                            getScheduled={this.getScheduledDetails} scheduledData={schedule} isScheduledEmpty={this.state.isScheduledEmpty} bottom1={this.state.bottomSheet1} bottom2={this.state.bottomSheet2} multipleSelection1={this.multipleSelection1}
                            multipleSelection2={this.multipleSelection2} calenderState={this.CalenderState} calenderOpen={this.state.calender} changetoAll={this.changeToAll} />}
                    </div>
                {/* </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "Schedule" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} > */}
                    <div style={{ display: (pixState === "Schedule" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_transaction} onBack={this.onBack} action="none" />
                        {pixState === "Schedule" && <PixTransactionsDisplayComp onBack={this.onBack} clickText={localeObj.scheduled_filter} currentState={pixState} getReceiptData={this.formReceiptData} getScheduled={this.getScheduledDetails} scheduledData={schedule}
                            isScheduledEmpty={this.state.isScheduledEmpty} isEmpty={this.state.isEmpty} txnHist={txnData} bottom1={this.state.bottomSheet1} bottom2={this.state.bottomSheet2} multipleSelection1={this.multipleSelection1}
                            multipleSelection2={this.multipleSelection2} calenderState={this.CalenderState} calenderOpen={this.state.calender} changetoAll={this.changeToAll} />}
                    </div>
                {/* </CSSTransition> */}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "show_receipt" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "show_receipt" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onBack={this.onBack} action="none" />
                        {pixState === "show_receipt" && <ReceiptTemplate requiredInfo={this.state.receiptData} confirm={this.handleLaunch} OtherTransaction={this.OtherTransaction} info={this.state.transactionInfo} onBack={this.onBack}
                            header={this.state.receiptData.header} btnText={this.state.isTransactionScheduled ? localeObj.cancel_scheduled : localeObj.back_home} cancelSchdule={this.openBottomSheetforCancelScheduled}
                            returnText={this.state.returnPossible} returnMoney={this.processReturn} schedule={this.state.isTransactionScheduled} payNow={this.onSelectPayNow} allowScheduleEdit={this.state.isTransactionScheduled}
                            editSchedule={this.onSelectEditSchedule} componentName={PageNameJSON.show_receipt} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "amount" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "amount" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix} onBack={this.onBack} action="none" />
                        {pixState === "amount" && <AmountComponent setTransactionInfo={this.onGetAmount} requiredInfo={this.state.amountInfo} feature={"pix_return"} componentName={PageNameJSON.amount} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "pix_review" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "pix_review" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.review_payment} onBack={this.onBack} action="none" />
                        {pixState === "pix_review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.onReviewComplete}
                            header={localeObj.pix_returning} detailHeader={localeObj.source} btnText={localeObj.next} back={this.onBack}
                            componentName={PageNameJSON.pix_review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "enter_pin" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "enter_pin" && !this.state.processing ? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.pix_authentication} onBack={this.onBack} action="none" />
                        {pixState === "enter_pin" && <InputPinPage confirm={this.processPin} clearPassword={this.state.clearPassword} componentName={PageNameJSON.enter_pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "final_receipt" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "final_receipt" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onBack={this.onBack} action="none" />
                        {pixState === "final_receipt" && <ReceiptTemplate requiredInfo={this.state.finalReceipt} confirm={this.handleLaunch} info={this.state.finalTxnInfo} onBack={this.onBack}
                            header={localeObj.pix_you_sent} OtherTransaction={this.OtherTransaction} btnText={localeObj.back_home} returnMoney={this.processReturn}
                            componentName={PageNameJSON.final_receipt} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "error" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {pixState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onHandleGoToHome} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen && !this.state.processing}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomSheetHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ display: this.state.showSubtext ? "block" : "none", textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomSheetSubtext}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginTop: "1rem", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.primarybutton} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent style={{ display: this.state.showSecondary ? 'block' : 'none' }} btn_text={this.state.secondarybutton} onCheck={this.onSecondary} />
                            <div className="body2 highEmphasis" style={{ display: this.state.showBottomLine ? "block" : "none", textAlign: "center", marginTop: "1.5rem" }} onClick={this.forgot_passcode}>
                                {localeObj.forgot_passcode}
                            </div>
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

export default withStyles(styles)(PixTransactionsComponent);
PixTransactionsComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};