import React from "react";

import localeService from "../../../../Services/localeListService";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import HistoryDisplayGrid from "./HistoryDisplayGrid";
import ArbiApiService from "../../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../../Services/ArbiResponseHandler";
import NoInvoiceHistoryComponent from "./NoInvoiceHistory";
import GeneralUtilities from "../../../../Services/GeneralUtilities";
import InputThemes from "../../../../Themes/inputThemes";
import ButtonAppBar from "../../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../../../CommonUxComponents/ProgressComponent";
import { CSSTransition } from 'react-transition-group';
import TransactionHistoryReceipt from "./TransactionHistoryReceipt";
import constantObjects from "../../../../Services/Constants";
import moment from "moment";
import ColorPicker from "../../../../Services/ColorPicker";
import CommonButtons from "../../../CommonUxComponents/CommonButtons";
import { DateRange } from "@mui/icons-material";

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider } from '@material-ui/core/styles';
import PageNames from "../../../../Services/PageNames";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const FilterButton = CommonButtons.ButtonTypeFilter;
var localeObj = {};
class CreditCardHistoryHomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBar: false,
            currentState: "",
            transactionDetails: [],
            fromDate: moment().subtract(3, 'year'),
            toDate: new Date(),
            appBar: "",
            clickVal: "thirty_days",
            calenderOpen: false
        }
        this.componentName = PageNames["CreditCardComponents"]["credit_card_history_homepage"]
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        this.getTransactionHistory(moment().subtract(29, "days"), moment(), 1);
    }

    onBack = () => {
        if (this.state.currentState === "transactionDetails") {
            this.props.history.replace({ pathname: "/creditCardHistoryPage", transition: "right" });
        } else {
            this.props.history.replace({ pathname: "/creditCard", transition: "right" });
        }

    }

    onSelectTransaction = (transactionDetails) => {
        //Log.sDebug("onSelectTransaction, transactionDetails: " + JSON.stringify(transactionDetails));
        this.setState({
            currentState: "transactionDetails",
            transactionDetails: transactionDetails,
            appBar: localeObj.transaction_receipt
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

    filterTransacations = (action) => {
        switch (action) {
            case "thirty_days":
                this.getTransactionHistory(moment().subtract(30, "days"), moment(), 1);
                this.setState({
                    clickVal: "thirty_days"
                });
                break;
            case "sixty_days":
                this.getTransactionHistory(moment().subtract(60, "days"), moment(), 1);
                this.setState({
                    clickVal: "sixty_days"
                });
                break;
            case "ninety_days":
                this.getTransactionHistory(moment().subtract(90, "days"), moment(), 1);
                this.setState({
                    clickVal: "ninety_days"
                });
                break;
            case "date_filter":
                this.setState({
                    calenderOpen: true,
                    clickVal: "date_filter"
                })

                break;
            case "in_contestation":
                this.getTransactionHistory(moment().subtract(1, "year"), moment(), 2);
                this.setState({
                    clickVal: "in_contestation"
                });
                break;
            case "contestation_approved":
                this.getTransactionHistory(moment().subtract(1, "year"), moment(), 3);
                this.setState({
                    clickVal: "contestation_approved"
                });
                break;
            case "contestation_rejected":
                this.getTransactionHistory(moment().subtract(1, "year"), moment(), 4);
                this.setState({
                    clickVal: "contestation_rejected"
                });
                break;
            default:
                this.getTransactionHistory(moment().subtract(30, "days"), moment(), 1);
                this.setState({
                    clickVal: "thirty_days"
                });
                break;

        }

    }

    getTransactionHistory = (fromDate, toDate, processed) => {
        this.showProgressDialog();
        ArbiApiService.getCreditCardTransactionHistory(fromDate.toISOString(), toDate.toISOString(), this.componentName).then(response => {
            if (response.success) {
                //Log.sDebug("getCreditCardTransactionHistory, response.success" + JSON.stringify(response));
                let processorResponse = ArbiResponseHandler.processCreditCardTransactionHistoryData(response.result);
                //Log.sDebug("getCreditCardTransactionHistory, processorResponse" + JSON.stringify( processorResponse));
                if (processorResponse.success) {
                    let tranArray = [];
                    if (processed === 2 || processed === 3 || processed === 4)
                        tranArray = this.getFilteredTransactionHistory(processorResponse.transactionData, processed);
                    else
                        tranArray = processorResponse.transactionData;
                    let transactionHistoryList = GeneralUtilities.transactionHistoryDateOrganizer(tranArray, localeObj);
                    let finalArray = transactionHistoryList.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
                    //Log.sDebug("transactionHistoryList:" + JSON.stringify(finalArray));
                    //Log.sDebug("transactionHistoryList--" + GeneralUtilities.isArrayEmpty(finalArray));
                    this.hideProgressDialog();
                    if (GeneralUtilities.isArrayEmpty(finalArray)) {
                        this.setState({
                            currentState: "Empty"
                        })

                    } else {
                        this.setState({
                            transactionHistoryData: finalArray,
                            currentState: "transactionHistory"
                        })

                    }

                } else {
                    //Log.sDebug("getCreditCardTransactionHistory, processorResponse, failed");
                    this.hideProgressDialog();
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.generic_error
                    })
                }

            } else {
                //Log.sDebug("getCreditCardTransactionHistory, failed");
                this.hideProgressDialog();
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.generic_error
                })
            }

        })


    }

    getFilteredTransactionHistory = (transactionData, processed) => {
        let resArray = [];
        for (let data of transactionData) {
            if (data.processed === processed) {
                resArray.push(data);
            }
        }
        return resArray;

    }
    onGetDateRange = (rangeObj) => {
        let fromDate = moment(rangeObj.startDate).startOf('day').subtract(1, "minute");
        let endDate = moment(rangeObj.endDate).endOf('day').add(1, "minute");
        this.getTransactionHistory(fromDate, endDate, 1);

    }
    onCancelRange = () => {

        this.setState({
            calenderOpen: false
        });
    }




    render() {
        const screenWidth = window.screen.width;

        const buttonArray = [
            {
                text: localeObj.thirty_days,
                index: 1,
                action: "thirty_days"
            },
            {
                text: localeObj.sixty_days,
                index: 2,
                action: "sixty_days"
            },

            {
                text: localeObj.ninety_days,
                index: 3,
                action: "ninety_days"
            },
            {
                text: localeObj.date_filter,
                index: 4,
                action: "date_filter"
            },
            {
                text: localeObj.in_contestation,
                index: 5,
                action: "in_contestation"
            },
            {
                text: localeObj.contestation_approved,
                index: 6,
                action: "contestation_approved"
            },
            {
                text: localeObj.contestation_rejected,
                index: 7,
                action: "contestation_rejected"
            },
        ];
        return (
            <div>
                <div>
                    <ButtonAppBar header={this.state.appBar} onBack={this.onBack} action="none" />
                </div>
                {
                    this.state.currentState !== "transactionDetails" &&
                    <div style={{ marginTop: "2rem" }}>

                        <div className="scroll-box__wrapper" style={{ marginLeft: "1.5rem", marginTop: "0.5rem", width: `${screenWidth}px`, textAlign: "left" }}>
                            <div className="scroll-box__wrapper" style={{ width: `${((buttonArray.length * 120) / screenWidth) * 120}%`, flexWrap: "nowrap" }} >
                                <FilterButton
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("thirty_days")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "thirty_days") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "thirty_days") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.thirty_days}
                                </FilterButton>
                                <FilterButton
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("sixty_days")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "sixty_days") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "sixty_days") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.sixty_days}
                                </FilterButton>
                                <FilterButton
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("ninety_days")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "ninety_days") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "ninety_days") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.ninety_days}
                                </FilterButton>
                                <FilterButton
                                    endIcon={<ArrowDropDownIcon style={{ marginTop: "0.03rem" }} fontSize="small" />}
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("date_filter")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "date_filter") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "date_filter") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.date_filter}
                                </FilterButton>


                                <FilterButton
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("in_contestation")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "in_contestation") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "in_contestation") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.in_contestation}
                                </FilterButton>
                                <FilterButton
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("contestation_approved")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "contestation_approved") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "contestation_approved") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.contestation_approved}
                                </FilterButton>
                                <FilterButton
                                    className="smallTextStyleBold"
                                    variant="outlined"
                                    onClick={() => this.filterTransacations("contestation_rejected")}
                                    style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === "contestation_rejected") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === "contestation_rejected") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                    {localeObj.contestation_rejected}
                                </FilterButton>
                            </div>
                        </div>
                    </div>
                }
                <div>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                    {!this.state.progressBar && this.state.currentState !== "transactionDetails" &&
                        <div>
                            <div className="subtitle2 highEmphasis" style={{ marginTop: "1.5rem", marginLeft: "1rem" }}>
                                {localeObj.cc_history}
                            </div>

                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "transactionHistory" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <HistoryDisplayGrid txn={this.state.transactionHistoryData} onSelect={this.onSelectTransaction} />
                            </CSSTransition>

                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "calenderOpen" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <DateRange confirm={this.onGetDateRange} cancel={this.onCancelRange} />
                            </CSSTransition>

                            {this.props.calenderOpen &&
                                <div style={{ display: 'block' }}>
                                    <ButtonAppBar header={localeObj.date_filter} onBack={this.back} action="none" />
                                </div>
                            }

                            <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "Empty" ? true : false} timeout={300} classNames="pageSliderLeft" >
                                <div style={{ display: ((this.state.currentState === "Empty" && !this.state.progressBar) ? 'block' : 'none'), marginLeft: "1rem", overflowY: "auto", textAlign: "center" }}>
                                    {this.state.currentState === "Empty" && <NoInvoiceHistoryComponent msg={localeObj.no_transactions} />}
                                </div>
                            </CSSTransition>
                        </div>
                    }
                    {
                        !this.state.progressBar &&
                        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.currentState === "transactionDetails" ? true : false} timeout={300} classNames="pageSliderLeft" >
                            <TransactionHistoryReceipt transactionData={this.state.transactionDetails} />
                        </CSSTransition>
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

CreditCardHistoryHomePage.propTypes = {
    history: PropTypes.object.isRequired,
    calenderOpen: PropTypes.bool,
};

export default withStyles(styles)(CreditCardHistoryHomePage);