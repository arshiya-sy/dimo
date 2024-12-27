import React from "react";
import moment from 'moment';
import 'moment/locale/pt';
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import { CSSTransition } from 'react-transition-group';
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import CommonButtons from "../../CommonUxComponents/CommonButtons";

import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import localeService from "../../../Services/localeListService";
import arbiApiService from "../../../Services/ArbiApiService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";

import LoadingGrid from "../../TransactionHistory/LoadingGrid";
import DisplayGrid from "../../TransactionHistory/DisplayGrid";
import DateRange from "../../TransactionHistory/DateRangeComponent";
import BottomSheetForKeys from '../PixNewRecieve/BottomSheetForKeys';
import NoTransactionComponent from "../../TransactionHistory/NoTransactions";
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";

import PageNames from "../../../Services/PageNames";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";


import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

const screenHeight = window.screen.height;
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.pixTransactionsDisplayFilters;
const pageName = PageNames.pixMainTransactions;

const FilterButton = CommonButtons.ButtonTypeFilter;
const BottomButton = CommonButtons.ButtonTypeBottom;

var localeObj = {};

class PixTransactionsDisplayComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: (this.props.currentState === "display_transactions") ? ((this.props.isEmpty) ? "Empty" : "All") : this.props.currentState,
            clickVal: 1,
            clickedText: this.props.clickText,
            transactionSent: [],
            transactionReceived: [],
            transactionScheduled: [],
            transactiondateRange: [],
            received: [],
            direction: "",
            rangeSelected: '',
            dateRangeSheet: false,
            filterBottomSheet: false,
            snackBarOpen: false,
            bottomSheet1: false,
            bottomSheet2: false,
            calender: false,
            message: "",
            currentState: (this.props.currentState === "display_transactions") ? ((this.props.isEmpty) ? "Empty" : "All") : ((this.props.currentState === "Schedule") ? (this.props.isScheduledEmpty) ? "Empty" : "Schedule" : this.props.currentState)
        }

        this.onSelect = this.onSelect.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        if (this.props.currentState === "Schedule") {
            this.setState({
                clicked: this.props.currentState
            })
        }
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }

    }

    reportlogs = (type, message) => {
        Log.sDebug(message, "PixTransactionComponent");
    }


    onSelect(selectedTransaction) {
        this.props.getReceiptData(selectedTransaction)
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(pageName["display_transactions"], PageState.back);
        if(this.state.filterBottomSheet !== null && this.state.filterBottomSheet){
            this.props.multipleSelection1(false);
            this.setState({
                filterBottomSheet: false
            })
        } else {
            MetricServices.onPageTransitionStop(pageName["display_transactions"], PageState.close);
            this.props.onBack();
        }
    }

    filterChosen = (filterType) => {
        let i = 0;
        let filterArray = JSON.parse(JSON.stringify(this.props.txnHist));

        for (i in filterArray) {
            for (var j = filterArray[i].transactions.length - 1; j > -1; --j) {
                if (filterArray[i].transactions[j].transaction !== filterType) {
                    filterArray[i].transactions.splice(j, 1);
                }
            }
        }
        let filterCheck = filterArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; });
        if (filterCheck.length === 0) {
            if (filterType === 'D') {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.sent_filter
                });
                this.reportlogs("FilterClick", "No Transactions to show for sent filter");
            } else if (filterType === 'C') {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.receive_filter
                });
                this.reportlogs("FilterClick", "No Transactions to show for received filter");
            }
        } else {
            return (filterArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; }));
        }
    }

    filterTransacations = (filter) => {
        if (this.state.currentState === "loading") {
            return;
        } else if (this.props.isEmpty) {
            this.setState({
                currentState: "Empty",
            });
        }
        this.props.multipleSelection1(false);
        this.setState({
            filterBottomSheet: false,
        })
        if (filter.action === "All") {
            this.props.changetoAll();
            if (this.props.isEmpty) {
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.all_filter
                });
            } else {
                this.props.changetoAll();
                this.setState({
                    currentState: "All",
                    clickedText: localeObj.all_filter
                });
            }
        } else if (filter.action === "Sent") {
            this.props.changetoAll();
            this.reportlogs("FilterClick", "Sent Filter");
            if (this.state.transactionSent.length === 0) {
                this.setState({
                    transactionSent: [...this.state.transactionSent, ...this.filterChosen("D")],
                    currentState: "Sent",
                    clickedText: localeObj.sent_filter
                });
            }
            else {
                this.setState({
                    currentState: "Sent",
                    clickedText: localeObj.sent_filter
                });
            }
        } else if (filter.action === "Received") {
            this.props.changetoAll();
            this.reportlogs("FilterClick", "Receive Filter");
            if (this.state.transactionReceived.length === 0) {
                this.setState({
                    transactionReceived: [...this.state.transactionReceived, ...this.filterChosen("C")],
                    currentState: "Received",
                    clickedText: localeObj.receive_filter
                });
            }
            else {
                this.setState({
                    currentState: "Received",
                    clickedText: localeObj.receive_filter
                });
            }
        } else if (filter.action === "Schedule") {
            this.reportlogs("FilterClick", "Schedule Filter");
            if (this.props.isScheduledEmpty) {
                this.reportlogs("FilterClick", "Schedule Data is already known to be empty.");
                this.setState({
                    currentState: "Empty",
                    clickedText: localeObj.scheduled_filter
                });
            } else if (this.props.scheduledData.length === 0) {
                this.reportlogs("FilterClick", "Call API to fecth schedule data");
                this.props.getScheduled();
            } else {
                this.reportlogs("FilterClick", "Schedule Data is already available hence no API call needed");
                this.setState({
                    currentState: "Schedule",
                    clickedText: localeObj.scheduled_filter
                });
            }
        }
    }

    openFilterSelectBottomSheet = () => {
        if (this.state.currentState === "loading") {
            this.setState({
                snackBarOpen: true,
                message: localeObj.fetching_transaction_history
            })
            return;
        } else {
            this.props.multipleSelection1(true);
            this.setState({
                clickVal: 1,
                filterBottomSheet: true,
                display: "show_filters"
            })
        }
    }

    openDateRangeBottomSheet = () => {
        if (this.state.currentState === "loading") {
            this.setState({
                snackBarOpen: true,
                message: localeObj.fetching_transaction_history
            })
            return;
        } else {
            this.props.multipleSelection2(true);
            this.setState({
                clickVal: 2,
                dateRangeSheet: true,
            })
        }
    }

    onPrimary = () => {
        this.props.multipleSelection2(false);
        this.setState({ dateRangeSheet: false });
        let today = moment().startOf('day'); //Set time to 12 AM today
        let to = moment().endOf('day') //Set 11:59 PM today;
        if (this.state.rangeSelected === "15") {
            //Log.sDebug("Fetch Transaction History for last 15 Days", "DisplayTransactions");
            let from = moment(today).subtract(15, 'days'); //Set to 15 days ago at 12 AM
            this.getDateRangeTransactions(from, to);
        } else if (this.state.rangeSelected === "30") {
            //Log.sDebug("Fetch Transaction History for last 30 Days", "DisplayTransactions");
            let from = moment(today).subtract(30, 'days'); //Set to 30 days ago at 12 AM
            this.getDateRangeTransactions(from, to);
        } else if (this.state.rangeSelected === "60") {
            //Log.sDebug("Fetch Transaction History for last 60 Days", "DisplayTransactions");
            let from = moment(today).subtract(60, 'days'); //Set to 60 days ago at 12 AM
            this.getDateRangeTransactions(from, to);
        } else if (this.state.rangeSelected === "Custom") {
            //Log.sDebug("Fetch for custom Date Range", "DisplayTransactions");
            this.props.multipleSelection2(false);
            this.props.calenderState(true);
            this.setState({
                dateRangeSheet: false,
                currentState: "Date"
            })
        }
    }

    processDateRangeTransactions = (data) => {
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
            this.setState({
                currentState: "Empty",
            })
        } else
            return (TransactionArray.filter(function (entry) { return Object.keys(entry.transactions).length !== 0; }));
    }

    getDateRangeTransactions = (from, to) => {
        this.setState({
            currentState: "loading",
            transactiondateRange: [],
        });
        arbiApiService.getPixTransactionHistory(from.toISOString(), to.toISOString(), PageNameJSON.DateRange).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetPixTransactionHistoryResponse(response.result);
                if (processorResponse.success) {
                    if (processorResponse.txn.length === 0) {
                        this.setState({
                            currentState: "Empty"
                        })
                        return;
                    } else {
                        let txData = [];
                        txData = txData.concat(processorResponse.txn);
                        this.setState({
                            transactiondateRange: [...this.state.transactiondateRange, ...this.processDateRangeTransactions(txData)],
                            currentState: "DateRange"
                        });
                    }
                } else if (processorResponse.message === 1) {
                    this.setState({
                        currentState: "Empty"
                    })
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

    onGetDateRange = (rangeObj) => {
        let fromDate = moment(rangeObj.startDate).startOf('day').subtract(1, "minute");
        let endDate = moment(rangeObj.endDate).endOf('day').add(1, "minute");
        //Log.sDebug("From Date selected " + fromDate.toISOString + " " + "From Date selected " + endDate.toISOString, "DisplayTransactions");
        if (moment(fromDate).isBefore(moment(endDate))) {
            let diff = moment(endDate).diff(moment(fromDate), 'days');
            if (diff > 90) {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.date_difference
                });
            }
            else {
                this.props.calenderState(false);
                this.getDateRangeTransactions(fromDate, endDate);
            }
        } else {
            this.setState({
                snackBarOpen: true,
                message: localeObj.initial_date
            })
        }
    }

    onCancelRange = () => {
        this.props.calenderState(false);
        this.setState({
            currentState: "All",
            clickedText: localeObj.all_filter
        });
    }

    setDateRangeStatus = (action) => {
        this.setState({
            rangeSelected: action
        })
    }

    onSecondary = () => {
        this.props.multipleSelection2(false);
        this.setState({ dateRangeSheet: false })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const pageState = this.state.currentState;
        const txnSent = this.state.transactionSent;
        const txnReceived = this.state.transactionReceived;
        const txnDateRange = this.state.transactiondateRange;
        const { classes } = this.props;
        const rangeStatus = this.state.rangeSelected;

        const ActionArray = [
            {
                type: localeObj.all_transactions_filter,
                key: "",
                action: "All"
            },
            {
                type: localeObj.receive_filter,
                key: "",
                action: "Received"
            },
            {
                type: localeObj.sent_filter,
                key: "",
                action: "Sent"
            },
            {
                type: localeObj.scheduled_filter,
                key: "",
                action: "Schedule"
            }
        ];

        const dateArray = [
            {
                text: localeObj.fifteen_days,
                action: "15"
            },
            {
                text: localeObj.thirty_days,
                action: "30"
            },
            {
                text: localeObj.sixty_days,
                action: "60"
            }
        ];

        return (
            <div className="current-page">
                {pageState !== "Date" &&
                    <div style={InputThemes.initialMarginStyle} >
                        <div style={{textAlign: "left"}} className="subtitle2 highEmphasis" >{localeObj.filters}</div>
                        <div style={{ marginTop: "0.5rem",textAlign: "left" }}>
                            <FilterButton className="smallTextStyleBold" variant="outlined" onClick={this.openFilterSelectBottomSheet}
                                endIcon={<ArrowDropDownIcon style={{ marginTop: "0.03rem" }} fontSize="small" />}
                                style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === 1) ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === 1) ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                {GeneralUtilities.emptyValueCheck(this.state.clickedText) ? localeObj.all_filter : this.state.clickedText}
                            </FilterButton>
                            <FilterButton className="smallTextStyleBold" variant="outlined" onClick={this.openDateRangeBottomSheet}
                                endIcon={<ArrowDropDownIcon style={{ marginTop: "0.03rem" }} fontSize="small" />}
                                style={{ marginRight: "1%", color: ColorPicker.darkHighEmphasis, border: ((this.state.clickVal === 2) ? "solid 1.5px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((this.state.clickVal === 2) ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                {localeObj.date_filter}
                            </FilterButton>
                        </div>
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "All" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{ textAlign: "left", display: (pageState === "All" ? 'block' : 'none'), marginTop: "2rem", marginLeft: "2%", height: `${screenHeight - 282}px`, overflowY: "auto" }}>
                        {pageState === "All" && <DisplayGrid txn={this.props.txnHist} onSelect={this.onSelect} componentName={PageNameJSON["All"]} showPagination={false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "loading" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{textAlign: "left", display: (pageState === "loading" ? 'block' : 'none'), marginTop: "2rem", marginLeft: "2%" }}>
                        {pageState === "loading" && <LoadingGrid />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "Sent" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{ textAlign: "left", display: (pageState === "Sent" ? 'block' : 'none'), marginTop: "2rem", marginLeft: "2%", height: `${screenHeight - 282}px`, overflowY: "auto" }}>
                        {pageState === "Sent" && <DisplayGrid txn={txnSent} onSelect={this.onSelect} componentName={PageNameJSON["sent"]} showPagination={false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "Received" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{textAlign: "left",  display: (pageState === "Received" ? 'block' : 'none'), marginTop: "2rem", marginLeft: "2%", height: `${screenHeight - 282}px`, overflowY: "auto" }}>
                        {pageState === "Received" && <DisplayGrid txn={txnReceived} onSelect={this.onSelect} componentName={PageNameJSON["Received"]} showPagination={false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "DateRange" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{textAlign: "center",  display: (pageState === "DateRange" ? 'block' : 'none'), marginTop: "2rem", marginLeft: "2%", height: `${screenHeight - 282}px`, overflowY: "auto" }}>
                        {pageState === "DateRange" && <DisplayGrid txn={txnDateRange} onSelect={this.onSelect} componentName={PageNameJSON["DateRange"]} showPagination={false} />}
                    </div>
                </CSSTransition>
                {this.props.calenderOpen &&
                    <div style={{textAlign: "left", display: (pageState === "Date" ? 'block' : 'none') }}>
                        {pageState === "Date" && <DateRange confirm={this.onGetDateRange} cancel={this.onCancelRange} componentName={PageNameJSON["Date"]} />}
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "Schedule" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{textAlign: "left",  display: (pageState === "Schedule" ? 'block' : 'none'), marginTop: "2rem", marginLeft: "2%", height: `${screenHeight - 282}px`, overflowY: "auto" }}>
                        {pageState === "Schedule" && <DisplayGrid txn={this.props.scheduledData} onSelect={this.onSelect} componentName={PageNameJSON["Schedule"]} showPagination={false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={pageState === "Empty" ? true : false} timeout={300} classNames="pageSliderLeft" >
                    <div style={{textAlign: "left",  display: (pageState === "Empty" ? 'block' : 'none'), marginTop: "0.5rem" }}>
                        {pageState === "Empty" && <NoTransactionComponent componentName={PageNameJSON["Empty"]} />}
                    </div>
                </CSSTransition>
                {this.props.bottom1 && this.state.filterBottomSheet &&
                    <div style={{textAlign: "left",  display: (pageState === "show_filters" ? 'block' : 'none') }}>
                        <BottomSheetForKeys pixKey={ActionArray} heading={localeObj.see_pix_transactions} onBack={this.onBack} keySelected={this.filterTransacations} evp_key={localeObj.evp_key} />
                    </div>
                }
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.props.bottom2 && this.state.dateRangeSheet}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1rem" }}>
                            <FlexView column>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.filter_by_date}
                                </div>
                                <FlexView align="center" column style={{ marginTop: "0.5rem", alignItems: "center" }} >
                                    {
                                        dateArray.map((opt) => (
                                            <BottomButton
                                                key = {opt.text}
                                                variant="outlined"
                                                onClick={() => this.setDateRangeStatus(opt.action)}
                                                style={{ marginTop: "1rem", border: ((rangeStatus === opt.action) ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((rangeStatus === opt.action) ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                                {opt.text}
                                            </BottomButton>
                                        ))
                                    }
                                </FlexView>
                                <FlexView align="center" column style={{ marginTop: "0.5rem", alignItems: "center" }} >
                                    {
                                        <BottomButton
                                            variant="outlined"
                                            onClick={() => this.setDateRangeStatus("Custom")}
                                            style={{ marginTop: "1rem", border: ((rangeStatus === "Custom") ? "solid 2px transparent" : ColorPicker.darkDisabled + "solid 1px"), background: ((rangeStatus === "Custom") ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none") }}>
                                            {localeObj.date_range_custom}
                                        </BottomButton>
                                    }
                                </FlexView>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1rem",textAlign: "center" }}>
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
            </div>
        )
    }
}

PixTransactionsDisplayComp.propTypes = {
    classes: PropTypes.object.isRequired,
    currentState: PropTypes.string,
    isEmpty: PropTypes.bool,
    isScheduledEmpty: PropTypes.bool,
    clickText: PropTypes.string,
    getReceiptData: PropTypes.func,
    txnHist: PropTypes.arrayOf(PropTypes.object),
    multipleSelection1: PropTypes.func,
    multipleSelection2: PropTypes.func,
    changetoAll: PropTypes.func,
    scheduledData:  PropTypes.arrayOf(PropTypes.object),
    getScheduled: PropTypes.func,
    calenderState: PropTypes.func,
    calenderOpen: PropTypes.bool,
    bottom1: PropTypes.bool,
    bottom2: PropTypes.bool,
    onBack: PropTypes.func,
};

export default withStyles(styles)(PixTransactionsDisplayComp);
