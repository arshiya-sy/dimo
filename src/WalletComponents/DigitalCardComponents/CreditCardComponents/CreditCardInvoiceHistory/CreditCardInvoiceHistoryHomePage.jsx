import React from "react";
import ArbiApiService from "../../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../../Services/ArbiResponseHandler";
import localeService from "../../../../Services/localeListService";
import ButtonAppBar from "../../../CommonUxComponents/ButtonAppBarComponent";
import constantObjects from "../../../../Services/Constants";
import moment from "moment";
import PropTypes from 'prop-types';

import "../../../../styles/main.css"
import CustomizedProgressBars from "../../../CommonUxComponents/ProgressComponent";
import InvoiceHistoryDisplayGrid from "./InvoiceHistoryDisplayGrid";
import { CSSTransition } from 'react-transition-group';
import GeneralUtilities from "../../../../Services/GeneralUtilities";
import InputThemes from "../../../../Themes/inputThemes";
import { withStyles } from '@material-ui/core/styles';
import FutureInvoiceDisplayGrid from "./FutureInvoiceDisplayGrid";
import ReceiptComp from "./ReceiptComp";
import NoInvoiceHistoryComponent from "./NoInvoiceHistory";
import TransactionHistoryReceipt from "./TransactionHistoryReceipt";
import InvoicePaymentComp from "../../CreditPaymentComponents/InvoicePaymentComponent";

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider } from '@material-ui/core/styles';
import PageNames from "../../../../Services/PageNames";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;

