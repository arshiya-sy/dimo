import React from 'react';
import FlexView from "react-flexview";
import moment from "moment";
import PropTypes from 'prop-types';
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';
import { Divider } from "@mui/material";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import PageNames from '../../../Services/PageNames';
import TransactionHistoryDisplayGrid from '../CreditCardComponents/CreditCardInvoiceHistory/TransactionHistoryDisplayGrid';
import InputThemes from '../../../Themes/inputThemes';

var localeObj = {};
const PageNameJSON = PageNames.CreditCardComponents;

export default class InvoiceDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            processing: false,
            leftToPay: false,
            full: "0",
            decimal: "00",
            dateDiffrence: 0,
            displayTax: GeneralUtilities.currencyFromDecimals(this.props.details.taxes)
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_due_date'];
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        const tz = androidApiCalls.getLocale() === "en_US" ? "en" : "pt-br";
        moment.locale(tz);
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        window.onBackPressed = () => {
            this.props.onBack();
        }
        let dateOne = moment(this.props.details.expiryDate);
        let dateThree = moment();
        let DD = dateOne.diff(dateThree, 'days');

        if (!!this.props.amountLeftToPay && !!this.props.invoiceValue) {
            if (this.props.invoiceValue === 0) {
                if (this.props.amountLeftToPay !== this.props.invoiceValue) {
                    this.setState({
                        leftToPay: true,
                        full: "0",
                        decimal: "00",
                        dateDiffrence: DD
                    });
                } else {
                    this.setState({
                        leftToPay: false,
                        full: "0",
                        decimal: "00",
                        dateDiffrence: DD
                    })
                }
            } else {
                let full = this.props.invoiceValue.toString().split(".")[0];
                let decimal = this.props.invoiceValue.toString().split(".")[1];
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
                if (this.props.amountLeftToPay !== this.props.invoiceValue) {
                    this.setState({
                        leftToPay: true,
                        full: full,
                        decimal: decimal,
                        dateDiffrence: DD
                    })
                } else {
                    this.setState({
                        leftToPay: false,
                        full: full,
                        decimal: decimal,
                        dateDiffrence: DD
                    });
                }
            }
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const screenHeight = window.screen.height;

        const getMonth = () => {
            // const date = new Date(this.props.details.expiryDate);
            // const month = date.toLocaleString('default', { month: 'long' });
            // const year = date.getFullYear();
            return moment.utc(this.props.details.expiryDate).format('MMMM YYYY')
        }

        return (
            <div className="scroll" style={{ height: `${screenHeight * 0.77}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? "flex" : "none", flexDirection: "column", background: ColorPicker.newProgressBar }}>
                    <div style={{ textAlign: "center", marginTop: "1.5rem", marginBottom: "0.75rem" }} className="body1 highEmphasis">
                        {this.props.invoiceStatus}
                    </div>
                    <span style={{ textAlign: "center" }}>
                        <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                        <span className="headline2 balanceStyle highEmphasis">{this.state.full}</span>
                        <span className="subScript headline5 highEmphasis">{"," + this.state.decimal}</span>
                    </span>
                    <div style={{ margin: "0.3rem 20%", textAlign: "center" }} className="body1 highEmphasis">
                        <span>{getMonth()}</span>
                    </div>

                    <FlexView column hAlignContent="center" style={{ textAlign: "center", marginTop: "0.5rem", marginBottom: "2rem" }}>
                        {this.props.details.closeDate && <div className="body2 highEmphasis">
                            {localeObj.close_date + moment(this.props.details.closeDate).format('DD/MM/YYYY')}
                        </div>}
                        {(this.props.status === "open" ||
                            this.props.status === "closed" ||
                            this.props.status === "partial") && this.props.details.expiryDate &&
                                <div className="body2 highEmphasis">
                                    {localeObj.expiry_date + moment(this.props.details.expiryDate).format('DD/MM/YYYY')}
                                </div>}
                        {this.props.status === "paid" && this.props.details.payableDate &&
                            <div className="body2 highEmphasis">
                                {localeObj.close_invoice_date + moment(this.props.details.payableDate).format('DD/MM/YYYY')}
                            </div>}
                        <div className="body2 highEmphasis" style={{ marginTop: "0.5rem" }}>
                            {this.state.dateDiffrence > 0 ? this.state.dateDiffrence + localeObj.invoice_details_days_left : ""}
                        </div>
                    </FlexView>
                </div>
                <div style={{ display: !this.state.processing ? "block" : "none" }}>
                    <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", marginTop: "1rem" }}>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.national}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.nationalCharges)}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.inter_national}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.internationalCharges)}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.taxes}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.state.displayTax !== "0,00" ? "-R$ " : "R$ "}{this.state.displayTax}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.prev_invoice_balance}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.pendingBalance)}</span>
                        </div>
                    </FlexView>
                    {this.state.leftToPay &&
                        <FlexView column style={{ margin: "0 2rem" }}>
                            <Divider style={{ borderColor: ColorPicker.lighterAccent, margin: "1rem 0" }} />
                            <div style={{ justifyContent: "space-between" }}>
                                <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.prev_payment}</span>
                                <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.alreadyPaid)}</span>
                            </div>
                            <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.left_to_be_paid}</span>
                                <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.amountLeftToPay)}</span>
                            </div>
                        </FlexView>
                    }
                    {/* <FlexView column style={{ margin: "0 2rem" }}>
                        <Divider style={{ borderColor: ColorPicker.lighterAccent, margin: "1rem 0" }} />
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.minPayment}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.minPayment)}</span>
                        </div>
                    </FlexView> */}
                </div >
                {!GeneralUtilities.isArrayEmpty(this.props.transactionData) &&
                    <div style={{ display: 'block', marginLeft: '1rem' }}>
                        <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginLeft: '1rem', marginBottom: '1.5rem', textAlign: "left" }}>
                            {localeObj.cc_history}
                        </div>
                        <TransactionHistoryDisplayGrid txn={this.props.transactionData} onSelectTransaction={this.props.onSelectTransaction} />
                    </div>}

                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <div className="body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}>
                        {localeObj.get_help_chatbot}
                        <span className="body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.props.goToChatbot}>
                            {localeObj.chatbot_help}
                        </span>
                    </div>
                </div>
            </div >
        )
    }
}

InvoiceDetails.propTypes = {
    componentName: PropTypes.string,
    complete: PropTypes.func,
    details: PropTypes.shape({
        taxes: PropTypes.number,
        expiryDate: PropTypes.string,
        nationalCharges: PropTypes.number,
        internationalCharges: PropTypes.number,
        pendingBalance: PropTypes.number,
        alreadyPaid: PropTypes.number,
        minPayment: PropTypes.number,
        closeDate: PropTypes.object,
        payableDate: PropTypes.object
    }),
    processDueDate: PropTypes.string,
    amountLeftToPay: PropTypes.number,
    invoiceStatus: PropTypes.string,
    transactionData: PropTypes.arrayOf(PropTypes.object),
    onSelectTransaction: PropTypes.func,
    onBack: PropTypes.func,
    goToChatbot: PropTypes.func,
    invoiceValue: PropTypes.number,
    status: PropTypes.string,

};
