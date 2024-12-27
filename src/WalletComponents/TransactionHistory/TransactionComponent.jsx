import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import FlexView from "react-flexview";
import InputThemes from "../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import httpRequest from "../../Services/httpRequest";
import constantObjects from "../../Services/Constants";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import isTransactionPresent from "../../Services/TransactionTypeFilter";
import arbiApiService from "../../Services/ArbiApiService";
import InputPin from "../CommonUxComponents/InputPinPage";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ReceiptTemplate from "../CommonUxComponents/RecieptTemplate";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";

import DisplayTransactions from "../TransactionHistory/DisplayTransactions";
import PeriodSelection from "./PeriodSelection";
import moment from 'moment';
import 'moment/locale/pt';

import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import NewUtilities from "../../Services/NewUtilities";
import PageNames from "../../Services/PageNames";
import ChatBotUtils from "../NewUserProfileComponents/ChatComponents/ChatBotUtils";

var localeObj = {};
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const CAMERA_PERMISSION = "android.permission.CAMERA";
const ALL_OPERATIONS = "All operations";

class TransactionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            txn: [],
            boleto: [],
            header: "",
            authCode: "",
            message: "",
            filterText: "",
            typeOfTransactionID: "",
            typeOfTransaction: "",
            detailsObj: {},
            allDetails: {},
            pageDetails: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            receiptData: {},
            transactionInfo: {},
            scheduleDetails: {},
            storeTransactionData: {},
            isEmpty: false,
            calender: false,
            setReturn: false,
            isChatBot: false,
            processing: false,
            snackBarOpen: false,
            bottomSheetOpen: false,
            bottomSheet1: false,
            bottomSheet2: false,
            isBoletoEmpty: false,
            clearPassword: false,
            alertBackToFilter: false,
            shouldShowUnuthorized: false,
            isTransactionScheduled: false,
            showCustomTransactions: false,
            customPeriodSelectionTxns: false,
            toDate: new Date(),
            currentPage: 1,
            transactionState: "start",
            filterSelected: ALL_OPERATIONS,
            fromDate: moment().startOf('year'),
            balance: this.props.location?.balanceData?.balance ?? ImportantDetails.walletBalance,
            decimal: this.props.location?.balanceData?.decimal ?? ImportantDetails.walletDecimal,
            isOnBack: true,
            isClickable: false
        };

        this.txData = [];
        this.boletoData = [];
        this.fromDate = moment().subtract(90, 'days')
        this.fromDateBoleto = moment().subtract(1, 'year')
        this.toDate = new Date();
    }

    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        androidApiCalls.enablePullToRefresh(false);
        if (this.props.location && this.props.location.from) {
            if (this.props.location.from === "tedSchedule" || this.props.location.from === "pixSchedule") {
                this.setState({
                    transactionState: "display_transactions",
                    filterSelected: "Schedule",
                    moveToSchedule: true,
                    showCustomTransactions: false,
                    filterText: localeObj.scheduled_filter
                })
            } else if (this.props.location.from === "chatBot" && this.props.location.feature === "ReportUnauth") {
                this.setState({
                    shouldShowUnuthorized: true,
                    isChatBot: true
                })
                this.getTotalTransactions();
            }
        } else {
            this.getTotalTransactions();
        }

        window.onBackPressed = () => {
            this.onBack()
        }
        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === false) {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            cameraAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.allow_camera);
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.allow_camera
                        })
                    }
                }
            }
        }
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }

    getTotalTransactions = () => {
        this.txData = [];
        this.boletoData = [];
        if (this.state.currentPage === 1) {
            this.setState({
                txn: []
            })
        }
        this.setState({
            moveToSchedule: false,
            transactionState: "loading",
            filterText: ALL_OPERATIONS,
            boleto: []
        })
        this.getPagewiseTransactions(this.state.currentPage);

        arbiApiService.getAllBoletos(this.fromDateBoleto.toISOString(), this.toDate.toISOString(), PageNames.mainTransactionHistory.display_transactions)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBoletoHistoryApiResponse(response.result, localeObj);
                    if (processorResponse.success) {
                        this.boletoData = this.boletoData.concat(processorResponse.boletoData);
                        if (this.boletoData.length !== 0) {
                            this.processBoletos();
                        } else {
                            this.setState({
                                isBoletoEmpty: true
                            })
                        }
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                    }
                } else {
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            })
    }

    fetchNextPageNumber = () => {
        let pageNumber = parseInt(this.state.currentPage) + 1;
        if (this.state.txn.length >= parseInt(pageNumber)) {
            this.setState({
                currentPage: this.state.currentPage + 1,
                transactionState: "display_transactions",
                showCustomTransactions: false
            })
        } else {
            this.getPagewiseTransactions(pageNumber)
        }
    }

    fetchPrevPage = () => {
        this.setState({
            currentPage: this.state.currentPage - 1,
            transactionState: "display_transactions",
            showCustomTransactions: false
        })
    }

    resetCurrentPage = () => {
        this.setState({
            currentPage: 1,
            transactionState: "display_transactions",
            showCustomTransactions: false
        })
    }

    getPagewiseTransactions = (pageNumber) => {
        this.setState({
            moveToSchedule: false,
            transactionState: "loading",
            filterText: ALL_OPERATIONS,
        })
        arbiApiService.getTransactionHistory(this.fromDate.toISOString(), this.toDate.toISOString(), "all", pageNumber, PageNames.mainTransactionHistory.display_transactions)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
                    if (processorResponse.success) {
                        this.txData = processorResponse.transactionData;
                        this.setState({
                            pageDetails: processorResponse.paginationData
                        })
                        if (pageNumber <= this.state.pageDetails.maxPageNumber) {
                            this.setState({
                                currentPage: pageNumber
                            })
                        }
                        this.processTransactions();
                    } else {
                        let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            snackBarOpen: true,
                            message: errorMesaage
                        })
                    }
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }
            })
    }

    getPagewiseTransactionsForPeriod = (pageNumber, stDate, edDate) => {
        this.setState({
            moveToSchedule: false,
            transactionState: "loading",
            filterText: ALL_OPERATIONS,
        });
        arbiApiService.getTransactionHistory(stDate, edDate, "all", pageNumber, PageNames.mainTransactionHistory.display_transactions)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
                    if (processorResponse.success) {
                        this.txData = processorResponse.transactionData;
                        this.setState({
                            pageDetails: processorResponse.paginationData
                        })
                        if (pageNumber <= this.state.pageDetails.maxPageNumber) {
                            this.setState({
                                currentPage: pageNumber
                            })
                        }
                        this.processTransactions();
                    } else {
                        let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            snackBarOpen: true,
                            message: errorMesaage
                        })
                    }
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }
            })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    processTransactions = () => {
        //Log.sDebug("Organising the transaction data based on date");
        let TransactionArray = GeneralUtilities.transactionHistoryDateOrganizer(this.txData, localeObj);
        let finalArray = TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        //Log.sDebug("Empty Transactions Filtered", "TransactionHistory");
        if (finalArray.length === 0) {
            //Log.sDebug("No Transactions yet ,No Transactions to show", "TransactionHistory");
            this.setState({
                isEmpty: true
            })
        }

        let transactionArray = this.state.txn
        transactionArray[this.state.currentPage - 1] = finalArray;
        this.setState({
            txn: transactionArray,
            transactionState: "display_transactions",
            showCustomTransactions: false
        })
        return;
    }

    processBoletos = () => {
        let boletoArray = GeneralUtilities.transactionHistoryDateOrganizer(this.boletoData, localeObj);

        for (let i = 0; i < 4; i++) {
            boletoArray[i].transactions.sort((d1, d2) => new Date(d2.date).getTime() - new Date(d1.date).getTime());
        }
        //Log.sDebug("Boletos Processed", "TransactionHistory");
        let finalArray = boletoArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        if (finalArray.length === 0) {
            //Log.sDebug("No Boletos to show", "TransactionHistory");
            this.setState({
                isBoletoEmpty: true
            })
        }

        //Log.sDebug("Empty Boletos Filtered", "TransactionHistory");
        this.setState({
            boleto: [...this.state.boleto, ...finalArray],
        })
    }

    onReportUnauthorizedChatBot = () => {
        let responseToUser = ChatBotUtils.formatUnauthorizedTransactionMessage(this.state.storeTransactionData, localeObj, this.state.typeOfTransactionToReport)

        this.props.history.replace({
            pathname: '/chat',
            transition: "right",
            from: "reportUnAuthorized",
            transactionList: this.state.storeTransactionData,
            messageToBackend: responseToUser.sendToBackend,
            messageToShow: responseToUser.showToUser,
        });
    }

    onDisplayDetails = (transactionDetails) => {
        this.setState({
            storeTransactionData: transactionDetails,
            typeOfTransactionToReport: isTransactionPresent.findTransactionType(transactionDetails.transactionTypeID)
        })
        let typeOfOperation = isTransactionPresent.findTransactionType(transactionDetails.transactionTypeID);
        this.setState({
            typeOfTransactionID: transactionDetails.transactionTypeID,
            typeOfTransaction: transactionDetails.transaction
        })
        if (typeOfOperation === "pix" || transactionDetails.transaction === 'D') {
            if (transactionDetails.isScheduled) {
                this.setState({
                    scheduleDetails: transactionDetails.generalData,
                    isTransactionScheduled: true
                });
                this.formReceiptData({
                    "isCard": false,
                    "isScheduled": true,
                    "details": transactionDetails,
                    "receiptReceived": { "tipoOperacao": "Schedule" }
                });
            } else if (transactionDetails.description === "Compra a Vista ELO") {
                this.formReceiptData({
                    "isCard": true,
                    "details": transactionDetails,
                    "receiptReceived": { "tipoOperacao": "Compra a Vista ELO" }
                });
            } else {
                this.setState({
                    transactionState: "showProgressBar"
                })
                arbiApiService.getReceiptForTransactions(transactionDetails.transactionId)
                    .then(response => {
                        if (response.success) {
                            let processorResponse = ArbiResponseHandler.processGetReceiptForTransactions(response);
                            if (processorResponse.success) {
                                //Log.sDebug("Receipt Details Fetched", "TransactionHistory");
                                this.setState({
                                    allDetails: { "receiptReceived": processorResponse.receiptObj, "details": transactionDetails }
                                });
                                this.formReceiptData({ "isCard": false, "receiptReceived": processorResponse.receiptObj, "details": transactionDetails })
                            } else {
                                this.setState({
                                    transactionState: "display_transactions",
                                    snackBarOpen: true,
                                    message: localeObj.coming_soon
                                })
                            }
                        } else {
                            let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                            this.setState({
                                transactionState: "display_transactions",
                                snackBarOpen: true,
                                message: errorMesaage
                            })
                        }
                    })
            }
        } else {
            //Log.sDebug("Receipt for " + transactionDetails.description, "TransactionHistory");
            let typeOfOperation = isTransactionPresent.findTransactionType(transactionDetails.transactionTypeID);

            let receiptJson = {
                "header": localeObj.you_received,
                "type": transactionDetails.transaction,
                "typeOfOperation": transactionDetails.description,
                "date": transactionDetails.formatDate,
                "amount": transactionDetails.formatted_amount,
                "decimal": transactionDetails.decimal,
                "hour": transactionDetails.hour,
                "mins": transactionDetails.mins,
                "payerName": transactionDetails.nameOfParty,
                "receiveReceipt": true,
                "newTransaction": typeOfOperation,
                "receiver": {
                    [localeObj.name]: ImportantDetails.userName
                },
                "fileName": typeOfOperation === "boleto" ? "comprovante_pagamento_" : "comprovante_ted_"
            };
            let transactionInformation = {
                [localeObj.date]: transactionDetails.formatDate,
                [localeObj.pix_type]: GeneralUtilities.captitalizeStrings(typeOfOperation),
                [localeObj.amount]: [localeObj.currency] + NewUtilities.formatAmount(transactionDetails.amount),
                [localeObj.transaction_code]: transactionDetails.transactionId,
            };

            //Log.sDebug("Receipt JSON Formed for incoming", "TransactionHistory");
            this.setState({
                transactionState: "show_receipt",
                direction: "left",
                receiptData: receiptJson,
                transactionInfo: transactionInformation,
            })
        }
    }

    formReceiptData = (receiptData) => {
        let typeOfOperation = receiptData.receiptReceived.tipoOperacao;
        let availableArray = isTransactionPresent.availableTransactionTypes();
        //Log.sDebug("Receipt for " + receiptData.receiptReceived.tipoOperacao, "TransactionHistory");

        if (receiptData.card) {
            typeOfOperation = "Compra a Vista ELO";
            //Log.sDebug("Transaction Type " + typeOfOperation, "TransactionHistory");
        } else if (receiptData.isScheduled) {
            typeOfOperation = "Schedule";
            //Log.sDebug("Transaction Type " + typeOfOperation, "TransactionHistory");
        } else {
            typeOfOperation = isTransactionPresent.findTransactionType(receiptData.details.transactionTypeID);
            //Log.sDebug("Transaction Type " + typeOfOperation, "TransactionHistory");
        }

        if (!(availableArray.includes(typeOfOperation))) {
            this.setState({
                transactionState: "display_transactions",
                snackBarOpen: true,
                message: localeObj.coming_soon
            })
            return;
        }

        let receiptJson = {
            "Type": receiptData.details.transaction,
            "typeOfOperation": typeOfOperation.toUpperCase(),
            "date": receiptData.details.formatDate,
            "amount": receiptData.details.formatted_amount,
            "decimal": receiptData.details.decimal,
            "hour": receiptData.details.hour,
            "mins": receiptData.details.mins,
            "newTransaction": typeOfOperation
        }

        let transactionDetails = {
            [localeObj.date]: receiptData.details.formatDate,
            [localeObj.pix_type]: this.selectKeyType(typeOfOperation),
            [localeObj.amount]: [localeObj.currency] + NewUtilities.formatAmount(receiptData.details.amount),
            [localeObj.tariff]: [localeObj.currency] + " " + NewUtilities.formatAmount(receiptData.receiptReceived.tarifa),
            [localeObj.transaction_code]: receiptData.details.transactionId
        }
        if (typeOfOperation === "pix" || typeOfOperation === "Compra a Vista ELO" || typeOfOperation === "card") {
            transactionDetails = {
                [localeObj.date]: receiptData.details.formatDate,
                [localeObj.pix_type]: this.selectKeyType(typeOfOperation),
                [localeObj.amount]: [localeObj.currency] + NewUtilities.formatAmount(receiptData.details.amount),
                [localeObj.transaction_code]: (receiptData &&
                    receiptData.receiptReceived &&
                    receiptData.receiptReceived.endToEndPix &&
                    receiptData.receiptReceived.endToEndPix.toString() !== "") ?
                    receiptData.receiptReceived.endToEndPix :
                    receiptData.details.transactionId,
            }
        }
        this.setState({
            authCode: receiptData.receiptReceived.autenticacao
        })

        //Log.sDebug("Transaction Type is " + receiptData.details.transaction, "TransactionHistory");
        let dueDate = receiptData.receiptReceived.dataVencimentoBoleto;
        switch (typeOfOperation) {
            case "pix":
                receiptJson["header"] = receiptData.details.transaction === 'D' ? localeObj.pix_you_sent : localeObj.you_received;
                this.setState({
                    header: localeObj.destination
                })
                receiptJson["receiver"] = {
                    [localeObj.name]: receiptData.receiptReceived.nomeFavorecido,
                }
                if (receiptData.receiptReceived.identificacaoFiscalFavorecido.replace(/\.|\\-|\//g, "").length <= 11) {
                    receiptJson["receiver"][localeObj.cpf] = NewUtilities.parseCPFOrCnpj(receiptData.receiptReceived.identificacaoFiscalFavorecido, true)['displayCPF']
                } else {
                    receiptJson["receiver"][localeObj.cnpj] = NewUtilities.parseCPFOrCnpj(receiptData.receiptReceived.identificacaoFiscalFavorecido, true)['displayCPF']
                }
                receiptJson["receiver"][localeObj.Institution] = receiptData.receiptReceived.instituicaoDestinoDescricao

                receiptJson["payer"] = {
                    [localeObj.name]: ImportantDetails.userName,
                    [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                    [localeObj.Institution]: localeObj.bank_name,
                }
                receiptJson["fileName"] = "comprovante_Pix_"
                break;

            case "recharge":
                this.setState({
                    header: localeObj.recharge_info
                })
                receiptJson["header"] = localeObj.txn_recharged;
                if (receiptData.receiptReceived.operadoraRecargaDescricao !== null || receiptData.receiptReceived.operadoraRecargaDescricao !== "") {
                    receiptJson["receiver"] = {
                        [localeObj.phone_number]: `(${receiptData.receiptReceived.dddRecarga}) ${receiptData.receiptReceived.numeroRecarga.substring(0, 5)} ${receiptData.receiptReceived.numeroRecarga.substring(5, 9)}`,
                        [localeObj.operator]: receiptData.receiptReceived.operadoraRecargaDescricao,
                        [localeObj.Institution]: localeObj.bank_name,
                    }
                } else {
                    receiptJson["receiver"] = {
                        [localeObj.phone_number]: receiptData.receiptReceived.ddiRecarga + " " + receiptData.receiptReceived.dddRecarga + " " +
                            receiptData.receiptReceived.numeroRecarga.substring(0, 5) + "-" + receiptData.receiptReceived.numeroRecarga.substring(5, 9),
                        [localeObj.Institution]: localeObj.bank_name,
                    }
                }
                receiptJson["fileName"] = "comprovante_recarga_"
                break;

            case "atm":
                this.setState({
                    header: localeObj.withdrawal_info
                })
                receiptJson["header"] = localeObj.txn_withdrew;
                receiptJson["receiver"] = {
                    //[localeObj.withdrawalID]: receiptData.receiptReceived.transacoId,
                    [localeObj.Institution]: localeObj.bank_name,
                }
                receiptJson["fileName"] = "comprovante_saque_"
                break;

            case "ted":
                receiptJson["header"] = localeObj.pix_you_sent;
                this.setState({
                    header: localeObj.destination
                })

                receiptJson["receiver"] = {
                    [localeObj.name]: receiptData.receiptReceived.nomeFavorecido,
                }
                if (receiptData.receiptReceived.identificacaoFiscalFavorecido.replace(/\.|\\-|\//g, "").length <= 11) {
                    receiptJson["receiver"][localeObj.cpf] = NewUtilities.parseCPFOrCnpj(receiptData.receiptReceived.identificacaoFiscalFavorecido, true)['displayCPF']
                } else {
                    receiptJson["receiver"][localeObj.cnpj] = NewUtilities.parseCPFOrCnpj(receiptData.receiptReceived.identificacaoFiscalFavorecido, true)['displayCPF']
                }
                receiptJson["receiver"][localeObj.Institution] = receiptData.receiptReceived.bancoDestinoDescricao

                receiptJson["payer"] = {
                    [localeObj.name]: ImportantDetails.userName,
                    [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                    [localeObj.Institution]: localeObj.bank_name,
                }
                receiptJson["fileName"] = "comprovante_ted_"
                break;

            case "boleto":
                receiptJson["header"] = localeObj.paid;
                this.setState({
                    header: localeObj.destination
                })
                receiptJson["receiver"] = {
                    [localeObj.name]: receiptData.receiptReceived.nomeFavorecido,
                    [localeObj.cnpj]: GeneralUtilities.maskCpf(receiptData.receiptReceived.identificacaoFiscalFavorecido),
                    [localeObj.Institution]: receiptData.receiptReceived.bancoDestinoDescricao,
                }
                receiptJson["payer"] = {
                    [localeObj.name]: ImportantDetails.userName,
                    [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                    [localeObj.Institution]: localeObj.bank_name,
                }
                if (dueDate !== "" && dueDate !== undefined) {
                    transactionDetails[localeObj.due_date] = moment(dueDate).format("DD/MM/YYYY");
                }
                receiptJson["fileName"] = "comprovante_pagamento_";
                break;

            case "Compra a Vista ELO":
            case "card":
                receiptJson["header"] = localeObj.paid;
                this.setState({
                    header: localeObj.destination
                })
                receiptJson["receiver"] = {
                    [localeObj.name]: receiptData.details.nameOfParty,
                }
                receiptJson["fileName"] = "comprovante_compra_"
                break;

            case "Schedule":
                receiptJson = receiptData.details.receiptData;
                transactionDetails = receiptData.details.transactionData;
                break;

            case "dimo QR code":
                receiptJson["header"] = localeObj.paid;
                this.setState({
                    header: localeObj.destination
                })
                receiptJson["receiver"] = {
                    [localeObj.name]: receiptData.receiptReceived.nomeFavorecido,
                }

                receiptJson["payer"] = {
                    [localeObj.name]: ImportantDetails.userName,
                    [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                    [localeObj.Institution]: localeObj.bank_name,
                }
                receiptJson["fileName"] = "comprovante_Dimo_qrcode_"
                break;
            default:

        }

        //Log.sDebug("Receipt JSON Formed for outgoing", "TransactionHistory");
        this.setState({
            transactionState: "show_receipt",
            direction: "left",
            receiptData: receiptJson,
            transactionInfo: transactionDetails,
        })
    }

    OtherTransaction = () => {
        this.setState({
            transactionState: "display_transactions"
        })
    }

    newTransactions = () => {
        let typeOfTransaction = isTransactionPresent.findTransactionType(this.state.typeOfTransactionID);
        //Log.sDebug("The Type of transaction is filtered using ID " + this.state.typeOfTransactionID + "as " + typeOfTransaction);
        switch (typeOfTransaction) {
            case "pix":
                this.props.history.replace({ pathname: "/pixLandingComponent", from: "mainTransactionHistory" });
                break;
            case "ted":
                this.props.history.replace({ pathname: "/sendComponent", from: "mainTransactionHistory" });
                break;
            case "recharge":
                this.props.history.replace({ pathname: "/cellularRecharge", from: "mainTransactionHistory" });
                break;
            case "boleto":
                document.activeElement.blur();
                if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
                    androidApiCalls.scanBoletoCode();
                } else {
                    androidApiCalls.requestPermission(CAMERA_PERMISSION);
                }
                break;
            case "atm":
                document.activeElement.blur();
                if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
                    androidApiCalls.scanQrCode("atm")
                } else {
                    androidApiCalls.requestPermission(CAMERA_PERMISSION);
                }
                break;
            default:
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                break;
        }
    }

    onScanComplete = (action, value) => {
        switch (action) {
            case 1: //MANUAL BOLETO
                this.props.history.replace({ pathname: "/insertBoleto", from: "mainTransactionHistory" });
                break;
            case 2: //SWITCH CODE TO QR
                document.activeElement.blur();
                androidApiCalls.scanQrCode("QR");
                break;
            case 3: //BOLETO SCAN SUCCESS
                this.props.history.replace({
                    pathname: '/boleto',
                    state: {
                        "manual": false,
                        "qrCodeValue": value,
                    },
                    from: "transactionHistory"
                });
                break;
            case 4: //ATM SCAN SUCCESS
                this.props.history.replace({
                    pathname: '/atmWithdraw',
                    state: { qrCodeValue: value },
                    from: "mainTransactionHistory"
                });
                break;
            case 5: ////SWITCH CODE TO BOLETO
                document.activeElement.blur();
                androidApiCalls.scanBoletoCode();
                break;
            default:
                this.OtherTransaction();
        }
    }

    onConfirm = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    onBack = () => {
        if (this.state.bottomSheetOpen) {
            this.setState({
                bottomSheetOpen: false
            })
        } else {
            switch (this.state.transactionState) {
                case "loading":
                    if (this.props.location && this.props.location.from) {
                        if (this.props.location.from === "chatBot") {
                            this.props.history.replace({ pathname: "/chat", transition: "right" });
                        } else {
                            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                        }
                    } else {
                        if (this.state.isOnBack) {
                            this.setState({ isOnBack: false });
                            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                        }
                    }
                    break;
                case "display_transactions":
                    if (this.state.bottomSheet1) {
                        this.setState({
                            bottomSheet1: false,
                            transactionState: "display_transactions",
                            showCustomTransactions: false
                        });
                        this.getTotalTransactions();
                    } else if (this.state.bottomSheet2) {
                        this.setState({
                            bottomSheet2: false,
                            transactionState: "display_transactions",
                            showCustomTransactions: false
                        });
                        this.getTotalTransactions();
                    } else if (this.state.calender) {
                        this.setState({
                            calender: false,
                            showCustomTransactions: false
                        });
                        this.getTotalTransactions();
                    } else {
                        if (this.props.location && this.props.location.from) {
                            if (this.props.location.from === "chatBot") {
                                this.props.history.replace({ pathname: "/chat", transition: "right" });
                            } else {
                                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                            }
                        } else {
                            if (this.state.isOnBack) {
                                this.setState({ isOnBack: false });
                                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                            }
                        }
                    }
                    break;
                case "show_receipt":
                    this.setState({
                        transactionState: "display_transactions",
                        alertBackToFilter: true,
                        isTransactionScheduled: false
                    })
                    break;
                case "enter_pin":
                    this.setState({
                        transactionState: "show_receipt",
                        direction: "right"
                    });
                    break;
                case "period_selection":
                    this.setState({
                        transactionState: "display_transactions",
                        alertBackToFilter: true,
                        isTransactionScheduled: false
                    });
                    break;
                default:
            }
        }
    }

    onSelectPayNow = () => {
        //Log.sDebug("Pay Now Option Selected for " + this.state.scheduleDetails.description);
        if (this.state.scheduleDetails.amount > parseFloat(this.state.balance + "." + this.state.decimal)) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.insufficient_balance
            })
        } else {
            switch (this.state.scheduleDetails.description) {
                case localeObj.pix_schedule_transfer:
                    this.payScheduledPixTransactionNow();
                    break;
                case localeObj.ted_schedule_transfer:
                    if ((moment().day() === 0 || moment().day() === 6 || moment().hour() > 17 || (moment().hour() === 17 && moment().minutes() > 15)) && this.state.scheduleDetails.typeOfTed === "EXTERNAL") {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.out_of_payment_time
                        })
                    } else if (moment().hour() < 8 && this.state.scheduleDetails.typeOfTed === "EXTERNAL") {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.out_of_payment_time_before_nine
                        })
                    } else {
                        this.payScheduledTedTransactionNow();
                    }
                    break;
                case localeObj.boleto_schedule_transfer:
                    this.payScheduledBoletoTransactionNow();
                    break;
                default:
            }
        }
    }

    payScheduledPixTransactionNow = () => {
        let reviewPageJSON = {
            "amount": this.state.scheduleDetails.formatted_amount,
            "decimal": this.state.scheduleDetails.decimal,
            "transferType": localeObj.pix_header,
            "name": this.state.scheduleDetails.nameOfParty,
            "CPF": GeneralUtilities.maskCpf(this.state.scheduleDetails.cpfOfParty),
            "receiverInstitute": this.state.scheduleDetails.institutionOfParty,
        }

        let additonalInformation = {
            "isScheduled": true,
            "scheduledDate": this.state.scheduleDetails.scheduled_date,
            "isEditSchedule": false,
            "key": this.state.scheduleDetails.key,
            "scheduleId": this.state.scheduleDetails.txnId
        }

        //Log.sDebug("Moving to Pix send component to perfrom pay now function");

        this.props.history.replace({
            pathname: "/pixSendComponent",
            from: "mainTransactionHistory",
            reviewData: reviewPageJSON,
            additonalData: additonalInformation
        })
    }


    payScheduledBoletoTransactionNow = () => {
        let payLoad = {
            "manual": false,
            "isEditSchedule": false,
            "scheduleId": this.state.scheduleDetails.txnId,
            "qrCodeValue": this.state.scheduleDetails.code
        }
        this.props.history.replace({
            pathname: '/boleto',
            from: "mainTransactionHistory",
            state: payLoad
        });
    }

    payScheduledTedTransactionNow = () => {
        let reviewPageJSON = {
            "amount": this.state.scheduleDetails.formatted_amount,
            "decimal": this.state.scheduleDetails.decimal,
            "transferType": this.state.scheduleDetails.typeOfTed === "EXTERNAL" ? "EXTERNAL" : "INTERNAL",
            "beneficiary": this.state.scheduleDetails.nameOfParty,
            "cpf": this.state.scheduleDetails.cpfForSend,
            "receiverInstitute": this.state.scheduleDetails.institutionOfParty,
            "bank": this.state.scheduleDetails.typeOfTed === "INTERNAL" ? "213" : this.state.scheduleDetails.bankNumber,
            "agency": this.state.scheduleDetails.agency,
            "account": this.state.scheduleDetails.accountNumber,
            "accountType": this.state.scheduleDetails.accountType
        }

        let additonalInformation = {
            "isScheduled": true,
            "scheduledDate": this.state.scheduleDetails.scheduled_date,
            "isEditSchedule": false,
            "scheduleId": this.state.scheduleDetails.txnId
        }

        this.props.history.replace({
            pathname: "/tedTransfer",
            from: "mainTransactionHistory",
            reviewData: reviewPageJSON,
            additonalData: additonalInformation
        })
    }

    onSelectEditSchedule = () => {
        switch (this.state.scheduleDetails.description) {
            case localeObj.pix_schedule_transfer:
                this.editScheduledPixTransaction();
                break;
            case localeObj.ted_schedule_transfer:
                this.editScheduledTedTransaction();
                break;
            case localeObj.boleto_schedule_transfer:
                this.editScheduledBoletoTransaction();
                break;
            default:
        }
    }

    editScheduledPixTransaction = () => {
        let reviewPageJSON = {
            "amount": this.state.scheduleDetails.formatted_amount,
            "decimal": this.state.scheduleDetails.decimal,
            "transferType": localeObj.pix_header,
            "name": this.state.scheduleDetails.nameOfParty,
            "CPF": GeneralUtilities.maskCpf(this.state.scheduleDetails.cpfOfParty),
            "receiverInstitute": this.state.scheduleDetails.institutionOfParty,
        }

        let additonalInformation = {
            "isScheduled": true,
            "scheduledDate": new Date(this.state.scheduleDetails.date),
            "isEditSchedule": true,
            "key": this.state.scheduleDetails.key,
            "scheduleId": this.state.scheduleDetails.txnId
        }

        //Log.sDebug("Moving to Pix send component to perfrom edit schedule function");

        this.props.history.replace({
            pathname: "/pixSendComponent",
            from: "mainTransactionHistory",
            reviewData: reviewPageJSON,
            additonalData: additonalInformation
        })
    }

    editScheduledBoletoTransaction = () => {
        let payLoad = {
            "manual": false,
            "isEditSchedule": true,
            "scheduleId": this.state.scheduleDetails.txnId,
            "qrCodeValue": this.state.scheduleDetails.code,
            "scheduleDate": new Date(this.state.scheduleDetails.date)
        }
        this.props.history.replace({
            pathname: '/boleto',
            from: "mainTransactionHistory",
            state: payLoad
        });
    }

    editScheduledTedTransaction = () => {

        let reviewPageJSON = {
            "amount": this.state.scheduleDetails.formatted_amount,
            "decimal": this.state.scheduleDetails.decimal,
            "transferType": this.state.scheduleDetails.typeOfTed === "EXTERNAL" ? "EXTERNAL" : "INTERNAL",
            "beneficiary": this.state.scheduleDetails.nameOfParty,
            "cpf": this.state.scheduleDetails.cpfForSend,
            "receiverInstitute": this.state.scheduleDetails.institutionOfParty,
            "bank": this.state.scheduleDetails.typeOfTed === "INTERNAL" ? "213" : this.state.scheduleDetails.bankNumber,
            "agency": this.state.scheduleDetails.agency,
            "account": this.state.scheduleDetails.accountNumber,
            "finalEditDate": this.state.scheduleDetails.finalEditDate
        }

        let additonalInformation = {
            "isScheduled": true,
            "scheduledDate": new Date(this.state.scheduleDetails.date),
            "isEditSchedule": true,
            "scheduleId": this.state.scheduleDetails.txnId,
            "finalEditDate": this.state.scheduleDetails.finalEditDate
        }

        this.props.history.replace({
            pathname: "/tedTransfer",
            from: "mainTransactionHistory",
            reviewData: reviewPageJSON,
            additonalData: additonalInformation
        })
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

    CalenderState = () => {
        this.setState({
            transactionState: "period_selection"
        });
    }

    customPeriodToggle = (field) => {
        this.setState({
            customPeriodSelectionTxns: field
        })
    }

    customPeriodSelection = (openRangeSelection) => {
        if (openRangeSelection === true) {
            this.setState({
                transactionState: "period_selection"
            })
        } else {
            this.setState({
                transactionState: "display_transactions"
            })
        }

    }

    setSelectedFilter = (filterVal) => {
        if (filterVal === ALL_OPERATIONS || GeneralUtilities.emptyValueCheck(filterVal)) {
            this.setState({
                alertBackToFilter: false,
                transactionState: "display_transactions",
                showCustomTransactions: false
            })
            this.getTotalTransactions();
        } else {
            this.setState({
                filterSelected: filterVal,
                alertBackToFilter: false,
            })
        }
    }

    periodSelectionApply = (stDate, edDate) => {
        if (stDate <= edDate) {
            let diff = moment(edDate).diff(moment(stDate), 'days');
            if (diff > 90) {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.date_difference
                });
            }
            else {
                this.setState({
                    transactionState: "display_transactions",
                    showCustomTransactions: true,
                    startDate: stDate,
                    endDate: edDate
                });
            }
        }
        else {
            this.setState({
                snackBarOpen: true,
                message: localeObj.initial_date
            });
        }
    }

    periodSelectionCancel = () => {
        this.setState({
            transactionState: "display_transactions",
            showCustomTransactions: false
        });
    }

    selectKeyType = (type) => {
        if (type === "EVP") {
            return localeObj.evp_key;
        } else if (type === "PHONE") {
            return localeObj.phone_number;
        } else if (type === "EMAIL") {
            return localeObj.email;
        } else if (type === "CPF") {
            return localeObj.cpf;
        } else if (type === "Recharge" || type === "recharge") {
            return localeObj.phone_recharge;
        } else if (type === "dimo QR code") {
            return localeObj.dimo_pay;
        } else {
            return GeneralUtilities.captitalizeStrings(type);
        }
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
                    transactionState: "enter_pin",
                    direction: "left"
                });
                break;
            default:
        }
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
    }

    processPin = (pin) => {
        let cancelJSON = {
            "pin": pin,
            "scheduleId": this.state.scheduleDetails.txnId
        }
        this.setState({
            transactionState: "showProgressBar"
        });

        //Log.sDebug("Cancel Schedule Option Selected for " + this.state.scheduleDetails.description);
        switch (this.state.scheduleDetails.description) {
            case localeObj.pix_schedule_transfer:
                this.cancelScheduledPixTransaction(cancelJSON);
                break;
            case localeObj.ted_schedule_transfer:
                if (this.state.scheduleDetails.typeOfTed === "EXTERNAL") {
                    this.cancelScheduledTedExternalTransaction(cancelJSON);
                } else {
                    this.cancelScheduledTedInternalTransaction(cancelJSON);
                }
                break;
            case localeObj.boleto_schedule_transfer:
                this.cancelScheduledBoletoTransaction(cancelJSON);
                break;
            default:
        }
    }

    cancelScheduledPixTransaction = (jsonForCancel) => {
        arbiApiService.cancelPixScheduledTransactions(jsonForCancel, PageNames.mainTransactionHistory.show_receipt).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processCancelPixScheduledTransactions(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "Pix Cancel Schedule Success");
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.cancel_schedule_success,
                    })
                    this.OtherTransaction();
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ", componentForLog, constantObjects.LOG_PROD);
                    this.setState({
                        transactionState: "show_receipt",
                        direction: "right"
                    });
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                this.handleCancelErrors(response);
            }
        });
    }

    cancelScheduledBoletoTransaction = (jsonForCancel) => {
        arbiApiService.cancelBoletoScheduledTransactions(jsonForCancel, PageNames.mainTransactionHistory.cancel).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processCancelBoletoScheduledTransactions(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "Boleto Cancel Schedule Success");
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.cancel_schedule_success,
                    })
                    this.OtherTransaction();
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ", componentForLog, constantObjects.LOG_PROD);
                    this.setState({
                        transactionState: "show_receipt",
                        direction: "right"
                    });
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                this.handleCancelErrors(response);
            }
        });
    }

    cancelScheduledTedInternalTransaction = (jsonForCancel) => {
        arbiApiService.tedInternalScheduleCancel(jsonForCancel, PageNames.mainTransactionHistory.display_transactions).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processTedInternalScheduleCancel(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "Boleto Cancel Schedule Success");
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.cancel_schedule_success,
                    })
                    this.OtherTransaction();
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ", componentForLog, constantObjects.LOG_PROD);
                    this.setState({
                        transactionState: "show_receipt",
                        direction: "right"
                    });
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                this.handleCancelErrors(response);
            }
        });
    }

    cancelScheduledTedExternalTransaction = (jsonForCancel) => {
        arbiApiService.tedExternalScheduleCancel(jsonForCancel, PageNames.mainTransactionHistory.display_transactions).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processTedExternalScheduleCancel(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "Boleto Cancel Schedule Success");
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.cancel_schedule_success,
                    })
                    this.OtherTransaction();
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ", componentForLog, constantObjects.LOG_PROD);
                    this.setState({
                        transactionState: "show_receipt",
                        direction: "right"
                    });
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                this.handleCancelErrors(response);
            }
        });
    }

    handleCancelErrors = (response) => {
        this.setState({
            transactionState: "enter_pin",
            direction: "left"
        });
        if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.pix_communication_issue,
            })
        } else if ('' + response.result.code === "10007") {
            this.setState({
                transactionState: "enter_pin",
                direction: "right"
            });
            this.openBottomSheetForWrongPasscode();
        } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
            this.setState({
                transactionState: "enter_pin",
                direction: "right"
            });
            this.openBottomSheetForResetPassword();
        } else if ('' + response.result.code === "40007") {
            this.setState({
                snackBarOpen: true,
                message: localeObj.pix_account_unavailable,
            });
            this.OtherTransaction();
        } else {
            let errorJson = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
            this.setState({
                snackBarOpen: true,
                message: errorJson
            });
            this.OtherTransaction();
        }
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    disableCustomPeriod = () => {
        this.setState({
            showCustomTransactions: false
        });
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return;
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.transaction_receipt_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right" })
    }


    render() {
        const transactionState = this.state.transactionState;
        const { classes } = this.props;
        const filter = this.state.filterText;

        return (
            <div style={{ overflowX: "hidden", height: "100%", overflowY: transactionState === "loading" ? "hidden" : "auto" }}>
                <div style={{ display: (transactionState === "loading" ? 'block' : 'none') }}>
                    <DisplayTransactions
                        currentState={transactionState}
                        balance={this.state.balance}
                        onBack={this.onBack}
                        decimal={this.state.decimal}
                        clickText={filter}
                        showUnauthrizedOption={this.state.isChatBot && this.state.shouldShowUnuthorized}
                        pageData={this.state.pageDetails}
                        currentPage={this.state.currentPage} />
                </div>
                <div style={{ display: (transactionState === "showProgressBar" ? 'block' : 'none') }}>
                    {transactionState === "showProgressBar" && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                <div style={{ display: (transactionState === "display_transactions" ? 'block' : 'none') }}>
                    {transactionState === "display_transactions" &&
                        <DisplayTransactions
                            isEmpty={this.state.isEmpty}
                            onDisplayDetails={this.onDisplayDetails}
                            txnHist={this.state.txn[this.state.currentPage - 1]}
                            balance={this.state.balance}
                            decimal={this.state.decimal}
                            boletoData={this.state.boleto}
                            onBack={this.onBack} clickText={localeObj.all_operations_filter}
                            disableCustomPeriod={() => this.disableCustomPeriod}
                            bottom1={this.state.bottomSheet1}
                            bottom2={this.state.bottomSheet2}
                            multipleSelection1={this.multipleSelection1}
                            boletosStatus={this.state.isBoletoEmpty}
                            resetCurrentPage={this.resetCurrentPage}
                            multipleSelection2={this.multipleSelection2}
                            calenderState={this.CalenderState}
                            typeFromBackend={this.props.location.type}
                            customPeriodSelection={this.customPeriodSelection}
                            customPeriodToggle={this.customPeriodToggle}
                            calenderOpen={this.state.calender}
                            actOnScanComplete={this.onScanComplete}
                            setFilterVal={this.setSelectedFilter}
                            currentFilter={this.state.filterSelected}
                            isBackPressed={this.state.alertBackToFilter}
                            moveToSchedule={this.state.moveToSchedule}
                            customPeriodStart={this.state.startDate}
                            customPeriodEnd={this.state.endDate}
                            showUnauthrizedOption={this.state.isChatBot && this.state.shouldShowUnuthorized}
                            fetchNextPage={this.fetchNextPageNumber}
                            fetchPreviousPage={this.fetchPrevPage}
                            showCustomTransactions={this.state.showCustomTransactions}
                            pageData={this.state.pageDetails}
                            currentPage={this.state.currentPage}
                            checkChatbotTransaction={this.state.isChatBot}
                            fromChat={this.props.location.from}
                            checkUseCase={this.props.location.checkUseCase} />}
                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transactionState === "show_receipt" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transactionState === "show_receipt" ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onBack={this.onBack} action="none" />
                        {transactionState === "show_receipt" && <ReceiptTemplate requiredInfo={this.state.receiptData} OtherTransaction={this.newTransactions} confirm={this.onConfirm} info={this.state.transactionInfo} onBack={this.onBack}
                            header={this.state.receiptData.header} schedule={this.state.isTransactionScheduled} detailHeader={this.state.header} payNow={this.onSelectPayNow} customPeriodStart={this.state.startDate} customPeriodEnd={this.state.endDate}
                            allowScheduleEdit={this.state.isTransactionScheduled} editSchedule={this.onSelectEditSchedule} btnText={this.state.isTransactionScheduled ? localeObj.cancel_scheduled : localeObj.back_home}
                            cancelSchdule={this.openBottomSheetforCancelScheduled} actOnScanComplete={this.onScanComplete} onReportUnauthorized={this.onReportUnauthorizedChatBot} showUnauthrizedOption={this.state.isChatBot && this.state.shouldShowUnuthorized} goToChatbot={this.goToChatbot} fromTransactionHistory={true} typeOfTransaction={this.state.typeOfTransaction} fromChatbot={this.state.isChatBot} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transactionState === "enter_pin" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transactionState === "enter_pin" ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_authentication} onBack={this.onBack} action="none" />
                        {transactionState === "enter_pin" && <InputPin confirm={this.processPin} clearPassword={this.state.clearPassword}
                            componentName={PageNames.mainTransactionHistory.enter_pin} />}
                    </div>
                </CSSTransition>
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transactionState === "period_selection" ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transactionState === "period_selection" ? 'block' : 'none') }}>
                        {/* <ButtonAppBar header={localeObj.date} onBack={this.onBack} action="none" /> */}
                        {transactionState === "period_selection" && <PeriodSelection startDate={this.state.startDate} finishDate={this.state.endDate} onBack={this.onBack}
                            periodSelectionCancel={this.periodSelectionCancel} periodSelectionApply={this.periodSelectionApply} header={localeObj.select_date_range} />}
                    </div>
                </CSSTransition>
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
TransactionComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,

}
export default withStyles(styles)(TransactionComponent);