var localeObj = {};
class CreditCardInvoiceHistoryHomePage extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            invoiceHistoryfromDate: moment().subtract(3, 'year'),
            invoiceHistoryToDate: new Date(),
            currentState: "loading",
            progressBar: false,
            invoiceHistoryData: [],
            futureInvoiceData: [],
            invoiceDetails: {},
            snackBarOpen: false,
            message: "",
            appBar: "",
            isFutureInvoice: false,
            invoiceMonthArray:[]
        }
        this.componentName = PageNames["CreditCardComponents"]["invoice_history"]
        this.onSelect = this.onSelect.bind(this);
        this.showFutureInvoices = this.showFutureInvoices.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        this.showProgressDialog();
        window.onBackPressed = () => {
            this.onBack();
        }
        this.setState({
            appBar: localeObj.invoice_history
        })

        ArbiApiService.getCreditCardInvoiceHistory(this.state.invoiceHistoryfromDate.toISOString(), this.state.invoiceHistoryToDate.toISOString()).then(response => {
            //Log.sDebug("getCreditCardInvoiceHistory, response" + JSON.stringify(response));
            if (response.success) {
                //Log.sDebug("getCreditCardInvoiceHistory, response.success" + JSON.stringify(response));
                let processorResponse = ArbiResponseHandler.processCreditCardInvoiceHistoryData(response.result);
                //Log.sDebug("getCreditCardInvoiceHistory, processorResponse" + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    this.hideProgressDialog();
                    let invoiceHistoryList = GeneralUtilities.formInvoiceHistoryDivider(processorResponse.invoiceHistoryData);
                    //Log.sDebug("getCreditCardInvoiceHistory, invoiceHistoryList" + JSON.stringify(invoiceHistoryList));
                    if (GeneralUtilities.isArrayEmpty(invoiceHistoryList)) {
                        this.setState({
                            currentState: "Empty"
                        })

                    } else {
                        this.hideProgressDialog();
                        this.setState({
                            invoiceHistoryData: invoiceHistoryList,
                            currentState: "invoiceHistory"
                        })

                    }

                } else {
                    this.hideProgressDialog();
                    //Log.sDebug("getCreditCardInvoiceHistory, processorResponse, failed");
                    this.setState({ 
                        currentState: "Empty",
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }

            } else {
                this.hideProgressDialog();
                //Log.sDebug("getCreditCardInvoiceHistory, failed");
                this.setState({
                    currentState: "Empty",
                    snackBarOpen: true,
                    message: localeObj.generic_error
                })
            }

        })

    }

    showProgressDialog = () => {
        this.setState({
            progressBar: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            progressBar: false
        })
    }


    onBack = () => {
        if (this.state.currentState === "futureInvoice" || this.state.currentState === "invoiceDetails") {
            this.setState({
                currentState: "invoiceHistory",
                direction: "right",
                appBar: localeObj.invoice_history
            })
        } else if (this.state.currentState === "futureInvoiceDetails") {
            this.setState({
                currentState: "futureInvoice",
                direction: "right",
                appBar: localeObj.future_invoices
            })
        } else if ((this.state.currentState === "transactionDetails" || this.state.currentState === "invoicePayment") && this.state.isFutureInvoice) {
            this.setState({
                currentState: "futureInvoiceDetails",
                direction: "right",
                appBar: localeObj.future_invoices
            })
        } else if (this.state.currentState === "transactionDetails" || this.state.currentState === "invoicePayment") {
            this.setState({
                currentState: "invoiceDetails",
                direction: "right",
                appBar: localeObj.invoice_history
            })
        } else {
            this.props.onBack();
        }

    }

    onSelect = (transaction, invoiceMonthArray) => {
        //Log.sDebug("onSelect" + JSON.stringify(transaction));
        this.showProgressDialog();
        this.setState({
            invoiceMonthArray: invoiceMonthArray,
        });
        ArbiApiService.getCreditCardInvoiceHistoryDetails(transaction.invoiceId, this.componentName).then(response => {
            //Log.sDebug("getCreditCardInvoiceHistoryDetails, response: " + JSON.stringify(response));
            
            if (response.success) {  
                let processorResponse = ArbiResponseHandler.processCreditCardInvoiceHistoryDetails(response.result);
                //Log.sDebug("processorResponse.success: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    //Log.sDebug("processorResponse.success: ");
                    this.setState({
                        invoiceDetails: processorResponse,
                        currentState: "invoiceDetails",
                        invoiceId: transaction.invoiceId,
                        invoiceData: transaction
                    }, () => {
                        this.hideProgressDialog();
                    })
                } else {
                    //Log.sDebug("getCreditCardInvoiceHistoryDetails, processorResponse, failed");
                    this.hideProgressDialog();
                    this.setState({
                        currentState: "Empty",
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }

            } else {
                //Log.sDebug("getCreditCardInvoiceHistoryDetails, failed");
                this.hideProgressDialog();
                this.setState({
                    currentState: "Empty",
                    snackBarOpen: true,
                    message: localeObj.generic_error
                })
            }
        })



    }


    onSelectTransaction = (transactionDetails, isFutureInvoice=false) => {
        //Log.sDebug("onSelectTransaction, transactionDetails: " + JSON.stringify(transactionDetails));
        this.setState({
            currentState: "transactionDetails",
            transactionDetails: transactionDetails,
            appBar: localeObj.transaction_receipt,
            isFutureInvoice: isFutureInvoice
        })

    }

    payInvoice = (invoiceData, invoiceId, isFutureInvoice=false) => {
        //Log.sDebug("Invoice ID: " + invoiceId + "invoiceData: " + JSON.stringify(invoiceData) + " isFutureInvoice:" + isFutureInvoice )
        this.setState({
            currentState: "invoicePayment",
            invoiceTotal: invoiceData.amount,
            invoiceId: invoiceId,
            isFutureInvoice: isFutureInvoice
        })
    }

    

    onSelectFutureInvoice = (transaction, invoiceMonthArray) => {
        //Log.sDebug("onSelectFutureInvoice" + JSON.stringify(transaction));
        this.showProgressDialog();
        this.setState({
            invoiceMonthArray: invoiceMonthArray
        });
        ArbiApiService.getCreditCardFutureInvoiceDetails(transaction.futureInvoiceId, this.componentName).then(response => {
            if (response.success) {
                //Log.sDebug("getCreditCardFutureInvoiceDetails, response.success" + JSON.stringify(response));
                let processorResponse = ArbiResponseHandler.processCreditCardFutureInvoiceDetails(response.result);
                //Log.sDebug("processorResponse.success: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    //Log.sDebug("processorResponse.success: ");
                    this.hideProgressDialog();
                    this.setState({
                        invoiceDetails: processorResponse,
                        currentState: "futureInvoiceDetails",
                        invoiceId: transaction.futureInvoiceId,
                        invoiceData: transaction
                    });
                } else {
                    //Log.sDebug("getCreditCardFutureInvoiceDetails, processorResponse, failed");
                    this.hideProgressDialog();
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }

            } else {
                //Log.sDebug("getCreditCardFutureInvoiceDetails, failed");
                this.hideProgressDialog();
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


    showFutureInvoices() {
        //Log.sDebug("showFutureInvoices");
        this.showProgressDialog();
        ArbiApiService.getCreditCardFutureInvoiceList(this.state.invoiceHistoryToDate.toISOString(), this.componentName).then(response => {
            if (response.success) {
                //Log.sDebug("getCreditCardFutureInvoiceList, response.success" + JSON.stringify(response));
                let processorResponse = ArbiResponseHandler.processCreditCardFutureInvoiceData(response.result);
                //Log.sDebug("getCreditCardFutureInvoiceList, processorResponse: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    let futureInvoiceList = GeneralUtilities.formInvoiceHistoryDivider(processorResponse.futureInvoiceData);
                    this.hideProgressDialog();
                    if (GeneralUtilities.isArrayEmpty(futureInvoiceList)) {
                        this.setState({
                            currentState: "Empty",
                            appBar: localeObj.future_invoices
                        })

                    } else {
                        this.setState({
                            futureInvoiceData: futureInvoiceList,
                            currentState: "futureInvoice",
                            appBar: localeObj.future_invoices
                        })
                    }
                } else {
                    //Log.sDebug("getCreditCardFutureInvoiceDetails, processorResponse, failed");
                    this.hideProgressDialog();
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }


            } else {
                //Log.sDebug("getCreditCardFutureInvoiceList, failed");
                this.hideProgressDialog();
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.generic_error
                })
            }
        })
    }


    render() {
        return (
            <div>
                 {this.state.currentState !== "invoicePayment" &&
                <div> 
                    <ButtonAppBar header={this.state.appBar} onBack={this.onBack} action="none" />
                </div>}
                <div>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                    {!this.state.progressBar &&
                        <div>

                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "invoiceHistory" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <div style={{ display: ((this.state.currentState === "invoiceHistory" && !this.state.progressBar) ? 'block' : 'none'), textAlign: "left" }}>
                                    {this.state.currentState === "invoiceHistory" && <InvoiceHistoryDisplayGrid txn={this.state.invoiceHistoryData} showFutureInvoices={this.showFutureInvoices} onSelect={this.onSelect} onBack={this.onBack} />}
                                </div>
                            </CSSTransition>
                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "futureInvoice" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <div style={{ display: ((this.state.currentState === "futureInvoice" && !this.state.progressBar) ? 'block' : 'none'), textAlign: "left"}}>
                                    {this.state.currentState === "futureInvoice" && <FutureInvoiceDisplayGrid txn={this.state.futureInvoiceData} onSelectFutureInvoice={this.onSelectFutureInvoice} onBack={this.onBack} />}
                                </div>
                            </CSSTransition>

                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={(this.state.currentState === "invoiceDetails" || this.state.currentState === "futureInvoiceDetails") ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <ReceiptComp invoiceDetails={this.state.invoiceDetails} invoiceId = {this.state.invoiceId}  invoiceData={this.state.invoiceData} invoiceMonthArray={ this.state.invoiceMonthArray} onSelect={this.state.currentState === "invoiceDetails" ? this.onSelect : this.onSelectFutureInvoice} onSelectTransaction={this.onSelectTransaction} payInvoice = {this.payInvoice} />
                            </CSSTransition>

                             <CSSTransition mountOnEnter={true} unmountOnExit={true} in={(this.state.currentState === "invoicePayment") ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <InvoicePaymentComp invoiceTotal={this.state.invoiceTotal} invoiceId={this.state.invoiceId} onBackHome = {this.onBack}/> 
                             </CSSTransition>
                                       
                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "transactionDetails" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <TransactionHistoryReceipt transactionData={this.state.transactionDetails} />
                            </CSSTransition>

                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "Empty" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <div style={{ display: ((this.state.currentState === "Empty" && !this.state.progressBar) ? 'block' : 'none'), marginLeft: "1rem", overflowY: "auto", textAlign: "center" }}>
                                    {this.state.currentState === "Empty" && <NoInvoiceHistoryComponent msg={localeObj.no_invoice_history} />}
                                </div>
                            </CSSTransition>
                        </div>
                    }

                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>


        )
    }

}
CreditCardInvoiceHistoryHomePage.propTypes = {
    history: PropTypes.object.isRequired,
    onBack: PropTypes.func,
  };
export default withStyles(styles)(CreditCardInvoiceHistoryHomePage); 