import React from "react";
import 'moment/locale/pt';
import moment from 'moment';
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/scrollButton.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import { CSSTransition } from 'react-transition-group';

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import constantObjects from "../../Services/Constants";
import NewUtilities from "../../Services/NewUtilities";
import MetricServices from "../../Services/MetricsService";
import arbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import CommonButtons from "../CommonUxComponents/CommonButtons";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";

import LoadingGrid from "../TransactionHistory/LoadingGrid";
import DisplayGrid from "../TransactionHistory/DisplayGrid";
import BalanceCardComponent from "../TransactionHistory/BalanceCard";
import isTransactionPresent from "../../Services/TransactionTypeFilter";
import NoTransactionComponent from "../TransactionHistory/NoTransactions";

import successLogo from "../../images/SpotIllustrations/Checkmark.png";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import ReceiptComponent from "../NewDepositComponents/ReceiptComponent";
import BottomSheetForKeys from "../PIXComponent/PixNewRecieve/BottomSheetForKeys";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.mainTransactionHistory;
const ALL_OPERATIONS = "All operations";
const ALL_TYPES = "All types";
const SCHEDULE = "Schedule";
const DATE_RANGE = "Date Range";
const PIX = "Pix";
const TED = "Ted";
const CARD = "Card";
const BOLETO = "Boleto";
const FILTER_RECEIVED = "Received";
const FILTER_SENT = "Sent";
const MONEY_DEBITED_FROM_MY_ACCOUNT = "MONEY_DEBITED_FROM_MY_ACCOUNT_BUT_NOT_RECEIVED_IN_RECIPIENS_ACCOUNT";
const BOLETO_GENERATED = "Boleto Generated";

const FilterButton = CommonButtons.ButtonTypeFilter;
const BottomButton = CommonButtons.ButtonTypeBottom;

var localeObj = {};

class DisplayTransactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scheduledTxn: [],
            transactionDate: [],
            transactionSent: [],
            currentPageDate: 1,
            currentPageSent: 1,
            currentPageReceived: 1,
            currentPageFilter: 1,
            currentPagePixFilter: 1,
            currentPageTedFilter: 1,
            currentPageCardFilter: 1,
            currentPageBoletoFilter: 1,
            transactionReceived: [],
            transactionFilter: [],
            transactionPixFilter: [],
            transactionTedFilter: [],
            transactionCardFilter: [],
            transactionBoletoFilter: [],
            message: "",
            rangeSelected: "",
            clickVal: "1",
            open: false,
            emptySent: false,
            emptyCard: false,
            emptyPix: false,
            emptyFilter: false,
            emptyTed: false,
            emptyBoleto: false,
            processing: false,
            emptyRange: false,
            snackBarOpen: false,
            bottomSheet1: false,
            bottomSheet2: false,
            emptyReceived: false,
            boletoClicked: false,
            isScheduledEmpty: false,
            filterBottomSheet: false,
            clickedText: ALL_OPERATIONS,
            selectedFilterText: ALL_TYPES,
            currentState: props.currentState || (props.isEmpty ? "Empty" : ALL_OPERATIONS),
            customPeriodFilter: this.props.customPeriodSelectionTxns,
            display: "",
            pageDetailsDate: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsSent: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsReceived: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsFilter: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsPixFilter: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsTedFilter: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsCardFilter: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            },
            pageDetailsBoletoFilter: {
                "maxPageNumber": 1,
                "totalTransactions": 50,
                "transactionsPerPage": 50
            }
        }

        this.style = {
            lazyLoading: {
                display: "inline-block",
                backgroundColor: ColorPicker.lazyLoadColorTxnHistory
            }
        }

        this.fromDate = moment().subtract(90, 'days')
        this.toDate = new Date();
        this.onSelect = this.onSelect.bind(this);

        this.scheduledTxData = [];
        this.pixScheduledTxData = [];
        this.tedScheduledTxData = [];
        this.boletoScheduledTxData = [];
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNameJSON.display_transactions);
    }

    componentDidMount() {
        this.setState({
            clickedText: localeObj.all_operations_filter,
            selectedFilterText: localeObj.all_types_filter
        });
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onScanQRComplete = (response) => {
            if (response) {
                if (response === "cancelled") {
                    //Log.sDebug("User cancelled scanning");
                } else if (this.props.requiredInfo.newTransaction === "boleto") {
                    if (response === "manual") {
                        //Log.sDebug("User opted to enter boleto code manually");
                        this.props.actOnScanComplete(1);
                    } else if (response === "switchQR") {
                        //Log.sDebug("User selected to scan boleto barcode");
                        this.props.actOnScanComplete(5);
                    } else {
                        if (response.includes("boleto")) {
                            //Log.sDebug("Scanned boleto successfully");
                            let qrVal = response.split(":")[1]
                            this.props.actOnScanComplete(3, qrVal);
                        } else {
                            //Log.sDebug("Scanned invalid boleto");
                            this.setState({
                                snackBarOpen: true,
                                message: localeObj.invalid_Boleto
                            })
                        }
                    }
                } else if (this.props.requiredInfo.newTransaction === "atm") {
                    if (response.includes("atm")) {
                        let qrCodeValue = response.split(":")[1];
                        //Log.sDebug("Scanned ATM QR code successfully");
                        Log.debug("scanned qr code value is " + qrCodeValue);
                        this.props.actOnScanComplete(4, qrCodeValue);
                    } else {
                        //Log.sDebug("Scanned Invalid ATM QR code");
                        this.openSnackBar(localeObj.invalid_ATM_QR_token);
                    }
                }
                //1: Manual, 5: Switch to boleto, 3: Boleto Component, 4:ATM
            }
        }

        window.onBackPressed = () => {
            this.back();
        }

        if (this.props.showCustomTransactions) {
            this.setState({
                clickVal: "2",
                currentState: "loading",
                transactionDate: [],
                rangeSelected: "Custom",
                range: {
                    from: moment(this.props.customPeriodStart),
                    to: moment(this.props.customPeriodEnd)
                }
            });
            this.props.disableCustomPeriod();
            this.getPagewiseTransactionsForDateRange(1, "all", moment(this.props.customPeriodStart), moment(this.props.customPeriodEnd));
        } else if (this.props.isBackPressed || this.props.moveToSchedule) {
            this.getFiltered({ action: this.props.currentFilter })
        }

    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNameJSON.display_transactions, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNameJSON.display_transactions);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    formatAmount = (amount) => {
        let amountInfo = amount.toString().split(".");
        let full = amountInfo[0];
        let decimal = amountInfo[1];
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
        if (full) {
            return full + "," + decimal;
        } else {
            return "00," + decimal;
        }
    }

    onSelect(details) {
        details["currentFilter"] = this.state.currentState;
        if (this.state.currentState === BOLETO_GENERATED) {
            //Log.sDebug("Boleto receipt JSON formed", "DisplayTransactions");
            this.setState({
                currentState: "reciept",
                info: {
                    "value": this.formatAmount(details.amount),
                    "number": details.number,
                    "expiryDate": moment(details.expiryDate).format("DD/MM/YYYY"),
                    "slipNumber": details.bankSlip,
                    "status": details.description,
                    "boletoId": details.boletoId,
                }
            })
        } else {
            if (details.isTarrif) {
                if (this.props.fromChat === "chatBot") {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.no_receipt
                    })
                }
                //Log.sDebug("No Receipt for tariff", "DisplayTransactions");
            } else if (details.isScheduled) {
                switch (details.typeofSchedule) {
                    case "TRANSFERENCIA_INTERNA":
                        //Log.sDebug("Receipt for INTERNAL TED", "DisplayTransactions");
                        this.getInternalTEDtransactionData(details.txnId);
                        break;
                    case "TED":
                        //Log.sDebug("Receipt for EXTERNAL TED", "DisplayTransactions");
                        this.getExterrnalTEDtransactionData(details.txnId);
                        break;
                    case "BOLETO":
                        //Log.sDebug("Receipt for Boleto, " + "DisplayTransactions");
                        this.getBoletotransactionData(details.txnId);
                        break;
                    case "PIX":
                        //Log.sDebug("Receipt for PIX, " + "DisplayTransactions");
                        this.getPixtransactionData(details.txnId);
                        break;
                    default:
                }
            } else if (details.transactionId === null && details.transaction === "D") {
                //Log.sDebug("Transaction ID was null", "DisplayTransactions");
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.coming_soon
                })
            } else if (details.transaction === "D" && (!details.hasReceipt)) {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.no_receipt
                })
            } else if (this.props.fromChat === "chatBot" && details.transaction === "C") {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.credit_transaction
                })
            } else if (this.props.checkUseCase === MONEY_DEBITED_FROM_MY_ACCOUNT) {
                let transactionType = isTransactionPresent.findTransactionType(details.transactionTypeID);
                if (transactionType === "atm" || transactionType === "recharge") {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.error_Message_For_Invalid_Transaction
                    })
                } else {
                    this.props.onDisplayDetails(details)
                }
            } else {

                if (this.props.showUnauthrizedOption) {
                    let typeOfTransactionToReport = isTransactionPresent.findTransactionType(details.transactionTypeID)

                    if ((!GeneralUtilities.emptyValueCheck(this.props.typeFromBackend)) && (this.props.typeFromBackend !== typeOfTransactionToReport)) {
                        this.setState({
                            transactionState: "display_transactions",
                            snackBarOpen: true,
                            message: localeObj.error_Message_For_Invalid_Transaction
                        })
                    }
                    else {
                        this.props.onDisplayDetails(details)
                    }
                } else {
                    this.props.onDisplayDetails(details)
                }
            }
        }
    }

    getInternalTEDtransactionData = (txnId) => {
        this.showProgressDialog();
        arbiApiService.getTedInternalScheduledTransactionDetails(txnId, PageNameJSON.display_transactions).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetTedInternalScheduledTransactionDetails(response.result, localeObj);
                if (processorResponse.success) {
                    this.generateReceiptForScheduled(processorResponse.scheduleData);
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
                return;
            }
        });
    }

    getExterrnalTEDtransactionData = (txnId) => {
        this.showProgressDialog();
        arbiApiService.getTedExternalScheduledTransactionDetails(txnId, PageNameJSON.display_transactions).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetTedExternalScheduledTransactionDetails(response.result, localeObj);
                if (processorResponse.success) {
                    this.generateReceiptForScheduled(processorResponse.scheduleData);
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
                return;
            }
        });
    }

    getBoletotransactionData = (txnId) => {
        this.showProgressDialog();
        arbiApiService.getBoletoScheduledTransactionDetails(txnId, PageNameJSON.display_transactions).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetBoletoScheduledTransactionDetails(response.result, localeObj);
                if (processorResponse.success) {
                    this.generateReceiptForScheduled(processorResponse.scheduleData);
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
                return;
            }
        });
    }

    getPixtransactionData = (txnId) => {
        this.showProgressDialog();
        arbiApiService.getPixScheduledTransactionDetails(txnId, PageNameJSON.display_transactions).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetPixScheduledTransactionDetails(response.result, localeObj);
                if (processorResponse.success) {
                    this.generateReceiptForScheduled(processorResponse.scheduleData);
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
                return;
            }
        });
    }

    generateReceiptForScheduled = (selectedTransaction) => {
        let receiptJson = {
            "type": selectedTransaction.transaction,
            "date": moment(selectedTransaction.date).format('DD/MM/YYYY'),
            "hour": moment(selectedTransaction.date).format('HH'),
            "mins": moment(selectedTransaction.date).format('mm'),
            "fileName": this.getFileName(selectedTransaction.description),
            "amount": selectedTransaction.formatted_amount,
            "decimal": selectedTransaction.decimal,
            "recurrence": selectedTransaction.recurrence,
            "scheduled_date": selectedTransaction.date,
            "header": localeObj.you_scheduled,
            "receiver": {
                [localeObj.name]: selectedTransaction.nameOfParty,
                [localeObj.cpf]: GeneralUtilities.maskCpf(selectedTransaction.cpfOfParty),
                [localeObj.Institution]: selectedTransaction.institutionOfParty,
            },
            "payer": {
                [localeObj.name]: ImportantDetails.userName,
                [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                [localeObj.Institution]: localeObj.bank_name
            }
        }

        let transactionDetails = {
            [localeObj.date]: moment(selectedTransaction.date).format('DD/MM/YYYY'),
            [localeObj.pix_type]: selectedTransaction.description,
            [localeObj.amount]: "R$ " + selectedTransaction.formatted_amount + "," + NewUtilities.formatDecimal(selectedTransaction.decimal),
            [localeObj.transaction_code]: selectedTransaction.txnId
        }

        let finalJSON = {
            "isScheduled": true,
            "currentFilter": SCHEDULE,
            "transaction": 'D',
            "receiptData": receiptJson,
            "transactionData": transactionDetails,
            "generalData": selectedTransaction
        }
        this.props.onDisplayDetails(finalJSON)
    }

    getFileName = (type) => {
        switch (type) {
            case localeObj.pix_schedule_transfer:
                return "comprovante_Pix_";
            case localeObj.ted_schedule_transfer:
                return "comprovante_ted_";
            case localeObj.boleto_schedule_transfer:
                return "comprovante_pagamento_";
            default:
        }
    }

    processTransactions = (data, type) => {
        if (data.length === 0) {
            this.setState({
                currentState: "Empty"
            })
            return;
        }

        let TransactionArray = GeneralUtilities.transactionHistoryDateOrganizer(data, localeObj);
        let filterCheck = TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        if (filterCheck.length === 0) {
            //Log.sDebug("No Transactions in filter type- " + type, "DisplayTransactions");
            if (type === FILTER_SENT) {
                this.setState({
                    emptySent: true,
                    currentState: "Empty"
                })
            } else if (type === FILTER_RECEIVED) {
                this.setState({
                    emptyReceived: true,
                    currentState: "Empty",
                })
            } else if (type === ALL_OPERATIONS) {
                this.setState({
                    empty: true,
                    currentState: "Empty",
                })
            } else if (type === ALL_TYPES) {
                this.setState({
                    emptyFilter: true,
                    currentState: "Empty",
                })
            } else if (type === PIX) {
                this.setState({
                    emptyPix: true,
                    currentState: "Empty",
                })
            } else if (type === TED) {
                this.setState({
                    emptyTed: true,
                    currentState: "Empty",
                })
            } else if (type === CARD) {
                this.setState({
                    emptyCard: true,
                    currentState: "Empty",
                })
            } else if (type === "range" || type === DATE_RANGE) {
                this.setState({
                    emptyRange: true,
                    currentState: "Empty",
                })
            }
        } else {
            return (TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; }));
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onSecondary = () => {
        switch (this.state.clickedText) {
            case localeObj.all_operations_filter:
                this.getFiltered({ "action": ALL_OPERATIONS });
                break;
            case localeObj.sent_filter:
                this.getFiltered({ "action": FILTER_SENT });
                break;
            case localeObj.receive_filter:
                this.getFiltered({ "action": FILTER_RECEIVED });
                break;
            case localeObj.scheduled_filter:
                this.getFiltered({ "action": SCHEDULE });
                break;
            default:
        }
        this.setState({
            open: false,
            rangeSelected: ""
        });
    }

    filterTransacations = (action) => {
        if (this.state.currentState === "loading") {
            this.loadingSnackBar();
            return;
        } else {
            //Log.sDebug("Filter Transactions - " + action + " button pressed", "DisplayTransactions");
            if (action === ALL_OPERATIONS) {
                this.props.multipleSelection1(true);
                this.setState({
                    filterBottomSheet: true,
                    display: "show_filters",
                    clickVal: "1",
                    clickedText: localeObj.all_operations_filter
                })
            } else if (action === ALL_TYPES) {
                this.props.multipleSelection1(true);
                this.setState({
                    filterBottomSheetForFilters: true,
                    currentState: "show_all_types_filters",
                    clickVal: "3",
                    selectedFilterText: localeObj.all_types_filter
                });
            } else if (action === BOLETO_GENERATED) {
                if (this.props.boletosStatus) {
                    this.setState({
                        clickVal: "4",
                        currentState: "Empty"
                    });
                } else {
                    this.setState({
                        currentState: BOLETO_GENERATED,
                        clickVal: "4"
                    });
                }
            } else if (action === SCHEDULE) {
                this.setState({
                    currentState: SCHEDULE,
                    clickVal: "1",
                    clickedText: localeObj.scheduled_filter
                });
            } else if (action === DATE_RANGE) {
                this.setState({
                    open: true,
                    DateRangeSheet: true,
                    clickVal: "2"
                });
                //Log.sDebug("Date Range Bottom sheet opened", "DisplayTransactions");
            }
        }
        this.goToFirstPage();
    }

    getTypeFiltered = (filter) => {
        this.props.multipleSelection1(false);

        this.setState({
            clickVal: "3",
            filterBottomSheetForFilters: false,
            currentPage: 1,
            rangeSelected: "",
            currentPageDate: 1,
            currentPageFilter: 1,
            currentPagePixFilter: 1,
            currentPageTedFilter: 1,
            currentPageCardFilter: 1,
            currentPageBoletoFilter: 1,
            clickedText: localeObj.all_operations_filter
        });

        if (this.state.currentState === "loading") {
            this.loadingSnackBar();
            return;
        } else if (this.props.isEmpty) {
            this.setState({
                currentState: "Empty"
            });
        }
        if (filter.action === ALL_TYPES) {
            if (this.state.transactionFilter.length === 0 && (!this.state.emptyFilter)) {
                this.setState({
                    clickVal: "3",
                    currentState: "loading",
                    selectedFilterText: localeObj.all_types_filter,
                });
                this.getPagewiseTransactionsForFilter(1, ALL_TYPES, this.fromDate, this.toDate, localeObj.all_types_filter);
            } else if (this.state.emptyFilter) {
                this.setState({
                    clickVal: "3",
                    currentState: "Empty",
                    selectedFilterText: localeObj.all_types_filter
                });
            } else {
                this.setState({
                    clickVal: "3",
                    currentState: ALL_TYPES,
                    selectedFilterText: localeObj.all_types_filter
                });
            }
        } else if (filter.action === PIX) {
            if (this.state.transactionPixFilter.length === 0 && (!this.state.emptyPix)) {
                this.setState({
                    clickVal: "3",
                    currentState: "loading",
                    selectedFilterText: localeObj.pix,
                });
                this.getPagewiseTransactionsForFilter(1, PIX, this.fromDate, this.toDate, localeObj.pix);
            } else if (this.state.emptyPix) {
                this.setState({
                    clickVal: "3",
                    currentState: "Empty",
                    selectedFilterText: localeObj.pix
                });
            } else {
                this.setState({
                    clickVal: "3",
                    currentState: PIX,
                    selectedFilterText: localeObj.pix
                });
            }
        } else if (filter.action === TED) {
            if (this.state.transactionTedFilter.length === 0 && (!this.state.emptyTed)) {
                this.setState({
                    clickVal: "3",
                    currentState: "loading",
                    selectedFilterText: localeObj.transfer_money,
                });
                this.getPagewiseTransactionsForFilter(1, TED, this.fromDate, this.toDate, localeObj.transfer_money);
            } else if (this.state.emptyTed) {
                this.setState({
                    clickVal: "3",
                    currentState: "Empty",
                    selectedFilterText: localeObj.transfer_money
                });
            } else {
                this.setState({
                    clickVal: "3",
                    currentState: TED,
                    selectedFilterText: localeObj.transfer_money
                });
            }
        } else if (filter.action === CARD) {
            if (this.state.transactionCardFilter.length === 0 && (!this.state.emptyCard)) {
                this.setState({
                    clickVal: "3",
                    currentState: "loading",
                    selectedFilterText: localeObj.account_card,
                });
                this.getPagewiseTransactionsForFilter(1, CARD, this.fromDate, this.toDate, localeObj.account_card);
            } else if (this.state.emptyCard) {
                this.setState({
                    clickVal: "3",
                    currentState: "Empty",
                    selectedFilterText: localeObj.account_card
                });
            } else {
                this.setState({
                    clickVal: "3",
                    currentState: CARD,
                    selectedFilterText: localeObj.account_card
                });
            }
        } else if (filter.action === BOLETO) {
            if (this.state.transactionBoletoFilter.length === 0 && (!this.state.emptyBoleto)) {
                this.setState({
                    clickVal: "3",
                    currentState: "loading",
                    selectedFilterText: localeObj.boleto_payment,
                });
                this.getPagewiseTransactionsForFilter(1, BOLETO, this.fromDate, this.toDate, localeObj.boleto_payment);
            } else if (this.state.emptyBoleto) {
                this.setState({
                    clickVal: "3",
                    currentState: "Empty",
                    selectedFilterText: localeObj.boleto_payment
                });
            } else {
                this.setState({
                    clickVal: "3",
                    currentState: BOLETO,
                    selectedFilterText: localeObj.boleto_payment
                });
            }
        }
    }

    getFiltered = (filter) => {
        this.goToFirstPage();
        this.props.multipleSelection1(false);
        this.props.setFilterVal(filter.action);
        this.setState({
            filterBottomSheet: false,
            currentPageSent: 1,
            currentPageReceived: 1,
            currentPageDate: 1,
            currentPage: 1,
            clickVal: "1",
            rangeSelected: "",
            selectedFilterText: localeObj.all_types_filter
        });
        if (this.state.currentState === "loading") {
            this.loadingSnackBar();
            return;
        } else if (this.props.isEmpty) {
            this.setState({
                currentState: "Empty",
                clickedText: localeObj.all_operations_filter
            });
        }
        if (filter.action === ALL_OPERATIONS) {
            if (this.props.isEmpty) {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.all_operations_filter
                });
            } else {
                this.setState({
                    currentState: ALL_OPERATIONS,
                    clickedText: localeObj.all_operations_filter
                });
            }
        } else if (filter.action === FILTER_SENT) {
            if (this.state.transactionSent.length === 0 && (!this.state.emptySent)) {
                this.setState({
                    currentState: "loading",
                    clickedText: localeObj.sent_filter,
                });
                this.getPagewiseTransactions(1, FILTER_SENT, this.fromDate, this.toDate);
            } else if (this.state.emptySent) {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.sent_filter
                });
            } else {
                this.setState({
                    currentState: FILTER_SENT,
                    clickedText: localeObj.sent_filter
                });
            }
        } else if (filter.action === FILTER_RECEIVED) {
            if (this.state.transactionReceived.length === 0 && (!this.state.emptyReceived)) {
                this.setState({
                    currentState: "loading",
                    clickedText: localeObj.receive_filter,
                });
                this.getPagewiseTransactions(1, FILTER_RECEIVED, this.fromDate, this.toDate);
            } else if (this.state.emptyReceived) {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.receive_filter
                });
            } else {
                this.setState({
                    currentState: FILTER_RECEIVED,
                    clickedText: localeObj.receive_filter
                });
            }
        } else if (filter.action === SCHEDULE) {
            if (this.state.scheduledTxn.length === 0 && (!this.state.isScheduledEmpty)) {
                this.setState({
                    currentState: "loading",
                    clickedText: localeObj.scheduled_filter
                });
            } else if (this.state.isScheduledEmpty) {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.scheduled_filter
                });
            } else {
                this.setState({
                    currentState: SCHEDULE,
                    clickedText: localeObj.scheduled_filter
                });
            }

            this.scheduledTxData = [];
            this.getScheduledDetails();
        }
    }

    fetchNextPageNumberSent = () => {
        let pageNumber = parseInt(this.state.currentPageSent) + 1;
        if (this.state.transactionSent.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageSent: pageNumber,
                currentState: FILTER_SENT
            })
        } else {
            this.setState({
                currentState: "loading",
                clickedText: localeObj.sent_filter
            });
            this.getPagewiseTransactions(parseInt(pageNumber), FILTER_SENT, this.fromDate, this.toDate);
        }
    }

    fetchPrevPageSent = () => {
        this.setState({
            currentPageSent: this.state.currentPageSent - 1,
            currentState: FILTER_SENT
        })
    }

    fetchNextPageNumberReceived = () => {
        let pageNumber = parseInt(this.state.currentPageReceived) + 1;
        if (this.state.transactionReceived.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageReceived: this.state.currentPageReceived + 1,
                currentState: FILTER_RECEIVED
            })
        } else {
            this.setState({
                currentState: "loading",
                clickedText: localeObj.receive_filter
            });
            this.getPagewiseTransactions(pageNumber, FILTER_RECEIVED, this.fromDate, this.toDate);
        }
    }

    fetchPrevPageReceived = () => {
        this.setState({
            currentPageReceived: this.state.currentPageReceived - 1,
            currentState: FILTER_RECEIVED
        })
    }

    fetchNextPageNumberDate = () => {
        let pageNumber = parseInt(this.state.currentPageDate) + 1;
        if (this.state.transactionDate.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageDate: this.state.currentPageDate + 1,
                currentState: DATE_RANGE
            })
        } else {
            this.getPagewiseTransactionsForDateRange(pageNumber, "all", this.state.range.from, this.state.range.to);
        }
    }

    fetchPrevPageDate = () => {
        this.setState({
            currentPageDate: this.state.currentPageDate - 1,
            currentState: DATE_RANGE
        })
    }

    fetchNextPageNumberFilter = (filterName, filterText) => {
        let pageNumber = parseInt(this.state.currentPageFilter) + 1;
        if (this.state.transactionPixFilter.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageFilter: this.state.currentPageFilter + 1,
                currentState: filterName
            })
        } else {
            this.setState({
                currentState: "loading",
                selectedFilterText: localeObj.all_types_filter
            });
            this.getPagewiseTransactionsForFilter(pageNumber, filterName, this.fromDate, this.toDate, filterText);
        }
    }

    fetchNextPageNumberPixFilter = (filterName, filterText) => {
        let pageNumber = parseInt(this.state.currentPagePixFilter) + 1;
        if (this.state.transactionPixFilter.length >= parseInt(pageNumber)) {
            this.setState({
                currentPagePixFilter: this.state.currentPagePixFilter + 1,
                currentState: filterName
            })
        } else {
            this.setState({
                currentState: "loading",
                selectedFilterText: localeObj.pix
            });
            this.getPagewiseTransactionsForFilter(pageNumber, filterName, this.fromDate, this.toDate, filterText);
        }
    }

    fetchNextPageNumberTedFilter = (filterName, filterText) => {
        let pageNumber = parseInt(this.state.currentPageTedFilter) + 1;
        if (this.state.transactionTedFilter.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageTedFilter: this.state.currentPageTedFilter + 1,
                currentState: filterName
            })
        } else {
            this.setState({
                currentState: "loading",
                selectedFilterText: localeObj.transfer_money
            });
            this.getPagewiseTransactionsForFilter(pageNumber, TED, this.fromDate, this.toDate, filterText);
        }
    }

    fetchNextPageNumberCardFilter = (filterName, filterText) => {
        let pageNumber = parseInt(this.state.currentPageCardFilter) + 1;
        if (this.state.transactionCardFilter.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageCardFilter: this.state.currentPageCardFilter + 1,
                currentState: filterName
            })
        } else {
            this.setState({
                currentState: "loading",
                selectedFilterText: localeObj.account_card
            });
            this.getPagewiseTransactionsForFilter(pageNumber, CARD, this.fromDate, this.toDate, filterText);
        }
    }

    fetchNextPageNumberBoletoFilter = (filterName, filterText) => {
        let pageNumber = parseInt(this.state.currentPageBoletoFilter) + 1;
        if (this.state.transactionBoletoFilter.length >= parseInt(pageNumber)) {
            this.setState({
                currentPageBoletoFilter: this.state.currentPageBoletoFilter + 1,
                currentState: filterName
            })
        } else {
            this.setState({
                currentState: "loading",
                selectedFilterText: localeObj.boleto_payment
            });
            this.getPagewiseTransactionsForFilter(pageNumber, BOLETO, this.fromDate, this.toDate, filterText);
        }
    }

    fetchPrevPageFilter = () => {
        this.setState({
            currentPageFilter: this.state.currentPageFilter - 1,
            currentState: ALL_TYPES
        })
    }

    fetchPrevPagePixFilter = () => {
        this.setState({
            currentPagePixFilter: this.state.currentPagePixFilter - 1,
            currentState: PIX
        })
    }

    fetchPrevPageTedFilter = () => {
        this.setState({
            currentPageTedFilter: this.state.currentPageTedFilter - 1,
            currentState: TED
        })
    }

    fetchPrevPageCardFilter = () => {
        this.setState({
            currentPageCardFilter: this.state.currentPageCardFilter - 1,
            currentState: CARD
        })
    }

    fetchPrevPageBoletoFilter = () => {
        this.setState({
            currentPageBoletoFilter: this.state.currentPageBoletoFilter - 1,
            currentState: BOLETO
        })
    }

    getPagewiseTransactions = (pageNumber, type, from = this.fromDate, to = this.toDate) => {
        this.setState({
            currentState: "loading",
        });
        arbiApiService.getTransactionHistory(from.toISOString(), to.toISOString(), type, pageNumber, PageNameJSON.display_transactions).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
                if (processorResponse.success) {
                    switch (type) {
                        case FILTER_RECEIVED:
                            this.processReceived(processorResponse, pageNumber);
                            break;
                        case FILTER_SENT:
                            this.processSent(processorResponse, pageNumber);
                            break;
                        default:
                            this.processDateRange(processorResponse, pageNumber);
                            break;
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
                return;
            }
        });
    }

    getPagewiseTransactionsForDateRange = (pageNumber, type, from = this.fromDate, to = this.toDate) => {
        this.setState({
            currentState: "loading",
        });
        arbiApiService.getTransactionHistory(from.toISOString(), to.toISOString(), "all", pageNumber, PageNameJSON.display_transactions).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
                if (processorResponse.success) {
                    this.processDateRange(processorResponse, pageNumber);
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
                return;
            }
        });
    }

    getPagewiseTransactionsForFilter = (pageNumber, type, from = this.fromDate, to = this.toDate) => {
        this.setState({
            currentState: "loading",
        });
        arbiApiService.getTransactionHistoryForFilters(from.toISOString(), to.toISOString(), PageNameJSON.display_transactions).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponseForFilter(response.result, type);
                if (processorResponse.success) {
                    switch (type) {
                        case PIX:
                            this.processPixFilterTransactions(processorResponse, pageNumber, PIX);
                            break;
                        case TED:
                            this.processTedFilterTransactions(processorResponse, pageNumber, TED);
                            break;
                        case CARD:
                            this.processCardFilterTransactions(processorResponse, pageNumber, CARD);
                            break;
                        case BOLETO:
                            this.processBoletoFilterTransactions(processorResponse, pageNumber, BOLETO);
                            break;
                        default:
                            this.processFilterTransactions(processorResponse, pageNumber, ALL_TYPES);
                            break;
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
                return;
            }
        });
    }

    processPixFilterTransactions = (processorResponse, pageNumber, filterType) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyPix: true,
            })
        } else {
            this.setState(prevState => ({
                transactionPixFilter: [...prevState.transactionPixFilter, this.processTransactions(processorResponse.transactionData, filterType)],
                currentState: PIX,
                selectedFilterText: localeObj.pix,
                pageDetailsPixFilter: processorResponse.paginationData
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPagePixFilter: pageNumber
                })
            }
        }
    }

    processTedFilterTransactions = (processorResponse, pageNumber, filterType) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyTed: true,
            })
        } else {
            this.setState(prevState => ({
                transactionTedFilter: [...prevState.transactionTedFilter, this.processTransactions(processorResponse.transactionData, filterType)],
                currentState: TED,
                selectedFilterText: localeObj.transfer_money,
                pageDetailsTedFilter: processorResponse.paginationData
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageTedFilter: pageNumber
                })
            }
        }
    }

    processCardFilterTransactions = (processorResponse, pageNumber, filterType) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyCard: true,
            })
        } else {
            this.setState(prevState => ({
                transactionCardFilter: [...prevState.transactionCardFilter, this.processTransactions(processorResponse.transactionData, filterType)],
                currentState: CARD,
                selectedFilterText: localeObj.account_card,
                pageDetailsCardFilter: processorResponse.paginationData
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageCardFilter: pageNumber
                })
            }
        }
    }

    processBoletoFilterTransactions = (processorResponse, pageNumber, filterType) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyBoleto: true,
            })
        } else {
            this.setState(prevState => ({
                transactionBoletoFilter: [...prevState.transactionBoletoFilter, this.processTransactions(processorResponse.transactionData, filterType)],
                currentState: BOLETO,
                selectedFilterText: localeObj.boleto_payment,
                pageDetailsBoletoFilter: processorResponse.paginationData
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageBoletoFilter: pageNumber
                })
            }
        }
    }

    processFilterTransactions = (processorResponse, pageNumber, filterType) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyFilter: true,
            })
        } else {
            this.setState(prevState => ({
                transactionFilter: [...prevState.transactionFilter, this.processTransactions(processorResponse.transactionData, filterType)],
                currentState: filterType,
                selectedFilterText: localeObj.all_types_filter,
                pageDetailsFilter: processorResponse.paginationData
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageFilter: pageNumber
                })
            }
        }
    }

    processReceived = (processorResponse, pageNumber) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyReceived: true,
            })
        } else {
            this.setState(prevState => ({
                transactionReceived: [...prevState.transactionReceived, this.processTransactions(processorResponse.transactionData, FILTER_RECEIVED)],
                currentState: FILTER_RECEIVED,
                clickedText: localeObj.receive_filter,
                pageDetailsReceived: processorResponse.paginationData,
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageReceived: pageNumber
                })
            }
        }
    }

    processSent = (processorResponse, pageNumber) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptySent: true,
            })
        } else {
            this.setState(prevState => ({
                transactionSent: [...prevState.transactionSent, this.processTransactions(processorResponse.transactionData, FILTER_SENT)],
                currentState: FILTER_SENT,
                clickedText: localeObj.sent_filter,
                pageDetailsSent: processorResponse.paginationData
            }))
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageSent: pageNumber
                })
            }
        }
    }

    processDateRange = (processorResponse, pageNumber) => {
        if (processorResponse.transactionData.length === 0) {
            this.setState({
                currentState: "Empty",
                emptyRange: true
            })
        } else {
            this.setState(prevState => ({
                transactionDate: [...prevState.transactionDate, this.processTransactions(processorResponse.transactionData, "range")],
                currentState: DATE_RANGE,
                pageDetailsDate: processorResponse.paginationData
            }));
            if (pageNumber <= processorResponse.paginationData.maxPageNumber) {
                this.setState({
                    currentPageDate: pageNumber
                })
            }
        }
    }

    back = () => {
        if (this.state.currentState === "loading") {
            this.loadingSnackBar();
            return;
        } else if (this.state.currentState === "reciept") {
            this.moveToSucess();
            return;
        } else {
            if (this.state.open === true) {
                this.setState({
                    open: false
                })
            } else if (this.state.filterBottomSheet === true) {
                this.props.multipleSelection1(false);
                this.setState({
                    filterBottomSheet: false
                }, () => {
                    if (this.state.currentState === 'Boleto Generated') {
                        this.onSecondary();
                    }
                })
            } else if (this.state.filterBottomSheetForFilters === true) {
                this.props.multipleSelection1(false);
                this.setState({
                    filterBottomSheetForFilters: false
                });
            } else {
                MetricServices.onPageTransitionStop(PageNameJSON.display_transactions, PageState.back);
                this.props.onBack();
            }
        }
    }

    onGetDateRange = (rangeObj) => {
        let fromDate = moment(rangeObj.startDate).startOf('day').subtract(1, "minute");
        let endDate = moment(rangeObj.endDate).endOf('day').add(1, "minute");
        //Log.sDebug("From Date selected " + fromDate.toISOString + " " + "From Date selected " + endDate.toISOString, "DisplayTransactions");
        if (moment(fromDate).isBefore(moment(endDate))) {
            this.props.calenderState(false);
            this.setState({
                range: {
                    "from": fromDate,
                    "to": endDate
                }
            })
            this.getPagewiseTransactionsForDateRange(1, "all", fromDate, endDate);
        } else {
            this.setState({
                snackBarOpen: true,
                message: localeObj.initial_date
            })
        }
    }

    getScheduledDetails() {
        this.setState({
            scheduledTxn: []
        });
        let fromDate = moment(moment().startOf('day')).toISOString();
        let toDate = moment().add(11, 'months').toISOString();
        arbiApiService.getAllScheduledTransactions(fromDate, toDate, PageNameJSON.display_transactions).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetAllScheduledTransactions(response.result, localeObj);
                if (processorResponse.success) {
                    let scheduledTransactionData = processorResponse.txn_scheduled;
                    this.scheduledTxData = this.scheduledTxData.concat(scheduledTransactionData);
                    this.processScheduledTransactions();
                } else if (processorResponse.message === 1) {
                    this.setState({
                        currentState: "Empty",
                        isScheduledEmpty: true
                    })
                    return;
                } else {
                    this.setState({
                        currentState: "Empty"
                    })
                    return;
                }
            } else {
                this.setState({
                    currentState: "Empty"
                })
                return;
            }
        });
    }

    onCancelRange = () => {
        this.props.calenderState(false);
        this.setState({
            currentState: localeObj.all_operations_filter
        });
    }


    processScheduledTransactions = () => {
        let TransactionArray = GeneralUtilities.transactionHistoryScheduledDateOrganizer(this.scheduledTxData, localeObj);
        for (let i = 0; i < 5; i++) {
            TransactionArray[i].transactions.sort((d2, d1) => new Date(d2.date).getTime() - new Date(d1.date).getTime());
        }
        let finalArray = TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        if (finalArray.length === 0) {
            this.setState({
                currentState: "Empty",
                clickedText: localeObj.scheduled_filter
            })
        }
        this.setState({
            scheduledTxn: [...this.state.scheduledTxn, ...finalArray],
            currentState: SCHEDULE,
            clickedText: localeObj.scheduled_filter
        })
        return;
    }

    setDateRangeStatus = (action) => {
        this.setState({
            rangeSelected: action
        })
    }

    onPrimary = () => {
        this.setState({
            open: false,
            transactionDate: [],
            pageDetailsDate: 1,
            currentPageDate: 1
        });
        let to = moment().endOf('day') //Set 11:59 PM today;
        if (this.state.rangeSelected === "90") {
            //Log.sDebug("Fetch Transaction History for last 90 Days", "DisplayTransactions");
            let from = moment(to).subtract(90, 'days'); //Set to 90 days ago at 12 AM
            this.setState({
                range: {
                    from: from,
                    to: to
                }
            })
            this.getPagewiseTransactionsForDateRange(1, "all", from, to);
        } else if (this.state.rangeSelected === "30") {
            //Log.sDebug("Fetch Transaction History for last 30 Days", "DisplayTransactions");
            let from = moment(to).subtract(30, 'days'); //Set to 30 days ago at 12 AM
            this.setState({
                range: {
                    from: from,
                    to: to
                }
            })
            this.getPagewiseTransactionsForDateRange(1, "all", from, to);
        } else if (this.state.rangeSelected === "60") {
            //Log.sDebug("Fetch Transaction History for last 60 Days", "DisplayTransactions");
            let from = moment(to).subtract(60, 'days'); //Set to 60 days ago at 12 AM
            this.setState({
                range: {
                    from: from,
                    to: to
                }
            })
            this.getPagewiseTransactionsForDateRange(1, "all", from, to);
        } else if (this.state.rangeSelected === "365") {
            //Log.sDebug("Fetch Transaction History for last 365 Days", "DisplayTransactions");
            let from = moment(to).subtract(365, 'days'); //Set to 365 days ago at 12 AM
            this.setState({
                range: {
                    from: from,
                    to: to
                }
            })
            this.getPagewiseTransactionsForDateRange(1, "all", from, to);
        } else if (this.state.rangeSelected === "Custom") {
            //Log.sDebug("Fetch for custom Date Range", "DisplayTransactions");
            this.setState({
                open: false,
                currentState: "CustomDateRange"
            });
            this.props.customPeriodSelection(true);
        }
    }

    moveToSucess = () => {
        this.setState({
            currentState: BOLETO_GENERATED
        });
    }

    moveToCancel = () => {
        this.setState({
            currentState: "cancel"
        });
    }

    setFailureObject = (message) => {
        let jsonObj = {};
        jsonObj["header"] = localeObj.slip_cancel_fail;
        jsonObj["description"] = message;
        this.setState({
            errorJson: jsonObj,
            currentState: "error"
        })
    }

    loadingSnackBar = () => {
        this.setState({
            snackBarOpen: true,
            message: localeObj.fetching_transaction_history
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

    getNextPage = () => {
        this.props.fetchNextPage();
    }

    getPreviousPage = () => {
        this.props.fetchPreviousPage();
    }

    goToFirstPage = () => {
        this.props.resetCurrentPage();
    }

    getBoxHeight = (calculatedHeight) => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return calculatedHeight * 0.52;
            case "NEXT_LARGE_SCREEN": return calculatedHeight * 0.72;
            case "LARGE_SCREEN": return calculatedHeight * 0.8;
            case "NORMAL_SCREEN": return calculatedHeight * 1.1
            case "SMALL_SCREEN":
                return calculatedHeight * 1.42;
            default: return calculatedHeight;
        }
    }

    getBoxHeightLargeScreen = (calculatedHeight) => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return calculatedHeight * 1.35;
            case "NEXT_LARGE_SCREEN": return calculatedHeight * 1.35;
            case "LARGE_SCREEN": return calculatedHeight * 1.3;
            case "NORMAL_SCREEN": return calculatedHeight * 1.4
            case "SMALL_SCREEN":
                return calculatedHeight * 2;
            default: return calculatedHeight;
        }
    }

    getScrollWidth = (val) => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return val * 3.5;
            case "NEXT_LARGE_SCREEN": return val * 3.5;
            case "LARGE_SCREEN": return val * 2;
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN": return val * 1.35;
            default: return val * 1.35;
        }
    }

    render() {
        const { classes } = this.props
        const pageState = this.props.currentState ? this.props.currentState : this.state.currentState;
        const txnSent = this.state.transactionSent;
        const txnReceived = this.state.transactionReceived;
        const txnDate = this.state.transactionDate;
        const txnScheduled = this.state.scheduledTxn;
        const txnFilter = this.state.transactionFilter;
        const txnPix = this.state.transactionPixFilter;
        const txnTed = this.state.transactionTedFilter;
        const txnCard = this.state.transactionCardFilter;
        const txnBoleto = this.state.transactionBoletoFilter;
        const rangeStatus = this.state.rangeSelected;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const scrollHeight = (screenHeight < 900) ? this.getBoxHeight(screenHeight * 1.2) : this.getBoxHeightLargeScreen(screenHeight);
        const ActionArray = [
            {
                type: localeObj.all_operations_filter,
                key: "",
                action: ALL_OPERATIONS
            },
            {
                type: localeObj.receive_filter,
                key: "",
                action: FILTER_RECEIVED
            },
            {
                type: localeObj.sent_filter,
                key: "",
                action: FILTER_SENT
            },
            {
                type: localeObj.scheduled_filter,
                key: "",
                action: SCHEDULE
            }
        ];

        const FilterArray = [
            {
                type: localeObj.all_types_filter,
                key: "",
                action: ALL_TYPES
            },
            {
                type: localeObj.account_card,
                key: "",
                action: CARD
            },
            {
                type: localeObj.transfer_money,
                key: "",
                action: TED
            },
            {
                type: localeObj.boleto_payment,
                key: "",
                action: BOLETO
            },
            {
                type: localeObj.pix,
                key: "",
                action: PIX
            }
        ];

        const dateArray = [
            {
                text: localeObj.thirty_days,
                action: "30"
            },
            {
                text: localeObj.sixty_days,
                action: "60"
            },
            {
                text: localeObj.ninety_days,
                action: "90"
            },
            {
                text: localeObj.date_range_custom,
                action: "Custom"
            }
        ]

        return (
            <div>
                {pageState !== "reciept" &&
                    pageState !== "cancel" &&
                    pageState !== "error" &&
                    pageState !== "Date" &&
                    pageState !== "CustomDateRange" &&
                    <div
                        style={
                            {
                                display: (pageState !== "reciept" &&
                                    pageState !== "cancel" &&
                                    pageState !== "error" &&
                                    pageState !== "Date" &&
                                    pageState !== "CustomDateRange" && !this.state.processing) ? 'block' : 'none'
                            }}>
                        <ButtonAppBar
                            header={localeObj.transaction_history}
                            style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}
                            onBack={this.props.onBack}
                            action="none" />
                        <div style={{ ...InputThemes.initialMarginStyle, display: this.props.showUnauthrizedOption ? "block" : "none" }}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.chatbot_select_unauthorized}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ display: this.props.showUnauthrizedOption ? "none" : "block" }}>
                            <BalanceCardComponent balance={this.props.balance} decimal={this.props.decimal} />
                        </div>
                        <div style={{ marginTop: "2rem" }}>
                            <div className="subtitle4 highEmphasis" style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                                {localeObj.filters}
                            </div>
                            <div style={{ textAlign: "left", marginLeft: "1.5rem", marginRight: "1.5rem", marginTop: "0.5rem", width: `${screenWidth * 0.9}px`, overflowY: 'hidden', overflowX: 'auto', flex: 1, justifyContent: 'space-between' }}>
                                <div style={{ flexWrap: "nowrap", overflowY: 'hidden', overflowX: 'auto', flex: 1, justifyContent: 'space-between', whiteSpace: 'nowrap' }} >
                                    <FilterButton
                                        endIcon={<ArrowDropDownIcon style={{ marginTop: "0.03rem" }} fontSize="small" />}
                                        className="smallTextStyleBold"
                                        variant="outlined"
                                        onClick={() => pageState === "loading" ? this.loadingSnackBar() : this.filterTransacations(ALL_OPERATIONS)}
                                        style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "1") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "1") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                        {GeneralUtilities.emptyValueCheck(this.state.clickedText) ? localeObj.all_operations_filter : this.state.clickedText}
                                    </FilterButton>
                                    <FilterButton
                                        endIcon={<ArrowDropDownIcon style={{ marginTop: "0.03rem" }} fontSize="small" />}
                                        className="smallTextStyleBold"
                                        variant="outlined"
                                        onClick={() => pageState === "loading" ? this.loadingSnackBar() : this.filterTransacations(DATE_RANGE)}
                                        style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "2") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "2") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                        {localeObj.period_filter}
                                    </FilterButton>
                                    {/* <FilterButton
                                        endIcon={<ArrowDropDownIcon style={{ marginTop: "0.03rem" }} fontSize="small" />}
                                        className="smallTextStyleBold"
                                        variant="outlined"
                                        onClick={() => pageState === "loading" ? this.loadingSnackBar() : this.filterTransacations(ALL_TYPES)}
                                        style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "3") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "3") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                        {GeneralUtilities.emptyValueCheck(this.state.selectedFilterText) ? localeObj.all_types_filter : this.state.selectedFilterText}
                                    </FilterButton> */}
                                    <FilterButton
                                        className="smallTextStyleBold"
                                        variant="outlined"
                                        onClick={() => pageState === "loading" ? this.loadingSnackBar() : this.filterTransacations(BOLETO_GENERATED)}
                                        style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "4") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "4") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                        {localeObj.boleto_generated}
                                    </FilterButton>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === ALL_OPERATIONS ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === ALL_OPERATIONS && !this.state.processing) ? 'block' : 'none'), height: (this.props.currentPage < this.props.pageData.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.props.currentPage === this.props.pageData.maxPageNumber) ? (screenHeight > 900) ? `${scrollHeight * 0.43}px` : `${scrollHeight * 0.6}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === ALL_OPERATIONS && <DisplayGrid txn={this.props.txnHist} onSelect={this.onSelect} getNextPage={this.getNextPage} getPreviousPage={this.getPreviousPage} pageData={this.props.pageData} currentPage={this.props.currentPage} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === FILTER_SENT && !this.state.processing ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === FILTER_SENT && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageSent < this.state.pageDetailsSent.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageSent === this.state.pageDetailsSent.maxPageNumber) ? (screenHeight > 900) ? `${scrollHeight * 0.43}px` : `${scrollHeight * 0.6}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === FILTER_SENT && <DisplayGrid txn={txnSent[this.state.currentPageSent - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberSent} getPreviousPage={this.fetchPrevPageSent} pageData={this.state.pageDetailsSent} currentPage={this.state.currentPageSent} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === FILTER_RECEIVED && !this.state.processing ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === FILTER_RECEIVED && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageReceived < this.state.pageDetailsReceived.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageReceived === this.state.pageDetailsReceived.maxPageNumber) ? (screenHeight > 900) ? `${scrollHeight * 0.43}px` : `${scrollHeight * 0.6}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === FILTER_RECEIVED && <DisplayGrid txn={txnReceived[this.state.currentPageReceived - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberReceived} getPreviousPage={this.fetchPrevPageReceived} pageData={this.state.pageDetailsReceived} currentPage={this.state.currentPageReceived} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === DATE_RANGE ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === DATE_RANGE && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageDate < this.state.pageDetailsDate.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageDate === this.state.pageDetailsDate.maxPageNumber) ? (screenHeight > 900) ? `${scrollHeight * 0.43}px` : `${scrollHeight * 0.6}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === DATE_RANGE && <DisplayGrid txn={txnDate[this.state.currentPageDate - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberDate} getPreviousPage={this.fetchPrevPageDate} pageData={this.state.pageDetailsDate} currentPage={this.state.currentPageDate} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === SCHEDULE ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === SCHEDULE && !this.state.processing) ? 'block' : 'none'), height: `${screenHeight * 0.7}px` }}>
                        {pageState === SCHEDULE && <DisplayGrid txn={txnScheduled} onSelect={this.onSelect} showPagination={false} pageData={this.state.pageDetailsDate} currentPage={this.state.currentPageDate} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === BOLETO_GENERATED ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === BOLETO_GENERATED && !this.state.processing) ? 'block' : 'none'), height: `${screenHeight * 0.7}px` }}>
                        {pageState === BOLETO_GENERATED && <DisplayGrid txn={this.props.boletoData} onSelect={this.onSelect} showPagination={false} pageData={this.state.pageDetailsDate} currentPage={this.state.currentPageDate} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === ALL_TYPES ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === ALL_TYPES && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageFilter < this.state.pageDetailsFilter.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageFilter === this.state.pageDetailsFilter.maxPageNumber) ? `${scrollHeight * 0.38}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === ALL_TYPES && <DisplayGrid txn={txnFilter[this.state.currentPageFilter - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberFilter} getPreviousPage={this.fetchPrevPageFilter} pageData={this.state.pageDetailsFilter} currentPage={this.state.currentPageFilter} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === PIX ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === PIX && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPagePixFilter < this.state.pageDetailsPixFilter.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPagePixFilter === this.state.pageDetailsPixFilter.maxPageNumber) ? `${scrollHeight * 0.38}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === PIX && <DisplayGrid txn={txnPix[this.state.currentPagePixFilter - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberPixFilter} getPreviousPage={this.fetchPrevPagePixFilter} pageData={this.state.pageDetailsPixFilter} currentPage={this.state.currentPagePixFilter} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === TED ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === TED && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageTedFilter < this.state.pageDetailsTedFilter.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageTedFilter === this.state.pageDetailsTedFilter.maxPageNumber) ? `${scrollHeight * 0.38}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === TED && <DisplayGrid txn={txnTed[this.state.currentPageTedFilter - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberTedFilter} getPreviousPage={this.fetchPrevPageTedFilter} pageData={this.state.pageDetailsTedFilter} currentPage={this.state.currentPageTedFilter} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === CARD ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === CARD && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageCardFilter < this.state.pageDetailsCardFilter.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageCardFilter === this.state.pageDetailsCardFilter.maxPageNumber) ? `${scrollHeight * 0.38}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === CARD && <DisplayGrid txn={txnCard[this.state.currentPageCardFilter - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberCardFilter} getPreviousPage={this.fetchPrevPageCardFilter} pageData={this.state.pageDetailsCardFilter} currentPage={this.state.currentPageCardFilter} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === BOLETO ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div className="scrollTransactions" style={{ textAlign: "left", display: ((pageState === BOLETO && !this.state.processing) ? 'block' : 'none'), height: (this.state.currentPageBoletoFilter < this.state.pageDetailsBoletoFilter.maxPageNumber) ? `${scrollHeight * 0.37}px` : (this.state.currentPageBoletoFilter === this.state.pageDetailsBoletoFilter.maxPageNumber) ? `${scrollHeight * 0.38}px` : `${scrollHeight * 0.35}px` }}>
                        {pageState === BOLETO && <DisplayGrid txn={txnBoleto[this.state.currentPageBoletoFilter - 1]} onSelect={this.onSelect} getNextPage={this.fetchNextPageNumberBoletoFilter} getPreviousPage={this.fetchPrevPageBoletoFilter} pageData={this.state.pageDetailsBoletoFilter} currentPage={this.state.currentPageBoletoFilter} showPagination={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "Empty" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{ textAlign: "center", display: ((pageState === "Empty" && !this.state.processing) ? 'block' : 'none'), marginLeft: "1rem", overflowY: "auto", overflow: 'auto' }}>
                        {pageState === "Empty" && <NoTransactionComponent filtermessage={this.state.clickedText === localeObj.all_operations_filter && this.state.clickVal === "1" ? true : false} />}
                    </div>
                </CSSTransition>
                {this.props.bottom1 && this.state.filterBottomSheet &&
                    <div style={{ textAlign: "center", display: ((this.state.display === "show_filters" && !this.state.processing) ? 'block' : 'none') }}>
                        <BottomSheetForKeys pixKey={ActionArray} heading={localeObj.see_operations} keySelected={this.getFiltered} onBack={this.back} evp_key={localeObj.evp_key} />
                    </div>
                }
                {/* {this.props.calenderOpen &&
                    <div style={{ display: ((pageState === "Date" && !this.state.processing) ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.date_filter} onBack={this.props.onBack} action="none" />
                        {pageState === "Date" && <DateRange confirm={this.onGetDateRange} cancel={this.onCancelRange} />}
                    </div>
                } */}
                <div style={{ display: ((pageState === "loading" && !this.state.processing) ? 'block' : 'none'), marginLeft: "3%", overflowY: "hidden" }}>
                    {pageState === "loading" && <LoadingGrid />}
                </div>
                {this.state.filterBottomSheetForFilters && this.props.bottom1 &&
                    <div style={{ textAlign: "center", display: (this.state.filterBottomSheetForFilters && this.props.bottom1 && !this.state.processing ? "block" : "none") }}>
                        <BottomSheetForKeys pixKey={FilterArray} heading={localeObj.see_transaction_type} keySelected={this.getTypeFiltered} evp_key={localeObj.evp_key} />
                    </div>
                }
                <div style={{ display: ((pageState === "reciept" && !this.state.processing) ? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.pix_receipt} onBack={this.back} action="none" />
                    {pageState === "reciept" && <ReceiptComponent info={this.state.info} showMin={false} complete={this.moveToSucess} cancelBoleto={this.moveToCancel} failure={this.setFailureObject}
                        componentName={PageNames.mainTransactionHistory.reciept} />}
                </div>
                <div style={{ display: ((pageState === "cancel" && !this.state.processing) ? 'block' : 'none') }}>
                    <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                        <ImageInformationComponent header={localeObj.slip_cancel} onCancel={this.back} icon={successLogo}
                            appBar={true} description={localeObj.slip_cancel_txt} btnText={false} />
                    </div>
                </div>
                <div style={{ display: ((pageState === "error" && !this.state.processing) ? 'block' : 'none') }}>
                    {pageState === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.back} />}
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.open}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1rem" }}>
                            <FlexView column>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.filter_by_period}
                                </div>
                                <FlexView align="center" column style={{ marginTop: "0.5rem", alignItems: "center" }} >
                                    {
                                        dateArray.map((opt, index) => (
                                            <BottomButton key={index}
                                                variant="outlined"
                                                onClick={() => this.setDateRangeStatus(opt.action)}
                                                style={{ marginTop: "1rem", border: ((rangeStatus === opt.action) ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((rangeStatus === opt.action) ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                                {opt.text}
                                            </BottomButton>
                                        ))
                                    }
                                </FlexView>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.apply} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        )
    }
}

DisplayTransactions.propTypes = {
    classes: PropTypes.object.isRequired,
    currentState: PropTypes.string,
    customPeriodSelection: PropTypes.func,
    fetchNextPage: PropTypes.func,
    fetchPreviousPage: PropTypes.func,
    resetCurrentPage: PropTypes.func,
    onBack: PropTypes.func,
    showUnauthrizedOption: PropTypes.bool,
    balance: PropTypes.string,
    calenderState: PropTypes.func,
    decimal: PropTypes.string,
    txnHist: PropTypes.array,
    currentPage: PropTypes.number,
    pageData: PropTypes.object,
    boletoData: PropTypes.array,
    bottom1: PropTypes.bool,
    customPeriodSelectionTxns: PropTypes.bool,
    requiredInfo: PropTypes.object,
    isEmpty: PropTypes.bool,
    actOnScanComplete: PropTypes.func,
    showCustomTransactions: PropTypes.bool,
    customPeriodStart: PropTypes.string,
    customPeriodEnd: PropTypes.string,
    fromChat: PropTypes.object,
    multipleSelection1: PropTypes.func,
    disableCustomPeriod: PropTypes.func,
    isBackPressed: PropTypes.bool,
    moveToSchedule: PropTypes.bool,
    currentFilter: PropTypes.string,
    checkUseCase: PropTypes.object,
    onDisplayDetails: PropTypes.func,
    typeFromBackend: PropTypes.object,
    boletosStatus: PropTypes.bool,
    setFilterVal: PropTypes.func,
};

export default withStyles(styles)(DisplayTransactions);