import React from "react";
import "../../../styles/main.css";
import moment from "moment";
import PropTypes from 'prop-types';
import InputThemes from "../../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import constantObjects from "../../../Services/Constants";
import NewUtilities from "../../../Services/NewUtilities";
import ArbiApiService from "../../../Services/ArbiApiService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";

import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import InputPinPageWithValidation from "../../CommonUxComponents/InputPinPageWithValidation";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';

import MetricsService from "../../../Services/MetricsService";
import InvoiceInputComponent from "./InvoiceInputComponent";
import InvoiceDetails from "./InvoiceDetails";
import InvoicePaymentMethod from "./InvoicePaymentMethods";

import error from "../../../images/SpotIllustrations/Warning.png";
import success from "../../../images/SpotIllustrations/Checkmark.png";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import SimulationDetails from "./SimulationDetails";
import BoletoRecieptComponent from "./BoletoRecieptComponent";
import PixRecieptComponent from "./PixRecieptComponent";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import InstallmentInputComponent from "../PayInstallmentComponents/InstallmentInputComponent";
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import Utils from '../../EngageCardComponent/Utils';
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import Log from "../../../Services/Log";

const theme1 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.CreditInvoicePaymentComponents;
var localeObj = {};

export default class InvoicePaymentComp extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            creationState: "initial",
            direction: "",
            reviewInfo: {},
            boletoInfo: {},
            amount: "",
            decimal: "",
            message: "",
            selfie: "",
            snackBarOpen: false,
            noOfInstallments: 0,
            invoiceId: this.props.invoiceId,
            autoDebitStatus: this.props.autoDebit || false,
            installments: 8,
            invoiceTotal: this.props.invoiceTotal,
            expiryDate : moment().format("DD/MM/YYYY"),
            isClickable: false
        };

        this.componentName = PageNameJSON['input'];
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    setTransactionInfo = (transactionInfo) => {
        if (!!transactionInfo && transactionInfo.error) {
            let jsonObj = {}
            jsonObj["title"] = localeObj.invoice_in_installments;
            jsonObj["header"] = localeObj.invoice_payment_failed;
            switch (transactionInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "tariff_fetch_failed":
                    jsonObj["description"] = localeObj.tariff_failed;
                    break;
                case "detalhes_error":
                    jsonObj["header"] = transactionInfo.title;
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = transactionInfo.reason;
                    break;
            }
            this.setState({
                creationState: "error",
                direction: "left",
                errorJson: jsonObj
            })
        } else {
            switch (this.state.creationState) {
                case "input":{
                    let reviewInfo = {
                        "amount": transactionInfo.amount,
                        "decimal": transactionInfo.decimal,
                    }
                    this.setState({
                        direction: "left",
                        reviewInfo: reviewInfo,
                        creationState: "method",
                    });
                }
                    return;
                case "pay_installments":{
                    let reviewPayInfo = {
                        "amount": transactionInfo.amount,
                        "decimal": transactionInfo.decimal,
                        "invoiceInfo": transactionInfo
                    }
                    this.setState({
                        reviewInfo: reviewPayInfo,
                        direction: "left",
                        creationState: "installment_simulation",
                        header: localeObj.invoice_in_installments
                    });
                }
                    return;
                case "installment_simulation":{
                    let installmentInfo = {
                        "amount": transactionInfo.amount,
                        "decimal": transactionInfo.decimal,
                        "invoiceInfo": transactionInfo
                    }
                    this.setState({
                        reviewInfo: installmentInfo,
                        direction: "left",
                        creationState: "installment_simulation_conformation",
                        header: localeObj.invoice_installmemts
                    });
                }
                    break;
                case "installment_simulation_conformation": // installment_simulation_payment_method
                    // let installmentPaymentInfo = {
                    //     "amount": transactionInfo.amount,
                    //     "decimal": transactionInfo.decimal,
                    //     "invoiceInfo": transactionInfo
                    // }
                    this.setState({
                        //reviewInfo: installmentPaymentInfo,
                        direction: "left",
                        creationState: "installment_simulation_payment_method",
                        header: localeObj.invoice_installmemts
                    });
                    break;
                case "installment_simulation_payment_method":
                    this.setState({
                        direction: "left",
                        creationState: "pin",
                        method: transactionInfo,
                        previousCreationState: "installment_simulation_payment_method",
                        header: localeObj.pix_authentication
                    });
                    break;
                case "method":
                    if (parseFloat(this.state.amountLeftToPay) === parseFloat(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal)) {
                        this.setState({
                            method: transactionInfo,
                            paymentType: "full"
                        });
                        if (transactionInfo === localeObj.pay_with_boleto) {
                            this.setState({
                                direction: "left",
                                creationState: "boleto",
                                header: localeObj.invoice_payment
                            });
                        } else {
                            this.setState({
                                direction: "left",
                                creationState: "pin",
                                previousCreationState: "method",
                                header: localeObj.pix_authentication
                            });
                        }
                    } else if(parseFloat(this.state.amountLeftToPay) < parseFloat(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal)) { 
                        this.setState({
                            direction: "left",
                            method: transactionInfo,
                            paymentType: "partial_excess",
                            header: "",
                            creationState: "partial_excess",
                        });
                    } else {
                        this.setState({
                            direction: "left",
                            method: transactionInfo,
                            paymentType: "partial",
                            header: "",
                            creationState: "partial",
                        });
                    }
                    return;
                case "boleto":
                    this.setState({
                        direction: "left",
                        creationState: "pin",
                        previousCreationState: "boleto",
                        header: localeObj.pix_authentication
                    });
                    break;
                case "partial":
                    this.setState({
                        direction: "left",
                        creationState: "pin",
                        previousCreationState: "partial",
                        header: localeObj.pix_authentication,
                    });
                    break;
                case "partial_excess":
                    this.setState({
                        direction: "left",
                        creationState: "pin",
                        previousCreationState: "partial_excess",
                        header: localeObj.pix_authentication,
                    });
                    break;
                case "simulate":
                    if (this.state.method === localeObj.pay_with_boleto) {
                        this.setState({
                            direction: "left",
                            creationState: "boleto",
                            header: ""
                        });
                    } else {
                        this.setState({
                            direction: "left",
                            creationState: "pin",
                            previousCreationState: "simulate",
                            header: localeObj.pix_authentication
                        });
                    }
                    break;
                case "pin":
                    if (this.state.previousCreationState === "installment_simulation_payment_method") {
                        this.payInstallmentBill(transactionInfo);
                    } else {
                        this.payTheBill(transactionInfo);
                    }
                    break;
                case "boleto_success":
                    this.setState({
                        direction: "left",
                        creationState: "doc",
                        previousCreationState: "boleto",
                        header: localeObj.pix_authentication
                    });
                    break;
                case "success":
                    // Link to settings page from here
                    this.openSettingsPage();
                    break;
                default:
                    this.goToHomePage();
                    break;
            }
        }
    }

    getInvoiceStatusString = (invoiceStatus) => {
        let invoiceText = "";
        switch(invoiceStatus) {
          case "open" : invoiceText = localeObj.open_invoice; break;
          case "closed" : invoiceText = localeObj.closed_invoice; break;
          case "partial" : invoiceText = localeObj.partially_paid; break;
          case  "paid": invoiceText = localeObj.paid_invoice; break;
          case "installment": invoiceText = localeObj.installments; break;
          case "future":invoiceText = localeObj.future_invoice; break;
          default : invoiceText = localeObj.closed_invoice; break;
        }
        return invoiceText;
    
      }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.back();
        }
        this.showProgressDialog();
        ArbiApiService.getInvoiceDetails(this.props.invoiceId, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processInvoiceDetails(response.result);
                if (processorResponse.success) {
                    this.setState({
                        minLimit: processorResponse.minPayment,
                        amountLeftToPay: processorResponse.invoiceValue - processorResponse.alreadyPaid,
                        invoiceContent: processorResponse,
                        invoiceDetailsStatus: this.getInvoiceStatusString(processorResponse.status),
                        closedInvoiceDate : processorResponse.closeDate,
                        payableDate: processorResponse.payableDate,
                        nationalCharges : processorResponse.nationalCharges,
                        internationalCharges : processorResponse.internationalCharges,
                        taxes : processorResponse.taxes,
                        pendingBalance : processorResponse.pendingBalance,
                        invoiceTotal : processorResponse.invoiceValue,
                        creationState: "input",
                        header: localeObj.invoice_payment
                    })
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });

    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName)
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

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
    }

    openSettingsPage = () => {
        this.props.history.replace({
            pathname: "/creditCardSettingsPage",
            transition: "right"
        });
    }

    back = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "input":
                case "boleto_success":
                case "success":
                case "pix_success":
                case "error":
                    this.goToHomePage();
                    break;
                case "details":
                    this.setState({
                        creationState: "input",
                        direction: "right",
                        header: localeObj.invoice_payment
                    })
                    break;
                case "method":
                    this.setState({
                        creationState: "input",
                        direction: "right",
                        header: localeObj.invoice_payment
                    })
                    break;
                case "partial":
                case "partial_excess":
                    this.setState({
                        creationState: "method",
                        direction: "right",
                        header: localeObj.invoice_payment
                    })
                    break;
                case "pin":
                    if(this.state.previousCreationState === "partial"){
                        this.setState({
                            creationState: "partial",
                            direction: "right",
                            header: ""
                        });
                    } else if(this.state.previousCreationState === "partial_excess"){
                        this.setState({
                            creationState: "partial_excess",
                            direction: "right",
                            header: ""
                        });
                    } else {
                        this.setState({
                            creationState: this.state.previousCreationState,
                            direction: "right",
                            header: localeObj.invoice_payment
                        });
                    }
                    break;
                case "boleto":
                    this.setState({
                        creationState: "method",
                        direction: "right",
                        header: localeObj.invoice_payment
                    })
                    break;
                case "simulate":
                    this.setState({
                        creationState: "partial",
                        direction: "right",
                        header: ""
                    })
                    break;
                case "sucessPage":
                    this.goToDimoMainScreen();
                    break;
                default:
                    this.goToHomePage();
                    break;
            }
        }
    }

    goToHomePage = () => {
        if(this.props.history.location && this.props.history.location.from === "walletlanding") {
            this.props.history.replace({ pathname: "/newWalletLaunch", transition:"right" ,from: "invoicepayment"})
        } else {
            this.props.onBackHome();
        }
    }

    goToDimoMainScreen = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    simulatePayment = () => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["invoiceId"] = this.props.invoiceId;
        jsonObject["value"] = parseFloat(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal);
        ArbiApiService.simulatePayment(jsonObject, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processSimulationPayment(response.result);
                if (processorResponse.success) {
                    this.setState({
                        simulateDetails: processorResponse,
                        header: localeObj.invoice_payment_resume,
                        creationState: "simulate",
                        simulationId: processorResponse.simulationId,
                        direction: "left"
                    })
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        })
    };

    simulatePaymentInstallments = (reviewInfo) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["invoiceId"] = this.props.invoiceId;
        jsonObject["value"] = parseFloat(reviewInfo.amount + "." + reviewInfo.decimal);
        jsonObject["installments"] = this.state.installments;
        ArbiApiService.simulatePaymentInstallments(jsonObject).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processSimulationPaymentInstallment(response.result);
                if (processorResponse.success) {
                    this.setState({
                        simulateDetails: processorResponse,
                        header: localeObj.invoice_payment_resume,
                        creationState: "simulate",
                        direction: "left"
                    })
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        })
    }

    payTheBill = (pin) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["invoiceId"] = this.props.invoiceId;
        jsonObject["value"] = parseFloat(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal);
        jsonObject["method"] = this.getMethod();
        jsonObject["dateOfPayment"] = new Date();
        jsonObject["installments"] = this.state.noOfInstallments;
        jsonObject["token"] = pin;
        switch (this.getMethod()) {
            case 1:
                ArbiApiService.payTheBillWithBoleto(jsonObject).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processBoletoPaymentInfo(response.result);
                        if (processorResponse.success) {
                            this.setState({
                                creationState: "boleto_success",
                                direction: "left",
                                header: localeObj.invoice_payment,
                                boletoInfo: {
                                    "value": NewUtilities.parseSalary(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal),
                                    "number": processorResponse.number,
                                    "doc": processorResponse.doc,
                                    "expiryDate": moment(processorResponse.expiryDate).format('DD/MM/YYYY')
                                }
                            });
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.setTransactionInfo(errorJson);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                });
                break;
            case 2:
                ArbiApiService.payTheBillWithPix(jsonObject).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processPixPaymentInfo(response.result);
                        if (processorResponse.success) {
                            this.setState({
                                code: "data:image/png;base64, " + processorResponse.data,
                                format: processorResponse.format,
                                //expiryDate: processorResponse.expiryDate,
                                pixCode: processorResponse.pixCode,
                                header: localeObj.invoice_payment,
                                creationState: "pix_success",
                                direction: "left"
                            });
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.setTransactionInfo(errorJson);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                });
                break;
            case 0:
            default:
                if(this.props && this.props.location && this.props.location.state && this.props.location.state.entryPoint === "INVOICE_DUE_PAYMENT_SMARTALERT_CLICK") {
                    ImportantDetails.transactionEntryPoint = this.props.location.state.entryPoint;
                }
                ArbiApiService.payTheBillDirectDebit(jsonObject, this.componentName).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processDirectDebitPaymentInfo(response.result);
                        if (processorResponse.success) {
                            this.setState({
                                paidAmount: NewUtilities.parseSalary(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal),
                                creationState: "success",
                                direction: "left"
                            });
                            ImportantDetails.transactionEntryPoint = "";
                            let credit_data = androidApiCalls.getFromPrefs(Utils.CREDIT_PAYMENT);
                            if(credit_data || credit_data !== "" || credit_data.length !== 0) {
                                ArbiApiService.getInvoiceDetails(this.props.invoiceId).then(response => {
                                    if (response && response.success) {
                                        this.hideProgressDialog();
                                        let processorResponse = ArbiResponseHandler.processInvoiceDetails(response.result);
                                        Log.sDebug("Invoice Details", JSON.stringify(processorResponse));
                                        if (processorResponse && processorResponse.success) {
                                            let payed_data = JSON.parse(credit_data).filter(item => item.clientId === ImportantDetails.clientKey);
                                            if(processorResponse.invoiceValue === 0) {
                                                let convertArrayStr = payed_data.map(obj => JSON.stringify(obj));
                                                let filteredArray = JSON.parse(credit_data).filter(obj => !convertArrayStr.some(str => JSON.stringify(obj) === str));
                                                let dataToStore = filteredArray.length > 0 ? JSON.stringify(filteredArray) : "";
                                                androidApiCalls.storeToPrefs(Utils.CREDIT_PAYMENT, dataToStore);
                                            } else {
                                                let updatedData = payed_data.map(obj => ({ ...obj }));
                                                updatedData[0].amount = processorResponse.invoiceValue - processorResponse.alreadyPaid;
                                                let convertArrayStr = payed_data.map(obj => JSON.stringify(obj));
                                                let filteredArray = JSON.parse(credit_data).filter(obj => !convertArrayStr.some(str => JSON.stringify(obj) === str));
                                                credit_data = filteredArray.concat(updatedData);
                                                androidApiCalls.storeToPrefs(Utils.CREDIT_PAYMENT, JSON.stringify(credit_data));
                                                Log.sDebug("Updated CC Amount Data", androidApiCalls.getFromPrefs(Utils.CREDIT_PAYMENT));
                                            }
                                        } else {
                                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                                            this.setTransactionInfo(errorJson);
                                        }
                                    } else {
                                        this.hideProgressDialog();
                                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                                        this.setTransactionInfo(errorJson);
                                    }
                                })
                            } else {
                                this.hideProgressDialog();
                            }
                        } else {
                            ImportantDetails.transactionEntryPoint = "";
                            this.hideProgressDialog();
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.setTransactionInfo(errorJson);
                        }
                    } else {
                        ImportantDetails.transactionEntryPoint = "";
                        this.hideProgressDialog();
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                });
                break;
        }
    };

    fetchTariff = () => {
        let jsonObject = {};
        jsonObject["amount"] = parseFloat(this.state.boletoInfo.amount + "." + this.state.boletoInfo.decimal);
        jsonObject["code"] = 4032; // Boleto generation code
        ArbiApiService.getTariff(jsonObject, this.componentName).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse.success) {
                    return processorResponse.tariff;
                } else {
                    let errorObj = {};
                    errorObj["error"] = true;
                    errorObj["reason"] = "tariff_fetch_failed";
                    this.setTransactionInfo(errorObj);
                    //Log.sDebug("Tariff failed");
                }
            } else {
                let errorObj = {};
                errorObj["error"] = true;
                errorObj["reason"] = "tariff_fetch_failed";
                this.setTransactionInfo(errorObj);
                //Log.sDebug("Tariff failed");
            }
        });
    }

    payInstallmentBill = (pin) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["invoiceId"] = this.props.invoiceId;
        jsonObject["value"] = parseFloat(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal);
        jsonObject["method"] = this.getMethod();
        jsonObject["dateOfPayment"] = new Date();
        jsonObject["installments"] = this.state.noOfInstallments;
        jsonObject["token"] = pin;
        jsonObject["siumulationId"] = this.state.reviewInfo.siumulationId;
        switch (this.getMethod()) {
            case 1:
                ArbiApiService.payTheBillWithBoleto(jsonObject).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processBoletoPaymentInfo(response.result);
                        if (processorResponse.success) {
                            this.setState({
                                creationState: "boleto_success",
                                direction: "left",
                                header: localeObj.invoice_payment,
                                info: {
                                    "value": NewUtilities.parseSalary(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal),
                                    "number": processorResponse.number,
                                    "doc": processorResponse.doc,
                                    "expiryDate": moment(processorResponse.expiryDate).format('DD/MM/YYYY')
                                }
                            });
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.setTransactionInfo(errorJson);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                });
                break;
            case 2:
                ArbiApiService.payTheBillWithPix(jsonObject).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processPixPaymentInfo(response.result);
                        if (processorResponse.success) {
                            this.setState({
                                code: "data:image/png;base64, " + processorResponse.data,
                                format: processorResponse.format,
                                expiryDate: processorResponse.expiryDate,
                                pixCode: processorResponse.pixCode,
                                header: localeObj.invoice_payment,
                                creationState: "pix_success",
                                direction: "left"
                            });
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.setTransactionInfo(errorJson);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                });
                break;
            case 0:
            default:
                ArbiApiService.payTheBillDirectDebit(jsonObject, this.componentName).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processDirectDebitPaymentInfo(response.result);
                        if (processorResponse.success) {
                            this.setState({
                                paidAmount: NewUtilities.parseSalary(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal),
                                creationState: "success",
                                direction: "left"
                            });
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.setTransactionInfo(errorJson);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                });
                break;
        }
    };

    getMethod = () => {
        switch (this.state.method) {
            case localeObj.pay_with_balance: return 0;
            case localeObj.pay_with_boleto: return 1;
            case localeObj.pay_with_pix: return 2;
            default: return 3;
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    seeDetails = () => {
        this.setState({
            fromDetailState: this.state.creationState,
            creationState: "details",
            header: localeObj.invoice_details,
            direction: "left"
        })
    }

    payInInstallments = () => {
        this.setState({
            creationState: "pay_installments",
            direction: "left"
        })
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return; 
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.credit_card_settings);
        this.props.history.replace({ pathname: "/chat", transition: "right"});
    }

    render() {
        const creation = this.state.creationState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div style={{ overflowX: "hidden" }}>
                {creation !== "error" && creation !== "success" && 
                    <ButtonAppBar header={this.state.header} onBack={this.back} action="none" />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "input" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "input" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "input" && <InvoiceInputComponent requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} minLimit={this.state.minLimit}
                            invoiceValue={this.state.invoiceTotal} componentName={PageNameJSON.input} seeDetails={this.seeDetails} amountLeftToPay={this.state.amountLeftToPay} payInInstallments={this.payInInstallments} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pay_installments" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "pay_installments" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "pay_installments" && <InstallmentInputComponent requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} minimumDownPayment={this.state.minLimit}
                            componentName={PageNameJSON.pay_installments} seeDetails={this.seeDetails} amountLeftToPay={this.state.amountLeftToPay} invoiceId={this.props.invoiceId} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "details" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "details" && <InvoiceDetails details={this.state.invoiceContent} onBack={this.back} amountLeftToPay={this.state.amountLeftToPay} invoiceStatus={this.state.invoiceDetailsStatus}
                            invoiceValue={this.state.invoiceTotal} componentName={PageNameJSON.details} processDueDate = {this.props.processDueDate} goToChatbot={this.goToChatbot}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "method" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "method" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "method" && <InvoicePaymentMethod action={this.setTransactionInfo} details={this.state.invoiceContent} requiredInfo={this.state.reviewInfo}
                            invoiceValue={this.state.invoiceTotal} componentName={PageNameJSON.method} changeEditStatus={this.back} amountLeftToPay={this.state.amountLeftToPay} />}
                    </div>
                </CSSTransition>
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "installment_simulation" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "installment_simulation" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "installment_simulation" && <SimulationInstallmentComp action={this.setTransactionInfo} details={this.state.invoiceContent} requiredInfo={this.state.reviewInfo}
                            invoiceValue={this.state.invoiceTotal} componentName={PageNameJSON.method} changeEditStatus={this.back} amountLeftToPay={this.state.amountLeftToPay} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "installment_simulation_conformation" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "installment_simulation_conformation" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "installment_simulation_conformation" && <SimulationInstallmentConfirmaitonComp action={this.setTransactionInfo} details={this.state.invoiceContent} requiredInfo={this.state.reviewInfo}
                            invoiceValue={this.state.invoiceTotal} componentName={PageNameJSON.method} changeEditStatus={this.back} amountLeftToPay={this.state.amountLeftToPay} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "installment_simulation_payment_method" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "installment_simulation_payment_method" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "installment_simulation_payment_method" && <InstallmentPaymentComponent action={this.setTransactionInfo} details={this.state.invoiceContent} requiredInfo={this.state.reviewInfo}
                            invoiceValue={this.state.invoiceTotal} componentName={PageNameJSON.method} changeEditStatus={this.back} amountLeftToPay={this.state.amountLeftToPay} />}
                    </div>
                </CSSTransition> */}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "pin" && <InputPinPageWithValidation history = {this.props.history} confirm={this.setTransactionInfo} componentName={PageNameJSON.pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "boleto" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "boleto" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "boleto" && <ImageInformationComponent type={PageNameJSON.boleto} header={localeObj.three_business_days} onCancel={this.back}
                            icon={error} appBar={false} btnText={localeObj.agreed} next={this.setTransactionInfo} description={localeObj.business_reminder} />}
                    </div>
                </CSSTransition>
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "boleto_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "boleto_success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "boleto_success" && <ReceiptComponent info={this.state.info} showMin={true} complete={this.back} componentName={PageNameJSON.doc}/>}
                    </div>
                </CSSTransition> */}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "partial" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "partial" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "partial" && <ImageInformationComponent type={PageNameJSON.partial} header={localeObj.not_paying_full}
                            icon={error} appBar={false} btnText={localeObj.agreed} next={this.setTransactionInfo} description={localeObj.not_paying_full_desc} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "partial_excess" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "partial_excess" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "partial_excess" && <ImageInformationComponent type={PageNameJSON.partial_excess} header={this.state.autoDebitStatus === true ? localeObj.paying_excess_header_autodebit_enabled : localeObj.paying_excess_header}
                            icon={error} appBar={false} btnText={localeObj.agreed} next={this.setTransactionInfo} description={this.state.autoDebitStatus === true ? localeObj.paying_excess_desc_autodebit_enabled : localeObj.paying_excess_desc} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "simulate" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "simulate" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "simulate" && <SimulationDetails details={this.state.simulateDetails} requiredInfo={this.state.reviewInfo}
                            next={this.setTransactionInfo} componentName={PageNameJSON.simulate} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={this.state.paymentType === "full" ? localeObj.invoice_paid : localeObj.invoice_paid_partially}
                                    appBar={false} btnText={localeObj.back_home} type={PageNameJSON["success"]} next={this.back} icon={success}
                                    description={GeneralUtilities.formattedString(localeObj.invoice_paid_balance, [this.state.paidAmount])} />
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "boleto_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "boleto_success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "boleto_success" && <BoletoRecieptComponent info={this.state.boletoInfo} complete={this.back} componentName={PageNameJSON.boleto_success} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pix_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "pix_success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "pix_success" && <PixRecieptComponent requiredInfo={this.state.reviewInfo} QrCode={this.state.code} expiryDate={this.state.expiryDate}
                            componentName={PageNameJSON.pix_success} pixCode={this.state.pixCode} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.back} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

InvoicePaymentComp.propTypes = {
    componentName: PropTypes.string,
    setTransactionInfo: PropTypes.func,
    requiredInfo: PropTypes.shape({
        amount: PropTypes.string,
        decimal: PropTypes.string,
    }),
    amountLeftToPay: PropTypes.number,
    invoiceValue: PropTypes.number,
    minLimit: PropTypes.number,
    invoiceId: PropTypes.string,
    seeDetails: PropTypes.func,
    payInInstallments: PropTypes.func,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object,
    processDueDate: PropTypes.string,
    onBackHome: PropTypes.func,
    autoDebit: PropTypes.bool,
    invoiceTotal: PropTypes.number,
};
